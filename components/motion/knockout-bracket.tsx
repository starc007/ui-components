"use client";

import { motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { useMemo, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type Team = {
  name: string;
  /** ISO 3166-1 alpha-2 code used to load the flag from flagcdn.com (England is gb-eng). */
  code: string;
};

export type MatchSide = {
  /** null renders a TBD slot with a shield icon. */
  team: Team | null;
  score: number | null;
  /** Present on both sides to render Google-style shootout scores — 1 (3). */
  penalties?: number | null;
};

export type Match = {
  id: string;
  date: string;
  time?: string;
  status: "finished" | "upcoming";
  home: MatchSide;
  away: MatchSide;
  /** Decides the marker and which side dims. */
  winner?: "home" | "away";
};

export type Round = {
  name: string;
  matches: Match[];
};

export interface KnockoutBracketProps {
  /** Ordered rounds; each must hold half as many matches as the one before (16 → 8 → 4 → 2 → 1). */
  rounds: Round[];
  /** Round shown as the leftmost column on mount. Defaults to 1, clamped to the valid range. */
  initialRound?: number;
  className?: string;
}

// Card geometry drives the whole computed layout — every later match sits at the
// exact vertical midpoint of its two feeders, so pairs line up with connectors.
// Keep CARD_H in sync with the card's internal spacing.
const CARD_W = 250;
const CARD_H = 124;
const GAP_X = 28;
const GAP_Y = 20;
const COL_W = CARD_W + GAP_X;
const ROW = CARD_H + GAP_Y;
const VISIBLE_COLS = 3;
// Tall enough for 44px chevron hit areas without clipping the focus ring.
const HEADER_H = 44;
// Breathing room baked into the computed layout so the base column isn't flush
// against the clip edge and connector nubs aren't shaved off.
const PAD_X = 16;
const PAD_Y = 12;

// Bracket reflow needs a heavier, overdamped spring than SPRING_LAYOUT —
// many cards + connectors + stage height must glide as one piece without
// bounce. Tuned past critical damping so the settle is a smooth coast.
const REFLOW = {
  type: "spring",
  stiffness: 220,
  damping: 34,
  mass: 1.05,
} as const;

// Opacity cross-fades a touch ahead of the position spring so columns don't
// ghost while sliding.
const REFLOW_OPACITY = {
  duration: 0.28,
  ease: EASE_OUT,
} as const;

const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

function TeamFlag({ code }: { code: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className="flex h-5 w-7 shrink-0 items-center justify-center">
        <Shield className="size-5 fill-current text-muted-foreground/50" />
      </span>
    );
  }
  return (
    // Plain <img> served by flagcdn.com — swap this if you need self-hosted assets.
    // biome-ignore lint/performance/noImgElement: remote flagcdn asset, no next/image benefit
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      width={28}
      height={20}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className="h-5 w-7 shrink-0 rounded-[4px] border border-border/40 object-cover"
    />
  );
}

function WinnerMarker() {
  return (
    <svg
      viewBox="0 0 6 8"
      aria-hidden="true"
      className="h-2 w-1.5 shrink-0 fill-foreground"
    >
      <path d="M6 0 0 4 6 8Z" />
    </svg>
  );
}

function TeamRow({
  side,
  isWinner,
  decided,
}: {
  side: MatchSide;
  isWinner: boolean;
  decided: boolean;
}) {
  const dim = decided && !isWinner;
  return (
    <div className="flex items-center gap-3">
      {side.team ? (
        <TeamFlag code={side.team.code} />
      ) : (
        <span className="flex h-5 w-7 shrink-0 items-center justify-center">
          <Shield className="size-5 fill-current text-muted-foreground/50" />
        </span>
      )}
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-base font-medium",
          dim && "text-muted-foreground",
        )}
      >
        {side.team?.name ?? "TBD"}
      </span>
      {side.score != null && (
        <span
          className={cn(
            "shrink-0 text-base font-medium tabular-nums",
            dim && "text-muted-foreground",
          )}
        >
          {side.penalties != null
            ? `${side.score} (${side.penalties})`
            : side.score}
        </span>
      )}
      {/* Fixed 6px marker slot keeps every score right-aligned; the winner's
          triangle fills it, losers reserve it empty. */}
      <span className="flex w-1.5 shrink-0 items-center">
        {isWinner && <WinnerMarker />}
      </span>
    </div>
  );
}

function sideLabel(side: MatchSide) {
  const name = side.team?.name ?? "TBD";
  if (side.score == null) return name;
  const pen =
    side.penalties != null ? ` (${side.penalties} on penalties)` : "";
  return `${name} ${side.score}${pen}`;
}

