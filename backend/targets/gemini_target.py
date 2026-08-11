import asyncio

import google.generativeai as genai

from core.config import GEMINI_API_KEY, GEMINI_MODEL
from targets.base import BaseTarget


class GeminiTarget(BaseTarget):
    def __init__(self, model: str | None = None):
        self._model_name = model or GEMINI_MODEL
        genai.configure(api_key=GEMINI_API_KEY)
        self._model = genai.GenerativeModel(self._model_name)

    @property
    def name(self) -> str:
        return "gemini"

    @property
    def model(self) -> str:
        return self._model_name

    async def attack(self, prompt: str) -> str:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self._generate, prompt)

    def _generate(self, prompt: str) -> str:
        response = self._model.generate_content(prompt)
        return response.text or ""
