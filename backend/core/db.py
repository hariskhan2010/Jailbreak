"""Phase 2: Supabase-backed persistence for runs and attacks.

All helpers are async so the runner and API can `await` them directly.
`log_attack` swallows Supabase errors (a DB hiccup must not kill the run);
status updates and reads raise so failures surface to the caller.
"""

import logging
import os
from datetime import UTC, datetime

from dotenv import load_dotenv
from supabase import AsyncClient, create_async_client

load_dotenv()

logger = logging.getLogger(__name__)

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

_client: AsyncClient | None = None


async def _get_client() -> AsyncClient:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set in backend/.env"
            )
        _client = await create_async_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def _now() -> str:
    return datetime.now(UTC).isoformat()


async def create_run(run_id: str, meta: dict) -> None:
    client = await _get_client()
    row = {"id": run_id, **meta}
    row.pop("created_at", None)
    row.pop("completed_at", None)
    await client.table("runs").insert(row).execute()


async def get_run(run_id: str) -> dict | None:
    client = await _get_client()
    result = await client.table("runs").select("*").eq("id", run_id).limit(1).execute()
    if not result.data:
        return None
    run = result.data[0]
    return {
        "id": run["id"],
        "target_name": run.get("target_name"),
        "target_model": run.get("target_model"),
        "categories": run.get("categories") or [],
        "topics": run.get("topics") or [],
        "status": run.get("status"),
        "total_attacks": run.get("total_attacks", 0),
        "successful_attacks": run.get("successful_attacks", 0),
        "created_at": run.get("created_at"),
        "completed_at": run.get("completed_at"),
    }


async def update_run_status(run_id: str, status: str, **fields) -> None:
    client = await _get_client()
    data = {"status": status, **fields}
    if status in ("completed", "failed"):
        data["completed_at"] = _now()
    await client.table("runs").update(data).eq("id", run_id).execute()


async def log_attack(result: dict) -> None:
    client = await _get_client()
    row = {
        "run_id": result["run_id"],
        "category": result.get("category", ""),
        "topic": result.get("topic", ""),
        "prompt": result.get("prompt", ""),
        "response": result.get("response", ""),
        "success": bool(result.get("success", False)),
        "severity": result.get("severity", "LOW"),
        "confidence": float(result.get("confidence", 0.0)),
        "reason": result.get("reason", ""),
        "iteration": int(result.get("iteration", 0)),
    }
    try:
        await client.table("attacks").insert(row).execute()
    except Exception as exc:
        logger.warning("log_attack: failed to insert attack for run %s: %s", result.get("run_id"), exc)
        return

    try:
        run = await get_run(result["run_id"])
        if run:
            await client.table("runs").update(
                {
                    "total_attacks": int(run.get("total_attacks") or 0) + 1,
                    "successful_attacks": int(run.get("successful_attacks") or 0)
                    + (1 if row["success"] else 0),
                }
            ).eq("id", run["id"]).execute()
    except Exception as exc:
        logger.warning("log_attack: failed to update counters for run %s: %s", result.get("run_id"), exc)


async def get_run_results(run_id: str, offset: int = 0) -> list[dict]:
    client = await _get_client()
    result = (
        await client.table("attacks")
        .select("*")
        .eq("run_id", run_id)
        .order("created_at")
        .order("id")
        .execute()
    )
    return result.data[offset:]


async def list_runs() -> list[dict]:
    client = await _get_client()
    result = await client.table("runs").select("*").order("created_at", desc=True).execute()
    runs = [
        {
            "id": r["id"],
            "target_name": r.get("target_name"),
            "target_model": r.get("target_model"),
            "status": r.get("status"),
            "total_attacks": r.get("total_attacks", 0),
            "successful_attacks": r.get("successful_attacks", 0),
            "created_at": r.get("created_at"),
            "completed_at": r.get("completed_at"),
        }
        for r in result.data
    ]
    return runs
