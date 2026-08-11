"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Rocket, Settings2, ChevronDown, ChevronUp } from "lucide-react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import { api, type ConfigData } from "@/lib/api";

const TARGET_TYPES = [
  { value: "gemini", label: "Gemini (target model)" },
  { value: "glm", label: "GLM (target model)" },
  { value: "agentic", label: "Agentic (tool-using GLM)" },
  { value: "weak-agentic", label: "Weak agentic (naive agent)" },
  { value: "web", label: "Web login (playwright auth)" },
];

export default function RunConfig() {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  const [cfg, setCfg] = useState<ConfigData | null>(null);
  const [loadError, setLoadError] = useState("");
  const [targetType, setTargetType] = useState("gemini");
  const [targetModel, setTargetModel] = useState("");
  const [loginUrl, setLoginUrl] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [maxIterations, setMaxIterations] = useState(100);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [advanced, setAdvanced] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    api
      .getConfig()
      .then((data) => {
        setCfg(data);
        setSelectedCats(Object.keys(data.categories));
        setSelectedTopics(data.topics);
        setTargetModel(data.models.gemini);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  const isAgentic = targetType === "agentic" || targetType === "weak-agentic";
  const allCats = useMemo(() => {
    if (!cfg) return {};
    return isAgentic
      ? { ...cfg.categories, ...cfg.agentic_categories }
      : cfg.categories;
  }, [cfg, isAgentic]);
  const topics = useMemo(
    () => (isAgentic && cfg ? cfg.agentic_topics : cfg?.topics ?? []),
    [cfg, isAgentic],
  );

  const toggle = useCallback(
    (list: string[], setList: (v: string[]) => void, item: string) => {
      setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);
    },
    [],
  );

  const canSubmit =
    cfg !== null &&
    selectedCats.length > 0 &&
    selectedTopics.length > 0 &&
    !busy &&
    (targetType !== "web" || loginUrl.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit) return;
    setBusy(true);
    setError("");
    try {
      const payload = {
        target_type: targetType,
        target_model: targetModel.trim() || cfg!.models.gemini,
        categories: selectedCats,
        topics: selectedTopics,
        max_iterations: Math.min(1000, Math.max(1, maxIterations || 100)),
        ...(targetType === "web" ? { login_url: loginUrl.trim() } : {}),
        ...(targetType === "glm" && systemPrompt.trim()
          ? { system_prompt: systemPrompt.trim() }
          : {}),
      };
      const res = await api.createRun(payload);
      router.push(`/runs/${res.run_id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start run");
      setBusy(false);
    }
  }

  if (loadError) {
    return (
      <div className="card p-6 text-sm text-danger">
        Could not reach the backend — is it running on{" "}
        <code className="text-gold">
          {process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}
        </code>
        ? ({loadError})
      </div>
    );
  }

  if (!cfg) {
    return (
      <div className="card flex items-center gap-3 p-6 text-sm text-dim">
        <Rocket className="size-4 animate-pulse" /> Loading configuration…
      </div>
    );
  }

  return (
    <div ref={ref} className="card card-glow p-6">
      <div className="mb-5 flex items-center gap-2.5">
        <Settings2 className="size-5 text-primary" />
        <h2 className="text-xl text-ink">Run configuration</h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="target-type">
            Target
          </label>
          <select
            id="target-type"
            className="input"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
          >
            {TARGET_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="target-model">
            Target model
          </label>
          <input
            id="target-model"
            className="input"
            value={targetModel}
            onChange={(e) => setTargetModel(e.target.value)}
            placeholder={targetType === "glm" ? cfg.models.glm : cfg.models.gemini}
          />
        </div>

        {targetType === "web" ? (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="login-url">
              Login URL
            </label>
            <input
              id="login-url"
              className="input"
              value={loginUrl}
              onChange={(e) => setLoginUrl(e.target.value)}
              placeholder="https://example.com/login"
            />
          </div>
        ) : null}

        {targetType === "glm" ? (
          <div className="sm:col-span-2">
            <label className="label" htmlFor="system-prompt">
              System prompt (optional)
            </label>
            <textarea
              id="system-prompt"
              className="input min-h-20 resize-y"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="You are a helpful assistant…"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Categories</label>
          <button
            type="button"
            className="text-xs font-medium text-gold/70 hover:text-gold"
            onClick={() => setAdvanced((v) => !v)}
          >
            {advanced ? (
              <ChevronUp className="inline size-4" />
            ) : (
              <ChevronDown className="inline size-4" />
            )}
            {advanced ? "collapse" : "details"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.keys(allCats).map((key) => {
            const checked = selectedCats.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(selectedCats, setSelectedCats, key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  checked
                    ? "border-primary/50 bg-primary/15 text-primary"
                    : "border-line bg-card-muted/40 text-dim hover:text-gold"
                }`}
              >
                {key}
              </button>
            );
          })}
        </div>
        {advanced ? (
          <p className="mt-2 text-xs leading-relaxed text-dim">
            {Object.entries(allCats)
              .map(([key, meta]) => `${key}: ${meta.description}`)
              .join(" · ")}
          </p>
        ) : null}
      </div>

      <div className="mt-5">
        <label className="label">Topics</label>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const checked = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                type="button"
                aria-pressed={checked}
                onClick={() => toggle(selectedTopics, setSelectedTopics, topic)}
                className={`max-w-full truncate rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                  checked
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-line bg-card-muted/40 text-dim hover:text-gold"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-44">
          <label className="label" htmlFor="max-iterations">
            Max iterations
          </label>
          <input
            id="max-iterations"
            type="number"
            min={1}
            max={1000}
            className="input"
            value={maxIterations}
            onChange={(e) => setMaxIterations(Number(e.target.value))}
          />
        </div>

        <button
          type="button"
          className="btn btn-primary min-h-11 px-6"
          onClick={handleSubmit}
          disabled={!canSubmit}
        >
          {busy ? (
            <Rocket className="size-4 animate-bounce" />
          ) : (
            <Play className="size-4" />
          )}
          {busy ? "Starting…" : "Start run"}
        </button>
      </div>

      {error ? (
        <p className="mt-4 rounded-lg border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
