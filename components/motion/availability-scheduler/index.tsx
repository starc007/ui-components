"use client";

import { LayoutGroup, useReducedMotion } from "motion/react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DayRow } from "./day-row";
import {
  type DayAvailability,
  type DayKey,
  WEEKDAYS,
  type WeekAvailability,
  buildOptions,
  defaultWeek,
} from "./types";

export type {
  DayAvailability,
  DayKey,
  TimeRange,
  WeekAvailability,
} from "./types";
export { defaultWeek } from "./types";

export interface AvailabilitySchedulerProps {
  value?: WeekAvailability;
  defaultValue?: WeekAvailability;
  onChange?: (value: WeekAvailability) => void;
  /** Minutes between selectable times. Default 30. */
  step?: number;
  className?: string;
}

export function AvailabilityScheduler({
  value,
  defaultValue,
  onChange,
  step = 30,
  className,
}: AvailabilitySchedulerProps) {
  const reduce = useReducedMotion() ?? false;
  const groupId = useId();
  const options = useMemo(() => buildOptions(step), [step]);
  const idRef = useRef(0);

  const [internal, setInternal] = useState<WeekAvailability>(
    () => defaultValue ?? defaultWeek(),
  );
  const controlled = value !== undefined;
  const week = controlled ? value : internal;

  const commit = useCallback(
    (next: WeekAvailability) => {
      if (!controlled) setInternal(next);
      onChange?.(next);
    },
    [controlled, onChange],
  );

  const setDay = useCallback(
    (day: DayKey, next: DayAvailability) => {
      commit({ ...week, [day]: next });
    },
    [commit, week],
  );

  const copyDay = useCallback(
    (from: DayKey, targets: DayKey[]) => {
      const source = week[from];
      const next = { ...week };
      for (const t of targets) {
        next[t] = {
          enabled: source.enabled,
          ranges: source.ranges.map((r) => ({
            ...r,
            id: `${t}-c${idRef.current++}`,
          })),
        };
      }
      commit(next);
    },
    [commit, week],
  );

  return (
    <LayoutGroup id={groupId}>
      <div className={cn("w-full max-w-xl divide-y divide-border", className)}>
        {WEEKDAYS.map(({ key, label }, i) => (
          <DayRow
            key={key}
            day={key}
            label={label}
            state={week[key]}
            options={options}
            reduce={reduce}
            depth={WEEKDAYS.length - i}
            onChange={(next) => setDay(key, next)}
            onCopy={(targets) => copyDay(key, targets)}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
