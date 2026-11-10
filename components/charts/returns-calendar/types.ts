import type { ReactNode } from "react";
import type { ReturnsCalendarMessages } from "./messages";

/** Zero-based row and month; month 12 selects the year total. */
export type ReturnsCalendarCell = { y: number; m: number };

export interface ReturnsCalendarSelection {
  start: ReturnsCalendarCell;
  end?: ReturnsCalendarCell;
}

export interface ReturnsCalendarProps {
  /** Row labels, one per row of `returns`. */
  years?: number[];
  /** `returns[year][month]` in percent, twelve months per row. */
  returns?: number[][];
  className?: string;
  children?: ReactNode;
  selection?: ReturnsCalendarSelection | null;
  defaultSelection?: ReturnsCalendarSelection | null;
  onSelectionChange?: (selection: ReturnsCalendarSelection | null) => void;
  /** Override any built-in string. */
  labels?: Partial<ReturnsCalendarMessages>;
}

export interface ReturnsCalendarTooltipData {
  label: string;
  value: number;
  note: string | null;
}
