"use client";

import { Check, Copy } from "lucide-react";
import { useTranslations } from "use-intl";
import { useEffect, useRef, useState } from "react";
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
  const t = useTranslations("Docs.copyButton");
  const [copied, setCopied] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    },
    [],
  );

  return (
    <Button
      variant="secondary"
      size="icon"
      pressScale={0.85}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Clipboard blocked (permission denied or insecure context).
          return;
        }
        setCopied(true);
        if (resetTimer.current) clearTimeout(resetTimer.current);
        resetTimer.current = setTimeout(() => setCopied(false), 1500);
        trackEvent(eventName, { label: eventLabel, chars: text.length });
      }}
      aria-label={copied ? t("copied") : t("copy")}
      className={cn(
        "rounded-full text-muted-foreground hover:text-foreground",
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
