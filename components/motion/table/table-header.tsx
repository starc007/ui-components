"use client";

import {
  ArrowLeftToLine,
  ArrowRightToLine,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { TableMenu } from "./table-menu";
import type {
  HeaderCellRefs,
  InsertPosition,
  SortState,
  TableColumn,
} from "./types";
import { alignFlex } from "./utils";

export interface TableHeaderProps<T> {
  columns: TableColumn<T>[];
  rowHeight: number;
  reduce: boolean;
  thRefs: HeaderCellRefs;
  selectable: boolean;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  sort: SortState | null;
  onToggleSort: (key: string) => void;
  resizable: boolean;
  onResizeStart: (key: string, e: ReactPointerEvent) => void;
  onResizeMove: (e: ReactPointerEvent) => void;
  onResizeEnd: (e: ReactPointerEvent) => void;
  reorderable: boolean;
  dragKey: string | null;
  dropIndex: number | null;
  onReorderStart: (key: string, e: ReactPointerEvent) => void;
  onReorderMove: (e: ReactPointerEvent) => void;
  onReorderEnd: (e: ReactPointerEvent) => void;
  hasRowMenu: boolean;
  onInsertColumn?: (index: number, position: InsertPosition) => void;
  onDeleteColumn?: (columnKey: string, index: number) => void;
}

export function TableHeader<T>({
  columns,
  rowHeight,
  reduce,
  thRefs,
  selectable,
  allSelected,
  someSelected,
  onToggleAll,
  sort,
  onToggleSort,
  resizable,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  reorderable,
  dragKey,
  dropIndex,
  onReorderStart,
  onReorderMove,
  onReorderEnd,
  hasRowMenu,
  onInsertColumn,
  onDeleteColumn,
}: TableHeaderProps<T>) {
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  return (
    <thead>
      <tr style={{ height: rowHeight }}>
        {selectable ? (
          <th className="sticky top-0 z-10 border-border border-b bg-muted">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={allSelected}
                indeterminate={!allSelected && someSelected}
                onCheckedChange={onToggleAll}
                aria-label="Select all rows"
              />
            </div>
          </th>
        ) : null}
        {hasRowMenu ? (
          <th className="sticky top-0 z-10 border-border border-b bg-muted" />
        ) : null}
        {columns.map((column, index) => {
          const active = sort?.key === column.key;
          const isDragging = dragKey === column.key;
          return (
            <th
              key={column.key}
              ref={(el) => {
                thRefs.current[column.key] = el;
              }}
              aria-sort={
                active
                  ? sort?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : undefined
              }
              data-drop={dragKey ? dropIndex === index : undefined}
              data-dropend={
                dragKey
                  ? dropIndex === columns.length && index === columns.length - 1
                  : undefined
              }
              className={cn(
                "group sticky top-0 z-10 border-border border-b bg-muted p-0 font-medium text-muted-foreground",
                "data-[drop=true]:before:absolute data-[drop=true]:before:inset-y-0 data-[drop=true]:before:left-0 data-[drop=true]:before:w-0.5 data-[drop=true]:before:bg-primary",
                "data-[dropend=true]:after:absolute data-[dropend=true]:after:inset-y-0 data-[dropend=true]:after:right-0 data-[dropend=true]:after:w-0.5 data-[dropend=true]:after:bg-primary",
              )}
            >
              <motion.div
                className={cn(
                  "flex h-full items-center",
                  alignFlex(column.align),
                )}
                style={{ height: rowHeight }}
                animate={
                  reduce
                    ? { opacity: isDragging ? 0.5 : 1 }
                    : {
                        scale: isDragging ? 1.04 : 1,
                        opacity: isDragging ? 0.5 : 1,
                      }
                }
                transition={SPRING_PRESS}
              >
                {reorderable ? (
                  <button
                    type="button"
                    aria-label={`Reorder ${column.key} column`}
                    onPointerDown={(e) => onReorderStart(column.key, e)}
                    onPointerMove={onReorderMove}
                    onPointerUp={onReorderEnd}
                    className="flex h-full cursor-grab touch-none items-center pl-2 text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
                  >
                    <GripVertical className="h-3.5 w-3.5" />
                  </button>
                ) : null}
                {column.sortable ? (
                  <button
                    type="button"
                    onClick={() => onToggleSort(column.key)}
                    className={cn(
                      "flex h-full min-w-0 flex-1 select-none items-center gap-1 px-4 transition-colors hover:text-foreground",
                      alignFlex(column.align),
                      active && "text-foreground",
                    )}
                  >
                    <span className="truncate">{column.header}</span>
                    <motion.span
                      aria-hidden
                      className="inline-flex shrink-0"
                      animate={{
                        rotate: active && sort?.direction === "desc" ? 180 : 0,
                        opacity: active ? 1 : 0.35,
                      }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.18, ease: EASE_OUT }
                      }
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </motion.span>
                  </button>
                ) : (
                  <span className="min-w-0 flex-1 truncate px-4">
                    {column.header}
                  </span>
                )}
              </motion.div>
              {hasColumnMenu ? (
                <TableMenu
                  ariaLabel={`${column.key} column options`}
                  triggerClassName="-translate-x-1/2 absolute top-1 left-1/2 z-20 flex h-3.5 w-10 items-center justify-center rounded-full bg-primary/25 text-primary opacity-0 transition-opacity hover:bg-primary/40 focus-visible:opacity-100 group-hover:opacity-100"
                  trigger={<ChevronDown className="h-3 w-3" />}
                  items={[
                    ...(onInsertColumn
                      ? [
                          {
                            label: "Insert before",
                            icon: <ArrowLeftToLine />,
                            onSelect: () => onInsertColumn(index, "before"),
                          },
                          {
                            label: "Insert after",
                            icon: <ArrowRightToLine />,
                            onSelect: () => onInsertColumn(index, "after"),
                          },
                        ]
                      : []),
                    ...(onDeleteColumn
                      ? [
                          {
                            label: "Delete column",
                            icon: <Trash2 />,
                            destructive: true,
                            onSelect: () => onDeleteColumn(column.key, index),
                          },
                        ]
                      : []),
                  ]}
                />
              ) : null}
              {resizable ? (
                <button
                  type="button"
                  aria-label={`Resize ${column.key} column`}
                  tabIndex={-1}
                  onPointerDown={(e) => onResizeStart(column.key, e)}
                  onPointerMove={onResizeMove}
                  onPointerUp={onResizeEnd}
                  className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/40"
                />
              ) : null}
            </th>
          );
        })}
        <th
          aria-hidden
          className="sticky top-0 z-10 border-border border-b bg-muted"
        />
      </tr>
    </thead>
  );
}
