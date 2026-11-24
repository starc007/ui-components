"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { EASE_IN, EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { toggleOffSound, toggleOnSound } from "@/lib/sounds/toggle";
import { cn } from "@/lib/utils";

export const muteToggleMessages = {
  mute: "Mute",
};

export type MuteToggleMessages = typeof muteToggleMessages;

export interface MuteToggleProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  muted?: boolean;
  defaultMuted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  labels?: Partial<MuteToggleMessages>;
  /** Play a falling snap on mute and a rising one on unmute. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

const SPEAKER = "M11 5L6 9H3v6h3l5 4V5z";
const INNER = "M15.5 8.5a5 5 0 0 1 0 7";
const OUTER = "M18.5 5.5a9.5 9.5 0 0 1 0 13";
const SLASH = "M3 3l18 18";

// Waves fold back into the speaker quickly; they spring back out.
const FOLD = { duration: 0.16, ease: EASE_IN } as const;
const CUT = { duration: 0.22, ease: EASE_OUT } as const;
const FADE = { duration: 0.16, ease: EASE_OUT } as const;
// One wave waits for the next, so sound reads as draining into the speaker
// (outer first) or spreading out of it (inner first).
const STAGGER = 0.07;
// The slash cuts once the waves have gone, and lifts before they return.
const CUT_DELAY = 0.12;
const RIPPLE = { duration: 0.6, ease: EASE_OUT, delay: 0.2 } as const;

/**
 * A mute toggle. Muting recoils the speaker, folds the waves back into it
 * from the outside in, then cuts a slash through it, leaving a clean gap.
 * Unmuting lifts the slash, the speaker pumps, the waves spring back out
 * from the inside, and a pulse ripples past them.
 */
export function MuteToggle({
  muted: mutedProp,
  defaultMuted = false,
  onMutedChange,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: MuteToggleProps) {
  const t = useMessages("MuteToggle", muteToggleMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultMuted);
  const muted = mutedProp ?? internal;
  const playMute = useSound(toggleOffSound, { enabled: sound });
  const playUnmute = useSound(toggleOnSound, { enabled: sound });
  const mask = `mute-gap-${useId().replace(/:/g, "")}`;

  // Each unmute, from a click or a controlled change, sends one pulse.
  const [seen, setSeen] = useState(muted);
  const [pulse, setPulse] = useState(0);
  if (seen !== muted) {
    setSeen(muted);
    if (!muted) setPulse((value) => value + 1);
  }

  const instant = { duration: 0 };
  // Waves shrink toward the speaker, so they read as going back into it.
  const wave = (step: number) => ({
    initial: false as const,
    style: { originX: 0, originY: 0.5 },
    animate: { scale: muted && !reduce ? 0.3 : 1, opacity: muted ? 0 : 1 },
    transition: muted
      ? { scale: reduce ? instant : { ...FOLD, delay: step * STAGGER }, opacity: { ...FOLD, delay: step * STAGGER } }
      : {
          scale: reduce ? instant : { ...SPRING_PRESS, delay: CUT_DELAY + step * STAGGER },
          opacity: { ...FADE, delay: (reduce ? 0 : CUT_DELAY) + step * STAGGER },
        },
  });
  const slash = {
    initial: false as const,
    animate: { pathLength: muted ? 1 : 0 },
    transition: reduce ? instant : muted ? { ...CUT, delay: CUT_DELAY } : FOLD,
  };

  return (
    <motion.button
      type="button"
      aria-pressed={muted}
      aria-label={t("mute")}
      whileTap={reduce ? undefined : { scale: 0.92 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !muted;
        if (next) playMute();
        else playUnmute();
        if (mutedProp === undefined) setInternal(next);
        onMutedChange?.(next);
      }}
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full border border-border transition-colors duration-200",
        "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        muted ? "text-muted-foreground" : "text-foreground",
        className,
      )}
      {...rest}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-5 overflow-visible"
      >
        <defs>
          {/* The slash cuts a gap through the speaker as it draws. */}
          <mask id={mask} maskUnits="userSpaceOnUse" x="-4" y="-4" width="32" height="32">
            <rect x="-4" y="-4" width="32" height="32" fill="white" stroke="none" />
            <motion.path d={SLASH} stroke="black" strokeWidth={5.5} {...slash} />
          </mask>
        </defs>
        <g mask={`url(#${mask})`}>
          {/* Recoils when the sound is cut; pumps when it comes back. */}
          <motion.path
            d={SPEAKER}
            style={{ originX: 1, originY: 0.5 }}
            initial={false}
            animate={reduce ? { x: 0, scale: 1 } : muted ? { x: [0, -1.5, 0], scale: 1 } : { x: 0, scale: [1, 1.14, 1] }}
            transition={muted ? { duration: 0.3, ease: EASE_OUT } : { duration: 0.34, ease: EASE_OUT, delay: CUT_DELAY }}
          />
          <motion.path d={INNER} {...wave(muted ? 1 : 0)} />
          <motion.path d={OUTER} {...wave(muted ? 0 : 1)} />
          {/* One pulse travels past the outer wave and fades. */}
          {pulse > 0 && !muted && !reduce ? (
            <motion.path
              key={pulse}
              d={OUTER}
              style={{ originX: 0, originY: 0.5 }}
              initial={{ x: 0, scale: 1, opacity: 0 }}
              animate={{ x: 4, scale: 1.18, opacity: [0, 0.5, 0] }}
              transition={RIPPLE}
            />
          ) : null}
        </g>
        <motion.path d={SLASH} {...slash} />
      </svg>
    </motion.button>
  );
}
