"use client";

import { EllipsisVertical, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { type ReactNode, useCallback, useState } from "react";
import { SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";
import { cn } from "@/lib/utils";

export interface CardFolderProps {
  title: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  card: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  detailsVisible?: boolean;
  defaultDetailsVisible?: boolean;
  onDetailsVisibleChange?: (visible: boolean) => void;
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
 * folds its front panel away and lifts the card into view; a separate privacy
 * control reveals its number and CVV without nesting controls in the folder.
 */
export function CardFolder({
  title,
  cardNumber,
  expiry,
  cvv,
  card,
  open,
  defaultOpen = false,
  onOpenChange,
  detailsVisible,
  defaultDetailsVisible = false,
  onDetailsVisibleChange,
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
  const [internalDetailsVisible, setInternalDetailsVisible] = useState(
    defaultDetailsVisible,
  );
  const openControlled = open !== undefined;
  const detailsControlled = detailsVisible !== undefined;
  const isOpen = open ?? internalOpen;
  const areDetailsVisible = detailsVisible ?? internalDetailsVisible;
  const transition = reduce ? { duration: 0 } : SPRING_LAYOUT;
  const normalizedCardNumber = cardNumber.replace(/\D/g, "");
  const visibleLastFour = normalizedCardNumber.slice(-4).padStart(4, "•");
  const revealedCardNumber =
    normalizedCardNumber.match(/.{1,4}/g)?.join(" ") ?? visibleLastFour;
  const maskedCvv = "•".repeat(Math.max(3, cvv.length));
  const defaultAriaLabel = `${isOpen ? "Close" : "Open"} ${title}, card ending in ${visibleLastFour}, expires ${expiry}`;

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

  const toggleDetails = () => {
    if (disabled) return;
    const nextVisible = !areDetailsVisible;
    if (!detailsControlled) setInternalDetailsVisible(nextVisible);
    onDetailsVisibleChange?.(nextVisible);
  };

  return (
    <div
      data-open={isOpen ? "true" : "false"}
      data-details-visible={areDetailsVisible ? "true" : "false"}
      className={cn(
        "relative aspect-[1029/592] w-96 max-w-full select-none [perspective:1200px]",
        className,
      )}
    >
      <motion.button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel ?? defaultAriaLabel}
        aria-expanded={isOpen}
        onClick={handleClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
        transition={reduce ? { duration: 0 } : SPRING_PRESS}
        className="absolute inset-0 block rounded-2xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        <motion.span
          data-slot="card-folder-back"
          aria-hidden="true"
          initial={false}
          animate={{ rotateX: isOpen && !reduce ? 12 : 0 }}
          transition={transition}
          className="absolute inset-x-0 bottom-0 top-[10%] rounded-2xl border border-foreground/10 bg-background [transform-origin:center_bottom]"
        />

        <motion.span
          aria-hidden="true"
          initial={false}
          animate={{
            y: isOpen && !reduce ? -14 : 0,
            scale: isOpen && !reduce ? 1.015 : 1,
          }}
          whileHover={
            canHover && !disabled && !isOpen && !reduce ? { y: -7 } : undefined
          }
          transition={transition}
          className={cn(
            "absolute left-[4.7%] right-[4.7%] top-0 aspect-[1.586/1] overflow-hidden rounded-xl border border-foreground/10 bg-background [transform-origin:center_bottom]",
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
                  y: isOpen ? 18 : 0,
                  rotateX: isOpen ? -68 : 0,
                  scaleY: isOpen ? 0.96 : 1,
                }
          }
          transition={transition}
          className="absolute inset-x-0 bottom-0 top-1/2 z-20 [backface-visibility:hidden] [transform-origin:center_bottom]"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 384 110"
            preserveAspectRatio="none"
            className="absolute inset-0 size-full overflow-visible"
          >
            <path
              d="M0 17C15 7 31 4 49 4H87C110 4 126 17 144 32L158 44C176 59 206 59 225 43L240 30C257 16 271 4 295 4H335C354 4 370 8 384 18V94C384 103 377 110 368 110H16C7 110 0 103 0 94Z"
              fill="var(--background)"
              stroke="var(--foreground)"
              strokeOpacity="0.12"
              vectorEffect="non-scaling-stroke"
            />
            <path
              d="M10 21C22 13 35 11 51 11H85C105 11 120 23 137 37L153 50C175 68 208 68 231 49L246 36C262 23 275 11 297 11H333C350 11 363 14 374 22V89C374 97 369 101 360 101H24C15 101 10 96 10 89Z"
              fill="none"
              stroke="var(--foreground)"
              strokeDasharray="5 5"
              strokeLinecap="round"
              strokeOpacity="0.22"
              vectorEffect="non-scaling-stroke"
            />
          </svg>

          <span className="absolute inset-x-[5%] inset-y-0 z-10 flex min-w-0 flex-col justify-between py-4">
            <span className="flex justify-end pt-2 pr-2">
              <span className="flex shrink-0 items-end gap-3.5">
                <span className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/65">
                    Expiry
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {expiry}
                  </span>
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground/65">
                    CVV
                  </span>
                  <span className="text-xs font-medium text-foreground tabular-nums">
                    {areDetailsVisible ? cvv : maskedCvv}
                  </span>
                </span>
              </span>
            </span>
            <span className="flex min-w-0 items-baseline justify-between gap-4">
              <span className="truncate text-lg font-medium leading-tight text-foreground">
                {title}
              </span>
              <span className="truncate font-mono text-xs tracking-[0.08em] tabular-nums">
                {areDetailsVisible ? (
                  <span className="text-foreground">{revealedCardNumber}</span>
                ) : (
                  <>
                    <span className="text-muted-foreground">
                      •••• •••• ••••{" "}
                    </span>
                    <span className="text-foreground">{visibleLastFour}</span>
                  </>
                )}
              </span>
            </span>
          </span>
        </motion.span>
      </motion.button>

      {!isOpen ? (
        <motion.button
          key="card-details-visibility"
          type="button"
          disabled={disabled}
          aria-label={
            areDetailsVisible ? "Hide card details" : "Show card details"
          }
          aria-pressed={areDetailsVisible}
          onClick={toggleDetails}
          initial={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
          }
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
          transition={
            reduce
              ? { duration: 0.12 }
              : { type: "spring", duration: 0.3, bounce: 0 }
          }
          className="absolute left-[2.6%] top-[65%] z-30 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={areDetailsVisible ? "hide" : "show"}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
              }
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.25, filter: "blur(4px)" }
              }
              transition={
                reduce
                  ? { duration: 0.12 }
                  : { type: "spring", duration: 0.3, bounce: 0 }
              }
              className="flex items-center justify-center"
            >
              {areDetailsVisible ? (
                <EyeOff className="size-4" aria-hidden="true" />
              ) : (
                <Eye className="size-4" aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      ) : null}

      {onAction ? (
        <motion.button
          type="button"
          disabled={disabled}
          aria-label={actionLabel ?? `Open actions for ${title}`}
          onClick={onAction}
          animate={{ y: isOpen && !reduce ? -14 : 0 }}
          whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
          transition={transition}
          className="absolute right-[2.6%] top-[10%] z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full text-white/65 outline-none transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          <EllipsisVertical className="size-4" aria-hidden="true" />
        </motion.button>
      ) : null}
    </div>
  );
}