function matchLabel(roundName: string, m: Match) {
  const sides =
    m.status === "finished"
      ? `${sideLabel(m.home)}, ${sideLabel(m.away)}`
      : `${sideLabel(m.home)} versus ${sideLabel(m.away)}`;
  const when =
    m.status === "upcoming"
      ? `, ${m.date}${m.time ? `, ${m.time}` : ""}`
      : "";
  const winnerName = m.winner ? m[m.winner].team?.name : undefined;
  const outcome = winnerName ? `, ${winnerName} won` : "";
  return `${roundName}: ${sides}${when}${outcome}`;
}

function MatchCard({ match }: { match: Match }) {
  const decided = match.status === "finished" && match.winner != null;
  const shootout =
    match.home.penalties != null || match.away.penalties != null;
  const badge =
    match.status === "finished" ? (shootout ? "FT (P)" : "FT") : null;

  return (
    <div
      style={{ width: CARD_W, height: CARD_H }}
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="min-w-0 flex-1 truncate text-sm leading-5 text-muted-foreground">
          {match.date}
          {match.time ? `, ${match.time}` : ""}
        </span>
        {badge && (
          <span className="shrink-0 rounded-full bg-background px-2.5 text-xs font-medium leading-5 text-muted-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="space-y-2.5">
        <TeamRow
          side={match.home}
          decided={decided}
          isWinner={decided && match.winner === "home"}
        />
        <TeamRow
          side={match.away}
          decided={decided}
          isWinner={decided && match.winner === "away"}
        />
      </div>
    </div>
  );
}

export function KnockoutBracket({
  rounds,
  initialRound = 1,
  className,
}: KnockoutBracketProps) {
  const reduce = useReducedMotion();
  const visibleCols = Math.min(VISIBLE_COLS, rounds.length);
  // The last page shows the final two rounds (semi-finals + final), not a full
  // window — so paging continues past the QF/SF/Final view down to SF + Final.
  const maxPage = Math.max(0, rounds.length - Math.min(2, rounds.length));
  const [page, setPage] = useState(() => clamp(initialRound, 0, maxPage));

  // Shared reflow — cards, connectors, headers and stage height page together.
  // Height springs with the same token (layout morph is the product feel for
  // collapsing rounds); opacity uses a short ease so fades don't lag the glide.
  const transition = reduce
    ? { duration: 0 }
    : { ...REFLOW, opacity: REFLOW_OPACITY };

  // Layout is computed, not scrolled. The leftmost visible round (`page`) is the
  // base and stacks at a fixed rhythm; every later match centers on its feeders,
  // and rounds behind the window collapse onto their parent match.
  const xOf = (r: number) => PAD_X + (r - page) * COL_W;
  const inWindow = (r: number) => r >= page && r < page + visibleCols;

  const pageStatus = useMemo(() => {
    const names = rounds
      .slice(page, page + visibleCols)
      .map((round) => round.name);
    if (names.length <= 1) return `Showing ${names[0] ?? "rounds"}`;
    if (names.length === 2) return `Showing ${names[0]} and ${names[1]}`;
    return `Showing ${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
  }, [rounds, page, visibleCols]);

  // Layout is computed, not scrolled — so cards and connectors derive from one
  // pass and page together under the shared transition.
  const { cy, containerHeight, connectors } = useMemo(() => {
    const centers: number[][] = rounds.map((r) => r.matches.map(() => 0));
    const base = rounds[page];
    centers[page] = base.matches.map((_, i) => PAD_Y + i * ROW + CARD_H / 2);
    for (let r = page + 1; r < rounds.length; r++) {
      centers[r] = rounds[r].matches.map(
        (_, k) => (centers[r - 1][2 * k] + centers[r - 1][2 * k + 1]) / 2,
      );
    }
    for (let r = page - 1; r >= 0; r--) {
      centers[r] = rounds[r].matches.map(
        (_, i) => centers[r + 1][Math.floor(i / 2)],
      );
    }

    const x = (r: number) => PAD_X + (r - page) * COL_W;
    const within = (r: number) => r >= page && r < page + visibleCols;
    const list: { key: string; dA: string; dB: string; visible: boolean }[] =
      [];
    for (let r = 1; r < rounds.length; r++) {
      const feederRight = x(r) - GAP_X;
      const midX = x(r) - GAP_X / 2;
      const childLeft = x(r);
      const visible = within(r) && within(r - 1);
      rounds[r].matches.forEach((_, k) => {
        const childY = centers[r][k];
        list.push({
          key: `${r}-${k}`,
          dA: `M ${feederRight} ${centers[r - 1][2 * k]} H ${midX} V ${childY} H ${childLeft}`,
          dB: `M ${feederRight} ${centers[r - 1][2 * k + 1]} H ${midX} V ${childY} H ${childLeft}`,
          visible,
        });
      });
    }

    const baseCount = base.matches.length;
    return {
      cy: centers,
      containerHeight: (baseCount - 1) * ROW + CARD_H + 2 * PAD_Y,
      connectors: list,
    };
  }, [rounds, page, visibleCols]);

  const containerWidth =
    visibleCols * CARD_W + (visibleCols - 1) * GAP_X + 2 * PAD_X;

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-x-auto overscroll-x-contain",
        className,
      )}
    >
      <section
        aria-label="Tournament bracket"
        className="relative mx-auto"
        style={{ width: containerWidth }}
      >
        <div className="sr-only" aria-live="polite">
          {pageStatus}
        </div>

        {/* Header row: chevrons pinned to the ends, round names glide per column.
            Clip so paging titles enter/exit at the canvas edge, not beyond it. */}
        <div className="relative overflow-hidden" style={{ height: HEADER_H }}>
          {page > 0 && (
            <button
              type="button"
              onClick={() => setPage((p) => clamp(p - 1, 0, maxPage))}
              aria-label="Previous round"
              className="absolute left-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-5" />
            </button>
          )}
          {rounds.map((round, r) => (
            <motion.div
              key={round.name}
              aria-hidden={inWindow(r) ? undefined : true}
              initial={false}
              animate={{ x: xOf(r), opacity: inWindow(r) ? 1 : 0 }}
              transition={transition}
              className="absolute left-0 top-0 flex h-full items-center justify-center text-sm font-bold text-foreground"
              style={{ width: CARD_W }}
            >
              {round.name}
            </motion.div>
          ))}
          {page < maxPage && (
            <button
              type="button"
              onClick={() => setPage((p) => clamp(p + 1, 0, maxPage))}
              aria-label="Next round"
              className="absolute right-0 top-1/2 z-10 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-5" />
            </button>
          )}
        </div>

        {/* Stage height springs with REFLOW so the bracket collapses as one
            piece with the cards — layout property is intentional here. */}
        <motion.div
          className="relative overflow-hidden"
          initial={false}
          animate={{ height: containerHeight }}
          transition={transition}
          style={{ width: containerWidth }}
        >
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 text-border"
            width={containerWidth}
            height={containerHeight}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            {connectors.map((c) => {
              // Off-window connectors snap their path instead of morphing it — the
              // shape is invisible anyway, so only the visible pairs pay for the
              // (CPU-bound) `d` interpolation.
              const pathTransition = c.visible
                ? transition
                : { ...transition, d: { duration: 0 } };
              return (
                <g key={c.key}>
                  <motion.path
                    initial={false}
                    animate={{ d: c.dA, opacity: c.visible ? 1 : 0 }}
                    transition={pathTransition}
                  />
                  <motion.path
                    initial={false}
                    animate={{ d: c.dB, opacity: c.visible ? 1 : 0 }}
                    transition={pathTransition}
                  />
                </g>
              );
            })}
          </svg>

          {rounds.map((round, r) => {
            const roundVisible = inWindow(r);
            return (
              <ul
                key={round.name}
                aria-label={round.name}
                aria-hidden={roundVisible ? undefined : true}
                className="m-0 list-none p-0"
              >
                {round.matches.map((match, k) => (
                  <motion.li
                    key={match.id}
                    aria-label={matchLabel(round.name, match)}
                    initial={false}
                    animate={{
                      x: xOf(r),
                      y: cy[r][k] - CARD_H / 2,
                      opacity: roundVisible ? 1 : 0,
                    }}
                    transition={transition}
                    className="absolute left-0 top-0"
                    style={{ willChange: "transform" }}
                  >
                    <MatchCard match={match} />
                  </motion.li>
                ))}
              </ul>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}

// ── Mock data ────────────────────────────────────────────────────────────────
// A full World Cup knockout stage, handy as a starting shape. Each round holds
// half as many matches as the one before it (16 → 8 → 4 → 2 → 1).

export const TEAMS = {
  southAfrica: { name: "South Africa", code: "za" },
  canada: { name: "Canada", code: "ca" },
  netherlands: { name: "Netherlands", code: "nl" },
  morocco: { name: "Morocco", code: "ma" },
  germany: { name: "Germany", code: "de" },
  paraguay: { name: "Paraguay", code: "py" },
  france: { name: "France", code: "fr" },
  sweden: { name: "Sweden", code: "se" },
  belgium: { name: "Belgium", code: "be" },
  senegal: { name: "Senegal", code: "sn" },
  usa: { name: "USA", code: "us" },
  bosnia: { name: "Bosnia and Herzegovina", code: "ba" },
  spain: { name: "Spain", code: "es" },
  austria: { name: "Austria", code: "at" },
  portugal: { name: "Portugal", code: "pt" },
  croatia: { name: "Croatia", code: "hr" },
  brazil: { name: "Brazil", code: "br" },
  japan: { name: "Japan", code: "jp" },
  ivoryCoast: { name: "Côte d'Ivoire", code: "ci" },
  norway: { name: "Norway", code: "no" },
  mexico: { name: "Mexico", code: "mx" },
  ecuador: { name: "Ecuador", code: "ec" },
  england: { name: "England", code: "gb-eng" },
  drCongo: { name: "DR Congo", code: "cd" },
  switzerland: { name: "Switzerland", code: "ch" },
  algeria: { name: "Algeria", code: "dz" },
  colombia: { name: "Colombia", code: "co" },
  ghana: { name: "Ghana", code: "gh" },
  australia: { name: "Australia", code: "au" },
  egypt: { name: "Egypt", code: "eg" },
  argentina: { name: "Argentina", code: "ar" },
  caboVerde: { name: "Cabo Verde", code: "cv" },
} satisfies Record<string, Team>;

export const ROUNDS: Round[] = [
  {
    name: "Round of 32",
    matches: [
      {
        id: "r32-1",
        date: "Mon, 29 Jun",
        status: "finished",
        home: { team: TEAMS.southAfrica, score: 0 },
        away: { team: TEAMS.canada, score: 1 },
        winner: "away",
      },
      {
        id: "r32-2",
        date: "Tue, 30 Jun",
        status: "finished",
        home: { team: TEAMS.netherlands, score: 1, penalties: 2 },
        away: { team: TEAMS.morocco, score: 1, penalties: 3 },
        winner: "away",
      },
      {
        id: "r32-3",
        date: "Tue, 30 Jun",
        status: "finished",
        home: { team: TEAMS.germany, score: 1, penalties: 3 },
        away: { team: TEAMS.paraguay, score: 1, penalties: 4 },
        winner: "away",
      },
      {
        id: "r32-4",
        date: "Wed, 1 Jul",
        status: "finished",
        home: { team: TEAMS.france, score: 3 },
        away: { team: TEAMS.sweden, score: 0 },
        winner: "home",
      },
      {
        id: "r32-5",
        date: "Thu, 2 Jul",
        status: "finished",
        home: { team: TEAMS.belgium, score: 3 },
        away: { team: TEAMS.senegal, score: 2 },
        winner: "home",
      },
      {
        id: "r32-6",
        date: "Thu, 2 Jul",
        status: "finished",
        home: { team: TEAMS.usa, score: 2 },
        away: { team: TEAMS.bosnia, score: 0 },
        winner: "home",
      },
      {
        id: "r32-7",
        date: "Fri, 3 Jul",
        status: "finished",
        home: { team: TEAMS.spain, score: 3 },
        away: { team: TEAMS.austria, score: 0 },
        winner: "home",
      },
      {
        id: "r32-8",
        date: "Fri, 3 Jul",
        status: "finished",
        home: { team: TEAMS.portugal, score: 2 },
        away: { team: TEAMS.croatia, score: 1 },
        winner: "home",
      },
      {
        id: "r32-9",
        date: "Mon, 29 Jun",
        status: "finished",
        home: { team: TEAMS.brazil, score: 2 },
        away: { team: TEAMS.japan, score: 1 },
        winner: "home",
      },
      {
        id: "r32-10",
        date: "Tue, 30 Jun",
        status: "finished",
        home: { team: TEAMS.ivoryCoast, score: 1 },
        away: { team: TEAMS.norway, score: 2 },
        winner: "away",
      },
      {
        id: "r32-11",
        date: "Wed, 1 Jul",
        status: "finished",
        home: { team: TEAMS.mexico, score: 2 },
        away: { team: TEAMS.ecuador, score: 0 },
        winner: "home",
      },
      {
        id: "r32-12",
        date: "Wed, 1 Jul",
        status: "finished",
        home: { team: TEAMS.england, score: 2 },
        away: { team: TEAMS.drCongo, score: 1 },
        winner: "home",
      },
      {
        id: "r32-13",
        date: "Fri, 3 Jul",
        status: "finished",
        home: { team: TEAMS.switzerland, score: 2 },
        away: { team: TEAMS.algeria, score: 0 },
        winner: "home",
      },
      {
        id: "r32-14",
        date: "Sat, 4 Jul",
        status: "finished",
        home: { team: TEAMS.colombia, score: 1 },
        away: { team: TEAMS.ghana, score: 0 },
        winner: "home",
      },
      {
        id: "r32-15",
        date: "Fri, 3 Jul",
        status: "finished",
        home: { team: TEAMS.australia, score: 1, penalties: 2 },
        away: { team: TEAMS.egypt, score: 1, penalties: 4 },
        winner: "away",
      },
      {
        id: "r32-16",
        date: "Sat, 4 Jul",
        status: "finished",
        home: { team: TEAMS.argentina, score: 3 },
        away: { team: TEAMS.caboVerde, score: 2 },
        winner: "home",
      },
    ],
  },
  {
    name: "Round of 16",
    matches: [
      {
        id: "r16-1",
        date: "Sat, 4 Jul",
        status: "finished",
        home: { team: TEAMS.canada, score: 0 },
        away: { team: TEAMS.morocco, score: 3 },
        winner: "away",
      },
      {
        id: "r16-2",
        date: "Sun, 5 Jul",
        status: "finished",
        home: { team: TEAMS.paraguay, score: 0 },
        away: { team: TEAMS.france, score: 1 },
        winner: "away",
      },
      {
        id: "r16-3",
        date: "Mon, 6 Jul",
        status: "finished",
        home: { team: TEAMS.usa, score: 1 },
        away: { team: TEAMS.belgium, score: 4 },
        winner: "away",
      },
      {
        id: "r16-4",
        date: "Mon, 6 Jul",
        status: "finished",
        home: { team: TEAMS.portugal, score: 0 },
        away: { team: TEAMS.spain, score: 1 },
        winner: "away",
      },
      {
        id: "r16-5",
        date: "Mon, 6 Jul",
        status: "finished",
        home: { team: TEAMS.brazil, score: 1 },
        away: { team: TEAMS.norway, score: 2 },
        winner: "away",
      },
      {
        id: "r16-6",
        date: "Mon, 6 Jul",
        status: "finished",
        home: { team: TEAMS.mexico, score: 2 },
        away: { team: TEAMS.england, score: 3 },
        winner: "away",
      },
      {
        id: "r16-7",
        date: "Tue, 7 Jul",
        status: "finished",
        home: { team: TEAMS.switzerland, score: 0, penalties: 4 },
        away: { team: TEAMS.colombia, score: 0, penalties: 3 },
        winner: "home",
      },
      {
        id: "r16-8",
        date: "Tue, 7 Jul",
        status: "finished",
        home: { team: TEAMS.argentina, score: 3 },
        away: { team: TEAMS.egypt, score: 2 },
        winner: "home",
      },
    ],
  },
  {
    name: "Quarter-finals",
    matches: [
      {
        id: "qf-1",
        date: "Fri, 10 Jul",
        time: "4:00 am",
        status: "finished",
        home: { team: TEAMS.france, score: 2 },
        away: { team: TEAMS.morocco, score: 0 },
        winner: "home",
      },
      {
        id: "qf-2",
        date: "Sat, 11 Jul",
        time: "3:00 am",
        status: "finished",
        home: { team: TEAMS.spain, score: 2 },
        away: { team: TEAMS.belgium, score: 1 },
        winner: "home",
      },
      {
        id: "qf-3",
        date: "Today",
        status: "finished",
        home: { team: TEAMS.norway, score: 1 },
        away: { team: TEAMS.england, score: 2 },
        winner: "away",
      },
      {
        id: "qf-4",
        date: "Today",
        status: "finished",
        home: { team: TEAMS.argentina, score: 3 },
        away: { team: TEAMS.switzerland, score: 1 },
        winner: "home",
      },
    ],
  },
  {
    name: "Semi-finals",
    matches: [
      {
        id: "sf-1",
        date: "Wed, 15 Jul",
        time: "4:00 am",
        status: "upcoming",
        home: { team: TEAMS.france, score: null },
        away: { team: TEAMS.spain, score: null },
      },
      {
        id: "sf-2",
        date: "Thu, 16 Jul",
        time: "3:00 am",
        status: "upcoming",
        home: { team: TEAMS.england, score: null },
        away: { team: TEAMS.argentina, score: null },
      },
    ],
  },
  {
    name: "Final",
    matches: [
      {
        id: "f-1",
        date: "Mon, 20 Jul",
        time: "3:00 am",
        status: "upcoming",
        home: { team: null, score: null },
        away: { team: null, score: null },
      },
    ],
  },
];
