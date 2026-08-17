"use client";

import { Shield } from "lucide-react";
import { motion, useInView, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  memo,
  useCallback,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_PANEL } from "@/lib/ease";
import { useDismiss } from "@/lib/hooks/use-dismiss";
import { useHoverGesture } from "@/lib/hooks/use-hover-gesture";
import { useTapGesture } from "@/lib/hooks/use-tap-gesture";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export type Team = {
  name: string;
  /**
   * Any square image URL — club crest, org mark, player photo. Wins over `code`.
   * Drawn as-is on the node's card-colored disc, so a transparent-background
   * mark inked for one theme disappears in the other: ship artwork that reads on
   * both, or pick the URL yourself from your theme state.
   */
  logo?: string;
  /** ISO 3166-1 alpha-2 code, loaded from flagcdn.com (England is gb-eng). Used when `logo` is absent. */
  code?: string;
};

export type MatchSide = {
  team: Team | null;
  score: number | null;
  /** Present on both sides to render shootout scores — 1 (3). */
  penalties?: number | null;
};

/** Structurally compatible with the knockout bracket's Match, minus the fields
 * the wheel never draws (date, time, status). */
export type Match = {
  id: string;
  home: MatchSide;
  away: MatchSide;
  winner?: "home" | "away";
};

export type Round = {
  /** Read out with the match in tooltips and the screen-reader list. */
  name: string;
  matches: Match[];
};

export interface KnockoutWheelProps {
  /**
   * The whole draw, ordered widest round first — the same array the knockout
   * bracket takes. Any single-elimination tournament fits: each round holds half
   * the matches of the one before it (16 → 8 → 4 → 2 → 1) and `rounds[r].matches[k]`
   * is fed by matches `2k` and `2k + 1` of the round before it. Two rounds are
   * enough; the wheel grows a ring per round and sizes itself to the rim.
   */
  rounds: Round[];
  /**
   * Index of the outermost round to draw. Earlier rounds are dropped and the
   * kept round's own teams become the rim, so `1` on a 32-team draw opens at the
   * Round of 16. Defaults to 0 (the whole tree); clamped to the valid range.
   */
  initialRound?: number;
  className?: string;
}

const SIZE = 760;
const CENTER = SIZE / 2;
// Solid trophy glyph drawn in a 24-unit box.
const TROPHY_SIZE = 24;
const TROPHY_PATH =
  "M5 1h12v3h3a2 2 0 0 1 2 2c0 3.3-2.2 5.6-5.2 6A6 6 0 0 1 12 15a6 6 0 0 1-4.8-2.9C4.2 11.6 2 9.3 2 6a2 2 0 0 1 2-2h1V1Zm0 5H4c0 1.9 1.1 3.2 2.6 3.7A12 12 0 0 1 5 6Zm14 0h-1a12 12 0 0 1-1.6 3.7C17.9 9.2 19 7.9 19 6ZM9 16.5h6V19h2.5v2h-11v-2H9v-2.5Z";
// Clears the hub's top edge. The hub's two feeders sit on the horizontal, so
// the space directly above it is always free.
const TROPHY_GAP = 6;
// Outermost ring. The remaining 62px of the box absorbs the largest node plus
// its ring stroke, so nothing clips at the viewBox edge.
const OUTER_R = 318;
const HUB_R = 34;
// Nodes grow outward so the crowded outer ring still reads at small sizes.
const NODE_MIN = 14.2;
const NODE_STEP = 2.2;
// Initials floor, in viewBox units. The stage never goes below 32rem against a
// 760-unit box (scale ~0.674), so 15 units is ~10px on screen — under that, two
// letters are a smudge. `node.r * 0.8` alone puts the inner ring at 7.6px.
const INITIALS_MIN = 15;
// Siblings pull slightly toward their parent, opening a lane between subtrees.
const SIBLING_GAP = 0.9;
// Puts the hub's two feeders on the horizontal, where there's room for them.
const HUB_ANGLE = 90;

// Module scope so the memoized marks keep a stable transition identity.
const DIM_TRANSITION = { duration: 0.18 } as const;
const NO_TRANSITION = { duration: 0 } as const;

// Math.sin/cos are implementation-defined down in the last digits, so the SSR
// engine and the browser disagree and React reports a hydration mismatch on
// every coordinate. Quantizing well below sub-pixel makes both agree exactly.
const quantize = (n: number) => Math.round(n * 1e3) / 1e3;

