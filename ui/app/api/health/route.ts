import { NextRequest, NextResponse } from "next/server";
import { isLocalhostRequest } from "@/lib/server/http";
import { isTmuxAvailable } from "@/lib/server/tmux";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const tmux = await isTmuxAvailable();
  const host = request.headers.get("host") || "";

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    localhostOnly: true,
    isLocalhostRequest: isLocalhostRequest(request),
    host,
    tmuxAvailable: tmux
  });
}
