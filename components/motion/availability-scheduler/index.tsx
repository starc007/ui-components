"use client";

import { LayoutGroup, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";
import { DayRow } from "./day-row";
import {
  buildOptions,
  type DayAvailability,
  type DayKey,
  defaultWeek,
  panelKey,
  WEEKDAYS,
  type WeekAvailability,
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
  // The row that last opened a dropdown paints above the rest — see DayRow.
  const [openDay, setOpenDay] = useState<DayKey | null>(null);
  // Exactly one time panel is open at a time, and the scheduler is the one that
  // knows which. A panel is absolutely positioned inside its own field, so two
  // open at once paint over each other's options — and nothing else can close
  // the first: a Select only dismisses on an outside *pointerdown*, which
  // keyboard and assistive-technology activation never fires.
  const [openPanel, setOpenPanel] = useState<string | null>(null);
  const controlled = value !== undefined;
  const week = controlled ? value : internal;

  // Which panels the week currently puts on screen. A field that leaves — its
  // day switched off, its range removed — never reports its panel closed: the
  // only thing that dismisses a controlled Select is an outside pointerdown,
  // and a field on its way out is no longer there to hear one. Keeping its id
  // would reopen the panel the moment the same range came back.
  const livePanels = useMemo(() => {
    const ids = new Set<string>();
    for (const { key } of WEEKDAYS) {
      if (!week[key].enabled) continue;
      for (const range of week[key].ranges) {
        ids.add(panelKey(key, range.id, "start"));
        ids.add(panelKey(key, range.id, "end"));
      }
    }
    return ids;
  }, [week]);

  useEffect(() => {
    if (openPanel !== null && !livePanels.has(openPanel)) setOpenPanel(null);
  }, [livePanels, openPanel]);

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

  const panelOpenChange = useCallback(
    (day: DayKey, id: string, open: boolean) => {
      setOpenPanel((current) =>
        open ? id : current === id ? null : current,
      );
      // Elevation stays on the row that opened last so the panel's collapse
      // animation finishes above its neighbours.
      if (open) setOpenDay(day);
    },
    [],
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
        {WEEKDAYS.map(({ key, label }) => (
          <DayRow
            key={key}
            day={key}
            label={label}
            state={week[key]}
            options={options}
            reduce={reduce}
            elevated={openDay === key}
            openPanel={openPanel}
            onChange={(next) => setDay(key, next)}
            onCopy={(targets) => copyDay(key, targets)}
            onPanelOpenChange={(id, open) => panelOpenChange(key, id, open)}
          />
        ))}
      </div>
    </LayoutGroup>
  );
}
