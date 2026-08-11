# Plan — Autonomous Jailbreak Discovery Agent

## 1. Overview

An AI agent that autonomously discovers jailbreak vulnerabilities in LLMs.
It generates adversarial prompts, attacks a target model, judges success,
mutates failed attempts, and produces a structured vulnerability report.

**Purpose:** Authorized red-teaming / defensive security auditing of LLMs before deployment.
**Target User:** AI security researchers, companies auditing their LLMs.

## 2. Requirements (confirmed with user)

| Item | Decision |
|---|---|
| Target model | **Gemini** (via Gemini API key) |
| Agent model (attacker/judge/mutator) | **GLM** (via GLM API key) — kept separate from target so attacker ≠ target |
| Stack | Python (FastAPI) backend + Next.js 15 frontend + Supabase + Gemini/GLM API |
| Build order | Docs first → backend → frontend → report |
| Keys | User has Gemini + GLM keys. No Anthropic/OpenAI needed. |

> Design note: attacker/judge use **GLM** so the red-team model is independent of the
> target (Gemini). This is the honest setup — attacking a model with itself is less
> realistic. GLM can be swapped for Gemini later in `core/config.py`.

## 3. Features

- Start a run: pick target model, attack categories, topics, max iterations
- Live attack loop: generate → attack → judge → mutate → log → repeat
- Real-time streaming via SSE (Server-Sent Events)
- Attack results: success/fail, severity (LOW/MEDIUM/HIGH/CRITICAL), confidence, reason
- Runs history list + per-run detail (live view)
- Final vulnerability report: summary, severity breakdown, category heatmap,
  top vulnerabilities, recommendations, export (PDF / Markdown)
- Rate limiting + retry handling against Gemini/GLM APIs

## 4. Pages (web)

| Route | Page | Purpose |
|---|---|---|
| `/` | Dashboard | Start runs, global stats, recent runs |
| `/runs` | Runs list | All runs + status badges |
| `/runs/[id]` | Live run view | SSE log, counters, severity badges |
| `/reports/[id]` | Report view | Final vulnerability report + export |

## 5. Stack

- **Backend:** Python 3.11+, FastAPI, uvicorn, google-generativeai, httpx, supabase-py, python-dotenv
- **Frontend:** Next.js 15 (TypeScript, Tailwind), @supabase/supabase-js
- **DB:** Supabase (Postgres) — `runs`, `attacks` tables
- **Target API:** Gemini (gemini-2.0-flash default)
- **Agent API:** GLM (glm-4.5 / glm-4-flash default)
- **Live updates:** SSE

## 6. File Structure

```
jailbreak/
├── backend/
│   ├── main.py                    # FastAPI entrypoint + SSE + report endpoints
│   ├── requirements.txt
│   ├── .env                       # GEMINI_API_KEY, GLM_API_KEY, SUPABASE_*
│   ├── agents/
│   │   ├── attacker.py            # GLM: generates adversarial prompts
│   │   ├── judge.py               # GLM: evaluates if jailbreak succeeded (JSON)
│   │   └── mutator.py             # GLM: mutates failed prompts
│   ├── core/
│   │   ├── config.py              # ATTACK_CATEGORIES, HARMFUL_TOPICS, model names
│   │   ├── db.py                  # Supabase client + logging helpers
│   │   └── runner.py              # Main attack loop (async)
│   ├── targets/
│   │   ├── base.py                # Abstract BaseTarget
│   │   ├── gemini_target.py       # Gemini API target
│   │   └── ollama_target.py       # Optional local target (no cost)
│   └── report/
│       └── generator.py           # Final vulnerability report
├── frontend/                      # Next.js 15
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   ├── runs/page.tsx          # Runs list
│   │   ├── runs/[id]/page.tsx     # Live run view
│   │   └── reports/[id]/page.tsx  # Report view
│   ├── components/
│   │   ├── RunConfig.tsx          # New run form
│   │   ├── LiveLog.tsx            # SSE attack log
│   │   ├── AttackCard.tsx         # Single attack result
│   │   ├── CategoryChart.tsx      # Success by category
│   │   └── VulnReport.tsx         # Report renderer
│   └── lib/
│       └── api.ts                 # Backend API calls
├── docs/                          # This planning set
│   ├── plan.md
│   ├── phase-1-foundation.md
│   ├── phase-2-core-features.md
│   ├── phase-3-ui-polish.md
│   ├── phase-4-testing.md
│   ├── phase-5-deployment.md
│   ├── architecture/
│   ├── api-requirements.md
│   ├── api-keys-guide.md
│   ├── mcp-skills-hooks.md
│   ├── tasks.md
│   └── problem-solutions.md
└── plan (18).md                   # Original source plan
```

## 7. Key Technical Decisions

| Decision | Choice | Why |
|---|---|---|
| Agent loop | Custom Python async | LangGraph overkill |
| Live updates | SSE | Simpler than WebSockets |
| Attacker/Judge | GLM API | User has key; independent of target |
| Target | Gemini API | User has key; user's chosen first target |
| Default agent model | glm-4-flash | Fast + cheap for iteration |
| Default target model | gemini-2.0-flash | User's key; fast |
| DB | Supabase | Chosen stack |
| Frontend | Next.js 15 | Chosen stack |

## 8. Attack Categories (from source plan)

ROLEPLAY_BYPASS, PROMPT_INJECTION, LANGUAGE_CONFUSION, CONTEXT_OVERFLOW,
SYSTEM_PROMPT_LEAK, TOKEN_SMUGGLING, PERSONA_SWITCH — with templates in
`backend/core/config.py`.

## 9. Phases

1. **phase-1-foundation.md** — backend config, agents, targets, runner, API
2. **phase-2-core-features.md** — Supabase schema, DB layer, endpoints, SSE
3. **phase-3-ui-polish.md** — Next.js dashboard, live view, report view
4. **phase-4-testing.md** — lint, typecheck, manual test on web
5. **phase-5-deployment.md** — Vercel + Render + env vars + verify

## 10. Environment Variables

```bash
# backend/.env
GEMINI_API_KEY=your_gemini_key
GLM_API_KEY=your_glm_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 11. Risks / Notes

- Gemini has its own safety filters; some categories may produce refusal responses.
  That's expected — the judge must distinguish "blocked" from "jailbreak success".
- Rate limits: keep `asyncio.sleep(0.5)` between attacks; add backoff for 429s.
- `HARMFUL_TOPICS` are standard defensive red-team test topics (see source plan).
  This tool is for authorized security testing only.
