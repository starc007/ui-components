"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ArrowDownToLine, ArrowUpToLine, Trash2 } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useMemo, useRef } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import { cn } from "@/lib/utils";
import { EditableCell } from "./editable-cell";
import { TableHeader } from "./table-header";
import { TableMenu } from "./table-menu";
import type { HeaderCellRefs, TableProps } from "./types";
import { useColumnReorder } from "./use-column-reorder";
import { useColumnResize } from "./use-column-resize";
import { useColumnSort } from "./use-column-sort";
import { useRowSelection } from "./use-row-selection";
import { CHECKBOX_WIDTH, alignText, readCell } from "./utils";

export type {
  SortDirection,
  SortState,
  TableColumn,
  TableProps,
} from "./types";

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
  onInsertRow,
  onDeleteRow,
  onInsertColumn,
  onDeleteColumn,
  rowHeight = 48,
  height = 440,
  overscan = 10,
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

  const { orderedColumns, dragKey, dropIndex, startReorder, moveReorder, endReorder } =
    useColumnReorder({ columns, thRefs, onColumnOrderChange });

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
  // Real columns + checkbox + row-menu, then the trailing spacer adds one more.
  const leadColumns =
    columns.length + (selectable ? 1 : 0) + (hasRowMenu ? 1 : 0);

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-2xl border border-border bg-background text-sm",
        className,
      )}
    >
      <div ref={scrollRef} className="overflow-auto" style={{ height }}>
        <table
          className="w-max min-w-full border-collapse"
          style={{ tableLayout: "fixed" }}
        >
          <colgroup>
            {selectable ? <col style={{ width: CHECKBOX_WIDTH }} /> : null}
            {hasRowMenu ? <col style={{ width: "28px" }} /> : null}
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
            hasRowMenu={hasRowMenu}
            onInsertColumn={onInsertColumn}
            onDeleteColumn={onDeleteColumn}
          />

          <tbody>
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={leadColumns + 1}
                  className="p-10 text-center text-muted-foreground"
                >
                  {emptyState}
                </td>
              </tr>
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
                      data-selected={isSelected}
                      style={{ height: rowHeight }}
                      className={cn(
                        "group border-border/60 border-b transition-colors",
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
                      {hasRowMenu ? (
                        <td className="relative">
                          <TableMenu
                            ariaLabel={`Row ${vItem.index + 1} options`}
                            triggerClassName="-translate-x-1/2 -translate-y-1/2 absolute top-1/2 left-1/2 h-8 w-3 rounded-full bg-primary/25 opacity-0 transition-opacity hover:bg-primary/40 focus-visible:opacity-100 group-hover:opacity-100"
                            trigger={<span className="sr-only">Row options</span>}
                            items={[
                              ...(onInsertRow
                                ? [
                                    {
                                      label: "Insert before",
                                      icon: <ArrowUpToLine />,
                                      onSelect: () =>
                                        onInsertRow(vItem.index, "before"),
                                    },
                                    {
                                      label: "Insert after",
                                      icon: <ArrowDownToLine />,
                                      onSelect: () =>
                                        onInsertRow(vItem.index, "after"),
                                    },
                                  ]
                                : []),
                              ...(onDeleteRow
                                ? [
                                    {
                                      label: "Delete row",
                                      icon: <Trash2 />,
                                      destructive: true,
                                      onSelect: () =>
                                        onDeleteRow(entry.id, vItem.index),
                                    },
                                  ]
                                : []),
                            ]}
                          />
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
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
