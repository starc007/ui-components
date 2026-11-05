"use client";

import { Check, History as HistoryIcon, Volume2, VolumeX, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, type Ref, useEffect, useEffectEvent, useRef, useState } from "react";
import { ActionSwapCascadeIcon } from "@/components/motion/action-swap-cascade";
import { Button } from "@/components/motion/button";
import { NumberTicker } from "@/components/motion/number-ticker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/motion/select";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { PresenceGate, type PresenceGateRenderProps } from "@/lib/presence-gate";
import { cn } from "@/lib/utils";
import {
  type CrashGame,
  EXIT,
  formatMultiplier,
  formatShort,
  growth,
  heat,
  PULSE,
  SHAKE,
  SWAP,
} from "./use-crash-game";

// Readout and history colours per heat: neutral, then primary, then amber.
const HEAT_TEXT = {
  cool: "text-foreground",
  warm: "text-primary",
  hot: "text-amber-600 dark:text-amber-400",
} as const;
const HEAT_PILL = {
  cool: "bg-foreground/5 text-muted-foreground",
  warm: "bg-primary/10 text-primary",
  hot: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
} as const;

// Pieces every Crash design shares, so each design only draws the flight.

/**
 * The frame every design sits in: one card holding the recent rounds and
 * sound, the stage with the readout pinned top left, and the controls. Each
 * design draws only its stage, which must keep the top-left corner clear.
 */
export function CrashShell({
  game,
  "aria-label": ariaLabel,
  className,
  children,
  miniature,
}: {
  game: CrashGame;
  "aria-label": string;
  className?: string;
  children: ReactNode;
  /** The design's own replay of the round on the result ticket. */
  miniature?: (props: CrashMiniatureProps) => ReactNode;
}) {
  const mainRef = useRef<HTMLButtonElement>(null);
  // The ticket opens per round once the crash has played; tapping the stage
  // or Escape puts it away, and the next round clears it.
  const [openRound, setOpenRound] = useState<number | null>(null);
  const resultShown = game.crashed && openRound === game.round;
  const { crashed, round } = game;
  // Read when the round ends, so a reduced-motion change can't reopen a closed ticket.
  const ticketDelay = useEffectEvent(() => (game.reduce ? 0.15 : TICKET_DELAY) * 1000);
  useEffect(() => {
    if (!crashed) return;
    // A timer, not an animation callback, so a cut-short animation can't keep it shut.
    // Focus stays where it is: nothing focusable sits under the ticket, and
    // the main button, which now says Play again, kept focus through the round.
    const id = setTimeout(() => setOpenRound(round), ticketDelay());
    return () => clearTimeout(id);
  }, [crashed, round]);
  const closeResult = () => {
    setOpenRound(null);
    mainRef.current?.focus();
  };

  return (
    <section
      aria-label={ariaLabel}
      // Focusable by script and click only: a tap on the stage keeps focus in
      // the game, so Escape still reaches the ticket.
      tabIndex={-1}
      className={cn("w-full max-w-md outline-none", className)}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !resultShown) return;
        // An open Auto menu takes this Escape (it listens on window, after us).
        if (event.target instanceof Element && event.target.closest('[role="listbox"],[aria-expanded="true"]')) return;
        // Escape is used up here; an enclosing dialog must not close too.
        event.stopPropagation();
        closeResult();
      }}
    >
      {/* 24px card corners = 12px stage and control corners + 12px padding. */}
      <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-3 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_12px_32px_-16px_rgb(0_0_0/0.25)]">
        <div className="flex h-8 items-center gap-2 pl-1">
          <HistoryIcon aria-hidden="true" className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={2} />
          <CrashHistory game={game} className="min-w-0 flex-1" />
          <SoundToggle game={game} />
        </div>
        {/* A 10:7 stage in every design, so switching between them never
            jumps. A container: its width also fixes its height. */}
        <div className="@container relative aspect-[10/7] overflow-hidden rounded-xl bg-muted/40">
          {children}
          <div className="pointer-events-none absolute top-4 left-4">
            <CrashEyebrow game={game} />
            {/* Smaller on narrow stages, so the readout leaves the design room. */}
            <CrashMultiplier game={game} className="mt-1 text-3xl @min-[20rem]:text-4xl [&>span]:origin-left" />
            <CrashStatus game={game} className="mt-2" />
          </div>
          <AnimatePresence>
            {resultShown ? (
              <PresenceGate key="result">
                {({ gate }) => <ResultTicket game={game} gate={gate} onClose={closeResult} miniature={miniature} />}
              </PresenceGate>
            ) : null}
          </AnimatePresence>
        </div>
        <CrashControls game={game} mainRef={mainRef} />
      </div>
      <CrashAnnouncer game={game} />
    </section>
  );
}

