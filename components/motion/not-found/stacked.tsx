"use client";

import { motion, useReducedMotion } from "motion/react";
import { SPRING_PANEL } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import {
  NOT_FOUND_DEFAULTS,
  NotFoundActions,
  NotFoundStage,
  type NotFoundProps,
} from "./shared";

const CARD =
  "absolute inset-0 rounded-3xl border border-border bg-card shadow-sm";

export function NotFoundStacked({
  className,
  code = NOT_FOUND_DEFAULTS.code,
  title = NOT_FOUND_DEFAULTS.title,
  description = NOT_FOUND_DEFAULTS.description,
  homeHref,
  homeLabel,
  browseHref,
  browseLabel,
}: NotFoundProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const interactive = !reduce && canHover;

  return (
    <NotFoundStage className={className}>
      <motion.div
        initial="rest"
        animate="rest"
        whileHover={interactive ? "hover" : undefined}
        className="relative h-44 w-64"
      >
        <motion.div
          aria-hidden
          variants={{ rest: { rotate: 0, x: 0, y: 0 }, hover: { rotate: -9, x: -28, y: 8 } }}
          transition={SPRING_PANEL}
          className={CARD}
        />
        <motion.div
          aria-hidden
          variants={{ rest: { rotate: 0, x: 0, y: 0 }, hover: { rotate: 9, x: 28, y: 8 } }}
          transition={SPRING_PANEL}
          className={CARD}
        />
        <motion.div
          variants={{ rest: { y: 0 }, hover: { y: -6 } }}
          transition={SPRING_PANEL}
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-3xl border border-border bg-card shadow-md"
        >
          <h1 className="select-none font-bold leading-none tracking-tighter text-foreground [font-size:clamp(3.5rem,9vw,5rem)]">
            {code}
          </h1>
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            out of the deck
          </span>
        </motion.div>
      </motion.div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>

      <NotFoundActions
        homeHref={homeHref}
        homeLabel={homeLabel}
        browseHref={browseHref}
        browseLabel={browseLabel}
      />
    </NotFoundStage>
  );
}
