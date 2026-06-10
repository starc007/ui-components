"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "motion/react";
import {
  createContext,
  useContext,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

type DockContextValue = {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
  spring: SpringOptions;
  pillLayoutId: string;
  /** False on touch devices or reduced motion — items stay at base size. */
  enabled: boolean;
};

const DockContext = createContext<DockContextValue | null>(null);

// Purpose-tuned for cursor-proximity magnification — light mass so neighbours
// settle quickly as the cursor sweeps across the dock.
const MAGNIFY_SPRING: SpringOptions = {
  stiffness: 320,
  damping: 22,
  mass: 0.4,
};

export interface DockProps {
  children: ReactNode;
  className?: string;
  /** Accessible name for the dock group. */
  "aria-label"?: string;
  /** Base size of each item in px. */
  size?: number;
  /** Max size an item grows to when cursor is directly over it. */
  magnification?: number;
  /** Distance (px) over which magnification interpolates. */
  distance?: number;
  /** Spring options for the magnification transition. */
  spring?: SpringOptions;
}

export function Dock({
  children,
  size = 36,
  magnification = 56,
  distance = 110,
  spring = MAGNIFY_SPRING,
  className,
  "aria-label": ariaLabel,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const pillLayoutId = useId();
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const enabled = !reduce && canHover;
  const ctx = useMemo<DockContextValue>(
    () => ({
      mouseX,
      size,
      magnification,
      distance,
      spring,
      pillLayoutId,
      enabled,
    }),
    [mouseX, size, magnification, distance, spring, pillLayoutId, enabled],
  );

  return (
    <DockContext.Provider value={ctx}>
      <motion.div
        role="group"
        aria-label={ariaLabel}
        onMouseMove={(e) => enabled && mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className={cn(
          "inline-flex h-auto items-end gap-1.5 rounded-2xl border border-border bg-card/80 px-2 py-1 shadow-2xl backdrop-blur-xl",
          className,
        )}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

export interface DockItemProps {
  children: ReactNode;
  className?: string;
  /** When set, the item renders as a <button>. Omit when children carry their own link or button. */
  onClick?: () => void;
  active?: boolean;
  "aria-label"?: string;
}

export function DockItem({
  children,
  className,
  onClick,
  active,
  ...rest
}: DockItemProps) {
  const ref = useRef<HTMLElement | null>(null);
  const fallback = useMotionValue(Infinity);
  const dock = useContext(DockContext);
  const mouseX = dock?.mouseX ?? fallback;
  const size = dock?.size ?? 44;
  const magnification = dock?.magnification ?? 44;
  const distance = dock?.distance ?? 120;
  const spring = dock?.spring ?? MAGNIFY_SPRING;
  const pillLayoutId = dock?.pillLayoutId ?? "dock-pill";
  const enabled = dock?.enabled ?? true;

  const distanceCalc = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: size };
    return val - rect.x - rect.width / 2;
  });

  const widthRaw = useTransform(
    distanceCalc,
    [-distance, 0, distance],
    [size, magnification, size],
  );
  const width = useSpring(widthRaw, spring);

  // Keyboard parity: magnify the focused item the same way a hovered one
  // grows. Focus bubbles, so this also fires for links/buttons inside.
  const onFocus = () => {
    if (!enabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) mouseX.set(rect.x + rect.width / 2);
  };
  const onBlur = () => mouseX.set(Infinity);

  const pill = active ? (
    <motion.span
      layoutId={pillLayoutId}
      transition={SPRING_LAYOUT}
      className="absolute inset-0.5 -z-10 rounded-xl bg-primary/5"
    />
  ) : null;
  const setRef = (el: HTMLElement | null) => {
    ref.current = el;
  };
  const sharedStyle = { width, height: width };
  const sharedClass = cn(
    "relative flex shrink-0 items-center justify-center rounded-full text-foreground",
    className,
  );

  if (onClick) {
    return (
      <motion.button
        ref={setRef}
        type="button"
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        aria-label={rest["aria-label"]}
        aria-pressed={active}
        style={sharedStyle}
        className={cn(
          sharedClass,
          "cursor-pointer border-0 bg-transparent p-0 outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        )}
      >
        {pill}
        {children}
      </motion.button>
    );
  }

  return (
    <motion.div
      ref={setRef}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={rest["aria-label"]}
      style={sharedStyle}
      className={sharedClass}
    >
      {pill}
      {children}
    </motion.div>
  );
}

export function DockSeparator({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("mx-1 h-6 w-px self-center bg-border", className)}
    />
  );
}
