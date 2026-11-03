"use client";

import { Bomb, Gem, Volume2, VolumeX } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";
import { Button } from "@/components/motion/button";
import { NumberTicker } from "@/components/motion/number-ticker";
import { createGameSounds, type GameSounds } from "@/lib/game-sounds";
import { cn } from "@/lib/utils";

export type MinesTile = "gem" | "mine";

export interface MinesProps {
  /** Tiles per side. Default 5 (a 5 × 5 board). */
  size?: number;
  /** Mines on the board (controlled). */
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
  /** Accessible name for the game. Default "Mines". */
  "aria-label"?: string;
  className?: string;
}

type Phase = "idle" | "playing" | "busted" | "cashed";

/**
 * Fair payout after `gems` safe picks on a board of `tiles` with `mines`:
 * the inverse of the chance of picking that many gems in a row.
 */
export function minesMultiplier(tiles: number, mines: number, gems: number) {
  let multiplier = 1;
  for (let i = 0; i < gems; i++) multiplier *= (tiles - i) / (tiles - mines - i);
  return multiplier;
}

// Revealed icons arrive from a quarter size, transparent and blurred, on a
// spring with no bounce. A round's closing reveal ripples outward from the
// last pick, one ring of tiles every 25ms.
const ICON_SPRING = { type: "spring", duration: 0.3, bounce: 0 } as const;
const RIPPLE_STEP = 0.025;
// A mine shakes once, quickly: 300ms, settling to rest.
const SHAKE = { duration: 0.3, ease: "easeOut" } as const;

/**
 * A mines board: pick tiles to find gems, each raising the multiplier, and
 * cash out before you hit a mine. The round's end reveals every tile.
 */