// The ticket rises once each design's crash (tumble, pop, topple: 0.6s to
// 0.75s) has mostly played, the same receipt Mines ends on: a stub notched at a
// dashed tear line, the outcome above, the round's figures and a miniature
// of the flight below.
const TICKET_DELAY = 0.7;
// Rises with a little settle (a rare, end-of-round moment), leaves quickly.
const CARD_IN = { type: "spring", duration: 0.4, bounce: 0.15 } as const;
const CARD_OUT = { duration: 0.15, ease: EASE_OUT } as const;
// Inside, chunks arrive in reading order, then the flight replays.
const STAGE = { duration: 0.25, ease: EASE_OUT } as const;
// The tear line sits this far down; the side notches are cut there.
const TEAR = 104;
const NOTCH_MASK = `radial-gradient(circle 9px at 0 ${TEAR}px, transparent 98%, black), radial-gradient(circle 9px at 100% ${TEAR}px, transparent 98%, black)`;
const CARD_SHADOW = "shadow-[0_1px_2px_rgb(0_0_0/0.12),0_16px_40px_-12px_rgb(0_0_0/0.45)]";

/**
 * The end-of-round receipt over a dimmed stage. It has no buttons: the main
 * action already says Play again, and tapping the stage (or Escape) puts it
 * away to look at the flight.
 */
function ResultTicket({
  game,
  gate,
  onClose,
  miniature,
}: {
  game: CrashGame;
  gate: PresenceGateRenderProps["gate"];
  onClose: () => void;
  miniature?: (props: CrashMiniatureProps) => ReactNode;
}) {
  const { reduce } = game;
  return (
    <>
      <motion.button
        type="button"
        aria-label="Hide result and show the flight"
        onClick={onClose}
        {...gate}
        className="absolute inset-0 z-20 cursor-default bg-background/55 outline-none backdrop-blur-[2px] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: CARD_OUT }}
        transition={{ duration: 0.2, ease: EASE_OUT }}
      />
      <div inert={gate.inert} className="pointer-events-none absolute inset-0 z-20 grid place-items-center p-4">
        <motion.div
          role="group"
          aria-label="Round result"
          // Sized here: the ticket is a size container, so it can't take its
          // width from its contents.
          className="w-full max-w-[17rem]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0, transition: CARD_OUT } : { opacity: 0, y: 8, scale: 0.98, transition: CARD_OUT }}
          transition={reduce ? { duration: 0.2 } : CARD_IN}
        >
          <Ticket game={game} miniature={miniature} />
        </motion.div>
      </div>
    </>
  );
}

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

