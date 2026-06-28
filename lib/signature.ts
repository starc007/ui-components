import { SITE_URL } from "@/lib/site";

const CODE_EXT = /\.(tsx?|jsx?|css|mjs|cjs)$/;
// "use client" / "use server" must stay the first statement; insert the
// banner right after the directive when present, otherwise at the very top.
const DIRECTIVE_RE = /^\s*(["']use (?:client|server)["'];?[^\n]*\n)/;

/** Component docs page URL, e.g. https://beui.dev/components/motion/tabs */
export function pageUrlFor(categorySlug: string, pageSlug: string) {
  return `${SITE_URL}/components/${categorySlug}/${pageSlug}`;
}

/**
 * Prepend a one-line provenance comment pointing at the component's docs page.
 * Applied to component source files on copy and on registry install so the
 * origin travels with the code. No-ops for non-code files (json, etc.).
 */
export function withSignature(content: string, path: string, pageUrl: string) {
  if (!CODE_EXT.test(path)) return content;
  const url = pageUrl.replace(/^https?:\/\//, "");
  const banner = path.endsWith(".css") ? `/* ${url} */` : `// ${url}`;

  const directive = content.match(DIRECTIVE_RE);
  if (directive) {
    const end = directive[0].length;
    return `${content.slice(0, end)}${banner}\n${content.slice(end)}`;
  }
  return `${banner}\n${content}`;
}
