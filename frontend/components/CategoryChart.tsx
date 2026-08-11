"use client";

import { BarChart3 } from "lucide-react";
import type { CategoryStat } from "@/lib/api";

interface CategoryChartProps {
  stats: Record<string, CategoryStat>;
}

export default function CategoryChart({ stats }: CategoryChartProps) {
  const entries = Object.entries(stats).sort(
    (a, b) =>
      b[1].success / Math.max(1, b[1].total) - a[1].success / Math.max(1, a[1].total),
  );

  if (!entries.length) {
    return (
      <div className="grid h-40 place-items-center text-sm text-dim">
        No attack data for this run.
      </div>
    );
  }

  const maxRate = Math.max(
    1,
    ...entries.map(([, s]) => (s.success / Math.max(1, s.total)) * 100),
  );

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="size-4 text-primary" />
        <h3 className="text-base text-ink">Category heatmap</h3>
      </div>
      <div className="space-y-3">
        {entries.map(([cat, s]) => {
          const rate = (s.success / Math.max(1, s.total)) * 100;
          const isWorst = rate === maxRate && s.success > 0;
          return (
            <div key={cat}>
              <div className="mb-1 flex items-center justify-between gap-3">
                <span
                  className={`truncate font-body text-xs font-semibold ${
                    isWorst ? "text-primary" : "text-gold"
                  }`}
                >
                  {cat}
                  {isWorst ? " · most vulnerable" : ""}
                </span>
                <span className="shrink-0 font-body text-xs text-dim">
                  {s.success}/{s.total} · {Math.round(rate)}%
                </span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-bg-deep">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    isWorst
                      ? "bg-gradient-to-r from-danger to-warn"
                      : "bg-gradient-to-r from-primary/70 to-primary"
                  }`}
                  style={{ width: `${Math.max(2, rate)}%` }}
                  role="img"
                  aria-label={`${cat}: ${s.success} of ${s.total} succeeded`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
