"use client";

import {
  animate,
  type MotionValue,
  motion,
  type Transition,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { type BookSounds, createBookSounds } from "@/lib/book-sounds";
import { EASE_OUT, SPRING_MOUSE } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { capturePointer, releasePointer, TOUCH_GESTURE_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const bookshelfMessages = {
  label: "Bookshelf",
  book: "{title}",
  bookWithAuthor: "{title} by {author}",
};

export type BookshelfMessages = typeof bookshelfMessages;

export type BookshelfBook = {
  id: string;
  title: string;
  author?: string;
  /** Cloth color of the spine and cover. Any CSS color. */
  color: string;
  /** Text color on the spine and cover. Defaults to black or white, picked
   * from `color` when it is a hex value, else white. */
  textColor?: string;
  /** Front cover image. Without one, the cover is typeset from the title and author. */
  coverImage?: string;
  /** Spine width in px. */
  thickness?: number;
};

export interface BookshelfProps {
  books: BookshelfBook[];
  /** Id of the open book, or null. Pass to control the shelf. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (id: string | null) => void;
  /** Book height in px. */
  height?: number;
  /** Cover width as a fraction of the height. */
  coverRatio?: number;
  /** Space between closed books in px. */
  gap?: number;
  /** Extra space on each side of the open book in px. */
  openGap?: number;
  /** Tilt the open cover toward the mouse. Mouse only, off with reduced motion. */
  tilt?: boolean;
  /** Play a slide as a book comes out or goes back, and a soft tap as the
   * mouse runs along the spines. Default false. */
  sound?: boolean;
  /** Override any built-in string. */
  labels?: Partial<BookshelfMessages>;
  className?: string;
}

// A book turning in 3D reads as a physical object, so it gets a little more
// time than a UI transition. EASE_OUT front-loads most of each move.
// Opening pulls the book forward first and turns it a beat later; closing
// turns it back first and pushes it in a beat later, so the exit mirrors the
// entry.
const PULL = { duration: 0.42, ease: EASE_OUT };
const TURN = { duration: 0.5, ease: EASE_OUT };
const LAG = 0.08;
const INSTANT = { duration: 0 };
const FADE = { duration: 0.2, ease: EASE_OUT };

const DEFAULT_THICKNESS = 40;
const PERSPECTIVE = 1600;
// How far the open book comes toward the viewer, past the spines.
const PULL_DEPTH = 40;
// Hover: a finger hooks the top of the spine, lifts it and tips it out a little.
const HOVER_LIFT = 8;
const HOVER_DEPTH = 10;
const HOVER_TIP = 5;
// Largest cursor tilt of the open cover, in degrees.
const MAX_TILT = 6;
// Shade at the far end of a turn: a face turned side-on to the viewer.
const SIDE_SHADE = 0.5;
// A drag starts after this many px sideways, so a tap stays a tap.
const DRAG_SLOP = 6;
// How far a released drag keeps gliding: velocity (px/s) times this.
const FLING = 0.22;
// Past either end, the row follows the finger at this fraction.
const RUBBER = 0.3;

function readableText(color: string) {
  const hex = color.trim().match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)?.[1];
  if (!hex) return "#ffffff";
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  const [r, g, b] = [0, 2, 4].map(
    (i) => Number.parseInt(full.slice(i, i + 2), 16) / 255,
  );
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.55 ? "#1c1917" : "#fafaf9";
}

type Layout = { slots: number[]; width: number };

function layoutShelf(
  books: BookshelfBook[],
  openIndex: number,
  cover: number,
  gap: number,
  openGap: number,
): Layout {
  const slots: number[] = [];
  let x = 0;
  books.forEach((book, i) => {
    const open = i === openIndex;
    if (i > 0) x += open || i - 1 === openIndex ? openGap : gap;
    slots.push(x);
    x += open ? cover : (book.thickness ?? DEFAULT_THICKNESS);
  });
  return { slots, width: x };
}

// The focus outline is drawn on the book's faces, so it follows the 3D book
// rather than the flat hit button that holds focus.
const FOCUS_RING =
  "group-has-[button:focus-visible]:outline-2 group-has-[button:focus-visible]:outline-offset-2 group-has-[button:focus-visible]:outline-ring";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function Bookshelf({
  books,
  value,
  defaultValue = null,
  onValueChange,
  height = 300,
  coverRatio = 0.68,
  gap = 3,
  openGap = 16,
  tilt = true,
  sound = false,
  labels,
  className,
}: BookshelfProps) {
  const t = useMessages("bookshelf", bookshelfMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const canHover = useHoverCapable();

  // Created on first use, so a silent shelf never touches Web Audio.
  const soundsRef = useRef<BookSounds | null>(null);
  const sounds = useCallback(() => {
    if (!sound) return null;
    soundsRef.current ??= createBookSounds();
    return soundsRef.current;
  }, [sound]);
  useEffect(
    () => () => {
      soundsRef.current?.dispose();
      soundsRef.current = null;
    },
    [],
  );

  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const openId = value !== undefined ? value : uncontrolled;
  const openIndex = books.findIndex((b) => b.id === openId);

  // The book that just closed keeps painting above its neighbours until it
  // is back on the shelf, so it never slips under them mid-turn.
  const [closingId, setClosingId] = useState<string | null>(null);

  const setOpen = useCallback(
    (id: string | null) => {
      if (id === openId) return;
      setClosingId(openId);
      if (value === undefined) setUncontrolled(id);
      onValueChange?.(id);
      // A switch plays only the new book's slide; two at once is noise.
      if (id === null) sounds()?.push();
      else sounds()?.pull();
    },
    [openId, value, onValueChange, sounds],
  );

  const cover = Math.round(height * coverRatio);
  const closed = layoutShelf(books, -1, cover, gap, openGap);
  const shelf = layoutShelf(books, openIndex, cover, gap, openGap);

  // Fit the closed shelf to the container; an open book that no longer fits
  // pans the row so it stays in view.
  const frameRef = useRef<HTMLDivElement>(null);
  const [frameWidth, setFrameWidth] = useState(0);
  useLayoutEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    setFrameWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) =>
      setFrameWidth(entry.contentRect.width),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const fit = frameWidth ? Math.min(1, frameWidth / closed.width) : 1;
  const visible = frameWidth ? frameWidth / fit : shelf.width;
  // Static per width, so the fade doesn't pop in and out as books open.
  const canOverflow =
    frameWidth > 0 && closed.width + cover + 2 * openGap > visible;
  const overflowing = openIndex >= 0 && shelf.width > visible;

  let rowX = -shelf.width / 2;
  if (overflowing) {
    const center = shelf.slots[openIndex] + cover / 2;
    rowX = clamp(-center, visible / 2 - shelf.width, -visible / 2);
  }

  // Swipe (or scroll sideways) to see books cut off by the edges. The pan
  // rides on top of the automatic centring and resets when a book opens.
  const pan = useMotionValue(0);
  const panMin = overflowing ? visible / 2 - shelf.width - rowX : 0;
  const panMax = overflowing ? -visible / 2 - rowX : 0;
  const panRange = useRef({ min: panMin, max: panMax, fit });
  panRange.current = { min: panMin, max: panMax, fit };

  useEffect(() => {
    // Re-centre on every open, close or switch; the row's own move runs on
    // the same timing, so the two read as one.
    void openId;
    if (pan.get() === 0) return;
    const controls = animate(pan, 0, reduce ? INSTANT : TURN);
    return () => controls.stop();
  }, [openId, pan, reduce]);

  const drag = useRef<{
    id: number;
    x: number;
    y: number;
    pan: number;
    dragging: boolean;
    lastX: number;
    lastT: number;
    vx: number;
  } | null>(null);
  const swallowClick = useRef(false);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    swallowClick.current = false;
    // Browsers only start audio from a gesture; unlock it on the first press.
    sounds()?.prepare();
    if (!overflowing) return;
    pan.stop();
    drag.current = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      pan: pan.get(),
      dragging: false,
      lastX: e.clientX,
      lastT: performance.now(),
      vx: 0,
    };
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    if (!d.dragging) {
      if (Math.abs(dx) < DRAG_SLOP || Math.abs(dx) < Math.abs(e.clientY - d.y)) {
        return;
      }
      d.dragging = true;
      capturePointer(e.currentTarget, e.pointerId);
    }
    const { min, max, fit: scale } = panRange.current;
    const raw = d.pan + dx / scale;
    const over = raw > max ? raw - max : raw < min ? raw - min : 0;
    pan.set(raw - over + over * RUBBER);
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) d.vx = ((e.clientX - d.lastX) / dt) * 1000;
    d.lastX = e.clientX;
    d.lastT = now;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    if (!d.dragging) return;
    releasePointer(e.currentTarget, e.pointerId);
    swallowClick.current = true;
    const { min, max, fit: scale } = panRange.current;
    const target = clamp(pan.get() + (d.vx * FLING) / scale, min, max);
    if (reduce) pan.set(target);
    else animate(pan, target, TURN);
  };

  const onWheel = (e: ReactWheelEvent<HTMLDivElement>) => {
    if (!overflowing || Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    pan.stop();
    const { min, max, fit: scale } = panRange.current;
    pan.set(clamp(pan.get() - e.deltaX / scale, min, max));
  };

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const index = buttonsRef.current.indexOf(e.target as HTMLButtonElement);
    if (index < 0) return;
    let next = index;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = books.length - 1;
    else if (e.key === "Escape" && openId !== null) {
      e.preventDefault();
      setOpen(null);
      return;
    } else return;
    e.preventDefault();
    next = clamp(next, 0, books.length - 1);
    buttonsRef.current[next]?.focus();
    // Browsing with a book open keeps one open, like pulling the next one out.
    if (openId !== null) setOpen(books[next].id);
  };

  const [hoverId, setHoverId] = useState<string | null>(null);
  // Neighbours make room as the open book turns, so they share its lag.
  const slide = reduce
    ? INSTANT
    : { ...TURN, delay: openIndex >= 0 ? LAG : 0 };

  return (
    <div
      ref={frameRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onWheel={onWheel}
      onClickCapture={(e) => {
        // A swipe that ends on a book must not open it.
        if (!swallowClick.current) return;
        swallowClick.current = false;
        e.preventDefault();
        e.stopPropagation();
      }}
      className={cn(
        "relative w-full touch-pan-y [clip-path:inset(0)]",
        TOUCH_GESTURE_CLASS,
        // Books cut by the edge fade out, so the row reads as continuing.
        canOverflow &&
          "[mask-image:linear-gradient(90deg,transparent,#000_28px,#000_calc(100%-28px),transparent)]",
        className,
      )}
      // Room above and below for the open book coming forward and its shadow.
      style={{ height: (height + 64) * fit }}
    >
      <div
        className="absolute top-1/2 left-1/2"
        style={{
          width: 0,
          height,
          marginTop: -height / 2,
          transform: `scale(${fit})`,
        }}
      >
        {/* Flat on purpose: each book is its own 3D scene, painted in z-index
            order, so an open book always sits in front of its neighbours.
            The vanishing point is the centre of the frame. */}
        <ul
          aria-label={t("label")}
          onKeyDown={onKeyDown}
          className="absolute top-0 left-0 m-0 w-0 list-none p-0"
          style={{
            height,
            perspective: PERSPECTIVE,
            perspectiveOrigin: "0 50%",
          }}
        >
          {books.map((book, i) => (
            <Book
              key={book.id}
              book={book}
              name={
                book.author
                  ? t("bookWithAuthor", { title: book.title, author: book.author })
                  : t("book", { title: book.title })
              }
              x={rowX + shelf.slots[i]}
              slide={slide}
              pan={pan}
              open={i === openIndex}
              closing={book.id === closingId}
              hovered={canHover && hoverId === book.id}
              tilt={tilt && canHover}
              reduce={reduce}
              height={height}
              cover={cover}
              buttonRef={(el) => {
                buttonsRef.current[i] = el;
              }}
              onToggle={() => setOpen(i === openIndex ? null : book.id)}
              onHover={(over) => {
                setHoverId((id) => (over ? book.id : id === book.id ? null : id));
                if (over && i !== openIndex) sounds()?.tap();
              }}
              onSettled={() =>
                setClosingId((id) => (id === book.id ? null : id))
              }
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Book({
  book,
  name,
  x,
  slide,
  pan,
  open,
  closing,
  hovered,
  tilt,
  reduce,
  height,
  cover,
  buttonRef,
  onToggle,
  onHover,
  onSettled,
}: {
  book: BookshelfBook;
  name: string;
  x: number;
  slide: Transition;
  pan: MotionValue<number>;
  open: boolean;
  closing: boolean;
  hovered: boolean;
  tilt: boolean;
  reduce: boolean;
  height: number;
  cover: number;
  buttonRef: (el: HTMLButtonElement | null) => void;
  onToggle: () => void;
  onHover: (over: boolean) => void;
  onSettled: () => void;
}) {
  const thickness = book.thickness ?? DEFAULT_THICKNESS;
  const text = book.textColor ?? readableText(book.color);
  const turned = open && !reduce;
  const lifted = hovered && !open && !reduce;
  // Offset that keeps the turned book's cover inside its slot and level with
  // the spines: the box turns around its middle, then shifts by this much.
  const turn = (cover - thickness) / 2;

  // Each face darkens as it turns side-on to the viewer and lights up as it
  // comes round to face them, tied to the angle so it stays in step when a
  // turn is interrupted.
  const angle = useMotionValue(turned ? -90 : 0);
  const coverShade = useTransform(angle, [-90, 0], [0, SIDE_SHADE]);
  const spineShade = useTransform(angle, [-90, 0], [SIDE_SHADE, 0]);

  // Paint order follows the turn. While the cover is more than half turned
  // toward the viewer the book is in front of its neighbours, so it paints
  // over them (the open book over a closing one). Once it is side-on again,
  // its cover runs back into the shelf; books left of centre show that side
  // face, and it must stay behind the next spine instead of painting across
  // it.
  const frontZ = useTransform(angle, (a) => (a < -45 ? 3 : 1));
  const backZ = useTransform(angle, (a) => (a < -45 ? 2 : 1));
  // Reduced motion never turns: the flat open cover simply sits on top.
  const zIndex = reduce ? (open ? 3 : 1) : open ? frontZ : closing ? backZ : 1;

  const tiltX = useSpring(0, SPRING_MOUSE);
  const tiltY = useSpring(0, SPRING_MOUSE);
  const canTilt = tilt && turned;
  useEffect(() => {
    if (canTilt) return;
    tiltX.set(0);
    tiltY.set(0);
  }, [canTilt, tiltX, tiltY]);

  const onPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!canTilt || e.pointerType !== "mouse") return;
    // The hit button lies flat over the open cover, so its box is the cover's.
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    const px = clamp((e.clientX - rect.left) / rect.width, 0, 1);
    const py = clamp((e.clientY - rect.top) / rect.height, 0, 1);
    tiltY.set((px - 0.5) * 2 * MAX_TILT);
    tiltX.set((0.5 - py) * 2 * MAX_TILT);
  };

  return (
    <motion.li
      className="group absolute top-0 left-0 [transform-style:preserve-3d]"
      style={{ width: thickness, height, zIndex }}
      initial={false}
      animate={{ x }}
      transition={slide}
    >
      <motion.span
        className="absolute inset-0 block [transform-style:preserve-3d]"
        style={{ x: pan }}
      >
        {/* The book is picture only. A browser hit-tests a 3D-turned cover
            only inside its parent's box, which is the spine's, so the open
            cover would ignore most clicks. A flat button over the book's
            footprint (spine closed, cover open) takes the input instead. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 block [transform-style:preserve-3d]"
        >
          {/* Pull: off the shelf toward the viewer, or a lift and tip on hover. */}
          <motion.span
            className="absolute top-0 left-0 block [transform-style:preserve-3d]"
            style={{
              width: thickness,
              height,
              // Tips on the front-bottom edge, like a book hooked by its top.
              transformOrigin: "50% 100% 0",
            }}
            initial={false}
            animate={{
              y: lifted ? -HOVER_LIFT : 0,
              z: turned ? PULL_DEPTH : lifted ? HOVER_DEPTH : 0,
              rotateX: lifted ? -HOVER_TIP : 0,
            }}
            transition={
              reduce ? INSTANT : { ...PULL, delay: closing && !open ? LAG : 0 }
            }
            onAnimationComplete={() => {
              if (closing && !open) onSettled();
            }}
          >
            <Shadow open={open} cover={cover} height={height} reduce={reduce} />
            {/* Tilt: the open cover leans toward the mouse. */}
            <motion.span
              className="absolute top-0 left-0 block [transform-style:preserve-3d]"
              style={{
                width: thickness,
                height,
                rotateX: tiltX,
                rotateY: tiltY,
                transformOrigin: `${cover / 2}px 50% 0`,
              }}
            >
              {/* Turn: spine to cover, around the middle of the book. */}
              <motion.span
                className="absolute top-0 left-0 block [transform-style:preserve-3d]"
                style={{
                  width: thickness,
                  height,
                  transformOrigin: `${thickness / 2}px 50% ${-cover / 2}px`,
                }}
                initial={false}
                animate={{
                  x: turned ? turn : 0,
                  z: turned ? turn : 0,
                  rotateY: turned ? -90 : 0,
                }}
                transition={reduce ? INSTANT : { ...TURN, delay: open ? LAG : 0 }}
                onUpdate={(latest) => {
                  const value = Number.parseFloat(String(latest.rotateY));
                  if (!Number.isNaN(value)) angle.set(value);
                }}
              >
                <Spine
                  book={book}
                  text={text}
                  thickness={thickness}
                  height={height}
                  hidden={open && reduce}
                  shade={reduce ? null : spineShade}
                />
                <Cover
                  book={book}
                  text={text}
                  thickness={thickness}
                  width={cover}
                  height={height}
                  reduce={reduce}
                  open={open}
                  shade={reduce ? null : coverShade}
                />
              </motion.span>
            </motion.span>
          </motion.span>
        </span>
        <button
          ref={buttonRef}
          type="button"
          aria-label={name}
          aria-pressed={open}
          onClick={onToggle}
          onPointerEnter={(e) => {
            if (e.pointerType === "mouse") onHover(true);
          }}
          onPointerLeave={() => {
            onHover(false);
            tiltX.set(0);
            tiltY.set(0);
          }}
          onPointerMove={onPointerMove}
          className="absolute top-0 left-0 cursor-pointer border-0 bg-transparent p-0 outline-none"
          style={{ width: open ? cover : thickness, height }}
        />
      </motion.span>
    </motion.li>
  );
}

function Shadow({
  open,
  cover,
  height,
  reduce,
}: {
  open: boolean;
  cover: number;
  height: number;
  reduce: boolean;
}) {
  // A soft pool under the open book that spreads as it comes off the shelf.
  // It sits where the turned cover lands, and paints first so the book
  // covers its top edge.
  return (
    <motion.span
      className="pointer-events-none absolute left-0 block bg-[radial-gradient(closest-side,rgba(0,0,0,0.42),rgba(0,0,0,0))]"
      // A hair behind the cover's plane, so the two never fight for depth.
      style={{ top: height - 12, width: cover, height: 28, z: -2 }}
      initial={false}
      animate={{ opacity: open ? 1 : 0, scaleX: open || reduce ? 1 : 0.6 }}
      transition={reduce ? FADE : PULL}
    />
  );
}

function Shade({ opacity }: { opacity: MotionValue<number> | null }) {
  if (!opacity) return null;
  return (
    <motion.span
      className="pointer-events-none absolute inset-0 bg-black"
      style={{ opacity }}
    />
  );
}

function Spine({
  book,
  text,
  thickness,
  height,
  hidden,
  shade,
}: {
  book: BookshelfBook;
  text: string;
  thickness: number;
  height: number;
  hidden: boolean;
  shade: MotionValue<number> | null;
}) {
  return (
    <motion.span
      className={cn(
        "absolute top-0 left-0 flex flex-col items-center overflow-hidden rounded-[2px] py-3 [backface-visibility:hidden]",
        FOCUS_RING,
      )}
      style={{ width: thickness, height, backgroundColor: book.color, color: text }}
      initial={false}
      animate={{ opacity: hidden ? 0 : 1 }}
      transition={FADE}
    >
      {/* Rounded cloth: a dark rim on each edge and a soft highlight. */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.28),rgba(255,255,255,0.14)_28%,rgba(255,255,255,0)_55%,rgba(0,0,0,0.22))]" />
      <span className="pointer-events-none absolute inset-x-0 top-2 h-px bg-current opacity-30" />
      <span className="pointer-events-none absolute inset-x-0 bottom-2 h-px bg-current opacity-30" />
      {book.author ? (
        <span className="relative max-h-[30%] min-h-0 overflow-hidden text-ellipsis whitespace-nowrap font-sans text-[9px] uppercase tracking-[0.14em] opacity-75 [writing-mode:vertical-rl]">
          {book.author}
        </span>
      ) : null}
      <span className="relative mt-3 min-h-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[13px] leading-none [writing-mode:vertical-rl]">
        {book.title}
      </span>
      <Shade opacity={shade} />
    </motion.span>
  );
}

function Cover({
  book,
  text,
  thickness,
  width,
  height,
  reduce,
  open,
  shade,
}: {
  book: BookshelfBook;
  text: string;
  thickness: number;
  width: number;
  height: number;
  reduce: boolean;
  open: boolean;
  shade: MotionValue<number> | null;
}) {
  // Closed, the cover runs back from the spine's right edge into the shelf,
  // facing right: books left of centre show it, books right of centre hide
  // its back face. With reduced motion the book never turns: the cover lies
  // flat and fades in over the spine instead.
  const flat = reduce;
  return (
    <motion.span
      className={cn(
        "absolute top-0 left-0 flex flex-col justify-between overflow-hidden rounded-r-[3px] rounded-l-[2px] p-5 text-left [backface-visibility:hidden]",
        FOCUS_RING,
      )}
      style={{
        width,
        height,
        backgroundColor: book.color,
        color: text,
        transformOrigin: "0 50%",
        transform: flat ? "none" : `translateX(${thickness}px) rotateY(90deg)`,
      }}
      initial={false}
      animate={{ opacity: flat && !open ? 0 : 1 }}
      transition={FADE}
    >
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <>
          <span className="relative line-clamp-4 font-serif text-xl leading-tight">
            {book.title}
          </span>
          {book.author ? (
            <span className="relative font-sans text-[10px] uppercase tracking-[0.14em] opacity-75">
              {book.author}
            </span>
          ) : null}
        </>
      )}
      {/* Hinge: the board folds into the spine a few px in from the edge. */}
      <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.35),rgba(255,255,255,0.1)_3%,rgba(0,0,0,0.12)_5%,rgba(0,0,0,0)_9%)]" />
      <Shade opacity={shade} />
    </motion.span>
  );
}
