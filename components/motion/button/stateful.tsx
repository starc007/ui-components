"use client";

import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Base Button (kept in-file so this snippet is self-contained) ---------- */

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pressScale?: number;
  children?: ReactNode;
}

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-(--color-fg) text-(--color-bg) hover:bg-(--color-fg)/90",
  secondary:
    "border border-(--color-border) bg-(--color-bg-elev) text-(--color-fg) hover:border-(--color-border-strong)",
  ghost: "text-(--color-fg-muted) hover:text-(--color-fg) hover:bg-(--color-fg)/5",
  outline: "border border-(--color-border) bg-transparent text-(--color-fg) hover:bg-(--color-fg)/5",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-full",
  md: "h-10 px-5 text-sm gap-2 rounded-full",
  lg: "h-12 px-6 text-base gap-2 rounded-full",
  icon: "h-8 w-8 rounded-lg",
};

const PRESS_SPRING = { type: "spring" as const, stiffness: 500, damping: 30, mass: 0.6 };

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", pressScale = 0.93, className, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={{ scale: pressScale }}
      whileHover={{ scale: 1.02 }}
      transition={PRESS_SPRING}
      className={cn(
        "inline-flex items-center justify-center font-medium select-none transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

/* ---------- StatefulButton ---------- */

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  state?: ButtonState;
  children: ReactNode;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
  icon?: ReactNode;
}

const SWAP_SPRING = { type: "spring" as const, stiffness: 460, damping: 30, mass: 0.55 };

function Slot({ keyId, children }: { keyId: string; children: ReactNode }) {
  return (
    <motion.span
      key={keyId}
      initial={{ y: 14, opacity: 0, filter: "blur(6px)" }}
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={{ y: -14, opacity: 0, filter: "blur(6px)" }}
      transition={SWAP_SPRING}
      className="inline-flex items-center gap-2 whitespace-nowrap"
    >
      {children}
    </motion.span>
  );
}

export const StatefulButton = forwardRef<HTMLButtonElement, StatefulButtonProps>(function StatefulButton(
  {
    state = "idle",
    children,
    loadingText = "Loading",
    successText = "Done",
    errorText = "Try again",
    icon,
    disabled,
    ...rest
  },
  ref,
) {
  const isBusy = state === "loading";
  return (
    <Button ref={ref} disabled={disabled || isBusy} aria-busy={isBusy} {...rest}>
      <motion.span
        layout
        transition={SWAP_SPRING}
        className="relative inline-flex items-center justify-center overflow-hidden"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          {state === "idle" ? (
            <Slot keyId="idle">
              {children}
              {icon}
            </Slot>
          ) : null}
          {state === "loading" ? (
            <Slot keyId="loading">
              <Loader2 className="h-4 w-4 animate-spin" />
              {loadingText}
            </Slot>
          ) : null}
          {state === "success" ? (
            <Slot keyId="success">
              <Check className="h-4 w-4" />
              {successText}
            </Slot>
          ) : null}
          {state === "error" ? (
            <Slot keyId="error">
              <X className="h-4 w-4" />
              {errorText}
            </Slot>
          ) : null}
        </AnimatePresence>
      </motion.span>
    </Button>
  );
});
