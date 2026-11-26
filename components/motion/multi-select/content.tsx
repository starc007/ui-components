"use client";

import type { ReactNode } from "react";
import { ListboxPanel, type ListboxPanelPlacement } from "@/components/motion/combobox/listbox-panel";
import { useMultiSelectContext } from "./context";

export interface MultiSelectContentProps extends ListboxPanelPlacement {
  children: ReactNode;
}

export function MultiSelectContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className,
}: MultiSelectContentProps) {
  const context = useMultiSelectContext("MultiSelectContent");
  return (
    <ListboxPanel
      name="multi-select"
      open={context.open}
      reduce={context.reduce}
      triggerRef={context.triggerRef}
      contentRef={context.contentRef}
      side={side}
      align={align}
      sideOffset={sideOffset}
      avoidCollisions={avoidCollisions}
      className={className}
    >
      {children}
    </ListboxPanel>
  );
}
