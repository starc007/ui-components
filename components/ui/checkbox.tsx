"use client";

import { Check, Minus } from "lucide-react";
import { motion } from "motion/react";
import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, indeterminate, checked, id, ...props }, ref) => {
    const checkboxId = id ?? props.name;
    return (
      <label htmlFor={checkboxId} className="inline-flex cursor-pointer items-center gap-2">
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className="peer absolute inset-0 cursor-pointer appearance-none rounded-md border border-(--color-border-strong) bg-(--color-bg-elev) transition-colors checked:border-(--color-accent) checked:bg-(--color-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent)/40 disabled:opacity-50"
            {...props}
          />
          <motion.span
            initial={false}
            animate={{ scale: checked || indeterminate ? 1 : 0, opacity: checked || indeterminate ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="pointer-events-none relative text-(--color-accent-fg)"
          >
            {indeterminate ? <Minus className="h-3 w-3" strokeWidth={3} /> : <Check className="h-3 w-3" strokeWidth={3} />}
          </motion.span>
        </span>
        {label ? <span className="text-sm text-(--color-fg)">{label}</span> : null}
      </label>
    );
  },
);
Checkbox.displayName = "Checkbox";
