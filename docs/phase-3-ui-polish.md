# Phase 3: UI Polish — Next.js Frontend

## Objective
Next.js 15 dashboard: start runs, watch live logs, view results and reports.

## Tasks

1. `frontend/` — `npx create-next-app@latest . --typescript --tailwind --app`; `npm i @supabase/supabase-js`
2. `frontend/lib/api.ts` — typed functions: `createRun()`, `listRuns()`, `getRunResults()`, `getReport()`
3. `frontend/components/RunConfig.tsx` — form: target model, categories (multi), topics (multi), max iterations
4. `frontend/app/page.tsx` — Dashboard: RunConfig + global stats + recent runs list
5. `frontend/app/runs/page.tsx` — all runs with status badges
6. `frontend/components/LiveLog.tsx` — EventSource to `/api/runs/{id}/stream`, appends attack cards
7. `frontend/components/AttackCard.tsx` — success/fail badge, severity colors
   (LOW=blue, MEDIUM=yellow, HIGH=orange, CRITICAL=red), prompt + reason
8. `frontend/app/runs/[id]/page.tsx` — live counters: attacks tried, successes, current category
9. `frontend/components/CategoryChart.tsx` — success rate by category (simple bars)
10. `frontend/components/VulnReport.tsx` + `frontend/app/reports/[id]/page.tsx` — render report
11. Export buttons: PDF (print) + Markdown download

## Verification

- ☐ `npm run build` passes
- ☐ Dashboard starts a run → live view streams results in real time
- ☐ Report view renders summary + severity breakdown + heatmap
