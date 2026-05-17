"use client";

import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
  autoGrow?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, autoGrow = true, id, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const textareaId = id ?? props.name;

    useEffect(() => {
      if (!autoGrow) return;
      const el = internalRef.current;
      if (!el) return;
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, [autoGrow, props.value]);

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <label htmlFor={textareaId} className="text-sm font-medium text-(--color-fg)">
            {label}
          </label>
        ) : null}
        <textarea
          ref={(node) => {
            internalRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) ref.current = node;
          }}
          id={textareaId}
          aria-invalid={!!error}
          className={cn(
            "min-h-[80px] w-full resize-none rounded-lg border border-(--color-border) bg-(--color-bg-elev) px-3 py-2.5 text-sm text-(--color-fg) placeholder:text-(--color-fg-muted) transition-colors",
            "focus:border-(--color-accent) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/30",
            "disabled:opacity-50",
            error && "border-(--color-danger)",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="text-xs text-(--color-danger)">{error}</p>
        ) : hint ? (
          <p className="text-xs text-(--color-fg-muted)">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
