"use client";

import { Dialog as HDialog, DialogPanel, DialogTitle, DialogBackdrop } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <AnimatePresence>
      {open ? (
        <HDialog static open={open} onClose={onOpenChange} className="relative z-50">
          <MotionBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <MotionPanel
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className={cn(
                "relative w-full max-w-md rounded-2xl border border-(--color-border) bg-(--color-bg-elev) p-6 shadow-2xl shadow-black/30",
                className,
              )}
            >
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-md text-(--color-fg-muted) hover:bg-(--color-bg) hover:text-(--color-fg)"
              >
                <X className="h-4 w-4" />
              </button>
              {title ? <DialogTitle className="text-lg font-semibold text-(--color-fg)">{title}</DialogTitle> : null}
              {description ? <p className="mt-1 text-sm text-(--color-fg-muted)">{description}</p> : null}
              {children ? <div className="mt-4">{children}</div> : null}
              {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
            </MotionPanel>
          </div>
        </HDialog>
      ) : null}
    </AnimatePresence>
  );
}
