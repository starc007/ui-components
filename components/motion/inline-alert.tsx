"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type InlineAlertVariant = "info" | "success" | "warning" | "danger";

export interface InlineAlertProps {
  title: ReactNode;
  children?: ReactNode;
  variant?: InlineAlertVariant;
  className?: string;
  icon?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const VARIANT_CLASS: Record<InlineAlertVariant, string> = {
  info: "border-primary/20 bg-primary/8 text-foreground",
  success: "border-emerald-500/20 bg-emerald-500/10 text-foreground",
  warning: "border-amber-500/20 bg-amber-500/10 text-foreground",
  danger: "border-destructive/20 bg-destructive/10 text-foreground",
};

const ICON_CLASS: Record<InlineAlertVariant, string> = {
  info: "text-primary",
  success: "text-emerald-600 dark:text-emerald-400",
  warning: "text-amber-600 dark:text-amber-400",
  danger: "text-destructive",
};

const ICONS: Record<InlineAlertVariant, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: AlertTriangle,
};

export function InlineAlert({
  title,
  children,
  variant = "info",
  className,
  icon,
  action,
  dismissible = false,
  open,
  defaultOpen = true,
  onOpenChange,
}: InlineAlertProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const reduce = useReducedMotion();
  const visible = open ?? internalOpen;
  const Icon = ICONS[variant];

  const setOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <AnimatePresence initial={false}>
      {visible ? (
        <motion.div
          layout
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(8px)" }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(6px)" }}
          transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4 shadow-sm",
            VARIANT_CLASS[variant],
            className,
          )}
        >
          <div className="absolute inset-y-0 left-0 w-1 bg-current/15" aria-hidden />
          <div className="flex items-start gap-3">
            <motion.span
              initial={reduce ? false : { scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={reduce ? { duration: 0 } : { duration: 0.2, ease: EASE_OUT }}
              className={cn(
                "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background/70",
                ICON_CLASS[variant],
              )}
              aria-hidden
            >
              {icon ?? <Icon className="h-4 w-4" />}
            </motion.span>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{title}</p>
              {children ? (
                <div className="mt-1 text-sm leading-6 text-muted-foreground">{children}</div>
              ) : null}
              {action ? <div className="mt-3">{action}</div> : null}
            </div>

            {dismissible ? (
              <motion.button
                type="button"
                whileTap={reduce ? undefined : { scale: 0.92 }}
                transition={SPRING_PRESS}
                onClick={() => setOpen(false)}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/70 hover:text-foreground"
                aria-label="Dismiss alert"
              >
                <X className="h-4 w-4" />
              </motion.button>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
