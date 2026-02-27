import { TASK_AGENT_IDS } from "@/lib/constants";
import { getDashboardData } from "@/lib/server/dashboard";
import { PATHS, resolveTaskPath } from "@/lib/server/paths";
import type {
  AgentTask,
  AgentTaskFile,
  InboxFile,
  RuntimeConfig,
  ShogunCommand,
  ShogunCommandsFile
} from "@/lib/server/types";
import { readYamlFile } from "@/lib/server/yaml";

export async function getShogunCommands(): Promise<ShogunCommand[]> {
  const data = await readYamlFile<ShogunCommandsFile>(PATHS.commands, { commands: [] });
  return Array.isArray(data.commands) ? data.commands : [];
}

export async function getKaroInbox(): Promise<InboxFile> {
  const inbox = await readYamlFile<InboxFile>(PATHS.inboxKaro, { messages: [] });
  return {
    messages: Array.isArray(inbox.messages) ? inbox.messages : []
  };
}

export async function getTaskStateByAgent(): Promise<Record<string, AgentTask>> {
  const output: Record<string, AgentTask> = {};
  for (const agentId of TASK_AGENT_IDS) {
    const taskFile = await readYamlFile<AgentTaskFile>(resolveTaskPath(agentId), {
      task: {
        task_id: null,
        parent_cmd: null,
        description: null,
        target_path: null,
        status: "idle",
        timestamp: ""
      }
    });
    output[agentId] = taskFile.task;
  }
  return output;
}

export async function getRuntimeConfig(): Promise<RuntimeConfig> {
  const data = await readYamlFile<RuntimeConfig>(PATHS.settings, {
    cli: {
      default: "codex",
      agents: {}
    }
  });

  if (!data.cli) {
    data.cli = { default: "codex", agents: {} };
  }
  if (!data.cli.agents) {
    data.cli.agents = {};
  }

  return data;
}

function isBusyStatus(status: string): boolean {
  const normalized = String(status || "").toLowerCase();
  return normalized !== "idle" && normalized !== "done" && normalized !== "failed";
}

function isPendingCommand(status: string): boolean {
  const normalized = String(status || "").toLowerCase();
  return normalized === "pending" || normalized === "assigned" || normalized === "in_progress";
}

export async function getOverview() {
  const [commands, tasks, dashboard, runtime] = await Promise.all([
    getShogunCommands(),
    getTaskStateByAgent(),
    getDashboardData(),
    getRuntimeConfig()
  ]);

  const pendingCommands = commands.filter((cmd) => isPendingCommand(cmd.status));
  const doneCommands = commands.filter((cmd) => String(cmd.status).toLowerCase() === "done");
  const failedCommands = commands.filter((cmd) => String(cmd.status).toLowerCase() === "failed");

  const busyAgents = Object.entries(tasks)
    .filter(([, task]) => isBusyStatus(task.status))
    .map(([agentId]) => agentId);

  return {
    timestamp: new Date().toISOString(),
    sidebar: {
      dashboardUrgentCount: dashboard.urgentCount,
      commandsPendingCount: pendingCommands.length,
      busyAgentsCount: busyAgents.length
    },
    commands: {
      total: commands.length,
      pending: pendingCommands.length,
      done: doneCommands.length,
      failed: failedCommands.length,
      latest: commands[0] ?? null
    },
    agents: {
      busy: busyAgents,
      tasks
    },
    runtime: runtime.cli
  };
}
