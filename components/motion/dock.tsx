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
  Children,
  cloneElement,
  isValidElement,
  useId,
  useRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

type DockContext = {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
  spring: SpringOptions;
  pillLayoutId: string;
  /** False on touch devices or reduced motion — items stay at base size. */
  enabled: boolean;
};

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
  const ctx: DockContext = {
    mouseX,
    size,
    magnification,
    distance,
    spring,
    pillLayoutId,
    enabled,
  };

  return (
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
      {Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        const props = (child.props ?? {}) as { __dock?: DockContext };
        if ("__dock" in props) {
          return cloneElement(child as ReactElement<{ __dock?: DockContext }>, {
            __dock: ctx,
          });
        }
        return child;
      })}
    </motion.div>
  );
}

export interface DockItemProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
  "aria-label"?: string;
  __dock?: DockContext;
}

export function DockItem({
  children,
  className,
  onClick,
  active,
  __dock,
  ...rest
}: DockItemProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const fallback = useMotionValue(Infinity);
  const mouseX = __dock?.mouseX ?? fallback;
  const size = __dock?.size ?? 44;
  const magnification = __dock?.magnification ?? 44;
  const distance = __dock?.distance ?? 120;
  const spring = __dock?.spring ?? MAGNIFY_SPRING;
  const pillLayoutId = __dock?.pillLayoutId ?? "dock-pill";
  const enabled = __dock?.enabled ?? true;

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

  // Keyboard parity: magnify the focused item the same way a hovered one grows.
  const onFocus = () => {
    if (!enabled) return;
    const rect = ref.current?.getBoundingClientRect();
    if (rect) mouseX.set(rect.x + rect.width / 2);
  };
  const onBlur = () => mouseX.set(Infinity);

  return (
    <motion.button
      ref={ref}
      type="button"
      onClick={onClick}
      onFocus={onFocus}
      onBlur={onBlur}
      aria-label={rest["aria-label"]}
      aria-current={active ? "true" : undefined}
      style={{ width, height: width }}
      className={cn(
        "relative flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-0 text-foreground outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={pillLayoutId}
          transition={SPRING_LAYOUT}
          className="absolute inset-0.5 -z-10 rounded-xl bg-primary/5"
        />
      ) : null}
      {children}
    </motion.button>
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
