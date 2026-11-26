"use client";

import { useDateRangePickerContext } from "./date-range-picker/context";

// Re-exports stay in the order the API table lists them.
export { DateRangePicker } from "./date-range-picker/root";
export {
  DateRangePickerCalendar,
  type DateRangePickerCalendarProps,
} from "./date-range-picker/calendar";
export {
  DateRangePickerSummary,
  type DateRangePickerSummaryProps,
} from "./date-range-picker/summary";
export {
  DateRangePickerHeader,
  type DateRangePickerHeaderProps,
} from "./date-range-picker/header";
export {
  DateRangePickerGrid,
  type DateRangePickerGridProps,
} from "./date-range-picker/grid";
export {
  DateRangePickerSelection,
  type DateRangePickerSelectionProps,
} from "./date-range-picker/selection";
export {
  DateRangePickerClear,
  type DateRangePickerClearProps,
} from "./date-range-picker/clear";
export {
  DateRangePickerFooter,
  type DateRangePickerFooterProps,
} from "./date-range-picker/footer";
export {
  DateRangePickerPresets,
  type DateRangePickerPresetsProps,
} from "./date-range-picker/presets";
export {
  DateRangePickerPreset,
  type DateRangePickerPresetProps,
} from "./date-range-picker/preset";
export {
  DateRangePickerTrigger,
  type DateRangePickerTriggerProps,
} from "./date-range-picker/trigger";
export {
  DateRangePickerContent,
  type DateRangePickerContentProps,
} from "./date-range-picker/content";
export {
  DateRangePickerDropdown,
  type DateRangePickerDropdownProps,
} from "./date-range-picker/dropdown";
export {
  type DateRangePickerMessages,
  dateRangePickerMessages,
} from "./date-range-picker/messages";
export type {
  DateRange,
  DateRangePickerProps,
  DateRangePreset,
} from "./date-range-picker/types";

/** State shared by built-in parts and custom date range controls. */
export function useDateRangePicker() {
  const ctx = useDateRangePickerContext("useDateRangePicker");
  return {
    value: ctx.value,
    setValue: ctx.change,
    open: ctx.open,
    setOpen: ctx.setOpen,
    month: ctx.month,
    view: ctx.view,
    label: ctx.label,
    locale: ctx.locale,
    disabled: ctx.disabled,
    selectDate: ctx.select,
    clear: ctx.clear,
    goToMonth: ctx.goToMonth,
    previous: () => !ctx.previousDisabled && ctx.page(-1),
    next: () => !ctx.nextDisabled && ctx.page(1),
    previousDisabled: ctx.previousDisabled,
    nextDisabled: ctx.nextDisabled,
    chooseMonth: () => ctx.openChoices("months"),
    chooseYear: () => ctx.openChoices("years"),
  };
}
