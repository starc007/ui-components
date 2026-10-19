import { buildIndex } from "@/lib/registry-server";
import { buildNativeIndex } from "@/lib/native-registry";
import { SITE_URL } from "@/lib/site";

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
  lines.push(`- Component Markdown: ${idx.endpoints.markdown}`);
  lines.push("");
  lines.push("## Guides");
  lines.push("");
  lines.push(`- [Motion Guides](${SITE_URL}/docs/motion-patterns.md): Purposeful motion, timing, easing, recipes, and reduced motion.`);
  lines.push(`- [Agent Guide](${SITE_URL}/docs/ai-agents.md): Agent skill, MCP server, registry endpoints, and install flows.`);
  lines.push(`- [OpenUI Guide](${SITE_URL}/docs/openui.md): Register beUI components and render streamed generative interfaces.`);
  lines.push(`- [Changelog](${SITE_URL}/changelog/rss.xml): Weekly new components, improvements and fixes, as an RSS feed.`);
  lines.push(`- [React Native Setup](${SITE_URL}/docs/native-setup.md): One-time app setup for beUI Native: libraries, Uniwind, theme tokens and folder layout.`);
  lines.push("");
  lines.push("## Components");
  lines.push("");
  for (const c of idx.components) {
    lines.push(`- [${c.name}](${c.markdown_url}): ${c.description}`);
  }
  lines.push("");
  const nativeIndex = buildNativeIndex();
  lines.push("## React Native (beUI Native)");
  lines.push("");
  lines.push(`> ${nativeIndex.description}`);
  lines.push("");
  lines.push(`- All native components: ${SITE_URL}/react-native`);
  lines.push(`- Native index (JSON): ${nativeIndex.endpoints.index}`);
  lines.push(`- Native detail (JSON, every file with contents): ${nativeIndex.endpoints.detail}`);
  lines.push(`- Showcase in Expo Go (SDK ${nativeIndex.expo_go.sdk}): ${nativeIndex.expo_go.url}`);
  lines.push(`- Source: ${nativeIndex.repository}`);
  lines.push("");
  for (const c of nativeIndex.components) {
    lines.push(`- [${c.name}](${c.page_url}): ${c.description} JSON: ${c.detail_url}`);
  }
  lines.push("");
  lines.push("To add a native component, run `npx beui-native add <slug>` from the app's root. To do it by hand: fetch its detail JSON, run its `install` commands, then copy every file in `files` to its `path`, keeping the folder layout. Add the `theme` file once per app.");
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
