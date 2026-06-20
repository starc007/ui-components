// components/code-block.tsx
import { codeToHtml } from "shiki";
import {
  transformerNotationHighlight,
  transformerNotationDiff,
  transformerNotationFocus,
} from "@shikijs/transformers";
import { CopyButton } from "./copy-button";
import { ExpandableCode } from "./expandable-code";
import { cn } from "@/lib/utils";
import { FileIcon } from "lucide-react";

type Props = {
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
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

const LANG_LABELS: Record<string, string> = {
  tsx: "TSX",
  typescript: "TS",
  javascript: "JS",
  jsx: "JSX",
  css: "CSS",
  json: "JSON",
  bash: "Shell",
};

export async function CodeBlock({
  code,
  lang = "tsx",
  filename,
  className,
}: Props) {
  const shikiLang = LANG_MAP[lang.toLowerCase()] ?? lang;
  const langLabel =
    LANG_LABELS[shikiLang] ?? LANG_LABELS[lang] ?? lang.toUpperCase();

  const html = await codeToHtml(code, {
    lang: shikiLang,
    themes: {
      light: "github-light",
      dark: "github-dark",
    },
    defaultColor: false,
    transformers: [
      transformerNotationHighlight(),
      transformerNotationDiff(),
      transformerNotationFocus(),
    ],
  });

  const fileDir = filename ? filename.split("/").slice(0, -1).join("/") : null;
  const fileName = filename ? filename.split("/").pop() : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-elev)",
        "font-mono text-[13px]",
        className,
      )}
    >
      {filename ? (
        <div className="flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-bg)/60 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2 text-xs">
            <span className="inline-flex h-5 shrink-0 items-center rounded border border-(--color-border) bg-(--color-bg-elev) px-1.5 font-mono text-[10px] font-semibold tracking-wider text-(--color-fg-muted) uppercase">
              {langLabel}
            </span>

            <FileIcon className="h-3.5 w-3.5 shrink-0 text-(--color-fg-muted)" />
            <span className="truncate font-mono text-(--color-fg-muted)">
              {fileDir && (
                <span className="opacity-60">{fileDir}/</span>
              )}
              <span className="text-(--color-fg) font-medium">{fileName}</span>
            </span>
          </div>

          <CopyButton text={code} />
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-10">
          <CopyButton text={code} />
        </div>
      )}

      <ExpandableCode>
        <div
          className={cn(
            "relative",
            "px-0 py-4 text-[13px] leading-relaxed",
            "[&_pre]:!bg-transparent [&_pre]:!p-0",
            "[&_code]:font-mono [&_code]:text-[13px]",
            "[&_.shiki]:bg-transparent",
            "[&_.line]:px-5",
            "[&_.highlighted]:bg-(--color-fg)/[0.07] [&_.highlighted]:border-l-2 [&_.highlighted]:border-blue-500 [&_.highlighted]:!pl-[18px]",
            "[&_.diff.add]:bg-green-500/10 [&_.diff.add]:border-l-2 [&_.diff.add]:border-green-500 [&_.diff.add]:!pl-[18px]",
            "[&_.diff.remove]:bg-red-500/10 [&_.diff.remove]:border-l-2 [&_.diff.remove]:border-red-500 [&_.diff.remove]:!pl-[18px]",
            "[&_.focused]:opacity-100 [&_pre:has(.focused)_.line:not(.focused)]:opacity-30",
            "[&_pre:has(.focused)_.line:not(.focused)]:transition-opacity",
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </ExpandableCode>
    </div>
  );
}
