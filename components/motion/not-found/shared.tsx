"use client";

import { motion, useReducedMotion } from "motion/react";
import { SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export interface NotFoundProps {
  className?: string;
  /** The big status code. */
  code?: string;
  title?: string;
  description?: string;
  homeHref?: string;
  homeLabel?: string;
  browseHref?: string;
  browseLabel?: string;
  /** Override any built-in string. Explicit `title`, `description`, `homeLabel` and `browseLabel` props still win. */
  labels?: Partial<NotFoundMessages>;
}

export const NOT_FOUND_DEFAULTS = {
  code: "404",
  homeHref: "/",
  browseHref: "/components/motion",
} as const;

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const notFoundMessages = {
  title: "Page not found",
  description: "The page you are looking for moved, vanished, or never existed.",
  homeLabel: "Back home",
  browseLabel: "Browse components",
  stackedCaption: "out of the deck",
  terminalError: "cd: no such file or directory: /page",
};

export type NotFoundMessages = typeof notFoundMessages;

/** Resolves a variant's strings: explicit props, then `labels`, the provider and English. */
export function useNotFoundMessages(labels?: Partial<NotFoundMessages>) {
  return useMessages("notFound", notFoundMessages, labels);
}

type ActionsProps = Pick<
  NotFoundProps,
  "homeHref" | "homeLabel" | "browseHref" | "browseLabel" | "labels" | "className"
>;

/** The shared dual CTA: a primary "Back home" and a secondary "Browse". */
export function NotFoundActions({
  homeHref = NOT_FOUND_DEFAULTS.homeHref,
  homeLabel,
  browseHref = NOT_FOUND_DEFAULTS.browseHref,
  browseLabel,
  labels,
  className,
}: ActionsProps) {
  const t = useNotFoundMessages(labels);
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const whileTap = reduce ? undefined : { scale: 0.96 };
  const whileHover = reduce || !canHover ? undefined : { scale: 1.02 };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3",
        className,
      )}
    >
      <motion.a
        href={homeHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        {homeLabel ?? t("homeLabel")}
      </motion.a>
      <motion.a
        href={browseHref}
        whileTap={whileTap}
        whileHover={whileHover}
        transition={SPRING_PRESS}
        className="inline-flex h-11 select-none items-center justify-center rounded-full border border-border bg-card px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted/60"
      >
        {browseLabel ?? t("browseLabel")}
      </motion.a>
    </div>
  );
}

/** Centers a variant and gives it a consistent minimum stage height. */
export function NotFoundStage({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[420px] w-full flex-col items-center justify-center gap-8 px-4 text-center",
        className,
      )}
    >
      {children}
    </div>
  );
}
