"use client";

import { Check, ChevronDown, Copy, FileDown, LoaderCircle, TriangleAlert } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

type CopyState = "idle" | "copying" | "copied" | "error";

function V0Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 147 70"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d="M56 50.203V14h14v46.156C70 65.593 65.593 70 60.156 70c-2.596 0-5.158-1-7-2.843L0 14h19.797L56 50.203ZM147 56h-14V23.953L100.953 56H133v14H96.687C85.814 70 77 61.186 77 50.312V14h14v32.156L123.156 14H91V0h36.312C138.186 0 147 8.814 147 19.688V56Z" />
    </svg>
  );
}

function ChatGPTIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function ClaudeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        d="m4.714 15.956 4.718-2.648.079-.23-.08-.128h-.23l-.79-.048-2.695-.073-2.337-.097-2.265-.122-.57-.121-.535-.704.055-.353.48-.321.685.06 1.518.104 2.277.157 1.651.098 2.447.255h.389l.054-.158-.133-.097-.103-.098-2.356-1.596-2.55-1.688-1.336-.972-.722-.491L2 6.223l-.158-1.008.655-.722.88.06.225.061.893.686 1.906 1.476 2.49 1.833.364.304.146-.104.018-.072-.164-.274-1.354-2.446-1.445-2.49-.644-1.032-.17-.619a2.972 2.972 0 0 1-.103-.729L6.287.133 6.7 0l.995.134.42.364.619 1.415L9.735 4.14l1.555 3.03.455.898.243.832.09.255h.159V9.01l.127-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.583.28.48.685-.067.444-.286 1.851-.558 2.903-.365 1.942h.213l.243-.242.983-1.306 1.652-2.064.728-.82.85-.904.547-.431h1.032l.759 1.129-.34 1.166-1.063 1.347-.88 1.142-1.263 1.7-.79 1.36.074.11.188-.02 2.853-.606 1.542-.28 1.84-.315.832.388.09.395-.327.807-1.967.486-2.307.462-3.436.813-.043.03.049.061 1.548.146.662.036h1.62l3.018.225.79.522.473.638-.08.485-1.213.62-1.64-.389-3.825-.91-1.31-.329h-.183v.11l1.093 1.068 2.003 1.81 2.508 2.33.127.578-.321.455-.34-.049-2.204-1.657-.85-.747-1.925-1.62h-.127v.17l.443.649 2.343 3.521.122 1.08-.17.353-.607.213-.668-.122-1.372-1.924-1.415-2.168-1.141-1.943-.14.08-.674 7.254-.316.37-.728.28-.607-.461-.322-.747.322-1.476.388-1.924.316-1.53.285-1.9.17-.632-.012-.042-.14.018-1.432 1.967-2.18 2.945-1.724 1.845-.413.164-.716-.37.066-.662.401-.589 2.386-3.036 1.439-1.882.929-1.086-.006-.158h-.055L4.138 18.56l-1.13.146-.485-.456.06-.746.231-.243 1.907-1.312Z"
        fill="currentColor"
      />
    </svg>
  );
}

function promptUrl(baseUrl: string, pageUrl: string) {
  const prompt = `I'm looking at this beUI component documentation: ${pageUrl}.
Help me understand how to use it. Be ready to explain the API, give examples, or help debug an implementation based on it.`;
  return `${baseUrl}?q=${encodeURIComponent(prompt)}`;
}

const actionClassName =
  "flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-foreground outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring";

export function CopyPage({
  pageUrl,
  markdownPath,
  componentName,
}: {
  pageUrl: string;
  markdownPath: string;
  componentName: string;
}) {
  const [open, setOpen] = useState(false);
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const resetTimer = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (wasOpen.current && !open && menuRef.current?.contains(document.activeElement)) {
      triggerRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

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

  const focusMenuItem = (edge: "first" | "last") => {
    setOpen(true);
    window.setTimeout(() => {
      const items = menuRef.current?.querySelectorAll<HTMLAnchorElement>("a");
      items?.[edge === "first" ? 0 : items.length - 1]?.focus();
    });
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!menuRef.current || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      return;
    }
    const items = Array.from(menuRef.current.querySelectorAll<HTMLAnchorElement>("a"));
    if (!items.length) return;
    event.preventDefault();
    const current = items.indexOf(document.activeElement as HTMLAnchorElement);
    if (event.key === "Home") items[0]?.focus();
    else if (event.key === "End") items.at(-1)?.focus();
    else if (event.key === "ArrowDown") items[(current + 1) % items.length]?.focus();
    else items[(current - 1 + items.length) % items.length]?.focus();
  };

  const actions = [
    {
      label: "View as Markdown",
      href: markdownPath,
      icon: <FileDown className="h-4 w-4" aria-hidden="true" />,
    },
    {
      label: "Open in v0",
      href: promptUrl("https://v0.dev", pageUrl),
      icon: <V0Icon className="h-4 w-4" />,
    },
    {
      label: "Open in ChatGPT",
      href: promptUrl("https://chatgpt.com", pageUrl),
      icon: <ChatGPTIcon className="h-4 w-4" />,
    },
    {
      label: "Open in Claude",
      href: promptUrl("https://claude.ai/new", pageUrl),
      icon: <ClaudeIcon className="h-4 w-4" />,
    },
  ];

  const copyLabel =
    copyState === "error" ? "Try again" : "Copy Page";
  const copyAriaLabel =
    copyState === "copied"
      ? "Page copied"
      : copyState === "error"
        ? "Copy failed. Try again"
        : "Copy page as Markdown";

  return (
    <MorphPopover
      open={open}
      onOpenChange={setOpen}
      className="hidden sm:inline-flex"
    >
      <div className="inline-flex rounded-lg bg-muted/70">
        <button
          type="button"
          onClick={copyMarkdown}
          disabled={copyState === "copying"}
          aria-busy={copyState === "copying"}
          aria-label={copyAriaLabel}
          className="inline-flex min-h-10 items-center gap-2 rounded-l-lg px-3 text-sm font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait sm:min-h-8 sm:px-2.5 sm:text-xs"
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
        <MorphPopoverTrigger>
          <button
            ref={triggerRef}
            type="button"
            aria-label="More page actions"
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                focusMenuItem("first");
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                focusMenuItem("last");
              }
            }}
            className="inline-flex min-h-10 w-10 items-center justify-center rounded-r-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-ring sm:min-h-8 sm:w-8"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
              aria-hidden="true"
            />
          </button>
        </MorphPopoverTrigger>
      </div>

      <MorphPopoverContent align="end" className="w-56 p-1.5">
        <div
          ref={menuRef}
          role="menu"
          aria-label="Page actions"
          onKeyDown={handleMenuKeyDown}
        >
          {actions.map((action) => (
            <a
              key={action.label}
              href={action.href}
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={actionClassName}
            >
              <span className="text-muted-foreground">{action.icon}</span>
              {action.label}
            </a>
          ))}
        </div>
      </MorphPopoverContent>
    </MorphPopover>
  );
}
