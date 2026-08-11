# MCPs, Skills, Hooks

Policy: keep sessions light. Enable tools only for the task, then unload.

## MCPs

| Tool | Type | Where | Why |
|---|---|---|---|
| context7 | MCP | All library work (google-generativeai, supabase-py, Next.js 15, SSE) | Up-to-date API docs before coding |
| supabase | MCP | Phase 2 (schema + DB layer) | Apply migrations, inspect tables, run queries |
| playwright | MCP | Phase 4 (manual E2E) | Drive the dashboard: create run, verify live stream UI |
| sequential-thinking | MCP | Architecture/runner design decisions | Complex async loop + retry/backoff reasoning |
| github | MCP | Optional: commit/PR after code review | If user wants version control |

Load only when needed (`mcp-manager load <name> --project`), unload after.

## Skills

| Skill | Where | Why |
|---|---|---|
| ui-ux-pro-max | Phase 3 (all UI) | Premium dashboard/live-log design |
| code-review | Project end | Mandatory final review |
| security-review | Project end | Mandatory security audit |
| verification-before-completion | Before any "done" claim | Evidence before assertions |

Load on demand, unload when done. Delete/unload all others at project start.

## Hooks (candidate — evaluate before adding)

| Hook | Where | Why |
|---|---|---|
| Pre-lint hook | Phase 4 | Run ruff + `npm run lint` before commits |
| Pre-commit secret scan | All | Prevent `GEMINI_API_KEY`/`GLM_API_KEY` leaking |

> Do NOT add hooks during build phases — only in Phase 4 once everything is stable.
