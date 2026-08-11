import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import type { RunStatus } from "@/lib/api";

const STYLES: Record<
  RunStatus,
  { dot: string; text: string; border: string }
> = {
  running: {
    dot: "size-2 rounded-full bg-ok pulse-dot",
    text: "text-ok",
    border: "border-ok/30 bg-ok/10",
  },
  completed: {
    dot: "text-ok",
    text: "text-ok",
    border: "border-ok/30 bg-ok/10",
  },
  failed: {
    dot: "text-danger",
    text: "text-danger",
    border: "border-danger/30 bg-danger/10",
  },
};

export default function StatusBadge({ status }: { status: RunStatus }) {
  const s = STYLES[status];
  const icon =
    status === "running" ? (
      <Loader2 className="size-3.5 animate-spin" />
    ) : status === "completed" ? (
      <CheckCircle2 className="size-3.5" />
    ) : (
      <XCircle className="size-3.5" />
    );

  return (
    <span
      className={`tag uppercase ${s.border} ${s.text}`}
      title={`status: ${status}`}
    >
      {status === "running" ? <span className={s.dot} /> : icon}
      {status}
    </span>
  );
}
