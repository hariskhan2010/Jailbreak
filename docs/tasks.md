# Tasks

Legend: `[x]` done & tested · `[ ]` pending

## Phase 1 — Backend Foundation
- [x] requirements.txt + .env
- [x] core/config.py — categories, topics, models
- [x] targets/base.py + gemini_target.py
- [x] agents/attacker.py (GLM)
- [x] agents/mutator.py (GLM)
- [x] agents/judge.py (GLM, strict JSON)
- [x] core/runner.py — async loop
- [x] main.py — API endpoints

## Phase 2 — Data + Live Streaming
- [x] Supabase schema (runs + attacks + indexes)
- [x] core/db.py — log/read helpers
- [x] Wire runner → db
- [x] SSE /api/runs/{id}/stream
- [x] on_result callback hook

## Phase 3 — Frontend
- [x] Next.js scaffold + deps
- [x] lib/api.ts
- [x] RunConfig.tsx
- [x] Dashboard (app/page.tsx)
- [x] Runs list (app/runs/page.tsx)
- [x] LiveLog.tsx + AttackCard.tsx
- [x] Live run view (app/runs/[id]/page.tsx)
- [x] CategoryChart.tsx
- [x] VulnReport.tsx + report view
- [x] PDF + Markdown export

## Phase 4 — Report + Testing
- [x] report/generator.py (summary, heatmap, top vulns, recommendations)
- [x] calculate_risk_score + get_risk_level
- [x] /api/runs/{id}/report
- [x] Backend lint + typecheck
- [x] Frontend lint + build
- [x] Manual E2E: create run → stream → report

## Phase 5 — Deployment
- [ ] Render backend + env vars
- [ ] Vercel frontend + env vars
- [ ] CORS + HTTPS
- [ ] Verify live run + report in production
