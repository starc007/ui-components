import { Marked, type Token } from "marked";
import { type HighlightedCode, highlight } from "@/lib/highlight";

/**
 * A post body split into HTML runs and code blocks, so code renders through
 * the site's CodeBlock (Shiki, copy button) and prose through plain HTML.
 * Runs only in server functions: Shiki never reaches the browser.
 */
export type BlogBlock = { type: "html"; html: string } | { type: "code"; code: HighlightedCode };

const marked = new Marked({ gfm: true });

/**
 * A fence info string like ```tsx title="tabs.tsx" carries the filename, the
 * same syntax dev.to and most Markdown tools ignore safely.
 */
function parseFence(lang: string | undefined) {
  const [language = "tsx", ...rest] = (lang ?? "").trim().split(/\s+/);
  const filename = /title="([^"]+)"/.exec(rest.join(" "))?.[1];
  return { language: language || "tsx", filename };
}

export async function renderBlogMarkdown(markdown: string): Promise<BlogBlock[]> {
  const tokens = marked.lexer(markdown);
  const blocks: BlogBlock[] = [];
  let run: Token[] = [];

  const flush = () => {
    if (!run.length) return;
    const list = Object.assign(run, { links: tokens.links });
    blocks.push({ type: "html", html: marked.parser(list) });
    run = [];
  };

  for (const token of tokens) {
    if (token.type !== "code") {
      run.push(token);
      continue;
    }
    flush();
    const { language, filename } = parseFence(token.lang);
    blocks.push({ type: "code", code: await highlight(token.text, { lang: language, filename }) });
  }
  flush();
  return blocks;
}
