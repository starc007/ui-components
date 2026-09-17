import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import tsx from "shiki/langs/tsx.mjs";
import typescript from "shiki/langs/typescript.mjs";
import javascript from "shiki/langs/javascript.mjs";
import jsx from "shiki/langs/jsx.mjs";
import css from "shiki/langs/css.mjs";
import json from "shiki/langs/json.mjs";
import bash from "shiki/langs/bash.mjs";
import light from "shiki/themes/github-light-high-contrast.mjs";
import dark from "shiki/themes/github-dark-high-contrast.mjs";

// Workers prohibit runtime Wasm compilation. Load only the docs grammars with
// Shiki's JavaScript engine; reuse their compiled form across code blocks.
const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [tsx, typescript, javascript, jsx, css, json, bash],
  themes: [light, dark],
});

export async function codeToHtml(
  code: string,
  options: Parameters<Awaited<typeof highlighter>["codeToHtml"]>[1],
) {
  return (await highlighter).codeToHtml(code, options);
}
