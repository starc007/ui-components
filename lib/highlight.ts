import {
  transformerNotationDiff,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerStyleToClass,
} from "@shikijs/transformers";
import { codeToHtml } from "@/lib/docs-highlighter";

/** A code sample highlighted at build time, ready for `<CodeBlock {...block} />`. */
export type HighlightedCode = {
  code: string;
  html: string;
  lang: string;
  filename?: string;
};

const LANG_MAP: Record<string, string> = {
  tsx: "tsx",
  ts: "typescript",
  js: "javascript",
  jsx: "jsx",
  css: "css",
  json: "json",
  bash: "bash",
  sh: "bash",
};

/**
 * Shiki runs only in static server functions, so the highlighter never
 * reaches the browser. Token colors become short shared classes instead of an
 * inline style on every span: pages that bundle many files (the Manual install
 * tab) otherwise ship megabytes of repeated style attributes. Class names hash
 * the colors, so blocks agree.
 */
export async function highlight(
  code: string,
  { lang = "tsx", filename }: { lang?: string; filename?: string } = {},
): Promise<HighlightedCode> {
  const shikiLang = LANG_MAP[lang.toLowerCase()] ?? lang;
  const styleToClass = transformerStyleToClass({ classPrefix: "k" });
  const highlighted = await codeToHtml(code, {
    lang: shikiLang,
    themes: {
      light: "github-light-high-contrast",
      dark: "github-dark-high-contrast",
    },
    defaultColor: false,
    transformers: [
      transformerNotationHighlight(),
      transformerNotationDiff(),
      transformerNotationFocus(),
      styleToClass,
    ],
  });
  return {
    code,
    html: `<style>${styleToClass.getCSS()}</style>${highlighted}`,
    lang: shikiLang,
    ...(filename ? { filename } : {}),
  };
}
