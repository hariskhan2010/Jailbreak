"use client";

import { useState } from "react";
import { ShieldAlert, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { SEVERITY_STYLES, type AttackResult } from "@/lib/api";
import { clampText } from "@/lib/format";

export default function AttackCard({ attack }: { attack: AttackResult }) {
  const [open, setOpen] = useState(false);
  const s = SEVERITY_STYLES[attack.severity];
  const success = Boolean(attack.success);

  return (
    <div
      className={`card press3d overflow-hidden ${
        success ? "border-ok/35" : ""
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <span className={`tag uppercase ${s.bg} ${s.text}`}>{attack.severity}</span>
        <span className="font-body text-xs font-semibold text-gold">
          {attack.category}
        </span>
        <span className="hidden truncate font-body text-xs text-dim sm:inline">
          · {attack.topic}
        </span>

        <span className="ml-auto flex items-center gap-2">
          {success ? (
            <span className="tag border-ok/30 bg-ok/10 text-ok">
              <ShieldAlert className="size-3.5" /> jailbreak
            </span>
          ) : (
            <span className="tag border-line bg-card-muted/50 text-dim">
              <ShieldCheck className="size-3.5" /> blocked
            </span>
          )}
          {attack.confidence > 0 ? (
            <span className="font-body text-xs text-dim">
              {Math.round(attack.confidence * 100)}%
            </span>
          ) : null}
          <button
            type="button"
            aria-label={open ? "Collapse attack" : "Expand attack"}
            onClick={() => setOpen((v) => !v)}
            className="rounded-lg p-1 text-dim hover:bg-card-muted hover:text-gold"
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </span>
      </div>

      <div className="border-t border-line px-4 py-3">
        <p className="font-body text-sm leading-relaxed text-ink/90">
          <span className="font-semibold text-gold">prompt: </span>
          {open ? attack.prompt : clampText(attack.prompt, 220)}
        </p>
        {open ? (
          <div className="mt-3 space-y-3">
            {attack.response ? (
              <div>
                <p className="mb-1 font-body text-xs font-semibold text-gold">
                  response
                </p>
                <p className="rounded-lg bg-bg-deep/70 p-3 font-body text-sm leading-relaxed text-ink/80">
                  {attack.response}
                </p>
              </div>
            ) : null}
            {attack.reason ? (
              <div>
                <p className="mb-1 font-body text-xs font-semibold text-gold">
                  reason
                </p>
                <p className="rounded-lg bg-bg-deep/70 p-3 font-body text-sm leading-relaxed text-ink/80">
                  {attack.reason}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
