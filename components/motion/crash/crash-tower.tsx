"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { EASE_IN, EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { type CrashMiniatureProps, CrashShell, MINI, MINI_REPLAY, PRIMARY_TEXT } from "./crash-parts";
import { type CrashGame, type CrashProps, EXIT, formatShort, GROWTH, SWAP, useCrashGame } from "./use-crash-game";

export { type CrashProps, crashPoint, formatMultiplier } from "./use-crash-game";

// One block per +8% on the multiplier, so block k lands at exactly 1.08^k:
// one every 0.64s, while the readout keeps accelerating.
const STEP = 1.08;
const PER_SECOND = GROWTH / Math.log(STEP);
// Block geometry in px. The baseline is the slab's top, measured from the stage bottom.
const BLOCK_H = 13;
const PITCH = 16;
const BASE = 28;
// The stage is 10:7, so its height scales with width (up to about 297px, under 200px on narrow cards).
// The camera follow threshold comes from the measured height, keeping the top
// block 24px under the stage edge. Before measuring it assumes the smallest
// stage, so the server render never pokes out of the top.
const TOP_ROOM = 24;
const MIN_STAGE_H = 200;
const followFor = (stageH: number) => Math.max(4, Math.floor((stageH - BASE - TOP_ROOM - BLOCK_H) / PITCH));
// Sway grows with height up to this many degrees.
const MAX_SWAY = 4;
const SWAY_RATE = 2.2;

// A block lands with a little give, which reads as stacked by hand.
const DROP: Transition = { type: "spring", duration: 0.35, bounce: 0.25 };

/**
 * A crash game drawn as a tower: a block stacks on at every +8% and the tower
 * sways harder the taller it gets, until the crash topples it. Cash out before
 * it does; your block keeps a flag as the tower carries on without you.
 */
export function CrashTower({ "aria-label": ariaLabel = "Crash", className, ...options }: CrashProps) {
  const game = useCrashGame(options);
  // The tower stands at 72% across with its labels and pennant on its right, so
  // nothing reaches back under the shell's readout, even on a narrow stage.
  return (
    <CrashShell game={game} aria-label={ariaLabel} className={className} miniature={(props) => <MiniTower {...props} />}>
      <Tower game={game} />
    </CrashShell>
  );
}

// Slightly varied widths and alternating offsets, fixed per index, so it reads as hand-stacked.
const width = (k: number) => 60 + ((k * 7) % 4) * 4;
const offset = (k: number) => (k % 2 ? 1 : -1) * (2 + ((k * 5) % 3));
// A fixed jagged crack per block, 2 or 3 segments, in a 100x13 box stretched to the block.
const crack = (k: number) => {
  const x = 18 + ((k * 29) % 60);
  const lean = k % 2 ? 6 : -6;
  return k % 3
    ? `M${x},0L${x + lean},6L${x - lean / 2},13`
    : `M${x},0L${x + lean},4L${x - lean},9L${x + lean / 2},13`;
};
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
// The top surface of the block on top when the multiplier reaches m, in px over the baseline.
const blockOf = (m: number) => Math.floor(Math.log(m) / Math.log(STEP) + 1e-9);
const markRise = (m: number, cam: number) => (blockOf(m) - cam) * PITCH + BLOCK_H;

