import { runCommand } from "@/lib/server/command";
import { PROJECT_ROOT } from "@/lib/server/paths";

export type PaneSnapshot = {
  session: string;
  window: number;
  pane: number;
  paneId: string;
  target: string;
  agentId: string;
  title: string;
  currentCommand: string;
  tail: string;
};

function parseLine(line: string): Omit<PaneSnapshot, "tail" | "target"> | null {
  const [session, windowText, paneText, paneId, currentCommand, title, agentId] = line.split("|");
  if (!session || windowText === undefined || paneText === undefined || !paneId) {
    return null;
  }

  const window = Number.parseInt(windowText, 10);
  const pane = Number.parseInt(paneText, 10);

  if (Number.isNaN(window) || Number.isNaN(pane)) {
    return null;
  }

  return {
    session,
    window,
    pane,
    paneId,
    agentId: agentId || "",
    title: title || "",
    currentCommand: currentCommand || ""
  };
}

export async function isTmuxAvailable(): Promise<boolean> {
  const result = await runCommand("tmux", ["-V"], { cwd: PROJECT_ROOT, timeoutMs: 5000 });
  return result.code === 0;
}

export async function getPaneSnapshots(lines = 30): Promise<PaneSnapshot[]> {
  const safeLines = Math.max(1, Math.min(lines, 200));
  const list = await runCommand(
    "tmux",
    [
      "list-panes",
      "-a",
      "-F",
      "#{session_name}|#{window_index}|#{pane_index}|#{pane_id}|#{pane_current_command}|#{pane_title}|#{@agent_id}"
    ],
    { cwd: PROJECT_ROOT }
  );

  if (list.code !== 0) {
    return [];
  }

  const candidates = list.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map(parseLine)
    .filter((pane): pane is NonNullable<typeof pane> => pane !== null)
    .filter((pane) => ["shogun", "multiagent"].includes(pane.session));

  const snapshots: PaneSnapshot[] = [];
  for (const pane of candidates) {
    const target = `${pane.session}:${pane.window}.${pane.pane}`;
    const capture = await runCommand(
      "tmux",
      ["capture-pane", "-t", target, "-p", "-S", `-${safeLines}`],
      { cwd: PROJECT_ROOT }
    );

    snapshots.push({
      ...pane,
      target,
      tail: capture.code === 0 ? capture.stdout.trimEnd() : ""
    });
  }

  snapshots.sort((a, b) => {
    if (a.session !== b.session) {
      return a.session.localeCompare(b.session);
    }
    if (a.window !== b.window) {
      return a.window - b.window;
    }
    return a.pane - b.pane;
  });

  return snapshots;
}
