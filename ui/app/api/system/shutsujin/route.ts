import { spawn } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { requireLocalhost } from "@/lib/server/http";
import { PATHS, PROJECT_ROOT } from "@/lib/server/paths";

export const dynamic = "force-dynamic";

const REQUIRED_CONFIRM = "SHUTSUJIN";

export async function POST(request: NextRequest) {
  const localError = requireLocalhost(request);
  if (localError) {
    return localError;
  }

  const body = (await request.json().catch(() => ({}))) as { confirm?: string };
  if (body.confirm !== REQUIRED_CONFIRM) {
    return NextResponse.json(
      { error: `confirm must be exactly ${REQUIRED_CONFIRM}` },
      { status: 400 }
    );
  }

  const child = spawn("bash", [PATHS.shutsujinScript], {
    cwd: PROJECT_ROOT,
    detached: true,
    stdio: "ignore",
    env: process.env
  });

  child.unref();

  return NextResponse.json({
    ok: true,
    launchedAt: new Date().toISOString(),
    script: PATHS.shutsujinScript
  });
}
