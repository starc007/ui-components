"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_OUT, SPRING_PRESS, SPRING_SWAP } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export const followButtonMessages = {
  follow: "Follow",
  following: "Following",
  unfollow: "Unfollow",
  followName: "Follow {name}",
};

export type FollowButtonMessages = typeof followButtonMessages;

export interface FollowButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  following?: boolean;
  defaultFollowing?: boolean;
  onFollowingChange?: (following: boolean) => void;
  /** Who is being followed, for the accessible name ("Follow {name}"). */
  name?: string;
  labels?: Partial<FollowButtonMessages>;
}

type Phase = "loading" | "confirm";
type Face = Phase | "follow" | "following" | "unfollow";

// The circle spins for a beat, as if the follow is being sent, then holds
// its check just long enough to read before opening into Following.
const LOADING_MS = 700;
const CONFIRM_MS = 480;

const EXIT = { duration: 0.12, ease: EASE_OUT } as const;
const DRAW = { duration: 0.26, ease: EASE_OUT, delay: 0.04 } as const;
// One turn per 0.8s, evenly: a spinner should never ease.
const SPIN = { duration: 0.8, ease: "linear", repeat: Number.POSITIVE_INFINITY } as const;

// Glyphs swap in and out of the same 16px slot the same way.
const SWAP = {
  initial: { opacity: 0, scale: 0.6, filter: "blur(3px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.6, filter: "blur(3px)", transition: EXIT },
};

// Every glyph is two strokes with the same commands (M, L), so any one
// morphs into any other: plus → check on follow, check → × on unfollow.
const GLYPHS = {
  plus: ["M12 5L12 19", "M5 12L19 12"],
  check: ["M5 12.5L9.5 17", "M9.5 17L19 7"],
  cross: ["M7 7L17 17", "M17 7L7 17"],
} as const;

/**
 * A follow toggle told in three beats: the label folds away and the pill
 * closes into a circle with a spinner, the spinner gives way to a check
 * that draws itself, then the circle opens into an outlined Following pill.
 * On devices that hover, pointing at Following turns the check into an ×
 * for Unfollow.
 */
export function FollowButton({
  following: followingProp,
  defaultFollowing = false,
  onFollowingChange,
  name,
  labels,
  className,
  onClick,
  onPointerEnter,
  onPointerLeave,
  ...rest
}: FollowButtonProps) {
  const t = useMessages("FollowButton", followButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const canHover = useHoverCapable();
  const [internal, setInternal] = useState(defaultFollowing);
  const following = followingProp ?? internal;
  const [hovered, setHovered] = useState(false);
  // A fresh follow reads Following until the pointer leaves, so the click
  // that followed never shows Unfollow under the cursor.
  const [armed, setArmed] = useState(true);
  // The circle beats of a fresh follow; null once it reads Following.
  const [phase, setPhase] = useState<Phase | null>(null);
  // Counts follows, so each one schedules its own beats.
  const [run, setRun] = useState(0);

  // Any follow plays the beats, whether it came from a click or from a
  // parent setting `following`. Detected during render, so the circle
  // starts in the same commit as the new state, with no frame of Following.
  const [seen, setSeen] = useState(following);
  if (seen !== following) {
    setSeen(following);
    setPhase(following && !reduce ? "loading" : null);
    if (following && !reduce) setRun((count) => count + 1);
  }

  // Loading gives way to the check, then the circle opens into Following.
  useEffect(() => {
    if (run === 0) return;
    const ids = [
      setTimeout(() => setPhase((current) => (current === "loading" ? "confirm" : current)), LOADING_MS),
      setTimeout(() => setPhase(null), LOADING_MS + CONFIRM_MS),
    ];
    return () => {
      for (const id of ids) clearTimeout(id);
    };
  }, [run]);

  const active = following ? phase : null;
  const face: Face =
    active ?? (following ? (canHover && hovered && armed ? "unfollow" : "following") : "follow");
  const glyph = face === "follow" ? GLYPHS.plus : face === "unfollow" ? GLYPHS.cross : GLYPHS.check;
  const stroke = reduce ? { duration: 0 } : SPRING_SWAP;

  return (
    <motion.button
      type="button"
      aria-pressed={following}
      aria-busy={face === "loading" || undefined}
      aria-label={name ? t("followName", { name }) : t("follow")}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onPointerEnter={(event) => {
        setHovered(true);
        onPointerEnter?.(event);
      }}
      onPointerLeave={(event) => {
        setHovered(false);
        setArmed(true);
        onPointerLeave?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !following;
        if (followingProp === undefined) setInternal(next);
        if (next) setArmed(false);
        onFollowingChange?.(next);
      }}
      className={cn(
        // Constant 8px padding: with the label folded away, the pill is a
        // 32px circle around the 16px glyph.
        "inline-flex h-8 items-center rounded-full border px-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        (face === "follow" || face === "loading" || face === "confirm") &&
          "border-primary bg-primary text-primary-foreground hover:bg-primary/90",
        face === "following" && "border-border bg-transparent text-foreground",
        face === "unfollow" && "border-destructive/40 bg-destructive/5 text-destructive",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="relative inline-flex size-4 shrink-0">
        <AnimatePresence initial={false}>
          {face === "loading" ? (
            <motion.span
              key="spinner"
              className="absolute inset-0 inline-flex"
              {...SWAP}
              transition={SPRING_SWAP}
            >
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                className="size-4"
                animate={{ rotate: 360 }}
                transition={SPIN}
              >
                <circle cx="12" cy="12" r="8" className="opacity-30" />
                <path d="M12 4a8 8 0 0 1 8 8" />
              </motion.svg>
            </motion.span>
          ) : (
            <motion.span
              key="mark"
              className="absolute inset-0 inline-flex"
              {...SWAP}
              transition={SPRING_SWAP}
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
                {/* Coming out of the spinner the check draws itself;
                    otherwise the strokes morph between glyphs. */}
                {glyph.map((d, index) => (
                  <motion.path
                    key={index === 0 ? "a" : "b"}
                    initial={face === "confirm" && !reduce ? { d, pathLength: 0 } : false}
                    animate={{ d, pathLength: 1 }}
                    transition={{ d: stroke, pathLength: { ...DRAW, delay: DRAW.delay + index * 0.08 } }}
                  />
                ))}
              </svg>
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {/* Follow → Following keeps "Follow" and springs "ing" in. The label is
          padded with spaces rather than CSS padding, so the gap morphs with
          the letters and an empty label folds the pill into a true circle. */}
      <span aria-hidden="true">
        <TextMorph>{face === "loading" || face === "confirm" ? "" : ` ${t(face)} `}</TextMorph>
      </span>
    </motion.button>
  );
}
