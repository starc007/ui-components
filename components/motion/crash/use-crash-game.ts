"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { createGameSounds, type GameSounds } from "@/lib/game-sounds";

// The game every Crash design shares: the clock, the crash point, cashing out,
// milestones, history, sound and announcements. A design only draws it.

export interface CrashProps {
  /** Multiplier to cash out at automatically (controlled), or null for manual play. Applies from the next round. */
  autoCashOut?: number | null;
  /** Initial auto cash-out when uncontrolled. Default null (off). */
  defaultAutoCashOut?: number | null;
  /** Called when the Auto menu changes between rounds. */
  onAutoCashOutChange?: (autoCashOut: number | null) => void;
  /**
   * Decides each round's crash point, called once when the round starts.
   * Return a number, or a Promise for one (a server round, a provably fair
   * hash): the main button shows Starting… until it settles, and a rejection
   * returns to Start. Values below 1 or not finite become 1, and values are
   * floored to two decimals. Default `crashPoint()`. Ignored when `crashAt`
   * is passed.
   */
  getCrashPoint?: () => number | Promise<number>;
  /**
   * Live rounds (controlled), for a server that keeps the crash point secret
   * until it happens: the round `onStart` was given and its crash point once
   * revealed, or null. A round flies open-ended until its own crash point
   * arrives; a value for any other round is ignored, so a reveal from last
   * round can't end this one. A value at or below the current multiplier
   * crashes at once, at that value, and a cash out above it never happened:
   * the round ends lost and `onCashOut` is not called.
   */
  crashAt?: CrashReveal | null;
  /** Called when the player starts a round, before its crash point is known, with the round's number (unique on the page). */
  onStart?: (round: number) => void;
  /**
   * Called when the player cashes out, by hand or automatically. In a live
   * round it waits until the crash point is revealed, so it only fires for a
   * cash out that stands.
   */
  onCashOut?: (multiplier: number) => void;
  /** Called when the round crashes, with the cash-out multiplier or null if the player was still in. */
  onCrash?: (crashPoint: number, cashedOut: number | null) => void;
  /** Play synthesized sounds (controlled): a climbing chime at each milestone (2× to 5×, then 10×, 20×, 50×…), a cash-out arpeggio and a crash blast. */
  sound?: boolean;
  /** Initial sound state when uncontrolled. Default false. */
  defaultSound?: boolean;
  /** Called when the sound button is toggled. */
  onSoundChange?: (sound: boolean) => void;
  /** Accessible name for the game. Default "Crash". */
  "aria-label"?: string;
  className?: string;
}

export type CrashPhase = "idle" | "starting" | "running" | "crashed";

/** A live round's crash point, tagged with the round `onStart` was given. */
export interface CrashReveal {
  round: number;
  value: number;
}

// The multiplier grows exponentially: 2× after 5.8s, 10× after 19s.
export const GROWTH = 0.12;
export const growth = (seconds: number) => Math.exp(GROWTH * seconds);
export const timeAt = (multiplier: number) => Math.log(multiplier) / GROWTH;
const MAX_CRASH = 1_000_000;
// The highest multiplier a round can show: a passed crash point settles no
// higher, and an open live round stops climbing here (about 32 minutes in)
// rather than overflowing to Infinity.
const CEILING = 1e100;

/**
 * A crash point from one uniform draw in [0, 1): the round reaches `m` with
 * probability (1 − houseEdge) / m, floored to two decimals and capped at
 * 1,000,000×. The default edge of 0 is a fair game. Pass your own `random`
 * for a seeded or provably fair round, for example the first 52 bits of a
 * round's HMAC-SHA256: `crashPoint(() => parseInt(hash.slice(0, 13), 16) / 2 ** 52, 0.01)`.
 */
export function crashPoint(random: () => number = Math.random, houseEdge = 0) {
  const edge = Math.min(Math.max(houseEdge, 0), 1);
  return Math.min(MAX_CRASH, Math.max(1, Math.floor((100 * (1 - edge)) / (1 - random())) / 100));
}

