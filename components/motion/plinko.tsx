"use client";

import { motion, useAnimate, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { Button } from "@/components/motion/button";
import { cn } from "@/lib/utils";

export interface PlinkoProps {
  /** Rows of pegs the ball falls through. Default 8. */
  rows?: number;
  /** One label per slot, left to right; there are `rows + 1` slots. */
  slots?: ReactNode[];
  /** Called with the slot index when a ball lands. */
  onLand?: (slot: number) => void;
  /** Balls allowed in flight at once. Default 12. */
  maxBalls?: number;
  /** Label of the drop button. Default "Drop ball". */
  dropLabel?: string;
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

type Ball = { id: number; path: { x: number; y: number }[]; times: number[]; slot: number; duration: number };

let nextBall = 0;

/** Random left/right steps from the top peg to a slot, as keyframes. */
function plan(rows: number, width: number): Omit<Ball, "id"> {
  const center = width / 2;
  const contactY = (row: number) => TOP + row * ROW - PEG - BALL;
  const points = [{ x: center, y: 0 }];
  const steps: number[] = [0.22]; // first fall from the chute to the top peg
  let k = 0; // rightward steps so far
  for (let row = 0; row < rows; row++) {
    const x = center + (k - row / 2) * GAP;
    points.push({ x, y: contactY(row) });
    const right = Math.random() < 0.5;
    points.push({ x: x + (right ? GAP / 4 : -GAP / 4), y: contactY(row) - HOP_HEIGHT });
    steps.push(HOP_TIME, DROP_TIME);
    if (right) k++;
  }
  const slotY = TOP + rows * ROW + SLOT / 2 - BALL / 2;
  points.push({ x: center + (k - rows / 2) * GAP, y: slotY });
  const duration = steps.reduce((sum, step) => sum + step, 0);
  const times = [0];
  for (const step of steps) times.push(times[times.length - 1] + step / duration);
  return { path: points, times, slot: k, duration };
}

/**
 * A Plinko board: balls drop through rows of pegs, bounce left or right off
 * each one and land in a slot. Pegs flash when hit and the slot pulses on
 * landing. With reduced motion a ball lands at once.
 */
export function Plinko({
  rows = 8,
  slots,
  onLand,
  maxBalls = 12,
  dropLabel = "Drop ball",
  "aria-label": ariaLabel = "Plinko board",
  className,
}: PlinkoProps) {
  const reduce = useReducedMotion() ?? false;
  const [scope, animate] = useAnimate();
  const [balls, setBalls] = useState<Ball[]>([]);
  const [announcement, setAnnouncement] = useState("");

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
  const labels = useMemo(
    () => slots ?? Array.from({ length: rows + 1 }, (_, i) => defaultLabel(i, rows)),
    [slots, rows],
  );

  const land = useCallback(
    (slot: number) => {
      animate(`[data-slot="${slot}"]`, { opacity: [0.9, 0] }, { duration: 0.6 });
      setAnnouncement(`Landed in slot ${slot + 1}`);
      onLand?.(slot);
    },
    [animate, onLand],
  );

  const drop = () => {
    const ball = { id: nextBall++, ...plan(rows, width) };
    if (reduce) {
      land(ball.slot);
      return;
    }
    // Flash each peg as the ball reaches it.
    ball.path.slice(1, -1).forEach((point, index) => {
      if (index % 2) return; // odd points are the hop apex, not a peg
      const row = index / 2;
      const peg = Math.round((point.x - width / 2) / GAP + row / 2);
      animate(
        `[data-peg="${row}-${peg}"]`,
        { scale: [1, 1.8, 1], opacity: [0.4, 1, 0.4] },
        { duration: 0.3, delay: ball.times[index + 1] * ball.duration },
      );
    });
    setBalls((current) => [...current, ball]);
  };

  return (
    <section aria-label={ariaLabel} className={cn("flex w-full flex-col items-center gap-4", className)}>
      <svg ref={scope} viewBox={`0 0 ${width} ${height}`} className="w-full max-w-md" aria-hidden="true">
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
              <rect x={x + 2} y={y} width={GAP - 4} height={SLOT - 4} rx={6} className="fill-muted" />
              <rect data-slot={slot} x={x + 2} y={y} width={GAP - 4} height={SLOT - 4} rx={6} className="fill-primary opacity-0" />
              <text
                x={x + GAP / 2}
                y={y + (SLOT - 4) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-foreground text-[9px] font-medium tabular-nums"
              >
                {label}
              </text>
            </g>
          );
        })}

        {balls.map((ball) => (
          <motion.circle
            key={ball.id}
            r={BALL}
            cx={0}
            cy={0}
            className="fill-primary"
            initial={{ x: ball.path[0].x, y: ball.path[0].y }}
            animate={{
              x: ball.path.map((point) => point.x),
              y: ball.path.map((point) => point.y),
            }}
            transition={{
              x: { duration: ball.duration, times: ball.times, ease: "linear" },
              y: {
                duration: ball.duration,
                times: ball.times,
                // Fall into the first peg, then hop up and fall down per row.
                ease: ball.times.slice(1).map((_, i) => (i % 2 === 1 ? RISE : FALL)),
              },
            }}
            onAnimationComplete={() => {
              land(ball.slot);
              setBalls((current) => current.filter((other) => other.id !== ball.id));
            }}
          />
        ))}
      </svg>

      <Button onClick={drop} disabled={balls.length >= maxBalls}>
        {dropLabel}
      </Button>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

/** Points that grow toward the edges, where landing is least likely. */
function defaultLabel(slot: number, rows: number) {
  const fromCenter = Math.abs(slot - rows / 2);
  return Math.round(5 * 2 ** fromCenter);
}
