import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  lang?: string;
  filename?: string;
  className?: string;
};

const LANG_LABELS: Record<string, string> = {
  tsx: "TSX",
  ts: "TS",
  js: "JS",
  jsx: "JSX",
  css: "CSS",
  json: "JSON",
  md: "MD",
  bash: "Shell",
  sh: "Shell",
};

export async function CodeBlock({ code, lang = "tsx", filename, className }: Props) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  const langLabel = LANG_LABELS[lang] ?? lang.toUpperCase();
  const fileDir = filename ? filename.split("/").slice(0, -1).join("/") : null;
  const fileName = filename ? filename.split("/").pop() : null;

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-bg-elev)",
        className,
      )}
    >
      {filename ? (
        <div className="flex items-center justify-between gap-3 border-b border-(--color-border) bg-(--color-bg)/40 px-4 py-2.5">
          <div className="flex min-w-0 items-center gap-2.5 text-xs">
            <span className="inline-flex h-5 items-center rounded-md border border-(--color-border) bg-(--color-bg-elev) px-1.5 font-mono text-[10px] font-semibold tracking-wide text-(--color-fg-muted)">
              {langLabel}
            </span>
            <span className="truncate font-mono text-(--color-fg-muted)">
              {fileDir ? (
                <span className="opacity-70">{fileDir}/</span>
              ) : null}
              <span className="text-(--color-fg)">{fileName}</span>
            </span>
          </div>
          <CopyButton text={code} />
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-10 opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={code} />
        </div>
      )}
      <div
        className={cn(
          "max-h-[640px] overflow-auto px-5 py-4 text-[13px] leading-relaxed",
          "[&_pre]:!bg-transparent [&_code]:font-mono",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
