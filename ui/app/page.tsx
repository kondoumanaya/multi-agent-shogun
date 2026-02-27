import Link from "next/link";
import Panel from "@/components/panel";
import StatCard from "@/components/stat-card";
import { getDashboardData } from "@/lib/server/dashboard";
import { getOverview } from "@/lib/server/state";

function toLocal(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export const dynamic = "force-dynamic";

export default async function CommandCenterPage() {
  const [overview, dashboard] = await Promise.all([getOverview(), getDashboardData()]);
  const latest = overview.commands.latest;
  const actionSection = dashboard.sections.find((section) => /要対応|action required/i.test(section.title));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">指揮センター</h1>
        <p className="mt-2 text-sm text-slate-700">全体状態と直近コマンドを集約表示します。</p>
      </header>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Pending Commands" value={overview.commands.pending} tone="accent" />
        <StatCard label="Busy Agents" value={overview.sidebar.busyAgentsCount} tone="accent" />
        <StatCard label="Urgent Items" value={overview.sidebar.dashboardUrgentCount} tone="danger" />
        <StatCard label="Done Commands" value={overview.commands.done} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Panel title="最新コマンド" subtitle="shogun_to_karo の先頭エントリ">
          {latest ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">ID</div>
                <div className="font-mono">{latest.id}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Purpose</div>
                <div>{latest.purpose}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="badge text-[var(--accent)]">status: {latest.status}</span>
                <span className="badge text-slate-600">priority: {latest.priority}</span>
                <span className="badge text-slate-600">{toLocal(latest.timestamp)}</span>
              </div>
              <Link className="text-sm text-[var(--accent)] underline" href="/commands">
                指示投入ページを開く
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-600">コマンドがありません。</p>
          )}
        </Panel>

        <Panel title="🚨 要対応抜粋" subtitle="dashboard.md の要対応セクション">
          {actionSection?.body ? (
            <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap text-sm">{actionSection.body}</pre>
          ) : (
            <p className="text-sm text-slate-600">要対応セクションは見つかりませんでした。</p>
          )}
          <div className="mt-4">
            <Link className="text-sm text-[var(--accent)] underline" href="/dashboard">
              ダッシュボード詳細へ
            </Link>
          </div>
        </Panel>
      </section>
    </div>
  );
}
