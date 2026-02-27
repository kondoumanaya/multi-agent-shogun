import Panel from "@/components/panel";
import SystemClient from "@/app/system/system-client";

export const dynamic = "force-dynamic";

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">システム操作</h1>
        <p className="mt-2 text-sm text-slate-700">
          localhost 制約、tmux 可用性、出陣再実行を管理します。
        </p>
      </header>

      <Panel title="Operations" subtitle="POST /api/system/shutsujin, GET /api/health">
        <SystemClient />
      </Panel>
    </div>
  );
}
