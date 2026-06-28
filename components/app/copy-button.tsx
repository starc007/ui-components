"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { trackEvent } from "@/lib/analytics";
import { cn } from "@/lib/utils";

export function CopyButton({
  text,
  className,
  eventName = "copy_code",
  eventLabel,
}: {
  text: string;
  className?: string;
  /** GA4 event name. Defaults to "copy_code". */
  eventName?: string;
  /** What was copied (component slug, filename, install command). */
  eventLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <Button
      variant="secondary"
      size="icon"
      pressScale={0.85}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
        trackEvent(eventName, { label: eventLabel, chars: text.length });
      }}
      aria-label={copied ? "Copied" : "Copy code"}
      className={cn(
        "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <ActionSwapCascadeIcon value={copied ? "check" : "copy"} className="h-3.5 w-3.5">
        {copied
          ? <Check className="h-3.5 w-3.5 text-(--color-success)" />
          : <Copy className="h-3.5 w-3.5" />
        }
      </ActionSwapCascadeIcon>
    </Button>
  );
}
