"use client";

import {
  type AnimationPlaybackControls,
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
} from "motion/react";
import { type ComponentProps, useEffect, useRef } from "react";
import { EASE_IN_OUT, EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export type StatusIconStatus = "idle" | "syncing" | "success" | "warning" | "error";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const statusIconMessages = {
  idle: "Idle",
  syncing: "Syncing",
  success: "Done",
  warning: "Needs attention",
  error: "Failed",
};

export type StatusIconMessages = typeof statusIconMessages;

export interface StatusIconProps extends Omit<ComponentProps<"span">, "children"> {
  /** Which state to show. The icon morphs from one state to the next. Default: "idle" */
  status?: StatusIconStatus;
  /** Width and height in px. Default: 20 */
  size?: number;
  /** Hides the icon from assistive technology, for when nearby text already says the status. Default: false */
  decorative?: boolean;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<StatusIconMessages>;
}

const COLOR: Record<StatusIconStatus, string> = {
  idle: "text-muted-foreground/45",
  syncing: "text-foreground",
  success: "text-emerald-500",
  warning: "text-amber-500",
  error: "text-rose-500",
};

// The arc turns like a wheel: syncing spins it up to a steady speed, and when
// the work settles it coasts on with the speed it had and eases to a stop at
// the top. Its length breathes while it turns, like a system spinner.
const SPEED = 420; // degrees per second at full spin
const SPIN_UP = { duration: 0.4, ease: EASE_OUT } as const;
// Coasting: an ease-out quad starts at twice its average speed, so a coast of
// COAST_S seconds over (speed × COAST_S / 2) degrees leaves at exactly the
// speed the wheel had and slows to rest. A full ring hides its angle, so the
// stop can be anywhere. The curve is easeOutQuad, local because its starting
// slope (2) is what makes the hand-off seamless.
const COAST_S = 0.42;
const COAST_EASE = [0.5, 1, 0.89, 1] as const;
const BREATH = {
  duration: 1.4,
  ease: EASE_IN_OUT,
  repeat: Number.POSITIVE_INFINITY,
  repeatType: "reverse",
} as const;
const ARC_SHORT = 0.16;
const ARC_LONG = 0.62;
// Settling is one motion, not three steps: the ring closes as the arc slows,
// the fill swells in while it finishes, and the mark draws as the fill lands.
const CLOSE = { type: "spring", duration: 0.5, bounce: 0 } as const;
const FILL = { ...SPRING_SWAP, delay: 0.1 } as const;
const MARK_IN = { duration: 0.24, ease: EASE_OUT, delay: 0.18 } as const;
const OPEN = { duration: 0.3, ease: EASE_OUT } as const;
const OUT = { duration: 0.14, ease: EASE_OUT } as const;

/**
 * One status icon that morphs instead of swapping glyphs. Syncing turns an arc
 * whose length breathes. On success, warning or error the arc carries on from
 * wherever it is and sweeps round to close the ring, the ring fills in that
 * state's colour with a small spring, and a white check, exclamation or cross
 * draws in. Going back to syncing empties it and the arc opens again. Idle is
 * a faint ring.
 */
export function StatusIcon({
  status = "idle",
  size = 20,
  decorative = false,
  labels,
  className,
  ...props
}: StatusIconProps) {
  const t = useMessages("statusIcon", statusIconMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const syncing = status === "syncing";
  const settled = status === "success" || status === "warning" || status === "error";

  // The arc's angle, spin speed and length are driven by hand, so every change
  // starts from where the arc really is and how fast it is really turning.
  const rotate = useMotionValue(0);
  const speed = useMotionValue(0);
  const spinning = useRef(false);
  const length = useMotionValue(settled ? 1 : ARC_SHORT);
  const arcOpacity = useMotionValue(syncing || settled ? 1 : 0);
  const running = useRef<AnimationPlaybackControls[]>([]);

  // While spinning, the angle advances by the current speed every frame, so
  // speeding up and slowing down are just changes to `speed`.
  useAnimationFrame((_, delta) => {
    if (!spinning.current) return;
    rotate.set(rotate.get() + (speed.get() * Math.min(delta, 50)) / 1000);
  });

  // Bumped on every state change, so a step queued by an older state is dropped.
  const sessionRef = useRef(0);

  useEffect(() => {
    const session = ++sessionRef.current;
    for (const controls of running.current) controls.stop();
    running.current = [];
    const run = (controls: AnimationPlaybackControls) => running.current.push(controls);

    // Hand the wheel's momentum to a coast that eases it to rest.
    const coast = () => {
      const velocity = spinning.current ? speed.get() : 0;
      spinning.current = false;
      speed.set(0);
      if (velocity <= 0) return;
      run(
        animate(rotate, rotate.get() + (velocity * COAST_S) / 2, {
          duration: COAST_S,
          ease: COAST_EASE,
        }),
      );
    };

    if (syncing) {
      run(animate(arcOpacity, 1, OUT));
      if (reduce) {
        length.set(0.3);
        return;
      }
      // Spin up from whatever speed it has, never from a standing jolt.
      speed.set(spinning.current ? speed.get() : Math.max(0, rotate.getVelocity()));
      spinning.current = true;
      run(animate(speed, SPEED, SPIN_UP));
      // Coming from a closed ring, the arc first opens to its short length,
      // then starts breathing.
      run(
        animate(length, ARC_SHORT, {
          ...OPEN,
          onComplete: () => {
            if (session !== sessionRef.current) return;
            run(animate(length, [ARC_SHORT, ARC_LONG], BREATH));
          },
        }),
      );
    } else if (settled) {
      run(animate(arcOpacity, 1, OUT));
      if (reduce) {
        length.set(1);
        return;
      }
      coast();
      run(animate(length, 1, { ...CLOSE, velocity: length.getVelocity() }));
    } else {
      run(animate(arcOpacity, 0, OUT));
      if (!reduce) coast();
    }
    return () => {
      for (const controls of running.current) controls.stop();
    };
  }, [syncing, settled, reduce, rotate, speed, length, arcOpacity]);

  useEffect(
    () => () => {
      spinning.current = false;
    },
    [],
  );

  // A mark draws while its state is shown and fades away when it leaves.
  const mark = (shown: boolean) => ({
    initial: false as const,
    animate: reduce
      ? { opacity: shown ? 1 : 0 }
      : { pathLength: shown ? 1 : 0, opacity: shown ? 1 : 0 },
    transition: reduce ? { duration: 0.12 } : shown ? MARK_IN : OUT,
  });

  const frame = {
    "data-status": status,
    className: cn(
      "inline-grid shrink-0 place-items-center transition-colors duration-200",
      COLOR[status],
      className,
    ),
    style: { width: size, height: size },
    ...props,
  };

  const icon = (
    <>
      {/* The arc gets an svg of its own and turns as a whole. An svg element's
          box is the full 24×24 icon, so it spins round the true centre; a
          group inside one would turn round the centre of the arc's own
          bounding box, which moves as the arc changes length. */}
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        style={{ rotate }}
        className="col-start-1 row-start-1 size-full overflow-visible"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="9.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          transform="rotate(-90 12 12)"
          style={{ pathLength: length, opacity: arcOpacity }}
        />
      </motion.svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="col-start-1 row-start-1 size-full overflow-visible"
      >
      {/* Idle: a faint ring. */}
      <motion.circle
        cx="12"
        cy="12"
        r="9.5"
        stroke="currentColor"
        strokeWidth="2"
        initial={false}
        animate={{ opacity: status === "idle" ? 0.9 : 0 }}
        transition={OUT}
      />
      {/* The fill: pops in once the ring has closed, from the icon's centre
          (a full circle's own box shares that centre). */}
      <motion.circle
        cx="12"
        cy="12"
        r="10.5"
        fill="currentColor"
        initial={false}
        animate={reduce ? { opacity: settled ? 1 : 0 } : { opacity: settled ? 1 : 0, scale: settled ? 1 : 0.6 }}
        transition={settled ? (reduce ? { duration: 0.15 } : FILL) : OUT}
      />
      {/* Marks, drawn in white on the fill. */}
      <motion.path
        d="M7.8 12.3l2.8 2.8 5.6-5.8"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...mark(status === "success")}
      />
      <motion.path
        d="M12 7.4v5.2"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        {...mark(status === "warning")}
      />
      <motion.path
        d="M12 16.3v.01"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        {...mark(status === "warning")}
      />
      <motion.path
        d="M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        {...mark(status === "error")}
      />
      </svg>
    </>
  );

  return decorative ? (
    <span aria-hidden="true" {...frame}>
      {icon}
    </span>
  ) : (
    <span role="img" aria-label={t(status)} {...frame}>
      {icon}
    </span>
  );
}
