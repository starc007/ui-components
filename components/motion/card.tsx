"use client";

import { motion, useReducedMotion } from "motion/react";
import { type ComponentPropsWithRef, createContext, useContext } from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type CardVariant = "outlined" | "muted";
export type CardSize = "default" | "compact";

const CardSizeContext = createContext<CardSize>("default");

const VARIANT_CLASS: Record<CardVariant, string> = {
  outlined: "border-border bg-background",
  muted: "border-transparent bg-muted",
};

// Each part pads itself on the inline axis, so a part can be left out without
// the others losing their edges. The root owns the block padding and the gap.
const ROOT_SIZE_CLASS: Record<CardSize, string> = {
  default: "gap-6 py-6",
  compact: "gap-4 py-4",
};
const INSET_CLASS: Record<CardSize, string> = {
  default: "px-6",
  compact: "px-4",
};

/**
 * Spread onto the one control that owns a selectable card (a Checkbox or
 * RadioGroupItem root) to stretch its hit area over the whole card. Any other
 * interactive element inside that card needs `relative z-10` to stay on top.
 */
export const CARD_TARGET_CLASS = "after:absolute after:inset-0";

export interface CardProps extends ComponentPropsWithRef<"div"> {
  /** Default "outlined". */
  variant?: CardVariant;
  /** Spacing for every part. Default "default". */
  size?: CardSize;
  /** Hover and press feedback, for a card that is one target as a whole. */
  interactive?: boolean;
  /** Marks a selectable card as chosen. Visual only; the control inside carries the state. */
  selected?: boolean;
}

export function Card({
  variant = "outlined",
  size = "default",
  interactive = false,
  selected = false,
  className,
  children,
  ...props
}: CardProps) {
  const reduce = useReducedMotion();
  return (
    <CardSizeContext.Provider value={size}>
      <motion.div
        {...(props as React.ComponentProps<typeof motion.div>)}
        data-slot="card"
        data-selected={selected || undefined}
        whileTap={interactive && !reduce ? { scale: 0.985 } : undefined}
        transition={SPRING_PRESS}
        className={cn(
          "relative flex flex-col rounded-2xl border text-card-foreground",
          "transition-[border-color,box-shadow,background-color] duration-200",
          VARIANT_CLASS[variant],
          ROOT_SIZE_CLASS[size],
          interactive && "cursor-pointer hover:border-border-strong has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-foreground",
          selected && "border-primary shadow-[0_0_0_1px_var(--primary)] hover:border-primary",
          className,
        )}
      >
        {children}
      </motion.div>
    </CardSizeContext.Provider>
  );
}

export type CardHeaderProps = ComponentPropsWithRef<"div">;

/** Title and description, with an optional CardAction pinned to the top right. */
export function CardHeader({ className, ...props }: CardHeaderProps) {
  const size = useContext(CardSizeContext);
  return (
    <div
      {...props}
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5",
        "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        INSET_CLASS[size],
        className,
      )}
    />
  );
}

export interface CardTitleProps extends ComponentPropsWithRef<"div"> {
  /** Heading level, when the card starts a section. Default "div". */
  as?: "div" | "h2" | "h3" | "h4";
}

export function CardTitle({ as: Tag = "div", className, ...props }: CardTitleProps) {
  return (
    <Tag
      {...props}
      data-slot="card-title"
      className={cn("text-[15px] leading-snug font-semibold text-foreground", className)}
    />
  );
}

export type CardDescriptionProps = ComponentPropsWithRef<"p">;

export function CardDescription({ className, ...props }: CardDescriptionProps) {
  return (
    <p
      {...props}
      data-slot="card-description"
      className={cn("text-sm leading-relaxed text-muted-foreground", className)}
    />
  );
}

export type CardActionProps = ComponentPropsWithRef<"div">;

/** Sits beside the title and description inside CardHeader. */
export function CardAction({ className, ...props }: CardActionProps) {
  return (
    // Flex, not block: an inline-flex control (Checkbox, Radio) would
    // otherwise sit on a text baseline that moves when its mark appears.
    <div
      {...props}
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex items-center self-start justify-self-end",
        className,
      )}
    />
  );
}

export type CardContentProps = ComponentPropsWithRef<"div">;

export function CardContent({ className, ...props }: CardContentProps) {
  const size = useContext(CardSizeContext);
  return <div {...props} data-slot="card-content" className={cn("text-sm", INSET_CLASS[size], className)} />;
}

export type CardFooterProps = ComponentPropsWithRef<"div">;

export function CardFooter({ className, ...props }: CardFooterProps) {
  const size = useContext(CardSizeContext);
  return (
    <div
      {...props}
      data-slot="card-footer"
      className={cn("flex items-center gap-2", INSET_CLASS[size], className)}
    />
  );
}
