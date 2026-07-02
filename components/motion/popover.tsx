"use client";

import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import {
  cloneElement,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { EASE_OUT, SPRING_PANEL } from "@/lib/ease";
import { cn } from "@/lib/utils";

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";

const sideClass: Record<Side, string> = {
  top: "bottom-full",
  right: "left-full",
  bottom: "top-full",
  left: "right-full",
};

const alignClass: Record<Side, Record<Align, string>> = {
  top: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  bottom: {
    start: "left-0",
    center: "left-1/2 -translate-x-1/2",
    end: "right-0",
  },
  left: {
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
  right: {
    start: "top-0",
    center: "top-1/2 -translate-y-1/2",
    end: "bottom-0",
  },
};

const transformOrigin: Record<Side, Record<Align, string>> = {
  top: {
    start: "left bottom",
    center: "center bottom",
    end: "right bottom",
  },
  right: {
    start: "left top",
    center: "left center",
    end: "left bottom",
  },
  bottom: {
    start: "left top",
    center: "center top",
    end: "right top",
  },
  left: {
    start: "right top",
    center: "right center",
    end: "right bottom",
  },
};

function buildMotionVariants(side: Side): Variants {
  const yOffset = side === "top" ? 8 : side === "bottom" ? -8 : 0;
  const xOffset = side === "left" ? 8 : side === "right" ? -8 : 0;

  return {
    initial: {
      opacity: 0,
      scale: 0.94,
      filter: "blur(8px)",
      x: xOffset,
      y: yOffset,
    },
    animate: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      x: 0,
      y: 0,
      transition: {
        ...SPRING_PANEL,
        opacity: { duration: 0.18, ease: EASE_OUT },
        filter: { duration: 0.22, ease: EASE_OUT },
      },
    },
    exit: {
      opacity: 0,
      scale: 0.97,
      filter: "blur(4px)",
      x: xOffset * 0.45,
      y: yOffset * 0.45,
      transition: { duration: 0.12, ease: EASE_OUT },
    },
  };
}

const REDUCED_VARIANTS: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.14, ease: EASE_OUT } },
  exit: { opacity: 0, transition: { duration: 0.1, ease: EASE_OUT } },
};

export interface PopoverProps {
  trigger: ReactElement;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: Side;
  align?: Align;
  className?: string;
  contentClassName?: string;
  /** Additional offset in pixels, applied from the trigger edge. */
  sideOffset?: number;
  /** Close when pressing escape or clicking outside. Default true. */
  dismissable?: boolean;
}

export function Popover({
  trigger,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  side = "bottom",
  align = "center",
  className,
  contentClassName,
  sideOffset = 8,
  dismissable = true,
}: PopoverProps) {
  const reduce = useReducedMotion();
  const contentId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isControlled = open !== undefined;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = isControlled ? open : uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  useEffect(() => {
    if (!isOpen || !dismissable) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (!wrapperRef.current?.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, dismissable]);

  if (!isValidElement(trigger)) return null;

  const triggerElement = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    "aria-expanded": isOpen,
    "aria-haspopup": "dialog",
    "aria-controls": contentId,
    onClick: (event: ReactMouseEvent) => {
      const triggerProps = trigger.props as {
        onClick?: (ev: ReactMouseEvent) => void;
      };
      triggerProps.onClick?.(event);
      if (!event.defaultPrevented) setOpen(!isOpen);
    },
  });

  const variants = reduce ? REDUCED_VARIANTS : buildMotionVariants(side);

  return (
    <div ref={wrapperRef} className={cn("relative inline-flex", className)}>
      {triggerElement}
      <AnimatePresence>
        {isOpen ? (
          <div
            className={cn(
              "absolute z-50",
              sideClass[side],
              alignClass[side][align],
            )}
            style={
              side === "top" || side === "bottom"
                ? { marginTop: side === "bottom" ? sideOffset : undefined, marginBottom: side === "top" ? sideOffset : undefined }
                : { marginLeft: side === "right" ? sideOffset : undefined, marginRight: side === "left" ? sideOffset : undefined }
            }
          >
            <motion.div
              id={contentId}
              role="dialog"
              aria-modal="false"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              style={{
                transformOrigin: transformOrigin[side][align],
                willChange: "transform, opacity, filter",
              }}
              className={cn(
                "w-72 rounded-2xl border border-border bg-popover/90 p-4 text-popover-foreground shadow-2xl backdrop-blur-xl",
                contentClassName,
              )}
            >
              {children}
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
