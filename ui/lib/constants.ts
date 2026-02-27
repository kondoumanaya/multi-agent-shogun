export const AGENT_IDS = [
  "shogun",
  "karo",
  "gunshi",
  "ashigaru1",
  "ashigaru2",
  "ashigaru3",
  "ashigaru4",
  "ashigaru5",
  "ashigaru6",
  "ashigaru7"
] as const;

export type AgentId = (typeof AGENT_IDS)[number];

export const TASK_AGENT_IDS = [
  "gunshi",
  "ashigaru1",
  "ashigaru2",
  "ashigaru3",
  "ashigaru4",
  "ashigaru5",
  "ashigaru6",
  "ashigaru7"
] as const;

export const EFFORT_VALUES = ["auto", "low", "medium", "high"] as const;
export type EffortValue = (typeof EFFORT_VALUES)[number];

export const PRIORITY_VALUES = ["high", "medium", "low"] as const;
