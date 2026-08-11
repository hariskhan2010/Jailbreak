"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileText, RefreshCw, ListOrdered } from "lucide-react";
import { api, type RunStatus, type RunSummary } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { duration, timeAgo } from "@/lib/format";

const FILTERS: { value: RunStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "failed", label: "Failed" },
];

export default function RunsPage() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [filter, setFilter] = useState<RunStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .listRuns()
      .then((data) => setRuns(data))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load runs"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (filter === "all" ? runs : runs.filter((r) => r.status === filter)),
    [runs, filter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            History
          </p>
          <h1 className="font-display text-3xl font-bold text-ink">Runs</h1>
        </div>
        <button type="button" onClick={load} disabled={loading} className="btn btn-ghost">
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            aria-pressed={filter === f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-lg border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filter === f.value
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-line bg-card-muted/40 text-dim hover:text-gold"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? <div className="card p-6 text-sm text-danger">{error}</div> : null}

      {!error && visible.length === 0 ? (
        <div className="card grid h-48 place-items-center text-center">
          <div>
            <ListOrdered className="mx-auto size-8 text-dim" />
            <p className="mt-2 font-body text-sm text-dim">
              {runs.length === 0 ? "No runs yet." : "No runs match this filter."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="card overflow-hidden">
        <div className="hidden grid-cols-[1fr_auto] gap-4 border-b border-line px-6 py-3 font-body text-[11px] font-semibold uppercase tracking-widest text-gold sm:grid">
          <span>Run</span>
          <span className="flex gap-8 text-right">
            <span className="w-24">Attacks</span>
            <span className="w-20">Success</span>
            <span className="w-20">Duration</span>
            <span className="w-20">Created</span>
          </span>
        </div>
        {visible.map((run) => (
          <div
            key={run.id}
            className="grid grid-cols-1 gap-3 border-b border-line px-6 py-4 transition-colors last:border-0 hover:bg-card-muted/40 sm:grid-cols-[1fr_auto]"
          >
            <Link
              href={`/runs/${run.id}`}
              className="group flex min-w-0 items-center gap-3"
            >
              <StatusBadge status={run.status} />
              <span className="truncate font-body text-sm font-semibold text-ink">
                {run.target_model}
              </span>
              <span className="hidden truncate font-body text-xs text-dim lg:inline">
                {run.target_name}
              </span>
              <ArrowRight className="size-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>

            <div className="flex flex-wrap items-center justify-between gap-3 font-body text-xs text-dim sm:justify-end">
              <span className="w-24 text-right sm:text-left">
                <span className="font-semibold text-ink">{run.total_attacks}</span>
              </span>
              <span className="w-20 text-right">
                <span className="font-semibold text-ok">
                  {run.successful_attacks}
                </span>
              </span>
              <span className="hidden w-20 text-right sm:block">
                {duration(run.created_at, run.completed_at)}
              </span>
              <span className="hidden w-20 text-right sm:block">
                {timeAgo(run.created_at)}
              </span>
              {run.status === "completed" ? (
                <Link
                  href={`/reports/${run.id}`}
                  className="tag border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
                  title="View report"
                >
                  <FileText className="size-3.5" /> Report
                </Link>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
