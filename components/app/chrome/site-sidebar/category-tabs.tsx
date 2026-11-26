"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "use-intl";
import { SPRING_LAYOUT } from "@/lib/ease";
import { CATEGORY_FILTERS } from "./category-filters";
import { SidebarCategoryTab } from "./category-tab";

export function SidebarCategoryTabs({
  value,
  onValueChange,
  id,
  panelId,
}: {
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  panelId: string;
}) {
  const t = useTranslations("Chrome.sidebar");
  const reduce = useReducedMotion();

  return (
    <motion.section
      layoutRoot
      aria-label={t("filterByCategory")}
      className="bg-background pb-3"
      onKeyDown={(event) => {
        if (!(event.target instanceof HTMLButtonElement) || event.target.getAttribute("role") !== "tab") return;
        const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
        const current = tabs.indexOf(event.target);
        const rtl = getComputedStyle(event.currentTarget).direction === "rtl";
        let next: number;
        switch (event.key) {
          case "ArrowRight": next = current + (rtl ? -1 : 1); break;
          case "ArrowLeft": next = current + (rtl ? 1 : -1); break;
          case "Home": next = 0; break;
          case "End": next = tabs.length - 1; break;
          default: return;
        }
        event.preventDefault();
        const target = tabs[(next + tabs.length) % tabs.length];
        target.focus();
        target.click();
      }}
    >
      <motion.div
        layout
        layoutDependency={value}
        transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
        style={{ borderRadius: 9999 }}
        role="tablist"
        aria-label={t("componentCategories")}
        className="inline-flex min-h-9 items-center gap-1 rounded-full bg-muted p-0.5"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <SidebarCategoryTab
            key={filter.value}
            filter={filter}
            value={value}
            onValueChange={onValueChange}
            id={id}
            panelId={panelId}
          />
        ))}
      </motion.div>
    </motion.section>
  );
}
