import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
  lang?: string;
  filename?: string;
  bare?: boolean;
};

export async function CodeBlock({ code, lang = "tsx", filename, bare = false }: Props) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div
      className={cn(
        "group relative overflow-hidden",
        bare ? "rounded-none" : "rounded-2xl border border-(--color-border) bg-(--color-bg-elev)",
      )}
    >
      {filename ? (
        <div
          className={cn(
            "flex items-center justify-between px-4 py-2 text-xs text-(--color-fg-muted)",
            bare ? "border-b border-(--color-border)" : "border-b border-(--color-border)",
          )}
        >
          <span className="font-mono">{filename}</span>
          <CopyButton text={code} />
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <div
        className={cn(
          "overflow-auto text-[13px] [&_pre]:!bg-transparent [&_code]:font-mono",
          bare ? "py-4" : "p-4",
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
