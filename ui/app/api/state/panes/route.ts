import { NextRequest, NextResponse } from "next/server";
import { getPaneSnapshots } from "@/lib/server/tmux";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const linesParam = request.nextUrl.searchParams.get("lines");
  const lines = Number.parseInt(linesParam || "30", 10);
  const panes = await getPaneSnapshots(Number.isNaN(lines) ? 30 : lines);

  return NextResponse.json({
    lines: Number.isNaN(lines) ? 30 : lines,
    panes
  });
}
