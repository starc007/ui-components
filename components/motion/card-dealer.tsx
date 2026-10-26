"use client";

import {
  type AnimationPlaybackControls,
  arc,
  motion,
  type Transition,
  useAnimate,
  useReducedMotion,
} from "motion/react";
import {
  type ReactNode,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export type CardDealerZone = "deck" | "hand" | "pile";

export interface CardDealerCard {
  id: string;
  zone: CardDealerZone;
  /** Accessible name for a card in the hand. */
  label: string;
}

export interface CardDealerProps<T extends CardDealerCard> {
  /** Every card on the table. Order within each zone is the stacking and fan order. */
  cards: T[];
  /** The card's face. */
  renderFace: (card: T) => ReactNode;
  /** The card's back, shown while it sits in the deck. */
  renderBack?: (card: T) => ReactNode;
  /** Makes hand cards buttons. Called with the card's id. */
  onCardSelect?: (id: string) => void;
  /** Card size in px. Default 84 by 120. */
  cardWidth?: number;
  cardHeight?: number;
  /** Most horizontal space between neighbouring hand cards, in px. Default 46. */
  spread?: number;
  /** Rotation between neighbouring hand cards, in degrees. Default 5. */
  angle?: number;
  /** Accessible name for the table. Default "Card table". */
  "aria-label"?: string;
  className?: string;
}

// A card crossing the table arcs high and lands with a small settle; a card
// changing slots inside the hand only hops. Both are tuned here rather than
// borrowed from lib/ease because the arc length is the whole effect.
const FLIGHT: Transition = { type: "spring", visualDuration: 0.55, bounce: 0.18 };
const HOP: Transition = { type: "spring", visualDuration: 0.4, bounce: 0.2 };
// arc() bends relative to the distance travelled. A negative strength puts
// horizontal moves above the line in both directions (automatic direction
// would bend them below).
const FLIGHT_STRENGTH = -0.35;
const HOP_STRENGTH = -0.3;
// Cards in a multi-card move leave one after another, not as a single slab.
// A big move shares a fixed window, so dealing the whole deck still flows.
const STAGGER = 0.045;
const MAX_STAGGER_WINDOW = 0.6;
const EDGE = 16;
const HOVER_LIFT = 18;
const HOVER_PUSH = 14;
// The fan's outermost tilt and drop, whatever the hand size. Small hands sit
// well inside both; a whole deck spread into the hand becomes one shallow
// ribbon instead of cards tipping past vertical.
const MAX_FAN_ANGLE = 40;
const MAX_FAN_DROP = 26;
const FAN_DROP = 2.2;

type Pose = { x: number; y: number; rotate: number; faceDown: boolean; z: number };

/** Stable per-card tilt for the pile, so a card keeps its angle once it lands. */
function pileTilt(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return ((Math.abs(hash) % 17) - 8) * 1.1;
}

/**
 * A card table: a face-down deck, a fanned hand and a discard pile. Every card
 * stays mounted and moving one between zones is just a change of `zone`, so it
 * arcs across the table to its new place, flipping face up or down in flight.
 * Reordering the hand makes cards hop over each other into their new slots.
 */
export function CardDealer<T extends CardDealerCard>({
  cards,
  renderFace,
  renderBack,
  onCardSelect,
  cardWidth = 84,
  cardHeight = 120,
  spread = 46,
  angle = 5,
  "aria-label": ariaLabel = "Card table",
  className,
}: CardDealerProps<T>) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const stageRef = useRef<HTMLElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // Where each card was last rendered, read during render to tell a flight
  // from a hop from a card that stayed put. Written after every commit.
  const previous = useRef(new Map<string, { zone: CardDealerZone; slot: number }>());
  const resized = useRef(false);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      resized.current = true;
      setSize({ width: stage.clientWidth, height: stage.clientHeight });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const deck = cards.filter((card) => card.zone === "deck");
  const hand = cards.filter((card) => card.zone === "hand");
  const pile = cards.filter((card) => card.zone === "pile");

  useLayoutEffect(() => {
    const next = new Map<string, { zone: CardDealerZone; slot: number }>();
    for (const list of [deck, hand, pile])
      list.forEach((card, slot) => {
        next.set(card.id, { zone: card.zone, slot });
      });
    previous.current = next;
    resized.current = false;
  });

  const poseFor = (card: T, slot: number): Pose => {
    const width = size?.width ?? 0;
    const height = size?.height ?? 0;
    if (card.zone === "deck") {
      // A thin visible edge for the first few cards, then the stack stops growing.
      const depth = Math.min(slot, 6) * 0.6;
      return { x: EDGE - depth, y: EDGE - depth, rotate: 0, faceDown: true, z: slot };
    }
    if (card.zone === "pile") {
      return {
        x: width - cardWidth - EDGE,
        y: EDGE,
        rotate: pileTilt(card.id),
        faceDown: false,
        z: 400 + slot,
      };
    }
    const count = hand.length;
    const offset = slot - (count - 1) / 2;
    const edge = Math.max((count - 1) / 2, 1);
    const reach = offset / edge;
    const tilt = Math.min(angle * edge, MAX_FAN_ANGLE);
    const drop = Math.min(FAN_DROP * edge * edge, MAX_FAN_DROP);
    const room = width - cardWidth - EDGE * 2;
    const step = count > 1 ? Math.min(spread, room / (count - 1)) : 0;
    const hoveredSlot = hovered ? hand.findIndex((item) => item.id === hovered) : -1;
    const push =
      hoveredSlot < 0 || slot === hoveredSlot
        ? 0
        : Math.sign(slot - hoveredSlot) * HOVER_PUSH;
    return {
      x: width / 2 - cardWidth / 2 + offset * step + push,
      // Outer cards sit lower so the fan reads as held, not laid flat.
      y:
        height -
        cardHeight -
        EDGE +
        reach * reach * drop -
        (slot === hoveredSlot ? HOVER_LIFT : 0),
      rotate: reach * tilt,
      faceDown: false,
      z: slot === hoveredSlot ? 300 : 100 + slot,
    };
  };

  // Moving cards leave in stacking order, so a deal or a collect fans out.
  let moving = 0;
  const movers = cards.filter((card) => {
    const was = previous.current.get(card.id);
    return was !== undefined && was.zone !== card.zone;
  }).length;
  const stagger = movers > 1 ? Math.min(STAGGER, MAX_STAGGER_WINDOW / (movers - 1)) : 0;
  const transitionFor = (card: T, slot: number): Transition => {
    if (reduce || resized.current) return { duration: 0 };
    const was = previous.current.get(card.id);
    if (!was) return { duration: 0 };
    if (was.zone !== card.zone) {
      const delay = moving * stagger;
      moving += 1;
      return { ...FLIGHT, delay, path: arc({ strength: FLIGHT_STRENGTH }) };
    }
    if (card.zone === "hand" && was.slot !== slot) {
      return { ...HOP, path: arc({ strength: HOP_STRENGTH }) };
    }
    return HOP;
  };

  const renderCard = (card: T, slot: number) => {
    const pose = poseFor(card, slot);
    const interactive = card.zone === "hand" && onCardSelect !== undefined;
    const faces = (
      <motion.span
        aria-hidden="true"
        className="relative block size-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateY: pose.faceDown ? 180 : 0 }}
        transition={reduce ? { duration: 0 } : FLIGHT}
      >
        <span className="absolute inset-0 overflow-hidden rounded-xl [backface-visibility:hidden]">
          {renderFace(card)}
        </span>
        <span className="absolute inset-0 overflow-hidden rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
          {renderBack ? renderBack(card) : <DefaultBack />}
        </span>
      </motion.span>
    );

    return (
      <CardFrame
        key={card.id}
        pose={pose}
        transition={transitionFor(card, slot)}
        width={cardWidth}
        height={cardHeight}
      >
        {/* The faces never change element, so a card flips in flight instead
            of remounting face up; the button lies over them only in the hand. */}
        <div className="size-full [perspective:800px]">{faces}</div>
        {interactive ? (
          <button
            type="button"
            aria-label={card.label}
            onClick={() => onCardSelect?.(card.id)}
            onPointerEnter={(event) => {
              if (canHover && event.pointerType === "mouse") setHovered(card.id);
            }}
            onPointerLeave={() => setHovered((id) => (id === card.id ? null : id))}
            onFocus={() => setHovered(card.id)}
            onBlur={() => setHovered((id) => (id === card.id ? null : id))}
            className="absolute inset-0 cursor-pointer rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
        ) : null}
      </CardFrame>
    );
  };

  return (
    <section
      ref={stageRef}
      aria-label={ariaLabel}
      // isolate: card z-indices only order cards against each other, so the
      // table never draws over sticky page chrome such as a header.
      className={cn("relative isolate h-80 w-full touch-manipulation select-none", className)}
    >
      {/* One flat list, so a card changing zones keeps its element and flies
          instead of remounting; zone by zone with the hand in fan order, so
          Tab follows the hand. */}
      {size
        ? [deck, hand, pile].flatMap((zone) =>
            zone.map((card, slot) => renderCard(card, slot)),
          )
        : null}
    </section>
  );
}

