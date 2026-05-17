"use client";

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const MotionBackdrop = motion.create(DialogBackdrop);
const MotionPanel = motion.create(DialogPanel);

type Side = "left" | "right" | "top" | "bottom";

export interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  title?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const sideStyles: Record<Side, string> = {
  left: "left-0 top-0 h-full w-[min(420px,90vw)] border-r",
  right: "right-0 top-0 h-full w-[min(420px,90vw)] border-l",
  top: "top-0 left-0 w-full max-h-[80vh] border-b",
  bottom: "bottom-0 left-0 w-full max-h-[80vh] border-t",
};

const initial: Record<Side, { x?: string; y?: string }> = {
  left: { x: "-100%" },
  right: { x: "100%" },
  top: { y: "-100%" },
  bottom: { y: "100%" },
};

export function Drawer({ open, onOpenChange, side = "right", title, description, children, className }: DrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <Dialog static open={open} onClose={onOpenChange} className="relative z-50">
          <MotionBackdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          <MotionPanel
            initial={initial[side]}
            animate={{ x: 0, y: 0 }}
            exit={initial[side]}
            transition={{ type: "spring", stiffness: 320, damping: 36 }}
            className={cn(
              "fixed border-(--color-border) bg-(--color-bg-elev) shadow-2xl",
              sideStyles[side],
              className,
            )}
          >
            <div className="flex items-start justify-between p-6">
              <div>
                {title ? <DialogTitle className="text-lg font-semibold text-(--color-fg)">{title}</DialogTitle> : null}
                {description ? <p className="mt-1 text-sm text-(--color-fg-muted)">{description}</p> : null}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-(--color-fg-muted) hover:bg-(--color-bg) hover:text-(--color-fg)"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-6 pb-6">{children}</div>
          </MotionPanel>
        </Dialog>
      ) : null}
    </AnimatePresence>
  );
}
