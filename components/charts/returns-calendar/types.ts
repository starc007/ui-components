import type { ReactNode } from "react";
import type { ReturnsCalendarMessages } from "./messages";

/** Zero-based row and month; month 12 selects the year total. */
export type ReturnsCalendarCell = {
  /** Row index into `years` and `returns`. */
  y: number;
  /** Month index from 0 to 11, or 12 for the year total. */
  m: number;
};

export interface ReturnsCalendarSelection {
  /** The pinned cell, or the anchor of a span. */
  start: ReturnsCalendarCell;
  /** Other end of a span, compounded with `start`; both months or both year totals. */
  end?: ReturnsCalendarCell;
}

export interface ReturnsCalendarProps {
  /** Row labels, one per row of `returns`. */
  years?: number[];
  /** `returns[year][month]` in percent, twelve months per row. */
  returns?: number[][];
  /** Classes merged onto the root element. */
  className?: string;
  children?: ReactNode;
  /** The pinned cell or range of cells, or null, for controlled use. */
  selection?: ReturnsCalendarSelection | null;
  /** The initial selection when uncontrolled. Default: null */
  defaultSelection?: ReturnsCalendarSelection | null;
  /** Called with the new cell or range, or null when cleared. */
  onSelectionChange?: (selection: ReturnsCalendarSelection | null) => void;
  /** Override any built-in string. */
  labels?: Partial<ReturnsCalendarMessages>;
}

export interface ReturnsCalendarTooltipData {
  label: string;
  value: number;
  note: string | null;
}
