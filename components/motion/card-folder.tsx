"use client";

import { EllipsisVertical } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useCallback, useState, type ReactNode } from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface CardFolderProps {
  title: string;
  description?: string;
  card: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClick?: () => void;
  onAction?: () => void;
  ariaLabel?: string;
  actionLabel?: string;
  disabled?: boolean;
  className?: string;
  cardClassName?: string;
}

/**
 * A landscape card tucked into an animated folder sleeve. Pressing the folder
 * folds its front panel away and lifts the card into view while its overflow
 * action remains a separate, valid control beside the primary button.
 */
export function CardFolder({
  title,
  description,
  card,
  open,
  defaultOpen = false,
  onOpenChange,
  onClick,
  onAction,
  ariaLabel,
  actionLabel,
  disabled = false,
  className,
  cardClassName,
}: CardFolderProps) {
  const reduce = useReducedMotion();
  const canHover = useHoverCapable();
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const openControlled = open !== undefined;
  const isOpen = open ?? internalOpen;
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (disabled) return;
      if (!openControlled) setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    [disabled, onOpenChange, openControlled],
  );

  const handleClick = () => {
    setOpen(!isOpen);
    onClick?.();
  };

  return (
    <div
      data-open={isOpen ? "true" : "false"}
      className={cn(
        "relative aspect-[1029/592] w-full max-w-[34rem] select-none [perspective:1200px]",
        className,
      )}
    >
      <motion.button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? `${isOpen ? "Close" : "Open"} ${title}`}
        aria-expanded={isOpen}
        onClick={handleClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
        transition={reduce ? { duration: 0 } : SPRING_PRESS}
        className="absolute inset-0 block rounded-[clamp(1.75rem,5vw,3rem)] text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{ rotateX: isOpen && !reduce ? 12 : 0 }}
          transition={transition}
          className="absolute inset-x-0 bottom-0 top-[10%] rounded-[clamp(1.75rem,5vw,3rem)] bg-card shadow-[0_8px_20px_-12px_rgb(0_0_0/0.18)] ring-1 ring-black/[0.08] [transform-origin:center_bottom] dark:ring-white/10"
        />

        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            y: isOpen && !reduce ? -18 : 0,
            scale: isOpen && !reduce ? 1.02 : 1,
          }}
          whileHover={
            canHover && !disabled && !isOpen && !reduce ? { y: -8 } : undefined
          }
          transition={transition}
          className={cn(
            "absolute left-[4.3%] right-[4.3%] top-0 aspect-[1.586/1] overflow-hidden rounded-[clamp(1.25rem,4vw,2.5rem)] bg-foreground shadow-[0_14px_32px_-18px_rgb(0_0_0/0.45)] ring-1 ring-inset ring-black/10 [transform-origin:center_bottom] dark:shadow-[0_14px_32px_-18px_rgb(0_0_0/0.75)] dark:ring-white/10",
            cardClassName,
          )}
        >
          {card}
        </motion.span>

        <motion.span
          aria-hidden="true"
          initial={false}
          animate={
            reduce
              ? { opacity: isOpen ? 0.12 : 1 }
              : {
                  y: isOpen ? 22 : 0,
                  rotateX: isOpen ? -68 : 0,
                  scaleY: isOpen ? 0.96 : 1,
                }
          }
          transition={transition}
          className="absolute inset-x-0 bottom-0 top-[64%] z-20 overflow-hidden rounded-b-[clamp(1.75rem,5vw,3rem)] bg-card [backface-visibility:hidden] [transform-origin:center_bottom]"
        >
          <span className="absolute inset-x-[4.2%] inset-y-0 flex min-w-0 flex-col justify-center pr-12">
            <span className="truncate text-[clamp(1rem,4.4vw,1.75rem)] font-medium leading-tight text-foreground">
              {title}
            </span>
            {description ? (
              <span className="mt-[2%] truncate text-[clamp(0.75rem,3.5vw,1.25rem)] leading-tight text-muted-foreground">
                {description}
              </span>
            ) : null}
          </span>
        </motion.span>
      </motion.button>

      {onAction ? (
        <motion.button
          type="button"
          disabled={disabled}
          aria-label={actionLabel ?? `Open actions for ${title}`}
          onClick={onAction}
          animate={{ y: isOpen && !reduce ? 14 : 0 }}
          whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
          transition={transition}
          className="absolute right-[2.6%] top-[82%] z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EllipsisVertical className="size-5" aria-hidden="true" />
        </motion.button>
      ) : null}
    </div>
  );
}
