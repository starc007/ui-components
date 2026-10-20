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

// Neighbours rest at this scale, with their label faded to SIDE_OPACITY and
// their surface veiled by SIDE_DIM; the focused event sits at full strength.
// The surface is dimmed by an opaque veil rather than opacity, so the card
// stays solid and the ruler never shows through it.
const SIDE_SCALE = 0.78;
const SIDE_OPACITY = 0.45;
const SIDE_DIM = 0.55;

// Year numerals drift at this fraction of the track speed, so they read as a
// far layer behind the cards.
const YEAR_PARALLAX = 0.5;

// Minor ruler ticks per event step.
const TICKS_PER_STEP = 6;

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
  /** Ruler ticks running behind the cards. */
  ruler?: boolean;
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

type Geometry = {
  /** Track px per event. */
  step: number;
  /** Card width at full size. */
  cardWidth: number;
  /** Push given to every non-focused card so all visual gaps match while the
   * focused card is bigger than its neighbours. */
  spread: number;
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
  const { step, cardWidth, spread, halfWidth } = geometry;
  const offset = useTransform(scroll, (s) => index - s);
  // Linear track plus a spread that ramps in over the first step, so a card
  // leaving the center makes room for the full-size one without the gaps
  // between the smaller cards growing.
  const x = useTransform(
    offset,
    (o) => o * step + Math.sign(o) * spread * Math.min(Math.abs(o), 1),
  );
  const scale = useTransform(
    offset,
    (o) => 1 - (1 - SIDE_SCALE) * Math.min(Math.abs(o), 1),
  );
  const labelOpacity = useTransform(
    offset,
    (o) => 1 - (1 - SIDE_OPACITY) * Math.min(Math.abs(o), 1),
  );
  const veilOpacity = useTransform(
    offset,
    (o) => SIDE_DIM * Math.min(Math.abs(o), 1),
  );
  const visibility = useTransform(x, (px) =>
    Math.abs(px) > halfWidth + cardWidth ? "hidden" : "visible",
  );

  return (
    <motion.li
      data-slot="timeline-event"
      data-active={active || undefined}
      className="absolute top-1/2 left-1/2"
      style={{
        x,
        scale,
        visibility,
        width: cardWidth,
        marginLeft: -cardWidth / 2,
      }}
    >
      <div className="relative flex -translate-y-1/2 flex-col gap-3">
        <motion.div className="px-1" style={{ opacity: labelOpacity }}>
          <p
            id={`${id}-date`}
            className="text-muted-foreground text-sm tabular-nums"
          >
            {dateLabel}
          </p>
          <h3
            id={`${id}-title`}
            className="truncate font-medium text-foreground text-lg tracking-tight"
          >
            {event.title}
          </h3>
        </motion.div>
        <div className="relative overflow-hidden rounded-[28px] border border-border bg-card p-2 shadow-sm">
          <div className="aspect-[4/3] overflow-hidden rounded-[20px] bg-background">
            {event.media}
          </div>
          {event.meta ? (
            <div className="flex items-center gap-1.5 px-3 pt-3 pb-1.5 text-muted-foreground text-sm tabular-nums">
              {event.meta}
            </div>
          ) : null}
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
          className={cn(
            "absolute inset-0 cursor-pointer rounded-[28px] outline-none",
            "focus-visible:ring-2 focus-visible:ring-foreground/30 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          )}
        />
      </div>
    </motion.li>
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
      className="absolute top-[6%] left-1/2"
      style={{ x }}
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

function Ruler({
  scroll,
  step,
  count,
  halfWidth,
}: {
  scroll: MotionValue<number>;
  step: number;
  count: number;
  halfWidth: number;
}) {
  // One strip translated as a whole; ticks are background gradients, so the
  // ruler costs one composited layer however long the timeline is. Its local
  // zero is event 0's center, padded a full stage width on both sides.
  const pad = halfWidth * 2;
  const x = useTransform(scroll, (s) => -s * step);
  const origin = pad + step / 2;
  const tick = "linear-gradient(to right, currentColor 1px, transparent 1px)";
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 text-foreground/20 [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]"
    >
      <motion.div
        className="absolute top-1/2"
        style={{ x, left: `calc(50% - ${pad}px)`, width: (count - 1) * step + pad * 2 }}
      >
        <div
          className="absolute h-6 w-full -translate-y-1/2"
          style={{
            backgroundImage: tick,
            backgroundSize: `${step / TICKS_PER_STEP}px 100%`,
            backgroundPosition: `${origin}px 0`,
          }}
        />
        <div
          className="absolute h-20 w-full -translate-y-1/2 opacity-80"
          style={{
            backgroundImage: tick,
            backgroundSize: `${step}px 100%`,
            backgroundPosition: `${origin}px 0`,
          }}
        />
      </motion.div>
    </div>
  );
}

export function Timeline({
  events,
  value,
  defaultValue,
  onValueChange,
  itemWidth = 320,
  height = 480,
  years = true,
  ruler = true,
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
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const stageWidth = width || 800;
  const cardWidth = Math.min(itemWidth, stageWidth * 0.62);
  const gap = clamp(cardWidth * 0.22, 32, 72);
  const geometry: Geometry = {
    step: cardWidth * SIDE_SCALE + gap,
    cardWidth,
    spread: (cardWidth * (1 - SIDE_SCALE)) / 2,
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

  // Focus follows the event nearest the center as the track moves.
  useEffect(
    () =>
      scroll.on("change", (v) => {
        commit(clamp(Math.round(v), 0, latest.current.last));
      }),
    [scroll, commit],
  );

  const stopGlide = useCallback(() => {
    glideRef.current?.stop();
    glideRef.current = null;
  }, []);

  const glideTo = useCallback(
    (to: number, velocity = scroll.getVelocity()) => {
      stopGlide();
      if (reduce) {
        scroll.set(to);
        return;
      }
      glideRef.current = animate(scroll, to, {
        type: "spring",
        ...GLIDE_SPRING,
        velocity,
        restDelta: 0.001,
        onComplete: () => {
          glideRef.current = null;
        },
      });
    },
    [scroll, stopGlide, reduce],
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
    if (draggingRef.current || glideRef.current) return;
    if (clamp(Math.round(scroll.get()), 0, last) === activeIndex) return;
    glideTo(activeIndex);
  }, [activeIndex, last, scroll, glideTo]);

  const select = useCallback(
    (index: number, focus = false) => {
      const target = clamp(index, 0, latest.current.last);
      commit(target);
      glideTo(target);
      if (focus) buttonsRef.current[target]?.focus({ preventScroll: true });
    },
    [commit, glideTo],
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
              fontSize={height * 0.42}
            />
          ))
        : null}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-foreground/25 to-transparent"
      />
      {ruler && count > 0 ? (
        <Ruler
          scroll={scroll}
          step={step}
          count={count}
          halfWidth={geometry.halfWidth}
        />
      ) : null}
      <ul className="absolute inset-0 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
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
