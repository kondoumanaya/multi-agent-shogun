import Panel from "@/components/panel";
import RuntimeClient from "@/app/agents/runtime/runtime-client";
import { readRuntimeConfig } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export default async function AgentRuntimePage() {
  const config = await readRuntimeConfig();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">モデル設定</h1>
        <p className="mt-2 text-sm text-slate-700">
          エージェントごとの `type / model / effort` を更新し、`switch_cli.sh` で反映します。
        </p>
      </header>

      <Panel title="Runtime Configuration" subtitle="PATCH /api/agents/:agentId/runtime を使用">
        <RuntimeClient initialAgents={config.cli.agents || {}} />
      </Panel>
    </div>
  );
}
