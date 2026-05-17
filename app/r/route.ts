import { NextResponse } from "next/server";
import { buildIndex } from "@/lib/registry-server";

export const dynamic = "force-static";

export async function GET() {
  const data = await buildIndex();
  return NextResponse.json(data, {
    headers: {
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "link": '</llms.txt>; rel="describedby"; type="text/plain"',
    },
  });
}
