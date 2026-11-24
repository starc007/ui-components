"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/motion/button";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";
import type { CategoryFilter } from "./category-filters";

export function SidebarCategoryTab({
  filter: { value: filterValue, label: labelKey, icon: Icon },
  value,
  onValueChange,
  id,
  panelId,
}: {
  filter: CategoryFilter;
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  panelId: string;
}) {
  const t = useTranslations("Chrome");
  const label = t(labelKey);
  const reduce = useReducedMotion();
  const active = value === filterValue;
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const activeRef = useRef(active);
  useLayoutEffect(() => { activeRef.current = active; }, [active]);
  // Focus can schedule a tooltip before the click selects this tab. Ignore
  // that delayed request once its label is visible, without rerendering the rail.
  const onTooltipOpenChange = useCallback((open: boolean) => {
    if (open && activeRef.current) return;
    setTooltipOpen(open);
  }, []);

  return (
    <Tooltip
      content={label}
      side="bottom"
      open={!active && tooltipOpen}
      onOpenChange={onTooltipOpenChange}
    >
      <Button
        id={`${id}-${filterValue}`}
        variant="ghost"
        size="sm"
        role="tab"
        aria-label={label}
        aria-selected={active}
        aria-controls={panelId}
        tabIndex={active ? 0 : -1}
        layout
        layoutDependency={value}
        transition={{ layout: reduce ? { duration: 0 } : SPRING_LAYOUT, scale: SPRING_PRESS }}
        whileHover={undefined}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        style={{ borderRadius: 9999 }}
        onClick={() => {
          setTooltipOpen(false);
          onValueChange(filterValue);
        }}
        className={cn(
          "relative h-8 min-w-8 shrink-0 justify-start gap-0 overflow-hidden border-0 p-0 text-xs outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-foreground/40",
          active
            ? "bg-background text-foreground hover:bg-background"
            : "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground",
        )}
      >
        <motion.span
          layout="position"
          layoutDependency={value}
          transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
          className="grid size-8 shrink-0 place-items-center"
          aria-hidden="true"
        >
          <Icon className="size-4" />
        </motion.span>
        {/* Keep the label mounted so an interrupted exit cannot remove a reselected label. */}
        <motion.span
          layout="position"
          layoutDependency={value}
          aria-hidden="true"
          initial={false}
          animate={{ opacity: active ? 1 : 0, filter: reduce || active ? "blur(0px)" : "blur(4px)" }}
          transition={{
            layout: reduce ? { duration: 0 } : SPRING_LAYOUT,
            opacity: { duration: active ? 0.18 : 0.1, ease: EASE_OUT },
            filter: { duration: active ? 0.18 : 0.1, ease: EASE_OUT },
          }}
          className={cn("inline-flex shrink-0 overflow-hidden whitespace-nowrap", active ? "w-auto pr-2" : "w-0")}
        >
          {label}
        </motion.span>
      </Button>
    </Tooltip>
  );
}
