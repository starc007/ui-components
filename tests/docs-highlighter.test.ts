import { expect, test } from "bun:test";

// Use V8, as Cloudflare does. Bun's JavaScriptCore currently tokenizes the
// JavaScript regex engine differently, including failing comment annotations.
test("docs highlighting preserves annotations with runtime Wasm disabled", async () => {
  const script = `
    WebAssembly.instantiate = () => { throw new Error("Wasm forbidden"); };
    WebAssembly.compile = () => { throw new Error("Wasm forbidden"); };
    const { codeToHtml } = await import("./lib/docs-highlighter.ts");
    const { transformerNotationDiff, transformerNotationHighlight } = await import("@shikijs/transformers");
    const results = [];
    for (const lang of ["tsx", "typescript", "javascript", "jsx", "css", "json", "bash"]) {
      results.push(await codeToHtml("const value = 1; // [!code ++]\\nconst other = 2; // [!code highlight]", {
        lang,
        themes: { light: "github-light-high-contrast", dark: "github-dark-high-contrast" },
        transformers: [transformerNotationDiff(), transformerNotationHighlight()],
      }));
    }
    console.log(JSON.stringify(results));
  `;
  const process = Bun.spawn(["node", "--input-type=module", "-e", script], {
    cwd: new URL("..", import.meta.url).pathname,
    stdout: "pipe",
    stderr: "pipe",
  });
  const stdout = await new Response(process.stdout).text();
  const stderr = await new Response(process.stderr).text();
  expect(await process.exited, stderr).toBe(0);
  const results: string[] = JSON.parse(stdout);
  expect(results).toHaveLength(7);
  for (const html of results) expect(html).toContain("shiki");
  expect(results[0]).toContain("diff add");
  expect(results[0]).toContain("highlighted");
});
