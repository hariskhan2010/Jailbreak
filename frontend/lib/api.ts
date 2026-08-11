export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type RunStatus = "running" | "completed" | "failed";

export interface AttackResult {
  id?: string;
  run_id: string;
  category: string;
  topic: string;
  prompt: string;
  response: string;
  success: boolean;
  severity: Severity;
  confidence: number;
  reason: string;
  iteration: number;
  created_at?: string;
}

export interface RunSummary {
  id: string;
  target_name: string;
  target_model: string;
  status: RunStatus;
  total_attacks: number;
  successful_attacks: number;
  created_at?: string;
  completed_at?: string | null;
}

export interface Run extends RunSummary {
  categories: string[];
  topics: string[];
}

export interface CategoryMeta {
  description: string;
  templates?: string[];
}

export interface ConfigData {
  categories: Record<string, CategoryMeta>;
  agentic_categories: Record<string, CategoryMeta>;
  topics: string[];
  agentic_topics: string[];
  models: { gemini: string; glm: string };
}

export interface RunConfigPayload {
  target_type: string;
  target_model: string;
  login_url?: string;
  system_prompt?: string;
  categories: string[];
  topics: string[];
  max_iterations: number;
}

export interface SeverityBreakdown {
  LOW: number;
  MEDIUM: number;
  HIGH: number;
  CRITICAL: number;
}

export interface CategoryStat {
  total: number;
  success: number;
}

export interface TopVulnerability {
  severity: Severity;
  category: string;
  prompt: string;
  confidence: number;
  topic?: string;
  response?: string;
  reason?: string;
}

export interface ReportData {
  summary: {
    total_attacks: number;
    successful_attacks: number;
    success_rate: number;
    risk_score: number;
    risk_level: "NEGLIGIBLE" | "LOW" | "MEDIUM" | "HIGH";
  };
  severity_breakdown: SeverityBreakdown;
  category_stats: Record<string, CategoryStat>;
  top_vulnerabilities: TopVulnerability[];
  recommendations: string[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = (body as { detail?: string }).detail || detail;
    } catch {
      /* keep statusText */
    }
    throw new Error(detail);
  }
  return (await res.json()) as T;
}

export const api = {
  getConfig: () => request<ConfigData>("/api/config"),
  createRun: (payload: RunConfigPayload) =>
    request<{ run_id: string; status: string }>("/api/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
  listRuns: () => request<RunSummary[]>("/api/runs"),
  getRun: (runId: string) => request<Run>(`/api/runs/${runId}`),
  getRunResults: (runId: string) =>
    request<AttackResult[]>(`/api/runs/${runId}/attacks`),
  getReport: (runId: string) =>
    request<{ run_id: string; report: ReportData }>(`/api/runs/${runId}/report`),
  streamRun: (runId: string) =>
    new EventSource(`${API_URL}/api/runs/${runId}/stream`),
};

export const SEVERITY_STYLES: Record<
  Severity,
  { text: string; bg: string; bar: string; label: string }
> = {
  LOW: {
    text: "text-sky-400",
    bg: "bg-sky-400/10 border-sky-400/25",
    bar: "bg-sky-400",
    label: "text-sky-400",
  },
  MEDIUM: {
    text: "text-amber-300",
    bg: "bg-amber-300/10 border-amber-300/25",
    bar: "bg-amber-300",
    label: "text-amber-300",
  },
  HIGH: {
    text: "text-orange-400",
    bg: "bg-orange-400/10 border-orange-400/25",
    bar: "bg-orange-400",
    label: "text-orange-400",
  },
  CRITICAL: {
    text: "text-red-400",
    bg: "bg-red-400/10 border-red-400/25",
    bar: "bg-red-400",
    label: "text-red-400",
  },
};
