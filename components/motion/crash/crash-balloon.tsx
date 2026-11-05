"use client";

import { AnimatePresence, cubicBezier, motion, type Transition } from "motion/react";
import { useId } from "react";
import { EASE_IN, EASE_IN_OUT, EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import {
  CHUTE,
  type CrashMiniatureProps,
  CrashShell,
  clamp01,
  MINI,
  MINI_REPLAY,
  niceAtLeast,
  Parachute,
  PRIMARY_TEXT,
  wrap,
} from "./crash-parts";
import {
  BURST,
  type CrashProps,
  EXIT,
  formatShort,
  growth,
  PULSE,
  SWAP,
  timeAt,
  useCrashGame,
} from "./use-crash-game";

export { type CrashProps, type CrashReveal, crashPoint, formatMultiplier } from "./use-crash-game";

// Stage geometry in SVG units; the stage scales to its container's width.
const W = 400;
const H = 280;
// The balloon sits centre right, clear of the readout; the tape runs down the right edge.
const BX = 262;
const TAPE_X = 348;
// The balloon's envelope centre once aloft, and the tape caret beside it.
const LEVEL = 112;
// The highest a target mark sits, so its flag stays on the stage.
const TARGET_PIN = 14;
const GROUND_Y = H - 24;
// The basket's bottom is 51 units under the envelope centre.
const PARKED = GROUND_Y - 51;
// Tape units per unit of ln(multiplier): 1× to 2× spans about 166 units.
const PX = 240;
// The lift-off takes this long before the balloon holds and the world scrolls.
const LIFT = 1.2;
const rise = cubicBezier(...EASE_IN_OUT);

/**
 * Crash, drawn as a hot-air balloon on an altimeter: the multiplier is the
 * altitude. The balloon lifts off and holds while the tape and clouds scroll
 * past; cash out to bail before the envelope pops.
 */
export function CrashBalloon({ "aria-label": ariaLabel = "Crash", className, ...options }: CrashProps) {
  const game = useCrashGame(options);
  return (
    <CrashShell game={game} aria-label={ariaLabel} className={className} miniature={(props) => <MiniAltitude {...props} />}>
      <Stage
        t={game.t}
        cashed={game.cashed}
        crashed={game.crashed}
        lost={game.lost}
        round={game.round}
        pulse={game.pulse}
        target={game.target}
        ghost={game.ghost}
        reduce={game.reduce}
        skipping={game.skipping}
      />
    </CrashShell>
  );
}

interface StageProps {
  t: number;
  cashed: number | null;
  crashed: boolean;
  lost: boolean;
  round: number;
  pulse: number;
  target: number | null;
  ghost: number | null;
  reduce: boolean;
  skipping: boolean;
}

function Stage({ t, cashed, crashed, lost, round, pulse, target, ghost, reduce, skipping }: StageProps) {
  const id = `crash-balloon-${useId().replace(/:/g, "")}`;
  const m = growth(t);
  // Everything that scrolls derives from ln(m), so a skip just scrolls faster.
  const climb = PX * Math.log(m);
  const lift = t <= 0 ? 0 : reduce ? 1 : rise(Math.min(1, t / LIFT));
  const by = PARKED + (LEVEL - PARKED) * lift;
  // Sway eases in with the lift and freezes at the crash with the clock.
  const sway = reduce ? 0 : lift;
  const tilt = Math.sin(t * 1.6) * 2 * sway;
  const drift = Math.sin(t * 1.1 + 0.6) * 2 * sway;
  // Clouds speed up as the climb goes on.
  const travel = reduce ? 0 : climb + climb ** 2 / 600;
  const tone = lost ? "text-rose-500" : cashed !== null ? "text-muted-foreground" : "text-primary";
  // The basket falls clear of the stage, or stays put if it never left the ground.
  const fall = (H + 10 - (by + 42)) * lift;
  // Where an altitude sits on screen: the tape, its markers and the landmarks share it.
  const at = (value: number) => LEVEL - (Math.log(value) - Math.log(m)) * PX;
  const flagY = cashed === null ? null : at(cashed);

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="block w-full">
      <defs>
        {/* The tape fades out at its ends like a drum turning away. */}
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity={0} />
          <stop offset="0.18" stopColor="white" stopOpacity={1} />
          <stop offset="0.82" stopColor="white" stopOpacity={1} />
          <stop offset="1" stopColor="white" stopOpacity={0} />
        </linearGradient>
        <mask id={`${id}-tape`} maskUnits="userSpaceOnUse" x={0} y={0} width={W} height={H}>
          <rect width={W} height={H} fill={`url(#${id}-fade)`} />
        </mask>
      </defs>

      {/* Clouds and sights stream with t, so a skip would only flicker them:
          they fade out while it runs. Reduced motion keeps the clouds still
          and leaves the sights out, since they would still scroll. */}
      <g className={cn("transition-opacity duration-200", skipping ? "opacity-0" : "opacity-100")}>
      {CLOUDS.map((cloud) => (
        <g
          key={cloud.id}
          transform={`translate(${cloud.x},${wrap(cloud.y + travel * cloud.speed, SPAN) - 20}) scale(${cloud.size})`}
          opacity={cloud.opacity}
          className="fill-foreground"
        >
          <rect x={-18} y={-4} width={36} height={10} rx={5} />
          <circle cx={-5} cy={-4} r={8} />
          <circle cx={7} cy={-2} r={6} />
        </g>
      ))}

      <g
        transform={`translate(0,${reduce ? 0 : climb.toFixed(2)})`}
        className={cn("transition-opacity duration-200", reduce && t > 0 ? "opacity-0" : "opacity-100")}
      >
        <rect y={GROUND_Y} width={W} height={H - GROUND_Y} className="fill-foreground/[0.05]" />
        <line x1={0} x2={W} y1={GROUND_Y} y2={GROUND_Y} className="stroke-border" />
        <ellipse cx={BX} cy={GROUND_Y + 3} rx={14} ry={2.5} opacity={1 - lift} className="fill-foreground/10" />
      </g>

      {reduce ? null : <Landmarks t={t} at={at} />}
      </g>

      {/* Ties the balloon to its reading on the tape once it holds altitude. */}
      <line
        x1={BX + 34}
        x2={TAPE_X - 10}
        y1={LEVEL}
        y2={LEVEL}
        strokeDasharray="2 4"
        opacity={lift}
        className="stroke-foreground/15"
      />

      <Tape m={m} mask={`url(#${id}-tape)`} />

      {ghost !== null ? (
        // Last round's crash point, a quiet trace to climb past.
        <g transform={`translate(${TAPE_X},${at(ghost).toFixed(2)})`} className="text-muted-foreground/60">
          <motion.g key={ghost} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={SWAP}>
            <line x2={12} stroke="currentColor" strokeDasharray="2 2" />
            <path d="M-8.5,-2.5L-3.5,2.5M-3.5,-2.5L-8.5,2.5" stroke="currentColor" strokeWidth={1.25} />
            {/* Dropped when it would print over the target's label. */}
            {target !== null && Math.abs(at(ghost) - Math.max(at(target), TARGET_PIN)) < 12 ? null : (
              <text x={-12} dy="0.32em" textAnchor="end" className="fill-muted-foreground text-[10px] tabular-nums">
                {formatShort(ghost)}
              </text>
            )}
          </motion.g>
        </g>
      ) : null}

      <AnimatePresence initial={false}>
        {target !== null ? (
          // The auto target. On the frame it pays it fades and the cash-out
          // flag takes over; the exiting copy keeps its last position.
          <motion.g
            key="target"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={SWAP}
            className="text-primary"
          >
            {/* The marks stay quiet; the label keeps full contrast. A target
                above the view pins to the top with an arrow, like the plane's. */}
            <g transform={`translate(${TAPE_X},${Math.max(at(target), TARGET_PIN).toFixed(2)})`}>
              {at(target) < TARGET_PIN ? null : (
                <line x2={W - TAPE_X} stroke="currentColor" strokeDasharray="3 3" strokeWidth={1.25} opacity={0.7} />
              )}
              <path d="M0,0V-10L8,-7L0,-4" fill="none" stroke="currentColor" strokeLinejoin="round" opacity={0.7} />
              <text x={-12} dy="0.32em" textAnchor="end" className={cn("fill-current text-[10px]", PRIMARY_TEXT)}>
                {at(target) < TARGET_PIN ? `target ${formatShort(target)} ↑` : "target"}
              </text>
            </g>
          </motion.g>
        ) : null}
      </AnimatePresence>

      {flagY !== null ? (
        <g transform={`translate(${TAPE_X},${flagY.toFixed(2)})`} className="text-primary">
          <motion.g
            key={round}
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SWAP}
          >
            <line x1={0} x2={14} y1={0} y2={0} stroke="currentColor" strokeWidth={1.5} />
            <path d="M0,0V-10L8,-7L0,-4Z" fill="currentColor" />
          </motion.g>
        </g>
      ) : null}

      <g
        transform={`translate(${TAPE_X},${LEVEL})`}
        className={cn("transition-colors duration-150", lost ? "text-rose-500" : "text-primary")}
      >
        <line x1={0} x2={W - TAPE_X} opacity={0.5} stroke="currentColor" />
        <motion.g
          key={pulse}
          initial={pulse > 0 && !reduce ? { scale: 1.5 } : false}
          animate={{ scale: 1 }}
          transition={PULSE}
        >
          <path d="M-9,-4.5L-2,0L-9,4.5Z" fill="currentColor" />
        </motion.g>
      </g>

      {cashed !== null && !reduce && timeAt(cashed) >= LIFT ? (
        // The player bails out from the basket and drifts down under a chute,
        // once the balloon is aloft; a cash out on the ground has no drop.
        <g transform={`translate(${BX + 8},${(by + 48).toFixed(2)})`}>
          <motion.g
            key={round}
            style={{ transformBox: "fill-box", transformOrigin: "50% 0%" }}
            initial={{ y: 0, rotate: -10, opacity: 0 }}
            animate={{ y: 96, rotate: [-10, 8, -5, 3, 0], opacity: [0, 1, 1, 0] }}
            transition={CHUTE}
          >
            <motion.g initial={{ scale: 0.5 }} animate={{ scale: 1 }} transition={SWAP}>
              <Parachute />
            </motion.g>
          </motion.g>
        </g>
      ) : null}

      <g transform={`translate(${BX},${by.toFixed(2)})`} className={cn("transition-colors duration-150", tone)}>
        {crashed && !reduce ? (
          <g key={`burst-${round}`}>
            <motion.circle
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              vectorEffect="non-scaling-stroke"
              r={48}
              initial={{ scale: 12 / 48, opacity: 0.7 }}
              animate={{ scale: 1, opacity: 0 }}
              transition={BURST}
            />
            {SHARDS.map((shard) => (
              <motion.path
                key={shard.id}
                d="M-3,-2Q0,-4 3,-2L2,2Q0,1 -2,2Z"
                fill="currentColor"
                initial={{ x: shard.x0, y: shard.y0, rotate: 0, opacity: 1 }}
                animate={{ x: shard.x, y: shard.y, rotate: shard.spin, opacity: 0 }}
                transition={BURST}
              />
            ))}
          </g>
        ) : null}
        {/* Remounts per round, so a new balloon fades in where the last one popped. */}
        <motion.g
          key={round}
          initial={round > 0 ? { opacity: 0 } : false}
          animate={{ opacity: crashed && reduce ? 0 : 1 }}
          transition={{ duration: 0.2, ease: EASE_OUT }}
        >
          <g transform={`translate(${drift.toFixed(2)},0) rotate(${tilt.toFixed(2)})`}>
            <motion.g
              initial={false}
              animate={crashed && !reduce ? { y: fall, rotate: 14 } : { y: 0, rotate: 0 }}
              transition={crashed && !reduce ? DROP : { duration: 0 }}
            >
              <path d="M-6,31L-5,42M6,31L5,42" stroke="currentColor" strokeWidth={0.75} opacity={0.6} />
              <rect x={-6} y={42} width={12} height={9} rx={1.5} className="fill-foreground/60" />
              <line x1={-6.5} x2={6.5} y1={42.5} y2={42.5} strokeWidth={1.5} className="stroke-foreground/70" />
            </motion.g>
            <motion.g
              initial={false}
              animate={crashed && !reduce ? { scale: 1.15, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={crashed && !reduce ? EXIT : { duration: 0 }}
            >
              <Envelope />
            </motion.g>
          </g>
        </motion.g>
      </g>
    </svg>
  );
}

/** The altimeter: ticks for the multipliers in view, scrolling down on a log scale as the balloon climbs. */
function Tape({ m, mask }: { m: number; mask: string }) {
  // Multipliers at the top and bottom edges of the stage.
  const top = m * Math.exp(LEVEL / PX);
  const bottom = Math.max(1, m * Math.exp((LEVEL - H) / PX));
  // The finest step still 8 units apart where ticks sit widest; denser ticks
  // further up fade out by spacing, so steps hand over without a jump.
  const base = niceAtLeast((bottom * 8) / PX);
  const ticks: { value: number; y: number; tick: number; label: number }[] = [];
  for (let k = Math.ceil(bottom / base - 1e-9); k * base <= top; k++) {
    const value = Number((k * base).toPrecision(12));
    // A tick's weight is the coarsest step it lands on.
    let level = base;
    for (let step = base; step <= value; step = nextStep(step)) {
      if (Math.abs(value / step - Math.round(value / step)) < 1e-6) level = step;
    }
    const gap = PX * Math.log1p(level / value);
    const tick = clamp01((gap - 8) / 10);
    if (tick === 0) continue;
    ticks.push({ value, y: LEVEL - (Math.log(value) - Math.log(m)) * PX, tick, label: clamp01((gap - 56) / 16) });
  }

  return (
    <g mask={mask} className="text-[10px] text-muted-foreground tabular-nums">
      <rect x={TAPE_X} width={W - TAPE_X} height={H} className="fill-foreground/[0.03]" />
      <line x1={TAPE_X} x2={TAPE_X} y1={0} y2={H} className="stroke-border" />
      {ticks.map(({ value, y, tick, label }) => (
        <g key={value} transform={`translate(${TAPE_X},${y.toFixed(2)})`}>
          <line x2={5 + 7 * label} opacity={tick} className="stroke-foreground/30" />
          {label > 0 ? (
            <text x={18} dy="0.32em" opacity={label} className="fill-current">
              {formatShort(value)}
            </text>
          ) : null}
        </g>
      ))}
    </g>
  );
}

// Fixed-altitude sights in the column between the readout and the balloon.
const JET_T = timeAt(10);
const FLOCK = [
  { id: 0, x: 0, y: 0, phase: 0 },
  { id: 1, x: -11, y: 7, phase: 1.3 },
  { id: 2, x: 10, y: 9, phase: 2.6 },
];

/** A flock at 3×, a jet at 10× and a satellite at 100×, each brightening as the balloon passes it. */
function Landmarks({ t, at }: { t: number; at: (value: number) => number }) {
  const sights = [
    // Close to the balloon, clear of the readout on narrow stages.
    { value: 3, x: 208 },
    // The jet crosses the column slowly, nose left.
    { value: 10, x: 204 - (t - JET_T) * 2.5 },
    { value: 100, x: 210 },
  ];
  return (
    <g className="text-foreground">
      {sights.map(({ value, x }) => {
        const y = at(value);
        if (y < -30 || y > H + 30) return null;
        // 0.4 at rest, peaking at 0.8 level with the balloon.
        const near = Math.abs(y - LEVEL) < 40 ? 0.5 + 0.5 * Math.cos((Math.PI * (y - LEVEL)) / 40) : 0;
        return (
          <g key={value} transform={`translate(${x.toFixed(2)},${y.toFixed(2)})`} opacity={0.4 + 0.4 * near}>
            {value === 3 ? (
              FLOCK.map((bird) => {
                const flap = Math.sin(t * 9 + bird.phase) * 2.5;
                const tip = (bird.y - flap).toFixed(2);
                return (
                  <path
                    key={bird.id}
                    d={`M${bird.x - 4},${tip}L${bird.x},${bird.y}L${bird.x + 4},${tip}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.25}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })
            ) : value === 10 ? (
              <g>
                <line x1={9} x2={30} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" opacity={0.35} />
                <path d="M-7,0L-4,-1.5H7L9,-4.5H10L9.5,0Z" fill="currentColor" />
                <path d="M-1,-0.5L4,4.5H5.5L3.5,-0.5Z" fill="currentColor" />
              </g>
            ) : (
              <g>
                <rect x={-3} y={-2.5} width={6} height={5} rx={1} fill="currentColor" />
                <rect x={-13} y={-2} width={8} height={4} fill="none" stroke="currentColor" />
                <rect x={5} y={-2} width={8} height={4} fill="none" stroke="currentColor" />
                <path d="M-5,0H-3M3,0H5M0,-2.5V-6" stroke="currentColor" />
                <circle cy={-7} r={1.25} opacity={Math.sin(t * 5) > 0.2 ? 1 : 0.15} className="fill-primary" />
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}

// The basket drops out of the sky, accelerating.
const DROP: Transition = { duration: 0.6, ease: EASE_IN };

// Fabric torn from the envelope, thrown round it and pulled down a little.
const SHARDS = Array.from({ length: 8 }, (_, i) => {
  const angle = ((i * 45 + (i % 2) * 12) * Math.PI) / 180;
  const reach = 30 + (i % 3) * 9;
  return {
    id: i,
    x0: Math.cos(angle) * 12,
    y0: Math.sin(angle) * 12,
    x: Math.cos(angle) * reach,
    y: Math.sin(angle) * reach + 14,
    spin: (i % 2 ? 1 : -1) * (120 + i * 25),
  };
});

// Two depths: far clouds are small, faint and slow; near ones bigger and quicker.
const CLOUDS = [
  { id: 0, x: 60, y: 40, size: 0.7, speed: 0.45, opacity: 0.04 },
  { id: 1, x: 200, y: 150, size: 0.6, speed: 0.45, opacity: 0.04 },
  { id: 2, x: 310, y: 250, size: 0.75, speed: 0.45, opacity: 0.04 },
  { id: 3, x: 150, y: 90, size: 1.1, speed: 1.4, opacity: 0.07 },
  { id: 4, x: 290, y: 20, size: 1.2, speed: 1.4, opacity: 0.07 },
  { id: 5, x: 90, y: 220, size: 1, speed: 1.4, opacity: 0.07 },
];
const SPAN = H + 40;


/** The next step up the 1, 2, 5 ladder. */
function nextStep(step: number) {
  const unit = Math.round(step / 10 ** Math.floor(Math.log10(step) + 1e-9));
  return Number((step * (unit === 2 ? 2.5 : 2)).toPrecision(12));
}

/** The envelope, centred on the origin: a teardrop with a lighter middle gore and a throat. */
function Envelope() {
  return (
    <g>
      <path
        d="M0,-26C16,-26 26,-14 26,-2C26,12 12,20 7,28L-7,28C-12,20 -26,12 -26,-2C-26,-14 -16,-26 0,-26Z"
        fill="currentColor"
      />
      <path d="M0,-26C10,-12 10,14 4,28L-4,28C-10,14 -10,-12 0,-26Z" className="fill-card/25" />
      <rect x={-6} y={28} width={12} height={3} rx={1} fill="currentColor" opacity={0.7} />
    </g>
  );
}

/**
 * The round as a tiny altimeter, on its own log scale so a skip to a huge
 * crash still reads: the climb rises up the tape, a parachute hangs where you
 * bailed out, the balloon pops at the crash height, and a missed target is a
 * dashed line above it.
 */
function MiniAltitude({ crash, cashed, target, reduce }: CrashMiniatureProps) {
  const top = Math.max(crash, target ?? 1, 1.01);
  // Room above the top level for the popped balloon.
  const y = (value: number) => MINI.height - 4 - (Math.log(value) / Math.log(top)) * (MINI.height - 14);
  const tape = 12;
  const won = cashed !== null;
  const reach = won ? cashed : crash;
  const after = (extra: number) => (reduce ? 0 : MINI_REPLAY.delay + extra);
  const pop = {
    initial: reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25 },
    animate: { opacity: 1, scale: 1 },
    style: { transformBox: "fill-box", transformOrigin: "center" } as const,
  };
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${MINI.width} ${MINI.height}`}
      width={MINI.width}
      height={MINI.height}
      className="shrink-0 overflow-visible"
    >
      <line x1={tape} x2={tape} y1={4} y2={MINI.height - 4} className="stroke-border" />
      <line x1={tape - 3} x2={tape + 3} y1={MINI.height - 4} y2={MINI.height - 4} className="stroke-border" />
      {target !== null ? (
        <line
          x1={tape}
          x2={MINI.width - 4}
          y1={y(target)}
          y2={y(target)}
          strokeDasharray="2 3"
          className="stroke-muted-foreground/60"
        />
      ) : null}
      {/* The climb up the tape, replayed. */}
      <motion.line
        x1={tape}
        x2={tape}
        y1={y(1)}
        y2={y(reach)}
        strokeWidth={2.5}
        strokeLinecap="round"
        className={won ? "stroke-primary" : "stroke-rose-500"}
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ ...MINI_REPLAY, delay: after(0) }}
      />
      {won ? (
        <>
          <motion.line
            x1={tape}
            x2={tape}
            y1={y(cashed)}
            y2={y(crash)}
            strokeWidth={1.5}
            strokeDasharray="2 3"
            className="stroke-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25, ease: EASE_OUT, delay: after(0.5) }}
          />
          <line x1={tape} x2={34} y1={y(cashed)} y2={y(cashed)} strokeDasharray="1 2" className="stroke-primary/50" />
          <g transform={`translate(40,${(y(cashed) - 5).toFixed(2)}) scale(0.6)`}>
            <motion.g {...pop} transition={{ ...SWAP, delay: after(0.45) }}>
              <Parachute />
            </motion.g>
          </g>
        </>
      ) : null}
      <line x1={tape} x2={56} y1={y(crash)} y2={y(crash)} strokeDasharray="1 2" className="stroke-muted-foreground/50" />
      <g transform={`translate(64,${y(crash).toFixed(2)})`}>
        <motion.g {...pop} transition={{ ...SWAP, delay: after(0.55) }}>
          {/* The popped balloon, faded, with the crash's cross over it. */}
          <g transform="scale(0.26)" opacity={0.45} className={won ? "text-muted-foreground" : "text-rose-500"}>
            <Envelope />
          </g>
          <path d="M-3,-3L3,3M3,-3L-3,3" strokeWidth={1.75} strokeLinecap="round" className="stroke-rose-500" />
        </motion.g>
      </g>
    </svg>
  );
}
