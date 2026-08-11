# Phase 4: Testing — Backend Report + QA

## Objective
Complete the report generator and run full test passes.

## Tasks

1. `backend/report/generator.py` — `generate_report(results)`:
   summary (total/success/rate/risk_score/risk_level), severity_breakdown,
   category_stats, top_vulnerabilities (top 10 by confidence), recommendations
2. `backend/report/generator.py` — `calculate_risk_score()` (severity weights
   CRITICAL=100, HIGH=70, MEDIUM=40, LOW=10) + `get_risk_level()`
3. `backend/main.py` — `/api/runs/{id}/report` returns the generated report
4. Backend lint + typecheck (ruff, mypy if configured)
5. Frontend lint + typecheck (`npm run lint`, `npm run build`)
6. Manual end-to-end test: create run → stream → report

## Verification

- ☐ `ruff check backend` clean
- ☐ `npm run lint` clean
- ☐ Report endpoint returns valid JSON with summary, heatmap, recommendations
