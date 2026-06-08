import { NextResponse } from "next/server";
import { buildShadcnRegistry } from "@/lib/registry-server";

export const dynamic = "force-static";

export async function GET() {
  const registry = await buildShadcnRegistry();
  return NextResponse.json(registry, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "link": '</r/registry.json>; rel="alternate"; type="application/json"',
    },
  });
}
