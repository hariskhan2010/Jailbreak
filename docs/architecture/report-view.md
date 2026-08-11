# Architecture — Report View (`/reports/[id]`)

## Files

`frontend/app/reports/[id]/page.tsx` · `frontend/components/VulnReport.tsx` · `frontend/components/CategoryChart.tsx`

## Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│  HEADER  LOGO · Dashboard · Runs · Reports                     (nav)       │
├────────────────────────────────────────────────────────────────────────────┤
│  VULNERABILITY REPORT · Run #3 · gemini-2.0-flash        [PDF][Markdown]  │
├────────────────────────────────────────────────────────────────────────────┤
│  ┌── EXECUTIVE SUMMARY ─────────────────────────────────────────────────┐  │
│  │  Total attacks: 120   Successful: 22   Success rate: 18%            │  │
│  │  Risk score: 61 / 100   Risk level: ● HIGH                          │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── SEVERITY BREAKDOWN ───────────────────────────────────────────────┐  │
│  │  [CRITICAL ▓▓▓░░ 3]  [HIGH ▓▓░░░ 6]  [MEDIUM ▓░░░░ 8]  [LOW ░░░░░ 5]│  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── CATEGORY HEATMAP (CategoryChart.tsx) ──────────────────────────────┐  │
│  │  ROLEPLAY_BYPASS      ▓▓▓▓▓▓▓▓░░  80%  ─ most vulnerable             │  │
│  │  PROMPT_INJECTION     ▓▓░░░░░░░░  20%                                │  │
│  │  LANGUAGE_CONFUSION   ▓░░░░░░░░░  10%                                │  │
│  │  TOKEN_SMUGGLING      ░░░░░░░░░░   0%                                │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  ┌── TOP VULNERABILITIES (table, sorted by confidence) ──────────────────┐ │
│  │  #  Severity  Category        Prompt (truncated)   Confidence        │ │
│  │  1  CRITICAL  ROLEPLAY_BYPASS "Pretend you are..."   0.97            │ │
│  │  2  HIGH      LANG_CONFUSION  "Explain in Urdu..."   0.91            │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  ┌── RECOMMENDATIONS ────────────────────────────────────────────────────┐ │
│  │  • Strengthen roleplay/persona handling (highest success category)   │ │
│  │  • Add multi-language output filtering for LANGUAGE_CONFUSION        │ │
│  └────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘

DATA FLOW:
  page ──GET──▶ /api/runs/{id}/report ──▶ backend report/generator.py ──▶ JSON
  VulnReport.tsx renders sections above from report JSON
  PDF = window.print() · Markdown = generate .md from JSON + download
```

## Data (report JSON from backend)

```json
{
  "summary": { "total_attacks": 120, "successful_attacks": 22, "success_rate": 18.3,
               "risk_score": 61, "risk_level": "HIGH" },
  "severity_breakdown": { "LOW": 5, "MEDIUM": 8, "HIGH": 6, "CRITICAL": 3 },
  "category_stats": { "ROLEPLAY_BYPASS": { "total": 10, "success": 8 } },
  "top_vulnerabilities": [ { "severity": "CRITICAL", "category": "ROLEPLAY_BYPASS",
                             "prompt": "...", "confidence": 0.97 } ],
  "recommendations": ["..."]
}
```
