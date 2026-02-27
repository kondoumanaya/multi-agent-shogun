import { EFFORT_VALUES } from "@/lib/constants";
import { runCommand } from "@/lib/server/command";
import { PATHS, PROJECT_ROOT } from "@/lib/server/paths";
import type { AgentRuntime, RuntimeConfig } from "@/lib/server/types";
import { readYamlFile, writeYamlFile } from "@/lib/server/yaml";

function normalizeRuntime(runtime: Partial<AgentRuntime> | undefined): AgentRuntime {
  return {
    type: runtime?.type || "codex",
    model: runtime?.model || "",
    effort: EFFORT_VALUES.includes((runtime?.effort || "auto").toLowerCase() as (typeof EFFORT_VALUES)[number])
      ? ((runtime?.effort || "auto").toLowerCase() as AgentRuntime["effort"])
      : "auto"
  };
}

export async function readRuntimeConfig(): Promise<RuntimeConfig> {
  const config = await readYamlFile<RuntimeConfig>(PATHS.settings, {
    cli: {
      default: "codex",
      agents: {}
    }
  });

  if (!config.cli) {
    config.cli = { default: "codex", agents: {} };
  }
  if (!config.cli.agents) {
    config.cli.agents = {};
  }

  for (const [agentId, runtime] of Object.entries(config.cli.agents)) {
    config.cli.agents[agentId] = normalizeRuntime(runtime);
  }

  return config;
}

export async function updateAgentRuntime(
  agentId: string,
  patch: Partial<AgentRuntime>
): Promise<{ config: RuntimeConfig; runtime: AgentRuntime }> {
  const config = await readRuntimeConfig();

  const current = normalizeRuntime(config.cli.agents?.[agentId]);
  const next = normalizeRuntime({
    type: patch.type ?? current.type,
    model: patch.model ?? current.model,
    effort: patch.effort ?? current.effort
  });

  if (!config.cli.agents) {
    config.cli.agents = {};
  }
  config.cli.agents[agentId] = next;

  await writeYamlFile(PATHS.settings, config);

  return {
    config,
    runtime: next
  };
}

export async function applyRuntimeToPane(
  agentId: string,
  patch: Partial<AgentRuntime>
): Promise<{ code: number; stdout: string; stderr: string }> {
  const args = [PATHS.switchCliScript, agentId];
  if (patch.type) {
    args.push("--type", patch.type);
  }
  if (patch.model) {
    args.push("--model", patch.model);
  }
  if (patch.effort) {
    args.push("--effort", patch.effort);
  }

  const result = await runCommand("bash", args, { cwd: PROJECT_ROOT, timeoutMs: 40000 });
  return {
    code: result.code,
    stdout: result.stdout.trim(),
    stderr: result.stderr.trim()
  };
}
