"use client";

import { motion } from "motion/react";
import { useId } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function Switch({ checked, onCheckedChange, disabled, label, className }: SwitchProps) {
  const id = useId();
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 outline-none transition-colors press",
          "focus-visible:ring-2 focus-visible:ring-(--color-accent)/40 focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-(--color-accent)" : "bg-(--color-border-strong)",
        )}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 700, damping: 32 }}
          className={cn(
            "block h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_-1px_rgb(0_0_0/0.3)]",
            checked ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      {label ? (
        <label htmlFor={id} className="cursor-pointer text-sm text-(--color-fg)">
          {label}
        </label>
      ) : null}
    </span>
  );
}
