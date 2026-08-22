"use client";

import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  type Transition,
  useReducedMotion,
  type Variants,
} from "motion/react";
import {
  type MouseEvent,
  type ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { cn } from "@/lib/utils";

// Matches the Motion Patterns "Layout continuity" recipe so the surface
// keeps its identity while its footprint changes.
const CONTINUITY_SPRING: Transition = {
  type: "spring",
  stiffness: 220,
  damping: 17,
  mass: 0.85,
};

const CONTINUITY_LABEL: Variants = {
  hidden: { opacity: 0, filter: "blur(4px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(4px)" },
};

type ExpandableStateProps = {
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export interface ExpandableButtonProps
  extends Omit<HTMLMotionProps<"button">, "children">,
    ExpandableStateProps {
  icon: ReactNode;
  label: ReactNode;
}

export interface ExpandableChipProps extends ExpandableStateProps {
  label: ReactNode;
  actionIcon: ReactNode;
  actionLabel: string;
  onAction?: () => void;
  collapseOnAction?: boolean;
  disabled?: boolean;
  className?: string;
  labelClassName?: string;
  actionClassName?: string;
}

function useExpandableState({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
}: ExpandableStateProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isControlled = expanded !== undefined;
  const currentExpanded = expanded ?? internalExpanded;

  const setExpanded = useCallback(
    (nextExpanded: boolean) => {
      if (!isControlled) {
        setInternalExpanded(nextExpanded);
      }
      onExpandedChange?.(nextExpanded);
    },
    [isControlled, onExpandedChange],
  );

  return [currentExpanded, setExpanded] as const;
}

export function ExpandableButton({
  icon,
  label,
  expanded,
  defaultExpanded,
  onExpandedChange,
  className,
  onClick,
  disabled,
  type = "button",
  "aria-label": ariaLabel,
  ...props
}: ExpandableButtonProps) {
  const reduce = useReducedMotion();
  const [isExpanded, setExpanded] = useExpandableState({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) {
      setExpanded(!isExpanded);
    }
  };

  const transition = reduce ? { duration: 0 } : CONTINUITY_SPRING;

  return (
    <motion.span layout transition={transition} className="inline-flex">
      <motion.button
        {...props}
        layout
        type={type}
        aria-label={ariaLabel ?? (typeof label === "string" ? label : undefined)}
        aria-expanded={isExpanded}
        disabled={disabled}
        className={cn(
          "relative inline-flex h-11 min-w-11 items-center overflow-hidden rounded-full border border-border bg-transparent p-1 pr-1 text-sm font-medium text-foreground outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        style={{ borderRadius: 9999 }}
        onClick={handleClick}
        whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
        transition={transition}
      >
        <motion.span
          layout="position"
          className="grid size-9 shrink-0 place-items-center"
          aria-hidden="true"
          transition={transition}
        >
          {icon}
        </motion.span>
        <AnimatePresence mode="popLayout" initial={false}>
          {isExpanded ? (
            <motion.span
              key="label"
              layout
              variants={CONTINUITY_LABEL}
              initial={reduce ? { opacity: 0 } : "hidden"}
              animate={reduce ? { opacity: 1 } : "visible"}
              exit={reduce ? { opacity: 0 } : "exit"}
              transition={transition}
              className="relative inline-flex w-max items-center whitespace-nowrap pr-3"
              aria-hidden="true"
            >
              {label}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.button>
    </motion.span>
  );
}

export function ExpandableChip({
  label,
  actionIcon,
  actionLabel,
  onAction,
  collapseOnAction = true,
  expanded,
  defaultExpanded,
  onExpandedChange,
  disabled,
  className,
  labelClassName,
  actionClassName,
}: ExpandableChipProps) {
  const reduce = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [isExpanded, setExpanded] = useExpandableState({
    expanded,
    defaultExpanded,
    onExpandedChange,
  });

  const handleAction = () => {
    onAction?.();
    if (collapseOnAction) {
      setExpanded(false);
      triggerRef.current?.focus();
    }
  };

  const transition = reduce ? { duration: 0 } : CONTINUITY_SPRING;

  return (
    <motion.span layout transition={transition} className="inline-flex">
      <motion.div
        layout
        className={cn(
          "inline-flex h-10 items-center overflow-hidden rounded-full border border-border bg-transparent text-sm text-foreground has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inset has-[:focus-visible]:ring-ring",
          className,
        )}
        style={{ borderRadius: 9999 }}
        transition={transition}
      >
        <motion.button
          layout="position"
          ref={triggerRef}
          type="button"
          aria-expanded={isExpanded}
          disabled={disabled}
          className={cn(
            "h-full whitespace-nowrap py-0 pl-3 font-medium outline-none disabled:pointer-events-none disabled:opacity-50",
            isExpanded ? "pr-1" : "pr-3",
            labelClassName,
          )}
          onClick={() => setExpanded(!isExpanded)}
          transition={transition}
        >
          {label}
        </motion.button>
        <motion.span
          variants={CONTINUITY_LABEL}
          className={cn(
            "relative inline-flex h-10 shrink-0 items-center overflow-hidden",
            isExpanded ? "w-8" : "w-0",
          )}
          aria-hidden={!isExpanded}
          initial={false}
          animate={
            reduce
              ? { opacity: isExpanded ? 1 : 0 }
              : isExpanded
                ? "visible"
                : "hidden"
          }
          transition={transition}
        >
          <motion.button
            type="button"
            aria-label={actionLabel}
            disabled={disabled || !isExpanded}
            className={cn(
              "flex h-10 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground disabled:pointer-events-none",
              disabled && "opacity-50",
              actionClassName,
            )}
            onClick={handleAction}
            whileTap={reduce || disabled ? undefined : { scale: 0.97 }}
            transition={transition}
          >
            <span aria-hidden="true">{actionIcon}</span>
          </motion.button>
        </motion.span>
      </motion.div>
    </motion.span>
  );
}
