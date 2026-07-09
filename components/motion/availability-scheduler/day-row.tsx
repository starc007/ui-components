"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus, X } from "lucide-react";
import { useRef } from "react";
import { Switch } from "@/components/motion/switch";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_LAYOUT } from "@/lib/ease";
import { CopyMenu } from "./copy-menu";
import { IconButton } from "./icon-button";
import { TimeSelect } from "./time-select";
import {
  type DayAvailability,
  type DayKey,
  type TimeOption,
  type TimeRange,
  toMinutes,
  toValue,
} from "./types";

export function DayRow({
  day,
  label,
  state,
  options,
  reduce,
  depth,
  onChange,
  onCopy,
}: {
  day: DayKey;
  label: string;
  state: DayAvailability;
  options: TimeOption[];
  reduce: boolean;
  // Higher = painted above later rows, so a downward-opening panel always sits
  // over the rows below it — during both open and close animations.
  depth: number;
  onChange: (next: DayAvailability) => void;
  onCopy: (targets: DayKey[]) => void;
}) {
  const idRef = useRef(0);
  const nextId = () => `${day}-n${idRef.current++}`;

  const setEnabled = (enabled: boolean) => {
    if (enabled && state.ranges.length === 0) {
      onChange({
        enabled,
        ranges: [{ id: nextId(), start: "09:00", end: "17:00" }],
      });
    } else {
      onChange({ ...state, enabled });
    }
  };

  const updateRange = (id: string, patch: Partial<TimeRange>) => {
    onChange({
      ...state,
      ranges: state.ranges.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    });
  };

  const addRange = () => {
    const last = state.ranges[state.ranges.length - 1];
    const start = last ? Math.min(toMinutes(last.end) + 60, 24 * 60 - 60) : 540;
    onChange({
      enabled: true,
      ranges: [
        ...state.ranges,
        { id: nextId(), start: toValue(start), end: toValue(start + 60) },
      ],
    });
  };

  const removeRange = (id: string) => {
    const ranges = state.ranges.filter((r) => r.id !== id);
    // Removing the last slot marks the day unavailable.
    onChange({ enabled: ranges.length > 0, ranges });
  };

  const actions = (
    <>
      <Tooltip content="Add time">
        <IconButton
          label={`Add time range to ${label}`}
          reduce={reduce}
          onClick={addRange}
        >
          <Plus className="h-4 w-4" />
        </IconButton>
      </Tooltip>
      <CopyMenu fromLabel={label} reduce={reduce} onApply={onCopy} />
    </>
  );

  return (
    <motion.div
      layout={reduce ? false : "position"}
      transition={SPRING_LAYOUT}
      style={{ zIndex: depth }}
      className="relative flex flex-col gap-3 py-4 sm:flex-row sm:items-start sm:gap-4"
    >
      {/* toggle + label; actions ride along on mobile */}
      <div className="flex items-center justify-between sm:w-36 sm:shrink-0 sm:justify-start sm:pt-1">
        <div className="flex items-center gap-2.5">
          <Switch
            checked={state.enabled}
            onCheckedChange={setEnabled}
            className="scale-90"
          />
          <span className="text-sm font-medium text-foreground">{label}</span>
        </div>
        <div className="flex items-center gap-1 sm:hidden">{actions}</div>
      </div>

      {/* ranges or unavailable */}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <AnimatePresence initial={false} mode="popLayout">
          {state.enabled ? (
            state.ranges.map((r, i) => (
              <motion.div
                key={r.id}
                layout={reduce ? false : "position"}
                style={{ zIndex: state.ranges.length - i }}
                initial={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -6, filter: "blur(4px)" }
                }
                animate={
                  reduce
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, filter: "blur(0px)" }
                }
                exit={
                  reduce
                    ? { opacity: 0 }
                    : { opacity: 0, y: -4, filter: "blur(4px)" }
                }
                transition={SPRING_LAYOUT}
                className="relative flex items-center gap-2"
              >
                <div className="min-w-0 flex-1 sm:max-w-[132px]">
                  <TimeSelect
                    value={r.start}
                    options={options}
                    onChange={(v) => updateRange(r.id, { start: v })}
                  />
                </div>
                <span className="text-muted-foreground">–</span>
                <div className="min-w-0 flex-1 sm:max-w-[132px]">
                  <TimeSelect
                    value={r.end}
                    options={options}
                    onChange={(v) => updateRange(r.id, { end: v })}
                  />
                </div>
                <Tooltip content="Remove">
                  <IconButton
                    label="Remove time range"
                    reduce={reduce}
                    onClick={() => removeRange(r.id)}
                  >
                    <X className="h-4 w-4" />
                  </IconButton>
                </Tooltip>
              </motion.div>
            ))
          ) : (
            <motion.span
              key="unavailable"
              layout={reduce ? false : "position"}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={SPRING_LAYOUT}
              className="py-1 text-sm text-muted-foreground sm:py-2"
            >
              Unavailable
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* actions (desktop) */}
      <div className="hidden shrink-0 items-center gap-1 pt-0.5 sm:flex">
        {actions}
      </div>
    </motion.div>
  );
}
