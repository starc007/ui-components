"use client";

import { AnimatePresence, animate, type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, SPRING_GLIDE, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const downloadButtonMessages = {
  download: "Download",
  downloading: "Downloading",
  downloaded: "Downloaded",
  progress: "Download progress",
};

export type DownloadButtonMessages = typeof downloadButtonMessages;

type Phase = "idle" | "downloading" | "done";

export interface DownloadButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  /**
   * Runs the download. Call `report` with progress from 0 to 1 to fill the
   * ring; return a promise to finish when it settles. Without it the ring
   * fills on its own, as a demo.
   */
  onDownload?: (report: (progress: number) => void) => unknown;
  labels?: Partial<DownloadButtonMessages>;
}

// Done holds this long before the button is ready again.
const DONE_MS = 2000;
// Without onDownload, the ring fills over this long.
const DEMO_SECONDS = 1.8;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
const DRAW = { duration: 0.3, ease: EASE_OUT, delay: 0.06 } as const;
// The arrow drops into the tray on a falling curve as it leaves.
const DROP = { duration: 0.24, ease: EASE_IN } as const;
const BOB = { duration: 0.9, ease: EASE_IN_OUT, repeat: Number.POSITIVE_INFINITY, repeatType: "mirror" } as const;

const SWAP = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(3px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(3px)", transition: EXIT },
  transition: { ...SPRING_SWAP, opacity: FADE_IN },
};

/**
 * A download in three steps. The arrow drops into the tray, a ring fills
 * around the icon as the file comes in, then it closes into a check while
 * Download morphs to Downloading and Downloaded.
 */
export function DownloadButton({ onDownload, labels, className, onClick, ...rest }: DownloadButtonProps) {
  const t = useMessages("DownloadButton", downloadButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (phase !== "done") return;
    const id = setTimeout(() => setPhase("idle"), DONE_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const start = async () => {
    setProgress(0);
    setPhase("downloading");
    try {
      if (onDownload) {
        await onDownload((value) => setProgress(Math.min(1, Math.max(0, value))));
      } else {
        await animate(0, 1, { duration: DEMO_SECONDS, ease: EASE_IN_OUT, onUpdate: setProgress });
      }
    } catch {
      setPhase("idle");
      return;
    }
    setProgress(1);
    setPhase("done");
  };

  const instant = { duration: 0 };
  const swap = reduce ? { ...SWAP, initial: { opacity: 0 }, exit: { opacity: 0, transition: EXIT } } : SWAP;

  return (
    <motion.button
      type="button"
      aria-busy={phase === "downloading" || undefined}
      whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || phase !== "idle") return;
        void start();
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        phase === "idle" && "border-border text-foreground hover:bg-muted/60",
        phase !== "idle" && "border-primary/30 bg-primary/10 text-primary",
        className,
      )}
      {...rest}
    >
      <span className="relative inline-flex size-4 shrink-0">
        <AnimatePresence initial={false}>
          {phase === "idle" ? (
            <motion.svg
              key="idle"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              initial={swap.initial}
              animate={swap.animate}
              exit={{ opacity: 0, transition: { ...EXIT, delay: 0.1 } }}
              transition={swap.transition}
            >
              <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
              {/* The arrow drops into the tray as the download starts. */}
              <motion.g exit={reduce ? undefined : { y: 6, opacity: 0, transition: DROP }}>
                <path d="M12 3v11" />
                <path d="M7.5 9.5L12 14l4.5-4.5" />
              </motion.g>
            </motion.svg>
          ) : phase === "downloading" ? (
            <motion.span
              key="downloading"
              role="progressbar"
              aria-label={t("progress")}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress * 100)}
              className="absolute inset-0 inline-flex"
              {...swap}
            >
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
                <circle cx="12" cy="12" r="9.5" className="opacity-20" />
                {/* The ring fills from 12 o'clock as the file comes in. */}
                <motion.circle
                  cx="12"
                  cy="12"
                  r="9.5"
                  className="origin-center -rotate-90 [transform-box:fill-box]"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: Math.max(0.001, progress) }}
                  transition={reduce ? instant : SPRING_GLIDE}
                />
                <motion.path
                  d="M9 11.5l3 3 3-3"
                  animate={reduce ? undefined : { y: [-1.2, 1.2] }}
                  transition={BOB}
                />
              </svg>
            </motion.span>
          ) : (
            <motion.svg
              key="done"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute inset-0 size-4"
              {...swap}
            >
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? instant : DRAW}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
      <span className="px-1.5">
        <TextMorph>{t(phase === "idle" ? "download" : phase === "downloading" ? "downloading" : "downloaded")}</TextMorph>
      </span>
    </motion.button>
  );
}
