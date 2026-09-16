import { mkdir, readFile, writeFile } from "node:fs/promises";
import { getComponentProps, type ComponentPropsDoc } from "../lib/props-extractor";
import { registry } from "../lib/registry";

// Workers cannot read the repository or run the TypeScript documentation parser.
// Generate only public source and API docs, then alias their readers in Next.js.
const output = ".cloudflare";
const sources: Record<string, string> = {};
const glob = new Bun.Glob("{components,lib}/**/*.{ts,tsx,js,jsx,css}");
for (const file of Array.from(glob.scanSync(".")).sort()) {
  sources[file] = await readFile(file, "utf8");
}

const files = new Set(
  registry.flatMap((category) =>
    category.components.flatMap((component) => [
      component.file,
      ...(component.examples ?? []).map((example) => example.file),
    ]),
  ),
);
const props: Record<string, ComponentPropsDoc[]> = {};
for (const file of Array.from(files).sort()) {
  if (!Object.hasOwn(sources, file)) throw new Error(`Missing component source: ${file}`);
  props[file] = getComponentProps(file);
}

await mkdir(output, { recursive: true });
await writeFile(`${output}/sources.json`, JSON.stringify(sources));
await writeFile(`${output}/props.json`, JSON.stringify(props));
await writeFile(`${output}/source-reader.ts`, `
import data from "./sources.json";
const sources: Record<string, string> = data;
export async function readOptionalSourceFile(rel: string): Promise<string | null> {
  return Object.hasOwn(sources, rel) ? sources[rel] : null;
}
export async function readSourceFile(rel: string): Promise<string> {
  const source = await readOptionalSourceFile(rel);
  if (source === null) throw new Error(\`Missing source file: \${rel}\`);
  return source;
}
`);
await writeFile(`${output}/props-extractor.ts`, `
import data from "./props.json";
import type { ComponentPropsDoc } from "../lib/props-extractor";
export type { ComponentPropsDoc, PropDoc } from "../lib/props-extractor";
const props: Record<string, ComponentPropsDoc[]> = data;
export function getComponentProps(file: string): ComponentPropsDoc[] {
  if (!Object.hasOwn(props, file)) throw new Error(\`Missing component props: \${file}\`);
  return props[file];
}
`);
console.log(`Prepared ${Object.keys(sources).length} source files and ${files.size} prop references for Cloudflare.`);
