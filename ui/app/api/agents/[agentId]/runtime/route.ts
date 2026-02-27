import { NextRequest, NextResponse } from "next/server";
import { EFFORT_VALUES } from "@/lib/constants";
import { requireLocalhost } from "@/lib/server/http";
import { applyRuntimeToPane, readRuntimeConfig, updateAgentRuntime } from "@/lib/server/runtime";

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest, context: { params: { agentId: string } }) {
  const localError = requireLocalhost(request);
  if (localError) {
    return localError;
  }

  const { agentId } = context.params;
  const body = (await request.json().catch(() => ({}))) as {
    type?: string;
    model?: string;
    effort?: string;
    restart?: boolean;
  };

  const runtimeConfig = await readRuntimeConfig();
  const knownAgents = Object.keys(runtimeConfig.cli.agents ?? {});
  if (!knownAgents.includes(agentId)) {
    return NextResponse.json({ error: `Unknown agent: ${agentId}` }, { status: 404 });
  }

  const patch: { type?: string; model?: string; effort?: "auto" | "low" | "medium" | "high" } = {};
  if (body.type) {
    patch.type = String(body.type).trim();
  }
  if (body.model !== undefined) {
    patch.model = String(body.model).trim();
  }
  if (body.effort !== undefined) {
    const effort = String(body.effort).trim().toLowerCase();
    if (!EFFORT_VALUES.includes(effort as (typeof EFFORT_VALUES)[number])) {
      return NextResponse.json(
        { error: `Invalid effort: ${effort}. Allowed: ${EFFORT_VALUES.join(", ")}` },
        { status: 400 }
      );
    }
    patch.effort = effort as "auto" | "low" | "medium" | "high";
  }

  if (!patch.type && patch.model === undefined && patch.effort === undefined && body.restart === false) {
    return NextResponse.json({ error: "No changes requested" }, { status: 400 });
  }

  const updated = await updateAgentRuntime(agentId, patch);
  const restart = body.restart !== false;
  const switchResult = restart ? await applyRuntimeToPane(agentId, patch) : null;

  const status = switchResult && switchResult.code !== 0 ? 500 : 200;
  return NextResponse.json(
    {
      agentId,
      runtime: updated.runtime,
      restart,
      switchResult
    },
    { status }
  );
}
