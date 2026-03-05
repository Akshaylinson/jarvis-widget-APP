import logging
import google.generativeai as genai
from app.config import settings

logger = logging.getLogger(__name__)


class GeminiService:
    def __init__(self):
        self._configured = False

    def _ensure_configured(self):
        if not self._configured:
            if not settings.gemini_api_key:
                raise ValueError("GEMINI_API_KEY is not set")
            genai.configure(api_key=settings.gemini_api_key)
            self._configured = True

    async def chat(self, system_prompt: str, user_message: str) -> str:
        """Send a message to Gemini and return the response text."""
        self._ensure_configured()

        model = genai.GenerativeModel(
            model_name=settings.gemini_model,
            system_instruction=system_prompt,
            generation_config=genai.GenerationConfig(
                temperature=0.7,
                max_output_tokens=512,
            ),
        )

        # Run in thread pool since SDK is sync
        import asyncio
        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: model.generate_content(user_message),
        )

        if not response.text:
            raise ValueError("Empty response from Gemini")

        return response.text.strip()


gemini_service = GeminiService()
