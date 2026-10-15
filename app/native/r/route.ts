import { NextResponse } from "next/server";
import { buildNativeIndex, NATIVE_HEADERS } from "@/lib/native-registry";

export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(buildNativeIndex(), {
    headers: {
      ...NATIVE_HEADERS,
      link: '</llms.txt>; rel="describedby"; type="text/plain"',
    },
  });
}
