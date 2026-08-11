"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ArrowRight, RefreshCw, Activity } from "lucide-react";
import { api, type RunSummary } from "@/lib/api";
import RunConfig from "@/components/RunConfig";
import StatusBadge from "@/components/StatusBadge";
import StatCard from "@/components/StatCard";
import { timeAgo, percent } from "@/lib/format";

export default function Dashboard() {
  const [runs, setRuns] = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const heroRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-reveal]"),
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.07 },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  const stats = useMemo(() => {
    const totalAttacks = runs.reduce((acc, r) => acc + (r.total_attacks || 0), 0);
    const totalSuccess = runs.reduce((acc, r) => acc + (r.successful_attacks || 0), 0);
    const active = runs.filter((r) => r.status === "running").length;
    const completed = runs.filter((r) => r.status === "completed").length;
    return { totalAttacks, totalSuccess, active, completed };
  }, [runs]);

  return (
    <div className="space-y-8">
      <div ref={heroRef}>
        <p
          data-reveal
          className="font-body text-xs font-semibold uppercase tracking-[0.2em] text-primary"
        >
          Autonomous red-team
        </p>
        <h1
          data-reveal
          className="mt-2 max-w-2xl font-display text-4xl font-bold leading-tight text-ink sm:text-5xl"
        >
          Discover jailbreak vulnerabilities in your{" "}
          <span className="bg-gradient-to-r from-primary to-gold bg-clip-text text-transparent">
            LLM
          </span>
        </h1>
        <p data-reveal className="mt-3 max-w-2xl font-body text-sm leading-relaxed text-dim">
          Generate adversarial prompts, attack a target model, judge success and
          mutate failed attempts — all autonomously, with a live stream you can
          watch in real time.
        </p>
      </div>

      <RunConfig />

      <section>
        <div data-reveal className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-ink">Global stats</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total attacks" value={stats.totalAttacks} accent />
          <StatCard
            label="Success rate"
            value={percent(stats.totalSuccess, stats.totalAttacks)}
            sub={`${stats.totalSuccess} jailbreaks`}
          />
          <StatCard label="Active runs" value={stats.active} sub="live right now" />
          <StatCard label="Completed runs" value={stats.completed} />
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl text-ink">Recent runs</h2>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="btn btn-ghost"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {error ? (
          <div className="card p-6 text-sm text-danger">{error}</div>
        ) : null}

        {!error && runs.length === 0 ? (
          <div className="card grid h-40 place-items-center text-center">
            <div>
              <Activity className="mx-auto size-8 text-dim" />
              <p className="mt-2 font-body text-sm text-dim">
                No runs yet. Start your first run above.
              </p>
            </div>
          </div>
        ) : null}

        <div className="space-y-3">
          {runs.slice(0, 6).map((run) => (
            <Link
              key={run.id}
              href={`/runs/${run.id}`}
              className="card press3d flex flex-wrap items-center gap-3 px-5 py-4 transition-colors hover:border-primary/40"
            >
              <StatusBadge status={run.status} />
              <span className="font-body text-sm font-semibold text-ink">
                {run.target_model}
              </span>
              <span className="hidden font-body text-xs text-dim sm:inline">
                {run.target_name}
              </span>
              <span className="ml-auto flex items-center gap-4 font-body text-xs text-dim">
                <span>
                  <span className="font-semibold text-ink">{run.total_attacks}</span>{" "}
                  attacks
                </span>
                <span>
                  <span className="font-semibold text-ok">
                    {run.successful_attacks}
                  </span>{" "}
                  success
                </span>
                <span className="hidden sm:inline">{timeAgo(run.created_at)}</span>
                <ArrowRight className="size-4 text-primary" />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
