"use client";

import { motion, type HTMLMotionProps, useReducedMotion } from "motion/react";
import { type CSSProperties, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export interface AgentDisclosureProps
  extends Omit<HTMLMotionProps<"div">, "animate" | "initial"> {
  open: boolean;
  openHeight?: CSSProperties["height"];
}

/**
 * Shared reveal for collapsible agent content: a clip, fade and short drop,
 * never an animated height. The box takes its height as soon as it opens and
 * gives it up only once the closing reveal has played, so the exit is seen
 * and mirrors the entrance.
 */
export function AgentDisclosure({
  open,
  openHeight = "auto",
  className,
  style,
  transition,
  onAnimationComplete,
  ...props
}: AgentDisclosureProps) {
  const reduce = useReducedMotion() ?? false;
  const [collapsed, setCollapsed] = useState(!open);
  if (open && collapsed) setCollapsed(false);

  return (
    <motion.div
      {...props}
      aria-hidden={!open}
      inert={!open}
      initial={false}
      animate={
        reduce
          ? { opacity: open ? 1 : 0 }
          : {
              opacity: open ? 1 : 0,
              clipPath: open ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)",
              y: open ? 0 : -4,
            }
      }
      transition={
        transition ?? {
          duration: reduce ? 0 : open ? 0.22 : 0.14,
          ease: EASE_OUT,
        }
      }
      onAnimationComplete={(definition) => {
        if (!open) setCollapsed(true);
        onAnimationComplete?.(definition);
      }}
      className={cn("overflow-hidden", className)}
      style={{
        ...style,
        height: collapsed ? 0 : openHeight,
        pointerEvents: open ? undefined : "none",
        transformOrigin: "top",
      }}
    />
  );
}
