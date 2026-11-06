"use client";

import { History as HistoryIcon } from "lucide-react";
import { animate, type MotionValue, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/motion/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { EASE_OUT } from "@/lib/ease";
import { createGameSounds } from "@/lib/game-sounds";
import { createTickPlayer } from "@/lib/tick-sound";
import { cn } from "@/lib/utils";
import {
  formatMultiplier,
  formatShort,
  GameEyebrow,
  GameHistory,
  type GameHistoryEntry,
  heat,
  SoundToggle,
} from "./casino/game-parts";

export { formatMultiplier } from "./casino/game-parts";

export interface SlideGameProps {
  /** Target multiplier (controlled). A result at or above it wins. Applies from the next round. */
  target?: number;
  /** Initial target when uncontrolled. Default 2. */
  defaultTarget?: number;
  /** Called when the Target menu changes between rounds. */
  onTargetChange?: (target: number) => void;
  /** Targets offered in the menu. Default 1.5×, 2×, 3×, 5×, 10×, 25×, 100×. */
  targets?: number[];
  /** Bet amount (controlled), used for the profit readout and passed to `onResult`. */
  bet?: number;
  /** Initial bet when uncontrolled. Default 1. */
  defaultBet?: number;
  /** Called when the bet changes. */
  onBetChange?: (bet: number) => void;
  /** Currency symbol shown before the bet and the profit. Default "$". */
  currency?: string;
  /** Formats the profit. Default the currency symbol and two decimals ($1.50). */
  formatAmount?: (amount: number) => string;
  /**
   * Decides each round's result, called once when the round starts. Return a
   * number, or a Promise for one (a server round, a provably fair hash): the
   * button shows Starting… until it settles, and a rejection cancels the
   * round. Values below 1 or not finite play as 1. Default `slideResult()`.
   * The win chance shown assumes its 1% edge.
   */
  getResult?: () => number | Promise<number>;
  /** Called when the reel stops, with the result, the round's target and its bet. The round wins when result >= target. */
  onResult?: (result: number, target: number, bet: number) => void;
  /** Slide length in seconds. Default 4. */
  duration?: number;
  /** Play synthesized sounds (controlled): a tick per card into the center and a chime on a win. */
  sound?: boolean;
  /** Initial sound state when uncontrolled. Default false. */
  defaultSound?: boolean;
  /** Called when the sound button is toggled. */
  onSoundChange?: (sound: boolean) => void;
  /** Accessible name for the game. Default "Slide". */
  "aria-label"?: string;
  className?: string;
}

/**
 * A result from one uniform draw in [0, 1): the reel reaches `m` or more with
 * probability (1 − houseEdge) / m, floored to two decimals and capped at
 * 1,000,000×. Pass your own `random` for a seeded or provably fair round.
 */
export function slideResult(random: () => number = Math.random, houseEdge = 0.01) {
  const edge = Math.min(Math.max(houseEdge, 0), 1);
  return Math.min(1_000_000, Math.max(1, Math.floor((100 * (1 - edge)) / (1 - random())) / 100));
}

const TARGETS = [1.5, 2, 3, 5, 10, 25, 100];
const HISTORY = 12;
// Presses this soon after a round ends are the same press repeated (a double
// tap, a held key), not the next round (ms).
const PRESS_GUARD = 400;
// Round numbers, unique on the page.
let rounds = 0;

type Phase = "idle" | "starting" | "sliding" | "settled";
type Round = { id: number; result: number; target: number; bet: number };

const settleValue = (value: number) => (Number.isFinite(value) ? Math.max(1, Math.floor(value * 100 + 1e-9) / 100) : 1);
const parseBet = (text: string) => {
  const value = Number.parseFloat(text);
  return Number.isFinite(value) && value > 0 ? value : 0;
};

/**
 * A slide game: set a bet and a target, then a reel of multiplier cards races
 * past two tabs at the center of the stage, tilting in 3D as they pass, slows
 * through the last few and clicks the result into place between them. At or
 * above the target wins. The result comes from `getResult`, so a server can
 * decide it and the reel only plays it back.
 */
export function SlideGame({
  target: targetProp,
  defaultTarget = 2,
  onTargetChange,
  targets = TARGETS,
  bet: betProp,
  defaultBet = 1,
  onBetChange,
  currency = "$",
  formatAmount,
  getResult = slideResult,
  onResult,
  duration = 4,
  sound,
  defaultSound = false,
  onSoundChange,
  "aria-label": ariaLabel = "Slide",
  className,
}: SlideGameProps) {
  const reduce = useReducedMotion() ?? false;
  const betId = useId();
  const [internalTarget, setInternalTarget] = useState(defaultTarget);
  const target = targetProp ?? internalTarget;
  // The field keeps what the player typed ("1." mid-edit); a controlled bet
  // that disagrees with it replaces it in the same render.
  const [draft, setDraft] = useState(() => String(betProp ?? defaultBet));
  // The string check stops the loop for a bet the field can't hold (-1, NaN).
  if (betProp !== undefined && betProp !== parseBet(draft) && String(betProp) !== draft) setDraft(String(betProp));
  const bet = betProp ?? parseBet(draft);
  const [internalSound, setInternalSound] = useState(defaultSound);
  const soundOn = sound ?? internalSound;
  const [phase, setPhase] = useState<Phase>("idle");
  const [round, setRound] = useState<Round | null>(null);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const pending = useRef(0);
  const endedAt = useRef(Number.NEGATIVE_INFINITY);
  const lastTick = useRef(0);
  const sounds = useRef<{ tick: ReturnType<typeof createTickPlayer>; game: ReturnType<typeof createGameSounds> } | null>(
    null,
  );
  const latest = useRef({ soundOn, onResult });
  useLayoutEffect(() => {
    latest.current = { soundOn, onResult };
  });

  useEffect(() => {
    const created = { tick: createTickPlayer(), game: createGameSounds() };
    sounds.current = created;
    return () => {
      created.tick.dispose();
      created.game.dispose();
      sounds.current = null;
      pending.current = 0;
    };
  }, []);

  const busy = phase === "starting" || phase === "sliding";
  // An empty or zero bet can't start a round.
  const noBet = bet <= 0;
  const blocked = busy || noBet;
  const options = targets.includes(target) ? targets : [...targets, target].sort((a, b) => a - b);
  const settled = phase === "settled" && round !== null;
  const won = settled ? round.result >= round.target : undefined;

  const play = () => {
    if (blocked || performance.now() - endedAt.current < PRESS_GUARD) return;
    // Audio unlocks inside the click.
    if (soundOn) {
      sounds.current?.tick.prepare();
      sounds.current?.game.prepare();
    }
    const id = ++rounds;
    const roundTarget = target;
    const roundBet = bet;
    const before = phase;
    pending.current = id;
    setPhase("starting");
    setAnnouncement("");
    Promise.resolve()
      .then(getResult)
      .then(
        (value) => {
          if (pending.current !== id) return;
          setRound({ id, result: settleValue(value), target: roundTarget, bet: roundBet });
          setPhase("sliding");
          setAnnouncement(`Sliding. Target ${formatShort(roundTarget)}.`);
        },
        () => {
          if (pending.current === id) setPhase(before);
        },
      );
  };

  const settle = (ended: Round) => {
    const win = ended.result >= ended.target;
    endedAt.current = performance.now();
    setPhase("settled");
    setHistory((items) => [{ id: ended.id, value: ended.result }, ...items].slice(0, HISTORY));
    setAnnouncement(
      `Landed on ${formatMultiplier(ended.result)}. ${win ? "Win" : "Loss"}, target ${formatShort(ended.target)}.`,
    );
    if (win && latest.current.soundOn) sounds.current?.game.cashOut();
    latest.current.onResult?.(ended.result, ended.target, ended.bet);
  };

  // A tick per card reaching the center, at most one per 40ms: the opening rush
  // reads as a whirr and the last few cards click one by one.
  const cross = () => {
    if (!latest.current.soundOn) return;
    const now = performance.now();
    if (now - lastTick.current < 40) return;
    lastTick.current = now;
    sounds.current?.tick.play();
  };

  const changeBet = (text: string) => {
    setDraft(text);
    onBetChange?.(parseBet(text));
  };
  const scaleBet = (factor: number) => {
    const next = Math.max(0.01, Math.round(bet * factor * 100) / 100);
    setDraft(next.toFixed(2));
    onBetChange?.(next);
  };
  const changeTarget = (value: string) => {
    const next = Number(value);
    if (targetProp === undefined) setInternalTarget(next);
    onTargetChange?.(next);
  };
  const toggleSound = () => {
    const next = !soundOn;
    if (next) {
      sounds.current?.tick.prepare();
      sounds.current?.game.prepare();
    }
    if (sound === undefined) setInternalSound(next);
    onSoundChange?.(next);
  };

  const roundTarget = formatShort(round?.target ?? target);
  // Matches slideResult's default 1% edge.
  const chance = `${Math.min(99, 99 / target).toFixed(2)}%`;

  return (
    <section aria-label={ariaLabel} className={cn("@container w-full max-w-3xl", className)}>
      {/* 24px card corners = 12px panel and stage corners + 12px padding. Under
          36rem the stage stacks over the controls; at 36rem it keeps ~350px beside them. */}
      <div className="flex flex-col-reverse gap-3 rounded-3xl border border-border p-3 @min-[36rem]:flex-row">
        <div className="flex shrink-0 flex-col gap-3 @min-[36rem]:w-56">
          <div className="grid grid-cols-2 gap-3 @min-[36rem]:grid-cols-1">
            <div className="flex min-w-0 flex-col gap-1.5">
              <label htmlFor={betId} className="text-xs font-medium text-muted-foreground">
                Bet amount
              </label>
              <div
                className={cn(
                  "flex h-10 items-center gap-0.5 rounded-xl border bg-background pr-1 pl-3 transition-colors focus-within:ring-2 focus-within:ring-foreground/20",
                  noBet ? "border-rose-500/60" : "border-border hover:border-(--color-border-strong)",
                )}
              >
                {currency ? (
                  <span aria-hidden="true" className="pr-0.5 text-sm font-medium text-muted-foreground">
                    {currency}
                  </span>
                ) : null}
                <input
                  id={betId}
                  aria-invalid={noBet || undefined}
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft}
                  onChange={(event) => changeBet(event.target.value)}
                  disabled={busy}
                  className="w-full min-w-0 bg-transparent text-sm font-medium tabular-nums text-foreground outline-none disabled:opacity-50"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  pressScale={0.96}
                  className="h-8 rounded-lg px-2.5 tabular-nums"
                  onClick={() => scaleBet(0.5)}
                  disabled={busy}
                  aria-label="Halve bet"
                >
                  ½
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  pressScale={0.96}
                  className="h-8 rounded-lg px-2.5 tabular-nums"
                  onClick={() => scaleBet(2)}
                  disabled={busy}
                  aria-label="Double bet"
                >
                  2×
                </Button>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <span aria-hidden="true" className="text-xs font-medium text-muted-foreground">
                Target
              </span>
              <Select value={String(target)} onValueChange={changeTarget} disabled={busy}>
                <SelectTrigger className="h-10 rounded-xl tabular-nums">
                  <span className="sr-only">Target </span>
                  {/* Options register after mount; the placeholder covers the server render. */}
                  <SelectValue placeholder={formatShort(target)} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((step) => (
                    <SelectItem key={step} value={String(step)}>
                      {formatShort(step)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 rounded-xl bg-muted/40 px-3 py-2.5 text-xs @min-[36rem]:grid-cols-1 @min-[36rem]:gap-2">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Win chance</dt>
              <dd className="font-medium tabular-nums">{chance}</dd>
            </div>
            <div className="flex items-center justify-between gap-2">
              <dt className="text-muted-foreground">Profit on win</dt>
              <dd className="font-medium tabular-nums">
                {formatAmount ? formatAmount(bet * (target - 1)) : `${currency}${(bet * (target - 1)).toFixed(2)}`}
              </dd>
            </div>
          </dl>

          <Button
            className={cn(
              "h-12 w-full rounded-xl text-base tabular-nums aria-disabled:opacity-60 aria-disabled:hover:bg-primary @min-[36rem]:mt-auto",
              busy ? "aria-disabled:cursor-wait" : "aria-disabled:cursor-not-allowed",
            )}
            // aria-disabled, not disabled: the button keeps keyboard focus through the round.
            aria-disabled={blocked || undefined}
            aria-busy={busy || undefined}
            // No press or hover response while it can't act. Passed only then:
            // Button spreads props last, so an explicit undefined would drop its hover.
            pressScale={blocked ? 1 : 0.96}
            {...(blocked ? { whileHover: {} } : {})}
            onClick={play}
            onKeyDown={(event) => {
              // A held Enter repeats clicks; it would start rounds on its own.
              if (event.repeat && event.key === "Enter") event.preventDefault();
            }}
          >
            {phase === "starting"
              ? "Starting…"
              : phase === "sliding"
                ? "Sliding…"
                : noBet
                  ? "Enter a bet"
                  : settled
                    ? "Slide again"
                    : "Slide"}
          </Button>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex h-8 items-center gap-2 pl-1">
            <HistoryIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <GameHistory history={history} reduce={reduce} tier={face} aria-label="Recent slides" className="min-w-0 flex-1" />
            <SoundToggle on={soundOn} onToggle={toggleSound} />
          </div>

          {/* The stage is the reel alone, so the edge tabs can hang from its edges. */}
          <Reel
            round={round}
            // Pips mark the playing round's target, and the next one between rounds.
            goal={busy && round ? round.target : target}
            duration={duration}
            reduce={reduce}
            busy={busy}
            settled={settled}
            won={won}
            onCross={cross}
            onSettle={settle}
          />

          <div className="flex h-8 items-center justify-center">
            <GameEyebrow
              label={
                phase === "starting"
                  ? "Starting"
                  : phase === "sliding"
                    ? `Sliding · needs ${roundTarget}`
                    : won === true
                      ? `Won · beat ${roundTarget}`
                      : won === false
                        ? `Missed · needed ${roundTarget}`
                        : `${chance} chance of ${formatShort(target)} · marked cards win`
              }
              state={busy ? "live" : won === true ? "won" : won === false ? "lost" : "idle"}
              reduce={reduce}
            />
          </div>
        </div>
      </div>
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

const CARD_WIDTH = 80;
const CARD_HEIGHT = 108;
const GAP = 10;
const PITCH = CARD_WIDTH + GAP;
// Cover-flow geometry, by distance from the center in cards: the center card
// sits 12% larger and flat, neighbours turn up to 50° toward it and fade.
const CENTER_SCALE = 1.12;
const SCALE_STEP = 0.1;
const MIN_SCALE = 0.8;
const TURN_STEP = 30;
const MAX_TURN = 50;
const FADE_STEP = 0.16;
const MIN_FADE = 0.3;
// Cards kept on each side of the center when a new round starts, so the strip
// on screen never changes; wide enough for any card width.
const CONTEXT = 6;
// Filler cards that race past before the result, and after it.
const SPIN_TILES = 48;
const TAIL = 6;
// The slide runs out anywhere inside the result card, not dead center, so the
// last cards creep past the tabs and the stop reads as physical. Then the
// card clicks into the center on a short spring, like a detent.
const LANDING_SPREAD = 0.7;
const DETENT = { type: "spring", duration: 0.35, bounce: 0.2 } as const;
// A game reveal, not UI chrome: it starts at full speed and spends most of its
// time creeping through the last few cards, where the suspense is. The 300ms
// UI budget does not apply to it.
const SLIDE_EASE = [0.12, 0.7, 0.16, 1] as const;
// Edge tabs: a notch hanging from the stage's top and bottom edges at the
// center, a 4px cap with a rounded point. They sit clear of the cards and
// only change colour with the round.
const TAB_HEIGHT = 15;
const TAB_CLEARANCE = 12;
// The landed card swells once as it locks.
const LOCK = { duration: 0.4, ease: EASE_OUT } as const;

type Tile = { id: string; multiplier: number };
type ReelState = {
  tiles: Tile[];
  landed: number;
  round: Round | null;
  from: number;
  /** Where the slide runs out, inside the result card. */
  to: number;
  /** The result card centered between the tabs. */
  rest: number;
};

/** Seeded by the round, so the server and client agree on every card. */
function seeded(seed: string) {
  let state = 2166136261;
  for (const char of seed) state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Decorative cards on the game's own curve, capped so they fit a card. */
function filler(rand: () => number, count: number, prefix: string): Tile[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    multiplier: Math.min(1000, slideResult(rand)),
  }));
}

/** Reel offset that puts card `index` at the center. */
const positionOf = (index: number, offset = 0) => -(index * PITCH + CARD_WIDTH / 2 + offset);

const INITIAL: ReelState = (() => {
  const rand = seeded("slide");
  // The center starts on 1.00×, so the stage reads as a fresh game, not a result.
  const tiles = [...filler(rand, CONTEXT, "a"), { id: "start", multiplier: 1 }, ...filler(rand, CONTEXT, "b")];
  const at = positionOf(CONTEXT);
  return { tiles, landed: CONTEXT, round: null, from: at, to: at, rest: at };
})();

// Card faces by value: slate under 2×, primary to 10×, amber to 100×, then
// fuchsia; the history pills follow the same tiers. Cards are physical objects, so they keep their colours in both
// themes.
const FACE = {
  cool: "bg-zinc-700 text-white",
  warm: "bg-primary text-primary-foreground",
  hot: "bg-amber-400 text-amber-950",
  jackpot: "bg-fuchsia-600 text-white",
} as const;
const face = (multiplier: number) => (multiplier >= 100 ? "jackpot" : heat(multiplier));

/**
 * The strip of cards under the fixed edge tabs. A new round keeps the cards on
 * screen (mid-slide too), appends filler and the result, then slides to it.
 * Cards that would beat `goal` carry a pip, so wins read as they fly past.
 */
function Reel({
  round,
  goal,
  duration,
  reduce,
  busy,
  settled,
  won,
  onCross,
  onSettle,
}: {
  round: Round | null;
  goal: number;
  duration: number;
  reduce: boolean;
  busy: boolean;
  settled: boolean;
  won: boolean | undefined;
  onCross: () => void;
  onSettle: (round: Round) => void;
}) {
  const [reel, setReel] = useState(INITIAL);
  const x = useMotionValue(INITIAL.rest);
  const finished = useRef(0);
  const under = useRef(INITIAL.landed);
  const latest = useRef({ reel, onCross, onSettle, duration, reduce });
  useLayoutEffect(() => {
    latest.current = { reel, onCross, onSettle, duration, reduce };
  });

  useLayoutEffect(() => {
    if (!round || round.id === reel.round?.id) return;
    const current = Math.round((-x.get() - CARD_WIDTH / 2) / PITCH);
    const start = Math.max(0, current - CONTEXT);
    const kept = reel.tiles.slice(start, current + CONTEXT + 1);
    // Seeded by the result too, so each page load's first round differs.
    const rand = seeded(`${round.id}:${round.result}`);
    const landed = kept.length + SPIN_TILES;
    setReel({
      tiles: [
        ...kept,
        ...filler(rand, SPIN_TILES, `${round.id}-a`),
        { id: `${round.id}-result`, multiplier: round.result },
        ...filler(rand, TAIL, `${round.id}-b`),
      ],
      landed,
      round,
      from: x.get() + start * PITCH,
      to: positionOf(landed, (rand() - 0.5) * CARD_WIDTH * LANDING_SPREAD),
      rest: positionOf(landed),
    });
  }, [round, reel, x]);

  useLayoutEffect(() => {
    const played = reel.round;
    if (!played) return;
    // Settles once per round, even when Strict Mode replays this effect.
    const finish = () => {
      if (finished.current === played.id) return;
      finished.current = played.id;
      latest.current.onSettle(played);
    };
    // The rebuilt strip renumbers the card under the tabs; sync the index
    // first so the jump doesn't tick.
    under.current = Math.round((-reel.from - CARD_WIDTH / 2) / PITCH);
    x.jump(reel.from);
    if (latest.current.reduce) {
      x.jump(reel.rest);
      finish();
      return;
    }
    let controls = animate(x, reel.to, {
      duration: latest.current.duration,
      ease: SLIDE_EASE,
      onComplete: () => {
        controls = animate(x, reel.rest, { ...DETENT, onComplete: finish });
      },
    });
    return () => controls.stop();
  }, [reel, x]);

  const tone = won === true ? "text-primary" : won === false ? "text-rose-500" : busy ? "text-primary" : "text-foreground/50";

  // A tick each time a new card reaches the center.
  useMotionValueEvent(x, "change", (value) => {
    const count = latest.current.reel.tiles.length;
    const index = Math.min(count - 1, Math.max(0, Math.round((-value - CARD_WIDTH / 2) / PITCH)));
    if (index === under.current) return;
    under.current = index;
    latest.current.onCross();
  });

  return (
    <div
      aria-hidden="true"
      className="relative flex-1 overflow-hidden rounded-xl bg-muted/40 ring-1 ring-border/50 ring-inset"
      style={{ minHeight: CARD_HEIGHT * CENTER_SCALE + 2 * (TAB_HEIGHT + TAB_CLEARANCE) }}
    >
      {/* Cards fade out at the sides; the stage and its tabs don't. */}
      <div
        className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
        style={{ perspective: 900 }}
      >
        <motion.div
          className="absolute inset-y-0 left-1/2 flex items-center"
          style={{ x, gap: GAP, transformStyle: "preserve-3d" }}
        >
          {reel.tiles.map((tile, index) => (
            <Card
              key={tile.id}
              multiplier={tile.multiplier}
              center={index * PITCH + CARD_WIDTH / 2}
              x={x}
              wins={tile.multiplier >= goal}
              landed={settled && index === reel.landed}
              dim={settled && index !== reel.landed}
              reduce={reduce}
            />
          ))}
        </motion.div>
      </div>
      {/* After the strip, so they paint over cards turning out of the 3D plane. */}
      <EdgeTab side="top" tone={tone} />
      <EdgeTab side="bottom" tone={tone} />
    </div>
  );
}

/** One card. Its turn, size and fade follow its distance from the center, read straight off the reel's offset. */
function Card({
  multiplier,
  center,
  x,
  wins,
  landed,
  dim,
  reduce,
}: {
  multiplier: number;
  /** The card's center along the strip, in px. */
  center: number;
  x: MotionValue<number>;
  wins: boolean;
  landed: boolean;
  dim: boolean;
  reduce: boolean;
}) {
  // A new round renumbers kept cards; the ref keeps the transforms current.
  const at = useRef(center);
  useLayoutEffect(() => {
    at.current = center;
  });
  const distance = useTransform(x, (value) => (value + at.current) / PITCH);
  const scale = useTransform(distance, (d) => Math.max(MIN_SCALE, CENTER_SCALE - SCALE_STEP * Math.abs(d)));
  const rotateY = useTransform(distance, (d) => Math.max(-MAX_TURN, Math.min(MAX_TURN, d * TURN_STEP)));
  const opacity = useTransform(distance, (d) => Math.max(MIN_FADE, 1 - FADE_STEP * Math.abs(d)));
  const [whole, decimals] = formatMultiplier(multiplier).replace("×", "").split(".");

  return (
    <motion.div className="shrink-0" style={{ width: CARD_WIDTH, height: CARD_HEIGHT, scale, rotateY, opacity }}>
      <motion.div
        className={cn(
          "relative flex size-full flex-col items-center justify-center rounded-xl tabular-nums",
          // A flat face: a hairline, one lit top edge and a soft drop give it depth.
          "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.12),inset_0_1px_0_rgb(255_255_255/0.3),0_12px_24px_-10px_rgb(0_0_0/0.6)]",
          "transition-opacity duration-200 ease-out",
          FACE[face(multiplier)],
          dim && "opacity-55",
        )}
        animate={landed && !reduce ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={LOCK}
      >
        {/* Four or more whole digits (1000×, 12.5K×) drop a size to stay inside the card. */}
        <span className={cn("leading-none font-bold tracking-tight", whole.length >= 4 ? "text-base" : "text-xl")}>
          {whole}
          {decimals ? <span className="text-[0.7em]">.{decimals}</span> : null}
          <span className="ml-0.5 text-[0.7em] opacity-70">×</span>
        </span>
        {wins ? <span className="absolute bottom-2.5 h-1 w-5 rounded-full bg-current opacity-60" /> : null}
      </motion.div>
    </motion.div>
  );
}

/** A notch on the stage edge, pointing at the center card. */
function EdgeTab({ side, tone }: { side: "top" | "bottom"; tone: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 15"
      className={cn(
        "absolute left-1/2 w-9 -translate-x-1/2 fill-current transition-colors duration-150 ease-out",
        side === "top" ? "top-0" : "bottom-0 rotate-180",
        tone,
      )}
      style={{ height: TAB_HEIGHT }}
    >
      <path d="M0 0h36v2a2 2 0 0 1-2 2h-9.5l-5.2 9.4a1.5 1.5 0 0 1-2.6 0L11.5 4H2a2 2 0 0 1-2-2Z" />
    </svg>
  );
}
