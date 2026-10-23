import { NextResponse } from "next/server";
import { native } from "@/lib/native";
import { buildNativeEntry, NATIVE_HEADERS } from "@/lib/native-registry";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return native.components.map((component) => ({ slug: component.slug }));
}

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ slug: string }> },
) {
  const { slug } = await ctx.params;
  const entry = buildNativeEntry(slug);
  if (!entry) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(entry, { headers: NATIVE_HEADERS });
}
