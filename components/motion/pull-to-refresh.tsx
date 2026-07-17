"use client";

import {
  AnimatePresence,
  animate,
  type MotionValue,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  EASE_IN_OUT,
  EASE_OUT,
  SPRING_PANEL,
  SPRING_SWAP,
} from "@/lib/ease";
import { cn } from "@/lib/utils";

export type PullToRefreshStatus =
  | "idle"
  | "pulling"
  | "ready"
  | "refreshing";

export interface PullToRefreshProps {
  /** Runs after the user pulls beyond the threshold and releases. */
  onRefresh: () => void | Promise<void>;
  children: ReactNode;
  /** Keeps the indicator active while an externally managed refresh runs. */
  refreshing?: boolean;
  disabled?: boolean;
  /** Resisted pull distance in pixels required to refresh. */
  threshold?: number;
  /** Maximum resisted pull distance in pixels. */
  maxPull?: number;
  /** Content offset in pixels while refreshing. */
  holdDistance?: number;
  pullingLabel?: ReactNode;
  releaseLabel?: ReactNode;
  refreshingLabel?: ReactNode;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
  indicatorClassName?: string;
}

type Gesture = {
  active: boolean;
  startX: number;
  startY: number;
  pointerId: number | null;
};

const EMPTY_GESTURE: Gesture = {
  active: false,
  startX: 0,
  startY: 0,
  pointerId: null,
};

// This character needs a compact repeating rhythm rather than a settling
// spring: a small orbit and blink that read as activity without feeling busy.
const CHARACTER_LOOP = {
  duration: 0.9,
  ease: EASE_IN_OUT,
  repeat: Number.POSITIVE_INFINITY,
} as const;
const CALM_PULSE = {
  duration: 1.2,
  ease: EASE_IN_OUT,
  repeat: Number.POSITIVE_INFINITY,
} as const;
const LABEL_SWAP = { duration: 0.16, ease: EASE_OUT } as const;

function resistedDistance(distance: number, maxPull: number) {
  return maxPull * (1 - Math.exp(-Math.max(0, distance) / maxPull));
}

function RefreshBuddy({
  progress,
  status,
  reduce,
}: {
  progress: MotionValue<number>;
  status: PullToRefreshStatus;
  reduce: boolean;
}) {
  const lift = useTransform(progress, [0, 1], [-7, 0]);
  const tilt = useTransform(progress, [0, 1], [-10, 0]);
  const stretch = useTransform(progress, [0, 0.55, 1], [0.68, 1.1, 0.92]);
  const ready = status === "ready";
  const refreshing = status === "refreshing";

  return (
    <motion.span
      style={reduce ? undefined : { y: lift, rotate: tilt, scaleY: stretch }}
      className="block h-9 w-9 origin-bottom"
    >
      <motion.svg
        aria-hidden="true"
        viewBox="0 0 36 36"
        style={{ opacity: 1 }}
        className="h-full w-full overflow-visible"
        animate={
          refreshing
            ? reduce
              ? { opacity: [0.55, 1, 0.55] }
              : { y: [0, -2, 0], rotate: [-3, 3, -3] }
            : reduce
              ? { opacity: 1 }
              : { y: 0, rotate: 0, scale: ready ? 1.08 : 1 }
        }
        transition={refreshing ? (reduce ? CALM_PULSE : CHARACTER_LOOP) : SPRING_SWAP}
      >
        <motion.g
          style={{ transformOrigin: "18px 18px" }}
          animate={
            refreshing && !reduce
              ? { rotate: [0, 360] }
              : reduce
                ? undefined
                : { rotate: ready ? 0 : -35 }
          }
          transition={refreshing ? (reduce ? CALM_PULSE : CHARACTER_LOOP) : SPRING_SWAP}
          className={cn(
            "transition-opacity duration-150",
            ready || refreshing ? "opacity-100" : "opacity-0",
          )}
        >
          <path
            d="M18 2.5a15.5 15.5 0 0 1 12.7 6.6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="text-muted-foreground"
          />
          <circle cx="31.3" cy="10.2" r="2.2" className="fill-foreground" />
        </motion.g>

        <rect
          x="7"
          y="7"
          width="22"
          height="22"
          rx="9"
          className="fill-foreground"
        />

        <motion.g
          style={{ opacity: 1, transformOrigin: "18px 16px" }}
          animate={
            refreshing && !reduce
              ? { scaleY: [1, 1, 0.15, 1, 1] }
              : reduce
                ? { opacity: 1 }
                : { scaleY: ready ? 1.18 : 1 }
          }
          transition={refreshing && !reduce ? CHARACTER_LOOP : SPRING_SWAP}
        >
          <circle cx="14.2" cy="16" r="1.45" className="fill-background" />
          <circle cx="21.8" cy="16" r="1.45" className="fill-background" />
        </motion.g>

        <path
          d="M14.5 21h7"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn(
            "text-background transition-opacity duration-150",
            ready || refreshing ? "opacity-0" : "opacity-100",
          )}
        />
        <path
          d="M14 20.5c1 2.4 7 2.4 8 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          className={cn(
            "text-background transition-opacity duration-150",
            ready ? "opacity-100" : "opacity-0",
          )}
        />
        <circle
          cx="18"
          cy="21"
          r="1.6"
          className={cn(
            "fill-background transition-opacity duration-150",
            refreshing ? "opacity-100" : "opacity-0",
          )}
        />
      </motion.svg>
    </motion.span>
  );
}