const polar = (radius: number, deg: number) => {
  const rad = (deg * Math.PI) / 180;
  return {
    x: quantize(CENTER + radius * Math.cos(rad)),
    y: quantize(CENTER + radius * Math.sin(rad)),
  };
};

const point = (radius: number, deg: number) => {
  const { x, y } = polar(radius, deg);
  return `${x.toFixed(2)} ${y.toFixed(2)}`;
};

// Fixed precision so the server and client render byte-identical style strings.
// Raw floats serialize differently across the two and trip a hydration mismatch.
const pct = (value: number) => `${((value / SIZE) * 100).toFixed(4)}%`;

type WheelNode = {
  id: string;
  parentId: string | null;
  depth: number;
  /** Position around the wheel, in degrees. Orders arrow-key navigation. */
  angle: number;
  x: number;
  y: number;
  r: number;
  team: Team | null;
  label: string;
  /** Round the node's match belongs to; null on the rim, which holds teams. */
  round: string | null;
};

type WheelLink = {
  id: string;
  d: string;
  depth: number;
};

// Names and round labels are single ideas, so they wrap as a unit. Without this
// "Round of 16" strands a lone "16" on the next line.
const keepTogether = (text: string) => text.replace(/ /g, " ");

const teamName = (side: MatchSide) => keepTogether(side.team?.name ?? "TBD");

/** A `logo` is used as given; a country `code` loads a flag from flagcdn.com. */
const crestSrc = (team: Team) =>
  team.logo ?? (team.code ? `https://flagcdn.com/w80/${team.code}.png` : null);

/** Two-letter stand-in when a team has no artwork — "Real Madrid" → RM.
 * Spread, not `word[0]`: an emoji or astral first character is a surrogate pair
 * and indexing it renders a replacement glyph. */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0])
    .join("")
    .toUpperCase();

/** Teams · score, in the order they were played. The round is prepended by the
 * caller that has it, so the round list can reuse this without repeating it. */
function matchLabel(match: Match) {
  const teams = `${teamName(match.home)} v ${teamName(match.away)}`;
  if (match.home.score == null || match.away.score == null) return teams;
  const pens =
    match.home.penalties != null && match.away.penalties != null
      ? ` (${match.home.penalties}–${match.away.penalties} pens)`
      : "";
  return `${teams} · ${match.home.score}–${match.away.score}${pens}`;
}

/** Walks the match tree from the final outward, laying every node on a ring and
 * splitting each parent's wedge between its two feeders. */
function buildWheel(rounds: Round[]) {
  const nodes: WheelNode[] = [];
  const links: WheelLink[] = [];
  const layers = rounds.length;
  const ringR = (depth: number) => (depth / layers) * OUTER_R;
  const nodeR = (depth: number) => NODE_MIN + (depth - 1) * NODE_STEP;

  // An empty or malformed catalog renders nothing rather than throwing on the
  // way to the hub.
  const final = rounds[layers - 1]?.matches[0];
  if (!final) return { nodes, links, champion: null };

  const champion = final.winner ? final[final.winner].team : null;
  nodes.push({
    id: final.id,
    parentId: null,
    depth: 0,
    angle: HUB_ANGLE,
    x: CENTER,
    y: CENTER,
    r: HUB_R,
    team: champion,
    label: matchLabel(final),
    round: rounds[layers - 1].name,
  });

  // `roundIndex` is the round `match` belongs to; its two feeders live one round
  // out, or, past the first round, are the two teams that played it.
  const walk = (
    match: Match,
    roundIndex: number,
    index: number,
    parent: WheelNode,
    angle: number,
    wedge: number,
  ) => {
    const depth = parent.depth + 1;
    const radius = ringR(depth);
    const r = nodeR(depth);
    // The hub's two feeders sit opposite each other, so they get plain radial
    // lines; an arc between them would be a half circle.
    const offset = (wedge / 4) * (parent.depth === 0 ? 1 : SIBLING_GAP);
    const angles = [angle - offset, angle + offset];
    const sides = ["home", "away"] as const;

    const children = angles.map((childAngle, side) => {
      const { x, y } = polar(radius, childAngle);
      const feeder =
        roundIndex > 0
          ? rounds[roundIndex - 1].matches[2 * index + side]
          : undefined;
      const node: WheelNode = feeder
        ? {
            id: feeder.id,
            parentId: parent.id,
            depth,
            angle: childAngle,
            x,
            y,
            r,
            team: feeder.winner ? feeder[feeder.winner].team : null,
            label: matchLabel(feeder),
            round: rounds[roundIndex - 1].name,
          }
        : {
            id: `${match.id}-${sides[side]}`,
            parentId: parent.id,
            depth,
            angle: childAngle,
            x,
            y,
            r,
            team: match[sides[side]].team,
            label: match[sides[side]].team?.name ?? "TBD",
            round: null,
          };
      nodes.push(node);
      return { node, angle: childAngle, feeder };
    });

    if (parent.depth === 0) {
      for (const child of children) {
        links.push({
          id: `${parent.id}-${child.node.id}`,
          d: `M ${point(radius, child.angle)} L ${CENTER} ${CENTER}`,
          depth,
        });
      }
    } else {
      const midR = (ringR(parent.depth) + radius) / 2;
      links.push({
        id: `${parent.id}-arc`,
        d: `M ${point(radius, angles[0])} L ${point(midR, angles[0])} A ${midR} ${midR} 0 0 1 ${point(midR, angles[1])} L ${point(radius, angles[1])}`,
        depth,
      });
      links.push({
        id: `${parent.id}-stem`,
        d: `M ${point(midR, angle)} L ${point(ringR(parent.depth), angle)}`,
        depth,
      });
    }

    for (const [side, child] of children.entries()) {
      if (child.feeder) {
        walk(
          child.feeder,
          roundIndex - 1,
          2 * index + side,
          child.node,
          child.angle,
          wedge / 2,
        );
      }
    }
  };

  walk(final, layers - 1, 0, nodes[0], HUB_ANGLE, 360);
  return { nodes, links, champion };
}

