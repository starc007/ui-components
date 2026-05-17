"use client";

import { animate, motion, MotionConfig } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
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
  const thumbRef = useRef<HTMLDivElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  // Disabled shake feedback when pressed.
  useEffect(() => {
    if (!thumbRef.current) return;
    if (disabled && isPressed) {
      animate(
        thumbRef.current,
        { x: [0, -2, 2, -1, 0] },
        { delay: 0.2, duration: 0.6 },
      );
    }
  }, [disabled, isPressed]);

  const squish = !disabled && isPointer && isPressed;

  return (
    <MotionConfig transition={{ type: "spring", stiffness: 800, damping: 80, mass: 4 }}>
      <span className={cn("inline-flex items-center gap-3", className)}>
        <motion.button
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => !disabled && onCheckedChange(!checked)}
          onPointerDown={(e) => {
            setIsPressed(true);
            setIsPointer(e.type.startsWith("pointer"));
          }}
          onPointerUp={() => setIsPressed(false)}
          onPointerLeave={() => setIsPressed(false)}
          initial={false}
          data-state={checked ? "checked" : "unchecked"}
          className={cn(
            "group peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center px-1 rounded-full outline-none transition-colors duration-200",
            "focus-visible:ring-2 focus-visible:ring-(--color-border-strong) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-bg)",
            "disabled:cursor-not-allowed disabled:opacity-60",
            checked ? "justify-end bg-(--color-fg)" : "justify-start bg-(--color-fg-muted)/60",
          )}
        >
          <motion.div
            ref={thumbRef}
            layout
            animate={{ scale: squish ? 0.9 : 1 }}
            className="pointer-events-none block h-5 w-5 rounded-full bg-(--color-bg) shadow-[0_2px_6px_-1px_rgb(0_0_0/0.3)]"
          >
            {/* Stretch toward the destination on press. */}
            <div
              className={cn(
                "size-5",
                squish && (checked ? "ml-1" : "mr-1"),
              )}
            />
          </motion.div>
        </motion.button>
        {label ? (
          <label htmlFor={id} className="cursor-pointer text-sm text-(--color-fg)">
            {label}
          </label>
        ) : null}
      </span>
    </MotionConfig>
  );
}
