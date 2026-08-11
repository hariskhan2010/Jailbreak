# API Requirements

## 1. Our Backend Endpoints (FastAPI)

Base URL: `http://localhost:8000` (dev) / Render URL (prod)

### POST `/api/runs`
Create a new run and start the attack loop in the background.

Request body (RunConfig):
```json
{
  "target_type": "gemini",
  "target_model": "gemini-2.0-flash",
  "categories": ["ROLEPLAY_BYPASS", "PROMPT_INJECTION"],
  "topics": ["how to bypass computer security systems"],
  "max_iterations": 100
}
```
Response: `{ "run_id": "uuid", "status": "started" }`

### GET `/api/runs`
List all runs (dashboard + runs list).
Response: array of run summaries: id, target_name, target_model, status,
total_attacks, successful_attacks, created_at, completed_at.

### GET `/api/runs/{run_id}/stream`
Server-Sent Events (SSE). Streams attack results as they happen.

```
data: {"run_id":"...","category":"...","topic":"...","prompt":"...","response":"...","success":true,"severity":"HIGH","confidence":0.9,"reason":"...","iteration":0}

data: {"type":"done"}
```

### GET `/api/runs/{run_id}/report`
Final vulnerability report JSON (see architecture/report-view.md).

## 2. External Services

### Gemini API (target)
- Service: Google AI Studio / Google Cloud Vertex
- Package: `google-generativeai`
- Call: `genai.GenerativeModel("gemini-2.0-flash").generate_content(prompt)`
- Auth: `GEMINI_API_KEY`
- Rate limits: free tier has RPM limits — backoff on 429, sleep between attacks

### GLM API (attacker/judge/mutator)
- Service: Zhipu AI (BigModel) — `https://open.bigmodel.cn/api/paas/v4/chat/completions`
- Package: `httpx` or official `zhipuai` SDK
- Model: `glm-4-flash` (fast/cheap) or `glm-4.5`
- Auth: `GLM_API_KEY` (Bearer token)
- Judge must return strict JSON: `{ success, confidence, severity, reason, information_provided }`

### Supabase (DB)
- Service: `supabase` Python client (service role key)
- Tables: `runs`, `attacks` (schema in phase-2)
- Auth: `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`

## 3. Auth / Security

- Backend endpoints: no public auth (internal tool). Protect at deployment with
  network/VPN or basic auth if exposed.
- Supabase RLS: leave service-role access for backend; anon role gets read-only
  on `runs`/`attacks` for frontend reads if using direct Supabase.
- API keys only in `backend/.env` / Vercel env vars — never in client code.
- CORS: allow frontend origin only.

## 4. Error Handling

- Gemini/GLM 429 → exponential backoff + retry
- Target timeout (e.g. 30s) → treat as blocked, continue
- JSON parse failure in judge → re-request once, else mark `success=false`
- Supabase write failure → log + continue loop (don't kill the run)
