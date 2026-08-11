# Phase 1: Foundation — Backend Core

## Objective
Build the Python/FastAPI backend: attack config, GLM attacker/judge/mutator agents,
Gemini target connector, async runner, and core API endpoints.

## Tasks

1. `backend/requirements.txt` — fastapi, uvicorn, google-generativeai, httpx, supabase, python-dotenv
2. `backend/.env` — GEMINI_API_KEY, GLM_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
3. `backend/core/config.py` — ATTACK_CATEGORIES (7 categories + templates), HARMFUL_TOPICS,
   GLM_MODEL, GEMINI_MODEL, rate-limit constants
4. `backend/targets/base.py` — abstract `BaseTarget` (`attack(prompt)`, `name`)
5. `backend/targets/gemini_target.py` — `GeminiTarget` using google-generativeai
6. `backend/agents/attacker.py` — `generate_attack(category, topic, failures, iteration)` via GLM
7. `backend/agents/mutator.py` — `mutate_prompt(original, failure_reason)` via GLM
8. `backend/agents/judge.py` — `judge_response(prompt, response, topic) -> dict` via GLM (strict JSON)
9. `backend/core/runner.py` — async `run_attack_loop()` with generate→attack→judge→mutate cycle
10. `backend/main.py` — FastAPI app, `/api/runs`, `/api/runs/{id}/stream` (SSE), `/api/runs/{id}/report`, `/api/runs`

## Verification

- ☐ `python -m compileall backend` — no syntax errors
- ☐ Start a run against Gemini target via `/api/runs` and see logs in Supabase
- ☐ Manual test: curl `/api/runs` returns the created run
