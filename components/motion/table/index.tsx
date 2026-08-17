"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "./editable-cell";
import { RowHandle } from "./row-handle";
import { SkeletonRows } from "./skeleton-rows";
import { TableHeader } from "./table-header";
import type { HeaderCellRefs, TableProps } from "./types";
import { useColumnReorder } from "./use-column-reorder";
import { useColumnResize } from "./use-column-resize";
import { useColumnSort } from "./use-column-sort";
import { useRowSelection } from "./use-row-selection";
import { alignText, CHECKBOX_PX, CHECKBOX_WIDTH, readCell } from "./utils";

export type {
  SortDirection,
  SortState,
  TableColumn,
  TableProps,
} from "./types";

/**
 * Narrowest a column of bare inputs may be floored to and still show a value:
 * the cell's own `px-4` eats 32 of it.
 */
const INPUT_COLUMN_WIDTH = 120;

/** The root font size Tailwind's rem scale assumes, and the pre-measure guess. */
const DEFAULT_ROOT_FONT_SIZE = 16;

/**
 * What one `rem` is worth here, in px. The default until the first client
 * layout, so the server and the hydrating client emit the same floor; measured
 * once after that, because a document that sets its own `html { font-size }`
 * lays a rem column out against that size and a floor computed from 16 would
 * fall short by the same factor.
 */
function useRootFontSize() {
  const [size, setSize] = useState(DEFAULT_ROOT_FONT_SIZE);
  useEffect(() => {
    const measured = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    if (measured > 0) setSize(measured);
  }, []);
  return size;
}

/**
 * The absolute width a column declared, in px, or null when it declared a share
 * of the remainder instead (`fr`, `%`, `auto`, `calc()`, nothing at all) — those
 * are worth whatever is left over, which is not a width this can add up.
 */