/**
 * A passed crash point as the game plays it: at least 1 and floored to two
 * decimals, the way crash games display them. The round ends on exactly the
 * caller's value up to the 1e100 ceiling; `crashPoint()` caps at 1,000,000.
 * Anything not finite plays as 1.
 */
const settle = (point: number) => {
  if (!Number.isFinite(point)) return 1;
  return Math.max(1, floor2(Math.min(point, CEILING)));
};

/**
 * Multipliers announced (and chimed) while the player is in: 2× to 5×, then
 * 10×, 20×, 50×, 100× and on, so a long flight stays quiet enough to follow.
 */
export function milestone(index: number) {
  if (index < 4) return index + 2;
  return [10, 20, 50][(index - 4) % 3] * 10 ** Math.floor((index - 4) / 3);
}

// Auto cash-out targets offered in the menu, after Off.
export const AUTO_STEPS = [1.5, 2, 3, 5, 10, 25, 100];

// Skipping after a cash out runs the rest of the flight in at most this long.
const SKIP_TIME = 0.8;
// Presses this soon after a start, a cash-out press or a crash are the same
// press repeated (a double tap, a mash), not the next action (ms).
const PRESS_GUARD = 400;
// Round numbers, unique on the page, so a live reveal kept by the parent
// across a remount can't match a fresh round.
let rounds = 0;
const HISTORY = 12;

// Motion shared by every design.
// A loss shakes the readout once, quickly; a burst spreads from the crash.
export const SHAKE = { duration: 0.3, ease: EASE_OUT } as const;
export const BURST = { duration: 0.45, ease: EASE_OUT } as const;
// Status lines and markers swap on a spring with no bounce.
export const SWAP = { type: "spring", duration: 0.3, bounce: 0 } as const;
// A milestone swells the readout and lets it settle with a little give.
export const PULSE = { type: "spring", duration: 0.35, bounce: 0.3 } as const;
// Exits are shorter than entrances.
export const EXIT = { duration: 0.12, ease: EASE_OUT } as const;

