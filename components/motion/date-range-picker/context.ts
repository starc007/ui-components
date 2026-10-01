"use client";

import { createContext, useContext } from "react";
import type { useDateRangePickerController } from "./use-date-range-picker";

type DateRangePickerContextValue = ReturnType<
  typeof useDateRangePickerController
>;
export const DateRangePickerContext =
  createContext<DateRangePickerContextValue | null>(null);
export function useDateRangePickerContext(part: string) {
  const context = useContext(DateRangePickerContext);
  if (!context) throw new Error(`${part} must be used within DateRangePicker`);
  return context;
}
