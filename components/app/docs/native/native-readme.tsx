import type { ReactNode } from "react";
import { CodeBlock } from "@/components/app/docs/code-block";

/**
 * A beUI Native README as page content, so each React Native page carries its
 * component's documentation. The READMEs use a small Markdown subset:
 * headings, paragraphs, bullet lists, fenced code, and inline bold, code and
 * links. This renders that subset as elements, never as raw HTML. The title
 * heading is dropped; the page has its own.
 */
export function NativeReadme({ markdown }: { markdown: string }) {
  return (
    <div className="flex flex-col gap-4 text-sm leading-6 text-muted-foreground">
      {parse(markdown).map((block, index) => render(block, index))}
    </div>
  );
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "code"; lang: string; code: string };

function parse(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let index = 0;
  while (index < lines.length) {
    const line = lines[index];
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", lang, code: code.join("\n") });
      index += 1;
    } else if (/^#{1,6} /.test(line)) {
      const level = line.indexOf(" ");
      blocks.push({ type: "heading", level, text: line.slice(level + 1).trim() });
      index += 1;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (index < lines.length && lines[index].startsWith("- ")) {
        let item = lines[index].slice(2);
        index += 1;
        // A wrapped item continues on indented lines.
        while (index < lines.length && /^ {2,}\S/.test(lines[index])) {
          item += ` ${lines[index].trim()}`;
          index += 1;
        }
        items.push(item);
      }
      blocks.push({ type: "list", items });
    } else if (line.trim() === "") {
      index += 1;
    } else {
      const text: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim() !== "" &&
        !/^(#{1,6} |- |```)/.test(lines[index])
      ) {
        text.push(lines[index].trim());
        index += 1;
      }
      blocks.push({ type: "paragraph", text: text.join(" ") });
    }
  }
  return blocks;
}

function render(block: Block, key: number) {
  switch (block.type) {
    case "heading":
      // The README's own title duplicates the page heading.
      if (block.level === 1) return null;
      return (
        <h3 key={key} className="mt-4 text-base font-semibold text-foreground">
          {inline(block.text)}
        </h3>
      );
    case "paragraph":
      return (
        <p key={key} className="max-w-2xl">
          {inline(block.text)}
        </p>
      );
    case "list":
      return (
        <ul key={key} className="flex max-w-2xl list-disc flex-col gap-2 pl-5 marker:text-border">
          {block.items.map((item, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: static content in source order
            <li key={index}>{inline(item)}</li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock key={key} code={block.code} lang={block.lang || "tsx"} />;
  }
}

/** Bold, inline code and links within a line of text. */
function inline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null = pattern.exec(text);
  while (match) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const key = match.index;
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={key} className="font-medium text-foreground">
          {inline(match[1])}
        </strong>,
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <code key={key} className="rounded bg-foreground/5 px-1.5 py-0.5 font-mono text-xs text-foreground">
          {match[2]}
        </code>,
      );
    } else {
      nodes.push(
        <a
          key={key}
          href={match[4]}
          className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
        >
          {match[3]}
        </a>,
      );
    }
    last = pattern.lastIndex;
    match = pattern.exec(text);
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}
