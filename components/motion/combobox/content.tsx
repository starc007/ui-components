"use client";

import type { ReactNode } from "react";
import { useComboboxContext } from "./context";
import { ListboxPanel, type ListboxPanelPlacement } from "./listbox-panel";

export interface ComboboxContentProps extends ListboxPanelPlacement {
  children: ReactNode;
}

export function ComboboxContent({
  children,
  side = "bottom",
  align = "start",
  sideOffset = 6,
  avoidCollisions = true,
  className,
}: ComboboxContentProps) {
  const context = useComboboxContext("ComboboxContent");
  return (
    <ListboxPanel
      name="combobox"
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
