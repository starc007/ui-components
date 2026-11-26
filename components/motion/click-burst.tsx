"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithRef,
  type MouseEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface ClickBurstProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
  /** The element to burst from: a checkbox, a button, a card. Its own clicks still work. */
  children: ReactNode;
  /** Whether a click bursts right now, e.g. only when a task is being checked, not unchecked. Default: true */
  enabled?: boolean;
  /** Where the burst starts: the click point, or the wrapper's centre. Keyboard clicks always use the centre. Default: "pointer" */
  origin?: "pointer" | "center";
  /** How many pieces fly out. Default: 12 */
  count?: number;
  /** How far the pieces fly, in px. Default: 34 */
  spread?: number;
  /** Piece colours, any CSS colour. Default: green, amber, sky and the theme's primary colour */
  colors?: string[];
}

type Piece = {
  id: number;
  x: number;
  y: number;
  star: boolean;
  size: number;
  spin: number;
  color: string;
  delay: number;
};

type Burst = { id: number; x: number; y: number; pieces: Piece[] };

const COLORS = ["#10b981", "#f59e0b", "#38bdf8", "var(--primary)"];
// Out fast and fading as they slow: a pop, not a drift.
const FLY = { duration: 0.6, ease: EASE_OUT } as const;
// A burst is removed once its slowest piece has finished.
const LIFETIME_MS = 760;
// A four-point star with concave sides, drawn in a 24 box.
const STAR = "M12 0C12.6 7.4 16.6 11.4 24 12C16.6 12.6 12.6 16.6 12 24C11.4 16.6 7.4 12.6 0 12C7.4 11.4 11.4 7.4 12 0Z";

function makePieces(count: number, spread: number, colors: string[]): Piece[] {
  return Array.from({ length: count }, (_, index) => {
    // Even angles with a little jitter, so the burst is round but not mechanical.
    const angle = (index / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const distance = spread * (0.55 + Math.random() * 0.55);
    const star = index % 3 !== 2;
    return {
      id: index,
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      star,
      size: star ? 7 + Math.random() * 4 : 3 + Math.random() * 1.5,
      spin: (Math.random() - 0.5) * 160,
      color: colors[index % colors.length],
      delay: Math.random() * 0.06,
    };
  });
}

/**
 * Wraps any clickable element and throws a small burst of stars and dots from
 * the point you click: a moment of delight on a check, a like or a save.
 * The child keeps its own behaviour; the burst is drawn on top, takes no
 * pointer events and is hidden from assistive technology. Nothing is drawn
 * with reduced motion.
 */
export function ClickBurst({
  children,
  enabled = true,
  origin = "pointer",
  count = 12,
  spread = 34,
  colors = COLORS,
  className,
  onClick,
  ...props
}: ClickBurstProps) {
  const reduce = useReducedMotion() ?? false;
  const [bursts, setBursts] = useState<Burst[]>([]);
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timer of timers.current) window.clearTimeout(timer);
    },
    [],
  );

  const fire = (event: MouseEvent<HTMLSpanElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    // A click from the keyboard has no pointer position (detail 0).
    const fromPointer = origin === "pointer" && event.detail > 0;
    const x = fromPointer ? event.clientX - box.left : box.width / 2;
    const y = fromPointer ? event.clientY - box.top : box.height / 2;
    const id = nextId.current++;
    setBursts((current) => [...current, { id, x, y, pieces: makePieces(count, spread, colors) }]);
    timers.current.push(
      window.setTimeout(() => {
        setBursts((current) => current.filter((burst) => burst.id !== id));
      }, LIFETIME_MS),
    );
  };

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: listens to clicks that bubble from the interactive child; it is not a control itself
    // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard activation of the child arrives here as a click too
    <span
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (enabled && !reduce && !event.defaultPrevented) fire(event);
      }}
      className={cn("relative inline-flex", className)}
    >
      {children}
      <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-visible">
        {bursts.map((burst) => (
          <span key={burst.id} className="absolute" style={{ left: burst.x, top: burst.y }}>
            {burst.pieces.map((piece) => (
              <motion.span
                key={piece.id}
                className="absolute"
                style={{
                  width: piece.size,
                  height: piece.size,
                  left: -piece.size / 2,
                  top: -piece.size / 2,
                  color: piece.color,
                }}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 0, rotate: 0 }}
                animate={{
                  x: piece.x,
                  y: piece.y,
                  scale: [0.4, 1, 0.5],
                  opacity: [0, 1, 0],
                  rotate: piece.spin,
                }}
                transition={{ ...FLY, delay: piece.delay }}
              >
                {piece.star ? (
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="size-full" fill="currentColor">
                    <path d={STAR} />
                  </svg>
                ) : (
                  <span className="block size-full rounded-full bg-current" />
                )}
              </motion.span>
            ))}
          </span>
        ))}
      </span>
    </span>
  );
}
