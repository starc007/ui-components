"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-(--color-fg)">
            {label}
          </label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-(--color-fg-muted)">
              {leftIcon}
            </span>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            className={cn(
              "h-10 w-full rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-3 text-sm text-(--color-fg) placeholder:text-(--color-fg-muted) transition-colors",
              "focus:border-(--color-accent) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              leftIcon && "pl-9",
              rightIcon && "pr-9",
              error && "border-(--color-danger) focus:border-(--color-danger) focus:ring-(--color-danger)/30",
              className,
            )}
            {...props}
          />
          {rightIcon ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-(--color-fg-muted)">
              {rightIcon}
            </span>
          ) : null}
        </div>
        {error ? (
          <p className="text-xs text-(--color-danger)">{error}</p>
        ) : hint ? (
          <p className="text-xs text-(--color-fg-muted)">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = "Input";
