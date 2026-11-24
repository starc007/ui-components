"use client";

import { type HTMLMotionProps, motion, type Transition, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN_OUT, EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { pressSound } from "@/lib/sounds/press";
import { tapSound } from "@/lib/sounds/tap";
import { cn } from "@/lib/utils";

export const lockToggleMessages = {
  lock: "Lock",
  locked: "Locked",
  unlocked: "Unlocked",
};

export type LockToggleMessages = typeof lockToggleMessages;

export interface LockToggleProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  locked?: boolean;
  defaultLocked?: boolean;
  onLockedChange?: (locked: boolean) => void;
  /** Show Locked / Unlocked next to the padlock. */
  showLabel?: boolean;
  labels?: Partial<LockToggleMessages>;
  /** Play a low press on lock and a light tap on unlock. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

// How far the shackle lifts clear of the body, how far it swings open on
// its right leg, and how far it overshoots when it drops home.
const LIFT = -3.5;
const SWING = -34;
const SEAT = 1;
// Locking: swing back over the body, drop in past home, settle.
const CLOSE: Transition = { duration: 0.5, ease: EASE_OUT, times: [0, 0.42, 0.7, 1] };
// Unlocking: a short press down, pop up, then swing open.
const OPEN: Transition = { duration: 0.46, ease: EASE_OUT, times: [0, 0.14, 0.42, 1] };
// The body knocks down as the shackle seats.
const KNOCK: Transition = { duration: 0.5, ease: EASE_OUT, times: [0, 0.62, 0.78, 1] };
const TWIST = { duration: 0.34, ease: EASE_IN_OUT } as const;
const FILL = { duration: 0.2, ease: EASE_OUT } as const;
// The body fills once the shackle has seated, and the key turns after.
const FILL_DELAY = 0.3;
const TWIST_DELAY = 0.34;

const KEYHOLE = (
  <>
    <circle cx="12" cy="15.25" r="1.5" stroke="none" />
    <path d="M12 15.25v2.5" strokeWidth={1.6} />
  </>
);

/**
 * A padlock toggle. Locking swings the shackle back over the body and drops
 * it in with a knock, then the body fills solid around a cut-out keyhole and
 * the key turns. Unlocking turns the key back, drains the fill, and pops the
 * shackle up and open, while the label morphs between Locked and Unlocked.
 */
export function LockToggle({
  locked: lockedProp,
  defaultLocked = true,
  onLockedChange,
  showLabel = true,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: LockToggleProps) {
  const t = useMessages("LockToggle", lockToggleMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultLocked);
  const locked = lockedProp ?? internal;
  const playLock = useSound(pressSound, { enabled: sound });
  const playUnlock = useSound(tapSound, { enabled: sound });
  const mask = `lock-keyhole-${useId().replace(/:/g, "")}`;

  const instant = { duration: 0 };
  const shackle = reduce
    ? { y: 0, rotate: locked ? 0 : SWING }
    : locked
      ? { y: [LIFT, LIFT, SEAT, 0], rotate: [SWING, 0, 0, 0] }
      : { y: [0, 0.75, LIFT, LIFT], rotate: [0, 0, 0, SWING] };
  const body = reduce || !locked ? { y: 0 } : { y: [0, 0, 0.75, 0] };
  // The key turns a quarter and back: clockwise to lock, back to open.
  const twist = reduce ? { rotate: 0 } : { rotate: [0, locked ? 90 : -90, 0] };
  const twistTransition = reduce ? instant : { ...TWIST, delay: locked ? TWIST_DELAY : 0 };
  const fill = locked ? 1 : 0;
  const fillTransition = { ...FILL, delay: locked && !reduce ? FILL_DELAY : 0 };
  // Origins are fractions of each shape's own box (motion owns
  // transform-origin on SVG). The keyhole spans y 13.75 to 17.75 and turns
  // about its round head at 15.25.
  const keyholeOrigin = { transformBox: "fill-box", originX: 0.5, originY: 0.375 } as const;

  return (
    <motion.button
      type="button"
      aria-pressed={locked}
      aria-label={t("lock")}
      whileTap={reduce ? undefined : { scale: 0.95 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !locked;
        if (next) playLock();
        else playUnlock();
        if (lockedProp === undefined) setInternal(next);
        onLockedChange?.(next);
      }}
      className={cn(
        "inline-flex h-9 items-center rounded-full border text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        showLabel ? "pr-2 pl-2.5" : "w-9 justify-center",
        locked
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
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
        className="size-4 shrink-0 overflow-visible"
      >
        <defs>
          {/* The keyhole, cut out of the solid body, turning with the key. */}
          <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
            <rect width="24" height="24" fill="white" stroke="none" />
            <motion.g
              fill="black"
              stroke="black"
              style={keyholeOrigin}
              initial={false}
              animate={twist}
              transition={twistTransition}
            >
              {KEYHOLE}
            </motion.g>
          </mask>
        </defs>
        <motion.path
          d="M8 11V7a4 4 0 0 1 8 0v4"
          // Hinged on the right leg, where it meets the body.
          style={{ transformBox: "fill-box", originX: 1, originY: 1 }}
          initial={false}
          animate={shackle}
          transition={reduce ? instant : locked ? CLOSE : OPEN}
        />
        <motion.g initial={false} animate={body} transition={reduce ? instant : KNOCK}>
          <motion.rect
            x="4.5"
            y="11"
            width="15"
            height="10"
            rx="2"
            fill="currentColor"
            stroke="none"
            mask={`url(#${mask})`}
            initial={false}
            animate={{ fillOpacity: fill }}
            transition={fillTransition}
          />
          <rect x="4.5" y="11" width="15" height="10" rx="2" />
          {/* The keyhole drawn in ink while the body is open. */}
          <motion.g
            fill="currentColor"
            stroke="currentColor"
            style={keyholeOrigin}
            initial={false}
            animate={{ ...twist, opacity: 1 - fill }}
            transition={{ rotate: twistTransition, opacity: fillTransition }}
          >
            {KEYHOLE}
          </motion.g>
        </motion.g>
      </svg>
      {showLabel ? (
        // The button's name stays "Lock"; the state is aria-pressed.
        <span aria-hidden="true" className="px-1.5">
          <TextMorph>{locked ? t("locked") : t("unlocked")}</TextMorph>
        </span>
      ) : null}
    </motion.button>
  );
}
