import asyncio
import json
import os
import uuid

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from core.config import (
    AGENTIC_CATEGORIES,
    AGENTIC_TOPICS,
    ATTACK_CATEGORIES,
    GEMINI_MODEL,
    GLM_MODEL,
    HARMFUL_TOPICS,
)
from core.db import (
    create_run as db_create_run,
)
from core.db import (
    get_run,
    get_run_results,
    list_runs,
    update_run_status,
)
from core.runner import run_attack_loop
from report.generator import generate_report
from targets.agentic_target import AgenticTarget
from targets.gemini_target import GeminiTarget
from targets.llm_target import LlmTarget
from targets.weak_agentic_target import WeakAgenticTarget
from targets.web_target import WebLoginTarget


class RunConfig(BaseModel):
    target_type: str = Field(default="gemini", pattern="^(gemini|glm|agentic|weak-agentic|web)$")
    target_model: str = GEMINI_MODEL
    login_url: str | None = None
    system_prompt: str | None = None
    categories: list[str] = Field(default_factory=lambda: list(ATTACK_CATEGORIES.keys()))
    topics: list[str] = Field(default_factory=lambda: list(HARMFUL_TOPICS))
    max_iterations: int = Field(default=100, ge=1, le=1000)


app = FastAPI(title="Jailbreak Discovery Agent", version="0.1.0")

_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "*").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials="*" not in _ALLOWED_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_target(target_type: str, target_model: str, login_url: str | None = None, system_prompt: str | None = None):
    if target_type == "gemini":
        return GeminiTarget(target_model)
    if target_type == "glm":
        return LlmTarget(target_model, system_prompt)
    if target_type == "agentic":
        return AgenticTarget(target_model)
    if target_type == "weak-agentic":
        return WeakAgenticTarget(target_model)
    if target_type == "web":
        if not login_url:
            raise HTTPException(status_code=400, detail="login_url required for web target")
        return WebLoginTarget(login_url)
    raise ValueError(f"Unknown target_type: {target_type}")


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api/categories")
async def categories():
    return ATTACK_CATEGORIES


@app.get("/api/config")
async def config():
    return {
        "categories": ATTACK_CATEGORIES,
        "agentic_categories": AGENTIC_CATEGORIES,
        "topics": HARMFUL_TOPICS,
        "agentic_topics": AGENTIC_TOPICS,
        "models": {
            "gemini": GEMINI_MODEL,
            "glm": GLM_MODEL,
        },
    }


@app.post("/api/runs")
async def create_run(config: RunConfig):
    run_id = str(uuid.uuid4())
    allowed = dict(ATTACK_CATEGORIES)
    if config.target_type in ("agentic", "weak-agentic"):
        allowed.update(AGENTIC_CATEGORIES)
    for category in config.categories:
        if category not in allowed:
            raise HTTPException(status_code=400, detail=f"Unknown category: {category}")

    target = get_target(config.target_type, config.target_model, config.login_url, config.system_prompt)

    await db_create_run(
        run_id,
        {
            "target_name": target.name,
            "target_model": target.model,
            "categories": config.categories,
            "topics": config.topics,
            "status": "running",
            "total_attacks": 0,
            "successful_attacks": 0,
        },
    )

    asyncio.create_task(
        run_attack_loop(
            run_id,
            target,
            config.categories,
            config.topics,
            config.max_iterations,
        )
    )
    return {"run_id": run_id, "status": "started"}


@app.get("/api/runs")
async def runs():
    return await list_runs()


@app.get("/api/runs/{run_id}")
async def run_detail(run_id: str):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run


@app.get("/api/runs/{run_id}/stream")
async def stream_run(run_id: str):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    async def event_generator():
        offset = 0
        while True:
            results = await get_run_results(run_id, offset=offset)
            for result in results:
                offset += 1
                yield f"data: {json.dumps(result, default=str)}\n\n"
            current = await get_run(run_id)
            if current and current["status"] in ("completed", "failed"):
                trailing = await get_run_results(run_id, offset=offset)
                for result in trailing:
                    offset += 1
                    yield f"data: {json.dumps(result, default=str)}\n\n"
                yield 'data: {"type": "done"}\n\n'
                break
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@app.get("/api/runs/{run_id}/attacks")
async def run_attacks(run_id: str):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return await get_run_results(run_id)


@app.get("/api/runs/{run_id}/report")
async def report(run_id: str):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    results = await get_run_results(run_id)
    return {"run_id": run_id, "report": generate_report(results)}


@app.post("/api/runs/{run_id}/stop")
async def stop_run(run_id: str):
    run = await get_run(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    await update_run_status(run_id, "failed")
    return {"run_id": run_id, "status": "stopped"}
