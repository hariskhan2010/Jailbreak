"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { api, type ReportData } from "@/lib/api";
import VulnReport from "@/components/VulnReport";

export default function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [report, setReport] = useState<ReportData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    api
      .getReport(id)
      .then((res) => setReport(res.report))
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load report"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="card grid min-h-64 place-items-center p-6 text-center">
        <div>
          <FileText className="mx-auto size-8 text-danger" />
          <p className="mt-2 font-body text-sm text-danger">{error}</p>
          <Link href={`/runs/${id}`} className="btn btn-ghost mt-4">
            <ArrowLeft className="size-4" /> Back to run
          </Link>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-dim">
        <Loader2 className="size-4 animate-spin" /> Generating report…
      </div>
    );
  }

  return <VulnReport report={report} runId={id} />;
}
