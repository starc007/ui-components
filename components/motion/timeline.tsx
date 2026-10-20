"use client";

import {
  animate,
  type AnimationPlaybackControls,
  motion,
  type MotionValue,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

// Timeline-specific: a release spring that takes the flick velocity, so the
// track coasts on past the finger and settles onto an event without a step.
const GLIDE_SPRING = { stiffness: 120, damping: 24, mass: 1 };

// Projected events per unit of release velocity (events/s), capped.
const FLICK_MOMENTUM = 0.3;
const MAX_FLICK_EVENTS = 4;

// Pointer travel before a press becomes a drag. Below it the press is a click.
const DRAG_THRESHOLD = 4;

// Past either end the track follows the pointer at this fraction.
const RUBBER_BAND = 0.3;

// Neighbours rest at this scale, veiled by SIDE_DIM; the focused event sits
// at full strength. The card is dimmed by a veil in the stage colour rather
// than by opacity, so it stays solid and nothing behind shows through it.
const SIDE_SCALE = 0.72;
const SIDE_DIM = 0.45;

// Year numerals drift at this fraction of the track speed, so they read as a
// far layer behind the cards.
const YEAR_PARALLAX = 0.5;

// Gap above the year numerals, as a fraction of their font size.
const YEAR_INSET = 0.33;

// Cards sit on the stage middle, between two equal bands: the top one holds
// the year numerals, and each holds the apex one fan of cables leaves from.
const CARD_CENTER = 0.5;

// Each gap between cards holds a group of ticks: GAP_TICKS lines spread over
// GAP_TICK_SPAN of the gap, the middle one taller and brighter. Heights are
// fractions of the card width so the group scales with the cards.
const GAP_TICKS = 5;
const GAP_TICK_SPAN = 0.7;
const TICK_SHORT = 0.13;
const TICK_TALL = 0.2;

export type TimelineEvent = {
  /** Stable identity, used for `value` and React keys. */
  id: string;
  /** ISO date string or Date. Read in UTC. */
  date: string | Date;
  title: string;
  /** Visual shown inside the card. Keep it non-interactive: the card itself
   * is the button. */
  media?: ReactNode;
  /** Footer line under the media: a stat, a tag, a reaction count. */
  meta?: ReactNode;
};

export interface TimelineProps {
  events: TimelineEvent[];
  /** Focused event id (controlled). */
  value?: string;
  /** Initially focused event id (uncontrolled). Defaults to the first event. */
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  /** Card width in px at full size. Shrinks to fit narrow containers. */
  itemWidth?: number;
  /** Stage height in px. */
  height?: number;
  /** Large year numerals drifting behind the cards. */
  years?: boolean;
  /** A group of ticks in each gap between cards. */
  ruler?: boolean;
  /** Lines fanning from the top and bottom center to the cards near the center. */
  cables?: boolean;
  formatDate?: (date: Date) => string;
  formatYear?: (date: Date) => string;
  "aria-label"?: string;
  className?: string;
}

const MONTH = new Intl.DateTimeFormat("en-US", { month: "short", timeZone: "UTC" });

function toDate(date: string | Date) {
  return typeof date === "string" ? new Date(date) : date;
}

function defaultFormatYear(date: Date) {
  return `’${String(date.getUTCFullYear()).slice(-2)}`;
}

function defaultFormatDate(date: Date) {
  return `${MONTH.format(date)} ${date.getUTCDate()} ${defaultFormatYear(date)}`;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Card center relative to the stage center. Over the first step a card
 * travels `near`, which leaves the same gap beside the bigger focused card
 * as between the smaller cards further out, one `step` apart. */
function cardX(o: number, { step, near }: Geometry) {
  const a = Math.abs(o);
  return Math.sign(o) * (a <= 1 ? a * near : near + (a - 1) * step);
}

function cardScale(o: number) {
  return 1 - (1 - SIDE_SCALE) * Math.min(Math.abs(o), 1);
}

type Geometry = {
  /** Track px per event. */
  step: number;
  /** Card width at full size. */
  cardWidth: number;
  /** Distance from the focused card's center to a neighbour's. */
  near: number;
  halfWidth: number;
};

function TimelineCard({
  scroll,
  index,
  geometry,
  event,
  dateLabel,
  active,
  onSelect,
  onKeyDown,
  buttonRef,
}: {
  scroll: MotionValue<number>;
  index: number;
  geometry: Geometry;
  event: TimelineEvent;
  dateLabel: string;
  active: boolean;
  onSelect: (index: number) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => void;
  buttonRef: (node: HTMLButtonElement | null) => void;
}) {
  const id = useId();
  const { cardWidth } = geometry;
  const offset = useTransform(scroll, (s) => index - s);
  // Off-stage cards stay visible to the browser (the stage clips them), so
  // Home and End can focus a card that is still far away.
  const x = useTransform(offset, (o) => cardX(o, geometry));
  const scale = useTransform(offset, cardScale);
  // Nearer the center paints on top, so a card arriving at the center slides
  // over the one leaving mid-drag.
  const zIndex = useTransform(offset, (o) => 100 - Math.round(Math.abs(o) * 10));
  const veilOpacity = useTransform(
    offset,
    (o) => SIDE_DIM * Math.min(Math.abs(o), 1),
  );

  return (
    <motion.li
      data-slot="timeline-event"
      data-active={active || undefined}
      className="absolute left-1/2"
      style={{
        top: `${CARD_CENTER * 100}%`,
        x,
        scale,
        zIndex,
        width: cardWidth,
        marginLeft: -cardWidth / 2,
      }}
    >
      {/* One solid surface holds the label, media and meta, so the cables
          and ruler stop at its edge instead of showing through any part. */}
      <div className="relative -translate-y-1/2">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
          <div className="px-3.5 pt-3 pb-2">
            <p
              id={`${id}-date`}
              className="text-muted-foreground text-xs tabular-nums"
            >
              {dateLabel}
            </p>
            <h3
              id={`${id}-title`}
              className="truncate font-medium text-base text-foreground tracking-tight"
            >
              {event.title}
            </h3>
          </div>
          <div className="px-2">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl border border-border bg-background">
              {event.media}
            </div>
          </div>
          {event.meta ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2.5 text-muted-foreground text-sm tabular-nums">
              {event.meta}
            </div>
          ) : (
            <div className="h-2" />
          )}
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-background"
            style={{ opacity: veilOpacity }}
          />
        </div>
        {/* Stretched over the whole card so the media stays valid content
            outside the button and remains readable on its own. */}
        <button
          ref={buttonRef}
          type="button"
          tabIndex={active ? 0 : -1}
          aria-current={active ? "step" : undefined}
          aria-labelledby={`${id}-date ${id}-title`}
          onClick={() => onSelect(index)}
          onKeyDown={(e) => onKeyDown(e, index)}
          className="absolute inset-0 cursor-pointer rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-foreground"
        />
      </div>
    </motion.li>
  );
}

// Cables reach this far across a card's half-width, so they meet its top edge
// just inside the corners.
const CABLE_REACH = 0.8;
// Only the centered card and its two neighbours carry cables: full strength
// out to CABLE_HOLD events from the center, gone by CABLE_FADE, so the fan
// stays at six lines however many events there are.
const CABLE_HOLD = 1;
const CABLE_FADE = 1.6;

/**
 * Lines from the apexes at the top and bottom center to one card's near
 * corners. Each ends at the card's vertical center, behind the opaque
 * surface, so the visible part stops exactly where it meets the card's top or
 * bottom edge and reads as attached there, with no measuring of the card.
 */
function Cables({
  scroll,
  index,
  geometry,
  height,
}: {
  scroll: MotionValue<number>;
  index: number;
  geometry: Geometry;
  height: number;
}) {
  const { halfWidth, cardWidth } = geometry;
  const offset = useTransform(scroll, (s) => index - s);
  const reach = (o: number) => (cardWidth / 2) * cardScale(o) * CABLE_REACH;
  const left = useTransform(
    offset,
    (o) => halfWidth + cardX(o, geometry) - reach(o),
  );
  const right = useTransform(
    offset,
    (o) => halfWidth + cardX(o, geometry) + reach(o),
  );
  const opacity = useTransform(offset, (o) =>
    clamp((CABLE_FADE - Math.abs(o)) / (CABLE_FADE - CABLE_HOLD), 0, 1),
  );
  const y = height * CARD_CENTER;
  return (
    <motion.g style={{ opacity }}>
      <motion.line x1={halfWidth} y1={0} x2={left} y2={y} />
      <motion.line x1={halfWidth} y1={0} x2={right} y2={y} />
      <motion.line x1={halfWidth} y1={height} x2={left} y2={y} />
      <motion.line x1={halfWidth} y1={height} x2={right} y2={y} />
    </motion.g>
  );
}

function YearMark({
  scroll,
  position,
  step,
  label,
  fontSize,
}: {
  scroll: MotionValue<number>;
  /** Track position (in events) the numeral centers on. */
  position: number;
  step: number;
  label: string;
  fontSize: number;
}) {
  const x = useTransform(scroll, (s) => (position - s) * step * YEAR_PARALLAX);
  return (
    <motion.div
      aria-hidden="true"
      className="absolute left-1/2"
      // Inset from the top so the numeral sits under the cables' apex, with
      // air above it.
      style={{ x, top: fontSize * YEAR_INSET }}
    >
      <span
        className="block -translate-x-1/2 font-medium text-foreground/[0.06] leading-none tracking-tighter tabular-nums"
        style={{ fontSize }}
      >
        {label}
      </span>
    </motion.div>
  );
}

/**
 * The tick group in the gap after card `index`. It sits midway between that
 * card's right edge and the next card's left edge; the gap keeps one width
 * while the cards move (see `cardX`), so the group only translates.
 */
function GapTicks({
  scroll,
  index,
  geometry,
  gap,
}: {
  scroll: MotionValue<number>;
  index: number;
  geometry: Geometry;
  gap: number;
}) {
  const { cardWidth } = geometry;
  const x = useTransform(scroll, (s) => {
    const o = index - s;
    const right = cardX(o, geometry) + (cardWidth * cardScale(o)) / 2;
    const left = cardX(o + 1, geometry) - (cardWidth * cardScale(o + 1)) / 2;
    return (right + left) / 2;
  });
  const spacing = (gap * GAP_TICK_SPAN) / (GAP_TICKS - 1);
  const middle = (GAP_TICKS - 1) / 2;
  return (
    <motion.div
      aria-hidden="true"
      className="absolute left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center"
      style={{ x, top: `${CARD_CENTER * 100}%`, gap: spacing - 1 }}
    >
      {Array.from({ length: GAP_TICKS }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed decorative ticks
          key={i}
          className={cn(
            "block w-px rounded-full",
            i === middle ? "bg-foreground/45" : "bg-foreground/25",
          )}
          style={{
            height: cardWidth * (i === middle ? TICK_TALL : TICK_SHORT),
          }}
        />
      ))}
    </motion.div>
  );
}

