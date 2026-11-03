"use client";

import { Gem, Volume2, VolumeX } from "lucide-react";
import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { type KeyboardEvent, type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";
import { Button } from "@/components/motion/button";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT } from "@/lib/ease";
import { createGameSounds, type GameSounds } from "@/lib/game-sounds";
import { PresenceGate, type PresenceGateRenderProps } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";

export type MinesTile = "gem" | "mine";

export interface MinesProps {
  /** Tiles per side, rounded, at least 2. Default 5 (a 5 × 5 board). Changing it ends the round. */
  size?: number;
  /** Mines on the board (controlled), rounded and kept between 1 and tiles − 1. Takes effect from the next round. */
  mines?: number;
  /** Initial mine count when uncontrolled. Default 3. */
  defaultMines?: number;
  /** Called when the mine count changes between rounds. */
  onMinesChange?: (mines: number) => void;
  /** Called for every tile picked during a round. */
  onReveal?: (tile: number, result: MinesTile, multiplier: number) => void;
  /** Called when the player cashes out, or clears every gem. */
  onCashOut?: (multiplier: number, gems: number) => void;
  /** Called when the player picks a mine. */
  onBust?: (tile: number) => void;
  /** Click on reveals (controlled). */
  sound?: boolean;
  /** Initial sound state when uncontrolled. Default false. */
  defaultSound?: boolean;
  /** Called when the sound button is toggled. */
  onSoundChange?: (sound: boolean) => void;
  /** Show the result card when a round ends. Default true. */
  showResult?: boolean;
  /** Accessible name for the game. Default "Mines". */
  "aria-label"?: string;
  className?: string;
}

type Phase = "idle" | "playing" | "busted" | "cashed";

/**
 * Fair payout after `gems` safe picks on a board of `tiles` with `mines`:
 * the inverse of the chance of picking that many gems in a row. `mines` is
 * kept between 0 and tiles − 1 and `gems` between 0 and the safe tiles, so
 * the result is always finite.
 */
export function minesMultiplier(tiles: number, mines: number, gems: number) {
  const safeMines = Math.max(0, Math.min(Math.round(mines), tiles - 1));
  const safeGems = Math.max(0, Math.min(Math.round(gems), tiles - safeMines));
  let multiplier = 1;
  for (let i = 0; i < safeGems; i++) multiplier *= (tiles - i) / (tiles - safeMines - i);
  return multiplier;
}

// Revealed icons arrive from a quarter size, transparent and blurred, on a
// spring with no bounce. A round's closing reveal ripples outward from the
// last pick, one ring of tiles every 25ms.
const ICON_SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;
const RIPPLE_STEP = 0.025;
// A mine shakes once, quickly: 300ms, settling to rest.
const SHAKE = { duration: 0.3, ease: EASE_OUT } as const;
// A found gem's tile springs back from a slight squash.
const GEM_POP = { type: "spring", duration: 0.35, bounce: 0.4 } as const;
// The cash-out pulse runs through the picked gems 40ms apart over 350ms. The
// result opens when the last tile's closing animation completes.
const PULSE_STEP = 40;
const PULSE_TIME = 350;
// Exits are shorter than entrances.
const EXIT = { duration: 0.12, ease: EASE_OUT } as const;

/**
 * A mines board: pick tiles to find gems, each raising the multiplier, and
 * cash out before you hit a mine. The round's end reveals every tile.
 */
