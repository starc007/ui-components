"use client";

import { Copy } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { copySound } from "@/lib/sounds/copy";
import { cn } from "@/lib/utils";

export const copyButtonMessages = {
  copy: "Copy",
  copied: "Copied",
};

export type CopyButtonMessages = typeof copyButtonMessages;

export interface CopyButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "value" | "onCopy"> {
  /** Text to copy, or a function that returns it at click time. */
  value: string | (() => string);
  /** Called with the copied text after it reaches the clipboard. */
  onCopy?: (value: string) => void;
  /** How long the copied state holds, in milliseconds. */
  timeout?: number;
  /** Show "Copy" / "Copied" next to the icon. */
  showLabel?: boolean;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<CopyButtonMessages>;
  /** Play two quick ticks once the text is copied. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

const EXIT = { duration: 0.12, ease: EASE_OUT } as const;
// Faces fade in fast so the swap never shows an empty slot.
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
// The check's stroke draws a beat after it starts to appear.
const DRAW = { duration: 0.28, ease: EASE_OUT, delay: 0.06 } as const;

// In from a little smaller and blurred, out the same way, so the change
// reads as one gesture in both directions.
const ICON_VARIANTS = {
  enter: (reduce: boolean) => ({
    opacity: 0,
    scale: reduce ? 1 : 0.5,
    filter: reduce ? "blur(0px)" : "blur(4px)",
  }),
  center: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: (reduce: boolean) => ({
    opacity: 0,
    scale: reduce ? 1 : 0.5,
    filter: reduce ? "blur(0px)" : "blur(4px)",
    transition: EXIT,
  }),
};

/**
 * Copies text and confirms it: the button tints, the copy icon blurs away
 * as a check scales in and draws its stroke, and with a label the word
 * rolls to Copied while the pill resizes. It settles back after `timeout`.
 */
export function CopyButton({
  value,
  onCopy,
  timeout = 1600,
  showLabel = false,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: CopyButtonProps) {
  const t = useMessages("CopyButton", copyButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const play = useSound(copySound, { enabled: sound });

  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <>
      <motion.button
        type="button"
        aria-label={showLabel ? undefined : t("copy")}
        whileTap={reduce ? undefined : { scale: 0.95 }}
        transition={SPRING_PRESS}
        onClick={async (event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const text = typeof value === "function" ? value() : value;
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            return;
          }
          play();
          setCopied(true);
          onCopy?.(text);
          clearTimeout(timer.current);
          timer.current = setTimeout(() => setCopied(false), timeout);
        }}
        className={cn(
          "inline-flex h-8 items-center rounded-full border px-2 text-sm font-medium transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          copied
            ? "border-primary/30 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
          className,
        )}
        {...rest}
      >
        <span aria-hidden="true" className="relative inline-flex size-4 shrink-0 items-center justify-center">
          <AnimatePresence initial={false} custom={reduce}>
            <motion.span
              key={copied ? "check" : "copy"}
              custom={reduce}
              variants={ICON_VARIANTS}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ ...SPRING_SWAP, opacity: FADE_IN }}
              className="absolute inset-0 inline-flex items-center justify-center"
            >
              {copied ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-4"
                >
                  <motion.path
                    d="M4.5 12.5l5 5L19.5 7"
                    initial={{ pathLength: reduce ? 1 : 0 }}
                    animate={{ pathLength: 1 }}
                    transition={reduce ? { duration: 0 } : DRAW}
                  />
                </svg>
              ) : (
                <Copy className="size-4" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {showLabel ? (
          // Copy → Copied keeps "Cop" and springs the rest in letter by letter.
          <span className="px-1.5">
            <TextMorph>{copied ? t("copied") : t("copy")}</TextMorph>
          </span>
        ) : null}
      </motion.button>
      {/* Outside the button, so the announcement never joins its name. */}
      <span aria-live="polite" className="sr-only">
        {copied ? t("copied") : ""}
      </span>
    </>
  );
}
