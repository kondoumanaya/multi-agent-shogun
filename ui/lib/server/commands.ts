import { PATHS, PROJECT_ROOT } from "@/lib/server/paths";
import type { ShogunCommand, ShogunCommandsFile } from "@/lib/server/types";
import { readYamlFile, writeYamlFile } from "@/lib/server/yaml";
import { runCommand, sanitizeMultiline } from "@/lib/server/command";

type NewCommandInput = {
  purpose: string;
  acceptanceCriteria: string[];
  command: string;
  project: string;
  priority: string;
};

function generateCommandId(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  const id = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `cmd_${id}`;
}

export async function listCommands(): Promise<ShogunCommand[]> {
  const data = await readYamlFile<ShogunCommandsFile>(PATHS.commands, { commands: [] });
  const commands = Array.isArray(data.commands) ? data.commands : [];
  return commands.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export async function appendShogunCommand(input: NewCommandInput) {
  const commands = await listCommands();

  const id = generateCommandId();
  const timestamp = new Date().toISOString();
  const entry: ShogunCommand = {
    id,
    timestamp,
    purpose: input.purpose.trim(),
    acceptance_criteria: input.acceptanceCriteria,
    command: sanitizeMultiline(input.command),
    project: input.project.trim(),
    priority: input.priority.trim() || "medium",
    status: "pending"
  };

  const merged = [entry, ...commands];
  await writeYamlFile(PATHS.commands, { commands: merged });

  const notify = await runCommand(
    "bash",
    [
      PATHS.inboxScript,
      "karo",
      `${id}を書いた。実行せよ。`,
      "cmd_new",
      "shogun"
    ],
    { cwd: PROJECT_ROOT }
  );

  return {
    command: entry,
    inboxNotification: {
      code: notify.code,
      stdout: notify.stdout.trim(),
      stderr: notify.stderr.trim()
    }
  };
}
