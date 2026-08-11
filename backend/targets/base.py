from abc import ABC, abstractmethod


class BaseTarget(ABC):
    @abstractmethod
    async def attack(self, prompt: str) -> str:
        """Send a prompt to the target model and return its response."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable target name, e.g. 'gemini'."""

    @property
    @abstractmethod
    def model(self) -> str:
        """Target model identifier, e.g. 'gemini-2.0-flash'."""

    @property
    def kind(self) -> str:
        """'llm' for chat models, 'web' for HTTP form targets."""
        return "llm"