export function Timeline({
  events,
  value,
  defaultValue,
  onValueChange,
  itemWidth = 340,
  height = 600,
  years = true,
  ruler = true,
  cables = true,
  formatDate = defaultFormatDate,
  formatYear = defaultFormatYear,
  "aria-label": ariaLabel = "Timeline",
  className,
}: TimelineProps) {
  const reduce = useReducedMotion() ?? false;
  const hintId = useId();
  const count = events.length;
  const last = Math.max(0, count - 1);

  const [innerValue, setInnerValue] = useState(defaultValue ?? events[0]?.id);
  const activeId = value ?? innerValue;
  // Resolved during render: an unknown or removed id falls back to the first
  // event, so there is always exactly one tab stop.
  const found = events.findIndex((e) => e.id === activeId);
  const activeIndex = found === -1 ? 0 : found;

  const stageRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  // Layout effect with an immediate read, so the first paint already uses the
  // real width instead of the fallback.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stageWidth = width || 800;
  // About a third of the stage at most, so each neighbour shows in full or
  // nearly beside the focused card; phones give the card more of the width
  // and keep a sliver of each neighbour.
  const cardWidth = Math.min(itemWidth, stageWidth * (stageWidth < 640 ? 0.58 : 0.36));
  // One gap everywhere: between the focused card and its neighbours, and
  // between every pair of smaller cards further out.
  // Wide enough to hold the tick group between cards.
  const gap = clamp(cardWidth * 0.22, 40, 72);
  const geometry: Geometry = {
    step: cardWidth * SIDE_SCALE + gap,
    cardWidth,
    near: (cardWidth * (1 + SIDE_SCALE)) / 2 + gap,
    halfWidth: stageWidth / 2,
  };
  const { step } = geometry;

  // Track position in events (continuous); event i is centered at scroll = i.
  const scroll = useMotionValue(activeIndex);
  const glideRef = useRef<AnimationPlaybackControls | null>(null);
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  // Latest values for stable callbacks, written after commit.
  const latest = useRef({ events, activeIndex, onValueChange, step, last });
  useLayoutEffect(() => {
    latest.current = { events, activeIndex, onValueChange, step, last };
  });

  const commit = useCallback((index: number) => {
    const { events, activeIndex, onValueChange } = latest.current;
    const event = events[index];
    if (!event || index === activeIndex) return;
    latest.current.activeIndex = index;
    setInnerValue(event.id);
    onValueChange?.(event.id);
  }, []);

  // While a glide runs the target is already committed, so the track passing
  // over the events in between must not hand focus back to them.
  const glidingRef = useRef(false);

  // Under a drag or wheel, focus follows the event nearest the center.
  useEffect(
    () =>
      scroll.on("change", (v) => {
        if (glidingRef.current) return;
        commit(clamp(Math.round(v), 0, latest.current.last));
      }),
    [scroll, commit],
  );

  const stopGlide = useCallback(() => {
    glidingRef.current = false;
    glideRef.current?.stop();
    glideRef.current = null;
  }, []);

  const glideTo = useCallback(
    (to: number, velocity = scroll.getVelocity()) => {
      stopGlide();
      commit(to);
      if (reduce) {
        scroll.set(to);
        return;
      }
      glidingRef.current = true;
      glideRef.current = animate(scroll, to, {
        type: "spring",
        ...GLIDE_SPRING,
        velocity,
        restDelta: 0.001,
        onComplete: () => {
          glidingRef.current = false;
          glideRef.current = null;
        },
      });
    },
    [scroll, stopGlide, commit, reduce],
  );

  const settle = useCallback(
    (velocity: number) => {
      const projected =
        scroll.get() +
        clamp(velocity * FLICK_MOMENTUM, -MAX_FLICK_EVENTS, MAX_FLICK_EVENTS);
      glideTo(clamp(Math.round(projected), 0, latest.current.last), velocity);
    },
    [scroll, glideTo],
  );

  // Follow a value changed from outside (controlled), or a list that shrank.
  const draggingRef = useRef(false);
  useEffect(() => {
    if (draggingRef.current || glidingRef.current) return;
    if (clamp(Math.round(scroll.get()), 0, last) === activeIndex) return;
    glideTo(activeIndex);
  }, [activeIndex, last, scroll, glideTo]);

  const select = useCallback(
    (index: number, focus = false) => {
      const target = clamp(index, 0, latest.current.last);
      glideTo(target);
      if (focus) buttonsRef.current[target]?.focus({ preventScroll: true });
    },
    [glideTo],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLButtonElement>, index: number) => {
      const next =
        e.key === "ArrowRight"
          ? index + 1
          : e.key === "ArrowLeft"
            ? index - 1
            : e.key === "Home"
              ? 0
              : e.key === "End"
                ? latest.current.last
                : null;
      if (next === null) return;
      e.preventDefault();
      select(next, true);
    },
    [select],
  );

  const drag = useRef({
    id: -1,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    prevX: 0,
    prevT: 0,
  });

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    stopGlide();
    const now = performance.now();
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startScroll: scroll.get(),
      moved: false,
      lastX: e.clientX,
      lastT: now,
      prevX: e.clientX,
      prevT: now,
    };
    draggingRef.current = true;
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!draggingRef.current || e.pointerId !== d.id) return;
    const dx = e.clientX - d.startX;
    if (!d.moved) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      // Capture only once it is a drag, so a plain press still clicks the
      // card under it; after a drag the click lands on the stage instead.
      d.moved = true;
      capturePointer(e.currentTarget, e.pointerId);
    }
    const raw = d.startScroll - dx / step;
    scroll.set(
      raw < 0
        ? raw * RUBBER_BAND
        : raw > last
          ? last + (raw - last) * RUBBER_BAND
          : raw,
    );
    d.prevX = d.lastX;
    d.prevT = d.lastT;
    d.lastX = e.clientX;
    d.lastT = performance.now();
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!draggingRef.current || e.pointerId !== d.id) return;
    draggingRef.current = false;
    if (!d.moved) return;
    releasePointer(e.currentTarget, e.pointerId);
    const dt = d.lastT - d.prevT;
    const vpx = dt > 0 ? (d.lastX - d.prevX) / dt : 0; // px per ms
    settle((-vpx * 1000) / step); // events per second
  };

  // Horizontal wheel and trackpad swipes move the track; vertical wheel is
  // left to the page. Native listener: React's wheel handler is passive and
  // could not stop the browser's back-swipe.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    let settleTimer: number | undefined;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      stopGlide();
      const { step, last } = latest.current;
      scroll.set(clamp(scroll.get() + e.deltaX / step, -0.3, last + 0.3));
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(
        () =>
          glideTo(clamp(Math.round(scroll.get()), 0, latest.current.last), 0),
        140,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settleTimer);
    };
  }, [scroll, stopGlide, glideTo]);

  useEffect(() => stopGlide, [stopGlide]);

  const dates = useMemo(() => events.map((e) => toDate(e.date)), [events]);

  // One numeral per year, centered on the boundary where that year begins.
  const yearMarks = useMemo(() => {
    const marks: { key: string; label: string; position: number }[] = [];
    let previous: number | null = null;
    dates.forEach((date, i) => {
      const year = date.getUTCFullYear();
      if (year === previous) return;
      previous = year;
      marks.push({
        key: String(year),
        label: formatYear(date),
        position: i === 0 ? 0 : i - 0.5,
      });
    });
    return marks;
  }, [dates, formatYear]);

  return (
    <section
      ref={stageRef}
      aria-label={ariaLabel}
      aria-describedby={hintId}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        // clip-path rather than overflow: it also clips composited layers.
        // The whole stage fades at its edges together, so a card never turns
        // see-through over the cables behind it.
        "[mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]",
        "relative w-full cursor-grab touch-pan-y overscroll-x-contain [clip-path:inset(0)] active:cursor-grabbing",
        TOUCH_GESTURE_CLASS,
        className,
      )}
      style={{ height }}
    >
      <p id={hintId} className="sr-only">
        Use the left and right arrow keys to move between events.
      </p>
      {years
        ? yearMarks.map((mark) => (
            <YearMark
              key={mark.key}
              scroll={scroll}
              position={mark.position}
              step={step}
              label={mark.label}
              fontSize={height * 0.2}
            />
          ))
        : null}
      {cables ? (
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full stroke-foreground/[0.14] [mask-image:linear-gradient(to_bottom,transparent,black_6%,black_94%,transparent)]"
          fill="none"
          strokeWidth={1}
        >
          {events.map((event, i) => (
            <Cables
              key={event.id}
              scroll={scroll}
              index={i}
              geometry={geometry}
              height={height}
            />
          ))}
        </svg>
      ) : null}
      {/* The playhead: drawn over the cables so it reads as the line they hang
          from, bright from end to end and fading only at the stage edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 text-foreground/80"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent, currentColor 6%, currentColor 94%, transparent)",
        }}
      />
      {ruler
        ? events.slice(0, -1).map((event, i) => (
            <GapTicks
              key={event.id}
              scroll={scroll}
              index={i}
              geometry={geometry}
              gap={gap}
            />
          ))
        : null}
      <ul className="absolute inset-0">
        {events.map((event, i) => (
          <TimelineCard
            key={event.id}
            scroll={scroll}
            index={i}
            geometry={geometry}
            event={event}
            dateLabel={formatDate(dates[i])}
            active={i === activeIndex}
            onSelect={select}
            onKeyDown={onKeyDown}
            buttonRef={(node) => {
              buttonsRef.current[i] = node;
            }}
          />
        ))}
      </ul>
    </section>
  );
}
