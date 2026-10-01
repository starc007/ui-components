"use client";

import { GripVertical, Undo2 } from "lucide-react";
import { Reorder, useDragControls, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface SortableStackProps<T extends { id: string }> {
  items?: T[];
  defaultItems?: T[];
  onItemsChange?: (items: T[]) => void;
  renderItem: (item: T, index: number) => ReactNode;
  getItemLabel: (item: T) => string;
  label?: string;
  disabled?: boolean;
  showUndo?: boolean;
  className?: string;
  itemClassName?: string;
}

/** Stable item ids keep focus and content attached to their row during sorting. */
export function SortableStack<T extends { id: string }>({
  items: controlledItems,
  defaultItems = [],
  onItemsChange,
  renderItem,
  getItemLabel,
  label = "Sortable items",
  disabled = false,
  showUndo = true,
  className,
  itemClassName,
}: SortableStackProps<T>) {
  const [internalItems, setInternalItems] = useState(defaultItems);
  const items = controlledItems ?? internalItems;
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("SortableStack requires unique item ids.");
  const [previous, setPrevious] = useState<string[] | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const dragStart = useRef<string[] | null>(null);
  const instructions = useId();
  const root = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const live = useRef(items);
  useLayoutEffect(() => {
    live.current = items;
    if (pendingFocus.current !== null) {
      const target = Array.from(
        root.current?.querySelectorAll<HTMLButtonElement>(
          "button[data-sortable-id]",
        ) ?? [],
      ).find((button) => button.dataset.sortableId === pendingFocus.current);
      pendingFocus.current = null;
      target?.focus({ preventScroll: true });
    }
  });

  const change = (next: T[]) => {
    live.current = next;
    if (controlledItems === undefined) setInternalItems(next);
    onItemsChange?.(next);
  };
  const reorder = (nextIds: string[]) => {
    if (disabled) return;
    const byId = new Map(live.current.map((item) => [item.id, item]));
    const next = nextIds.flatMap((id) => {
      const item = byId.get(id);
      return item ? [item] : [];
    });
    // A consumer may remove a row while dragging. Never publish a partial set.
    if (next.length === live.current.length) change(next);
  };
  const move = (id: string, direction: -1 | 1 | "first" | "last") => {
    const current = live.current;
    const from = current.findIndex((item) => item.id === id);
    const to =
      direction === "first"
        ? 0
        : direction === "last"
          ? current.length - 1
          : from + direction;
    if (disabled || from < 0 || to < 0 || to >= current.length || from === to)
      return;
    const next = [...current];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setPrevious(current.map((item) => item.id));
    change(next);
    setAnnouncement(
      `${getItemLabel(item)} moved to position ${to + 1} of ${items.length}.`,
    );
  };
  if (
    previous !== null &&
    (previous.length !== ids.length || previous.some((id) => !ids.includes(id)))
  )
    setPrevious(null);
  const canUndo =
    previous !== null &&
    previous.length === ids.length &&
    previous.every((id) => ids.includes(id)) &&
    previous.some((id, index) => id !== ids[index]);

  return (
    <div ref={root} className={cn("w-full max-w-md", className)}>
      <p id={instructions} className="sr-only">
        Drag a handle to reorder. With a handle focused, use Up and Down to
        move, Home and End to move to the edges.
      </p>
      <Reorder.Group
        axis="y"
        values={ids}
        onReorder={reorder}
        aria-label={label}
        className="space-y-2"
      >
        {items.map((item, index) => (
          <SortableStackRow
            key={item.id}
            id={item.id}
            label={getItemLabel(item)}
            instructions={instructions}
            disabled={disabled}
            className={itemClassName}
            onMove={(direction) => move(item.id, direction)}
            onStart={() => {
              dragStart.current = ids;
            }}
            onEnd={() => {
              const before = dragStart.current;
              dragStart.current = null;
              if (before?.some((id, at) => id !== ids[at])) {
                setPrevious(before);
                setAnnouncement(
                  `${getItemLabel(item)} moved to position ${index + 1} of ${items.length}.`,
                );
              }
            }}
          >
            {renderItem(item, index)}
          </SortableStackRow>
        ))}
      </Reorder.Group>
      {showUndo && (
        <button
          type="button"
          disabled={disabled || !canUndo}
          className="mt-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          onClick={() => {
            if (!previous || !canUndo) return;
            pendingFocus.current =
              previous.find((id, index) => id !== ids[index]) ?? previous[0];
            reorder(previous);
            setPrevious(null);
            setAnnouncement("Previous order restored.");
          }}
        >
          <Undo2 size={13} aria-hidden="true" /> Undo reorder
        </button>
      )}
      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

function SortableStackRow({
  id,
  label,
  instructions,
  disabled,
  children,
  className,
  onMove,
  onStart,
  onEnd,
}: {
  id: string;
  label: string;
  instructions: string;
  disabled: boolean;
  children: ReactNode;
  className?: string;
  onMove: (direction: -1 | 1 | "first" | "last") => void;
  onStart: () => void;
  onEnd: () => void;
}) {
  const controls = useDragControls();
  const reduce = useReducedMotion() ?? false;
  const [dragging, setDragging] = useState(false);
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      layout="position"
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      onDragStart={() => {
        setDragging(true);
        onStart();
      }}
      onDragEnd={() => {
        setDragging(false);
        onEnd();
      }}
      whileDrag={reduce ? undefined : { scale: 1.025 }}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border border-border bg-background p-3",
        dragging && "shadow-lg",
        className,
      )}
    >
      <button
        type="button"
        disabled={disabled}
        data-sortable-id={id}
        aria-label={`Reorder ${label}`}
        aria-describedby={instructions}
        onPointerDown={(event) => {
          if (!disabled && event.button === 0) {
            event.currentTarget.focus({ preventScroll: true });
            controls.start(event);
          }
        }}
        onKeyDown={(event) => {
          const direction =
            event.key === "ArrowUp"
              ? -1
              : event.key === "ArrowDown"
                ? 1
                : event.key === "Home"
                  ? "first"
                  : event.key === "End"
                    ? "last"
                    : null;
          if (direction !== null) {
            event.preventDefault();
            onMove(direction);
          }
        }}
        className="flex size-9 shrink-0 touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
        style={{
          cursor: disabled ? undefined : dragging ? "grabbing" : "grab",
        }}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </Reorder.Item>
  );
}
