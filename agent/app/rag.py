import hashlib, json
from langchain_text_splitters import RecursiveCharacterTextSplitter
from psycopg.types.json import Jsonb
from .db import q

splitter = RecursiveCharacterTextSplitter(chunk_size=900, chunk_overlap=120)
LABELS = {
    "project": "Projects",
    "profile": "Profile",
    "about": "About",
    "services": "Services",
}
vec = lambda v: "[" + ",".join(map(str, v)) + "]"


async def build_documents(scope: str) -> list[dict]:
    from . import tools 

    docs = []
    if scope in ("all", "profile"):
        parts = [
            (await tools.get_profile())[0],
            (await tools.get_contact_info())[0],
            (await tools.get_social_links())[0],
        ]
        docs.append(
            {
                "type": "profile",
                "key": "profile",
                "title": "Profile & contact",
                "text": "\n\n".join(p for p in parts if p),
            }
        )
        b = {
            r["key"]: r["data"]
            for r in await q(
                "select key,data from content_blocks where key in ('about','services')"
            )
        }
        if a := b.get("about"):
            t = [
                *a["paragraphs"],
                *(
                    f"{i['when']}: {i['title']} — {i['text']}"
                    for i in a["path"]["items"]
                ),
                "Skills: " + ", ".join(a["path"]["skills"]),
                *(f"{c['title']} ({c['meta']})" for c in a["credentials"]["items"]),
            ]
            docs.append(
                {
                    "type": "about",
                    "key": "about",
                    "title": "About & experience",
                    "text": "\n".join(t),
                }
            )
        if sv := b.get("services"):
            t = [
                *(
                    f"Service: {p['title']} — {p['blurb']} Includes: {'; '.join(p['includes'])}. Example: {p['example']}"
                    for p in sv["plans"]
                ),
                *(f"{m['title']}: {m['text']}" for m in sv["models"]),
                "Add-ons: " + ", ".join(sv["addons"]),
            ]
            docs.append(
                {
                    "type": "services",
                    "key": "services",
                    "title": "Services",
                    "text": "\n".join(t),
                }
            )
    if scope in ("all", "projects"):
        for p in await q(
            "select slug,title,summary,body,category,meta from projects where status='published' and deleted_at is null"
        ):
            docs.append(
                {
                    "type": "project",
                    "key": p["slug"],
                    "title": p["title"],
                    "text": f"Project: {p['title']}\nCategory: {p['category']}\nSummary: {p['summary']}\n{p['body']}\nDetails: {json.dumps(p['meta'])}",
                }
            )
    return docs


async def sync(scope: str, provider) -> dict:
    docs, ok, failed = await build_documents(scope), 0, 0
    for d in docs:
        h = hashlib.sha256(d["text"].encode()).hexdigest()
        cur = await q(
            "select hash,status from ai_documents where source_type=%s and source_key=%s",
            (d["type"], d["key"]),
        )
        if cur and cur[0]["hash"] == h and cur[0]["status"] == "indexed":
            ok += 1
            continue
        try:
            chunks = splitter.split_text(d["text"])
            vecs = await provider.embed(chunks)
            row = await q(
                """insert into ai_documents (source_type,source_key,title,content,hash,status) values (%s,%s,%s,%s,%s,'indexed')
                on conflict (source_type,source_key) do update set title=excluded.title,content=excluded.content,hash=excluded.hash,status='indexed',error=null,updated_at=now() returning id""",
                (d["type"], d["key"], d["title"], d["text"], h),
            )
            await q("delete from ai_chunks where document_id=%s", (row[0]["id"],))
            for c, v in zip(chunks, vecs):
                await q(
                    "insert into ai_chunks (document_id,content,embedding,metadata) values (%s,%s,%s::vector,%s)",
                    (
                        row[0]["id"],
                        c,
                        vec(v),
                        Jsonb(
                            {
                                "source_type": d["type"],
                                "title": d["title"],
                                "slug": d["key"],
                            }
                        ),
                    ),
                )
            ok += 1
        except Exception as e:
            failed += 1
            await q(
                """insert into ai_documents (source_type,source_key,title,content,hash,status,error) values (%s,%s,%s,%s,%s,'failed',%s)
                on conflict (source_type,source_key) do update set status='failed',error=excluded.error,updated_at=now()""",
                (d["type"], d["key"], d["title"], d["text"], h, str(e)[:300]),
            )
    for t in {
        "all": ["project", "profile", "about", "services"],
        "projects": ["project"],
        "profile": ["profile", "about", "services"],
    }[
        scope
    ]:
        keys = [d["key"] for d in docs if d["type"] == t]
        await q(
            "delete from ai_documents where source_type=%s and not (source_key = any(%s))",
            (t, keys),
        )
    return {"indexed": ok, "failed": failed}


async def retrieve(query: str, provider, k: int, threshold: float) -> list[dict]:
    v = vec((await provider.embed([query]))[0])
    rows = await q(
        """select c.content, d.source_type, d.title, 1-(c.embedding <=> %s::vector) as score from ai_chunks c
        join ai_documents d on d.id=c.document_id order by c.embedding <=> %s::vector limit %s""",
        (v, v, k),
    )
    return [r for r in rows if r["score"] >= threshold]
