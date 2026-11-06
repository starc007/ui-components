"use client";

// Pieces the casino games share, so each one only draws its own stage: the
// multiplier format and heat colours, the recent-rounds strip, the sound
// toggle and the small state label above a readout.

import { Check, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

// Presses this soon after a round starts or ends are the same press repeated
// (a double tap, a held key), not the next action (ms).
export const PRESS_GUARD = 400;

// Status lines and markers swap on a spring with no bounce.
export const SWAP = { type: "spring", duration: 0.3, bounce: 0 } as const;
// Exits are shorter than entrances.
export const EXIT = { duration: 0.12, ease: EASE_OUT } as const;
// A loss shakes the readout once, quickly.
export const SHAKE = { duration: 0.3, ease: EASE_OUT } as const;
// A milestone or a win swells the readout and lets it settle with a little give.
export const PULSE = { type: "spring", duration: 0.35, bounce: 0.3 } as const;

/**
 * Primary for small text: a shade darker on light surfaces and lighter on
 * dark ones, so 10-12px labels keep 4.5:1. Large text and marks use plain
 * primary.
 */
export const PRIMARY_TEXT =
  "text-[color:color-mix(in_oklab,var(--color-primary)_75%,black)] dark:text-[color:color-mix(in_oklab,var(--color-primary)_80%,white)]";

/**
 * How hot a multiplier reads: cool under 2×, warm to 10×, hot beyond.
 * Readouts, history and tiles colour by it, so size reads without the digits.
 */
export function heat(multiplier: number) {
  return multiplier >= 10 ? "hot" : multiplier >= 2 ? "warm" : "cool";
}

// Readout and pill colours per heat: neutral, then primary, then amber.
export const HEAT_TEXT = {
  cool: "text-foreground",
  warm: "text-primary",
  hot: "text-amber-700 dark:text-amber-400",
} as const;
export const HEAT_PILL = {
  cool: "bg-foreground/5 text-muted-foreground",
  warm: `bg-primary/10 ${PRIMARY_TEXT}`,
  hot: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  // Opt-in through GameHistory's `tier`, for games that mark 100× and up.
  jackpot: "bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-400",
} as const;

// Truncated, never rounded up: a 10,960× payout reads 10.9K×, not 11K×.
const COMPACT = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1, roundingMode: "trunc" });

/**
 * Large values: compact up to trillions, then scientific (1.4e100), since
 * compact notation stops at T and would print 1e100 as a 100-digit string.
 */
function formatLarge(multiplier: number) {
  if (multiplier < 1e15) return COMPACT.format(multiplier);
  // From toExponential, not log10: 1e100 / 10 ** 100 is 0.999….
  const [mantissa, exponent] = multiplier.toExponential(6).split("e");
  return `${Math.floor(Number(mantissa) * 10) / 10}e${Number(exponent)}`;
}

/** Floors to two decimals, the precision every game settles at. The 1e-9 keeps 2.3 from flooring to 2.29. */
export function floor2(value: number) {
  return Math.floor(value * 100 + 1e-9) / 100;
}

/** A multiplier as the games show it: 2.50×, or shortened when large (12.5K×, 1.4e20×). */
export function formatMultiplier(multiplier: number) {
  return `${multiplier < 10_000 ? multiplier.toFixed(2) : formatLarge(multiplier)}×`;
}

/** Scale and menu labels: 1.5×, 2×, 1.2K×. */
export function formatShort(multiplier: number) {
  return `${multiplier < 1000 ? +multiplier.toFixed(2) : formatLarge(multiplier)}×`;
}

/** The sound toggle: a quiet 32px icon button in a game card's header. */
export const SoundToggle = memo(function SoundToggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    // aria-label names the button; the tooltip shows the same label on hover
    // and focus. Tooltip's asLabel would hydrate differently from the server.
    <Tooltip content="Sound" side="top">
      <Button
        variant="ghost"
        onClick={onToggle}
        aria-label="Sound"
        aria-pressed={on}
        pressScale={0.96}
        className={cn("size-8 shrink-0 rounded-xl px-0", on && "text-foreground")}
      >
        <ActionSwapCascadeIcon value={on ? "on" : "off"} className="size-4">
          {on ? <Volume2 aria-hidden="true" className="size-4" /> : <VolumeX aria-hidden="true" className="size-4" />}
        </ActionSwapCascadeIcon>
      </Button>
    </Tooltip>
  );
});

export interface GameHistoryEntry {
  id: number;
  value: number;
}

/** Recent rounds, newest first, sliding in from the left and coloured by heat. */
export const GameHistory = memo(function GameHistory({
  history,
  reduce,
  tier = heat,
  "aria-label": ariaLabel,
  className,
}: {
  history: GameHistoryEntry[];
  reduce: boolean;
  /** Pill colour per value. Default `heat`; return "jackpot" to mark a top tier. */
  tier?: (value: number) => keyof typeof HEAT_PILL;
  "aria-label": string;
  className?: string;
}) {
  return (
    <ul
      aria-label={ariaLabel}
      className={cn(
        "flex items-center gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {history.length === 0 ? (
          <motion.li key="empty" className="text-xs text-muted-foreground" initial={false} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: EXIT }}>
            Recent rounds show here
          </motion.li>
        ) : (
          history.map((entry) => (
            <motion.li
              key={entry.id}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, transition: EXIT }}
              transition={reduce ? { duration: 0.15 } : SPRING_LAYOUT}
              className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                HEAT_PILL[tier(entry.value)],
              )}
            >
              {formatMultiplier(entry.value)}
            </motion.li>
          ))
        )}
      </AnimatePresence>
    </ul>
  );
});

/**
 * The small uppercase state label over a readout, with a live dot while a
 * round plays and a check or cross once it ends.
 */
export function GameEyebrow({
  label,
  state,
  reduce,
  className,
}: {
  label: string;
  /** `live` shows the dot; `won` and `lost` show a check or cross and tint the label. */
  state: "idle" | "live" | "won" | "lost";
  reduce: boolean;
  className?: string;
}) {
  const icon = state === "idle" ? null : state;
  return (
    <p
      className={cn(
        "flex h-4 items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors duration-150",
        state === "lost" ? "text-rose-700 dark:text-rose-400" : state === "won" ? PRIMARY_TEXT : "text-muted-foreground",
        className,
      )}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {icon ? (
          <motion.span
            key={icon}
            aria-hidden="true"
            className="grid size-3.5 place-items-center"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={SWAP}
          >
            {icon === "live" ? (
              <span className="size-1.5 rounded-full bg-primary" />
            ) : icon === "won" ? (
              <Check className="size-3.5" strokeWidth={3} />
            ) : (
              <X className="size-3.5" strokeWidth={3} />
            )}
          </motion.span>
        ) : null}
      </AnimatePresence>
      {label}
    </p>
  );
}
