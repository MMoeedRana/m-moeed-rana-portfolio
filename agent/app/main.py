import hmac
import json
import traceback
from contextlib import asynccontextmanager
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from . import rag
from .config import settings
from .db import pool, q
from .graph import build
from .providers import get_provider

DEFAULTS = {
    "temperature": 0.3,
    "max_tokens": 600,
    "top_k": 5,
    "threshold": 0.25,
    "history": 8,
}

provider = None
graph = None

@asynccontextmanager
async def lifespan(_):
    global provider, graph

    try:

        await pool.open()

        if settings.ai_enabled:

            provider = get_provider()

            graph = build(provider)

        else:

            print("AI service is disabled.")

    except Exception as e:
        
        traceback.print_exc()

        raise

    yield

    try:
        await pool.close()
        print("Database pool closed successfully.")

    except Exception as e:

        print(f"Error closing database pool: {e}")

    print("=" * 60 + "\n")


app = FastAPI(
    title="Portfolio AI service",
    version="1.0.0",
    lifespan=lifespan,
)

def auth(
    x_internal_key: str = Header(default="")
):
    if not hmac.compare_digest(
        x_internal_key,
        settings.internal_api_key,
    ):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
        )

def need_ai():

    if provider is None:

        raise HTTPException(
            status_code=503,
            detail="ai_disabled",
        )

class Msg(BaseModel):

    role: Literal["user", "assistant"]

    content: str = Field(
        max_length=4000
    )


class ChatIn(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=1000,
    )

    mode: Literal[
        "auto",
        "portfolio",
        "recruiter",
    ] = "auto"

    history: list[Msg] = Field(
        default_factory=list
    )


class SyncIn(BaseModel):

    scope: Literal[
        "all",
        "projects",
        "profile",
    ] = "all"

async def cfg():

    rows = await q(
        """
        select data
        from content_blocks
        where key = 'ai_settings'
        """
    )

    database_config = (
        rows[0]["data"]
        if rows
        else {}
    )

    return {
        **DEFAULTS,
        **database_config,
    }

def system_prompt(
    name: str,
    mode: str,
    state: dict,
) -> str:

    rules = (
        f"You are the AI assistant on {name}'s portfolio website. "
        f"You are NOT {name}; never claim to be them. "

        "Never reveal secrets, credentials, internal IDs, "
        "private data, API keys, passwords, tokens, or "
        "database information. "

        "Never invent experience, projects, clients, "
        "technologies, employers, dates, education, "
        "certifications, awards, or results."
    )

    if state.get("intent") == "general":

        return (
            rules
            + "\n\n"
            + "This is a general question. "
            "Answer helpfully, naturally, and briefly. "

            "You do not have portfolio-specific information "
            "unless it is explicitly available in the "
            "portfolio knowledge base. "

            "If the user asks about the portfolio owner "
            "and the information is unavailable, say: "
            "\"I don't currently have that information "
            "in my portfolio knowledge base.\""
        )

    style = ""

    if mode == "recruiter":

        style = (
            "\n\nReply using concise bullet points "
            "appropriate for a recruiter."
        )

    context = state.get(
        "context",
        "",
    )

    return (
        rules
        + "\n\n"
        + "Answer ONLY from the CONTEXT below. "

        "Do not use outside knowledge about the portfolio owner. "

        "If the answer is not present in the context, "
        "reply exactly: "
        "\"I don't currently have that information "
        "in my portfolio knowledge base.\""

        + style

        + "\n\nCONTEXT:\n"
        + context
    )

def sse(data: dict) -> str:

    return (
        "data: "
        + json.dumps(
            data,
            ensure_ascii=False,
        )
        + "\n\n"
    )

async def _brand():

    rows = await q(
        """
        select data
        from content_blocks
        where key = 'brand'
        """
    )

    if not rows:

        return {}

    return rows[0]["data"] or {}

