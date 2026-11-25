"use client";

import { ArrowUp, Check, Mic, Trash2 } from "lucide-react";
import {
  type AnimationPlaybackControls,
  animate,
  isMotionValue,
  type MotionValue,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { type ComponentProps, useEffect, useLayoutEffect, useRef, useState } from "react";
import { IconSwap } from "@/components/agents/icon-swap";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const voiceNoteMessages = {
  record: "Record voice note",
  send: "Send voice note",
  discard: "Discard recording",
  recording: "Recording",
  sent: "Voice note sent",
};

export type VoiceNoteMessages = typeof voiceNoteMessages;

export interface VoiceNoteProps extends Omit<ComponentProps<"div">, "children" | "onSubmit"> {
  /** Live input level from 0 to 1 while recording, as a number or a MotionValue. Without it the waveform idles softly. */
  level?: number | MotionValue<number>;
  /** Called when recording starts. Start your recorder here; the component never opens the microphone. */
  onRecordStart?: () => void;
  /** Called when the recording is thrown away, from the discard button or Escape. */
  onDiscard?: () => void;
  /** Called with the recording's length in ms when it is sent. */
  onSend?: (durationMs: number) => void;
  /** Stops recording and sends once it reaches this length, in seconds. Default: no limit */
  maxDuration?: number;
  /** Blocks starting a recording. Default: false */
  disabled?: boolean;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<VoiceNoteMessages>;
}

// Half the control's height: the mic's radius, and the bar's end caps.
const RADIUS = 20;
// Enough to fill a wide bar; the oldest are clipped off on the left.
const BARS = 56;
const SAMPLE_MS = 90;
const SENT_MS = 1200;
// The bar's controls fade in as it opens and out as soon as it starts to close.
const CONTENT_IN = { duration: 0.2, ease: EASE_OUT, delay: 0.08 } as const;
const CONTENT_OUT = { duration: 0.1, ease: EASE_OUT } as const;
// The mic's icon fades in at the bar's centre as it folds, so the bar lands as
// the mic itself.
const ICON_IN = { duration: 0.16, ease: EASE_OUT, delay: 0.06 } as const;
// A visible bounce both ways, local because only this morph wants it.
// Opening overshoots about 6% (~11px a side on a 384px bar, inside OVERSHOOT).
const OPEN_BOUNCE = { type: "spring", duration: 0.55, bounce: 0.34 } as const;
// Closing squeezes past the mic's circle and pops back. Gentler than opening:
// the same bounce would pinch the 40px circle to a sliver.
const CLOSE_BOUNCE = { type: "spring", duration: 0.5, bounce: 0.25 } as const;
// Room (px) on each side for the open bounce to overshoot into: the bar rests
// this far inside a frame that is wider than the control.
const OVERSHOOT = 16;

function clock(ms: number) {
  const seconds = Math.floor(ms / 1000);
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * A mic button that opens into a recording bar: discard, a timer, a live
 * waveform and send. The bar springs out of the mic's circle to both sides at
 * once and folds back into the centre on send or discard, where the mic
 * briefly shows a check. Recording itself is the app's: start it in
 * `onRecordStart` and pass the input level in, so the waveform moves with the
 * voice.
 */
export function VoiceNote({
  level,
  onRecordStart,
  onDiscard,
  onSend,
  maxDuration,
  disabled = false,
  labels,
  className,
  ...props
}: VoiceNoteProps) {
  const t = useMessages("voiceNote", voiceNoteMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const [recording, setRecording] = useState(false);
  // The bar stays mounted while it folds away, after recording has stopped.
  const [barShown, setBarShown] = useState(false);
  const [sent, setSent] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [samples, setSamples] = useState<number[]>(() => Array(BARS).fill(0));
  const startedAt = useRef(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLButtonElement>(null);
  const sendRef = useRef<HTMLButtonElement>(null);
  const morph = useRef<AnimationPlaybackControls | undefined>(undefined);
  const latest = useRef({ level, onSend, maxDuration });
  useLayoutEffect(() => {
    latest.current = { level, onSend, maxDuration };
  });

  // How far (px) the bar is clipped in from each side. At half the width less
  // the radius it is exactly the mic's circle; at 0 it is the full bar. One
  // spring drives it, so the bar opens to both sides at once without its
  // width ever being animated.
  const inset = useMotionValue(10_000);
  const frameClip = useMotionTemplate`inset(0 ${inset}px round ${RADIUS}px)`;
  // The surface sits 1px inside the frame, so the same inset leaves a 1px ring
  // of the frame showing: the border travels with the ends as they move.
  const surfaceClip = useMotionTemplate`inset(0 ${inset}px round ${RADIUS - 1}px)`;
  // The frame is OVERSHOOT wider than the control on each side: open rests at
  // OVERSHOOT, and closed is the mic's circle in the middle.
  const closed = () =>
    Math.max(0, (rootRef.current?.offsetWidth ?? 0) / 2 + OVERSHOOT - RADIUS);

  const start = () => {
    if (disabled || recording) return;
    startedAt.current = performance.now();
    setElapsed(0);
    setSamples(Array(BARS).fill(0));
    setSent(false);
    setRecording(true);
    setBarShown(true);
    onRecordStart?.();
    morph.current?.stop();
    if (reduce) {
      inset.set(OVERSHOOT);
    } else {
      if (!barShown) inset.set(closed());
      morph.current = animate(inset, OVERSHOOT, OPEN_BOUNCE);
    }
  };

  const fold = () => {
    morph.current?.stop();
    if (reduce) {
      inset.set(closed());
      setBarShown(false);
      return;
    }
    morph.current = animate(inset, closed(), {
      ...CLOSE_BOUNCE,
      // Settled on the mic's circle with the mic's icon in it: swap in the
      // real button, which looks the same.
      onComplete: () => setBarShown(false),
    });
  };

  const stop = (send: boolean) => {
    if (!recording) return;
    setRecording(false);
    fold();
    if (send) {
      latest.current.onSend?.(performance.now() - startedAt.current);
      setSent(true);
    } else {
      onDiscard?.();
    }
  };

  // The timer reads the current stop through a ref, so it never acts on the
  // state of the render that started it.
  const stopRef = useRef(stop);
  useLayoutEffect(() => {
    stopRef.current = stop;
  });

  // Sample the level into a rolling waveform and run the timer.
  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => {
      const { level: input, maxDuration: limit } = latest.current;
      const value =
        input === undefined
          ? 0.12 + Math.random() * 0.14
          : isMotionValue(input)
            ? input.get()
            : input;
      setSamples((current) => [...current.slice(1), Math.max(0, Math.min(1, value))]);
      const now = performance.now() - startedAt.current;
      setElapsed(now);
      // Reaching the limit sends, exactly as the send button would.
      if (limit !== undefined && now >= limit * 1000) stopRef.current(true);
    }, SAMPLE_MS);
    return () => window.clearInterval(timer);
  }, [recording]);

  // Focus follows the control that took the mic's place, and comes back.
  useEffect(() => {
    if (recording) sendRef.current?.focus({ preventScroll: true });
  }, [recording]);
  // Focus goes back once the bar has landed and the mic is a button again.
  const wasShown = useRef(false);
  useEffect(() => {
    if (wasShown.current && !barShown) micRef.current?.focus({ preventScroll: true });
    wasShown.current = barShown;
  }, [barShown]);

  useEffect(() => {
    if (!sent) return;
    const timer = window.setTimeout(() => setSent(false), SENT_MS);
    return () => window.clearTimeout(timer);
  }, [sent]);

  useEffect(() => () => morph.current?.stop(), []);

  return (
    <div
      ref={rootRef}
      data-state={recording ? "recording" : sent ? "sent" : "idle"}
      className={cn("relative flex h-10 w-full justify-center", className)}
      {...props}
    >
      <span aria-live="polite" className="sr-only">
        {recording ? t("recording") : sent ? t("sent") : ""}
      </span>

      <Tooltip content={barShown ? null : t("record")} side="top">
        <motion.button
          ref={micRef}
          type="button"
          aria-label={t("record")}
          disabled={disabled}
          inert={barShown}
          onClick={start}
          // The bar takes its place while open and lands back as an exact copy
          // of it, so the swap either way is instant and invisible.
          initial={false}
          animate={{ opacity: barShown ? 0 : 1 }}
          transition={{ duration: 0 }}
          whileTap={reduce ? undefined : { scale: 0.95 }}
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            sent && "text-emerald-500 hover:text-emerald-500",
          )}
        >
          <IconSwap id={sent ? "sent" : "mic"}>
            {sent ? <Check className="size-4" /> : <Mic className="size-4" />}
          </IconSwap>
        </motion.button>
      </Tooltip>

      {barShown ? (
        <motion.div
          inert={!recording}
          // With reduced motion the bar does not morph, so it fades instead.
          initial={reduce ? { opacity: 0 } : false}
          animate={{ opacity: reduce && !recording ? 0 : 1 }}
          transition={{ duration: reduce ? 0.15 : 0 }}
          style={{ clipPath: frameClip, borderRadius: RADIUS }}
          onKeyDown={(event) => {
            if (event.key !== "Escape") return;
            event.preventDefault();
            stop(false);
          }}
          // Wider than the control by OVERSHOOT each side, so the open bounce
          // has room to swing past full width.
          className="absolute inset-y-0 -inset-x-4 bg-border p-px"
        >
          <motion.div
            style={{ clipPath: surfaceClip, borderRadius: RADIUS - 1 }}
            className="relative size-full bg-background"
          >
            {/* Folding, the bar becomes the mic: its icon fades in at the centre. */}
            <motion.span
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: recording ? 0 : 1, transition: recording ? CONTENT_OUT : ICON_IN }}
              className={cn(
                "pointer-events-none absolute inset-0 grid place-items-center",
                sent ? "text-emerald-500" : "text-muted-foreground",
              )}
            >
              {sent ? <Check className="size-4" /> : <Mic className="size-4" />}
            </motion.span>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: recording ? 1 : 0, transition: recording ? CONTENT_IN : CONTENT_OUT }}
              // The visible bar starts OVERSHOOT in from the surface's edge.
              className="flex size-full items-center gap-2 px-[19px]"
            >
              <Tooltip content={t("discard")} side="top">
                <motion.button
                  type="button"
                  aria-label={t("discard")}
                  onClick={() => stop(false)}
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                  transition={SPRING_PRESS}
                  className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/[0.06] hover:text-rose-500 focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Trash2 className="size-4" />
                </motion.button>
              </Tooltip>

              <span
                aria-hidden="true"
                className="flex shrink-0 items-center gap-1.5 font-mono text-xs tabular-nums text-foreground"
              >
                <motion.span
                  className="size-1.5 rounded-full bg-rose-500"
                  animate={reduce ? undefined : { opacity: [1, 0.35, 1] }}
                  transition={{ duration: 1.2, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY }}
                />
                {clock(elapsed)}
              </span>

              {/* Newest sample on the right; bars scale, they never resize. */}
              <span
                aria-hidden="true"
                className="flex h-6 min-w-0 flex-1 items-center justify-end gap-[2px] overflow-hidden"
              >
                {samples.map((value, index) => (
                  <span
                    // biome-ignore lint/suspicious/noArrayIndexKey: bars are fixed slots
                    key={index}
                    className="h-full w-[3px] shrink-0 origin-center rounded-full bg-foreground/70 transition-transform duration-100 ease-out"
                    style={{ transform: `scaleY(${Math.max(0.12, value)})` }}
                  />
                ))}
              </span>

              <Tooltip content={t("send")} side="top">
                <motion.button
                  ref={sendRef}
                  type="button"
                  aria-label={t("send")}
                  onClick={() => stop(true)}
                  whileTap={reduce ? undefined : { scale: 0.95 }}
                  transition={SPRING_PRESS}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <ArrowUp className="size-4" />
                </motion.button>
              </Tooltip>
            </motion.div>
          </motion.div>
        </motion.div>
      ) : null}
    </div>
  );
}
