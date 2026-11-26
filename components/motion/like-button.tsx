"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { type ComponentPropsWithRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { tapSound } from "@/lib/sounds/tap";
import { cn } from "@/lib/utils";

export const likeButtonMessages = {
  like: "Like",
};

export type LikeButtonMessages = typeof likeButtonMessages;

export interface LikeButtonProps
  extends Omit<ComponentPropsWithRef<"button">, "children" | "onChange"> {
  /** Whether the viewer has liked it, for controlled use. */
  liked?: boolean;
  /** Whether it starts liked when uncontrolled. Default: false */
  defaultLiked?: boolean;
  /** Called with the new state when the button is pressed. */
  onLikedChange?: (liked: boolean) => void;
  /** Likes from everyone else. The viewer's own like is added on top. */
  count?: number;
  /** Override any built-in string, e.g. for translation. */
  labels?: Partial<LikeButtonMessages>;
  /** Play a soft tap on like and unlike. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

// Eight sparks at even angles, alternating near and far so the burst reads as
// a ring with depth rather than a flat star.
const SPARKS = Array.from({ length: 8 }, (_, index) => {
  const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
  const far = index % 2 === 0;
  const distance = far ? 15 : 11;
  return {
    id: index,
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: far ? "size-1" : "size-[3px]",
    delay: far ? 0.04 : 0.07,
  };
});

const BLOOM = { duration: 0.32, ease: EASE_OUT } as const;
const DRAIN = { duration: 0.18, ease: EASE_OUT } as const;
const SPARK = { duration: 0.42, ease: EASE_OUT } as const;

/**
 * A heart toggle. Liking dips the heart, blooms its fill out from the centre
 * and throws a ring of sparks while the count rolls up; unliking drains the
 * fill back to the centre.
 */
export function LikeButton({
  liked: likedProp,
  defaultLiked = false,
  onLikedChange,
  count,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: LikeButtonProps) {
  const t = useMessages("LikeButton", likeButtonMessages, labels);
  const reduce = useReducedMotion();
  const [internal, setInternal] = useState(defaultLiked);
  const liked = likedProp ?? internal;
  // Each like gets its own burst; 0 means none has played yet.
  const [burst, setBurst] = useState(0);
  const play = useSound(tapSound, { enabled: sound });

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={t("like")}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !liked;
        play({ pitch: next ? 1.2 : 0.85 });
        if (likedProp === undefined) setInternal(next);
        if (next) setBurst((value) => value + 1);
        onLikedChange?.(next);
      }}
      className={cn(
        "group inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm tabular-nums transition-colors duration-200",
        "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        liked && "text-rose-500 hover:text-rose-500",
        className,
      )}
      {...rest}
    >
      <span className="relative inline-flex size-4 items-center justify-center">
        {burst > 0 && !reduce ? (
          <span key={burst} aria-hidden="true" className="pointer-events-none absolute inset-0">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-rose-500/70"
              initial={{ opacity: 1, scale: 0.3 }}
              animate={{ opacity: 0, scale: 1.9 }}
              transition={{ duration: 0.4, ease: EASE_OUT }}
            />
            {SPARKS.map((spark) => (
              <motion.span
                key={spark.id}
                className={cn("absolute top-1/2 left-1/2 rounded-full bg-rose-500", spark.size)}
                style={{ translate: "-50% -50%" }}
                initial={{ opacity: 0, x: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], x: spark.x, y: spark.y }}
                transition={{ ...SPARK, delay: spark.delay }}
              />
            ))}
          </span>
        ) : null}
        <motion.span
          aria-hidden="true"
          className="relative inline-flex"
          // A quick dip on like, sprung back: the heart "takes" the press.
          // No remount, so the fill below keeps its own bloom.
          initial={false}
          animate={{ scale: liked && !reduce ? [0.7, 1] : 1 }}
          transition={SPRING_PRESS}
        >
          <Heart className="size-4" />
          <motion.span
            className="absolute inset-0 inline-flex"
            initial={false}
            animate={{ clipPath: liked ? "circle(75% at 50% 55%)" : "circle(0% at 50% 55%)" }}
            transition={reduce ? { duration: 0 } : liked ? BLOOM : DRAIN}
          >
            <Heart className="size-4 fill-current" />
          </motion.span>
        </motion.span>
      </span>
      {count === undefined ? null : (
        <DigitSwap value={count + (liked ? 1 : 0)} direction={liked ? "up" : "down"} />
      )}
    </button>
  );
}