/** The stack, derived from t each frame: count, camera, sway and cracks. */
function Tower({ game }: { game: CrashGame }) {
  const { t, crashed, lost, cashed, round, reduce, target, ghost } = game;
  const stage = useRef<HTMLDivElement>(null);
  const [stageH, setStageH] = useState(MIN_STAGE_H);
  useLayoutEffect(() => {
    const node = stage.current;
    if (!node) return;
    const measure = () => setStageH(node.clientHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  const follow = followFor(stageH);

  const b = t * PER_SECOND;
  const top = Math.floor(b + 1e-9);
  // Continuous, so the stack sinks smoothly between landings.
  const cam = Math.max(0, b - follow);
  // Blocks below this are past the stage bottom.
  const lowest = Math.max(0, Math.floor(cam) - 3);
  // Cracks need some height first, then spread up from the base.
  const strain = clamp01((b - 8) / 12);

  const amp = reduce ? 0 : Math.min(MAX_SWAY, b * 0.22);
  const phase = t * SWAY_RATE;
  const angle = amp * (0.8 * Math.sin(phase) + 0.2 * Math.sin(phase * 1.7 + 1));
  // The upper blocks lag the sway a little, so the tower bends rather than pivots.
  const bend = amp * 1.5 * Math.sin(phase - 0.9);

  const cashK = cashed === null ? null : blockOf(cashed);
  // A mark's line sits on top of its block, so the labels of that block and
  // the next would print over the mark's own.
  const marked = [ghost, target].flatMap((m) => (m === null ? [] : [blockOf(m)]));
  // The crash breaks the top few blocks off, tipping the way the tower leans.
  const breakK = Math.max(0, top - 4 - (round % 3));
  const dir = angle < 0 ? -1 : 1;

  const blocks = Array.from({ length: top - lowest + 1 }, (_, i) => lowest + i);
  // Marks above the view pin to the top edge with a caret, so a far target stays readable.
  const ceiling = stageH - BASE - 10;

  return (
    <div ref={stage} aria-hidden="true" className="absolute inset-0 overflow-hidden">
      {/* Ground and slab sink with the camera but never sway. */}
      <div
        className="absolute inset-x-0 bottom-0"
        style={{ height: BASE, transform: `translateY(${(cam * PITCH).toFixed(2)}px)` }}
      >
        <div className="absolute inset-x-0 top-2 border-t border-border" />
        <div className="absolute top-0 left-[72%] h-2 w-28 -translate-x-1/2 rounded-[3px] bg-foreground/20" />
      </div>

      <AnimatePresence initial={false}>
        {ghost !== null &&
        // Dropped when it would print over the target's label (both pinned
        // at the top, or within 12px).
        (target === null ||
          Math.abs(Math.min(markRise(ghost, cam), ceiling) - Math.min(markRise(target, cam), ceiling)) >= 12) ? (
          <Mark
            key="ghost"
            rise={markRise(ghost, cam)}
            ceiling={ceiling}
            label={`Last ${formatShort(ghost)}`}
            className="border-muted-foreground/30 text-muted-foreground"
          />
        ) : null}
        {target !== null ? (
          <Mark
            key="target"
            rise={markRise(target, cam)}
            ceiling={ceiling}
            label={`Target ${formatShort(target)}`}
            className={cn("border-primary/70", PRIMARY_TEXT)}
          />
        ) : null}
      </AnimatePresence>

      {/* A zero-size anchor on the baseline, so the sway pivots there. */}
      <div className="absolute left-[72%]" style={{ bottom: BASE, transform: `rotate(${angle.toFixed(3)}deg)` }}>
        {blocks.map((k) => {
          const rise = k - cam;
          const lift = rise / follow;
          const w = width(k);
          const x = offset(k) + bend * lift * lift - w / 2;
          const y = -rise * PITCH - BLOCK_H;
          const falling = crashed && k >= breakK;
          const n = k - breakK;
          const load = clamp01((top - k - 4) / 10) * strain;
          return (
            <div
              key={`${round}-${k}`}
              className="absolute top-0 left-0"
              style={{ width: w, height: BLOCK_H, transform: `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)` }}
            >
              <motion.div
                className={cn(
                  "relative size-full rounded-[4px] transition-colors duration-150",
                  k === cashK
                    ? "bg-primary"
                    : falling
                      ? lost
                        ? "bg-rose-500"
                        : "bg-muted-foreground/40"
                      : k % 2
                        ? "bg-foreground/15"
                        : "bg-foreground/10",
                )}
                // The idle block is already standing on first paint.
                initial={round === 0 ? false : reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
                animate={
                  falling && !reduce
                    ? {
                        x: dir * (20 + n * 12),
                        y: 160 + n * 6,
                        rotate: dir * (50 + n * 18 + (k % 3) * 12),
                        opacity: [1, 1, 0],
                      }
                    : // Under reduced motion the broken top fades instead of falling.
                      { x: 0, y: 0, rotate: 0, opacity: falling ? 0.35 : 1 }
                }
                transition={
                  falling && !reduce
                    ? {
                        duration: 0.6,
                        ease: EASE_IN,
                        // The top lets go first.
                        delay: (top - k) * 0.025,
                        opacity: { duration: 0.6, times: [0, 0.7, 1], delay: (top - k) * 0.025 },
                      }
                    : reduce
                      ? { duration: 0.15, ease: EASE_OUT }
                      : DROP
                }
              >
                {load > 0 ? (
                  // The load on this block, read straight from the height: no motion of its own.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 100 13"
                    preserveAspectRatio="none"
                    className="absolute inset-0 size-full"
                    style={{ opacity: load }}
                  >
                    <path
                      d={crack(k)}
                      fill="none"
                      strokeWidth={1}
                      vectorEffect="non-scaling-stroke"
                      strokeLinejoin="round"
                      className="stroke-foreground/35"
                    />
                  </svg>
                ) : null}
                {k > 0 && k % 5 === 0 && !marked.some((g) => k === g || k === g + 1) ? (
                  <span
                    className={cn(
                      "absolute top-1/2 left-full -translate-y-1/2 text-[10px] leading-none text-muted-foreground tabular-nums",
                      k === cashK ? "ml-6" : "ml-2",
                    )}
                  >
                    {formatShort(STEP ** k)}
                  </span>
                ) : null}
                {k === cashK ? (
                  // Where you bailed: a pennant off your block's right side, clear of the blocks above.
                  <motion.span
                    key={`flag-${round}`}
                    className="absolute top-1/2 left-full ml-0.5 h-2.5 w-3.5 origin-left -translate-y-1/2 bg-primary [clip-path:polygon(0_0,0_100%,100%_50%)]"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={SWAP}
                  />
                ) : null}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A dashed height line across the tower column; it sinks with the camera and fades out. */
function Mark({
  rise,
  ceiling,
  label,
  className,
}: {
  rise: number;
  ceiling: number;
  label: string;
  className: string;
}) {
  const pinned = rise > ceiling;
  return (
    <motion.div
      className={cn("absolute right-3 left-[calc(72%-3.5rem)] border-t border-dashed", className)}
      // `y` is a transform, so the per-frame sink never touches layout.
      style={{ bottom: BASE, y: -Math.min(rise, ceiling) }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: EXIT }}
      transition={{ duration: 0.15, ease: EASE_OUT }}
    >
      <span className="absolute right-0 bottom-0.5 text-[10px] leading-none font-medium tabular-nums">
        {pinned ? "↑ " : ""}
        {label}
      </span>
    </motion.div>
  );
}

// The mini stack's rows pop on with a small overshoot, like Mines' mini map
// cells: each is 3px tall, so a bounce reads as a block landing.
const MINI_LAND: Transition = { type: "spring", duration: 0.3, bounce: 0.3 };
const MINI_ROWS = 10;

/**
 * The round as a tiny tower, rebuilt row by row: a row stands for one or more
 * blocks so any height fits, your cash-out row is blue with a pennant, a
 * missed target is a dashed line, and the top rows topple off at the crash.
 */
function MiniTower({ crash, cashed, target, reduce }: CrashMiniatureProps) {
  const blocks = blockOf(crash) + 1;
  const per = Math.ceil(blocks / MINI_ROWS);
  const rows = Math.ceil(blocks / per);
  const rowOf = (m: number) => Math.min(rows - 1, Math.floor(blockOf(m) / per));
  const cashRow = cashed === null ? null : rowOf(cashed);
  const fallen = rows > 1 ? Math.min(3, rows - 1) : 0;
  const base = MINI.height - 4;
  const rowY = (r: number) => base - 4 * (r + 1);
  const cx = 40;
  // Rows land over at most 0.5s however tall the tower got.
  const step = Math.min(0.05, 0.5 / rows);
  const built = reduce ? 0 : MINI_REPLAY.delay + rows * step;
  const lost = cashed === null;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${MINI.width} ${MINI.height}`}
      width={MINI.width}
      height={MINI.height}
      className="shrink-0 overflow-visible"
    >
      <rect x={cx - 16} y={base} width={32} height={2} rx={1} className="fill-foreground/30" />
      {target !== null ? (
        // A missed target sits above the top row even when it falls in that
        // row's blocks, and one far above the tower pins to the top edge.
        <line
          x1={6}
          x2={MINI.width - 6}
          y1={Math.max(2, Math.min(rowY(Math.floor(blockOf(target) / per)), rowY(rows - 1) - 3))}
          y2={Math.max(2, Math.min(rowY(Math.floor(blockOf(target) / per)), rowY(rows - 1) - 3))}
          strokeDasharray="2 3"
          className="stroke-muted-foreground/60"
        />
      ) : null}
      {Array.from({ length: rows }, (_, r) => {
        const w = (width(r) / 72) * 28;
        const x = cx + offset(r) * 0.4 - w / 2;
        const topple = r >= rows - fallen;
        // Fallen rows land in a pile beside the tower: the lowest falls
        // first and lies at the bottom.
        const pile = r - (rows - fallen);
        const isCash = r === cashRow;
        return (
          // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional
          <g key={r}>
            <motion.g
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={
                topple && !reduce
                  ? {
                      opacity: [0, 1, 1, 0.7],
                      y: [-4, 0, 0, base - 3 - pile * 3.5 - rowY(r)],
                      x: [0, 0, 0, 33 + pile * 2],
                      rotate: [0, 0, 0, pile % 2 ? -3 : 4],
                    }
                  : { opacity: 1, y: 0 }
              }
              transition={
                topple && !reduce
                  ? { duration: 0.3 + 0.45, times: [0, 0.4, 0.5, 1], ease: EASE_IN, delay: MINI_REPLAY.delay + r * step }
                  : { ...MINI_LAND, delay: reduce ? 0 : MINI_REPLAY.delay + r * step }
              }
            >
              <rect
                x={x}
                y={rowY(r)}
                width={w}
                height={3}
                rx={1}
                // Your cash-out row stays blue even when it is among the rows
                // that topple, as it does on the big tower.
                className={cn(
                  isCash
                    ? "fill-primary"
                    : topple
                      ? lost
                        ? "fill-rose-500"
                        : "fill-muted-foreground/60"
                      : "fill-foreground/25",
                )}
              />
              {isCash ? (
                // Inside the row's group, so the pennant falls with it.
                <motion.path
                  d={`M${x - 1},${rowY(r) + 1.5}l-6,-3v6z`}
                  className="fill-primary"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ transformBox: "fill-box", transformOrigin: "right center" }}
                  transition={{ ...SWAP, delay: built }}
                />
              ) : null}
            </motion.g>
          </g>
        );
      })}
    </svg>
  );
}
