"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";
import {
  MorphPopover,
  MorphPopoverContent,
} from "@/components/motion/popover-morph";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_PRESS } from "@/lib/ease";
import { useLocale } from "@/lib/i18n";
import { IconButton } from "./icon-button";
import type { AvailabilitySchedulerTranslate } from "./messages";
import { type DayKey, WEEKDAYS, weekdayLabel } from "./types";

// Copy this day's hours to other days: a morph popover with a day picker.
export function CopyMenu({
  from,
  fromLabel,
  t,
  reduce,
  onApply,
}: {
  from: DayKey;
  fromLabel: string;
  t: AvailabilitySchedulerTranslate;
  reduce: boolean;
  onApply: (targets: DayKey[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [picked, setPicked] = useState<Set<DayKey>>(new Set());
  const { locale } = useLocale();
  const copiedTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(copiedTimer.current), []);
  const others = WEEKDAYS.flatMap((d, index) =>
    d.key === from ? [] : [{ key: d.key, label: weekdayLabel(index, locale) }],
  );

  const toggle = (k: DayKey) =>
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const apply = (targets: DayKey[]) => {
    if (!targets.length) return;
    onApply(targets);
    setOpen(false);
    setPicked(new Set());
    setCopied(true);
    window.clearTimeout(copiedTimer.current);
    copiedTimer.current = window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <MorphPopover open={open} onOpenChange={setOpen}>
      <Tooltip content={t("copyTimes")}>
        <IconButton
          label={t("copyDay", { day: fromLabel })}
          reduce={reduce}
          expanded={open}
          onClick={() => setOpen(!open)}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {copied ? (
              <motion.span
                key="done"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                transition={SPRING_PRESS}
                className="text-foreground"
              >
                <Check className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="copy"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
                transition={SPRING_PRESS}
              >
                <Copy className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </IconButton>
      </Tooltip>

      <MorphPopoverContent align="end" className="w-52 p-2">
        <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {t("copyTo")}
        </p>
        <div className="flex flex-col">
          {others.map((d) => (
            <Checkbox
              key={d.key}
              checked={picked.has(d.key)}
              onCheckedChange={() => toggle(d.key)}
              label={d.label}
              className="w-full flex-row-reverse justify-between rounded-lg px-2 py-1.5 transition-colors hover:bg-muted [&_button]:size-4 [&_button]:rounded-[5px] [&_button]:border [&_button[data-state=unchecked]]:border-border-strong"
            />
          ))}
        </div>
        <div className="mt-1 flex items-center gap-2 border-t border-border px-1 pt-2">
          <button
            type="button"
            onClick={() => apply(others.map((d) => d.key))}
            className="flex-1 rounded-lg px-2 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:bg-muted"
          >
            {t("everyDay")}
          </button>
          <button
            type="button"
            onClick={() => apply([...picked])}
            disabled={picked.size === 0}
            className="flex-1 rounded-lg bg-primary px-2 py-1.5 text-xs font-semibold text-primary-foreground outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
          >
            {t("apply")}
          </button>
        </div>
      </MorphPopoverContent>
    </MorphPopover>
  );
}
