"use client";

import {
  isMotionValue,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  type ComponentProps,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createOrbRenderer } from "@/components/agents/voice-orb/renderer";
import { SPRING_GLIDE } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type VoiceOrbProps = Omit<
  ComponentProps<"div">,
  "children" | "onError"
> & {
  /** Normalized activity, from 0 to 1. A MotionValue avoids React render loops. */
  activity?: number | MotionValue<number>;
  /** Optional caller-owned audio analyser. The component never requests a microphone. */
  analyser?: AnalyserNode | null;
  /** Base pigment, highlight and shadow, as #RGB or #RRGGBB hex colors. */
  colors?: readonly [string, string, string];
  /** Pause the material while keeping the current surface visible. */
  active?: boolean;
  speed?: number;
  onError?: (error: Error) => void;
};

const DEFAULT_COLORS = ["#e8754d", "#ffe0ac", "#346b52"] as const;
const level = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;

/** A grainy liquid sphere whose surface and silhouette respond to voice activity. */
export function VoiceOrb({
  activity = 0,
  analyser = null,
  colors = DEFAULT_COLORS,
  active = true,
  speed = 1,
  onError,
  className,
  style,
  "aria-label": label,
  ...props
}: VoiceOrbProps) {
  const reducedMotion = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<ReturnType<typeof createOrbRenderer> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const target = useMotionValue(0);
  const smooth = useSpring(target, SPRING_GLIDE);
  const transform = useTransform(
    smooth,
    (value) =>
      `translate3d(0, ${-value * 3}px, 0) scale(${1 + value * 0.025}, ${1 - value * 0.014})`,
  );
  const latest = useRef({
    activity,
    analyser,
    colors,
    active,
    speed,
    reducedMotion,
    onError,
  });
  useLayoutEffect(() => {
    latest.current = {
      activity,
      analyser,
      colors,
      active,
      speed,
      reducedMotion,
      onError,
    };
    const value =
      active && !reducedMotion
        ? level(isMotionValue(activity) ? activity.get() : activity)
        : 0;
    if (reducedMotion) {
      smooth.jump(0);
      target.set(0);
    } else target.set(value);
    renderer.current?.requestDraw();
  });

  useEffect(() => {
    if (!isMotionValue(activity)) return;
    return activity.on("change", (value) => {
      if (latest.current.active && !latest.current.reducedMotion)
        target.set(level(value));
      renderer.current?.requestDraw();
    });
  }, [activity, target]);

  useEffect(() => {
    const element = canvas.current;
    if (!element) return;
    let sample: Uint8Array<ArrayBuffer> | null = null;
    let audioSource: AnalyserNode | null = null;
    const failed = (failure: Error) => {
      setError(failure);
      latest.current.onError?.(failure);
    };
    try {
      renderer.current = createOrbRenderer(
        element,
        () => {
          const current = latest.current;
          let activityLevel = level(
            isMotionValue(current.activity)
              ? current.activity.get()
              : current.activity,
          );
          if (current.analyser && current.active && !current.reducedMotion) {
            if (
              audioSource !== current.analyser ||
              sample?.length !== current.analyser.fftSize
            ) {
              audioSource = current.analyser;
              sample = new Uint8Array(
                new ArrayBuffer(current.analyser.fftSize),
              );
            }
            if (sample) {
              current.analyser.getByteTimeDomainData(sample);
              let sum = 0;
              for (const byte of sample) sum += ((byte - 128) / 128) ** 2;
              activityLevel = level(Math.sqrt(sum / sample.length) * 3);
              target.set(activityLevel);
            }
          }
          return {
            activity:
              current.active && !current.reducedMotion ? activityLevel : 0,
            colors: current.colors,
            speed: Number.isFinite(current.speed)
              ? Math.max(0, current.speed)
              : 1,
            animated:
              current.active &&
              !current.reducedMotion &&
              (current.speed > 0 || !!current.analyser),
          };
        },
        failed,
      );
    } catch (failure) {
      failed(failure instanceof Error ? failure : new Error(String(failure)));
    }
    return () => {
      renderer.current?.dispose();
      renderer.current = null;
    };
  }, [target]);

  return (
    <div
      {...props}
      role="img"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      data-slot="voice-orb"
      data-render-state={error ? "error" : "ready"}
      className={cn("relative aspect-square w-64 shrink-0", className)}
      style={style}
    >
      {error ? (
        <div className="flex size-full items-center justify-center rounded-full border border-border bg-card p-8 text-center text-xs text-muted-foreground">
          Orb rendering unavailable
        </div>
      ) : (
        <motion.div
          className="size-full"
          style={{ transform: reducedMotion ? "none" : transform }}
        >
          <canvas ref={canvas} className="block size-full" />
        </motion.div>
      )}
    </div>
  );
}