export function Mines({
  size: sizeProp = 5,
  mines: minesProp,
  defaultMines = 3,
  onMinesChange,
  onReveal,
  onCashOut,
  onBust,
  sound,
  defaultSound = false,
  onSoundChange,
  showResult = true,
  "aria-label": ariaLabel = "Mines",
  className,
}: MinesProps) {
  const reduce = useReducedMotion() ?? false;
  const size = Math.max(2, Math.round(sizeProp) || 2);
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" && size !== sizeProp)
      console.warn(`Mines: size must be a whole number of at least 2; using ${size}.`);
  }, [size, sizeProp]);
  const tiles = size * size;
  const [internalMines, setInternalMines] = useState(defaultMines);
  // The count chosen for the next round.
  const chosenMines = Math.min(Math.max(1, Math.round(minesProp ?? internalMines) || 1), tiles - 1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mineSet, setMineSet] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const [resultOpen, setResultOpen] = useState(false);
  // Set when a round ends, cleared when its result opens, so only that
  // round's closing animation can open it.
  const awaitingResult = useRef(false);
  const mainButtonRef = useRef<HTMLButtonElement>(null);
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [, animate] = useAnimate();

  // A new size renumbers every tile, so the mines placed for the old board no
  // longer match it. End the round in the same render.
  const [boardSize, setBoardSize] = useState(size);
  if (boardSize !== size) {
    setBoardSize(size);
    setPhase("idle");
    setPicked([]);
    setMineSet(new Set());
    setResultOpen(false);
    setCursor(0);
    awaitingResult.current = false;
  }

  // Once a round starts, its payout follows the mines actually on the board,
  // even if a controlled `mines` changes before the next round.
  const mines = phase === "idle" ? chosenMines : mineSet.size;
  const gems = picked.filter((tile) => !mineSet.has(tile)).length;
  const multiplier = minesMultiplier(tiles, mines, gems);
  const next = minesMultiplier(tiles, mines, gems + 1);
  const over = phase === "busted" || phase === "cashed";
  // Chance the next pick is a gem.
  const safe = (tiles - mines - gems) / (tiles - gems);
  const lastPick = picked.at(-1) ?? Math.floor(tiles / 2);
  // A roving tab stop that always points at a tile on the board.
  const focusTile = Math.min(cursor, tiles - 1);

  // Each event has its own synthesized sound (lib/game-sounds.ts): gems chime
  // up a scale as the streak grows, a mine blasts, a cash out arpeggiates.
  const [internalSound, setInternalSound] = useState(defaultSound);
  const soundOn = sound ?? internalSound;
  const soundRef = useRef(soundOn);
  useLayoutEffect(() => {
    soundRef.current = soundOn;
  });
  const player = useRef<GameSounds | null>(null);
  const getPlayer = () => {
    if (!player.current) player.current = createGameSounds();
    return player.current;
  };
  const play = (sound: (sounds: GameSounds) => void) => {
    if (soundRef.current) sound(getPlayer());
  };
  useEffect(
    () => () => {
      player.current?.dispose();
      player.current = null;
    },
    [],
  );

  const setMines = (value: number) => {
    // A finished board shows the old count's mines; clear it for the new one.
    if (over) {
      setResultOpen(false);
      setPhase("idle");
      setPicked([]);
      setMineSet(new Set());
    }
    if (minesProp === undefined) setInternalMines(value);
    onMinesChange?.(value);
  };

  // The ticket rises once the board's closing animation has played. The tile
  // that finishes last calls this, so the ticket follows the animation clock.
  const openResult = () => {
    if (!awaitingResult.current || !over) return;
    awaitingResult.current = false;
    if (showResult) setResultOpen(true);
  };

  // The main button already says Play again, so keyboard users land there.
  useEffect(() => {
    if (resultOpen) mainButtonRef.current?.focus({ preventScroll: true });
  }, [resultOpen]);

  const closeResult = () => {
    setResultOpen(false);
    mainButtonRef.current?.focus();
  };

  const start = () => {
    setResultOpen(false);
    awaitingResult.current = false;
    // Mines are placed when the round starts, never on the server.
    const order = Array.from({ length: tiles }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setMineSet(new Set(order.slice(0, chosenMines)));
    setPicked([]);
    setPhase("playing");
    // The board wakes up in a short diagonal wave, so a new round reads as
    // live before the first pick.
    if (!reduce) {
      tileRefs.current.forEach((tile, index) => {
        if (!tile) return;
        const wave = Math.floor(index / size) + (index % size);
        animate(tile, { scale: [0.94, 1], opacity: [0.5, 1] }, { duration: 0.2, delay: wave * 0.025, ease: EASE_OUT });
      });
    }
    setAnnouncement(`Round started with ${chosenMines} ${chosenMines === 1 ? "mine" : "mines"}.`);
    if (soundOn) getPlayer().prepare();
  };

  const cashOut = (finalGems = gems) => {
    if (phase !== "playing" || finalGems === 0) return;
    const value = minesMultiplier(tiles, mines, finalGems);
    awaitingResult.current = true;
    setPhase("cashed");
    setAnnouncement(`Cashed out at ${format(value)}.`);
    play((sounds) => sounds.cashOut());
    onCashOut?.(value, finalGems);
  };

  const pick = (tile: number) => {
    if (phase !== "playing" || picked.includes(tile)) return;
    setPicked((current) => [...current, tile]);
    if (mineSet.has(tile)) {
      awaitingResult.current = true;
      setPhase("busted");
      setAnnouncement("Mine. The round is over.");
      play((sounds) => sounds.mine());
      onReveal?.(tile, "mine", 0);
      onBust?.(tile);
      return;
    }
    const found = gems + 1;
    // The tile gives under the pick and springs back: a playful component can
    // bounce a little. Keyboard picks get it too, as the press feedback.
    const node = tileRefs.current[tile];
    if (node && !reduce) animate(node, { scale: [0.92, 1] }, GEM_POP);
    const value = minesMultiplier(tiles, mines, found);
    play((sounds) => sounds.gem(found));
    onReveal?.(tile, "gem", value);
    if (found === tiles - mines) {
      cashOut(found);
      return;
    }
    setAnnouncement(`Gem. ${format(value)}.`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, tile: number) => {
    const row = Math.floor(tile / size);
    const col = tile % size;
    const target = {
      ArrowRight: row * size + Math.min(size - 1, col + 1),
      ArrowLeft: row * size + Math.max(0, col - 1),
      ArrowDown: Math.min(size - 1, row + 1) * size + col,
      ArrowUp: Math.max(0, row - 1) * size + col,
      Home: row * size,
      End: row * size + size - 1,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    setCursor(target);
    tileRefs.current[target]?.focus();
  };

  // The tile whose closing animation ends last opens the result: unpicked
  // tiles reveal in a ripple from the last pick, and picked gems pulse on a
  // cash out. Every finished round has unpicked tiles, so one always exists.
  let closingTile = -1;
  if (over) {
    let lastEnd = -1;
    for (let tile = 0; tile < tiles; tile++) {
      const order = picked.indexOf(tile);
      const end =
        order === -1
          ? ringFrom(lastPick, tile, size) * RIPPLE_STEP + ICON_SPRING.duration
          : phase === "cashed" && !reduce
            ? (order * PULSE_STEP + PULSE_TIME) / 1000
            : -1;
      if (end > lastEnd) {
        closingTile = tile;
        lastEnd = end;
      }
    }
  }

  const toggleSound = () => {
    const nextSound = !soundOn;
    if (nextSound) getPlayer().prepare();
    if (sound === undefined) setInternalSound(nextSound);
    onSoundChange?.(nextSound);
  };


  return (
    <section
      aria-label={ariaLabel}
      className={cn("flex w-full max-w-md flex-col gap-4", className)}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !resultOpen) return;
        // Escape is used up here; an enclosing dialog must not close too.
        event.stopPropagation();
        closeResult();
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdaptiveStepper
          value={chosenMines}
          onValueChange={setMines}
          min={1}
          max={tiles - 1}
          disabled={phase === "playing"}
          formatValueText={(value) => `${value} ${value === 1 ? "mine" : "mines"}`}
          aria-label="Mines"
        >
          <AdaptiveStepperDecrement />
          <AdaptiveStepperValue>
            {(value) => (
              <span className="inline-flex items-center gap-1.5">
                <MineIcon className="size-4 text-muted-foreground" />
                {value}
              </span>
            )}
          </AdaptiveStepperValue>
          <AdaptiveStepperIncrement />
        </AdaptiveStepper>

        <div className="text-right">
          <div className="text-2xl font-semibold text-foreground">
            <NumberTicker value={multiplier} decimals={2} suffix="×" startOnView={false} duration={0.35} />
          </div>
          <p className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground tabular-nums">
            {phase === "playing" && gems < tiles - mines ? (
              <>
                <OddsRing safe={safe} reduce={reduce} />
                {`${Math.round(safe * 100)}% safe · next ${format(next)}`}
              </>
            ) : phase === "idle" ? (
              <>
                <OddsRing safe={safe} reduce={reduce} />
                {`First pick ${Math.round(safe * 100)}% safe`}
              </>
            ) : (
              "Multiplier"
            )}
          </p>
        </div>
      </div>

      {/* Board panel: 12px tiles + 12px padding give the 24px outer radius. */}
      <div className="relative rounded-3xl bg-muted/40 p-3">
        {/* Under the result card the tiles leave the tab order. */}
        <fieldset
          inert={resultOpen}
          className="m-0 grid min-w-0 gap-2 border-0 p-0"
          style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
        >
          <legend className="sr-only">Tiles</legend>
          {Array.from({ length: tiles }, (_, tile) => {
            const isPicked = picked.includes(tile);
            const isMine = mineSet.has(tile);
            const shown = isPicked || over;
            const content: MinesTile | null = shown ? (isMine ? "mine" : "gem") : null;
            const hit = isPicked && isMine;
            const row = Math.floor(tile / size);
            const col = tile % size;
            // Tiles the player never picked are revealed faded, in rings
            // spreading from the last pick.
            const ripple = ringFrom(lastPick, tile, size);
            const order = picked.indexOf(tile);
            const celebrate = phase === "cashed" && isPicked && !reduce;
            const interactive = phase === "playing" && !isPicked;
            return (
              <motion.button
                // biome-ignore lint/suspicious/noArrayIndexKey: tiles are positional
                key={tile}
                ref={(node) => {
                  tileRefs.current[tile] = node;
                }}
                type="button"
                tabIndex={tile === focusTile ? 0 : -1}
                aria-disabled={!interactive}
                aria-label={`Row ${row + 1}, column ${col + 1}, ${content ?? "hidden"}`}
                onFocus={() => setCursor(tile)}
                onClick={() => pick(tile)}
                onKeyDown={(event) => onKeyDown(event, tile)}
                animate={hit && !reduce ? { x: [0, -5, 5, -3, 3, 0] } : { x: 0 }}
                transition={SHAKE}
                className={cn(
                  "relative grid aspect-square place-items-center rounded-xl border outline-none",
                  // The mine's shockwave paints over its neighbours.
                  hit && "z-10",
                  "transition-[translate,scale,background-color,border-color] duration-150 ease-out",
                  "focus-visible:ring-2 focus-visible:ring-ring",
                  interactive
                    ? "cursor-pointer border-border bg-card hover:-translate-y-0.5 hover:border-(--color-border-strong) active:scale-[0.96]"
                    : "cursor-default border-transparent",
                  !interactive && !shown && "bg-card/60",
                  content === "gem" && (isPicked ? "bg-primary/15" : "bg-card/40"),
                  content === "mine" && (hit ? "bg-rose-500/20" : "bg-card/40"),
                )}
              >
                {hit && !reduce ? (
                  // A shockwave rings out once from the mine.
                  <motion.span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-xl border-2 border-rose-500"
                    initial={{ scale: 1, opacity: 0.7 }}
                    animate={{ scale: 1.7, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                  />
                ) : null}
                {isPicked && !isMine ? (
                  // Pick order: the run, read tile by tile.
                  <motion.span
                    aria-hidden="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, ease: EASE_OUT, delay: 0.1 }}
                    className="absolute top-1.5 left-2 text-[10px] font-medium text-primary/70 tabular-nums"
                  >
                    {order + 1}
                  </motion.span>
                ) : null}
                <AnimatePresence initial={false}>
                  {content ? (
                    <motion.span
                      key={content}
                      aria-hidden="true"
                      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                      animate={
                        celebrate
                          ? { opacity: 1, scale: [1, 1.2, 1], filter: "blur(0px)" }
                          : { opacity: isPicked ? 1 : 0.4, scale: 1, filter: "blur(0px)" }
                      }
                      exit={reduce ? { opacity: 0, transition: EXIT } : { opacity: 0, scale: 0.9, transition: EXIT }}
                      onAnimationComplete={tile === closingTile ? openResult : undefined}
                      transition={
                        celebrate
                          ? { duration: PULSE_TIME / 1000, ease: EASE_OUT, delay: (order * PULSE_STEP) / 1000 }
                          : { ...ICON_SPRING, delay: isPicked ? 0 : ripple * RIPPLE_STEP }
                      }
                      className={cn(
                        "grid place-items-center",
                        content === "gem" ? "text-primary" : "text-rose-500 dark:text-rose-400",
                      )}
                    >
                      {content === "gem" ? (
                        <Gem className="size-[45%] min-h-5 min-w-5" strokeWidth={2} />
                      ) : (
                        <MineIcon className="size-[45%] min-h-5 min-w-5" />
                      )}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </fieldset>

        <AnimatePresence>
          {resultOpen && over ? (
            <PresenceGate key="result">
              {({ isPresent, gate }) => (
                <ResultCard
                  isPresent={isPresent}
                  gate={gate}
                  outcome={phase === "cashed" ? "cashed" : "busted"}
                  multiplier={multiplier}
                  gems={gems}
                  safeTiles={tiles - mines}
                  mines={mines}
                  size={size}
                  picked={picked}
                  mineSet={mineSet}
                  reduce={reduce}
                  onClose={closeResult}
                />
              )}
            </PresenceGate>
          ) : null}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {/* aria-disabled, not disabled: Start turns into this button, and a
            disabled button would drop the keyboard focus that pressed it. */}
        <Button
          ref={mainButtonRef}
          className="flex-1 aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
          pressScale={0.96}
          aria-disabled={(phase === "playing" && gems === 0) || undefined}
          onClick={() => (phase === "playing" ? cashOut() : start())}
        >
          {phase === "playing" ? `Cash out ${format(multiplier)}` : over ? "Play again" : "Start"}
        </Button>
        {/* The tooltip is the button's accessible name as well as its visible label. */}
        <Tooltip content="Sound" asLabel side="top">
          <Button
            variant="secondary"
            onClick={toggleSound}
            aria-pressed={soundOn}
            pressScale={0.96}
            className={cn("w-10 px-0", soundOn ? "text-foreground" : "text-muted-foreground")}
          >
            <ActionSwapCascadeIcon value={soundOn ? "on" : "off"} className="size-4">
              {soundOn ? <Volume2 aria-hidden="true" className="size-4" /> : <VolumeX aria-hidden="true" className="size-4" />}
            </ActionSwapCascadeIcon>
          </Button>
        </Tooltip>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

// The ticket's tear line sits this far down; the side notches are cut there.
const TEAR = 104;
const NOTCH_MASK = `radial-gradient(circle 9px at 0 ${TEAR}px, transparent 98%, black), radial-gradient(circle 9px at 100% ${TEAR}px, transparent 98%, black)`;
// Rises with a little settle (a rare, end-of-round moment), leaves quickly.
const CARD_IN = { type: "spring", duration: 0.4, bounce: 0.15 } as const;
const CARD_OUT = { duration: 0.15, ease: EASE_OUT } as const;

interface ResultProps {
  isPresent: boolean;
  gate: PresenceGateRenderProps["gate"];
  outcome: "cashed" | "busted";
  multiplier: number;
  gems: number;
  safeTiles: number;
  mines: number;
  size: number;
  picked: number[];
  mineSet: ReadonlySet<number>;
  reduce: boolean;
  onClose: () => void;
}

/**
 * The end-of-round summary over a dimmed board. It has no buttons: the main
 * action below the board already says Play again, and tapping anywhere on
 * the board (or Escape) puts the card away to study the board.
 */
function ResultCard(props: ResultProps) {
  const { isPresent, gate, reduce, onClose } = props;
  return (
    <>
      <motion.button
        type="button"
        aria-label="Hide result and show the board"
        onClick={onClose}
        {...gate}
        className="absolute inset-0 z-20 cursor-default rounded-3xl bg-background/55 outline-none backdrop-blur-[2px] focus-visible:ring-2 focus-visible:ring-ring"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: CARD_OUT }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      />
      <div
        inert={!isPresent}
        className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-4"
      >
        <motion.div
          role="group"
          aria-label="Round result"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0, transition: CARD_OUT } : { opacity: 0, y: 8, scale: 0.98, transition: CARD_OUT }}
          transition={reduce ? { duration: 0.2 } : CARD_IN}
        >
          <Ticket {...props} />
        </motion.div>
      </div>
    </>
  );
}

// Inside the ticket, chunks arrive in reading order: outcome, multiplier,
// stats, then the run replays on the mini map in pick order.
const STAGE = { duration: 0.25, ease: EASE_OUT } as const;
const REPLAY_START = 0.3;
const REPLAY_STEP = 0.05;
// Mini map cells pop in with a small overshoot: each is 8px, so a bounce
// reads as a cell landing rather than a wobble.
const CELL_SPRING = { type: "spring", duration: 0.3, bounce: 0.3 } as const;

function Stage({ delay, reduce, className, children }: { delay: number; reduce: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...STAGE, delay: reduce ? 0 : delay }}
    >
      {children}
    </motion.div>
  );
}

function MiniMap({ size, picked, mineSet, reduce }: Pick<ResultProps, "size" | "picked" | "mineSet" | "reduce">) {
  const hit = picked.at(-1);
  return (
    <div aria-hidden="true" className="grid shrink-0 gap-[3px]" style={{ gridTemplateColumns: `repeat(${size}, auto)` }}>
      {Array.from({ length: size * size }, (_, tile) => {
        const isMine = mineSet.has(tile);
        const isPicked = picked.includes(tile);
        const order = picked.indexOf(tile);
        return (
          <motion.span
            // biome-ignore lint/suspicious/noArrayIndexKey: tiles are positional
            key={tile}
            // Picked cells fill in the order they were picked, replaying the run.
            initial={isPicked && !reduce ? { opacity: 0, scale: 0.4 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...CELL_SPRING, delay: REPLAY_START + order * REPLAY_STEP }}
            className={cn(
              "size-2 rounded-[2px]",
              isPicked && !isMine && "bg-primary",
              isPicked && isMine && tile === hit && "bg-rose-500",
              !isPicked && isMine && "ring-1 ring-rose-500/60 ring-inset",
              !isPicked && !isMine && "bg-foreground/10",
            )}
          />
        );
      })}
    </div>
  );
}

const CARD_SHADOW = "shadow-[0_1px_2px_rgb(0_0_0/0.12),0_16px_40px_-12px_rgb(0_0_0/0.45)]";

/** A ticket stub, notched at a dashed tear line. */
function Ticket({ outcome, multiplier, gems, safeTiles, mines, size, picked, mineSet, reduce }: ResultProps) {
  const cashed = outcome === "cashed";
  return (
    <div
      className={cn("w-[17rem] rounded-2xl bg-card text-foreground", CARD_SHADOW)}
      style={{ WebkitMaskImage: NOTCH_MASK, WebkitMaskComposite: "source-in", maskImage: NOTCH_MASK, maskComposite: "intersect" }}
    >
      <div
        className={cn("flex flex-col items-center justify-center gap-1 rounded-t-2xl px-5 text-center", cashed ? "bg-primary/10" : "bg-rose-500/10")}
        style={{ height: TEAR }}
      >
        <Stage delay={0.05} reduce={reduce}>
          <p className={cn("text-xs font-medium tracking-wide uppercase", cashed ? "text-primary" : "text-rose-600 dark:text-rose-400")}>
            {cashed ? "Cashed out" : "Mine hit"}
          </p>
        </Stage>
        <Stage delay={0.1} reduce={reduce}>
          <p className={cn("text-3xl font-semibold", !cashed && "text-muted-foreground line-through decoration-2")}>
            {cashed && !reduce ? (
              // A win rolls up to its multiplier; a loss just states it.
              <NumberTicker value={multiplier} decimals={2} suffix="×" startOnView={false} duration={0.6} stagger={0.05} />
            ) : (
              <span className="tabular-nums">{format(multiplier)}</span>
            )}
          </p>
        </Stage>
      </div>
      <div aria-hidden="true" className="mx-4 border-t-2 border-dashed border-border" />
      <div className="flex items-center gap-4 px-5 pt-4 pb-5">
        <Stage delay={0.18} reduce={reduce} className="flex-1">
          <dl className="grid gap-1.5 text-xs">
            <Row label="Gems" value={`${gems} of ${safeTiles}`} />
            <Row label="Mines" value={mines} />
            <Row label={cashed ? "Odds beaten" : "Lost on pick"} value={cashed ? `1 in ${multiplier.toFixed(2)}` : picked.length} />
          </dl>
        </Stage>
        <Stage delay={0.24} reduce={reduce}>
          <MiniMap size={size} picked={picked} mineSet={mineSet} reduce={reduce} />
        </Stage>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

// The classic minesweeper mine: a solid ball (so it never reads as a sun),
// four thick spikes on the axes and four shorter ones on the diagonals.
const SPIKES = Array.from({ length: 8 }, (_, i) => {
  const angle = (i * Math.PI) / 4;
  const main = i % 2 === 0;
  const [cos, sin] = [Math.cos(angle), Math.sin(angle)];
  const reach = main ? 10.5 : 9;
  return { main, x1: 12 + cos * 6, y1: 12 + sin * 6, x2: 12 + cos * reach, y2: 12 + sin * reach };
});

/** A mine on Lucide's 24px grid, sized to pair with the gem. */
function MineIcon({ className }: { className?: string }) {
  // Decorative: tiles and the stepper name the mine in text.
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeLinecap="round" className={className}>
      {SPIKES.map((spike) => (
        <line
          key={`${spike.x2.toFixed(2)}-${spike.y2.toFixed(2)}`}
          x1={spike.x1}
          y1={spike.y1}
          x2={spike.x2}
          y2={spike.y2}
          strokeWidth={spike.main ? 2.5 : 2}
        />
      ))}
      <circle cx={12} cy={12} r={6.5} stroke="none" />
      {/* Glint. */}
      <circle cx={9.75} cy={9.75} r={1.6} fill="white" fillOpacity={0.75} stroke="none" />
    </svg>
  );
}

/** A small ring that fills with the chance the next pick is safe. */
function OddsRing({ safe, reduce }: { safe: number; reduce: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3.5 -rotate-90">
      <circle cx={7} cy={7} r={5.5} fill="none" strokeWidth={2} className="stroke-foreground/10" />
      <motion.circle
        cx={7}
        cy={7}
        r={5.5}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        className={safe < 0.5 ? "stroke-rose-500 dark:stroke-rose-400" : "stroke-primary"}
        initial={false}
        animate={{ pathLength: safe }}
        transition={reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
      />
    </svg>
  );
}

/** Rings between two tiles: 0 for the same tile, 1 for its neighbours. */
function ringFrom(from: number, tile: number, size: number) {
  return Math.max(
    Math.abs(Math.floor(tile / size) - Math.floor(from / size)),
    Math.abs((tile % size) - (from % size)),
  );
}

function format(multiplier: number) {
  return `${multiplier.toFixed(2)}×`;
}
