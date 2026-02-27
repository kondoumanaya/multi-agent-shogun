"use client";

import { useEffect, useState } from "react";
import { fetchJson, formatDateTime } from "@/lib/client";

type Health = {
  timestamp: string;
  localhostOnly: boolean;
  isLocalhostRequest: boolean;
  host: string;
  tmuxAvailable: boolean;
};

export default function SystemClient() {
  const [health, setHealth] = useState<Health | null>(null);
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [launching, setLaunching] = useState(false);

  const loadHealth = async () => {
    try {
      const data = await fetchJson<Health>("/api/health");
      setHealth(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load health");
    }
  };

  useEffect(() => {
    void loadHealth();
  }, []);

  const launch = async () => {
    try {
      setLaunching(true);
      setMessage("");

      const response = await fetchJson<{ ok: boolean; launchedAt: string }>("/api/system/shutsujin", {
        method: "POST",
        body: JSON.stringify({ confirm })
      });

      setMessage(`出陣を起動しました: ${formatDateTime(response.launchedAt)}`);
      setConfirm("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to start shutsujin_departure.sh");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-[var(--line)] p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Health</h3>
          <button
            type="button"
            className="rounded-lg border border-[var(--line)] px-3 py-1 text-sm"
            onClick={() => void loadHealth()}
          >
            再取得
          </button>
        </div>

        {health ? (
          <dl className="grid gap-2 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-600">Time</dt>
              <dd>{formatDateTime(health.timestamp)}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-600">Host</dt>
              <dd>{health.host}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-600">Localhost Constraint</dt>
              <dd>{health.localhostOnly ? "enabled" : "disabled"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.12em] text-slate-600">tmux</dt>
              <dd>{health.tmuxAvailable ? "available" : "unavailable"}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate-600">読み込み中...</p>
        )}
      </section>

      <section className="rounded-xl border border-[var(--line)] p-4">
        <h3 className="mb-2 text-lg font-semibold">出陣再実行</h3>
        <p className="mb-3 text-sm text-slate-700">
          実行には確認文字列 `SHUTSUJIN` が必要です。誤操作防止のため不足時は API が拒否します。
        </p>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <input
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="SHUTSUJIN"
            className="w-full rounded-md border border-[var(--line)] bg-white/85 px-3 py-2 md:max-w-xs"
          />
          <button
            type="button"
            onClick={launch}
            disabled={launching}
            className="w-fit rounded-lg border border-[var(--warning)] bg-[var(--warning)] px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {launching ? "起動中..." : "shutsujin_departure.sh 実行"}
          </button>
        </div>
      </section>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </div>
  );
}
