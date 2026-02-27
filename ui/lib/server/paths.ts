import path from "node:path";

export const UI_ROOT = process.cwd();
export const PROJECT_ROOT = process.env.SHOGUN_ROOT
  ? path.resolve(process.env.SHOGUN_ROOT)
  : path.resolve(UI_ROOT, "..");

export const PATHS = {
  dashboard: path.join(PROJECT_ROOT, "dashboard.md"),
  settings: path.join(PROJECT_ROOT, "config", "settings.yaml"),
  commands: path.join(PROJECT_ROOT, "queue", "shogun_to_karo.yaml"),
  inboxKaro: path.join(PROJECT_ROOT, "queue", "inbox", "karo.yaml"),
  ntfyInbox: path.join(PROJECT_ROOT, "queue", "ntfy_inbox.yaml"),
  tasksDir: path.join(PROJECT_ROOT, "queue", "tasks"),
  reportsDir: path.join(PROJECT_ROOT, "queue", "reports"),
  inboxScript: path.join(PROJECT_ROOT, "scripts", "inbox_write.sh"),
  switchCliScript: path.join(PROJECT_ROOT, "scripts", "switch_cli.sh"),
  shutsujinScript: path.join(PROJECT_ROOT, "shutsujin_departure.sh")
};

export function resolveTaskPath(agentId: string): string {
  return path.join(PATHS.tasksDir, `${agentId}.yaml`);
}

export function resolveReportPath(agentId: string): string {
  return path.join(PATHS.reportsDir, `${agentId}_report.yaml`);
}
