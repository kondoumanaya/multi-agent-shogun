import Panel from "@/components/panel";
import { getDashboardData } from "@/lib/server/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">ダッシュボード</h1>
        <p className="mt-2 text-sm text-slate-700">`dashboard.md` の raw 表示とセクション分解です。</p>
      </header>

      <Panel title="Section View" subtitle={`sections: ${dashboard.sections.length}`}>
        <div className="space-y-4">
          {dashboard.sections.map((section) => (
            <article key={section.title} className="rounded-xl border border-[var(--line)] p-3">
              <h3 className="font-semibold">{section.title}</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm">{section.body || "(empty)"}</pre>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Raw dashboard.md">
        <pre className="shell-block max-h-[560px] whitespace-pre-wrap">{dashboard.raw || "(dashboard.md is empty)"}</pre>
      </Panel>
    </div>
  );
}
