"use client";

import { ChevronDown } from "lucide-react";
import { type HTMLMotionProps, motion, useReducedMotion } from "motion/react";
import {
  createContext,
  type Ref,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

type CollapsibleContextValue = {
  open: boolean;
  disabled: boolean;
  reduce: boolean;
  contentId: string;
  triggerId: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue | null>(null);

function useCollapsibleContext(component: string) {
  const context = useContext(CollapsibleContext);
  if (!context) throw new Error(`${component} must be used within <Collapsible>`);
  return context;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") return ref(node);
  if (ref) ref.current = node;
}

export interface CollapsibleProps extends Omit<HTMLMotionProps<"div">, "layout"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
}

export function Collapsible({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  disabled = false,
  className,
  children,
  style,
  ...props
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const open = controlledOpen ?? internalOpen;
  const reduce = useReducedMotion() ?? false;
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const toggle = useCallback(() => {
    if (disabled) return;
    const next = !open;
    if (controlledOpen === undefined) setInternalOpen(next);
    onOpenChange?.(next);
  }, [controlledOpen, disabled, onOpenChange, open]);
  const context = useMemo<CollapsibleContextValue>(
    () => ({ open, disabled, reduce, contentId: `${id}-content`, triggerId: `${id}-trigger`, triggerRef, toggle }),
    [disabled, id, open, reduce, toggle],
  );

  return (
    <CollapsibleContext.Provider value={context}>
      <motion.div
        {...props}
        layout={!reduce}
        transition={{ layout: SPRING_LAYOUT }}
        data-slot="collapsible"
        data-state={open ? "open" : "closed"}
        data-disabled={disabled || undefined}
        className={cn("relative w-full", className)}
        style={{ ...style, originY: 0 }}
      >
        <motion.div layout={reduce ? false : "position"} transition={{ layout: SPRING_LAYOUT }} style={{ originY: 0 }}>
          {children}
        </motion.div>
      </motion.div>
    </CollapsibleContext.Provider>
  );
}

export interface CollapsibleTriggerProps extends Omit<HTMLMotionProps<"button">, "id" | "layout"> {}

export function CollapsibleTrigger({
  className,
  children,
  onClick,
  disabled,
  ref,
  ...props
}: CollapsibleTriggerProps) {
  const context = useCollapsibleContext("CollapsibleTrigger");
  const setRef = useCallback((node: HTMLButtonElement | null) => {
    context.triggerRef.current = node;
    return assignRef(ref, node);
  }, [context.triggerRef, ref]);

  return (
    <motion.button
      {...props}
      ref={setRef}
      id={context.triggerId}
      type="button"
      disabled={context.disabled || disabled}
      aria-expanded={context.open}
      aria-controls={context.contentId}
      data-slot="collapsible-trigger"
      data-state={context.open ? "open" : "closed"}
      layout={context.reduce ? false : "position"}
      transition={{ layout: SPRING_LAYOUT }}
      className={cn(
        "flex min-h-10 w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-medium outline-none transition-colors hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggle();
      }}
    >
      {children}
    </motion.button>
  );
}

export interface CollapsibleContentProps extends Omit<HTMLMotionProps<"div">, "id" | "layout" | "animate" | "initial"> {
  contentClassName?: string;
}

export function CollapsibleContent({
  className,
  contentClassName,
  children,
  ref,
  style,
  ...props
}: CollapsibleContentProps) {
  const context = useCollapsibleContext("CollapsibleContent");
  const contentRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const setRef = useCallback((node: HTMLDivElement | null) => {
    contentRef.current = node;
    return assignRef(ref, node);
  }, [ref]);

  useLayoutEffect(() => {
    const node = innerRef.current;
    if (!node) return;
    const measure = () => setHeight(node.offsetHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    if (!context.open && contentRef.current?.contains(document.activeElement)) {
      context.triggerRef.current?.focus({ preventScroll: true });
    }
  }, [context.open, context.triggerRef]);

  return (
    <motion.div
      {...props}
      ref={setRef}
      id={context.contentId}
      role="region"
      aria-labelledby={context.triggerId}
      aria-hidden={!context.open}
      inert={!context.open}
      data-slot="collapsible-content"
      data-state={context.open ? "open" : "closed"}
      initial={false}
      layout={!context.reduce}
      transition={{ layout: SPRING_LAYOUT }}
      // A one-pixel closed box keeps transform projection continuous at zero.
      // Geometry changes once; the inner layout projection keeps text sharp.
      style={{ ...style, height: context.open ? height || "auto" : 1, originY: 0 }}
      className={cn("overflow-hidden", className)}
    >
      <motion.div
        ref={innerRef}
        layout={!context.reduce}
        style={{ originY: 0 }}
        initial={false}
        animate={{ opacity: context.open ? 1 : 0 }}
        transition={{ opacity: { duration: context.open ? 0.18 : 0.12, ease: EASE_OUT }, layout: SPRING_LAYOUT }}
        className={cn("flow-root", contentClassName)}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export interface CollapsibleIndicatorProps extends HTMLMotionProps<"span"> {}

export function CollapsibleIndicator({ className, children, ...props }: CollapsibleIndicatorProps) {
  const { open, reduce } = useCollapsibleContext("CollapsibleIndicator");
  return (
    <motion.span
      {...props}
      aria-hidden="true"
      data-slot="collapsible-indicator"
      initial={false}
      animate={{ transform: `rotate(${open ? 180 : 0}deg)` }}
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      className={cn("ml-auto inline-flex shrink-0 items-center justify-center text-muted-foreground", className)}
    >
      {children ?? <ChevronDown className="size-4" />}
    </motion.span>
  );
}
