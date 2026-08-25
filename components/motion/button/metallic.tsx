"use client";

import { motion, useReducedMotion } from "motion/react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "./base";

export interface MetallicButtonProps extends Omit<
  ButtonProps,
  "ripple" | "variant"
> {
  /** Stops the traveling reflection while preserving the chrome rim. */
  paused?: boolean;
}

// A straight pass reads as a changing reflection without turning into a spinner.
const CHROME_SWEEP = {
  duration: 3.2,
  ease: "easeInOut" as const,
  repeat: Infinity,
  repeatDelay: 0.7,
};

export const MetallicButton = forwardRef<
  HTMLButtonElement,
  MetallicButtonProps
>(function MetallicButton(
  { size = "md", paused = false, className, children, ...rest },
  ref,
) {
  const reduce = useReducedMotion();
  const still = paused || Boolean(reduce);

  return (
    <Button
      ref={ref}
      variant="ghost"
      size={size}
      className={cn(
        "group relative isolate overflow-hidden border border-transparent bg-transparent text-foreground",
        "hover:bg-transparent hover:text-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "shadow-[0_8px_22px_rgba(0,0,0,0.16)]",
        size === "icon" && "rounded-full",
        className,
      )}
      {...rest}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-[linear-gradient(105deg,#111_0%,#737373_14%,#fafafa_26%,#525252_38%,#0a0a0a_50%,#a3a3a3_64%,#fff_75%,#404040_87%,#111_100%)]"
      />

      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-[-58%] z-[1] w-[58%] -skew-x-12 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.95)_48%,transparent)] blur-[2px] mix-blend-screen"
        animate={still ? undefined : { x: ["0%", "310%"] }}
        transition={still ? undefined : CHROME_SWEEP}
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] z-[2] rounded-[inherit] bg-background transition-colors group-hover:bg-muted/40"
      />

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-[2px] z-[3] rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.28),inset_0_-1px_0_rgba(0,0,0,0.16)]"
      />

      <span className="relative z-10 inline-flex items-center justify-center gap-2">
        {children}
      </span>
    </Button>
  );
});