export function useCrashGame({
  autoCashOut: autoProp,
  defaultAutoCashOut = null,
  onAutoCashOutChange,
  getCrashPoint,
  crashAt,
  onStart,
  onCashOut,
  onCrash,
  sound,
  defaultSound = false,
  onSoundChange,
}: Omit<CrashProps, "aria-label" | "className">) {
  // Live rounds: the crash point arrives through `crashAt` while flying.
  const live = crashAt !== undefined;
  const reduce = useReducedMotion() ?? false;
  const [internalAuto, setInternalAuto] = useState(defaultAutoCashOut);
  const rawAuto = autoProp === undefined ? internalAuto : autoProp;
  const auto = rawAuto === null || !Number.isFinite(rawAuto) ? null : Math.max(1.01, floor2(rawAuto));
  const [phase, setPhase] = useState<CrashPhase>("idle");
  const [round, setRound] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cashed, setCashed] = useState<number | null>(null);
  const [crashedAt, setCrashedAt] = useState<number | null>(null);
  const [history, setHistory] = useState<{ id: number; value: number }[]>([]);
  const [announcement, setAnnouncement] = useState("");
  // Counts milestones passed this round; each one pulses the readout.
  const [pulse, setPulse] = useState(0);
  // The auto target locked in when the round started.
  const [roundAuto, setRoundAuto] = useState<number | null>(null);
  // The flight lives in a ref so each frame can read and advance it. The
  // crash point stays out of state until it is reached. `milestone` indexes
  // the next multiplier to announce. `pressTime` is the last take-off,
  // cash-out press or crash, in performance.now() ms. `held` is a live cash out waiting on
  // the crash point before `onCashOut` hears of it.
  const flight = useRef({
    round: 0,
    t: 0,
    rate: 1,
    crash: 1,
    auto: null as number | null,
    milestone: 0,
    pressTime: Number.NEGATIVE_INFINITY,
    held: false,
  });
  const cashedRef = useRef<number | null>(null);
  // A round is in progress from Start until it crashes or fails to start. A
  // ref, not render state: two clicks in one frame both see the old phase,
  // so a second start would ask for a second crash point (a second server
  // round), and a click landing just after the crash frame would cash out a
  // round that has already ended.
  const busy = useRef(false);
  // Drops a crash point that settles after unmount. Set in the effect body
  // as well as cleared in its cleanup, so StrictMode's dev remount turns it
  // back on.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const [internalSound, setInternalSound] = useState(defaultSound);
  const soundOn = sound ?? internalSound;
  const player = useRef<GameSounds | null>(null);
  const getPlayer = () => {
    if (!player.current) player.current = createGameSounds();
    return player.current;
  };
  useEffect(
    () => () => {
      player.current?.dispose();
      player.current = null;
    },
    [],
  );

  const running = phase === "running";
  const starting = phase === "starting";
  const crashed = phase === "crashed";
  // Unknown only in a live round the server hasn't ended yet.
  const crashKnown = !live || crashAt?.round === round;
  const t = crashed && crashedAt !== null ? timeAt(crashedAt) : elapsed;
  const multiplier = crashed && crashedAt !== null ? crashedAt : floor2(growth(t));

  const cashOut = (value: number) => {
    if (!busy.current || cashedRef.current !== null) return;
    cashedRef.current = value;
    setCashed(value);
    setAnnouncement(`Cashed out at ${formatMultiplier(value)}.`);
    if (soundOn) getPlayer().cashOut();
    // A live cash out stands only if the crash point turns out above it.
    if (Number.isFinite(flight.current.crash)) onCashOut?.(value);
    else flight.current.held = true;
  };

  // Takes off once the crash point is settled (Infinity: not yet revealed).
  const fly = (id: number, crash: number) => {
    flight.current = {
      round: id,
      t: 0,
      rate: 1,
      crash,
      auto,
      milestone: 0,
      // Kept from start(): an async crash point can take a while, and the
      // first tap after it lands is a real cash out.
      pressTime: flight.current.pressTime,
      held: false,
    };
    setPhase("running");
    setAnnouncement(auto === null ? "Round started." : `Round started. Auto cash out at ${formatMultiplier(auto)}.`);
  };

  const start = () => {
    // From the ref, not render state: two clicks in one frame both see the
    // old phase, and a second start would ask for a second crash point (a
    // second server round).
    if (busy.current) return;
    busy.current = true;
    rounds += 1;
    const id = rounds;
    // Before any state changes: if it throws, the round never began and the
    // last one's result stays as it was.
    try {
      onStart?.(id);
    } catch (error) {
      busy.current = false;
      throw error;
    }
    // The guard against a double tap on Start cashing out at once.
    flight.current.pressTime = performance.now();
    cashedRef.current = null;
    setCashed(null);
    setCrashedAt(null);
    setElapsed(0);
    setPulse(0);
    setRoundAuto(auto);
    setRound(id);
    if (soundOn) getPlayer().prepare();
    if (live) {
      fly(id, Number.POSITIVE_INFINITY);
      return;
    }
    let point: number | Promise<number>;
    try {
      point = getCrashPoint ? getCrashPoint() : crashPoint();
    } catch {
      point = Promise.reject();
    }
    if (typeof point === "number") {
      fly(id, settle(point));
      return;
    }
    setPhase("starting");
    setAnnouncement("Starting round.");
    // Promise.resolve: a plain-JS caller may hand back something else.
    Promise.resolve(point).then(
      (value) => {
        if (alive.current) fly(id, settle(value));
      },
      () => {
        if (!alive.current) return;
        busy.current = false;
        setPhase("idle");
        setAnnouncement("The round couldn't start. Try again.");
      },
    );
  };

  // Runs the rest of the flight quickly; reduced motion jumps to the crash.
  // A live round still waiting on its crash point can't be run out.
  const skip = () => {
    const f = flight.current;
    if (!Number.isFinite(f.crash)) return;
    f.rate = reduce ? 1e9 : Math.max(1, (timeAt(f.crash) - f.t) / SKIP_TIME);
  };

  const onFrame = useStable((dt: number) => {
    // The round already ended: a frame booked before a throwing onCrash.
    if (!busy.current) return false;
    const f = flight.current;
    // A live round's crash point lands whenever the server reveals it; one
    // already behind the plane crashes at once, at that value.
    if (live && !Number.isFinite(f.crash) && crashAt?.round === f.round) {
      f.crash = settle(crashAt.value);
      // The server's crash came before the player's cash out: it never
      // happened, so the round is lost after all.
      if (cashedRef.current !== null && cashedRef.current > f.crash) {
        cashedRef.current = null;
        setCashed(null);
        f.held = false;
      }
    }
    // A held live cash out stands now the crash point is known.
    if (f.held && Number.isFinite(f.crash) && cashedRef.current !== null) {
      f.held = false;
      onCashOut?.(cashedRef.current);
    }
    const end = timeAt(f.crash);
    f.t = Math.min(end, f.t + dt * f.rate, timeAt(CEILING));
    const value = growth(f.t);
    if (cashedRef.current === null) {
      // A target at or below the crash point always pays, at the target. The
      // crash check covers a target equal to the crash point.
      if (f.auto !== null && f.auto <= f.crash && (value >= f.auto || f.t >= end)) cashOut(f.auto);
      // Finite: an open live round that runs for hours overflows to Infinity.
      else if (f.t < end && Number.isFinite(value) && value >= milestone(f.milestone)) {
        // A long frame can cross several; only the last is told.
        while (value >= milestone(f.milestone + 1)) f.milestone++;
        setAnnouncement(formatShort(milestone(f.milestone)));
        setPulse((count) => count + 1);
        f.milestone++;
        if (soundOn) getPlayer().gem(f.milestone);
      }
    }
    if (f.t < end) {
      setElapsed(f.t);
      return true;
    }
    busy.current = false;
    f.pressTime = performance.now();
    setCrashedAt(f.crash);
    setPhase("crashed");
    setHistory((current) => [{ id: f.round, value: f.crash }, ...current].slice(0, HISTORY));
    setAnnouncement(
      cashedRef.current === null
        ? `Crashed at ${formatMultiplier(f.crash)}. The round is lost.`
        : `Crashed at ${formatMultiplier(f.crash)}.`,
    );
    if (soundOn) getPlayer().mine();
    onCrash?.(f.crash, cashedRef.current);
    return false;
  });

  useEffect(() => {
    if (phase !== "running") return;
    let last = performance.now();
    // performance.now(), not the frame timestamp, so both ends share one clock.
    let id = requestAnimationFrame(function step() {
      const now = performance.now();
      const dt = Math.max(0, now - last) / 1000;
      last = now;
      // The next frame is booked first, so a consumer callback that throws
      // can't stall a running round; the crash cancels it.
      id = requestAnimationFrame(step);
      if (!onFrame(dt)) cancelAnimationFrame(id);
    });
    return () => cancelAnimationFrame(id);
  }, [phase, onFrame]);

  // Stable, so the menu and sound button can skip the 60fps re-renders.
  const setAuto = useStable((value: string) => {
    const next = value === "off" ? null : Number(value);
    if (autoProp === undefined) setInternalAuto(next);
    onAutoCashOutChange?.(next);
  });
  // A custom target from the prop gets its own option, so the menu can show it.
  const autoOptions = useMemo(
    () => (auto === null || AUTO_STEPS.includes(auto) ? AUTO_STEPS : [...AUTO_STEPS, auto].sort((a, b) => a - b)),
    [auto],
  );

  const toggleSound = useStable(() => {
    const next = !soundOn;
    if (next) getPlayer().prepare();
    if (sound === undefined) setInternalSound(next);
    onSoundChange?.(next);
  });

  /** Start, cash out or skip, whichever the round is ready for. */
  const act = () => {
    const now = performance.now();
    // A double tap on Start mustn't cash out at 1.01×, nor a mashed cash out
    // skip or start the next round. An auto cash out doesn't count as a
    // press, so it can be skipped at once.
    if (starting || now - flight.current.pressTime < PRESS_GUARD) return;
    if (!running) start();
    else if (cashedRef.current === null) {
      flight.current.pressTime = now;
      cashOut(floor2(growth(flight.current.t)));
    } else skip();
  };
  const actionLabel = starting
    ? "Starting…"
    : running
      ? cashed === null
        ? `Cash out ${formatMultiplier(multiplier)}`
        : crashKnown
          ? "Skip to crash"
          : "Waiting for crash"
      : crashed
        ? "Play again"
        : "Start";
  /** The main action can't act right now: the crash point is still coming. */
  const actionBusy = starting || (running && cashed !== null && !crashKnown);

  // Red is kept for a loss: a crash after a cash out is no bad news.
  const lost = crashed && cashed === null;
  // At the end of a round the readout becomes the result: won or lost, the
  // number that counts, and one line of context.
  const eyebrow = lost ? "Crashed" : crashed ? "Cashed out" : running ? "In flight" : starting ? "Starting" : "Ready";
  // In flight the round's locked target, not a menu change made since.
  const shownAuto = running ? roundAuto : auto;
  const status = crashed
    ? cashed !== null
      ? // Within 10% of the crash is a close call.
        multiplier / cashed < 1.1
        ? `Crashed at ${formatMultiplier(multiplier)}, a close call`
        : `It flew on to ${formatMultiplier(multiplier)}`
      : roundAuto !== null
        ? `Short of your ${formatShort(roundAuto)} target`
        : "You were still in"
    : shownAuto !== null
      ? `Auto cash out at ${formatMultiplier(shownAuto)}`
      : running
        ? "Cash out before it crashes"
        : "Start a round";

  // What a design marks ahead of the flight: the auto target until it pays
  // (the menu's choice while idle, the locked one in flight), and the last
  // round's crash point as a faint trace. Both are null when there is none.
  const target = cashed !== null || crashed ? null : running ? roundAuto : auto;
  const ghost = (crashed ? history[1] : history[0])?.value ?? null;

  return {
    reduce,
    /** The built-in fair crash point decides the round, so "1 in m" odds hold. */
    fair: !live && !getCrashPoint,
    target,
    ghost,
    /** The auto target the current or last round played with. */
    roundAuto,
    phase,
    running,
    starting,
    crashed,
    lost,
    /** A skip is running the rest of the flight out; scenery that streams with t would only flicker. */
    skipping: running && flight.current.rate > 1,
    /** Seconds into the flight, frozen at the crash. */
    t,
    multiplier,
    cashed,
    round,
    pulse,
    history,
    auto,
    autoOptions,
    setAuto,
    soundOn,
    toggleSound,
    act,
    actionLabel,
    actionBusy,
    eyebrow,
    status,
    announcement,
  };
}

