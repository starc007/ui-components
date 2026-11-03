"use client";

import { type LucideIcon, Volume2, VolumeX, Zap, ZapOff } from "lucide-react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { createTickPlayer } from "@/lib/tick-sound";
import { cn } from "@/lib/utils";

export type PlinkoValue = string | number;

export interface PlinkoProps {
  /** Rows of pegs when `slots` isn't passed. Default 12. */
  rows?: number;
  /**
   * Slot values, left to right. Their count sets the board: n slots get
   * n - 1 rows of pegs, so `rows` is ignored when this is passed. Without it
   * the slots come from `plinkoSlots(rows)`. Fewer than 2 slots render nothing.
   */
  slots?: PlinkoValue[];
  /** Called with the slot index and its value when a ball lands. */
  onLand?: (slot: number, value: PlinkoValue) => void;
  /** Balls allowed in flight at once. Default 12. */
  maxBalls?: number;
  /** Label of the drop button. Default "Drop ball". */
  dropLabel?: string;
  /** Flash each peg as the ball hits it (controlled). */
  pegFlash?: boolean;
  /** Initial peg flash state when uncontrolled. Default true. */
  defaultPegFlash?: boolean;
  /** Called when the peg flash button is toggled. */
  onPegFlashChange?: (pegFlash: boolean) => void;
  /** Tooltip and accessible name of the peg flash button. Default "Peg flash". */
  pegFlashLabel?: string;
  /** Click on every peg hit and landing (controlled). */
  sound?: boolean;
  /** Initial sound state when uncontrolled. Default false. */
  defaultSound?: boolean;
  /** Called when the sound button is toggled. */
  onSoundChange?: (sound: boolean) => void;
  /** Tooltip and accessible name of the sound button. Default "Sound". */
  soundLabel?: string;
  /** Accessible name for the board. Default "Plinko board". */
  "aria-label"?: string;
  className?: string;
}

// Board geometry in SVG units; the board scales to its container's width.
const GAP = 32; // horizontal space between pegs
const ROW = 30; // vertical space between peg rows
const PEG = 3.5;
const BALL = 7;
const TOP = 48; // first peg row
const SLOT = 34; // slot height

// A ball falls between pegs under gravity and rises a little after each hit.
// lib/ease has no ease-in, and the fall must accelerate, so these two are
// local: FALL speeds up like a drop, RISE slows down like a hop.
const FALL = [0.55, 0, 1, 0.45] as const;
const RISE = [0, 0.55, 0.45, 1] as const;
const HOP_TIME = 0.09; // seconds rising after a peg
const DROP_TIME = 0.16; // seconds falling to the next peg
const HOP_HEIGHT = 7;
// Landing tick playback rates: 0.55 in the centre slot, up to 0.95 at the edges.
const LANDING_RATE = 0.55;
const LANDING_SPREAD = 0.4;

type Ball = {
  id: number;
  path: { x: number; y: number }[];
  times: number[];
  slot: number;
  duration: number;
  /** Id of the peg hit on each row, top to bottom. */
  pegs: string[];
  /** Row of the last peg hit, -1 before the first. */
  lastRow: number;
  /** Last rendered y, to catch the frame the ball turns back up off a peg. */
  y: number;
  /** Moving up on the last frame: still on the hop from the last peg. */
  rising: boolean;
  /** Set once the ball reaches its slot; its exit fade must not land again. */
  landed?: boolean;
};

let nextBall = 0;

/** Height of the ball's centre where it touches a peg on `row`. */
const contactY = (row: number) => TOP + row * ROW - PEG - BALL;

/** Random left/right steps from the top peg to a slot, as keyframes. */
function plan(rows: number, width: number): Omit<Ball, "id" | "lastRow" | "y" | "rising"> {
  const center = width / 2;
  const points = [{ x: center, y: BALL }]; // enters fully inside the board
  const steps: number[] = [0.22]; // first fall from the chute to the top peg
  const pegs: string[] = [];
  let k = 0; // rightward steps so far
  for (let row = 0; row < rows; row++) {
    const x = center + (k - row / 2) * GAP;
    pegs.push(`${row}-${k}`);
    points.push({ x, y: contactY(row) });
    const right = Math.random() < 0.5;
    points.push({ x: x + (right ? GAP / 4 : -GAP / 4), y: contactY(row) - HOP_HEIGHT });
    steps.push(HOP_TIME, DROP_TIME);
    if (right) k++;
  }
  // Come to rest just inside the slot's top edge, clear of its label.
  const slotY = TOP + rows * ROW - BALL + 3;
  points.push({ x: center + (k - rows / 2) * GAP, y: slotY });
  const duration = steps.reduce((sum, step) => sum + step, 0);
  const times = [0];
  for (const step of steps) times.push(times[times.length - 1] + step / duration);
  return { path: points, times, slot: k, duration, pegs };
}

