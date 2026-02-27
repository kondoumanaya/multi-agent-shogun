import { NextResponse } from "next/server";
import { readRuntimeConfig } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const config = await readRuntimeConfig();
  return NextResponse.json(config);
}
