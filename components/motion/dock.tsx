"use client";

import {
  motion,
  useMotionValue,
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
import { cn } from "@/lib/utils";

type DockContext = {
  mouseX: MotionValue<number>;
  size: number;
  magnification: number;
  distance: number;
  spring: SpringOptions;
  pillLayoutId: string;
};

const DEFAULT_SPRING: SpringOptions = {
  stiffness: 320,
  damping: 22,
  mass: 0.4,
};
const PILL_SPRING: SpringOptions = { stiffness: 360, damping: 32, mass: 0.6 };

export interface DockProps {
  children: ReactNode;
  className?: string;
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
  spring = DEFAULT_SPRING,
  className,
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const pillLayoutId = useId();
  const ctx: DockContext = {
    mouseX,
    size,
    magnification,
    distance,
    spring,
    pillLayoutId,
  };

  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.clientX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "inline-flex h-auto items-end gap-1.5 rounded-2xl px-2 py-1 glass-strong",
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
  const ref = useRef<HTMLDivElement>(null);
  const fallback = useMotionValue(Infinity);
  const mouseX = __dock?.mouseX ?? fallback;
  const size = __dock?.size ?? 44;
  const magnification = __dock?.magnification ?? 44;
  const distance = __dock?.distance ?? 120;
  const spring = __dock?.spring ?? DEFAULT_SPRING;
  const pillLayoutId = __dock?.pillLayoutId ?? "dock-pill";

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

  return (
    <motion.div
      ref={ref}
      onClick={onClick}
      aria-label={rest["aria-label"]}
      style={{ width, height: width }}
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full text-(--color-fg)",
        className,
      )}
    >
      {active ? (
        <motion.span
          layoutId={pillLayoutId}
          transition={PILL_SPRING}
          className="absolute inset-0.5 -z-10 rounded-xl bg-(--color-fg)/5"
        />
      ) : null}
      {children}
    </motion.div>
  );
}

export function DockSeparator({ className }: { className?: string }) {
  return (
    <span
      className={cn("mx-1 h-6 w-px self-center bg-(--color-border)", className)}
    />
  );
}
