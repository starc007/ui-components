"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronUp, GripVertical } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";

export type SortState = {
  key: string;
  direction: SortDirection;
};

export type TableColumn<T> = {
  /** Stable key; also the default object property read for the cell + sort value. */
  key: string;
  /** Header content. */
  header: ReactNode;
  /** Allow clicking the header to sort by this column. */
  sortable?: boolean;
  /** Cell text alignment. */
  align?: "left" | "center" | "right";
  /** Column width as a CSS length, e.g. "160px" or "20%". Omit to share remaining space equally. */
  width?: string;
  /** Custom cell renderer. Falls back to `row[key]`. */
  cell?: (row: T) => ReactNode;
  /** Value used for sorting. Falls back to `row[key]`. */
  sortValue?: (row: T) => string | number;
};

export interface TableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  /** Stable id per row, required for correct selection across sorts. Defaults to row index. */
  getRowId?: (row: T, index: number) => string;
  /** Render a leading checkbox column with select-all in the header. */
  selectable?: boolean;
  selectedRowIds?: string[];
  defaultSelectedRowIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  sort?: SortState | null;
  defaultSort?: SortState | null;
  onSortChange?: (sort: SortState | null) => void;
  /** Allow dragging the right edge of a header to resize that column. */
  resizable?: boolean;
  /** Minimum column width in px when resizing. */
  minColumnWidth?: number;
  onColumnResize?: (key: string, width: number) => void;
  /** Allow dragging a header grip to reorder columns. */
  reorderable?: boolean;
  onColumnOrderChange?: (keys: string[]) => void;
  /** Fixed row height in px — required for virtualization. */
  rowHeight?: number;
  /** Scroll viewport height in px. */
  height?: number;
  /** Rows rendered above/below the viewport. */
  overscan?: number;
  emptyState?: ReactNode;
  className?: string;
}

const CHECKBOX_PX = 48;
const CHECKBOX_WIDTH = `${CHECKBOX_PX}px`;

