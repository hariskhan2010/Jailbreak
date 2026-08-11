"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}

export default function StatCard({ label, value, sub, accent }: StatCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", delay: 0.1 },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={ref}
      className={`card card-glow press3d relative overflow-hidden p-5 ${
        accent ? "border-primary/30" : ""
      }`}
    >
      <div className="font-body text-[11px] font-semibold uppercase tracking-[0.12em] text-gold">
        {label}
      </div>
      <div
        className={`mt-2 font-display text-4xl font-bold leading-none ${
          accent ? "text-primary" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sub ? (
        <div className="mt-2 font-body text-xs text-dim">{sub}</div>
      ) : null}
    </div>
  );
}
