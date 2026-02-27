import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LOCALHOST_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]"]);

function isLocalAddress(value: string | null): boolean {
  if (!value) {
    return true;
  }

  const trimmed = value.trim();
  return trimmed === "127.0.0.1" || trimmed === "::1" || trimmed === "localhost";
}

export function isLocalhostRequest(request: NextRequest): boolean {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  const forwardedFor = request.headers.get("x-forwarded-for");

  const hostOk = LOCALHOST_HOSTS.has(host);
  const forwardedOk =
    !forwardedFor ||
    forwardedFor
      .split(",")
      .map((value) => value.trim())
      .every((value) => isLocalAddress(value));

  return hostOk && forwardedOk;
}

export function requireLocalhost(request: NextRequest): NextResponse | null {
  if (isLocalhostRequest(request)) {
    return null;
  }

  return NextResponse.json(
    {
      error: "This endpoint is localhost-only"
    },
    { status: 403 }
  );
}
