import type { ReactNode } from "react";

export type HeatCalendarCell = { w: number; d: number };

export interface HeatCalendarSelection {
  start: HeatCalendarCell;
  end?: HeatCalendarCell;
}

export interface HeatCalendarProps {
  /** Noun after every count, e.g. "commits", "ships". */
  unit?: string;
  /** Number of week columns. */
  weeks?: number;
  /** Count a cell at intensity 1 stands for; a cell reads `intensity × maxCount`. */
  maxCount?: number;
  /** `values[week][day]` intensities in 0..1, seven days per week. Missing values are zero. */
  values?: number[][];
  /** Last UTC calendar day of the grid. Defaults to today after mount; explicit dates render identically in every timezone. */
  endDate?: Date;
  /** The single hue. Any CSS color; magnitude maps to its strength, never to a second color. */
  color?: string;
  className?: string;
  children?: ReactNode;
  /** Controlled selection; null clears it. Cell coordinates are zero-based week/day (Monday first). */
  selection?: HeatCalendarSelection | null;
  defaultSelection?: HeatCalendarSelection | null;
  onSelectionChange?: (selection: HeatCalendarSelection | null) => void;
}
