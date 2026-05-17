import { buildIndex } from "@/lib/registry-server";

export const dynamic = "force-static";

export async function GET() {
  const idx = await buildIndex();
  const lines: string[] = [];
  lines.push(`# ${idx.name}`);
  lines.push("");
  lines.push(`> ${idx.description}`);
  lines.push("");
  lines.push("## Endpoints");
  lines.push("");
  lines.push(`- Registry index (JSON): ${idx.endpoints.index}`);
  lines.push(`- Component detail (JSON): ${idx.endpoints.detail}`);
  lines.push(`- Raw source (text/plain): ${idx.endpoints.raw}`);
  lines.push("");
  lines.push("## Components");
  lines.push("");
  for (const c of idx.components) {
    lines.push(`- [${c.name}](${c.detail_url}): ${c.description}`);
  }
  lines.push("");
  lines.push("## Usage for agents");
  lines.push("");
  lines.push("1. Fetch the index to discover components.");
  lines.push("2. Fetch a component detail JSON for files, deps and source.");
  lines.push("3. Drop files into the user's project at the listed paths.");
  lines.push("4. Install external `dependencies` listed on the entry.");
  lines.push("5. Internal helpers (e.g. `@/lib/utils`) ship in the `files` array as `type: util`.");
  lines.push("");
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
    },
  });
}
