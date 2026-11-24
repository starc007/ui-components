"use client";

import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  FileDown,
  LoaderCircle,
  TriangleAlert,
} from "lucide-react";
import { useTranslations } from "use-intl";
import { useEffect, useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";
import { ClaudeIcon, OpenAIIcon, V0Icon } from "@/components/app/brand-icons";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copying" | "copied" | "error";

function promptUrl(baseUrl: string, pageUrl: string) {
  const prompt = `I'm looking at this beUI component documentation: ${pageUrl}.
Help me understand how to use it. Be ready to explain the API, give examples, or help debug an implementation based on it.`;
  return `${baseUrl}?q=${encodeURIComponent(prompt)}`;
}

function openInNewTab(href: string) {
  window.open(href, "_blank", "noopener,noreferrer");
}

export function CopyPage({
  pageUrl,
  markdownPath,
  componentName,
}: {
  pageUrl: string;
  markdownPath: string;
  componentName: string;
}) {
  const t = useTranslations("Docs.copyPage");
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (resetTimer.current) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const resetLater = () => {
    if (resetTimer.current) window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState("idle"), 1800);
  };

  const copyMarkdown = async () => {
    setCopyState("copying");
    try {
      const response = await fetch(markdownPath);
      if (!response.ok) throw new Error(`Markdown request failed: ${response.status}`);
      const markdown = await response.text();
      await navigator.clipboard.writeText(markdown);
      setCopyState("copied");
      trackEvent("copy_component_page", {
        label: componentName,
        chars: markdown.length,
      });
    } catch {
      setCopyState("error");
    }
    resetLater();
  };

  const assistants = [
    { app: "v0", href: promptUrl("https://v0.dev", pageUrl), icon: <V0Icon /> },
    { app: "ChatGPT", href: promptUrl("https://chatgpt.com", pageUrl), icon: <OpenAIIcon /> },
    { app: "Claude", href: promptUrl("https://claude.ai/new", pageUrl), icon: <ClaudeIcon /> },
  ];

  const copyLabel = copyState === "error" ? t("tryAgain") : t("copy");
  const copyAriaLabel =
    copyState === "copied"
      ? t("copiedAria")
      : copyState === "error"
        ? t("errorAria")
        : t("copyAria");

  return (
    <div className="hidden shrink-0 whitespace-nowrap sm:block">
      <div className="inline-flex rounded-full bg-muted/70">
        <button
          type="button"
          onClick={copyMarkdown}
          disabled={copyState === "copying"}
          aria-busy={copyState === "copying"}
          aria-label={copyAriaLabel}
          className="inline-flex min-h-10 items-center gap-2 rounded-l-full pr-3 pl-4 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait sm:min-h-8 sm:px-2.5 sm:text-xs"
        >
          {copyState === "copying" ? (
            <LoaderCircle className="h-3.5 w-3.5 motion-safe:animate-spin" aria-hidden="true" />
          ) : copyState === "copied" ? (
            <Check className="h-3.5 w-3.5 text-(--color-success)" aria-hidden="true" />
          ) : copyState === "error" ? (
            <TriangleAlert className="h-3.5 w-3.5 text-destructive" aria-hidden="true" />
          ) : (
            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          <span>{copyLabel}</span>
        </button>
        <span className="my-2 w-px bg-border" aria-hidden="true" />
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger>
          <button
            type="button"
            aria-label={t("moreActions")}
            className="inline-flex min-h-10 w-11 items-center justify-center rounded-r-full pr-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8 sm:w-8"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={() => openInNewTab(markdownPath)}>
              <FileDown aria-hidden="true" />
              {t("viewMarkdown")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {assistants.map((assistant) => (
              <DropdownMenuItem
                key={assistant.app}
                onSelect={() => openInNewTab(assistant.href)}
              >
                {assistant.icon}
                {t("openIn", { app: assistant.app })}
                <ArrowUpRight aria-hidden="true" className="ml-auto size-3.5" />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
