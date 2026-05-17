import { codeToHtml } from "shiki";
import { CopyButton } from "./copy-button";

type Props = {
  code: string;
  lang?: string;
  filename?: string;
};

export async function CodeBlock({ code, lang = "tsx", filename }: Props) {
  const html = await codeToHtml(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    defaultColor: false,
  });

  return (
    <div className="group relative overflow-hidden rounded-xl border border-(--color-border) bg-(--color-bg-elev)">
      {filename ? (
        <div className="flex items-center justify-between border-b border-(--color-border) px-4 py-2 text-xs text-(--color-fg-muted)">
          <span className="font-mono">{filename}</span>
          <CopyButton text={code} />
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-10">
          <CopyButton text={code} />
        </div>
      )}
      <div
        className="overflow-auto p-4 text-[13px] [&_pre]:!bg-transparent [&_code]:font-mono"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
