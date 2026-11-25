"use client";

import { Check, Hash } from "lucide-react";
import { type MouseEvent, type ReactNode, useEffect, useRef, useState } from "react";
import { useTranslations } from "use-intl";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Tooltip } from "@/components/motion/tooltip";
import { trackEvent } from "@/lib/analytics";
import { useRouter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type HeadingTag = "h1" | "h2" | "h3";

/**
 * A `#` link beside a docs heading. Clicking it copies the page URL with the
 * section hash and puts the hash in the address bar without scrolling.
 * Modified clicks (new tab, new window) keep the browser's default.
 */
export function HeadingAnchor({
  hash,
  label,
  size = "sm",
  className,
}: {
  /** Section id to link to. Omit to link the page itself. */
  hash?: string;
  /** The heading text, for the accessible name. */
  label: string;
  size?: "sm" | "lg";
  className?: string;
}) {
  const t = useTranslations("Docs.headingAnchor");
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  const onClick = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    const url = new URL(window.location.href);
    url.hash = hash ?? "";
    // Through the router, which would otherwise answer a bare replaceState
    // by scrolling the section to the top.
    void router.replaceHash(hash ?? "");
    try {
      await navigator.clipboard.writeText(url.toString());
    } catch {
      // Clipboard blocked (permission denied or insecure context). The
      // address bar still holds the link.
      return;
    }
    setCopied(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied(false), 1500);
    trackEvent("copy_heading_link", { label: hash ?? "page" });
  };

  const iconClass = size === "lg" ? "size-4" : "size-3.5";

  return (
    <Tooltip content={copied ? t("copied") : t("copy")} side="top">
      <a
        href={hash ? `#${hash}` : "#"}
        onClick={onClick}
        aria-label={copied ? t("copied") : t("copyAria", { section: label })}
        data-copied={copied || undefined}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none",
          "opacity-0 transition-[opacity,color,background-color] duration-150 ease-out",
          "hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring",
          "group-hover/heading:opacity-100 data-copied:opacity-100 pointer-coarse:opacity-60",
          size === "lg" ? "-my-1 size-8" : "-my-1 size-6",
          className,
        )}
      >
        <ActionSwapCascadeIcon value={copied ? "check" : "hash"} className={iconClass}>
          {copied ? (
            <Check aria-hidden="true" className={cn(iconClass, "text-(--color-success)")} />
          ) : (
            <Hash aria-hidden="true" className={iconClass} />
          )}
        </ActionSwapCascadeIcon>
      </a>
    </Tooltip>
  );
}

/**
 * A docs heading with a copy-link `#` beside it. Pass `id` when the heading
 * itself is the link target, or `section` when a wrapping section carries the
 * id. With neither (page titles), no `#` shows: it would only link the page
 * the reader is already on.
 */
export function AnchorHeading({
  as: Tag = "h2",
  id,
  section,
  children,
  className,
  headingClassName,
  trailing,
}: {
  as?: HeadingTag;
  id?: string;
  section?: string;
  children: string;
  /** Classes for the row (margins, gap). */
  className?: string;
  /** Classes for the heading text. */
  headingClassName?: string;
  /** Shown after the `#`, such as a New badge. */
  trailing?: ReactNode;
}) {
  const hash = id ?? section;
  return (
    <div className={cn("group/heading flex min-w-0 items-center gap-1.5", className)}>
      <Tag id={id} className={cn(id && "scroll-mt-24", headingClassName)}>
        {children}
      </Tag>
      {hash ? <HeadingAnchor hash={hash} label={children} size={Tag === "h1" ? "lg" : "sm"} /> : null}
      {trailing}
    </div>
  );
}
