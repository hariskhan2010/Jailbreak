from core.config import GLM_MODEL
from core.glm import glm_chat
from targets.base import BaseTarget


class LlmTarget(BaseTarget):
    """Generic chat-completions LLM target backed by GLM."""

    def __init__(self, model: str | None = None, system_prompt: str | None = None):
        self._model_name = model or GLM_MODEL
        self._system_prompt = system_prompt

    @property
    def name(self) -> str:
        return "glm"

    @property
    def model(self) -> str:
        return self._model_name

    async def attack(self, prompt: str) -> str:
        return await glm_chat(
            prompt,
            system=self._system_prompt,
            model=self._model_name,
            max_tokens=700,
            temperature=0.9,
        )
