"use client";

import { useState } from "react";
import { EFFORT_VALUES } from "@/lib/constants";
import { fetchJson } from "@/lib/client";

type AgentRuntime = {
  type: string;
  model: string;
  effort: "auto" | "low" | "medium" | "high";
};

type RuntimeClientProps = {
  initialAgents: Record<string, AgentRuntime>;
};

export default function RuntimeClient({ initialAgents }: RuntimeClientProps) {
  const [agents, setAgents] = useState(initialAgents);
  const [savingAgent, setSavingAgent] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  const updateField = (agentId: string, field: keyof AgentRuntime, value: string) => {
    setAgents((current) => ({
      ...current,
      [agentId]: {
        ...current[agentId],
        [field]: value
      }
    }));
  };

  const apply = async (agentId: string) => {
    try {
      setSavingAgent(agentId);
      setMessage("");

      const payload = agents[agentId];
      const result = await fetchJson<{
        runtime: AgentRuntime;
        restart: boolean;
        switchResult: { code: number; stdout: string; stderr: string } | null;
      }>(`/api/agents/${agentId}/runtime`, {
        method: "PATCH",
        body: JSON.stringify({ ...payload, restart: true })
      });

      setAgents((current) => ({
        ...current,
        [agentId]: result.runtime
      }));

      if (result.switchResult && result.switchResult.code !== 0) {
        setMessage(`[${agentId}] switch_cli failed: ${result.switchResult.stderr || "unknown error"}`);
      } else {
        setMessage(`[${agentId}] applied`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to apply runtime");
    } finally {
      setSavingAgent(null);
    }
  };

  const entries = Object.entries(agents);

  return (
    <div className="space-y-4">
      {entries.map(([agentId, runtime]) => (
        <article key={agentId} className="rounded-xl border border-[var(--line)] p-3 md:p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">{agentId}</h3>
            <button
              type="button"
              disabled={savingAgent === agentId}
              className="rounded-lg border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] disabled:opacity-60"
              onClick={() => apply(agentId)}
            >
              {savingAgent === agentId ? "適用中..." : "適用 + 再起動"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <label className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Type</div>
              <input
                value={runtime.type}
                onChange={(event) => updateField(agentId, "type", event.target.value)}
                className="w-full rounded-md border border-[var(--line)] bg-white/80 px-2 py-1"
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Model</div>
              <input
                value={runtime.model}
                onChange={(event) => updateField(agentId, "model", event.target.value)}
                className="w-full rounded-md border border-[var(--line)] bg-white/80 px-2 py-1"
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Effort</div>
              <select
                value={runtime.effort}
                onChange={(event) => updateField(agentId, "effort", event.target.value)}
                className="w-full rounded-md border border-[var(--line)] bg-white/80 px-2 py-1"
              >
                {EFFORT_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </article>
      ))}

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
