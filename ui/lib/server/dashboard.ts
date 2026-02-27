import { PATHS } from "@/lib/server/paths";
import { readTextFile } from "@/lib/server/yaml";

export type DashboardSection = {
  title: string;
  body: string;
};

export type DashboardData = {
  raw: string;
  sections: DashboardSection[];
  urgentCount: number;
};

const SECTION_HEADER = /^##\s+(.+)$/;

export function splitMarkdownSections(content: string): DashboardSection[] {
  const lines = content.split(/\r?\n/);
  const sections: DashboardSection[] = [];

  let currentTitle = "Overview";
  let currentBody: string[] = [];

  for (const line of lines) {
    const match = line.match(SECTION_HEADER);
    if (!match) {
      currentBody.push(line);
      continue;
    }

    if (currentBody.join("\n").trim().length > 0 || sections.length > 0) {
      sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
    }

    currentTitle = match[1].trim();
    currentBody = [];
  }

  if (currentBody.join("\n").trim().length > 0 || sections.length === 0) {
    sections.push({ title: currentTitle, body: currentBody.join("\n").trim() });
  }

  return sections;
}

function countActionItems(text: string): number {
  const lines = text.split(/\r?\n/).map((line) => line.trim());
  const bulletLike = lines.filter((line) => /^(-|\d+\.)\s+/.test(line));
  if (bulletLike.length > 0) {
    return bulletLike.length;
  }

  const alertMatches = text.match(/🚨/g);
  return alertMatches ? alertMatches.length : 0;
}

export async function getDashboardData(): Promise<DashboardData> {
  const raw = await readTextFile(PATHS.dashboard, "");
  const sections = splitMarkdownSections(raw);

  const actionSection = sections.find((section) => /要対応|action required/i.test(section.title));
  const urgentCount = actionSection ? countActionItems(actionSection.body) : countActionItems(raw);

  return { raw, sections, urgentCount };
}
