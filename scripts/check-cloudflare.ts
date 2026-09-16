import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import nextConfig from "../next.config.mjs";

assert.equal(process.env.BEUI_CLOUDFLARE, "1", "Run bun run check:cloudflare");
const aliases = nextConfig.turbopack?.resolveAlias ?? {};
const entry = path.resolve(".cloudflare/check-entry.ts");
await writeFile(entry, `
import assert from "node:assert/strict";
import { allComponents } from "../lib/registry";
import { buildComponentMarkdown } from "../lib/component-markdown";
import { readSourceFile, readOptionalSourceFile } from "../lib/source-files";
import "../scripts/check-registry";
for (const component of allComponents()) {
  const markdown = await buildComponentMarkdown(component.category.slug, component.slug);
  assert.ok(markdown?.includes(component.name), component.slug);
}
assert.equal(await readOptionalSourceFile(".env"), null);
assert.equal(await readOptionalSourceFile("toString"), null);
await assert.rejects(readSourceFile("missing.ts"), /Missing source file/);
console.log("Validated Cloudflare registry and Markdown without the repository filesystem.");
`);

const result = await Bun.build({
  entrypoints: [entry],
  outdir: ".cloudflare/check",
  target: "bun",
  plugins: [{
    name: "cloudflare-source-aliases",
    setup(build) {
      build.onResolve({ filter: /^@\/lib\/(source-reader|props-extractor)$/ }, ({ path: name }) => {
        const file = aliases[name as keyof typeof aliases];
        assert.ok(typeof file === "string", `Missing Cloudflare alias: ${name}`);
        return { path: path.resolve(file) };
      });
      build.onResolve({ filter: /^(node:)?fs(?:\/promises)?$/ }, () => {
        throw new Error("Cloudflare registry must not depend on the filesystem");
      });
    },
  }],
});
assert.ok(result.success, result.logs.join("\n"));

const directory = await mkdtemp(path.join(tmpdir(), "beui-cloudflare-"));
try {
  const child = Bun.spawn([process.execPath, result.outputs[0].path], {
    cwd: directory,
    stdout: "inherit",
    stderr: "inherit",
  });
  assert.equal(await child.exited, 0, "Cloudflare registry validation failed");
} finally {
  await rm(directory, { recursive: true, force: true });
}
