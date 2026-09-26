from abc import ABC, abstractmethod
from typing import AsyncIterator

from google import genai
from google.genai import types
from langchain_google_genai import ChatGoogleGenerativeAI

from .config import settings


class AIProvider(ABC):
    """Provider abstraction for chat generation, streaming, and embeddings."""

    @abstractmethod
    async def generate(
        self,
        messages: list[dict],
        *,
        temperature: float,
        max_tokens: int,
    ) -> str:
        ...

    @abstractmethod
    def stream(
        self,
        messages: list[dict],
        *,
        temperature: float,
        max_tokens: int,
    ) -> AsyncIterator[str]:
        ...

    @abstractmethod
    async def embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        ...

    async def classify_intent(
        self,
        question: str,
        intents: list[str],
    ) -> str:

        out = await self.generate(
            [
                {
                    "role": "system",
                    "content": (
                        "Classify the user message as exactly one of: "
                        f"{', '.join(intents)}. "
                        "Reply with the label only."
                    ),
                },
                {
                    "role": "user",
                    "content": question,
                },
            ],
            temperature=0,
            max_tokens=8,
        )

        out = out.strip().lower()

        return out if out in intents else "unknown"


class GeminiProvider(AIProvider):

    def __init__(self):

        self._chat = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.3,
        )

        self._embedding_client = genai.Client(
            api_key=settings.gemini_api_key,
        )

    async def generate(
        self,
        messages,
        *,
        temperature,
        max_tokens,
    ) -> str:

        response = await self._chat.bind(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ).ainvoke(messages)

        content = response.content

        if isinstance(content, str):
            return content

        if isinstance(content, list):

            parts = []

            for item in content:

                if isinstance(item, str):
                    parts.append(item)

                elif isinstance(item, dict):

                    text = item.get("text")

                    if text:
                        parts.append(text)

            return "".join(parts)

        return str(content)

    async def stream(
        self,
        messages,
        *,
        temperature,
        max_tokens,
    ) -> AsyncIterator[str]:

        async for chunk in self._chat.bind(
            temperature=temperature,
            max_output_tokens=max_tokens,
        ).astream(messages):

            content = chunk.content

            if isinstance(content, str):

                if content:
                    yield content

            elif isinstance(content, list):

                for item in content:

                    if isinstance(item, str):
                        yield item

                    elif isinstance(item, dict):

                        text = item.get("text")

                        if text:
                            yield text

    async def embed(
        self,
        texts: list[str],
    ) -> list[list[float]]:

        if not texts:
            return []

        embeddings = []

        for text in texts:

            result = await self._embedding_client.aio.models.embed_content(
                model=settings.gemini_embedding_model,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=settings.gemini_embedding_dimensions,
                ),
            )

            if not result.embeddings:
                raise RuntimeError(
                    "Gemini returned no embedding."
                )

            values = result.embeddings[0].values

            if not values:
                raise RuntimeError(
                    "Gemini returned an empty embedding."
                )

            embeddings.append(list(values))

        return embeddings


REGISTRY: dict[str, type[AIProvider]] = {
    "gemini": GeminiProvider,
}


def get_provider() -> AIProvider:

    provider_class = REGISTRY.get(
        settings.ai_provider
    )

    if provider_class is None:
        raise ValueError(
            f"Unsupported AI provider: {settings.ai_provider}"
        )

    return provider_class()