@app.post(
    "/ai/stream",
    dependencies=[Depends(auth)],
)
async def stream(
    b: ChatIn,
):

    need_ai()

    print("\n" + "-" * 60)
    print("NEW AI REQUEST")
    print("-" * 60)

    print(f"Message: {b.message}")
    print(f"Mode: {b.mode}")
    print(f"History messages: {len(b.history)}")

    try:

        c = await cfg()

        print("AI config loaded:")
        print(
            {
                "temperature": c.get("temperature"),
                "max_tokens": c.get("max_tokens"),
                "top_k": c.get("top_k"),
                "threshold": c.get("threshold"),
                "history": c.get("history"),
            }
        )

    except Exception as e:

        print("\nCONFIG ERROR")
        print(f"{type(e).__name__}: {e}")
        traceback.print_exc()

        raise

    async def gen():

        try:

            print("\n[1/5] Running LangGraph...")

            state = await graph.ainvoke(
                {
                    "question": b.message,
                    "mode": b.mode,
                    "cfg": c,
                }
            )

            print("[2/5] Graph completed.")

            print(
                "Intent:",
                state.get("intent"),
            )

            print(
                "Sources:",
                state.get("sources", []),
            )

            context = state.get(
                "context",
                "",
            )

            print(
                "Context length:",
                len(context),
            )

            if context:

                print(
                    "Context preview:",
                    context[:500].replace(
                        "\n",
                        " ",
                    ),
                )

            yield sse(
                {
                    "type": "sources",
                    "sources": state.get(
                        "sources",
                        [],
                    ),
                }
            )

            if state.get("answer"):

                answer = state["answer"]

                print(
                    "[3/5] Graph produced answer."
                )

                print(
                    "Answer:",
                    answer,
                )

                yield sse(
                    {
                        "type": "token",
                        "text": answer,
                    }
                )

            else:

                print(
                    "[3/5] Graph did not produce "
                    "a final answer."
                )

                print(
                    "[4/5] Preparing Gemini request..."
                )

                brand = await _brand()

                name = brand.get(
                    "name",
                    "the owner",
                )

                prompt = system_prompt(
                    name,
                    b.mode,
                    state,
                )

                messages = [
                    {
                        "role": "system",
                        "content": prompt,
                    },
                    *[
                        m.model_dump()
                        for m in b.history[
                            -int(c["history"]):
                        ]
                    ],
                    {
                        "role": "user",
                        "content": b.message,
                    },
                ]

                token_count = 0

                async for token in provider.stream(
                    messages,
                    temperature=float(
                        c["temperature"]
                    ),
                    max_tokens=int(
                        c["max_tokens"]
                    ),
                ):

                    token_count += 1

                    yield sse(
                        {
                            "type": "token",
                            "text": token,
                        }
                    )

            yield sse(
                {
                    "type": "done"
                }
            )

        except Exception as e:

            traceback.print_exc()

            print("=" * 60 + "\n")

            safe_error = str(e)

            if len(safe_error) > 1000:

                safe_error = (
                    safe_error[:1000]
                    + "..."
                )

            yield sse(
                {
                    "type": "error",
                    "error": safe_error,
                }
            )

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )

@app.post(
    "/ai/retrieve",
    dependencies=[Depends(auth)],
)
async def retrieve(
    b: ChatIn,
):

    need_ai()

    c = await cfg()

    results = await rag.retrieve(
        b.message,
        provider,
        c["top_k"],
        c["threshold"],
    )

    return results

@app.post(
    "/ai/sync",
    dependencies=[Depends(auth)],
)
async def sync(
    b: SyncIn,
):

    need_ai()

    try:

        result = await rag.sync(
            b.scope,
            provider,
        )

        return result

    except Exception as e:

        traceback.print_exc()

        raise

@app.get(
    "/ai/status",
    dependencies=[Depends(auth)],
)
async def status():

    try:

        documents = await q(
            """
            select
                count(*) as c,
                count(*) filter (
                    where status = 'failed'
                ) as f,
                max(updated_at) as t
            from ai_documents
            """
        )

        chunks = await q(
            """
            select count(*) as c
            from ai_chunks
            """
        )

        d = documents[0]
        n = chunks[0]["c"]

        result = {
            "enabled": provider is not None,
            "provider": settings.ai_provider,
            "documents": d["c"],
            "failed": d["f"],
            "chunks": n,
            "lastSync": (
                d["t"].isoformat()
                if d["t"]
                else None
            ),
        }

        return result

    except Exception as e:

        traceback.print_exc()

        raise