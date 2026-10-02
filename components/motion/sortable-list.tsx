"use client";

import { GripVertical, Undo2 } from "lucide-react";
import {
  type HTMLMotionProps,
  Reorder,
  useDragControls,
  useReducedMotion,
} from "motion/react";
import {
  type ComponentPropsWithRef,
  type ReactNode,
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type MoveDirection = -1 | 1 | "first" | "last";
type ListContextValue = {
  ids: string[];
  labels: Map<string, string>;
  label: string;
  disabled: boolean;
  instructions: string;
  itemClassName?: string;
  canUndo: boolean;
  reorder: (ids: string[]) => void;
  move: (id: string, direction: MoveDirection) => void;
  undo: () => void;
  beginDrag: () => void;
  finishDrag: (id: string) => void;
};
const ListContext = createContext<ListContextValue | null>(null);
const ItemContext = createContext<{
  id: string;
  label: string;
  controls: ReturnType<typeof useDragControls>;
  dragging: boolean;
} | null>(null);

function useListContext(part: string) {
  const context = useContext(ListContext);
  if (!context) throw new Error(`${part} must be used within SortableList.`);
  return context;
}

/** Shared ordering and undo actions for custom list controls. */
export function useSortableList() {
  const context = useListContext("useSortableList");
  return {
    ids: context.ids,
    disabled: context.disabled,
    canUndo: context.canUndo,
    moveItem: context.move,
    undo: context.undo,
  };
}

export interface SortableListProps<T extends { id: string }> {
  items?: T[];
  defaultItems?: T[];
  onItemsChange?: (items: T[]) => void;
  /** Convenience row contents when children are omitted. */
  renderItem?: (item: T, index: number) => ReactNode;
  getItemLabel: (item: T) => string;
  /** Compose parts; the render function receives items in their current order. */
  children?: ReactNode | ((items: T[]) => ReactNode);
  label?: string;
  disabled?: boolean;
  /** Show the automatic undo button in the convenience composition. */
  showUndo?: boolean;
  className?: string;
  itemClassName?: string;
}

/** Stable item ids keep focus and content attached to their row during sorting. */
export function SortableList<T extends { id: string }>({
  items: controlledItems,
  defaultItems = [],
  onItemsChange,
  renderItem,
  getItemLabel,
  children,
  label = "Sortable items",
  disabled = false,
  showUndo = true,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const [internalItems, setInternalItems] = useState(defaultItems);
  const items = controlledItems ?? internalItems;
  const ids = items.map((item) => item.id);
  if (new Set(ids).size !== ids.length)
    throw new Error("SortableList requires unique item ids.");
  if (children === undefined && !renderItem)
    throw new Error("SortableList requires children or renderItem.");
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
    // Consumers can remove rows during a drag. Only publish a full permutation.
    if (
      next.length === live.current.length &&
      new Set(nextIds).size === next.length
    )
      change(next);
  };
  const move = (id: string, direction: MoveDirection) => {
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
      `${getItemLabel(item)} moved to position ${to + 1} of ${current.length}.`,
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
  const undo = () => {
    if (disabled || !previous || !canUndo) return;
    pendingFocus.current =
      previous.find((id, index) => id !== ids[index]) ?? previous[0];
    reorder(previous);
    setPrevious(null);
    setAnnouncement("Previous order restored.");
  };
  const context: ListContextValue = {
    ids,
    labels: new Map(items.map((item) => [item.id, getItemLabel(item)])),
    label,
    disabled,
    instructions,
    itemClassName,
    canUndo,
    reorder,
    move,
    undo,
    beginDrag: () => {
      dragStart.current = live.current.map((item) => item.id);
    },
    finishDrag: (id) => {
      const before = dragStart.current;
      dragStart.current = null;
      const current = live.current;
      const index = current.findIndex((item) => item.id === id);
      const item = current[index];
      if (item && before?.some((oldId, at) => oldId !== current[at]?.id)) {
        setPrevious(before);
        setAnnouncement(
          `${getItemLabel(item)} moved to position ${index + 1} of ${current.length}.`,
        );
      }
    },
  };

  return (
    <ListContext.Provider value={context}>
      <div ref={root} className={cn("w-full max-w-md", className)}>
        <p id={instructions} className="sr-only">
          Drag a handle to reorder. With a handle focused, use Up and Down to
          move, Home and End to move to the edges.
        </p>
        {children === undefined ? (
          <>
            <SortableListGroup aria-label={label}>
              {items.map((item, index) => (
                <SortableListItem key={item.id} id={item.id}>
                  <SortableListHandle />
                  <SortableListItemContent>
                    {renderItem?.(item, index)}
                  </SortableListItemContent>
                </SortableListItem>
              ))}
            </SortableListGroup>
            {showUndo && <SortableListUndo />}
          </>
        ) : typeof children === "function" ? (
          children(items)
        ) : (
          children
        )}
        <span role="status" aria-live="polite" className="sr-only">
          {announcement}
        </span>
      </div>
    </ListContext.Provider>
  );
}

export interface SortableListGroupProps
  extends Omit<HTMLMotionProps<"ul">, "children"> {
  children?: ReactNode;
}

/** The ordered rows; keep headers and footer controls outside this group. */
export function SortableListGroup({
  className,
  ...props
}: SortableListGroupProps) {
  const context = useListContext("SortableListGroup");
  return (
    <Reorder.Group
      {...props}
      axis="y"
      values={context.ids}
      onReorder={context.reorder}
      aria-label={props["aria-label"] ?? context.label}
      className={cn("space-y-2", className)}
    />
  );
}

export interface SortableListItemProps
  extends Omit<HTMLMotionProps<"li">, "id" | "value" | "children"> {
  /** Identity of an item supplied to the root. Use it as the React key too. */
  id: string;
  children?: ReactNode;
}

export function SortableListItem({
  id,
  children,
  className,
  onDragStart,
  onDragEnd,
  ...props
}: SortableListItemProps) {
  const context = useListContext("SortableListItem");
  const controls = useDragControls();
  const reduce = useReducedMotion() ?? false;
  const [dragging, setDragging] = useState(false);
  const label = context.labels.get(id);
  if (label === undefined)
    throw new Error(`SortableListItem ${id} is not present in the root items.`);
  return (
    <ItemContext.Provider value={{ id, label, controls, dragging }}>
      <Reorder.Item
        {...props}
        value={id}
        dragListener={false}
        dragControls={controls}
        layout="position"
        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
        onDragStart={(event, info) => {
          setDragging(true);
          context.beginDrag();
          onDragStart?.(event, info);
        }}
        onDragEnd={(event, info) => {
          setDragging(false);
          context.finishDrag(id);
          onDragEnd?.(event, info);
        }}
        whileDrag={reduce ? undefined : { scale: 1.025 }}
        aria-posinset={context.ids.indexOf(id) + 1}
        aria-setsize={context.ids.length}
        className={cn(
          "relative flex items-center gap-3 rounded-2xl border border-border bg-background p-3",
          dragging && "shadow-lg",
          context.itemClassName,
          className,
        )}
      >
        {children}
      </Reorder.Item>
    </ItemContext.Provider>
  );
}

export type SortableListHandleProps = ComponentPropsWithRef<"button">;

export function SortableListHandle({
  children,
  className,
  disabled,
  onPointerDown,
  onKeyDown,
  style,
  ...props
}: SortableListHandleProps) {
  const context = useListContext("SortableListHandle");
  const item = useContext(ItemContext);
  if (!item)
    throw new Error("SortableListHandle must be used within SortableListItem.");
  const unavailable = disabled || context.disabled;
  return (
    <button
      {...props}
      type="button"
      disabled={unavailable}
      data-sortable-id={item.id}
      aria-label={props["aria-label"] ?? `Reorder ${item.label}`}
      aria-describedby={[context.instructions, props["aria-describedby"]]
        .filter(Boolean)
        .join(" ")}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        if (!event.defaultPrevented && !unavailable && event.button === 0) {
          event.currentTarget.focus({ preventScroll: true });
          item.controls.start(event);
        }
      }}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (
          event.defaultPrevented ||
          unavailable ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
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
          context.move(item.id, direction);
        }
      }}
      className={cn(
        "flex size-9 shrink-0 touch-none items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40",
        className,
      )}
      style={{
        cursor: unavailable ? undefined : item.dragging ? "grabbing" : "grab",
        ...style,
      }}
    >
      {children ?? <GripVertical size={18} aria-hidden="true" />}
    </button>
  );
}

export type SortableListItemContentProps = ComponentPropsWithRef<"div">;
export function SortableListItemContent({
  className,
  ...props
}: SortableListItemContentProps) {
  return <div {...props} className={cn("min-w-0 flex-1", className)} />;
}

export type SortableListUndoProps = ComponentPropsWithRef<"button">;
export function SortableListUndo({
  children,
  className,
  disabled,
  onClick,
  ...props
}: SortableListUndoProps) {
  const context = useListContext("SortableListUndo");
  return (
    <button
      {...props}
      type="button"
      disabled={disabled || context.disabled || !context.canUndo}
      className={cn(
        "mt-4 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.undo();
      }}
    >
      {children ?? (
        <>
          <Undo2 size={13} aria-hidden="true" /> Undo reorder
        </>
      )}
    </button>
  );
}
