import Panel from "@/components/panel";
import CommandsClient from "@/app/commands/commands-client";
import { listCommands } from "@/lib/server/commands";

export const dynamic = "force-dynamic";

export default async function CommandsPage() {
  const commands = await listCommands();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">指示投入</h1>
        <p className="mt-2 text-sm text-slate-700">
          `shogun_to_karo.yaml` へ cmd を追記し、`inbox_write.sh` で家老へ通知します。
        </p>
      </header>

      <Panel title="Command Queue" subtitle="GET/POST /api/commands/shogun">
        <CommandsClient initialCommands={commands} />
      </Panel>
    </div>
  );
}