export function PullToRefresh({
  onRefresh,
  children,
  refreshing = false,
  disabled = false,
  threshold = 76,
  maxPull = 132,
  holdDistance = 68,
  pullingLabel = "Pull to refresh",
  releaseLabel = "Release to refresh",
  refreshingLabel = "Refreshing",
  ariaLabel = "Refreshable content",
  className,
  contentClassName,
  indicatorClassName,
}: PullToRefreshProps) {
  const rootRef = useRef<HTMLElement>(null);
  const gestureRef = useRef<Gesture>({ ...EMPTY_GESTURE });
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const statusRef = useRef<PullToRefreshStatus>("idle");
  const disabledRef = useRef(disabled);
  const externalRefreshingRef = useRef(refreshing);
  const refreshingRef = useRef(refreshing);
  const [status, setStatusState] = useState<PullToRefreshStatus>("idle");
  const [internalRefreshing, setInternalRefreshing] = useState(false);
  const reduce = useReducedMotion();
  const pullThreshold = Math.max(24, threshold);
  const pullLimit = Math.max(maxPull, pullThreshold + 24);
  const restingDistance = Math.min(
    Math.max(0, holdDistance),
    pullThreshold,
  );
  const y = useMotionValue(0);
  const progress = useTransform(y, [0, pullThreshold], [0, 1]);
  const indicatorOpacity = useTransform(
    y,
    [0, 10, pullThreshold],
    [0, 0.45, 1],
  );
  const indicatorScale = useTransform(y, [0, pullThreshold], [0.86, 1]);
  const isRefreshing = refreshing || internalRefreshing;

  disabledRef.current = disabled;
  externalRefreshingRef.current = refreshing;
  refreshingRef.current = isRefreshing;

  const setStatus = useCallback((next: PullToRefreshStatus) => {
    if (statusRef.current === next) return;
    statusRef.current = next;
    setStatusState(next);
  }, []);

  const settle = useCallback(
    (target: number) => {
      animationRef.current?.stop();

      if (reduce) {
        y.set(target);
        return;
      }

      animationRef.current = animate(y, target, SPRING_PANEL);
    },
    [reduce, y],
  );

  const updatePull = useCallback(
    (distance: number) => {
      if (disabledRef.current || refreshingRef.current) return;
      animationRef.current?.stop();

      const next = resistedDistance(distance, pullLimit);
      y.set(next);
      setStatus(next >= pullThreshold ? "ready" : "pulling");
    },
    [pullLimit, pullThreshold, setStatus, y],
  );

  const runRefresh = useCallback(async () => {
    if (disabledRef.current || refreshingRef.current) return;

    setInternalRefreshing(true);
    setStatus("refreshing");
    settle(restingDistance);

    try {
      await onRefresh();
    } finally {
      setInternalRefreshing(false);

      // A synchronous refresh can resolve before React commits the temporary
      // internal state, so release here instead of relying only on the effect.
      if (!externalRefreshingRef.current) {
        setStatus("idle");
        settle(0);
      }
    }
  }, [onRefresh, restingDistance, setStatus, settle]);

  const finishPull = useCallback(() => {
    const shouldRefresh =
      y.get() >= pullThreshold &&
      !disabledRef.current &&
      !refreshingRef.current;

    gestureRef.current = { ...EMPTY_GESTURE };

    if (shouldRefresh) {
      void runRefresh();
      return;
    }

    setStatus("idle");
    settle(0);
  }, [pullThreshold, runRefresh, setStatus, settle, y]);

  useEffect(() => {
    if (isRefreshing) {
      setStatus("refreshing");
      settle(restingDistance);
      return;
    }

    if (statusRef.current === "refreshing") {
      setStatus("idle");
      settle(0);
    }
  }, [isRefreshing, restingDistance, setStatus, settle]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const onTouchStart = (event: TouchEvent) => {
      if (
        event.touches.length !== 1 ||
        root.scrollTop > 0 ||
        disabledRef.current ||
        refreshingRef.current
      ) {
        return;
      }

      const touch = event.touches[0];
      gestureRef.current = {
        active: true,
        startX: touch.clientX,
        startY: touch.clientY,
        pointerId: null,
      };
    };

    const onTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;
      const touch = event.touches[0];
      if (!gesture.active || !touch) return;

      const deltaX = touch.clientX - gesture.startX;
      const deltaY = touch.clientY - gesture.startY;

      if (root.scrollTop > 0 || deltaY < 0) {
        gestureRef.current = { ...EMPTY_GESTURE };
        return;
      }

      if (Math.abs(deltaX) > deltaY) return;

      event.preventDefault();
      updatePull(deltaY);
    };

    const onTouchEnd = () => {
      if (gestureRef.current.active) finishPull();
    };

    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd);
    root.addEventListener("touchcancel", onTouchEnd);

    return () => {
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      root.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [finishPull, updatePull]);

  useEffect(() => {
    return () => animationRef.current?.stop();
  }, []);

  const startMousePull = (event: ReactPointerEvent<HTMLElement>) => {
    if (
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      event.currentTarget.scrollTop > 0 ||
      disabled ||
      isRefreshing
    ) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    gestureRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      pointerId: event.pointerId,
    };
  };

  const moveMousePull = (event: ReactPointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture.active || gesture.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - gesture.startX;
    const deltaY = event.clientY - gesture.startY;
    if (deltaY < 0 || Math.abs(deltaX) > deltaY) return;

    event.preventDefault();
    updatePull(deltaY);
  };

  const label =
    status === "refreshing"
      ? refreshingLabel
      : status === "ready"
        ? releaseLabel
        : pullingLabel;

  return (
    <section
      ref={rootRef}
      aria-label={ariaLabel}
      aria-busy={isRefreshing}
      data-state={status}
      data-disabled={disabled || undefined}
      onPointerDown={startMousePull}
      onPointerMove={moveMousePull}
      onPointerUp={(event) => {
        if (gestureRef.current.pointerId === event.pointerId) finishPull();
      }}
      onPointerCancel={(event) => {
        if (gestureRef.current.pointerId === event.pointerId) finishPull();
      }}
      className={cn(
        "relative w-full overflow-y-auto overscroll-contain bg-background",
        status === "pulling" || status === "ready"
          ? "cursor-grabbing select-none"
          : "cursor-grab",
        (disabled || isRefreshing) && "cursor-default",
        className,
      )}
    >
      <motion.div
        aria-live="polite"
        aria-atomic="true"
        style={
          reduce
            ? { opacity: indicatorOpacity }
            : { opacity: indicatorOpacity, scale: indicatorScale }
        }
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 z-20 flex h-[4.25rem] flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-background via-background/95 to-transparent text-[11px] font-medium text-muted-foreground",
          indicatorClassName,
        )}
      >
        <RefreshBuddy
          progress={progress}
          status={status}
          reduce={Boolean(reduce)}
        />
        <span className="relative h-4 min-w-24 text-center">
          <AnimatePresence initial={false} mode="wait">
            <motion.span
              key={status}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 3 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -3 }}
              transition={LABEL_SWAP}
              className="absolute inset-x-0 whitespace-nowrap"
            >
              {label}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>

      <motion.div
        style={reduce ? undefined : { y }}
        className={cn(
          "relative z-10 min-h-full bg-inherit will-change-transform",
          contentClassName,
        )}
      >
        {children}
      </motion.div>
    </section>
  );
}
