"use client";

import { useIsPresent } from "motion/react";
import type { ReactNode } from "react";

// The departing month's grid must leave the tab order as soon as exit begins.
export function CalendarPresence({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div inert={!present}>{children}</div>;
}
