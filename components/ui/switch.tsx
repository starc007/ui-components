"use client";

import { Switch as HSwitch } from "@headlessui/react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, label, className }: SwitchProps) {
  return (
    <HSwitch.Group>
      <div className={cn("flex items-center gap-3", className)}>
        <HSwitch
          checked={checked}
          onChange={onCheckedChange}
          disabled={disabled}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg) disabled:opacity-50 disabled:cursor-not-allowed",
            checked ? "bg-(--color-accent)" : "bg-(--color-border-strong)",
          )}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0",
              checked ? "translate-x-5" : "translate-x-0",
            )}
          />
        </HSwitch>
        {label ? (
          <HSwitch.Label className="text-sm text-(--color-fg) cursor-pointer">{label}</HSwitch.Label>
        ) : null}
      </div>
    </HSwitch.Group>
  );
}