/** Match ids from the hub down to the champion's first-round win. */
function championPath(rounds: Round[]) {
  const path = new Set<string>();
  let index = 0;
  for (let r = rounds.length - 1; r >= 0; r--) {
    const match = rounds[r].matches[index];
    if (!match?.winner) return path;
    path.add(match.id);
    if (r === 0) path.add(`${match.id}-${match.winner}`);
    index = 2 * index + (match.winner === "home" ? 0 : 1);
  }
  return path;
}

function TeamMark({
  node,
  clipId,
  lit,
  dimmed,
  loadFlag,
  transition,
}: {
  node: WheelNode;
  clipId: string;
  lit: boolean;
  dimmed: boolean;
  loadFlag: boolean;
  transition: object;
}) {
  // The failed URL, not a boolean: a corrected logo on the same node should be
  // tried again rather than stay initials for the life of the wheel.
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const resolved = node.team ? crestSrc(node.team) : null;
  const src = resolved === failedSrc ? null : resolved;
  const showFlag = src != null && loadFlag;
  // A square logo is fitted whole; a 4:3 flag is cropped to fill the disc.
  const box = node.team?.logo
    ? { w: node.r * 1.44, h: node.r * 1.44, fit: "xMidYMid meet" }
    : { w: node.r * 2.68, h: node.r * 2, fit: "xMidYMid slice" };
  // Dimming rides on the mark itself rather than a scrim tinted with the page
  // background, so the wheel recedes correctly on any surface it's dropped on.
  const fade = { opacity: dimmed ? 0.38 : 1 };

  return (
    <>
      {/* Stays opaque at every state: links are routed underneath and would
          otherwise read straight through the flag. */}
      <circle cx={node.x} cy={node.y} r={node.r} className="fill-card" />
      {showFlag && node.team ? (
        <>
          <clipPath id={clipId}>
            <circle cx={node.x} cy={node.y} r={node.r} />
          </clipPath>
          {/* Plain <image> — flags from flagcdn.com, logos from wherever you host
              them. A 4:3 flag is cropped to fill the disc; a logo is fitted whole
              inside it, since a crest cropped to a circle loses its shape. */}
          <motion.image
            href={src}
            x={node.x - box.w / 2}
            y={node.y - box.h / 2}
            width={box.w}
            height={box.h}
            clipPath={`url(#${clipId})`}
            preserveAspectRatio={box.fit}
            initial={false}
            animate={fade}
            transition={transition}
            onError={() => setFailedSrc(src)}
          />
        </>
      ) : node.team ? (
        // No artwork on this team — initials keep the ring readable.
        <motion.text
          x={node.x}
          y={node.y}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={Math.max(node.r * 0.8, INITIALS_MIN)}
          initial={false}
          animate={fade}
          transition={transition}
          className="fill-muted-foreground font-semibold"
        >
          {initials(node.team.name)}
        </motion.text>
      ) : (
        // Same shield the knockout bracket uses for a TBD slot, so an
        // undecided place reads identically across both fixture styles.
        <motion.g initial={false} animate={fade} transition={transition}>
          <Shield
            x={node.x - node.r * 0.7}
            y={node.y - node.r * 0.7}
            width={node.r * 1.4}
            height={node.r * 1.4}
            className="fill-current text-muted-foreground/50"
          />
        </motion.g>
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={node.r}
        fill="none"
        strokeWidth={lit ? 2 : 1}
        className={lit ? "stroke-foreground" : "stroke-border"}
      />
    </>
  );
}

/** Memoized so pointing at one flag re-renders two marks, not all 63. */
const WheelMark = memo(function WheelMark({
  node,
  isLit,
  dimmed,
  loadFlag,
  reduce,
  enter,
  showTrophy,
  clipId,
}: {
  node: WheelNode;
  isLit: boolean;
  dimmed: boolean;
  loadFlag: boolean;
  reduce: boolean;
  enter: object;
  showTrophy: boolean;
  clipId: string;
}) {
  return (
    <motion.g
      initial={reduce ? false : { opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={enter}
      style={{ transformOrigin: `${node.x}px ${node.y}px` }}
    >
      {showTrophy && (
        <g
          transform={`translate(${CENTER - TROPHY_SIZE / 2}, ${CENTER - HUB_R - TROPHY_GAP - TROPHY_SIZE})`}
        >
          <path d={TROPHY_PATH} className="fill-warning" />
        </g>
      )}
      <TeamMark
        node={node}
        clipId={clipId}
        lit={isLit}
        dimmed={dimmed}
        loadFlag={loadFlag}
        transition={reduce ? NO_TRANSITION : DIM_TRANSITION}
      />
    </motion.g>
  );
});

/** Invisible hit area over one flag: hover, tap, focus and arrow keys. */
const WheelAnchor = memo(function WheelAnchor({
  node,
  caption,
  isTabStop,
  isPinned,
  canHover,
  uid,
  onHover,
  onFocusNode,
  onToggle,
  onKey,
}: {
  node: WheelNode;
  caption: string;
  isTabStop: boolean;
  isPinned: boolean;
  canHover: boolean;
  uid: string;
  onHover: (id: string | null) => void;
  onFocusNode: (id: string | null) => void;
  onToggle: (id: string) => void;
  onKey: (node: WheelNode, key: string) => void;
}) {
  const size = pct(node.r * 2);
  // Capture-phase focus props, so a Tooltip cloning the child cannot overwrite
  // them. Both interaction paths are always attached: iPadOS answers the hover
  // query with true for a finger, so hanging the tap path off "cannot hover"
  // left it unreachable on the very device it was written for. The event says
  // which input arrived.
  const tap = useTapGesture<boolean>();
  const hover = useHoverGesture();
  const trigger = (
    <button
      type="button"
      id={`${uid}-${node.id}`}
      tabIndex={isTabStop ? 0 : -1}
      aria-label={caption}
      onKeyDown={(event: KeyboardEvent) => {
        // A key press starts a keyboard activation, which never had a pointer
        // behind it: a gesture the platform took away must not be read as the
        // tap behind the click this press synthesizes.
        tap.drop();
        if (!event.key.startsWith("Arrow")) return;
        // Arrows drive the wheel here, so they must not also scroll the page.
        event.preventDefault();
        onKey(node, event.key);
      }}
      onFocusCapture={() => onFocusNode(node.id)}
      onBlurCapture={() => onFocusNode(null)}
      onPointerEnter={(event) => {
        if (hover.enter(event)) onHover(node.id);
      }}
      onPointerLeave={(event) => {
        if (hover.leave(event)) onHover(null);
      }}
      onPointerDown={(event) => {
        tap.start(event, isPinned);
      }}
      onPointerCancel={tap.drop}
      // Click, not pointerdown: a tap focuses the button first, and unpinning
      // has to also drop that focus or the flag stays lit.
      onClick={(event) => {
        const gesture = tap.take();
        // A hovering pointer lit the flag on its way in and puts it out on the
        // way past; only a gesture without a hover pins one.
        if (!gesture || gesture.pointerType === "mouse") return;
        onToggle(node.id);
        if (gesture.state) event.currentTarget.blur();
      }}
      // ring-foreground, not the ring token: --ring is a 10% white hairline
      // that disappears over a flag. Focus has to be obvious.
      className="block h-full w-full rounded-full outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    />
  );

  return (
    <div
      className="absolute"
      style={{
        left: pct(node.x - node.r),
        top: pct(node.y - node.r),
        width: size,
        height: size,
      }}
    >
      {/* Touch never opens a Tooltip, so those devices skip mounting one per
          flag and read the tapped label instead. */}
      {canHover ? (
        <Tooltip
          content={caption}
          side="top"
          wrapperClassName="block h-full w-full"
          className="max-w-[20rem] whitespace-normal text-balance break-words text-center"
        >
          {trigger}
        </Tooltip>
      ) : (
        trigger
      )}
    </div>
  );
});

export function KnockoutWheel({
  rounds,
  initialRound = 0,
  className,
}: KnockoutWheelProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const uid = useId().replace(/:/g, "");
  const ref = useRef<SVGSVGElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  // 63 flags for a 32-team draw, and SVG <image> has no lazy attribute — so the
  // requests wait until the wheel is nearly on screen.
  const inView = useInView(ref, { once: true, margin: "300px" });
  // Hover, tap and focus are tracked apart. Sharing one slot let a stray mouse
  // move clear the isolation while a node still held focus, and a tap has to
  // outlive the pointerleave that a finger fires the moment it lifts.
  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const active = hovered ?? pinned ?? focused;

  // Everything downstream reads the trimmed catalog, so the kept round's own
  // teams become the rim and the sr-only list matches what's drawn.
  const visible = useMemo(() => {
    const from = Math.min(Math.max(initialRound, 0), Math.max(rounds.length - 1, 0));
    return from > 0 ? rounds.slice(from) : rounds;
  }, [rounds, initialRound]);

  const { nodes, links, champion } = useMemo(
    () => buildWheel(visible),
    [visible],
  );
  const winners = useMemo(() => championPath(visible), [visible]);
  const activeNode = useMemo(
    () => nodes.find((node) => node.id === active),
    [active, nodes],
  );
  // Pointing at one flag isolates that flag. Only at rest does the wheel fall
  // back to lighting the champion's whole run.
  const lit = useMemo(
    () => (activeNode ? new Set([activeNode.id]) : winners),
    [activeNode, winners],
  );

  // Stable identity, or every mark re-renders on each pointer move.
  const enter = useMemo(
    () =>
      reduce
        ? { duration: 0, opacity: { duration: 0 } }
        : { ...SPRING_PANEL, opacity: { duration: 0.24 } },
    [reduce],
  );

  // One transition object per ring, cached, so the ring-by-ring entrance delay
  // survives memoization instead of allocating 63 objects per render.
  const enterFor = useMemo(() => {
    const cache = new Map<number, object>();
    return (depth: number) => {
      const hit = cache.get(depth);
      if (hit) return hit;
      const value = { ...enter, delay: reduce ? 0 : depth * 0.06 };
      cache.set(depth, value);
      return value;
    };
  }, [enter, reduce]);

  // Tooltip is hover-only by design, so touch gets the same label anchored to
  // the tapped flag. It flips to the far side near the rim so it stays on stage.
  const tapped = canHover ? undefined : activeNode;
  const tapAbove = tapped ? tapped.y > CENTER : false;

  // Arrow keys follow the geometry: up walks toward the hub, down walks out to
  // a feeder, left/right go round the ring.
  const { ring, firstChild } = useMemo(() => {
    const byDepth = new Map<number, WheelNode[]>();
    const child = new Map<string, WheelNode>();
    for (const node of nodes) {
      const peers = byDepth.get(node.depth) ?? [];
      peers.push(node);
      byDepth.set(node.depth, peers);
      if (node.parentId && !child.has(node.parentId)) {
        child.set(node.parentId, node);
      }
    }
    for (const peers of byDepth.values()) {
      peers.sort((a, b) => a.angle - b.angle);
    }
    return { ring: byDepth, firstChild: child };
  }, [nodes]);

  const tabStop = activeNode?.id ?? nodes[0]?.id;

  // Stable callbacks so the memoized anchors don't re-render on every hover.
  const onKey = useCallback(
    (node: WheelNode, key: string) => {
      if (!key.startsWith("Arrow")) return;
      const target =
        key === "ArrowUp"
          ? nodes.find((peer) => peer.id === node.parentId)
          : key === "ArrowDown"
            ? firstChild.get(node.id)
            : (() => {
                const peers = ring.get(node.depth) ?? [];
                if (peers.length < 2) return undefined;
                const at = peers.indexOf(node);
                const next = key === "ArrowRight" ? at + 1 : at - 1;
                return peers[(next + peers.length) % peers.length];
              })();
      if (!target) return;
      // Focus moves; the focus handler lights the node it lands on.
      document.getElementById(`${uid}-${target.id}`)?.focus();
    },
    [nodes, ring, firstChild, uid],
  );

  const onToggle = useCallback(
    (id: string) => setPinned((current) => (current === id ? null : id)),
    [],
  );

  // A tap on another flag hands the isolation over rather than ending it.
  const onFlag = useCallback(
    (target: Element) =>
      Boolean(stageRef.current?.contains(target) && target.closest("button")),
    [],
  );

  // A finger never leaves the flag it lit, so the isolation would hold for good
  // — and bare stage reports no pointer event of its own to end it. The next
  // pointerdown that isn't on a flag stands in for the pointer leaving; it is
  // consumed, since a wheel spanning the viewport makes tapping past it the
  // natural way out and there is no reason for that tap to do anything else.
  // Only a pinned flag arms this: a mouse ends its own hover, and the browser
  // drops focus on its own.
  const unpin = useCallback(() => {
    setPinned(null);
    const focus = document.activeElement;
    if (focus instanceof HTMLElement && stageRef.current?.contains(focus)) {
      focus.blur();
    }
  }, []);

  useDismiss(pinned !== null, unpin, null, {
    behavior: "consume",
    ignore: onFlag,
  });

  // Round · teams · score for a decided match; a rim node is just a team. A slot
  // whose team isn't known yet reads TBD, matching the shield drawn in its place.
  const captions = useMemo(
    () =>
      new Map(
        nodes.map((node) => [
          node.id,
          node.team == null
            ? "TBD"
            : node.round
              ? `${keepTogether(node.round)} · ${node.label}`
              : node.team.name,
        ]),
      ),
    [nodes],
  );

  return (
    <div
      className={cn(
        "w-full max-w-full overflow-x-auto overscroll-x-contain",
        className,
      )}
    >
      {/* Below the min width the rim's marks collapse too small to tell apart or
          tap, so the wheel holds its size and pans instead. The floor is fixed,
          not rim-derived: node radius grows with depth, so a shallower draw has
          *smaller* marks and needs the width more, not less. */}
      <div
        ref={stageRef}
        className="relative mx-auto w-full min-w-[32rem] max-w-[34rem]"
      >
        <svg
          ref={ref}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label={`Tournament wheel${champion ? `, won by ${champion.name}` : ""}`}
          className="h-auto w-full touch-manipulation"
        >
          <defs>
            {/* Warm halo marking the champion. Kept faint: --warning is saturated
                enough that anything stronger drowns the connectors under it. */}
            <radialGradient id={`${uid}-glow`}>
              <stop offset="0%" stopColor="var(--color-warning)" stopOpacity="0.14" />
              <stop offset="45%" stopColor="var(--color-warning)" stopOpacity="0.04" />
              <stop offset="100%" stopColor="var(--color-warning)" stopOpacity="0" />
            </radialGradient>
          </defs>

          {champion && (
            <circle
              cx={CENTER}
              cy={CENTER}
              r={OUTER_R * 0.62}
              fill={`url(#${uid}-glow)`}
            />
          )}

          {/* role="img" on the svg prunes descendants from the accessibility tree,
              so the structure needs no aria-hidden of its own. */}
          <g>
            {links.map((link) => (
              <motion.path
                key={link.id}
                d={link.d}
                fill="none"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: link.depth * 0.06 }}
                className="stroke-border-strong"
              />
            ))}
          </g>

          {nodes.map((node) => (
            <WheelMark
              key={node.id}
              node={node}
              isLit={lit.has(node.id)}
              dimmed={lit.size > 0 && !lit.has(node.id)}
              loadFlag={inView}
              reduce={Boolean(reduce)}
              enter={enterFor(node.depth)}
              showTrophy={node.depth === 0 && champion != null}
              clipId={`${uid}-clip-${node.id}`}
            />
          ))}
        </svg>

        {/* An SVG <g> can't anchor a Tooltip, so each flag gets an invisible
            HTML hit area laid over it in percentage units, which track the
            wheel as it scales. */}
        {nodes.map((node) => (
          <WheelAnchor
            key={node.id}
            node={node}
            caption={captions.get(node.id) ?? ""}
            isTabStop={node.id === tabStop}
            isPinned={node.id === pinned}
            canHover={canHover}
            uid={uid}
            onHover={setHovered}
            onFocusNode={setFocused}
            onToggle={onToggle}
            onKey={onKey}
          />
        ))}

        {tapped && (
          <motion.p
            initial={reduce ? false : { opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? NO_TRANSITION : DIM_TRANSITION}
            style={{
              left: pct(tapped.x),
              top: pct(tapped.y + (tapAbove ? -tapped.r : tapped.r)),
            }}
            className={cn(
              "pointer-events-none absolute z-10 w-max max-w-[min(18rem,80vw)] -translate-x-1/2 text-balance break-words rounded-lg border border-border bg-background px-2.5 py-1 text-center text-xs font-medium text-foreground shadow-lg",
              tapAbove ? "-translate-y-[calc(100%+8px)]" : "translate-y-2",
            )}
          >
            {captions.get(tapped.id)}
          </motion.p>
        )}
      </div>

      {/* role="img" prunes the svg's descendants, so every result is restated
          here for screen readers. */}
      {/* Named lists, not <section aria-label> — a named section is a landmark,
          and five of those would crowd real page landmarks. */}
      <div className="sr-only">
        {visible
          .slice()
          .reverse()
          .map((round) => (
            <ul key={round.name} aria-label={round.name}>
              {round.matches.map((match) => (
                <li key={match.id}>{matchLabel(match)}</li>
              ))}
            </ul>
          ))}
      </div>
    </div>
  );
}

// ── Sample data ──────────────────────────────────────────────────────────────
// A finished 32-team cup, here to demo the shape. Swap it for your own
// tournament. Rounds run widest first and each holds half as many matches as the
// one before it (16 → 8 → 4 → 2 → 1); `matches[k]` of a round is fed by matches
// `2k` and `2k + 1` of the round before it, which is what pairs the branches.
// Any draw works: pass fewer rounds for a smaller cup, give teams a `logo`
// instead of a country `code`, or neither for initials. The knockout bracket
// takes the same array, so one dataset feeds both fixture styles.

export const TEAMS = {
  spain: { name: "Spain", code: "es" },
  japan: { name: "Japan", code: "jp" },
  netherlands: { name: "Netherlands", code: "nl" },
  portugal: { name: "Portugal", code: "pt" },
  england: { name: "England", code: "gb-eng" },
  uruguay: { name: "Uruguay", code: "uy" },
  croatia: { name: "Croatia", code: "hr" },
  brazil: { name: "Brazil", code: "br" },
  france: { name: "France", code: "fr" },
  morocco: { name: "Morocco", code: "ma" },
  belgium: { name: "Belgium", code: "be" },
  italy: { name: "Italy", code: "it" },
  argentina: { name: "Argentina", code: "ar" },
  mexico: { name: "Mexico", code: "mx" },
  germany: { name: "Germany", code: "de" },
  norway: { name: "Norway", code: "no" },
  costaRica: { name: "Costa Rica", code: "cr" },
  serbia: { name: "Serbia", code: "rs" },
  ecuador: { name: "Ecuador", code: "ec" },
  ghana: { name: "Ghana", code: "gh" },
  wales: { name: "Wales", code: "gb-wls" },
  canada: { name: "Canada", code: "ca" },
  denmark: { name: "Denmark", code: "dk" },
  cameroon: { name: "Cameroon", code: "cm" },
  poland: { name: "Poland", code: "pl" },
  senegal: { name: "Senegal", code: "sn" },
  tunisia: { name: "Tunisia", code: "tn" },
  switzerland: { name: "Switzerland", code: "ch" },
  peru: { name: "Peru", code: "pe" },
  qatar: { name: "Qatar", code: "qa" },
  sweden: { name: "Sweden", code: "se" },
  austria: { name: "Austria", code: "at" },
} satisfies Record<string, Team>;

export const ROUNDS: Round[] = [
  {
    name: "Round of 32",
    matches: [
      {
        id: "w-r32-1",
        home: { team: TEAMS.spain, score: 3 },
        away: { team: TEAMS.costaRica, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-2",
        home: { team: TEAMS.japan, score: 2 },
        away: { team: TEAMS.serbia, score: 1 },
        winner: "home",
      },
      {
        id: "w-r32-3",
        home: { team: TEAMS.netherlands, score: 2 },
        away: { team: TEAMS.ecuador, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-4",
        home: { team: TEAMS.ghana, score: 2 },
        away: { team: TEAMS.portugal, score: 3 },
        winner: "away",
      },
      {
        id: "w-r32-5",
        home: { team: TEAMS.england, score: 4 },
        away: { team: TEAMS.wales, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-6",
        home: { team: TEAMS.canada, score: 0 },
        away: { team: TEAMS.uruguay, score: 2 },
        winner: "away",
      },
      {
        id: "w-r32-7",
        home: { team: TEAMS.croatia, score: 1 },
        away: { team: TEAMS.denmark, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-8",
        home: { team: TEAMS.brazil, score: 3 },
        away: { team: TEAMS.cameroon, score: 1 },
        winner: "home",
      },
      {
        id: "w-r32-9",
        home: { team: TEAMS.france, score: 2 },
        away: { team: TEAMS.poland, score: 1 },
        winner: "home",
      },
      {
        id: "w-r32-10",
        home: { team: TEAMS.senegal, score: 0 },
        away: { team: TEAMS.morocco, score: 1 },
        winner: "away",
      },
      {
        id: "w-r32-11",
        home: { team: TEAMS.belgium, score: 2 },
        away: { team: TEAMS.tunisia, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-12",
        home: { team: TEAMS.switzerland, score: 1 },
        away: { team: TEAMS.italy, score: 3 },
        winner: "away",
      },
      {
        id: "w-r32-13",
        home: { team: TEAMS.argentina, score: 2 },
        away: { team: TEAMS.peru, score: 0 },
        winner: "home",
      },
      {
        id: "w-r32-14",
        home: { team: TEAMS.qatar, score: 0 },
        away: { team: TEAMS.mexico, score: 1 },
        winner: "away",
      },
      {
        id: "w-r32-15",
        home: { team: TEAMS.germany, score: 4 },
        away: { team: TEAMS.sweden, score: 2 },
        winner: "home",
      },
      {
        id: "w-r32-16",
        home: { team: TEAMS.austria, score: 1 },
        away: { team: TEAMS.norway, score: 2 },
        winner: "away",
      },
    ],
  },
  {
    name: "Round of 16",
    matches: [
      {
        id: "w-r16-1",
        home: { team: TEAMS.spain, score: 2 },
        away: { team: TEAMS.japan, score: 0 },
        winner: "home",
      },
      {
        id: "w-r16-2",
        home: { team: TEAMS.netherlands, score: 1 },
        away: { team: TEAMS.portugal, score: 3 },
        winner: "away",
      },
      {
        id: "w-r16-3",
        home: { team: TEAMS.england, score: 2 },
        away: { team: TEAMS.uruguay, score: 1 },
        winner: "home",
      },
      {
        id: "w-r16-4",
        home: { team: TEAMS.croatia, score: 0 },
        away: { team: TEAMS.brazil, score: 1 },
        winner: "away",
      },
      {
        id: "w-r16-5",
        home: { team: TEAMS.france, score: 3 },
        away: { team: TEAMS.morocco, score: 1 },
        winner: "home",
      },
      {
        id: "w-r16-6",
        home: { team: TEAMS.belgium, score: 1 },
        away: { team: TEAMS.italy, score: 2 },
        winner: "away",
      },
      {
        id: "w-r16-7",
        home: { team: TEAMS.argentina, score: 2 },
        away: { team: TEAMS.mexico, score: 0 },
        winner: "home",
      },
      {
        id: "w-r16-8",
        home: { team: TEAMS.germany, score: 1, penalties: 4 },
        away: { team: TEAMS.norway, score: 1, penalties: 2 },
        winner: "home",
      },
    ],
  },
  {
    name: "Quarter-finals",
    matches: [
      {
        id: "w-qf-1",
        home: { team: TEAMS.spain, score: 1 },
        away: { team: TEAMS.portugal, score: 0 },
        winner: "home",
      },
      {
        id: "w-qf-2",
        home: { team: TEAMS.england, score: 2 },
        away: { team: TEAMS.brazil, score: 3 },
        winner: "away",
      },
      {
        id: "w-qf-3",
        home: { team: TEAMS.france, score: 2 },
        away: { team: TEAMS.italy, score: 1 },
        winner: "home",
      },
      {
        id: "w-qf-4",
        home: { team: TEAMS.argentina, score: 3 },
        away: { team: TEAMS.germany, score: 1 },
        winner: "home",
      },
    ],
  },
  {
    name: "Semi-finals",
    matches: [
      {
        id: "w-sf-1",
        home: { team: TEAMS.spain, score: 2 },
        away: { team: TEAMS.brazil, score: 1 },
        winner: "home",
      },
      {
        id: "w-sf-2",
        home: { team: TEAMS.france, score: 0, penalties: 3 },
        away: { team: TEAMS.argentina, score: 0, penalties: 4 },
        winner: "away",
      },
    ],
  },
  {
    name: "Final",
    matches: [
      {
        id: "w-f-1",
        home: { team: TEAMS.spain, score: 2 },
        away: { team: TEAMS.argentina, score: 1 },
        winner: "home",
      },
    ],
  },
];
