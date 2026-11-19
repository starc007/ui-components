"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type KeyboardEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { EASE_OUT } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
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
  /** Override any built-in string. */
  labels?: Partial<BookshelfMessages>;
  className?: string;
}

// A book turning in 3D reads as a physical object, so it gets a little more
// time than a UI transition. EASE_OUT front-loads most of the turn.
const TURN = { duration: 0.5, ease: EASE_OUT };
const INSTANT = { duration: 0 };
const FADE = { duration: 0.2, ease: EASE_OUT };

const DEFAULT_THICKNESS = 40;
// How far the open book comes toward the viewer, past the spines.
const PULL = 40;
const HOVER_LIFT = 10;
const PERSPECTIVE = 1600;

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

export function Bookshelf({
  books,
  value,
  defaultValue = null,
  onValueChange,
  height = 300,
  coverRatio = 0.68,
  gap = 3,
  openGap = 16,
  labels,
  className,
}: BookshelfProps) {
  const t = useMessages("bookshelf", bookshelfMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const canHover = useHoverCapable();

  const [uncontrolled, setUncontrolled] = useState<string | null>(defaultValue);
  const openId = value !== undefined ? value : uncontrolled;
  const openIndex = books.findIndex((b) => b.id === openId);

  // The book that just closed keeps painting above its neighbours until its
  // cover has turned back, so it never slips under them mid-turn.
  const [closingId, setClosingId] = useState<string | null>(null);

  const setOpen = useCallback(
    (id: string | null) => {
      if (id === openId) return;
      setClosingId(openId);
      if (value === undefined) setUncontrolled(id);
      onValueChange?.(id);
    },
    [openId, value, onValueChange],
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

  let rowX = -shelf.width / 2;
  if (openIndex >= 0 && shelf.width > visible) {
    const center = shelf.slots[openIndex] + cover / 2;
    rowX = Math.min(-visible / 2, Math.max(visible / 2 - shelf.width, -center));
  }

  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    const index = buttonsRef.current.indexOf(
      e.target as HTMLButtonElement,
    );
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
    next = Math.max(0, Math.min(books.length - 1, next));
    buttonsRef.current[next]?.focus();
    // Browsing with a book open keeps one open, like pulling the next one out.
    if (openId !== null) setOpen(books[next].id);
  };

  const [hoverId, setHoverId] = useState<string | null>(null);
  const move = reduce ? INSTANT : TURN;
  const scaledHeight = height * fit;

  return (
    <div
      ref={frameRef}
      className={cn(
        "relative w-full [clip-path:inset(0)]",
        // Books cut by the edge fade out, so the row reads as continuing.
        canOverflow &&
          "[mask-image:linear-gradient(90deg,transparent,#000_28px,#000_calc(100%-28px),transparent)]",
        className,
      )}
      // Room above and below for the open book coming forward and the hover lift.
      style={{ height: scaledHeight + 64 * fit }}
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
          {books.map((book, i) => {
            const open = i === openIndex;
            const thickness = book.thickness ?? DEFAULT_THICKNESS;
            const text = book.textColor ?? readableText(book.color);
            const turn = (cover - thickness) / 2;
            const lifted =
              canHover && !reduce && !open && hoverId === book.id;
            const name = book.author
              ? t("bookWithAuthor", { title: book.title, author: book.author })
              : t("book", { title: book.title });

            return (
              <motion.li
                key={book.id}
                className="absolute top-0 left-0 [transform-style:preserve-3d]"
                style={{
                  width: thickness,
                  height,
                  zIndex: open ? 3 : book.id === closingId ? 2 : 1,
                }}
                initial={false}
                animate={{ x: rowX + shelf.slots[i] }}
                transition={move}
              >
                <button
                  ref={(el) => {
                    buttonsRef.current[i] = el;
                  }}
                  type="button"
                  aria-label={name}
                  aria-pressed={open}
                  onClick={() => setOpen(open ? null : book.id)}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setHoverId(book.id);
                  }}
                  onPointerLeave={() =>
                    setHoverId((id) => (id === book.id ? null : id))
                  }
                  className="group absolute inset-0 cursor-pointer border-0 bg-transparent p-0 outline-none [transform-style:preserve-3d]"
                >
                  <motion.span
                    aria-hidden
                    className="absolute top-0 left-0 block [transform-style:preserve-3d]"
                    style={{
                      width: thickness,
                      height,
                      // Turn around the middle of the book's volume, so it
                      // spins in place as it comes off the shelf.
                      transformOrigin: `${thickness / 2}px 50% ${-cover / 2}px`,
                    }}
                    initial={false}
                    animate={{
                      x: open && !reduce ? turn : 0,
                      y: lifted ? -HOVER_LIFT : 0,
                      z: open && !reduce ? turn + PULL : 0,
                      rotateY: open && !reduce ? -90 : 0,
                    }}
                    transition={move}
                    onAnimationComplete={() => {
                      if (!open && book.id === closingId) setClosingId(null);
                    }}
                  >
                    <Spine
                      book={book}
                      text={text}
                      thickness={thickness}
                      height={height}
                      hidden={open && reduce}
                    />
                    <Cover
                      book={book}
                      text={text}
                      thickness={thickness}
                      width={cover}
                      height={height}
                      reduce={reduce}
                      open={open}
                    />
                  </motion.span>
                </button>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function Spine({
  book,
  text,
  thickness,
  height,
  hidden,
}: {
  book: BookshelfBook;
  text: string;
  thickness: number;
  height: number;
  hidden: boolean;
}) {
  return (
    <motion.span
      className={cn(
        "absolute top-0 left-0 flex flex-col items-center overflow-hidden rounded-[2px] py-3 [backface-visibility:hidden]",
        "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring",
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
}: {
  book: BookshelfBook;
  text: string;
  thickness: number;
  width: number;
  height: number;
  reduce: boolean;
  open: boolean;
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
        "group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ring",
      )}
      style={{
        width,
        height,
        backgroundColor: book.color,
        color: text,
        transformOrigin: "0 50%",
        transform: flat
          ? "none"
          : `translateX(${thickness}px) rotateY(90deg)`,
        boxShadow: "0 18px 40px -18px rgba(0,0,0,0.45)",
        // A hidden flat cover would still catch clicks meant for neighbours.
        pointerEvents: flat && !open ? "none" : undefined,
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
    </motion.span>
  );
}
