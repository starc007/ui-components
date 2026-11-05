"use client";

import { AnimatePresence, motion, type Transition } from "motion/react";
import { useId } from "react";
import { EASE_IN, EASE_IN_OUT, EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { type CrashMiniatureProps, CrashShell, MINI, MINI_REPLAY, PRIMARY_TEXT } from "./crash/crash-parts";
import {
  BURST,
  type CrashProps,
  EXIT,
  formatShort,
  GROWTH,
  growth,
  SWAP,
  timeAt,
  useCrashGame,
} from "./crash/use-crash-game";

export { type CrashProps, crashPoint, formatMultiplier } from "./crash/use-crash-game";

// Graph geometry in SVG units, matching the shell's 10:7 stage.
const W = 400;
const H = 280;
// The y labels sit in the right pad; the left pad clears the parked plane's tail.
const PAD = { left: 18, right: 40, top: 20, bottom: 24 };
// The axes start at 8s and 2.2×, then grow so the head stays near 82% across
// and 72% up, which keeps them continuous with no rescale jumps.
const X_MIN = 8;
// 2.2×, not lower: while the axes are fixed the head must stay under the
// readout's corner (top 40%, left 45%) even on a narrow stage.
const Y_MIN = 2.2;
const HEAD_X = 0.82;
const HEAD_Y = 0.72;

/**
 * A crash game: a paper plane flies the multiplier up a curve until it
 * crashes at a random point. Cash out before it does. After a cash out the
 * flight keeps going, so the player sees what they left on the table.
 */
export function Crash({ "aria-label": ariaLabel = "Crash", className, ...options }: CrashProps) {
  const game = useCrashGame(options);
  // The shell pins the readout top left: an exponential curve never reaches
  // that corner, so the flight can't run under the numbers.
  return (
    <CrashShell game={game} aria-label={ariaLabel} className={className} miniature={(props) => <MiniFlight {...props} />}>
      <Graph
        t={game.t}
        cashed={game.cashed}
        crashed={game.crashed}
        round={game.round}
        reduce={game.reduce}
        skipping={game.skipping}
        target={game.target}
      />
    </CrashShell>
  );
}

interface GraphProps {
  t: number;
  cashed: number | null;
  crashed: boolean;
  round: number;
  reduce: boolean;
  skipping: boolean;
  target: number | null;
}

/** The flight: a curve from 1× at 0s to the current multiplier, on axes that grow with it. */
function Graph({ t, cashed, crashed, round, reduce, target, skipping }: GraphProps) {
  const fill = `crash-fill-${useId().replace(/:/g, "")}`;
  const m = growth(t);
  const xMax = Math.max(X_MIN, t / HEAD_X);
  const yMax = Math.max(Y_MIN, 1 + (m - 1) / HEAD_Y);
  const x = (seconds: number) => PAD.left + (seconds / xMax) * (W - PAD.left - PAD.right);
  const y = (value: number) => H - PAD.bottom - ((value - 1) / (yMax - 1)) * (H - PAD.top - PAD.bottom);
  const base = y(1);

  // Sampled densely enough that the bend reads as smooth at any scale.
  const path = (from: number, to: number) => {
    let d = "";
    for (let i = 0; i <= 48; i++) {
      const s = from + ((to - from) * i) / 48;
      d += `${i === 0 ? "M" : "L"}${x(s).toFixed(2)},${y(growth(s)).toFixed(2)}`;
    }
    return d;
  };
  const cashT = cashed === null ? null : timeAt(cashed);
  const flown = cashT === null ? t : Math.min(t, cashT);
  const line = path(0, flown);
  const area = `${line}L${x(flown).toFixed(2)},${base}L${x(0)},${base}Z`;
  const lost = crashed && cashed === null;
  const missed = cashT !== null && t > cashT && !crashed ? path(cashT, t) : null;

  const yStep = niceStep(yMax - 1);
  // 1× plus round multiples of the step (500×, 1K×, not 501×), skipping one
  // too close to the baseline. The epsilon keeps 0.8 / 0.2 from flooring to 3.
  const yTicks = [1];
  for (let k = Math.ceil(1 / yStep + 1e-9); k * yStep <= yMax + 1e-9; k++) {
    if (k * yStep - 1 >= yStep * 0.5) yTicks.push(+(k * yStep).toFixed(6));
  }
  const xStep = niceStep(xMax);
  const xTicks = Array.from({ length: Math.floor(xMax / xStep + 1e-9) }, (_, i) => (i + 1) * xStep);

  const head = { x: x(t), y: y(m) };
  // Bank along the curve's on-screen slope, levelling out on the runway at
  // 0s and easing up over the first 0.6s of take-off. A slight bob keeps it
  // airborne; reduced motion drops the bob and the take-off ease, so the
  // plane just points along the curve.
  const slope = Math.atan2(
    -((H - PAD.top - PAD.bottom) / (yMax - 1)) * GROWTH * m,
    (W - PAD.left - PAD.right) / xMax,
  );
  const flying = t > 0 && !crashed;
  const bob = flying && !reduce ? Math.sin(t * 6) * 3 : 0;
  const takeOff = reduce ? (t > 0 ? 1 : 0) : Math.min(1, t / 0.6);
  const bank = Math.max(-70, (slope * 180) / Math.PI) * takeOff + bob;

  const travel = reduce ? 0 : 30 * t + 9 * Math.min(t, 20) ** 2 + 390 * Math.max(0, t - 20);
  const near = travel;
  const far = travel * 0.35;
  const streakLength = 4 + Math.min(14, (30 + 18 * Math.min(t, 20)) * 0.035);
  const marker = cashT === null || cashed === null ? null : { x: x(cashT), y: y(cashed) };

  const targetLine =
    target === null ? null : { y: y(Math.min(target, yMax)), above: target > yMax, label: formatShort(target) };

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <defs>
        <linearGradient id={fill} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity={0.22} />
          <stop offset="1" stopColor="currentColor" stopOpacity={0} />
        </linearGradient>
        {/* Grid lines fade in from the left, leaving the readout's corner clear. */}
        <linearGradient id={`${fill}-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.2" stopColor="white" stopOpacity={0} />
          <stop offset="0.6" stopColor="white" stopOpacity={1} />
        </linearGradient>
        <mask id={`${fill}-grid`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${fill}-fade)`} />
        </mask>
      </defs>

      {/* Speed field: far dots and near streaks stream past, faster as the
          plane climbs. Positions derive from t, so a skip would only
          flicker; it fades out then. Shown only in flight, so a parked or
          crashed graph is clean. */}
      <g className={cn("transition-opacity duration-200", flying && !skipping ? "opacity-100" : "opacity-0")}>
        {FAR.map((dot) => (
          <circle
            key={dot.id}
            cx={wrap(dot.x - far)}
            cy={dot.y}
            r={1}
            className="fill-foreground/15"
          />
        ))}
        {NEAR.map((streak) => {
          const from = wrap(streak.x - near);
          return (
            <line
              key={streak.id}
              x1={from}
              x2={from + streakLength}
              y1={streak.y}
              y2={streak.y}
              strokeWidth={1.5}
              strokeLinecap="round"
              className="stroke-foreground/10"
            />
          );
        })}
      </g>

      <g className="text-[10px] text-muted-foreground tabular-nums">
        <AnimatePresence initial={false}>
          {yTicks.map((value) => (
            <motion.g
              key={`y${formatShort(value)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: EXIT }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            >
              <line
                x1={PAD.left}
                x2={W - PAD.right}
                y1={y(value)}
                y2={y(value)}
                mask={value === 1 ? undefined : `url(#${fill}-grid)`}
                className={value === 1 ? "stroke-border" : "stroke-foreground/[0.07]"}
              />
              {/* Labels on the right, past the head, which stays at 82% across. */}
              <text x={W - PAD.right + 8} y={y(value)} dy="0.32em" className="fill-current">
                {formatShort(value)}
              </text>
            </motion.g>
          ))}
          {xTicks.map((value) => (
            // Motion reads `x` as a transform, so the position sits on a plain text.
            <motion.g
              key={`x${+value.toFixed(1)}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: EXIT }}
              transition={{ duration: 0.15, ease: EASE_OUT }}
            >
              <text x={x(value)} y={H - 8} textAnchor="middle" className="fill-current">
                {`${+value.toFixed(1)}s`}
              </text>
            </motion.g>
          ))}
        </AnimatePresence>
      </g>

      <AnimatePresence>
        {targetLine ? (
          // The auto target, ahead of the plane: a dashed line that fades in
          // from the left like the grid, or a caret at the top while it is
          // still above the axes. It fades out once it pays.
          <motion.g
            key="target"
            className="text-primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
          >
            {targetLine.above ? null : (
              <line
                opacity={0.75}
                x1={PAD.left}
                x2={W - PAD.right}
                y1={targetLine.y}
                y2={targetLine.y}
                stroke="currentColor"
                strokeWidth={1.5}
                strokeDasharray="5 4"
                mask={`url(#${fill}-grid)`}
              />
            )}
            <text
              x={W - PAD.right - 4}
              y={targetLine.above ? PAD.top + 4 : targetLine.y - 6}
              textAnchor="end"
              className={cn("fill-current text-[10px] font-medium tabular-nums", PRIMARY_TEXT)}
            >
              {`Auto ${targetLine.label}${targetLine.above ? " ↑" : ""}`}
            </text>
          </motion.g>
        ) : null}
      </AnimatePresence>

      <g className={cn("transition-colors duration-150", lost ? "text-rose-500" : "text-primary")}>
        <path d={area} fill={`url(#${fill})`} />
        <path d={line} fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <AnimatePresence>
        {missed ? (
          // After a cash out the plane's trail shows what was left on the
          // table while it flies on; it clears at the crash so a finished
          // graph doesn't keep a stray line behind the result.
          <motion.path
            key={`missed-${round}`}
            d={missed}
            fill="none"
            strokeWidth={2}
            strokeDasharray="4 5"
            strokeLinecap="round"
            className="stroke-muted-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
          />
        ) : null}
      </AnimatePresence>

      {marker ? (
        <g transform={`translate(${marker.x.toFixed(2)},${marker.y.toFixed(2)})`}>
          {reduce ? null : (
            // The player bails out: a parachute opens at the cash point and
            // drifts down, swaying, before it fades.
            <motion.g
              key={`chute-${round}`}
              // Swings like a pendulum from the canopy, not round its middle.
              style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
              initial={{ y: 2, rotate: -12, opacity: 0 }}
              animate={{ y: 40, rotate: [-12, 9, -6, 4, 0], opacity: [0, 1, 1, 0] }}
              transition={CHUTE}
            >
              <motion.g initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={SWAP}>
                <Parachute />
              </motion.g>
            </motion.g>
          )}
          {/* The badge in the readout names the value; the curve marks where. */}
          <motion.circle
            key={round}
            r={4.5}
            strokeWidth={2.5}
            className="fill-card stroke-primary"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SWAP}
          />
        </g>
      ) : null}

      <g
        transform={`translate(${head.x.toFixed(2)},${head.y.toFixed(2)})`}
        className={cn(
          "transition-colors duration-150",
          // Red only for a loss, like the readout.
          lost ? "text-rose-500" : cashed !== null ? "text-muted-foreground" : "text-primary",
        )}
      >
        {crashed && !reduce ? (
          <g key={`burst-${round}`}>
            <motion.circle
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              r={28}
              initial={{ scale: 5 / 28, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={BURST}
            />
            {SHREDS.map((shred) => (
              <motion.path
                key={shred.id}
                d="M0,-2.5L3,2L-3,2Z"
                fill="currentColor"
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: shred.x, y: shred.y, rotate: shred.spin, opacity: 0 }}
                transition={BURST}
              />
            ))}
          </g>
        ) : null}
        {/* Screen-space fall on the outside, the plane's bank inside it. */}
        <motion.g
          key={`plane-${round}`}
          initial={false}
          animate={
            crashed
              ? reduce
                ? { opacity: 0 }
                : { x: 16, y: 70, rotate: 150, scale: 0.75, opacity: [1, 1, 0] }
              : { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }
          }
          transition={crashed && !reduce ? TUMBLE : { duration: 0.2, ease: EASE_OUT }}
        >
          <g transform={`rotate(${bank.toFixed(2)}) translate(0,-3)`}>
            <PaperPlane />
          </g>
        </motion.g>
        {crashed ? (
          // Where the flight ended, left behind once the plane has fallen, so
          // a finished graph still says how far it got.
          <motion.g
            key={`end-${round}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SWAP, delay: reduce ? 0 : 0.35 }}
          >
            <circle r={7} fill="currentColor" opacity={0.15} />
            <path d="M-3,-3L3,3M3,-3L-3,3" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          </motion.g>
        ) : null}
      </g>
    </svg>
  );
}

// The crashed plane tumbles and drops out of the sky, accelerating.
const TUMBLE: Transition = { duration: 0.6, ease: EASE_IN, opacity: { duration: 0.6, times: [0, 0.6, 1] } };
// The parachute is a once-a-round moment, so it may take its time.
const CHUTE: Transition = {
  y: { duration: 2.2, ease: EASE_OUT },
  rotate: { duration: 2.2, ease: EASE_IN_OUT },
  opacity: { duration: 2.2, times: [0, 0.08, 0.7, 1] },
};

// Paper shreds thrown out by the crash, spread round the head and pulled
// down a little, as if by gravity. Fixed, so every crash is the same shape.
const SHREDS = Array.from({ length: 7 }, (_, i) => {
  const angle = ((-160 + i * 50 + (i % 2) * 14) * Math.PI) / 180;
  const reach = 20 + (i % 3) * 8;
  return {
    id: i,
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach + 12,
    spin: (i % 2 ? 1 : -1) * (140 + i * 30),
  };
});

// Speed field points, scattered over the plot by fixed strides.
const PLOT_H = H - PAD.top - PAD.bottom;
const FAR = Array.from({ length: 22 }, (_, i) => ({ id: i, x: (i * 97.3) % W, y: PAD.top + ((i * 53.7) % PLOT_H) }));
const NEAR = Array.from({ length: 9 }, (_, i) => ({ id: i, x: (i * 151.9) % W, y: PAD.top + 8 + ((i * 71.3) % (PLOT_H - 16)) }));
const wrap = (value: number) => ((value % W) + W) % W;

/** A folded paper plane, nose to the right, about 26 units long. */
function PaperPlane() {
  return (
    <g>
      <path d="M13,0L-4,-1L-8,6Z" fill="currentColor" opacity={0.55} />
      <path d="M13,0L-11,-9L-4,-1Z" fill="currentColor" />
      <path d="M13,0L-4,-1" className="stroke-card/40" strokeWidth={0.75} />
    </g>
  );
}

/** A small parachute: a scalloped canopy, three lines and the player. */
function Parachute() {
  return (
    <g className="text-primary">
      <path d="M-9,0Q-9,-11 0,-11Q9,-11 9,0Q6,-3 3,0Q0,-3 -3,0Q-6,-3 -9,0Z" fill="currentColor" />
      <path d="M-9,0L0,10M0,0L0,10M9,0L0,10" stroke="currentColor" strokeWidth={0.75} opacity={0.6} fill="none" />
      <circle cy={11.5} r={2} fill="currentColor" />
    </g>
  );
}

/** A tick spacing of 1, 2 or 5 times a power of ten, giving at most about four ticks. */
function niceStep(range: number) {
  const raw = range / 4;
  const power = 10 ** Math.floor(Math.log10(raw));
  return ([1, 2, 5, 10].find((unit) => unit * power >= raw) ?? 10) * power;
}

/**
 * The round's flight in miniature, on its own axes so a skip to a huge crash
 * still reads: the curve replays up to your cash out, runs on dashed to the
 * crash, and ends in a cross; a missed target is a dashed line above.
 */
function MiniFlight({
  crash,
  cashed,
  target,
  reduce,
}: CrashMiniatureProps) {
  const top = Math.max(crash, target ?? 1, 1.01);
  const end = timeAt(top);
  const x = (seconds: number) => 4 + (seconds / end) * (MINI.width - 8);
  const y = (value: number) => MINI.height - 4 - ((value - 1) / (top - 1)) * (MINI.height - 8);
  const path = (from: number, to: number) => {
    let d = "";
    for (let i = 0; i <= 24; i++) {
      const s = from + ((to - from) * i) / 24;
      d += `${i === 0 ? "M" : "L"}${x(s).toFixed(2)},${y(growth(s)).toFixed(2)}`;
    }
    return d;
  };
  const crashT = timeAt(crash);
  const cashT = cashed === null ? null : timeAt(cashed);
  const draw = (delay: number) => ({
    initial: { pathLength: reduce ? 1 : 0 },
    animate: { pathLength: 1 },
    transition: { ...MINI_REPLAY, delay: reduce ? 0 : delay },
  });
  return (
    <svg aria-hidden="true" viewBox={`0 0 ${MINI.width} ${MINI.height}`} width={MINI.width} height={MINI.height} className="shrink-0 overflow-visible">
      <line x1={4} x2={MINI.width - 4} y1={MINI.height - 4} y2={MINI.height - 4} className="stroke-border" />
      {target !== null ? (
        <line
          x1={4}
          x2={MINI.width - 4}
          y1={y(target)}
          y2={y(target)}
          strokeDasharray="2 3"
          className="stroke-muted-foreground/60"
        />
      ) : null}
      {cashT === null ? (
        <motion.path d={path(0, crashT)} fill="none" strokeWidth={2} strokeLinecap="round" className="stroke-rose-500" {...draw(0.3)} />
      ) : (
        <>
          <motion.path d={path(0, cashT)} fill="none" strokeWidth={2} strokeLinecap="round" className="stroke-primary" {...draw(0.3)} />
          <motion.path
            d={path(cashT, crashT)}
            fill="none"
            strokeWidth={1.5}
            strokeDasharray="2 3"
            strokeLinecap="round"
            className="stroke-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT, delay: reduce ? 0 : 0.8 }}
          />
          <circle cx={x(cashT)} cy={y(cashed ?? 1)} r={3} strokeWidth={1.5} className="fill-card stroke-primary" />
        </>
      )}
      <motion.path
        d={`M${x(crashT) - 2.5},${y(crash) - 2.5}l5,5m0,-5l-5,5`}
        strokeWidth={1.75}
        strokeLinecap="round"
        className="stroke-rose-500"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        transition={{ ...SWAP, delay: reduce ? 0 : 0.85 }}
      />
    </svg>
  );
}
