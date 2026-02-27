import Panel from "@/components/panel";
import { getPaneSnapshots } from "@/lib/server/tmux";

export const dynamic = "force-dynamic";

function labelPane(session: string, pane: number, agentId: string): string {
  if (agentId) {
    return `${agentId}`;
  }
  return `${session}.${pane}`;
}

export default async function TmuxPage() {
  const panes = await getPaneSnapshots(30);
  const shogunPane = panes.find((pane) => pane.session === "shogun");
  const multiagentPanes = panes.filter((pane) => pane.session === "multiagent");

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">tmux監視</h1>
        <p className="mt-2 text-sm text-slate-700">shogun と multiagent(3x3) の pane tail 30行を表示します。</p>
      </header>

      <Panel title="Shogun Session">
        {shogunPane ? (
          <article className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="badge text-slate-700">target: {shogunPane.target}</span>
              <span className="badge text-slate-700">cmd: {shogunPane.currentCommand || "-"}</span>
              <span className="badge text-slate-700">title: {shogunPane.title || "-"}</span>
            </div>
            <pre className="shell-block max-h-[360px]">{shogunPane.tail || "(no output)"}</pre>
          </article>
        ) : (
          <p className="text-sm text-slate-600">shogun session pane が見つかりません。</p>
        )}
      </Panel>

      <Panel title="Multiagent 3x3 Grid">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {multiagentPanes.map((pane) => (
            <article key={pane.target} className="rounded-xl border border-[var(--line)] p-3">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="badge text-[var(--accent)]">{labelPane(pane.session, pane.pane, pane.agentId)}</span>
                <span className="badge text-slate-700">{pane.target}</span>
              </div>
              <pre className="shell-block h-[220px]">{pane.tail || "(no output)"}</pre>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}
