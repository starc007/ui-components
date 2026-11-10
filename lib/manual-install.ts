import { type HighlightedCode, highlight } from "@/lib/highlight";
import { buildEntry } from "@/lib/registry-server";

// Already present in any React project; not worth a copy-paste install line.
const SKIP_DEPS = new Set(["react", "react-dom", "next"]);

export type ManualInstallData = {
  dependencies: HighlightedCode | null;
  utilFiles: HighlightedCode[];
  sourceFiles: HighlightedCode[];
};

/**
 * The shadcn-free install path for `<ManualInstall>`: install deps, drop in
 * the util files, copy the source. Derived from the same source graph the
 * registry uses. Runs in static server functions only.
 */
export async function buildManualInstall(
  category: string,
  slug: string,
): Promise<ManualInstallData | null> {
  const entry = await buildEntry(category, slug);
  if (!entry) return null;

  const deps = entry.dependencies.filter((dep) => !SKIP_DEPS.has(dep));
  const entryFiles = entry.files;
  const files = (filter: (file: (typeof entryFiles)[number]) => boolean) =>
    Promise.all(
      entryFiles
        .filter(filter)
        .map((file) => highlight(file.content, { filename: file.path })),
    );

  const [dependencies, utilFiles, sourceFiles] = await Promise.all([
    deps.length > 0 ? highlight(`npm i ${deps.join(" ")}`, { lang: "bash" }) : null,
    files((file) => file.path.startsWith("lib/")),
    files((file) => file.type !== "preview" && !file.path.startsWith("lib/")),
  ]);
  return { dependencies, utilFiles, sourceFiles };
}
