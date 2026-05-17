"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      aria-label="Copy code"
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-(--color-border) bg-(--color-bg) text-(--color-fg-muted) hover:text-(--color-fg) transition-colors",
        className,
      )}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-(--color-success)" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}
