# API Keys Guide

This project needs **2 API keys** (both free-tier eligible). Get them BEFORE coding
starts — per workflow, no implementation until keys are received.

## 1. Gemini API Key (target model)

| Item | Detail |
|---|---|
| Needed? | **Yes — required** |
| Cost | Free tier available (AI Studio) |
| What it's used for | The **target** LLM that gets attacked |
| Env var | `GEMINI_API_KEY` (backend) |

How to get:
1. Go to https://aistudio.google.com/apikey
2. Sign in with your Google account
3. Click **Create API key** → accept terms → copy the key
4. Save it as `GEMINI_API_KEY` in `backend/.env`

> Tip: free tier has RPM limits. If a run hits 429s, we'll add backoff.

## 2. GLM API Key (attacker / judge / mutator agents)

| Item | Detail |
|---|---|
| Needed? | **Yes — required** |
| Cost | Free tier credits available (BigModel) |
| What it's used for | Generating adversarial prompts, mutating failures, judging results |
| Env var | `GLM_API_KEY` (backend) |

How to get:
1. Go to https://open.bigmodel.cn (Zhipu AI / BigModel)
2. Register / sign in (phone number)
3. In console → **API Keys** → create a new key
4. Save it as `GLM_API_KEY` in `backend/.env`

## 3. Supabase (DB)

| Item | Detail |
|---|---|
| Needed? | **Yes — required** |
| Cost | Free tier available |
| Env vars | `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (backend); `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend) |

How to get:
1. Go to https://supabase.com → start new project
2. Project Settings → **API** → copy Project URL + anon key + service_role key
3. Apply the SQL schema from `docs/phase-2-core-features.md` in the SQL editor

## 4. Not needed

- ❌ Anthropic API (original plan used Claude — replaced with GLM)
- ❌ OpenAI API (replaced with Gemini target)
- ❌ Vercel/Render keys until deployment phase

## 5. Required env files

```bash
# backend/.env
GEMINI_API_KEY=...
GLM_API_KEY=...
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```