/**
 * Moves one card. Imperative so each new move can stop the last one first:
 * a declarative arc path keeps running when its target changes, and a long
 * flight finishing after a quick hop would write its stale end point back.
 */
function CardFrame({
  pose,
  transition,
  width,
  height,
  children,
}: {
  pose: Pose;
  transition: Transition;
  width: number;
  height: number;
  children: ReactNode;
}) {
  const [frame, animateFrame] = useAnimate<HTMLDivElement>();
  const running = useRef<AnimationPlaybackControls | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: a move starts when the pose changes; the transition belongs to that same render and must not restart a move on its own.
  useLayoutEffect(() => {
    if (!frame.current) return;
    running.current?.stop();
    running.current = animateFrame(
      frame.current,
      { x: pose.x, y: pose.y, rotate: pose.rotate },
      transition,
    );
  }, [pose.x, pose.y, pose.rotate]);

  useLayoutEffect(() => () => running.current?.stop(), []);

  return (
    <div
      ref={frame}
      className="absolute top-0 left-0"
      style={{ width, height, zIndex: pose.z }}
    >
      {children}
    </div>
  );
}

function DefaultBack() {
  return (
    <span className="block size-full rounded-xl border border-border bg-[repeating-linear-gradient(45deg,var(--muted)_0_6px,var(--background)_6px_12px)]" />
  );
}