function alignFlex(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

function alignText(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

function readCell<T>(row: T, column: TableColumn<T>): ReactNode {
  if (column.cell) return column.cell(row);
  return (row as Record<string, ReactNode>)[column.key];
}

function readSortValue<T>(row: T, column: TableColumn<T>): string | number {
  if (column.sortValue) return column.sortValue(row);
  return (row as Record<string, string | number>)[column.key];
}

export function Table<T>({
  data,
  columns,
  getRowId,
  selectable = false,
  selectedRowIds,
  defaultSelectedRowIds,
  onSelectionChange,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  resizable = false,
  minColumnWidth = 64,
  onColumnResize,
  reorderable = false,
  onColumnOrderChange,
  rowHeight = 48,
  height = 440,
  overscan = 10,
  emptyState = "No data",
  className,
}: TableProps<T>) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  const resizeRef = useRef<{
    key: string;
    neighborKey: string;
    startX: number;
    startWidth: number;
    startNeighborWidth: number;
  } | null>(null);

  const [widths, setWidths] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<string[]>(() =>
    columns.map((c) => c.key),
  );
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const [internalSort, setInternalSort] = useState<SortState | null>(
    defaultSort,
  );
  const sort = sortProp !== undefined ? sortProp : internalSort;

  const [internalSelected, setInternalSelected] = useState<Set<string>>(
    () => new Set(defaultSelectedRowIds),
  );
  const selected = useMemo(
    () =>
      selectedRowIds !== undefined
        ? new Set(selectedRowIds)
        : internalSelected,
    [selectedRowIds, internalSelected],
  );

  const commitSort = useCallback(
    (next: SortState | null) => {
      if (sortProp === undefined) setInternalSort(next);
      onSortChange?.(next);
    },
    [sortProp, onSortChange],
  );

  const commitSelection = useCallback(
    (next: Set<string>) => {
      if (selectedRowIds === undefined) setInternalSelected(next);
      onSelectionChange?.([...next]);
    },
    [selectedRowIds, onSelectionChange],
  );

  const rows = useMemo(
    () =>
      data.map((row, index) => ({
        row,
        id: getRowId ? getRowId(row, index) : String(index),
      })),
    [data, getRowId],
  );

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return rows;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = readSortValue(a.row, column);
      const bv = readSortValue(b.row, column);
      let cmp: number;
      if (typeof av === "number" && typeof bv === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv));
      }
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort, columns]);

  const virtualizer = useVirtualizer({
    count: sortedRows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => rowHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  const totalColumns = columns.length + (selectable ? 1 : 0);

  // Apply the user's column order, tolerating columns added/removed at runtime.
  const orderedColumns = useMemo(() => {
    const byKey = new Map(columns.map((c) => [c.key, c]));
    const seen = new Set<string>();
    const ordered: TableColumn<T>[] = [];
    for (const key of order) {
      const column = byKey.get(key);
      if (column) {
        ordered.push(column);
        seen.add(key);
      }
    }
    for (const column of columns) {
      if (!seen.has(column.key)) ordered.push(column);
    }
    return ordered;
  }, [order, columns]);

  const startResize = useCallback(
    (key: string, e: ReactPointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      // The resized column trades width with a neighbor so the total stays
      // equal to the container — fixed layout then never rescales (no drift,
      // no leftover gap). Steal from the right neighbor, or the left one for
      // the last column.
      // The handle lives between this column and the next, so it always grows
      // this one and shrinks the right neighbor.
      const index = orderedColumns.findIndex((c) => c.key === key);
      const neighbor = orderedColumns[index + 1];
      if (!neighbor) return;
      // Freeze every column to its current pixel width first.
      setWidths((prev) => {
        const snapshot = { ...prev };
        for (const column of orderedColumns) {
          if (snapshot[column.key] == null) {
            const measured = thRefs.current[column.key]?.getBoundingClientRect()
              .width;
            snapshot[column.key] = measured
              ? Math.round(measured)
              : minColumnWidth;
          }
        }
        resizeRef.current = {
          key,
          neighborKey: neighbor.key,
          startX: e.clientX,
          startWidth: snapshot[key],
          startNeighborWidth: snapshot[neighbor.key],
        };
        return snapshot;
      });
      e.currentTarget.setPointerCapture(e.pointerId);
    },
    [minColumnWidth, orderedColumns],
  );

  const moveResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      if (!state) return;
      let delta = e.clientX - state.startX;
      // Clamp so neither the column nor its neighbor drops below the minimum.
      delta = Math.max(delta, minColumnWidth - state.startWidth);
      delta = Math.min(delta, state.startNeighborWidth - minColumnWidth);
      setWidths((prev) => ({
        ...prev,
        [state.key]: state.startWidth + delta,
        [state.neighborKey]: state.startNeighborWidth - delta,
      }));
    },
    [minColumnWidth],
  );

  const endResize = useCallback(
    (e: ReactPointerEvent) => {
      const state = resizeRef.current;
      resizeRef.current = null;
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (state) onColumnResize?.(state.key, widths[state.key] ?? state.startWidth);
    },
    [onColumnResize, widths],
  );

  const dropIndexFor = useCallback(
    (clientX: number) => {
      for (let i = 0; i < orderedColumns.length; i++) {
        const rect = thRefs.current[orderedColumns[i].key]?.getBoundingClientRect();
        if (rect && clientX < rect.left + rect.width / 2) return i;
      }
      return orderedColumns.length;
    },
    [orderedColumns],
  );

  const startReorder = useCallback((key: string, e: ReactPointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragKey(key);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const moveReorder = useCallback(
    (e: ReactPointerEvent) => {
      if (!dragKey) return;
      setDropIndex(dropIndexFor(e.clientX));
    },
    [dragKey, dropIndexFor],
  );

  const endReorder = useCallback(
    (e: ReactPointerEvent) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      if (dragKey && dropIndex !== null) {
        const keys = orderedColumns.map((c) => c.key);
        const from = keys.indexOf(dragKey);
        if (from !== -1) {
          const without = keys.filter((_, i) => i !== from);
          let to = dropIndex;
          if (from < to) to--;
          without.splice(to, 0, dragKey);
          setOrder(without);
          onColumnOrderChange?.(without);
        }
      }
      setDragKey(null);
      setDropIndex(null);
    },
    [dragKey, dropIndex, orderedColumns, onColumnOrderChange],
  );

  const allSelected =
    sortedRows.length > 0 && sortedRows.every((r) => selected.has(r.id));
  const someSelected = sortedRows.some((r) => selected.has(r.id));

  const toggleSort = useCallback(
    (key: string) => {
      if (!sort || sort.key !== key) {
        commitSort({ key, direction: "asc" });
      } else if (sort.direction === "asc") {
        commitSort({ key, direction: "desc" });
      } else {
        commitSort(null);
      }
    },
    [sort, commitSort],
  );

  const toggleAll = useCallback(() => {
    const next = new Set(selected);
    if (allSelected) {
      for (const r of sortedRows) next.delete(r.id);
    } else {
      for (const r of sortedRows) next.add(r.id);
    }
    commitSelection(next);
  }, [allSelected, sortedRows, selected, commitSelection]);

  const toggleRow = useCallback(
    (id: string) => {
      const next = new Set(selected);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      commitSelection(next);
    },
    [selected, commitSelection],
  );

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-background text-sm",
        className,
      )}
    >
      <div ref={scrollRef} className="overflow-auto" style={{ height }}>
        <table
          className="w-full border-collapse"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {orderedColumns.map((column) => {
              const override = widths[column.key];
              const width = override ? `${override}px` : column.width;
              return (
                <col
                  key={column.key}
                  style={width ? { width } : undefined}
                />
              );
            })}
          </colgroup>

          <thead>
            <tr style={{ height: rowHeight }}>
              {selectable ? (
                <th className="sticky top-0 z-10 border-border border-b bg-muted">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all rows"
                    />
                  </div>
                </th>
              ) : null}
              {orderedColumns.map((column, index) => {
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
                        ? dropIndex === orderedColumns.length &&
                          index === orderedColumns.length - 1
                        : undefined
                    }
                    className={cn(
                      "sticky top-0 z-10 border-border border-b bg-muted p-0 font-medium text-muted-foreground",
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
                          onPointerDown={(e) => startReorder(column.key, e)}
                          onPointerMove={moveReorder}
                          onPointerUp={endReorder}
                          className="flex h-full cursor-grab touch-none items-center pl-2 text-muted-foreground/60 transition-colors hover:text-foreground active:cursor-grabbing"
                        >
                          <GripVertical className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                      {column.sortable ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.key)}
                          className={cn(
                            "flex h-full w-full select-none items-center gap-1 px-4 transition-colors hover:text-foreground",
                            alignFlex(column.align),
                            active && "text-foreground",
                          )}
                        >
                          {column.header}
                          <motion.span
                            aria-hidden
                            className="inline-flex"
                            animate={{
                              rotate:
                                active && sort?.direction === "desc" ? 180 : 0,
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
                        <span className="px-4">{column.header}</span>
                      )}
                    </motion.div>
                    {resizable && index < orderedColumns.length - 1 ? (
                      <button
                        type="button"
                        aria-label={`Resize ${column.key} column`}
                        tabIndex={-1}
                        onPointerDown={(e) => startResize(column.key, e)}
                        onPointerMove={moveResize}
                        onPointerUp={endResize}
                        className="absolute top-0 right-0 h-full w-1.5 cursor-col-resize touch-none bg-transparent transition-colors hover:bg-primary/40"
                      />
                    ) : null}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={totalColumns}
                  className="p-10 text-center text-muted-foreground"
                >
                  {emptyState}
                </td>
              </tr>
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={totalColumns} />
                  </tr>
                ) : null}
                {virtualItems.map((vItem) => {
                  const entry = sortedRows[vItem.index];
                  const isSelected = selected.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      className={cn(
                        "border-border/60 border-b transition-colors",
                        "data-[selected=true]:bg-primary/5",
                        "hover:bg-muted/50",
                      )}
                    >
                      {selectable ? (
                        <td className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(entry.id)}
                              aria-label={`Select row ${vItem.index + 1}`}
                            />
                          </div>
                        </td>
                      ) : null}
                      {orderedColumns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            "truncate px-4 text-foreground",
                            alignText(column.align),
                          )}
                        >
                          {readCell(entry.row, column)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={totalColumns} />
                  </tr>
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer status */}
      <div className="flex items-center justify-between border-border border-t px-4 py-2.5 text-muted-foreground text-xs">
        <span>
          {sortedRows.length.toLocaleString()}{" "}
          {sortedRows.length === 1 ? "row" : "rows"}
        </span>
        {selectable && selected.size > 0 ? (
          <span>{selected.size.toLocaleString()} selected</span>
        ) : (
          <span className="tabular-nums">{totalColumns} columns</span>
        )}
      </div>
    </div>
  );
}
