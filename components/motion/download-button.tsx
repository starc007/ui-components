"use client";

import {
  AnimatePresence,
  type AnimationPlaybackControls,
  animate,
  type HTMLMotionProps,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_IN_OUT, EASE_OUT, SPRING_GLIDE, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { successSound } from "@/lib/sounds/success";
import { tapSound } from "@/lib/sounds/tap";
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
   * Runs the download. Call `report` with progress from 0 to 1 to move the
   * fill; return a promise to finish when it settles. Without it the fill
   * runs on its own, as a demo.
   */
  onDownload?: (report: (progress: number) => void) => unknown;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<DownloadButtonMessages>;
  /** Play a tap on start and a success chime when done. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

// The pill, and the round badge it folds into when the download is done.
const WIDE = 192;
const ROUND = 40;
// The badge holds this long before it opens back into the button.
const DONE_MS = 1300;
// Without onDownload, the fill runs over this long.
const DEMO_SECONDS = 2.4;
// One stripe period, in px: the stripe layer slides this far per loop.
const STRIPE = 16;

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
const FADE = { duration: 0.16, ease: EASE_OUT } as const;
// The check pops in a beat after the pill has folded.
const DRAW = { duration: 0.32, ease: EASE_OUT, delay: 0.22 } as const;
const POP = { ...SPRING_PRESS, delay: 0.18 } as const;
// While it works, an arrow keeps dropping into the tray.
const DROP = { duration: 0.9, ease: EASE_IN, repeat: Number.POSITIVE_INFINITY } as const;
// The stripes drift evenly; easing would make them pulse.
const DRIFT = { duration: 0.7, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;

/**
 * A download where the whole button is the progress bar. Colour sweeps
 * across the pill with a bright leading edge and drifting stripes, and the
 * label and icon turn white exactly where the fill passes. When it is done
 * the pill folds into a round badge where a check pops in, then opens back
 * into the button as the colour drains away.
 */
export function DownloadButton({
  onDownload,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: DownloadButtonProps) {
  const t = useMessages("DownloadButton", downloadButtonMessages, labels);
  const playStart = useSound(tapSound, { enabled: sound });
  const playDone = useSound(successSound, { enabled: sound });
  const reduce = Boolean(useReducedMotion());
  const [phase, setPhase] = useState<Phase>("idle");
  const [percent, setPercent] = useState(0);

  // Progress drives one value; a critically damped spring smooths uneven
  // reports into a steady sweep, and the clip and the edge both read it.
  const target = useMotionValue(0);
  const smooth = useSpring(target, SPRING_GLIDE);
  const progress = reduce ? target : smooth;
  const right = useTransform(progress, (value) => `${(1 - value) * 100}%`);
  const clip = useMotionTemplate`inset(0 ${right} 0 0)`;
  // The leading edge rides the fill: a full-width layer whose right edge
  // sits at the progress, moved by transform only.
  const edgeX = useTransform(progress, (value) => `${(value - 1) * 100}%`);
  const fillOpacity = useMotionValue(0);
  const drainRef = useRef<AnimationPlaybackControls | null>(null);

  const report = (value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    target.set(clamped);
    setPercent(Math.round(clamped * 100));
  };

  const reset = () => {
    target.jump(0);
    smooth.jump(0);
    setPercent(0);
  };

  // Done: hold the badge, then open back into the button as the colour
  // drains, and reset the fill under it once it is gone.
  useEffect(() => {
    if (phase !== "done") return;
    const id = setTimeout(() => {
      setPhase("idle");
      const drain = animate(fillOpacity, 0, { duration: 0.3, ease: EASE_OUT });
      drainRef.current = drain;
      drain.then(() => {
        if (drainRef.current !== drain) return;
        drainRef.current = null;
        target.jump(0);
        smooth.jump(0);
        setPercent(0);
      });
    }, DONE_MS);
    return () => clearTimeout(id);
  }, [phase, fillOpacity, target, smooth]);

  const start = async () => {
    // A press during the drain stops it, so it cannot pull the new fill to 0.
    drainRef.current?.stop();
    drainRef.current = null;
    reset();
    fillOpacity.set(1);
    setPhase("downloading");
    try {
      if (onDownload) await onDownload(report);
      else await animate(0, 1, { duration: DEMO_SECONDS, ease: EASE_IN_OUT, onUpdate: report });
    } catch {
      fillOpacity.set(0);
      reset();
      setPhase("idle");
      return;
    }
    report(1);
    playDone();
    setPhase("done");
  };

  const instant = { duration: 0 };
  const done = phase === "done";
  const label = t(phase === "idle" ? "download" : phase === "downloading" ? "downloading" : "downloaded");

  // The content is drawn twice, identically: in ink on the button, and in
  // white on the fill, clipped to the progress. Where the fill has reached,
  // you see the white copy.
  const content = (onFill: boolean) => (
    <motion.span
      aria-hidden={onFill || undefined}
      className="flex items-center justify-center gap-2 whitespace-nowrap"
      initial={false}
      animate={{ opacity: done ? 0 : 1, scale: done && !reduce ? 0.9 : 1 }}
      transition={done ? FADE : { ...FADE, delay: 0.12 }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 shrink-0 overflow-hidden"
      >
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
        <motion.g
          initial={false}
          animate={
            phase === "downloading" && !reduce
              ? { y: [-12, 0, 3], opacity: [0, 1, 0] }
              : { y: 0, opacity: 1 }
          }
          transition={phase === "downloading" && !reduce ? { ...DROP, times: [0, 0.6, 1] } : SPRING_PRESS}
        >
          <path d="M12 3v11" />
          <path d="M7.5 9.5L12 14l4.5-4.5" />
        </motion.g>
      </svg>
      <span className="inline-flex items-center gap-1">
        <TextMorph>{label}</TextMorph>
        {phase === "downloading" ? (
          // A fixed slot, so the label never shifts as the number grows.
          <motion.span
            className="inline-block w-[4ch] text-left tabular-nums"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={FADE}
          >
            {percent}%
          </motion.span>
        ) : null}
      </span>
    </motion.span>
  );

  return (
    <>
      <motion.button
        type="button"
        aria-busy={phase === "downloading" || undefined}
        aria-label={done ? t("downloaded") : undefined}
        whileTap={reduce || phase !== "idle" ? undefined : { scale: 0.96 }}
        initial={false}
        // Folds into a round badge when done, and opens back out after.
        animate={{ width: done ? ROUND : WIDE }}
        transition={{ width: reduce ? instant : SPRING_SWAP, scale: SPRING_PRESS }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || phase !== "idle") return;
          playStart();
          void start();
        }}
        className={cn(
          "relative isolate inline-flex h-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background text-sm font-medium text-foreground transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
          "disabled:pointer-events-none disabled:opacity-50",
          phase === "idle" && "hover:bg-muted/60",
          className,
        )}
        {...rest}
      >
        {content(false)}

        {/* The fill, clipped to the progress, with the white copy of the content on it. */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center overflow-hidden bg-primary text-primary-foreground"
          style={{ clipPath: clip, opacity: fillOpacity }}
        >
          {/* Fine stripes drifting through the fill while it works. */}
          {!reduce ? (
            <motion.span
              className="absolute inset-y-0 -left-4 -right-4"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-45deg, transparent 0 6px, color-mix(in oklab, currentColor 12%, transparent) 6px 8px)",
              }}
              initial={false}
              animate={phase === "downloading" ? { x: [0, -STRIPE], opacity: 1 } : { x: 0, opacity: 0 }}
              transition={phase === "downloading" ? { x: DRIFT, opacity: FADE } : FADE}
            />
          ) : null}
          {/* The bright leading edge, riding the front of the fill. */}
          <motion.span className="absolute inset-0" style={{ x: edgeX }}>
            <motion.span
              className="absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-white/30"
              initial={false}
              animate={{ opacity: phase === "downloading" ? 1 : 0 }}
              transition={FADE}
            />
          </motion.span>
          <span className="relative">{content(true)}</span>
        </motion.span>

        {/* The badge's check, popping in once the pill has folded. */}
        <AnimatePresence>
          {done ? (
            <motion.svg
              key="check"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="absolute size-5 text-primary-foreground"
              initial={{ scale: reduce ? 1 : 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduce ? 1 : 0.6, opacity: 0, transition: EXIT }}
              transition={{ scale: reduce ? instant : POP, opacity: { ...FADE, delay: reduce ? 0 : 0.16 } }}
            >
              <motion.path
                d="M4.5 12.5l5 5L19.5 7"
                initial={{ pathLength: reduce ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={reduce ? instant : DRAW}
              />
            </motion.svg>
          ) : null}
        </AnimatePresence>

        {phase === "downloading" ? (
          <span
            role="progressbar"
            aria-label={t("progress")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="sr-only"
          />
        ) : null}
      </motion.button>
      <span aria-live="polite" className="sr-only">
        {done ? t("downloaded") : ""}
      </span>
    </>
  );
}
