"use client";

import { Ellipsis } from "lucide-react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { TOUCH_GESTURE_CONTENT_CLASS } from "@/lib/touch";
import { cn } from "@/lib/utils";

export type SwipeSide = "left" | "right";

export type SwipeableListValue = {
  id: string;
  side: SwipeSide;
};

export type SwipeActionTone =
  | "neutral"
  | "primary"
  | "success"
  | "warning"
  | "danger";

export type SwipeAction = {
  id: string;
  label: ReactNode;
  icon: ReactNode;
  tone?: SwipeActionTone;
  disabled?: boolean;
  onClick?: (item: SwipeableListItem) => void;
};

export type SwipeableListItem = {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  leading?: ReactNode;
  content?: ReactNode;
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  disabled?: boolean;
};

export type SwipeableListClassNames = {
  root?: string;
  item?: string;
  rail?: string;
  action?: string;
  surface?: string;
  leading?: string;
  content?: string;
  title?: string;
  description?: string;
  meta?: string;
};

export interface SwipeableListProps {
  items: SwipeableListItem[];
  value?: SwipeableListValue | null;
  defaultValue?: SwipeableListValue | null;
  onValueChange?: (value: SwipeableListValue | null) => void;
  onAction?: (payload: {
    item: SwipeableListItem;
    action: SwipeAction;
    side: SwipeSide;
  }) => void;
  actionWidth?: number;
  revealThreshold?: number;
  closeOnAction?: boolean;
  className?: string;
  classNames?: SwipeableListClassNames;
  renderItem?: (item: SwipeableListItem) => ReactNode;
}

// Distance-based release spring keeps short rebounds and full reveals feeling
// equally direct, closer to native mobile list interactions.
const ROW_SETTLE = {
  type: "spring",
  stiffness: 560,
  damping: 48,
  mass: 0.82,
  restDelta: 0.5,
  restSpeed: 8,
} as const;
const OPEN_DISTANCE_RATIO = 0.46;
const CLOSE_DISTANCE_RATIO = 0.72;
const OPEN_VELOCITY = 720;
const CLOSE_VELOCITY = 320;
const FLING_DISTANCE = 14;
const RELEASE_VELOCITY_LIMIT = 1500;