function resolveColumnWidth(
  width: string | undefined,
  rootFontSize: number,
): number | null {
  if (!width) return null;
  const value = Number.parseFloat(width);
  if (!Number.isFinite(value)) return null;
  if (width.endsWith("px")) return value;
  // rem is the other absolute length the repo writes.
  if (width.endsWith("rem")) return value * rootFontSize;
  return null;
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
  onCellEdit,
  onColumnRename,
  onInsertRow,
  onDeleteRow,
  onInsertColumn,
  onDeleteColumn,
  rowHeight = 48,
  height = 440,
  overscan = 10,
  onEndReached,
  loading = false,
  skeletonRows = 3,
  emptyState = "No data",
  className,
}: TableProps<T>) {
  const reduce = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const thRefs: HeaderCellRefs = useRef<
    Record<string, HTMLTableCellElement | null>
  >({});

  const rows = useMemo(
    () =>
      data.map((row, index) => ({
        row,
        id: getRowId ? getRowId(row, index) : String(index),
      })),
    [data, getRowId],
  );

  const {
    orderedColumns,
    dragKey,
    dropIndex,
    startReorder,
    moveReorder,
    endReorder,
  } = useColumnReorder({ columns, thRefs, onColumnOrderChange });

  const { sort, sortedRows, toggleSort } = useColumnSort({
    rows,
    columns,
    sort: sortProp,
    defaultSort,
    onSortChange,
  });

  const { widths, startResize, moveResize, endResize } = useColumnResize({
    orderedColumns,
    thRefs,
    minColumnWidth,
    onColumnResize,
  });

  const { selected, allSelected, someSelected, toggleAll, toggleRow } =
    useRowSelection({
      sortedRows,
      selectedRowIds,
      defaultSelectedRowIds,
      onSelectionChange,
    });

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

  const hasRowMenu = !!(onInsertRow || onDeleteRow);
  const hasColumnMenu = !!(onInsertColumn || onDeleteColumn);
  // Only shrink-wrap (w-max) once every column has an explicit resized width;
  // otherwise stay fill-width so a flexible column can't size to cell content.
  const sized =
    orderedColumns.length > 0 &&
    orderedColumns.every((c) => widths[c.key] != null);

  const rootFontSize = useRootFontSize();
  // In a container narrower than the columns, `table-layout: fixed` shrinks
  // every column toward zero instead of scrolling. Floor the table at what the
  // columns actually asked for — an absolute declared width where there is one,
  // and for the ones sharing the remainder whatever content they can fall back
  // on — then let the viewport scroll past it.
  const minTableWidth = useMemo(() => {
    // A column whose cells render bare inputs has no content for the fallback
    // to measure, which is exactly the column that collapses; a renamable
    // header is an input too, and in a fixed layout the header row is what
    // sizes the column.
    const inputOnly = (column: (typeof orderedColumns)[number]) =>
      Boolean(onColumnRename) || (!column.cell && Boolean(column.editable));
    const total = orderedColumns.reduce((sum, column) => {
      const resized = widths[column.key];
      if (resized != null) return sum + resized;
      const declared = resolveColumnWidth(column.width, rootFontSize);
      if (declared != null) return sum + declared;
      return (
        sum +
        (inputOnly(column)
          ? Math.max(minColumnWidth, INPUT_COLUMN_WIDTH)
          : minColumnWidth)
      );
    }, selectable ? CHECKBOX_PX : 0);
    return Math.round(total);
  }, [
    minColumnWidth,
    onColumnRename,
    orderedColumns,
    rootFontSize,
    selectable,
    widths,
  ]);

  // Infinite scroll: fire onEndReached once per near-bottom dwell, paused while
  // loading; the guard resets when the load completes.
  const endReachedRef = useRef(false);
  useEffect(() => {
    if (!loading) endReachedRef.current = false;
  }, [loading]);
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || !onEndReached || loading || endReachedRef.current) return;
    if (el.scrollHeight - el.scrollTop - el.clientHeight < rowHeight * 4) {
      endReachedRef.current = true;
      onEndReached();
    }
  }, [onEndReached, loading, rowHeight]);
  const [activeColumn, setActiveColumn] = useState<string | null>(null);
  // Small delay on leave so the pointer can cross the gap from the header cell
  // to the portal handle without the column deactivating.
  const deactivateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateColumn = useCallback((key: string) => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = null;
    setActiveColumn(key);
  }, []);
  const deactivateColumn = useCallback(() => {
    if (deactivateTimer.current) clearTimeout(deactivateTimer.current);
    deactivateTimer.current = setTimeout(() => setActiveColumn(null), 100);
  }, []);

  const rowRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const [activeRow, setActiveRow] = useState<{ id: string; index: number } | null>(
    null,
  );
  const rowTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activateRow = useCallback((id: string, index: number) => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = null;
    setActiveRow({ id, index });
  }, []);
  const deactivateRow = useCallback(() => {
    if (rowTimer.current) clearTimeout(rowTimer.current);
    rowTimer.current = setTimeout(() => setActiveRow(null), 100);
  }, []);
  const activeRowEl = activeRow ? rowRefs.current[activeRow.id] : null;
  // Real columns + checkbox; the trailing spacer adds one more in colSpans.
  const leadColumns = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={cn(
        "w-full overflow-hidden border border-border bg-background text-sm",
        className,
      )}
    >
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="overflow-auto"
        style={{ height }}
      >
        <table
          className={cn("border-collapse", sized ? "w-max" : undefined)}
          style={{
            tableLayout: "fixed",
            minWidth: `max(100%, ${minTableWidth}px)`,
          }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {orderedColumns.map((column) => {
              const override = widths[column.key];
              const width = override ? `${override}px` : column.width;
              return (
                <col key={column.key} style={width ? { width } : undefined} />
              );
            })}
            {/* Empty filler owns the leftover space — no gap, content unpinned. */}
            <col />
          </colgroup>

          <TableHeader
            columns={orderedColumns}
            rowHeight={rowHeight}
            reduce={!!reduce}
            thRefs={thRefs}
            selectable={selectable}
            allSelected={allSelected}
            someSelected={someSelected}
            onToggleAll={toggleAll}
            sort={sort}
            onToggleSort={toggleSort}
            resizable={resizable}
            onResizeStart={startResize}
            onResizeMove={moveResize}
            onResizeEnd={endResize}
            reorderable={reorderable}
            dragKey={dragKey}
            dropIndex={dropIndex}
            onReorderStart={startReorder}
            onReorderMove={moveReorder}
            onReorderEnd={endReorder}
            onInsertColumn={onInsertColumn}
            onDeleteColumn={onDeleteColumn}
            onColumnRename={onColumnRename}
            activeColumn={hasColumnMenu ? activeColumn : null}
            onColumnActivate={hasColumnMenu ? activateColumn : undefined}
            onColumnDeactivate={hasColumnMenu ? deactivateColumn : undefined}
          />

          <tbody>
            {sortedRows.length === 0 ? (
              loading ? (
                <SkeletonRows
                  count={Math.max(1, Math.ceil(height / rowHeight))}
                  columns={orderedColumns}
                  selectable={selectable}
                  rowHeight={rowHeight}
                />
              ) : (
                <tr>
                  <td
                    colSpan={leadColumns + 1}
                    className="p-10 text-center text-muted-foreground"
                  >
                    {emptyState}
                  </td>
                </tr>
              )
            ) : (
              <>
                {paddingTop > 0 ? (
                  <tr aria-hidden style={{ height: paddingTop }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {virtualItems.map((vItem) => {
                  const entry = sortedRows[vItem.index];
                  const isSelected = selected.has(entry.id);
                  return (
                    <tr
                      key={entry.id}
                      ref={(el) => {
                        rowRefs.current[entry.id] = el;
                      }}
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      onPointerEnter={
                        hasRowMenu
                          ? () => activateRow(entry.id, vItem.index)
                          : undefined
                      }
                      onPointerLeave={hasRowMenu ? deactivateRow : undefined}
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
                          {!column.cell && column.editable ? (
                            <EditableCell
                              value={String(readCell(entry.row, column) ?? "")}
                              label={`${column.key} for row ${vItem.index + 1}`}
                              onChange={(next) =>
                                onCellEdit?.(entry.id, column.key, next)
                              }
                            />
                          ) : (
                            readCell(entry.row, column)
                          )}
                        </td>
                      ))}
                      <td aria-hidden />
                    </tr>
                  );
                })}
                {paddingBottom > 0 ? (
                  <tr aria-hidden style={{ height: paddingBottom }}>
                    <td colSpan={leadColumns + 1} />
                  </tr>
                ) : null}
                {loading ? (
                  <SkeletonRows
                    count={skeletonRows}
                    columns={orderedColumns}
                    selectable={selectable}
                    rowHeight={rowHeight}
                  />
                ) : null}
              </>
            )}
          </tbody>
        </table>
      </div>
      {hasRowMenu && activeRow ? (
        <RowHandle
          rowEl={activeRowEl}
          id={activeRow.id}
          index={activeRow.index}
          onInsertRow={onInsertRow}
          onDeleteRow={onDeleteRow}
          onEnter={() => activateRow(activeRow.id, activeRow.index)}
          onLeave={deactivateRow}
        />
      ) : null}
    </div>
  );
}
