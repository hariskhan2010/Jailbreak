"use client";

import { AlertTriangle, CheckCircle2, Download, FileDown, Printer } from "lucide-react";
import type { ReportData, Severity } from "@/lib/api";
import { SEVERITY_STYLES } from "@/lib/api";
import { clampText } from "@/lib/format";
import CategoryChart from "./CategoryChart";

function downloadMarkdown(report: ReportData, runId: string) {
  const s = report.summary;
  const lines: string[] = [];
  lines.push(`# Vulnerability Report — Run ${runId.slice(0, 8)}`);
  lines.push("");
  lines.push(`- **Total attacks:** ${s.total_attacks}`);
  lines.push(`- **Successful:** ${s.successful_attacks}`);
  lines.push(`- **Success rate:** ${s.success_rate}%`);
  lines.push(`- **Risk score:** ${s.risk_score} / 100 — **${s.risk_level}**`);
  lines.push("");
  lines.push("## Severity breakdown");
  lines.push("");
  for (const [sev, count] of Object.entries(report.severity_breakdown)) {
    lines.push(`- **${sev}:** ${count}`);
  }
  lines.push("");
  lines.push("## Category heatmap");
  lines.push("");
  for (const [cat, st] of Object.entries(report.category_stats)) {
    lines.push(`- ${cat}: ${st.success}/${st.total} (${Math.round((st.success / Math.max(1, st.total)) * 100)}%)`);
  }
  lines.push("");
  lines.push("## Top vulnerabilities");
  lines.push("");
  for (let i = 0; i < report.top_vulnerabilities.length; i++) {
    const v = report.top_vulnerabilities[i];
    lines.push(`${i + 1}. **[${v.severity}] ${v.category}** — ${Math.round(v.confidence * 100)}% confidence`);
    lines.push(`   \`${v.prompt}\``);
  }
  lines.push("");
  lines.push("## Recommendations");
  lines.push("");
  for (const r of report.recommendations) {
    lines.push(`- ${r}`);
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `report-${runId.slice(0, 8)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

const RISK_COLOR: Record<string, string> = {
  NEGLIGIBLE: "text-dim",
  LOW: "text-sky-400",
  MEDIUM: "text-warn",
  HIGH: "text-danger",
};

export default function VulnReport({
  report,
  runId,
}: {
  report: ReportData;
  runId: string;
}) {
  const s = report.summary;
  const severities = Object.entries(report.severity_breakdown) as [
    Severity,
    number,
  ][];
  const maxSeverity = Math.max(1, ...severities.map(([, n]) => n));

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl text-ink">Vulnerability report</h1>
        <div className="flex gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
            <Printer className="size-4" /> PDF
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => downloadMarkdown(report, runId)}
          >
            <FileDown className="size-4" /> Markdown
          </button>
        </div>
      </div>

      <section className="card card-glow p-6">
        <h2 className="mb-4 text-lg text-ink">Executive summary</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
              Total attacks
            </div>
            <div className="mt-1 font-display text-3xl font-bold text-ink">
              {s.total_attacks}
            </div>
          </div>
          <div>
            <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
              Successful
            </div>
            <div className="mt-1 flex items-center gap-2 font-display text-3xl font-bold text-ok">
              {s.successful_attacks}
              <CheckCircle2 className="size-5" />
            </div>
          </div>
          <div>
            <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
              Success rate
            </div>
            <div className="mt-1 font-display text-3xl font-bold text-ink">
              {s.success_rate}%
            </div>
          </div>
          <div>
            <div className="font-body text-[11px] font-semibold uppercase tracking-widest text-gold">
              Risk
            </div>
            <div className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
              <AlertTriangle
                className={`size-6 ${RISK_COLOR[s.risk_level] ?? "text-ink"}`}
              />
              <span className={RISK_COLOR[s.risk_level] ?? "text-ink"}>
                {s.risk_level}
              </span>
            </div>
            <div className="mt-1 font-body text-xs text-dim">
              {s.risk_score} / 100
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg text-ink">Severity breakdown</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {severities.map(([sev, count]) => {
            const st = SEVERITY_STYLES[sev];
            return (
              <div key={sev} className="rounded-xl border border-line bg-bg-deep/50 p-4">
                <div className="flex items-center justify-between">
                  <span className={`font-body text-xs font-bold ${st.text}`}>
                    {sev}
                  </span>
                  <span className="font-display text-2xl font-bold text-ink">
                    {count}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-card-muted">
                  <div
                    className={`h-full rounded-full ${st.bar}`}
                    style={{ width: `${(count / maxSeverity) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card p-6">
        <CategoryChart stats={report.category_stats} />
      </section>

      <section className="card overflow-hidden">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-lg text-ink">Top vulnerabilities</h2>
        </div>
        {report.top_vulnerabilities.length === 0 ? (
          <p className="p-6 text-sm text-dim">
            No successful jailbreaks were detected in this run.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body text-sm">
              <thead>
                <tr className="border-b border-line text-[11px] uppercase tracking-widest text-gold">
                  <th className="px-6 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Prompt</th>
                  <th className="px-6 py-3 text-right font-semibold">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {report.top_vulnerabilities.map((v, i) => {
                  const st = SEVERITY_STYLES[v.severity];
                  return (
                    <tr
                      key={`${v.prompt}-${i}`}
                      className="border-b border-line last:border-0 hover:bg-card-muted/40"
                    >
                      <td className="px-6 py-3 text-dim">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className={`tag ${st.bg} ${st.text}`}>
                          {v.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gold">{v.category}</td>
                      <td className="max-w-md px-4 py-3 text-ink/80">
                        <span title={v.prompt}>{clampText(v.prompt, 80)}</span>
                      </td>
                      <td className="px-6 py-3 text-right text-ink">
                        {Math.round(v.confidence * 100)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg text-ink">Recommendations</h2>
        {report.recommendations.length === 0 ? (
          <p className="text-sm text-dim">No recommendations.</p>
        ) : (
          <ul className="space-y-3">
            {report.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3">
                <Download className="mt-0.5 size-4 shrink-0 rotate-90 text-primary" />
                <span className="font-body text-sm leading-relaxed text-ink/90">
                  {rec}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
