"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";
import gsap from "gsap";
import { api, type AttackResult } from "@/lib/api";
import AttackCard from "./AttackCard";

export interface LiveStats {
  total: number;
  successes: number;
  current: string | null;
}

interface LiveLogProps {
  runId: string;
  initial?: AttackResult[];
  onStats?: (stats: LiveStats) => void;
  onDone?: () => void;
}

function keyOf(a: AttackResult): string {
  return (
    a.id ||
    [a.category, a.topic, a.iteration, a.created_at ?? "", a.prompt.slice(0, 60)].join("|")
  );
}

export default function LiveLog({ runId, initial, onStats, onDone }: LiveLogProps) {
  const [results, setResults] = useState<AttackResult[]>(initial ?? []);
  const [connected, setConnected] = useState(false);
  const [finished, setFinished] = useState(false);
  const seen = useRef<Set<string>>(new Set(initial?.map(keyOf) ?? []));
  const scrollRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const autoScroll = useRef(true);
  const onStatsRef = useRef(onStats);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onStatsRef.current = onStats;
    onDoneRef.current = onDone;
  }, [onStats, onDone]);

  useEffect(() => {
    const es = api.streamRun(runId);
    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as Partial<AttackResult> & {
          type?: string;
        };
        if (data.type === "done") {
          setFinished(true);
          es.close();
          onDoneRef.current?.();
          return;
        }
        const attack = data as AttackResult;
        const k = keyOf(attack);
        if (seen.current.has(k)) return;
        seen.current.add(k);
        setResults((prev) => [...prev, attack]);
      } catch {
        /* ignore malformed events */
      }
    };

    return () => {
      es.close();
    };
  }, [runId]);

  useEffect(() => {
    onStatsRef.current?.({
      total: results.length,
      successes: results.filter((r) => r.success).length,
      current: results.length ? results[results.length - 1].category : null,
    });
  }, [results]);

  useEffect(() => {
    const list = listRef.current;
    if (!list || !results.length) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        list.lastElementChild,
        { y: 14, opacity: 0, scale: 0.99 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power3.out" },
      );
    }, list);
    return () => ctx.revert();
  }, [results.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !autoScroll.current) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [results.length]);

  function onScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    autoScroll.current = nearBottom;
  }

  const isEmpty = results.length === 0;

  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 border-b border-line px-4 py-3">
        <Terminal className="size-4 text-primary" />
        <h3 className="text-base text-ink">Live log</h3>
        <span className="ml-auto flex items-center gap-2">
          <span className="tag border-line bg-card-muted/50 text-dim">
            {results.length} events
          </span>
          {finished ? (
            <span className="tag border-ok/30 bg-ok/10 text-ok">done</span>
          ) : (
            <span
              className={`tag ${connected ? "border-ok/30 bg-ok/10 text-ok" : "border-warn/30 bg-warn/10 text-warn"}`}
            >
              <span
                className={`size-1.5 rounded-full ${connected ? "bg-ok pulse-dot" : "bg-warn"}`}
              />
              {connected ? "streaming" : "connecting…"}
            </span>
          )}
        </span>
      </div>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="max-h-[520px] min-h-[240px] flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
        aria-label="Live attack results"
      >
        {isEmpty ? (
          <div className="grid h-56 place-items-center">
            <div className="text-center">
              <Terminal className="mx-auto size-8 text-dim" />
              <p className="mt-2 font-body text-sm text-dim">
                Waiting for attack results…
              </p>
            </div>
          </div>
        ) : (
          <div ref={listRef} className="space-y-3">
            {results.map((attack) => (
              <AttackCard key={keyOf(attack)} attack={attack} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
