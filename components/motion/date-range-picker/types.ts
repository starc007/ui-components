import type { ReactNode } from "react";
import type { DateRangePickerMessages } from "./messages";

/** Calendar dates, independent of a browser's timezone: YYYY-MM-DD. */
export interface DateRange {
  /** First day of the range, as YYYY-MM-DD. */
  from: string;
  /** Last day of the range, on or after `from`. Omit while only the start is picked. */
  to?: string;
}
export interface DateRangePreset {
  /** Text shown on the preset button. */
  label: string;
  /** Range selected when the preset button is pressed. */
  value: DateRange;
}
export interface DateRangePickerProps {
  /**
   * In single mode, activation selects one day. Values and presets use `from`
   * as the selected day and callbacks report that day as both endpoints.
   * Default "range".
   */
  mode?: "range" | "single";
  /** The selected range, for controlled use. `null` means no selection. */
  value?: DateRange | null;
  /** The initial range when uncontrolled. Default: null */
  defaultValue?: DateRange | null;
  /** Called with the new range, or `null` when cleared, when the selection changes. */
  onValueChange?: (range: DateRange | null) => void;
  /** Month shown first, as YYYY-MM-DD. Defaults to the range start or today. */
  defaultMonth?: string;
  /** Earliest selectable date, as YYYY-MM-DD. */
  min?: string;
  /** Latest selectable date, as YYYY-MM-DD. */
  max?: string;
  /** Return true for a YYYY-MM-DD date that cannot be picked or spanned. */
  isDateDisabled?: (date: string) => boolean;
  /** Quick-pick ranges shown as buttons below the calendar. Default: [] */
  presets?: DateRangePreset[];
  /** BCP 47 locale for month, weekday and date formats. Defaults to the app locale. */
  locale?: string;
  /** Accessible name for the calendar and trigger. Default: "Choose a date range" */
  label?: string;
  /** Disables every date and control. Default: false */
  disabled?: boolean;
  /** Move focus to the active date on mount, for use inside a popover. */
  autoFocus?: boolean;
  /** Show the selection summary above the calendar. Default true. */
  showSummary?: boolean;
  /** Classes merged onto the inline calendar, or the popover root when composing children. */
  className?: string;
  /** Compose custom controls; omitted children render the inline calendar. */
  children?: ReactNode;
  /** Whether the popover is open, for controlled use. */
  open?: boolean;
  /** Whether the popover starts open when uncontrolled. Default: false */
  defaultOpen?: boolean;
  /** Called with the next open state when the popover opens or closes. */
  onOpenChange?: (open: boolean) => void;
  /** Close an open popover after a single date, complete range or preset. Default false. */
  closeOnSelect?: boolean;
  /** Override any built-in string. */
  labels?: Partial<DateRangePickerMessages>;
}
