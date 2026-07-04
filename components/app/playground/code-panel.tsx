"use client";

import { useEffect, useState } from "react";
import { getSingletonHighlighter, type Highlighter } from "shiki";
import { CopyButton } from "@/components/app/docs/copy-button";
import { cn } from "@/lib/utils";

// One shared highlighter for the page, created lazily on first render.
let hlPromise: Promise<Highlighter> | null = null;
function highlighter() {
  if (!hlPromise) {
    hlPromise = getSingletonHighlighter({
      themes: ["github-light", "github-dark"],
      langs: ["tsx"],
    });
  }
  return hlPromise;
}

export function CodePanel({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    highlighter().then((hl) => {
      if (cancelled) return;
      setHtml(
        hl.codeToHtml(code, {
          lang: "tsx",
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: false,
        }),
      );
    });
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card font-mono text-[13px]",
        className,
      )}
    >
      <div className="absolute right-3 top-3 z-10">
        <CopyButton text={code} eventName="copy_playground" />
      </div>

      {html ? (
        <div
          className={cn(
            "py-4 text-[13px] leading-relaxed",
            "[&_pre]:!bg-transparent [&_pre]:overflow-x-auto [&_pre]:!p-0",
            "[&_code]:font-mono [&_code]:text-[13px]",
            "[&_.shiki]:bg-transparent",
            "[&_.line]:px-5",
          )}
          // shiki output; input is our own generated source, not user content
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        // pre-highlight fallback keeps layout stable on first paint
        <pre className="overflow-x-auto px-5 py-4 leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
