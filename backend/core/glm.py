import asyncio
import json

import httpx

from core.config import (
    BACKOFF_BASE,
    GLM_API_KEY,
    GLM_API_URL,
    GLM_MODEL,
    GLM_THINKING,
    GLM_TIMEOUT,
    MAX_GLM_RETRIES,
)


class GLMError(Exception):
    pass


async def glm_agent_chat(
    messages: list[dict],
    system: str | None = None,
    model: str | None = None,
    tools: list[dict] | None = None,
    max_tokens: int = 700,
    temperature: float = 0.7,
    max_steps: int = 4,
) -> tuple[str, list[dict]]:
    """Run a multi-step tool-calling loop against GLM (OpenAI-compatible tools).

    Returns (final_text, list_of_tool_calls). Each tool call is
    {"name": str, "arguments": dict}.
    """
    headers = {
        "Authorization": f"Bearer {GLM_API_KEY}",
        "Content-Type": "application/json",
    }
    full_messages = []
    if system:
        full_messages.append({"role": "system", "content": system})
    full_messages.extend(messages)

    tool_calls: list[dict] = []
    for _step in range(max_steps):
        payload: dict = {
            "model": model or GLM_MODEL,
            "messages": full_messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }
        if tools:
            payload["tools"] = tools
        if GLM_THINKING == "disabled":
            payload["thinking"] = {"type": "disabled"}

        last_exc: Exception | None = None
        for attempt in range(MAX_GLM_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=GLM_TIMEOUT) as client:
                    response = await client.post(GLM_API_URL, headers=headers, json=payload)
                if response.status_code == 429:
                    await asyncio.sleep(BACKOFF_BASE * (2**attempt))
                    continue
                response.raise_for_status()
                data = response.json()
                message = data["choices"][0]["message"]
                content = message.get("content") or message.get("reasoning_content") or ""
                calls = message.get("tool_calls") or []
                if calls:
                    parsed = []
                    for call in calls:
                        try:
                            fn = call.get("function", {})
                            parsed.append(
                                {
                                    "name": fn.get("name", ""),
                                    "arguments": json.loads(fn.get("arguments") or "{}"),
                                }
                            )
                        except json.JSONDecodeError:
                            continue
                    full_messages.append({"role": "assistant", "content": content, "tool_calls": calls})
                    for pc in parsed:
                        tool_calls.append(pc)
                    # We stop after collecting the first round of tool calls; the
                    # caller (target) feeds back results.
                    return content, tool_calls
                return content, tool_calls
            except (httpx.HTTPStatusError, httpx.TimeoutException, httpx.ConnectError) as exc:
                last_exc = exc
                await asyncio.sleep(BACKOFF_BASE * (2**attempt))

        raise GLMError(f"GLM API failed after {MAX_GLM_RETRIES} attempts: {last_exc}")

    return "(max steps reached)", tool_calls


async def glm_chat(
    prompt: str,
    system: str | None = None,
    model: str | None = None,
    max_tokens: int = 500,
    temperature: float = 0.8,
) -> str:
    """Call the GLM chat completions API with retry/backoff on 429 and 5xx."""
    headers = {
        "Authorization": f"Bearer {GLM_API_KEY}",
        "Content-Type": "application/json",
    }
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": model or GLM_MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": temperature,
    }
    if GLM_THINKING == "disabled":
        payload["thinking"] = {"type": "disabled"}

    last_exc: Exception | None = None
    for attempt in range(MAX_GLM_RETRIES):
        try:
            async with httpx.AsyncClient(timeout=GLM_TIMEOUT) as client:
                response = await client.post(GLM_API_URL, headers=headers, json=payload)
            if response.status_code == 429:
                await asyncio.sleep(BACKOFF_BASE * (2**attempt))
                continue
            response.raise_for_status()
            data = response.json()
            message = data["choices"][0]["message"]
            content = message.get("content") or ""
            if not content:
                content = message.get("reasoning_content") or ""
            return content
        except (httpx.HTTPStatusError, httpx.TimeoutException, httpx.ConnectError) as exc:
            last_exc = exc
            await asyncio.sleep(BACKOFF_BASE * (2**attempt))

    raise GLMError(f"GLM API failed after {MAX_GLM_RETRIES} attempts: {last_exc}")
