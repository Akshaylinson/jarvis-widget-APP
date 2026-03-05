import logging
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class OpenRouterService:
    async def chat(self, system_prompt: str, user_message: str) -> str:
        """Call OpenRouter API (OpenAI-compatible) as LLM fallback."""
        if not settings.openrouter_api_key:
            raise ValueError("OPENROUTER_API_KEY is not set")

        headers = {
            "Authorization": f"Bearer {settings.openrouter_api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://jarvis-assistant.ai",
            "X-Title": "JARVIS AI Assistant",
        }

        payload = {
            "model": settings.openrouter_model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            "max_tokens": 512,
            "temperature": 0.7,
        }

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{OPENROUTER_BASE_URL}/chat/completions",
                json=payload,
                headers=headers,
            )
            response.raise_for_status()
            data = response.json()

        text = data["choices"][0]["message"]["content"].strip()
        if not text:
            raise ValueError("Empty response from OpenRouter")
        return text


openrouter_service = OpenRouterService()
