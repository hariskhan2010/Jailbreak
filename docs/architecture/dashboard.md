# Architecture — Dashboard (`/`)

## Files

`frontend/app/page.tsx` · `frontend/components/RunConfig.tsx` · `frontend/lib/api.ts`

## Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER  LOGO · Dashboard · Runs · Reports                    (nav)        │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌── RUN CONFIG (RunConfig.tsx) ──────────────────────────────────────┐    │
│  │  Target model:  [ gemini-2.0-flash        ▼ ]                      │    │
│  │  Agent model:   [ glm-4-flash             ▼ ]   (read-only info)   │    │
│  │  Categories:    [x]ROLEPLAY  [ ]INJECTION  [ ]LANG  [ ]OVERFLOW    │    │
│  │                  [ ]LEAK  [ ]SMUGGLING  [ ]PERSONA                 │    │
│  │  Topics:        [ ]bypass security  [ ]chemicals  [ ]manipulate    │    │
│  │                  [ ]private info  [ ]fraud                         │    │
│  │  Max iterations: [ 100 ]         [ ▶ Start Run ]                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌── GLOBAL STATS ────────────────────────────────────────────────────┐    │
│  │  Total attacks   Success rate   Most vulnerable category           │    │
│  │  [ 1,234 ]       [ 18% ]        [ ROLEPLAY_BYPASS ]               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌── RECENT RUNS (list) ──────────────────────────────────────────────┐    │
│  │  #  Target         Status      Attacks   Success   Created        │    │
│  │  1  gemini-2.0    ● completed    120       22      2m ago    →    │    │
│  │  2  gemini-2.0    ● running       47        9      1m ago    →    │    │
│  │  3  gemini-2.0    ● failed        30        0      10m ago   →    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
  RunConfig.submit ──POST──▶ backend /api/runs ──▶ runner starts (async)
  page.tsx ──GET──▶ /api/runs  (list)  +  Supabase stats (direct anon read)
  click run row ──▶ /runs/[id]          click report ──▶ /reports/[id]
```

## Data

- `RunConfig.tsx` state → `api.createRun(config)` → returns `{ run_id }` → router.push(`/runs/${run_id}`)
- Recent runs fetched with `api.listRuns()` (or Supabase anon select on `runs`)
