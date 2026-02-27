"use client";

import { useState } from "react";
import { fetchJson, formatDateTime } from "@/lib/client";

type CommandItem = {
  id: string;
  timestamp: string;
  purpose: string;
  acceptance_criteria: string[];
  command: string;
  project: string;
  priority: string;
  status: string;
};

type CommandsClientProps = {
  initialCommands: CommandItem[];
};

const emptyForm = {
  purpose: "",
  acceptance: "",
  command: "",
  project: "multi-agent-shogun",
  priority: "high"
};

export default function CommandsClient({ initialCommands }: CommandsClientProps) {
  const [commands, setCommands] = useState(initialCommands);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async () => {
    try {
      setSubmitting(true);
      setMessage("");

      const acceptanceCriteria = form.acceptance
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);

      const result = await fetchJson<{
        command: CommandItem;
        inboxNotification: { code: number; stdout: string; stderr: string };
      }>("/api/commands/shogun", {
        method: "POST",
        body: JSON.stringify({
          purpose: form.purpose,
          acceptance_criteria: acceptanceCriteria,
          command: form.command,
          project: form.project,
          priority: form.priority
        })
      });

      setCommands((current) => [result.command, ...current]);
      setForm(emptyForm);
      if (result.inboxNotification.code === 0) {
        setMessage(`作成完了: ${result.command.id}`);
      } else {
        setMessage(`作成済み。inbox通知で警告: ${result.inboxNotification.stderr || "unknown"}`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to create command");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--line)] p-4">
        <h3 className="mb-3 text-lg font-semibold">新規コマンド投入</h3>

        <div className="grid gap-3">
          <label className="text-sm">
            <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Purpose</div>
            <input
              value={form.purpose}
              onChange={(event) => setForm((current) => ({ ...current, purpose: event.target.value }))}
              className="w-full rounded-md border border-[var(--line)] bg-white/85 px-2 py-1"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Acceptance Criteria (1 line = 1 item)</div>
            <textarea
              value={form.acceptance}
              onChange={(event) => setForm((current) => ({ ...current, acceptance: event.target.value }))}
              rows={4}
              className="w-full rounded-md border border-[var(--line)] bg-white/85 px-2 py-1"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Command</div>
            <textarea
              value={form.command}
              onChange={(event) => setForm((current) => ({ ...current, command: event.target.value }))}
              rows={6}
              className="w-full rounded-md border border-[var(--line)] bg-white/85 px-2 py-1"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Project</div>
              <input
                value={form.project}
                onChange={(event) => setForm((current) => ({ ...current, project: event.target.value }))}
                className="w-full rounded-md border border-[var(--line)] bg-white/85 px-2 py-1"
              />
            </label>

            <label className="text-sm">
              <div className="mb-1 text-xs uppercase tracking-[0.12em] text-slate-600">Priority</div>
              <select
                value={form.priority}
                onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))}
                className="w-full rounded-md border border-[var(--line)] bg-white/85 px-2 py-1"
              >
                <option value="high">high</option>
                <option value="medium">medium</option>
                <option value="low">low</option>
              </select>
            </label>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={submitting}
            className="w-fit rounded-lg border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {submitting ? "投入中..." : "コマンド投入"}
          </button>

          {message ? <p className="text-sm text-slate-700">{message}</p> : null}
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold">現在コマンド</h3>
        {commands.map((command) => (
          <article key={command.id} className="rounded-xl border border-[var(--line)] p-3">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="badge text-[var(--accent)]">{command.id}</span>
              <span className="badge text-slate-700">{command.status}</span>
              <span className="badge text-slate-700">{command.priority}</span>
              <span className="badge text-slate-700">{formatDateTime(command.timestamp)}</span>
            </div>
            <p className="text-sm font-medium">{command.purpose}</p>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-slate-700">{command.command}</pre>
          </article>
        ))}
      </section>
    </div>
  );
}
