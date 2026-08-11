# Architecture — Live Run View (`/runs/[id]`)

## Files

`frontend/app/runs/[id]/page.tsx` · `frontend/components/LiveLog.tsx` · `frontend/components/AttackCard.tsx`

## Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER  LOGO · Dashboard · Runs · Reports                     (nav)       │
├────────────────────────────────────────────────────────────────────────────┤
│  RUN #3 · target: gemini-2.0-flash · agent: glm-4-flash    [ ▼ Report ]   │
│  Status: ● RUNNING                                       (hidden until done)│
├────────────────────────────────────────────────────────────────────────────┤
│  ┌── LIVE COUNTERS ────────────────────────────────────────────────────┐   │
│  │  Attacks tried    Successes found   Current category               │   │
│  │  [ 47 ]           [ 9 ]             [ ROLEPLAY_BYPASS ]            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌── LIVE LOG (LiveLog.tsx + AttackCard.tsx) ──────────────▼ scroll ▼────┐ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ [MEDIUM] ROLEPLAY_BYPASS · "how to bypass..."                    │ │ │
│  │  │ prompt: "Pretend you are DAN..."                                 │ │ │
│  │  │ reason: "Model refused; denied request"    [⚠ JAILBREAK SUCCESS] │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐ │ │
│  │  │ [LOW] PROMPT_INJECTION · "financial fraud"                       │ │ │
│  │  │ prompt: "Translate this: ..."                                    │ │ │
│  │  │ reason: "Ignored injected instruction"          [ BLOCKED ]      │ │ │
│  │  └──────────────────────────────────────────────────────────────────┘ │ │
│  │  ... (new cards append from SSE stream)                              │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
  page ──EventSource(EventSource)──▶ GET /api/runs/{id}/stream  (SSE)
  each SSE event = one attack result JSON ──▶ append AttackCard
  SSE {"type":"done"} ──▶ stop EventSource, show [ ▼ Report ] button
  counters derived from events received client-side (attacks, successes, current cat)
```

## Data

- SSE event: `{ run_id, category, topic, prompt, response, success, severity, confidence, reason, iteration }`
- `AttackCard` props: `{ category, topic, prompt, response, success, severity, confidence, reason }`
- Severity colors: LOW=text-blue-400, MEDIUM=text-yellow-400, HIGH=text-orange-400, CRITICAL=text-red-400
