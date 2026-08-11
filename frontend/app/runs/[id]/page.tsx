"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Crosshair, FlaskConical, CheckCircle2 } from "lucide-react";
import { api, type AttackResult, type Run } from "@/lib/api";
import LiveLog, { type LiveStats } from "@/components/LiveLog";
import StatusBadge from "@/components/StatusBadge";
import { percent } from "@/lib/format";

export default function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [run, setRun] = useState<Run | null>(null);
  const [initial, setInitial] = useState<AttackResult[]>([]);
  const [stats, setStats] = useState<LiveStats>({
    total: 0,
    successes: 0,
    current: null,
  });
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    Promise.all([api.getRun(id), api.getRunResults(id)])
      .then(([runData, results]) => {
        setRun(runData);
        setInitial(results);
        setDone(runData.status === "completed" || runData.status === "failed");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Run not found"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onStats = useCallback((s: LiveStats) => setStats(s), []);
  const onDone = useCallback(() => setDone(true), []);

  const successRate = useMemo(
    () => percent(stats.successes, stats.total),
    [stats.successes, stats.total],
  );

  if (error) {
    return (
      <div className="card grid min-h-64 place-items-center p-6 text-center">
        <div>
          <Crosshair className="mx-auto size-8 text-danger" />
          <p className="mt-2 font-body text-sm text-danger">{error}</p>
          <Link href="/runs" className="btn btn-ghost mt-4">
            <ArrowLeft className="size-4" /> Back to runs
          </Link>
        </div>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-dim">
        <FlaskConical className="size-4 animate-pulse" /> Loading run…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/runs"
          className="btn btn-ghost shrink-0 px-3"
          aria-label="Back to runs"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <div className="min-w-0">
          <p className="truncate font-body text-xs text-dim">
            Run {run.id.slice(0, 8)} · {run.target_name}
          </p>
          <h1 className="truncate font-display text-2xl font-bold text-ink">
            {run.target_model}
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <StatusBadge status={run.status} />
          {done ? (
            <Link href={`/reports/${id}`} className="btn btn-primary">
              <FileText className="size-4" /> View report
            </Link>
          ) : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="card p-5">
          <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
            Attacks tried
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-ink">
            {stats.total}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
            Successes found
          </div>
          <div className="mt-1 flex items-center gap-2 font-display text-3xl font-bold text-ok">
            {stats.successes}
            {stats.successes > 0 ? <CheckCircle2 className="size-5" /> : null}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
            Success rate
          </div>
          <div className="mt-1 font-display text-3xl font-bold text-ink">
            {successRate}
          </div>
        </div>
        <div className="card p-5">
          <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
            Current category
          </div>
          <div
            className="mt-1 truncate font-display text-xl font-bold text-primary"
            title={stats.current ?? undefined}
          >
            {stats.current ?? "—"}
          </div>
        </div>
      </div>

      <LiveLog runId={id} initial={initial} onStats={onStats} onDone={onDone} />
    </div>
  );
}