function Ticket({ game, miniature }: { game: CrashGame; miniature?: (props: CrashMiniatureProps) => ReactNode }) {
  const { cashed, multiplier: crash, roundAuto, reduce, t } = game;
  const won = cashed !== null;
  return (
    <div
      // The stub is about 200px tall; a short stage (its width sets its
      // height) scales it down rather than clipping it.
      className={cn(
        "@container w-full rounded-2xl bg-card text-foreground @max-[17rem]:scale-[0.72] @min-[17rem]:@max-[21rem]:scale-[0.85]",
        CARD_SHADOW,
      )}
      style={{ WebkitMaskImage: NOTCH_MASK, WebkitMaskComposite: "source-in", maskImage: NOTCH_MASK, maskComposite: "intersect" }}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 rounded-t-2xl px-5 text-center",
          won ? "bg-primary/10" : "bg-rose-500/10",
        )}
        style={{ height: TEAR }}
      >
        <Stage delay={0.05} reduce={reduce}>
          <p className={cn("text-xs font-medium tracking-wide uppercase", won ? "text-primary" : "text-rose-600 dark:text-rose-400")}>
            {won ? "Cashed out" : "Crashed"}
          </p>
        </Stage>
        <Stage delay={0.1} reduce={reduce}>
          <p className={cn("text-3xl font-semibold", !won && "text-muted-foreground line-through decoration-2")}>
            {won ? (
              <NumberTicker
                value={cashed}
                decimals={2}
                format={(value) => formatMultiplier(value).slice(0, -1)}
                suffix="×"
                startOnView={false}
                duration={0.6}
                stagger={0.05}
              />
            ) : (
              // The multiplier is lost: struck through, as Mines does. A plain
              // span, since a line-through skips the ticker's inline-block digits.
              <span className="tabular-nums">{formatMultiplier(crash)}</span>
            )}
          </p>
        </Stage>
      </div>
      <div aria-hidden="true" className="mx-4 border-t-2 border-dashed border-border" />
      <div className="flex items-center gap-4 px-5 pt-4 pb-5">
        <Stage delay={0.18} reduce={reduce} className="flex-1">
          <dl className="grid gap-1.5 text-xs">
            <Row label="Crashed at" value={formatMultiplier(crash)} />
            <Row label="Flight" value={`${t.toFixed(1)}s`} />
            {won && game.fair ? (
              // The built-in round reaches m with a chance of 1 in m, as with
              // Mines' odds; a custom crash point makes no such promise.
              <Row label="Odds beaten" value={`1 in ${formatMultiplier(cashed).slice(0, -1)}`} />
            ) : won ? (
              <Row label="You left at" value={formatMultiplier(cashed)} />
            ) : (
              <Row label="Auto target" value={roundAuto === null ? "Off" : formatShort(roundAuto)} />
            )}
          </dl>
        </Stage>
        {/* A narrow ticket keeps the figures on one line each and drops the miniature. */}
        {miniature ? (
          <Stage delay={0.24} reduce={reduce} className="@max-[15rem]:hidden">
            {miniature({ crash, cashed, target: won ? null : roundAuto, reduce })}
          </Stage>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 whitespace-nowrap">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

/** What a design's ticket miniature replays: the round's crash, your cash out and a missed target. */
export interface CrashMiniatureProps {
  crash: number;
  cashed: number | null;
  /** The auto target, only when the round crashed short of it. */
  target: number | null;
  reduce: boolean;
}

/** Every miniature is 88 × 48, like Mines' mini map. */
export const MINI = { width: 88, height: 48 } as const;
// The replay starts once the ticket's figures are in, and draws over 0.6s.
export const MINI_REPLAY = { delay: 0.3, duration: 0.6, ease: EASE_OUT } as const;

/** The sound toggle: a quiet 32px icon button in the card's header. */
function SoundToggle({ game }: { game: CrashGame }) {
  return (
    // aria-label names the button; the tooltip shows the same label on hover
    // and focus. Tooltip's asLabel would hydrate differently from the server.
    <Tooltip content="Sound" side="top">
      <Button
        variant="ghost"
        onClick={game.toggleSound}
        aria-label="Sound"
        aria-pressed={game.soundOn}
        pressScale={0.96}
        className={cn("size-8 shrink-0 rounded-xl px-0", game.soundOn && "text-foreground")}
      >
        <ActionSwapCascadeIcon value={game.soundOn ? "on" : "off"} className="size-4">
          {game.soundOn ? (
            <Volume2 aria-hidden="true" className="size-4" />
          ) : (
            <VolumeX aria-hidden="true" className="size-4" />
          )}
        </ActionSwapCascadeIcon>
      </Button>
    </Tooltip>
  );
}

/** The Auto menu and the main action, in one 40px row with 12px corners. */
function CrashControls({ game, mainRef }: { game: CrashGame; mainRef: Ref<HTMLButtonElement> }) {
  return (
    <div className="flex items-center gap-2">
      <Select
        value={game.auto === null ? "off" : String(game.auto)}
        onValueChange={game.setAuto}
        disabled={game.running || game.starting}
        className="w-32 shrink-0"
      >
        <SelectTrigger className="h-10 tabular-nums">
          <span className="flex items-baseline gap-1.5">
            <span className="text-xs text-muted-foreground">Auto</span>
            {/* Options register after mount; the placeholder covers the server render. */}
            <SelectValue placeholder={game.auto === null ? "Off" : formatShort(game.auto)} />
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="off">Off</SelectItem>
          {game.autoOptions.map((step) => (
            <SelectItem key={step} value={String(step)}>
              {formatShort(step)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        ref={mainRef}
        className="relative h-10 flex-1 overflow-hidden rounded-xl tabular-nums aria-disabled:cursor-wait aria-disabled:opacity-60"
        // aria-disabled, not disabled: the button keeps keyboard focus while the
        // crash point is on its way.
        aria-disabled={game.actionBusy || undefined}
        aria-busy={game.starting || undefined}
        // No press while it can't act.
        pressScale={game.actionBusy ? 1 : 0.96}
        onClick={game.act}
      >
        {game.actionLabel}
        {/* Progress toward the auto target, on the same log scale the
            multiplier grows on, so it fills at a steady pace. */}
        {game.running && game.target !== null ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] origin-left bg-primary-foreground/45"
            style={{ transform: `scaleX(${Math.min(1, Math.log(growth(game.t)) / Math.log(game.target)).toFixed(4)})` }}
          />
        ) : null}
      </Button>
    </div>
  );
}

/** Recent crash points, newest first, sliding in from the left. */
function CrashHistory({ game, className }: { game: CrashGame; className?: string }) {
  const { history, reduce } = game;
  return (
    <ul
      aria-label="Recent crashes"
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
                HEAT_PILL[heat(entry.value)],
              )}
            >
              {formatMultiplier(entry.value)}
            </motion.li>
          ))
        )}
      </AnimatePresence>
    </ul>
  );
}

