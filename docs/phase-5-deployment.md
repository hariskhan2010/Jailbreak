# Phase 5: Deployment

## Objective
Deploy backend to Render and frontend to Vercel; verify live.

## Tasks

1. Backend on Render (web service):
   - Add `backend/Procfile`: `web: uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Env vars: GEMINI_API_KEY, GLM_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
2. Frontend on Vercel:
   - Env vars: NEXT_PUBLIC_API_URL (Render URL), NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
3. CORS: allow the Vercel domain in FastAPI (`CORSMiddleware`)
4. HTTPS: enabled by default on Render + Vercel
5. DB: Supabase accessible from Render (region match), check RLS doesn't block service role
6. Verify: create a run in production, watch live stream, generate report

## Checklist

- ☐ Env vars set on both platforms
- ☐ DB connected (Supabase)
- ☐ APIs working (Gemini + GLM keys valid)
- ☐ SSL/HTTPS live
- ☐ CORS configured (web)
- ☐ Manual test on deployed URL