const ACTION_TONE_CLASS: Record<SwipeActionTone, string> = {
  neutral: "text-muted-foreground group-hover:text-foreground",
  primary: "text-foreground",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

function useControllableSwipeValue({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: SwipeableListValue | null;
  defaultValue?: SwipeableListValue | null;
  onValueChange?: (value: SwipeableListValue | null) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? null);
  const isControlled = value !== undefined;
  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (next: SwipeableListValue | null) => {
      if (!isControlled) {
        setInternalValue(next);
      }

      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  return [currentValue, setValue] as const;
}

function isActionableSide(value: number, sideWidth: number) {
  return sideWidth > 0 && Math.abs(value) > 0;
}

function clampReleaseVelocity(velocity: number) {
  return Math.max(
    -RELEASE_VELOCITY_LIMIT,
    Math.min(RELEASE_VELOCITY_LIMIT, velocity),
  );
}

function SwipeActionButton({
  action,
  actionWidth,
  side,
  focusable,
  onAction,
  className,
}: {
  action: SwipeAction;
  actionWidth: number;
  side: SwipeSide;
  focusable: boolean;
  onAction: (action: SwipeAction, side: SwipeSide) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      disabled={action.disabled}
      tabIndex={focusable ? 0 : -1}
      aria-label={typeof action.label === "string" ? action.label : undefined}
      onClick={() => onAction(action, side)}
      className={cn(
        "group flex h-full shrink-0 items-center justify-center outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      style={{ width: actionWidth }}
    >
      <span
        className={cn(
          "grid h-9 w-9 place-items-center rounded-full transition-[background-color,color,transform] duration-150 group-hover:bg-background group-active:scale-95",
          ACTION_TONE_CLASS[action.tone ?? "neutral"],
        )}
      >
        {action.icon}
      </span>
      <span className="sr-only">{action.label}</span>
    </button>
  );
}

function SwipeableListRow({
  item,
  actionWidth,
  revealThreshold,
  openValue,
  setOpenValue,
  closeOnAction,
  onAction,
  classNames,
  renderItem,
}: {
  item: SwipeableListItem;
  actionWidth: number;
  revealThreshold: number;
  openValue: SwipeableListValue | null;
  setOpenValue: (value: SwipeableListValue | null) => void;
  closeOnAction: boolean;
  onAction?: SwipeableListProps["onAction"];
  classNames?: SwipeableListClassNames;
  renderItem?: (item: SwipeableListItem) => ReactNode;
}) {
  const reduce = useReducedMotion();
  const railId = useId();
  const railRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  // Set when the keyboard opens a side, so focus follows into its actions once
  // the rail stops being inert.
  const focusActions = useRef(false);
  const x = useMotionValue(0);
  const animationRef = useRef<{ stop: () => void } | null>(null);
  const commandedTargetRef = useRef(0);
  const leftActions = item.leftActions ?? [];
  const rightActions = item.rightActions ?? [];
  const leftWidth = leftActions.length * actionWidth;
  const rightWidth = rightActions.length * actionWidth;
  const openSide = openValue?.id === item.id ? openValue.side : null;
  const targetX =
    openSide === "left" ? leftWidth : openSide === "right" ? -rightWidth : 0;

  const settleX = useCallback(
    (nextX: number, velocity = 0) => {
      commandedTargetRef.current = nextX;
      animationRef.current?.stop();

      if (reduce) {
        x.set(nextX);
        return;
      }

      animationRef.current = animate(x, nextX, {
        ...ROW_SETTLE,
        velocity: clampReleaseVelocity(velocity),
        onComplete: () => x.set(nextX),
      });
    },
    [reduce, x],
  );

  useEffect(() => {
    return () => animationRef.current?.stop();
  }, []);

  useEffect(() => {
    if (commandedTargetRef.current === targetX) {
      return;
    }

    settleX(targetX);
  }, [settleX, targetX]);

  const getTargetX = useCallback(
    (side: SwipeSide | null) =>
      side === "left" ? leftWidth : side === "right" ? -rightWidth : 0,
    [leftWidth, rightWidth],
  );

  const snapTo = useCallback(
    (side: SwipeSide | null, velocity = 0) => {
      setOpenValue(side ? { id: item.id, side } : null);
      settleX(getTargetX(side), velocity);
    },
    [getTargetX, item.id, setOpenValue, settleX],
  );

  const onDragStart = useCallback(() => {
    animationRef.current?.stop();

    if (openValue && openValue.id !== item.id) {
      setOpenValue(null);
    }
  }, [item.id, openValue, setOpenValue]);

  const onDragEnd = useCallback(
    (_: PointerEvent, info: PanInfo) => {
      const velocity = info.velocity.x;
      const latest = x.get();
      const leftOpenThreshold = Math.max(
        revealThreshold,
        leftWidth * OPEN_DISTANCE_RATIO,
      );
      const rightOpenThreshold = Math.max(
        revealThreshold,
        rightWidth * OPEN_DISTANCE_RATIO,
      );

      if (openSide === "left") {
        if (
          latest < leftWidth * CLOSE_DISTANCE_RATIO ||
          velocity < -CLOSE_VELOCITY
        ) {
          snapTo(null, velocity);
          return;
        }

        snapTo("left", velocity);
        return;
      }

      if (openSide === "right") {
        if (
          Math.abs(latest) < rightWidth * CLOSE_DISTANCE_RATIO ||
          velocity > CLOSE_VELOCITY
        ) {
          snapTo(null, velocity);
          return;
        }

        snapTo("right", velocity);
        return;
      }

      if (
        isActionableSide(latest, leftWidth) &&
        (latest > leftOpenThreshold ||
          (velocity > OPEN_VELOCITY && latest > FLING_DISTANCE))
      ) {
        snapTo("left", velocity);
        return;
      }

      if (
        isActionableSide(latest, rightWidth) &&
        (latest < -rightOpenThreshold ||
          (velocity < -OPEN_VELOCITY && latest < -FLING_DISTANCE))
      ) {
        snapTo("right", velocity);
        return;
      }

      snapTo(null, velocity);
    },
    [
      leftWidth,
      openSide,
      revealThreshold,
      rightWidth,
      snapTo,
      x,
    ],
  );

  const handleAction = useCallback(
    (action: SwipeAction, side: SwipeSide) => {
      action.onClick?.(item);
      onAction?.({ item, action, side });

      if (closeOnAction) {
        // The rail turns inert as the row closes; keep focus on the row.
        if (railRef.current?.contains(document.activeElement))
          toggleRef.current?.focus();
        snapTo(null);
      }
    },
    [closeOnAction, item, onAction, snapTo],
  );

  useEffect(() => {
    if (!openSide || !focusActions.current) return;
    focusActions.current = false;
    railRef.current
      ?.querySelector<HTMLButtonElement>(
        `[data-side="${openSide}"] button:not(:disabled)`,
      )
      ?.focus();
  }, [openSide]);

  const hasActions = leftWidth > 0 || rightWidth > 0;
  const openFromKeyboard = (side: SwipeSide) => {
    if ((side === "left" ? leftWidth : rightWidth) === 0) return;
    focusActions.current = true;
    snapTo(side);
  };

  // Keyboard stand-in for the swipe: the arrow keys move the row the way a
  // swipe would, Enter or Space opens the trailing actions, and Escape closes.
  const onToggleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      if (openSide === "left") snapTo(null);
      else openFromKeyboard("right");
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      if (openSide === "right") snapTo(null);
      else openFromKeyboard("left");
    } else if (event.key === "Escape" && openSide) {
      event.preventDefault();
      snapTo(null);
    }
  };

  const onRailKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Escape") return;
    event.preventDefault();
    toggleRef.current?.focus();
    snapTo(null);
  };

  const defaultContent = (
    <div className="flex min-w-0 items-center gap-3">
      {item.leading ? (
        <div className={cn("shrink-0", classNames?.leading)}>
          {item.leading}
        </div>
      ) : null}
      <div className={cn("min-w-0 flex-1", classNames?.content)}>
        {item.title ? (
          <div
            className={cn(
              "truncate text-sm font-medium text-foreground",
              classNames?.title,
            )}
          >
            {item.title}
          </div>
        ) : null}
        {item.description ? (
          <div
            className={cn(
              "mt-0.5 truncate text-xs text-muted-foreground",
              classNames?.description,
            )}
          >
            {item.description}
          </div>
        ) : null}
      </div>
      {item.meta ? (
        <div
          className={cn(
            "shrink-0 text-xs font-medium text-muted-foreground",
            classNames?.meta,
          )}
        >
          {item.meta}
        </div>
      ) : null}
    </div>
  );

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl bg-muted",
        item.disabled && "opacity-60",
        classNames?.item,
      )}
    >
      <div
        ref={railRef}
        id={railId}
        aria-hidden={!openSide}
        inert={!openSide}
        onKeyDown={onRailKeyDown}
        className={cn(
          "absolute inset-0 z-0 flex overflow-hidden rounded-2xl",
          classNames?.rail,
        )}
      >
        <div
          data-side="left"
          className="flex h-full overflow-hidden rounded-l-2xl"
        >
          {leftActions.map((action) => (
            <SwipeActionButton
              key={action.id}
              action={action}
              actionWidth={actionWidth}
              className={classNames?.action}
              focusable={openSide === "left"}
              onAction={handleAction}
              side="left"
            />
          ))}
        </div>
        <div
          data-side="right"
          className="ml-auto flex h-full overflow-hidden rounded-r-2xl"
        >
          {rightActions.map((action) => (
            <SwipeActionButton
              key={action.id}
              action={action}
              actionWidth={actionWidth}
              className={classNames?.action}
              focusable={openSide === "right"}
              onAction={handleAction}
              side="right"
            />
          ))}
        </div>
      </div>

      <motion.div
        drag={item.disabled ? false : "x"}
        dragConstraints={{ left: -rightWidth, right: leftWidth }}
        dragElastic={0.04}
        dragMomentum={false}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        style={{ x }}
        className={cn(
          // `touch-pan-y`, not `touch-none`: the row owns the horizontal
          // swipe, the page keeps the vertical scroll through it.
          "relative z-10 min-h-[72px] cursor-grab touch-pan-y rounded-2xl border border-border bg-card px-4 py-3 shadow-sm active:cursor-grabbing",
          // The swipe is the row's, but what it carries is the consumer's:
          // selection is only suppressed where the platform runs its own press
          // gestures, so a mouse can still select and copy the row's text.
          TOUCH_GESTURE_CONTENT_CLASS,
          classNames?.surface,
        )}
      >
        {renderItem ? renderItem(item) : item.content ?? defaultContent}
        {hasActions && !item.disabled ? (
          // Only visible while focused from the keyboard; pointers swipe.
          <button
            ref={toggleRef}
            type="button"
            aria-label={
              typeof item.title === "string"
                ? `Actions for ${item.title}`
                : "Show actions"
            }
            aria-expanded={openSide !== null}
            aria-controls={railId}
            onClick={() =>
              openSide
                ? snapTo(null)
                : openFromKeyboard(rightWidth > 0 ? "right" : "left")
            }
            onKeyDown={onToggleKeyDown}
            className={cn(
              "sr-only grid place-items-center rounded-full bg-muted text-muted-foreground outline-none",
              "focus-visible:not-sr-only focus-visible:absolute focus-visible:right-3 focus-visible:top-1/2 focus-visible:h-8 focus-visible:w-8 focus-visible:-translate-y-1/2 focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <Ellipsis aria-hidden className="h-4 w-4" />
          </button>
        ) : null}
      </motion.div>
    </div>
  );
}

export function SwipeableList({
  items,
  value,
  defaultValue = null,
  onValueChange,
  onAction,
  actionWidth = 56,
  revealThreshold = 34,
  closeOnAction = true,
  className,
  classNames,
  renderItem,
}: SwipeableListProps) {
  const [openValue, setOpenValue] = useControllableSwipeValue({
    value,
    defaultValue,
    onValueChange,
  });

  return (
    <div className={cn("flex w-full flex-col gap-2", className, classNames?.root)}>
      {items.map((item) => (
        <SwipeableListRow
          key={item.id}
          item={item}
          actionWidth={actionWidth}
          revealThreshold={revealThreshold}
          openValue={openValue}
          setOpenValue={setOpenValue}
          closeOnAction={closeOnAction}
          onAction={onAction}
          classNames={classNames}
          renderItem={renderItem}
        />
      ))}
    </div>
  );
}