/**
 * A Plinko board: balls drop through rows of pegs, bounce left or right off
 * each one and land in a slot. Pegs flash when hit and the slot pulses on
 * landing. Optional sound clicks on every peg and lands with a thunk that
 * brightens toward the rarer edge slots. With reduced motion a ball lands at
 * once.
 */
export function Plinko({
  rows: rowsProp = 12,
  slots,
  onLand,
  maxBalls = 12,
  dropLabel = "Drop ball",
  pegFlash,
  defaultPegFlash = true,
  onPegFlashChange,
  pegFlashLabel = "Peg flash",
  sound,
  defaultSound = false,
  onSoundChange,
  soundLabel = "Sound",
  "aria-label": ariaLabel = "Plinko board",
  className,
}: PlinkoProps) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate();
  const [balls, setBalls] = useState<Ball[]>([]);
  const [announcement, setAnnouncement] = useState("");
  // The last slot hit stays marked after its flash fades.
  const [lastSlot, setLastSlot] = useState<number | null>(null);
  const [internalSound, setInternalSound] = useState(defaultSound);
  const soundOn = sound ?? internalSound;
  const [internalFlash, setInternalFlash] = useState(defaultPegFlash);
  const flashOn = pegFlash ?? internalFlash;

  // Peg hits fire from the ball's animation frames, which can outlive the
  // render that started them, so they read the latest settings from refs.
  const soundRef = useRef(soundOn);
  const flashRef = useRef(flashOn);
  useLayoutEffect(() => {
    soundRef.current = soundOn;
    flashRef.current = flashOn;
  });
  // Each player cuts its own previous tick, so landings get their own player:
  // another ball's peg click would otherwise cut the longer landing thunk.
  const players = useRef<Record<"peg" | "landing", ReturnType<typeof createTickPlayer>> | null>(null);
  const getPlayers = () => {
    if (!players.current) players.current = { peg: createTickPlayer(), landing: createTickPlayer() };
    return players.current;
  };
  useEffect(
    () => () => {
      players.current?.peg.dispose();
      players.current?.landing.dispose();
      players.current = null;
    },
    [],
  );

  const togglePegFlash = () => {
    const next = !flashOn;
    if (pegFlash === undefined) setInternalFlash(next);
    onPegFlashChange?.(next);
  };

  const toggleSound = () => {
    const next = !soundOn;
    // Unlock audio inside the click, where browsers allow it.
    if (next) getPlayers().peg.prepare();
    if (sound === undefined) setInternalSound(next);
    onSoundChange?.(next);
  };

  const labels = slots ?? plinkoSlots(rowsProp);
  const rows = labels.length - 1;
  const invalid = labels.length < 2;
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && invalid)
      console.warn("Plinko needs at least 2 slots; it renders nothing until it has them.");
  }, [invalid]);

  // A new board size makes every ball in flight point at pegs that moved, so
  // drop them in the same render. Clearing them in an effect would mount them
  // in the new board first, and their exit would land in a slot that may not
  // exist any more.
  const [boardRows, setBoardRows] = useState(rows);
  if (boardRows !== rows) {
    setBoardRows(rows);
    setBalls([]);
    setLastSlot(null);
  }

  const width = (rows + 2) * GAP;
  const height = TOP + rows * ROW + SLOT;
  // Each row runs one peg past the ball's reach on both sides, so the board
  // reads as a triangle that widens down to the slots.
  const pegs = useMemo(
    () =>
      Array.from({ length: rows }, (_, row) =>
        Array.from({ length: row + 3 }, (_, i) => ({
          id: `${row}-${i - 1}`,
          x: width / 2 + (i - 1 - row / 2) * GAP,
          y: TOP + row * ROW,
        })),
      ).flat(),
    [rows, width],
  );

  const land = (slot: number) => {
    animate(`[data-slot="${slot}"]`, { opacity: [0.9, 0] }, { duration: 0.3, ease: EASE_OUT });
    // A lower thunk than a peg hit marks the landing. It brightens toward
    // the edges, where landing is rarest, so a good drop is heard.
    if (soundRef.current)
      getPlayers().landing.play(LANDING_RATE + LANDING_SPREAD * (Math.abs(slot - rows / 2) / (rows / 2)));
    setLastSlot(slot);
    setAnnouncement(`Landed in slot ${slot + 1}: ${labels[slot]}`);
    onLand?.(slot, labels[slot]);
  };

  // Flash and click a peg on the frame the ball turns back up off it. Reading
  // the ball's own frames keeps both on its clock: a background tab pauses
  // them together.
  const hitPegs = (ball: Ball, y: number) => {
    const rising = y < ball.y;
    // The row comes from where the ball turned, not from counting turns, so
    // a slow frame that skips a whole hop misses only that peg. Both frames
    // sit within a hop height above the contact, which rounds to its row.
    const row = Math.round((Math.max(ball.y, y) - contactY(0)) / ROW);
    if (rising && !ball.rising && row > ball.lastRow && row < ball.pegs.length) {
      ball.lastRow = row;
      const peg = ball.pegs[row];
      if (flashRef.current) {
        // Fast attack, slower decay: the pop peaks a third of the way in.
        animate(
          `[data-peg="${peg}"]`,
          { scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] },
          { duration: 0.3, times: [0, 0.3, 1], ease: EASE_OUT },
        );
      }
      if (soundRef.current) getPlayers().peg.play();
    }
    ball.y = y;
    ball.rising = rising;
  };

  const full = balls.length >= maxBalls;
  const drop = () => {
    if (full) return;
    const ball: Ball = { id: nextBall++, lastRow: -1, y: 0, rising: false, ...plan(rows, width) };
    if (soundOn) getPlayers().peg.prepare();
    if (reduce) {
      land(ball.slot);
      return;
    }
    setBalls((current) => [...current, ball]);
  };

  if (invalid) return null;

  return (
    <section aria-label={ariaLabel} className={cn("flex w-full flex-col items-center gap-4", className)}>
      <svg
        ref={scope}
        viewBox={`0 0 ${width} ${height}`}
        // Grow with the board so pegs keep the same on-screen spacing at any
        // row count, until the container's width runs out.
        style={{ maxWidth: width * 1.4 }}
        className="w-full"
        aria-hidden="true"
      >
        {pegs.map((peg) => (
          <circle
            key={peg.id}
            data-peg={peg.id}
            cx={peg.x}
            cy={peg.y}
            r={PEG}
            className="fill-foreground opacity-40 [transform-box:fill-box] [transform-origin:center]"
          />
        ))}

        {labels.map((label, slot) => {
          const x = width / 2 + (slot - rows / 2) * GAP - GAP / 2;
          const y = TOP + rows * ROW;
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey: slots are positional
            <g key={slot}>
              <rect
                x={x + 2}
                y={y}
                width={GAP - 4}
                height={SLOT - 4}
                rx={6}
                className={slot === lastSlot ? "fill-primary/20" : "fill-muted"}
              />
              <rect data-slot={slot} x={x + 2} y={y} width={GAP - 4} height={SLOT - 4} rx={6} className="fill-primary opacity-0" />
              <text
                x={x + GAP / 2}
                y={y + (SLOT - 4) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                // Long values shrink to fit their slot.
                fontSize={Math.min(9, (GAP - 8) / (String(label).length * 0.6))}
                className={cn("fill-foreground tabular-nums", slot === lastSlot ? "font-semibold" : "font-medium")}
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Keyed by size: balls from a board that changed size leave at once. */}
        <AnimatePresence key={rows}>
        {balls.map((ball) => (
          <motion.circle
            key={ball.id}
            r={BALL}
            cx={0}
            cy={0}
            className="fill-primary"
            // Enters from 90% scale and transparent, never from nothing. The
            // circle is drawn at 0,0 and placed by translate, so it scales
            // about its own centre.
            initial={{ x: ball.path[0].x, y: ball.path[0].y, opacity: 0, scale: 0.9 }}
            animate={{
              x: ball.path.map((point) => point.x),
              y: ball.path.map((point) => point.y),
              opacity: 1,
              scale: 1,
            }}
            // Settle into the slot: a short fade with a small drop.
            exit={{
              opacity: 0,
              y: (ball.path.at(-1)?.y ?? 0) + 4,
              transition: { duration: 0.12, ease: EASE_OUT },
            }}
            transition={{
              opacity: { duration: 0.15, ease: EASE_OUT },
              scale: { duration: 0.15, ease: EASE_OUT },
              x: { duration: ball.duration, times: ball.times, ease: "linear" },
              y: {
                duration: ball.duration,
                times: ball.times,
                // Fall into the first peg, then hop up and fall down per row.
                ease: ball.times.slice(1).map((_, i) => (i % 2 === 1 ? RISE : FALL)),
              },
            }}
            onUpdate={(latest) => {
              if (typeof latest.y === "number") hitPegs(ball, latest.y);
            }}
            onAnimationComplete={() => {
              if (ball.landed) return;
              ball.landed = true;
              land(ball.slot);
              setBalls((current) => current.filter((other) => other.id !== ball.id));
            }}
          />
        ))}
        </AnimatePresence>
      </svg>

      <div className="flex items-center gap-2">
        {/* aria-disabled, not disabled: a disabled button drops keyboard focus. */}
        <Button
          onClick={drop}
          aria-disabled={full || undefined}
          pressScale={0.96}
          className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          {dropLabel}
        </Button>
        <ToggleButton on={flashOn} onToggle={togglePegFlash} label={pegFlashLabel} onIcon={Zap} offIcon={ZapOff} />
        <ToggleButton on={soundOn} onToggle={toggleSound} label={soundLabel} onIcon={Volume2} offIcon={VolumeX} />
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

/**
 * Slot values for a board of `rows`: `center` in the middle, growing evenly
 * (geometrically) to `edge` at both ends, where landing is rarest. Rounded to
 * readable numbers: 12 rows give 100, 50, 20, 10, 5, 2, 1, 2, 5, 10, 20, 50, 100.
 * Values from 1 to 10 round to whole numbers, the rest to one significant
 * figure, so fractional curves work: 8 rows with `center: 0.5, edge: 10`
 * give 10, 5, 2, 1, 0.5, 1, 2, 5, 10.
 * `rows` is rounded to at least 1, `center` raised to at least 0.01 and
 * `edge` to at least `center`.
 */
export function plinkoSlots(
  rowCount: number,
  options: { center?: number; edge?: number } = {},
): number[] {
  const rows = Math.max(1, Math.round(rowCount) || 1);
  // Any positive center works; zero or below would divide by zero.
  const center = Math.max(0.01, options.center ?? 1);
  const edge = Math.max(center, options.edge ?? 100);
  const half = rows / 2;
  return Array.from({ length: rows + 1 }, (_, slot) => {
    const value = center * (edge / center) ** (Math.abs(slot - half) / half);
    if (value >= 1 && value < 10) return Math.round(value);
    // One significant figure: 46 reads as 50, 315 as 300, 0.46 as 0.5.
    return Number(value.toPrecision(1));
  });
}

/** An icon button that shows and toggles one on/off setting. */
function ToggleButton({
  on,
  onToggle,
  label,
  onIcon: OnIcon,
  offIcon: OffIcon,
}: {
  on: boolean;
  onToggle: () => void;
  label: string;
  onIcon: LucideIcon;
  offIcon: LucideIcon;
}) {
  return (
    // The tooltip is the button's accessible name as well as its visible label.
    <Tooltip content={label} asLabel side="top">
      <Button
        variant="secondary"
        onClick={onToggle}
        aria-pressed={on}
        pressScale={0.96}
        // Full strength when on, muted when off: the slash alone is a thin cue.
        className={cn("w-10 px-0", on ? "text-foreground" : "text-muted-foreground")}
      >
        <ActionSwapCascadeIcon value={on ? "on" : "off"} className="size-4">
          {on ? <OnIcon aria-hidden="true" className="size-4" /> : <OffIcon aria-hidden="true" className="size-4" />}
        </ActionSwapCascadeIcon>
      </Button>
    </Tooltip>
  );
}
