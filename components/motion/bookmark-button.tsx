"use client";

import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { TextMorph } from "@/components/motion/text-morph";
import { EASE_IN, EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { dropSound } from "@/lib/sounds/drop";
import { tapSound } from "@/lib/sounds/tap";
import { cn } from "@/lib/utils";

export const bookmarkButtonMessages = {
  save: "Save",
  saved: "Saved",
  saveName: "Save {name}",
};

export type BookmarkButtonMessages = typeof bookmarkButtonMessages;

export interface BookmarkButtonProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onChange"> {
  saved?: boolean;
  defaultSaved?: boolean;
  onSavedChange?: (saved: boolean) => void;
  /** Show "Save" / "Saved" next to the icon. Icon only when false. */
  showLabel?: boolean;
  /** What is being saved, for the accessible name ("Save {name}"). */
  name?: string;
  labels?: Partial<BookmarkButtonMessages>;
  /** Play a soft drop on save and a tap on unsave. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
}

const RIBBON = "M7 3.5h10a1.5 1.5 0 0 1 1.5 1.5v15.5L12 16.5l-6.5 4V5A1.5 1.5 0 0 1 7 3.5z";
const CHECK = "M9 9.75l2.1 2.1L15 8";

// The ribbon falls into the outline and lands on a light spring, a
// physical drop rather than a fade. It lifts back out on an accelerating
// curve, the way something pulled up leaves.
const DROP = { type: "spring", stiffness: 520, damping: 26, mass: 0.7 } as const;
const LIFT = { duration: 0.2, ease: EASE_IN } as const;
const DRAW = { duration: 0.22, ease: EASE_OUT, delay: 0.16 } as const;
const UNDRAW = { duration: 0.1, ease: EASE_OUT } as const;

/**
 * A save toggle. Saving drops a filled ribbon into the bookmark from above;
 * it lands with a little spring and a check cuts into it while the label
 * rolls to Saved. Unsaving lifts the ribbon back out the top.
 */
export function BookmarkButton({
  saved: savedProp,
  defaultSaved = false,
  onSavedChange,
  showLabel = true,
  name,
  labels,
  sound = false,
  className,
  onClick,
  ...rest
}: BookmarkButtonProps) {
  const t = useMessages("BookmarkButton", bookmarkButtonMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultSaved);
  const saved = savedProp ?? internal;
  const instant = { duration: 0 };
  const playSave = useSound(dropSound, { enabled: sound });
  const playUnsave = useSound(tapSound, { enabled: sound });

  return (
    <motion.button
      type="button"
      aria-pressed={saved}
      // One steady name, so screen readers announce the state through
      // aria-pressed instead of a label that changes under them.
      aria-label={name ? t("saveName", { name }) : t("save")}
      whileTap={reduce ? undefined : { scale: 0.94 }}
      transition={SPRING_PRESS}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        const next = !saved;
        if (next) playSave();
        else playUnsave({ pitch: 0.85 });
        if (savedProp === undefined) setInternal(next);
        onSavedChange?.(next);
      }}
      className={cn(
        "inline-flex h-8 items-center rounded-full border px-2 text-sm font-medium transition-colors duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:opacity-50",
        saved
          ? "border-primary/30 bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:bg-muted/60 hover:text-foreground",
        className,
      )}
      {...rest}
    >
      {/* The svg clips to its box, so the ribbon is hidden above it until it falls in. */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-4 shrink-0 overflow-hidden"
      >
        <path d={RIBBON} stroke="currentColor" strokeWidth={2} />
        <motion.g
          initial={false}
          animate={reduce ? { opacity: saved ? 1 : 0 } : { y: saved ? 0 : -24 }}
          transition={reduce ? { duration: 0.15 } : saved ? DROP : LIFT}
        >
          <path d={RIBBON} fill="currentColor" stroke="currentColor" strokeWidth={2} />
          <motion.path
            d={CHECK}
            className="stroke-background"
            strokeWidth={2}
            initial={false}
            animate={{ pathLength: saved ? 1 : 0 }}
            transition={reduce ? instant : saved ? DRAW : UNDRAW}
          />
        </motion.g>
      </svg>
      {showLabel ? (
        // Save → Saved keeps the word and springs a "d" onto the end.
        <span aria-hidden="true" className="px-1.5">
          <TextMorph>{saved ? t("saved") : t("save")}</TextMorph>
        </span>
      ) : null}
    </motion.button>
  );
}