export function Mines({
  size = 5,
  mines: minesProp,
  defaultMines = 3,
  onMinesChange,
  onReveal,
  onCashOut,
  onBust,
  sound,
  defaultSound = false,
  onSoundChange,
  "aria-label": ariaLabel = "Mines",
  className,
}: MinesProps) {
  const reduce = useReducedMotion() ?? false;
  const tiles = size * size;
  const [internalMines, setInternalMines] = useState(defaultMines);
  const mines = Math.min(Math.max(1, minesProp ?? internalMines), tiles - 1);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mineSet, setMineSet] = useState<ReadonlySet<number>>(new Set());
  const [picked, setPicked] = useState<number[]>([]);
  const [cursor, setCursor] = useState(0);
  const [announcement, setAnnouncement] = useState("");
  const tileRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const gems = picked.filter((tile) => !mineSet.has(tile)).length;
  const multiplier = minesMultiplier(tiles, mines, gems);
  const next = minesMultiplier(tiles, mines, gems + 1);
  const over = phase === "busted" || phase === "cashed";
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
  const getPlayer = useCallback(() => {
    if (!player.current) player.current = createGameSounds();
    return player.current;
  }, []);
  const play = useCallback(
    (sound: (sounds: GameSounds) => void) => {
      if (soundRef.current) sound(getPlayer());
    },
    [getPlayer],
  );
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
      setPhase("idle");
      setPicked([]);
      setMineSet(new Set());
    }
    if (minesProp === undefined) setInternalMines(value);
    onMinesChange?.(value);
  };

  const start = () => {
    // Mines are placed when the round starts, never on the server.
    const order = Array.from({ length: tiles }, (_, i) => i);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    setMineSet(new Set(order.slice(0, mines)));
    setPicked([]);
    setPhase("playing");
    setAnnouncement(`Round started with ${mines} ${mines === 1 ? "mine" : "mines"}.`);
    if (soundOn) getPlayer().prepare();
  };

  const cashOut = (finalGems = gems) => {
    const value = minesMultiplier(tiles, mines, finalGems);
    setPhase("cashed");
    setAnnouncement(`Cashed out at ${format(value)}.`);
    play((sounds) => sounds.cashOut());
    onCashOut?.(value, finalGems);
  };

  const pick = (tile: number) => {
    if (phase !== "playing" || picked.includes(tile)) return;
    setPicked((current) => [...current, tile]);
    if (mineSet.has(tile)) {
      setPhase("busted");
      setAnnouncement("Mine. The round is over.");
      play((sounds) => sounds.mine());
      onReveal?.(tile, "mine", 0);
      onBust?.(tile);
      return;
    }
    const found = gems + 1;
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

  const toggleSound = () => {
    const nextSound = !soundOn;
    if (nextSound) getPlayer().prepare();
    if (sound === undefined) setInternalSound(nextSound);
    onSoundChange?.(nextSound);
  };

  return (
    <section aria-label={ariaLabel} className={cn("flex w-full max-w-md flex-col gap-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <AdaptiveStepper
          value={mines}
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
                <Bomb aria-hidden="true" className="size-4 text-muted-foreground" />
                {value}
              </span>
            )}
          </AdaptiveStepperValue>
          <AdaptiveStepperIncrement />
        </AdaptiveStepper>

        <div className="text-right">
          <div className="text-2xl font-semibold text-foreground">
            <NumberTicker value={multiplier} decimals={2} suffix="×" startOnView={false} duration={0.5} />
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {phase === "playing" && gems < tiles - mines ? `Next ${format(next)}` : "Multiplier"}
          </p>
        </div>
      </div>

      <fieldset
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
          const ripple = Math.max(
            Math.abs(row - Math.floor(lastPick / size)),
            Math.abs(col - (lastPick % size)),
          );
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
                "transition-[translate,scale,background-color,border-color] duration-150 ease-out",
                "focus-visible:ring-2 focus-visible:ring-ring",
                interactive
                  ? "cursor-pointer border-border bg-card hover:-translate-y-0.5 hover:border-(--color-border-strong) active:scale-[0.96]"
                  : "cursor-default border-transparent",
                !interactive && !shown && "bg-card/60",
                content === "gem" && (isPicked ? "bg-primary/15" : "bg-muted/60"),
                content === "mine" && (hit ? "bg-rose-500/20" : "bg-muted/60"),
              )}
            >
              {content ? (
                <motion.span
                  key={content}
                  aria-hidden="true"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.25, filter: "blur(4px)" }}
                  animate={{ opacity: isPicked ? 1 : 0.4, scale: 1, filter: "blur(0px)" }}
                  transition={{ ...ICON_SPRING, delay: isPicked ? 0 : ripple * RIPPLE_STEP }}
                  className={cn(
                    "grid place-items-center",
                    content === "gem" ? "text-primary" : "text-rose-500 dark:text-rose-400",
                  )}
                >
                  {content === "gem" ? (
                    <Gem className="size-[45%] min-h-5 min-w-5" strokeWidth={2} />
                  ) : (
                    <Bomb className="size-[45%] min-h-5 min-w-5" strokeWidth={2} />
                  )}
                </motion.span>
              ) : null}
            </motion.button>
          );
        })}
      </fieldset>

      <div className="flex items-center gap-2">
        <Button
          className="flex-1"
          pressScale={0.96}
          disabled={phase === "playing" && gems === 0}
          onClick={() => (phase === "playing" ? cashOut() : start())}
        >
          {phase === "playing" ? `Cash out ${format(multiplier)}` : over ? "Play again" : "Start"}
        </Button>
        <Button
          variant="secondary"
          onClick={toggleSound}
          aria-label="Sound"
          aria-pressed={soundOn}
          pressScale={0.96}
          className={cn("w-10 px-0", soundOn ? "text-foreground" : "text-muted-foreground")}
        >
          <ActionSwapCascadeIcon value={soundOn ? "on" : "off"} className="size-4">
            {soundOn ? <Volume2 aria-hidden="true" className="size-4" /> : <VolumeX aria-hidden="true" className="size-4" />}
          </ActionSwapCascadeIcon>
        </Button>
      </div>

      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </section>
  );
}

function format(multiplier: number) {
  return `${multiplier.toFixed(2)}×`;
}
