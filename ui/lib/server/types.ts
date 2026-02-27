import type { EffortValue } from "@/lib/constants";

export type ShogunCommand = {
  id: string;
  timestamp: string;
  purpose: string;
  acceptance_criteria: string[];
  command: string;
  project: string;
  priority: string;
  status: string;
};

export type ShogunCommandsFile = {
  commands: ShogunCommand[];
};

export type InboxMessage = {
  id?: string;
  timestamp?: string;
  type?: string;
  from?: string;
  message?: string;
  read?: boolean;
};

export type InboxFile = {
  messages: InboxMessage[];
};

export type AgentTask = {
  task_id: string | null;
  parent_cmd: string | null;
  description: string | null;
  target_path: string | null;
  status: string;
  timestamp: string;
};

export type AgentTaskFile = {
  task: AgentTask;
};

export type AgentRuntime = {
  type: string;
  model: string;
  effort: EffortValue;
};

export type RuntimeConfig = {
  cli: {
    default?: string;
    agents?: Record<string, AgentRuntime>;
  };
};
