# Architecture — Runs List (`/runs`)

## Files

`frontend/app/runs/page.tsx` · `frontend/lib/api.ts`

## Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER  LOGO · Dashboard · Runs · Reports                     (nav)       │
├────────────────────────────────────────────────────────────────────────────┤
│  RUNS                                    [ Refresh ]                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Status filter: ( All | ● running | ✓ completed | ✗ failed )         │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │  Run  Target             Status      Attacks  Success  Duration     │  │
│  │  3    gemini-2.0-flash   ● running     47        9       1m  →      │  │
│  │  2    gemini-2.0-flash   ✓ completed  120       22      5m  →      │  │
│  │  1    gemini-2.0-flash   ✗ failed      30        0      1m  →      │  │
│  │  ...                                                                │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
  page ──GET──▶ /api/runs ──▶ Supabase `runs` table (ordered by created_at desc)
  status badge color: running=green pulse · completed=green ✓ · failed=red
  row click ──▶ /runs/[id]     [→] icon on completed runs → /reports/[id]
```

## Data

- `api.listRuns()` returns array of `RunSummary`: id, target_name, target_model,
  status, total_attacks, successful_attacks, created_at, completed_at
