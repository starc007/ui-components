"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ActionSwapIcon } from "@/components/motion/action-swap";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { type WalletCardMessages, walletCardMessages } from "./messages";

/**
 * Copies `value` to the clipboard and swaps the copy icon for a check via the
 * library's ActionSwapIcon. Stops click propagation so it can sit inside a
 * selectable row.
 */
export function CopyButton({
  value,
  className,
  labels,
}: {
  value: string;
  className?: string;
  labels?: Partial<WalletCardMessages>;
}) {
  const t = useMessages("walletCard", walletCardMessages, labels);
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // clipboard may be unavailable (insecure context) — swap anyway
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1400);
  };

  return (
    <button
      type="button"
      aria-label={copied ? t("copied") : t("copyAddress")}
      onClick={(e) => {
        e.stopPropagation();
        copy();
      }}
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <ActionSwapIcon
        value={copied ? "check" : "copy"}
        animation="cascade"
        className="h-3.5 w-3.5"
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-emerald-500" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionSwapIcon>
    </button>
  );
}