/**
 * The live multiplier, warming as it climbs, that becomes the result at the
 * crash: red and shaking on a loss, your cash out in primary on a win.
 */
function CrashMultiplier({ game, className }: { game: CrashGame; className?: string }) {
  const { lost, crashed, cashed, reduce, pulse, round } = game;
  // After a crash you cashed out of, the number that counts is yours.
  const final = crashed && cashed !== null;
  return (
    <motion.p
      key={round}
      className={cn(
        "font-semibold tracking-tight tabular-nums transition-colors duration-150",
        className,
        // Warms with the climb, so size reads without the digits; the result overrides.
        lost ? "text-rose-600 dark:text-rose-400" : final ? "text-primary" : HEAT_TEXT[heat(game.multiplier)],
      )}
      animate={lost && !reduce ? { x: [0, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={SHAKE}
    >
      {/* Remounts per milestone for a quick swell, and once more when the
          crash hands the readout your cash out, which blurs in. */}
      <motion.span
        key={final ? "final" : pulse}
        className="inline-block"
        initial={
          reduce
            ? final
              ? { opacity: 0 }
              : false
            : final
              ? { opacity: 0, scale: 0.96, filter: "blur(4px)" }
              : pulse > 0
                ? { scale: 1.08 }
                : false
        }
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        transition={final ? SWAP : PULSE}
      >
        {formatMultiplier(final ? cashed : game.multiplier)}
      </motion.span>
    </motion.p>
  );
}

/**
 * The line under the multiplier: a hint before and during the flight, a
 * solid badge from the cash out until the crash, then the round's context.
 */
function CrashStatus({ game, className }: { game: CrashGame; className?: string }) {
  const { cashed, crashed, status, reduce } = game;
  return (
    <div className={cn("flex h-6 items-center", className)}>
      <AnimatePresence initial={false} mode="popLayout">
        {cashed !== null && !crashed ? (
          <motion.p
            key="cashed"
            className="inline-flex h-6 items-center gap-1 rounded-full bg-primary pr-2.5 pl-2 text-xs font-medium text-primary-foreground tabular-nums"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, filter: "blur(4px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={SWAP}
          >
            <Check aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            Cashed out {formatMultiplier(cashed)}
          </motion.p>
        ) : (
          <motion.p
            key={status}
            className="text-xs text-muted-foreground tabular-nums"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: EXIT }}
            transition={SWAP}
          >
            {status}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * The small uppercase state label: Ready, In flight, then the result —
 * Cashed out with a check, or Crashed with a cross.
 */
function CrashEyebrow({ game, className }: { game: CrashGame; className?: string }) {
  const { lost, crashed, running, cashed, reduce } = game;
  const icon = crashed ? (lost ? "lost" : "won") : running && cashed === null ? "live" : null;
  return (
    <p
      className={cn(
        "flex h-4 items-center gap-1.5 text-[11px] font-medium tracking-[0.08em] uppercase transition-colors duration-150",
        lost ? "text-rose-600 dark:text-rose-400" : crashed ? "text-primary" : "text-muted-foreground",
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
      {game.eyebrow}
    </p>
  );
}

/** The polite live region for starts, milestones, cash outs and crashes. */
function CrashAnnouncer({ game }: { game: CrashGame }) {
  return (
    <p aria-live="polite" className="sr-only">
      {game.announcement}
    </p>
  );
}
