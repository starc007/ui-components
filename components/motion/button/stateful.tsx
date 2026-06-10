"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Loader2, X } from "lucide-react";
import { forwardRef, type ReactNode } from "react";
import { SPRING_SWAP } from "@/lib/ease";
import { Button, type ButtonProps } from "./base";

export type ButtonState = "idle" | "loading" | "success" | "error";

export interface StatefulButtonProps extends Omit<ButtonProps, "children"> {
  state?: ButtonState;
  children: ReactNode;
  loadingText?: ReactNode;
  successText?: ReactNode;
  errorText?: ReactNode;
  icon?: ReactNode;
}

function Slot({ keyId, children }: { keyId: string; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      key={keyId}
      initial={reduce ? { opacity: 0 } : { y: 14, opacity: 0, filter: "blur(6px)" }}
      animate={reduce ? { opacity: 1 } : { y: 0, opacity: 1, filter: "blur(0px)" }}
      exit={reduce ? { opacity: 0 } : { y: -14, opacity: 0, filter: "blur(6px)" }}
      transition={reduce ? { duration: 0.15 } : SPRING_SWAP}
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
  const reduce = useReducedMotion();
  const isBusy = state === "loading";
  return (
    <Button ref={ref} disabled={disabled || isBusy} aria-busy={isBusy} {...rest}>
      <motion.span
        layout={!reduce}
        transition={SPRING_SWAP}
        aria-live="polite"
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
