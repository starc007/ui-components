import type { ReactNode } from "react";
import type { DateRangePickerMessages } from "./messages";

/** Calendar dates, independent of a browser's timezone: YYYY-MM-DD. */
export interface DateRange {
  from: string;
  to?: string;
}
export interface DateRangePreset {
  label: string;
  value: DateRange;
}
export interface DateRangePickerProps {
  /**
   * In single mode, activation selects one day. Values and presets use `from`
   * as the selected day and callbacks report that day as both endpoints.
   * Default "range".
   */
  mode?: "range" | "single";
  value?: DateRange | null;
  defaultValue?: DateRange | null;
  onValueChange?: (range: DateRange | null) => void;
  defaultMonth?: string;
  min?: string;
  max?: string;
  isDateDisabled?: (date: string) => boolean;
  presets?: DateRangePreset[];
  locale?: string;
  label?: string;
  disabled?: boolean;
  /** Move focus to the active date on mount, for use inside a popover. */
  autoFocus?: boolean;
  /** Show the selection summary above the calendar. Default true. */
  showSummary?: boolean;
  className?: string;
  /** Compose custom controls; omitted children render the inline calendar. */
  children?: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Close an open popover after a single date, complete range or preset. Default false. */
  closeOnSelect?: boolean;
  /** Override any built-in string. */
  labels?: Partial<DateRangePickerMessages>;
}
