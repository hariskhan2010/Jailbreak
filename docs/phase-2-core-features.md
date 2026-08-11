# Phase 2: Core Features — Data Layer + Live Streaming

## Objective
Persist runs/attacks in Supabase and stream live results to the frontend over SSE.

## Tasks

1. `backend/core/db.py` — Supabase client (service role), helpers:
   `log_attack()`, `update_run_status()`, `get_run()`, `get_run_results(offset)`, `get_all_runs()`
2. Supabase schema (apply in SQL editor):
   - `runs` table: id uuid pk, target_name, target_model, categories text[], topics text[],
     status text default 'running', total_attacks int, successful_attacks int,
     created_at, completed_at
   - `attacks` table: id uuid pk, run_id fk, category, topic, prompt, response,
     success bool, severity, confidence float, reason, iteration, created_at
   - indexes: attacks(run_id), attacks(success), attacks(category)
3. Wire `runner.py` to `log_attack()` + `update_run_status()` on every iteration
4. `main.py` — SSE `/api/runs/{id}/stream`: poll Supabase for new rows, emit JSON events,
   emit `{"type":"done"}` when status == completed
5. `backend/core/config.py` — add `on_result` callback hook in runner for live streaming

## Verification

- ☐ Insert a run manually; SSE endpoint streams back its results
- ☐ Run completes → `status='completed'` in Supabase, SSE sends `done`
