"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentProps } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

const MotionLink = motion.create(Link);

export interface PressLinkProps extends ComponentProps<typeof MotionLink> {
  pressScale?: number;
}

/**
 * Link CTA with the same spring press as the library Button — interruptible,
 * settles with life. The CSS `.press` utility reads flat next to it.
 */
export function PressLink({ pressScale = 0.97, ...props }: PressLinkProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  return (
    <MotionLink
      whileTap={reduce ? undefined : { scale: pressScale }}
      whileHover={reduce || !canHover ? undefined : { scale: 1.02 }}
      transition={SPRING_PRESS}
      {...props}
    />
  );
}
