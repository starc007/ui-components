import type { ReactNode } from "react";
import type { TableColumn } from "./types";

export const CHECKBOX_PX = 48;
export const CHECKBOX_WIDTH = `${CHECKBOX_PX}px`;

/** Left + right primary lines for the active column — box-shadow avoids
 * border-collapse merging away one side. */
export const COLUMN_ACTIVE_SHADOW =
  "inset 1px 0 0 var(--color-primary), inset -1px 0 0 var(--color-primary)";

export function alignFlex(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "justify-end";
  if (align === "center") return "justify-center";
  return "justify-start";
}

export function alignText(align: TableColumn<unknown>["align"]) {
  if (align === "right") return "text-right";
  if (align === "center") return "text-center";
  return "text-left";
}

export function readCell<T>(row: T, column: TableColumn<T>): ReactNode {
  if (column.cell) return column.cell(row);
  return (row as Record<string, ReactNode>)[column.key];
}

export function readSortValue<T>(row: T, column: TableColumn<T>): string | number {
  if (column.sortValue) return column.sortValue(row);
  return (row as Record<string, string | number>)[column.key];
}