export type CrashGame = ReturnType<typeof useCrashGame>;

/**
 * A callback with one identity for the component's life that runs the latest
 * render's code. Stands in for useEffectEvent, which needs React 19.2.
 */
export function useStable<A extends unknown[], R>(fn: (...args: A) => R) {
  const ref = useRef(fn);
  useLayoutEffect(() => {
    ref.current = fn;
  });
  return useCallback((...args: A) => ref.current(...args), []);
}

/**
 * How hot a multiplier reads: cool under 2×, warm to 10×, hot beyond. The
 * readout and the history colour by it, so size reads without the digits.
 */
export function heat(multiplier: number) {
  return multiplier >= 10 ? "hot" : multiplier >= 2 ? "warm" : "cool";
}

export function floor2(value: number) {
  return Math.floor(value * 100 + 1e-9) / 100;
}

const COMPACT = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

/** A multiplier as Crash shows it: 2.50×, or shortened when large (12.5K×). */
export function formatMultiplier(multiplier: number) {
  return `${multiplier < 10_000 ? multiplier.toFixed(2) : COMPACT.format(multiplier)}×`;
}

/** Scale and menu labels: 1.5×, 2×, 1.2K×. */
export function formatShort(multiplier: number) {
  return `${multiplier < 1000 ? +multiplier.toFixed(2) : COMPACT.format(multiplier)}×`;
}
