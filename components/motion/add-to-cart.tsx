"use client";

import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DigitSwap } from "@/components/motion/digit-swap";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { useSound } from "@/lib/sound";
import { deleteSound } from "@/lib/sounds/delete";
import { dropSound } from "@/lib/sounds/drop";
import { tickSound } from "@/lib/sounds/tick";
import { cn } from "@/lib/utils";

export const addToCartMessages = {
  add: "Add to cart",
  increase: "Add one",
  decrease: "Remove one",
  remove: "Remove from cart",
  quantity: "{count} in cart",
};

export type AddToCartMessages = typeof addToCartMessages;

export interface AddToCartProps {
  quantity?: number;
  defaultQuantity?: number;
  onQuantityChange?: (quantity: number) => void;
  /** Most items one cart line can hold. */
  max?: number;
  disabled?: boolean;
  labels?: Partial<AddToCartMessages>;
  /** Play a drop on add, a tick per step and a crumple on remove. Off by default; a `SoundProvider` can mute it app-wide. */
  sound?: boolean;
  /**
   * Resize the pill to fit each face (default). Turn it off and give it a
   * width, for example `w-full`, to keep one size in both states.
   */
  morphWidth?: boolean;
  className?: string;
}

const EXIT = { duration: 0.14, ease: EASE_OUT } as const;
// Faces fade in fast so the swap never shows an empty pill.
const FADE_IN = { duration: 0.12, ease: EASE_OUT } as const;
// The controls start this far toward the centre, so the stepper unfolds out
// of the spot the label left, and folds back into it.
const SPREAD = 10;

/**
 * An add to cart button that morphs into a quantity stepper: the pill
 * resizes, the label folds away, and minus and plus open out from the
 * centre around a rolling count. Removing the last item folds it back.
 */
export function AddToCart({
  quantity: quantityProp,
  defaultQuantity = 0,
  onQuantityChange,
  max = 99,
  disabled = false,
  labels,
  sound = false,
  morphWidth = true,
  className,
}: AddToCartProps) {
  const t = useMessages("AddToCart", addToCartMessages, labels);
  const reduce = Boolean(useReducedMotion());
  const [internal, setInternal] = useState(defaultQuantity);
  const quantity = quantityProp ?? internal;
  const playAdd = useSound(dropSound, { enabled: sound });
  const playStep = useSound(tickSound, { enabled: sound });
  const playRemove = useSound(deleteSound, { enabled: sound });
  const [direction, setDirection] = useState<"up" | "down">("up");
  const inCart = quantity > 0;

  // Focus follows the face the user's own press swapped in.
  const moveFocus = useRef(false);
  const addRef = useRef<HTMLButtonElement>(null);
  const increaseRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (inCart ? increaseRef : addRef).current?.focus();
  }, [inCart]);

  const change = (next: number) => {
    const clamped = Math.max(0, Math.min(max, next));
    if (clamped === quantity) return;
    if (quantity === 0) playAdd();
    else if (clamped === 0) playRemove();
    else playStep({ pitch: clamped > quantity ? 1.1 : 0.9 });
    if (clamped > 0 !== inCart) moveFocus.current = true;
    setDirection(clamped > quantity ? "up" : "down");
    if (quantityProp === undefined) setInternal(clamped);
    onQuantityChange?.(clamped);
  };

  // The pill springs to the measured width of the face on show. Measured
  // and animated directly rather than through layout projection, which
  // can misplace children inside columns or transformed parents.
  const faceRef = useRef<HTMLElement | null>(null);
  const [width, setWidth] = useState<number>();
  useLayoutEffect(() => {
    if (!morphWidth) return;
    const next = faceRef.current?.offsetWidth;
    if (!next) return;
    setWidth((current) => (current === next ? current : next));
  });

  const blur = reduce ? "blur(0px)" : "blur(3px)";
  const side = (offset: number) => ({
    initial: { opacity: 0, x: reduce ? 0 : offset, filter: blur },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    exit: { opacity: 0, x: reduce ? 0 : offset, filter: blur, transition: EXIT },
    transition: { ...SPRING_SWAP, opacity: FADE_IN },
  });
  const stepButton = cn(
    "inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-colors",
    // Inset rings: the pill clips anything drawn outside it.
    "hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground/60",
    "disabled:pointer-events-none disabled:opacity-50",
  );

  return (
    <motion.div
      initial={false}
      animate={morphWidth && width ? { width } : undefined}
      transition={reduce ? { duration: 0 } : SPRING_SWAP}
      className={cn(
        "relative inline-flex h-10 items-center justify-center overflow-hidden rounded-full bg-primary text-sm font-medium text-primary-foreground",
        disabled && "opacity-50",
        className,
      )}
    >
      {/* The face on show stays in flow and sets the target width; the one
          leaving pops out of flow and fades over it. */}
      <AnimatePresence initial={false} mode="popLayout">
        {inCart ? (
          <motion.div
            key="stepper"
            ref={(node) => {
              faceRef.current = node;
            }}
            className="flex shrink-0 items-center gap-1 px-1"
          >
            <motion.button
              type="button"
              className={stepButton}
              disabled={disabled}
              aria-label={quantity === 1 ? t("remove") : t("decrease")}
              onClick={() => change(quantity - 1)}
              {...side(SPREAD)}
            >
              <span aria-hidden="true" className="relative inline-flex size-4 items-center justify-center">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={quantity === 1 ? "trash" : "minus"}
                    className="absolute inset-0 inline-flex items-center justify-center"
                    initial={{ opacity: 0, y: reduce ? 0 : 6, filter: blur }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: reduce ? 0 : -6, filter: blur, transition: EXIT }}
                    transition={SPRING_SWAP}
                  >
                    {quantity === 1 ? <Trash2 className="size-4" /> : <Minus className="size-4" />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </motion.button>
            <motion.span
              aria-live="polite"
              className="min-w-8 text-center tabular-nums"
              initial={{ opacity: 0, filter: blur }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: blur, transition: EXIT }}
              transition={SPRING_SWAP}
            >
              <span className="sr-only">{t("quantity", { count: quantity })}</span>
              <span aria-hidden="true">
                <DigitSwap value={quantity} direction={direction} />
              </span>
            </motion.span>
            <motion.button
              ref={increaseRef}
              type="button"
              className={stepButton}
              disabled={disabled || quantity >= max}
              aria-label={t("increase")}
              onClick={() => change(quantity + 1)}
              {...side(-SPREAD)}
            >
              <Plus aria-hidden="true" className="size-4" />
            </motion.button>
          </motion.div>
        ) : (
          <motion.button
            key="add"
            ref={(node) => {
              addRef.current = node;
              faceRef.current = node;
            }}
            type="button"
            disabled={disabled}
            onClick={() => change(1)}
            initial={{ opacity: 0, scale: reduce ? 1 : 0.92, filter: blur }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: reduce ? 1 : 0.92, filter: blur, transition: EXIT }}
            transition={{ ...SPRING_SWAP, opacity: FADE_IN }}
            className={cn(
              "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full px-5 whitespace-nowrap",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-foreground/60",
            )}
          >
            <ShoppingBag aria-hidden="true" className="size-4" />
            {t("add")}
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
