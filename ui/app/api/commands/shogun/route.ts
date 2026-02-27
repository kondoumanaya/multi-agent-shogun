import { NextRequest, NextResponse } from "next/server";
import { appendShogunCommand, listCommands } from "@/lib/server/commands";
import { requireLocalhost } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function GET() {
  const commands = await listCommands();
  return NextResponse.json({ commands });
}

export async function POST(request: NextRequest) {
  const localError = requireLocalhost(request);
  if (localError) {
    return localError;
  }

  const body = (await request.json().catch(() => ({}))) as {
    purpose?: string;
    acceptance_criteria?: string[];
    command?: string;
    project?: string;
    priority?: string;
  };

  const purpose = body.purpose?.trim() || "";
  const command = body.command?.trim() || "";
  const project = body.project?.trim() || "multi-agent-shogun";
  const priority = body.priority?.trim() || "medium";
  const acceptance = Array.isArray(body.acceptance_criteria)
    ? body.acceptance_criteria
        .map((item) => String(item).trim())
        .filter(Boolean)
    : [];

  if (!purpose || !command || acceptance.length === 0) {
    return NextResponse.json(
      {
        error: "purpose, acceptance_criteria(1+), command are required"
      },
      { status: 400 }
    );
  }

  const result = await appendShogunCommand({
    purpose,
    acceptanceCriteria: acceptance,
    command,
    project,
    priority
  });

  const status = result.inboxNotification.code === 0 ? 201 : 500;
  return NextResponse.json(result, { status });
}
