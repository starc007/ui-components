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
  /** Show the start/end summary above the calendar. Default true. */
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
  /** Close an open popover after a complete range or preset. Default false. */
  closeOnSelect?: boolean;
  /** Override any built-in string. */
  labels?: Partial<DateRangePickerMessages>;
}
