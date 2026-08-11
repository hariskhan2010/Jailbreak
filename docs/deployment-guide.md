# Deployment Guide (Manual — Render + Vercel)

Repo: `https://github.com/hariskhan2010/Jailbreak` (branch `master`)
Supabase project: `qknjemzmsjvxxwmhwibp` · URL `https://qknjemzmsjvxxwmhwibp.supabase.co` (Tokyo)

## 1. Render — backend (do this FIRST, Vercel needs the URL)

1. [dashboard.render.com](https://dashboard.render.com) → **New → Blueprint** →
   pick `hariskhan2010/Jailbreak`. Render auto-detects `backend/render.yaml`
   (`jailbreak-backend`, `rootDir: backend`, Python 3.12).
2. When it asks to apply the Blueprint, fill in the **env vars** (they are
   `sync: false`, so set them during apply):
   - `GEMINI_API_KEY`
   - `GLM_API_KEY`
   - `SUPABASE_URL` → `https://qknjemzmsjvxxwmhwibp.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ALLOWED_ORIGINS` → the Vercel URL from step 2 (can be edited later)
3. Deploy. Note the service URL (e.g. `https://jailbreak-backend.onrender.com`).
4. Verify: open `https://<your-backend>.onrender.com/api/health` → `{"status":"ok"}`.

## 2. Vercel — frontend

1. [vercel.com](https://vercel.com) → **Add New → Project** → import
   `hariskhan2010/Jailbreak`.
2. **Root directory:** `frontend` (Framework: Next.js — auto-detected).
3. **Env vars:**
   - `NEXT_PUBLIC_API_URL` → `https://<your-backend>.onrender.com`
   - `NEXT_PUBLIC_SUPABASE_URL` → `https://qknjemzmsjvxxwmhwibp.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrbmplbXptc2p2eHh3bWh3aWJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzODYwNDMsImV4cCI6MjEwMTk2MjA0M30.s2NNSVgfjcra0zOUxI0-BZpRdzoh9OkrcMRqWrwyosA`
4. **Deploy.** Note the URL (e.g. `https://jailbreak-<hash>.vercel.app`).

## 3. Wire them together

- Set Render `ALLOWED_ORIGINS` to the Vercel URL (comma-separated if multiple),
  then **Manual Deploy / Restart** the Render service.
- SSL/HTTPS is automatic on both platforms.

## 4. Verify in production

1. Open the Vercel URL → Dashboard.
2. Pick a target (Gemini default), select categories + topics, **Start run**.
3. Watch the **live stream** on `/runs/{id}` — cards should append in real time.
4. When complete → **View report** — summary, severity breakdown, heatmap,
   top vulnerabilities, recommendations, PDF/Markdown export.

## Troubleshooting

- **CORS errors in browser:** check `ALLOWED_ORIGINS` on Render matches the
  exact Vercel origin (no trailing slash).
- **Report/empty runs:** confirm `SUPABASE_SERVICE_ROLE_KEY` is set — RLS lets
  `anon` read but only service-role writes.
- **Free-tier Render cold start:** first request can take 30–60s.
