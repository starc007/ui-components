"use client";

import { Minus, Plus } from "lucide-react";
import {
  AnimatePresence,
  type HTMLMotionProps,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  createContext,
  type MouseEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

type StepDirection = -1 | 0 | 1;

type AdaptiveStepperContextValue = {
  value: number;
  valueText: string;
  direction: StepDirection;
  atMin: boolean;
  atMax: boolean;
  disabled: boolean;
  reduce: boolean;
  decrement: (restoreFocus: boolean) => void;
  increment: (restoreFocus: boolean) => void;
  decrementRef: React.MutableRefObject<HTMLButtonElement | null>;
  incrementRef: React.MutableRefObject<HTMLButtonElement | null>;
};

const AdaptiveStepperContext = createContext<AdaptiveStepperContextValue | null>(
  null,
);

function useAdaptiveStepperContext(component: string) {
  const context = useContext(AdaptiveStepperContext);
  if (!context) {
    throw new Error(`${component} must be used within <AdaptiveStepper>`);
  }
  return context;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function cleanNumber(value: number) {
  return Number(value.toFixed(10));
}

function nextStep(
  value: number,
  direction: -1 | 1,
  min: number,
  max: number,
  step: number,
) {
  if (direction === 1) {
    const nextIndex = Math.floor((value - min) / step + 1e-10) + 1;
    return cleanNumber(Math.min(max, min + nextIndex * step));
  }

  const previousIndex = Math.ceil((value - min) / step - 1e-10) - 1;
  return cleanNumber(Math.max(min, min + previousIndex * step));
}

function mergeRefs<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref && typeof ref === "object") {
        (ref as React.MutableRefObject<T | null>).current = node;
      }
    }
  };
}

export interface AdaptiveStepperProps {
  children: ReactNode;
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  name?: string;
  formatValueText?: (value: number) => string;
  className?: string;
  "aria-label"?: string;
}

export function AdaptiveStepper({
  children,
  value: controlledValue,
  defaultValue = 0,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  disabled = false,
  name,
  formatValueText,
  className,
  "aria-label": ariaLabel = "Quantity",
}: AdaptiveStepperProps) {
  const reduce = useReducedMotion() ?? false;
  const labelId = useId();
  const decrementRef = useRef<HTMLButtonElement>(null);
  const incrementRef = useRef<HTMLButtonElement>(null);
  const lower = Number.isFinite(min) ? min : 0;
  const suppliedMax = Number.isFinite(max) ? max : lower;
  const upper = suppliedMax > lower ? suppliedMax : lower;
  const stride = Number.isFinite(step) && step > 0 ? step : 1;
  const [internalValue, setInternalValue] = useState(() =>
    clamp(Number.isFinite(defaultValue) ? defaultValue : lower, lower, upper),
  );
  const controlled = controlledValue !== undefined;
  const suppliedValue = controlled ? controlledValue : internalValue;
  const currentValue = clamp(
    Number.isFinite(suppliedValue) ? suppliedValue : lower,
    lower,
    upper,
  );
  const previousValueRef = useRef(currentValue);
  const currentValueRef = useRef(currentValue);
  const direction: StepDirection =
    currentValue === previousValueRef.current
      ? 0
      : currentValue > previousValueRef.current
        ? 1
        : -1;

  useLayoutEffect(() => {
    previousValueRef.current = currentValue;
    currentValueRef.current = currentValue;
  }, [currentValue]);

  const commit = useCallback(
    (nextValue: number, restoreFocus: boolean) => {
      const next = clamp(cleanNumber(nextValue), lower, upper);
      if (next === currentValue) return;
      if (!controlled) setInternalValue(next);
      onValueChange?.(next);

      if (!restoreFocus) return;
      requestAnimationFrame(() => {
        if (next === upper && currentValueRef.current === upper) {
          decrementRef.current?.focus();
        } else if (next === lower && currentValueRef.current === lower) {
          incrementRef.current?.focus();
        }
      });
    },
    [controlled, currentValue, lower, onValueChange, upper],
  );

  const decrement = useCallback(
    (restoreFocus: boolean) => {
      if (disabled || currentValue <= lower) return;
      commit(nextStep(currentValue, -1, lower, upper, stride), restoreFocus);
    },
    [commit, currentValue, disabled, lower, stride, upper],
  );

  const increment = useCallback(
    (restoreFocus: boolean) => {
      if (disabled || currentValue >= upper) return;
      commit(nextStep(currentValue, 1, lower, upper, stride), restoreFocus);
    },
    [commit, currentValue, disabled, lower, stride, upper],
  );

  const valueText = formatValueText?.(currentValue) ?? String(currentValue);
  const context = useMemo<AdaptiveStepperContextValue>(
    () => ({
      value: currentValue,
      valueText,
      direction,
      atMin: currentValue <= lower,
      atMax: currentValue >= upper,
      disabled,
      reduce,
      decrement,
      increment,
      decrementRef,
      incrementRef,
    }),
    [
      currentValue,
      decrement,
      direction,
      disabled,
      increment,
      lower,
      reduce,
      upper,
      valueText,
    ],
  );

  return (
    <AdaptiveStepperContext.Provider value={context}>
      <fieldset
        disabled={disabled}
        className={cn(
          "relative m-0 inline-grid h-12 w-[12.5rem] grid-cols-[3rem_5.5rem_3rem] items-stretch gap-2 border-0 p-0",
          className,
        )}
      >
        <legend id={labelId} className="sr-only">
          {ariaLabel}. Current value: {valueText}
        </legend>
        {children}
        {name ? <input type="hidden" name={name} value={currentValue} /> : null}
      </fieldset>
    </AdaptiveStepperContext.Provider>
  );
}

export interface AdaptiveStepperActionProps
  extends Omit<HTMLMotionProps<"button">, "children" | "onClick"> {
  children?: ReactNode;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  ref?: Ref<HTMLButtonElement>;
}

function StepperAction({
  direction,
  children,
  className,
  onClick,
  ref,
  style,
  "aria-label": ariaLabel,
  ...props
}: AdaptiveStepperActionProps & { direction: -1 | 1 }) {
  const context = useAdaptiveStepperContext("AdaptiveStepper action");
  const hidden = direction === -1 ? context.atMin : context.atMax;
  const actionRef =
    direction === -1 ? context.decrementRef : context.incrementRef;
  const label =
    ariaLabel ?? (direction === -1 ? "Decrease value" : "Increase value");
  const action = direction === -1 ? context.decrement : context.increment;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      {!hidden ? (
        <motion.button
          {...props}
          ref={mergeRefs(ref, actionRef)}
          key={direction === -1 ? "decrement" : "increment"}
          layout
          type="button"
          aria-label={label}
          disabled={context.disabled}
          initial={
            context.reduce
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  filter: "blur(6px)",
                  transform: "scale(0.92)",
                }
          }
          animate={{
            opacity: 1,
            filter: "blur(0px)",
            transform: "scale(1)",
          }}
          exit={
            context.reduce
              ? { opacity: 0, transition: { duration: 0.12, ease: EASE_OUT } }
              : {
                  opacity: 0,
                  filter: "blur(6px)",
                  transform: "scale(0.92)",
                  transition: { duration: 0.12, ease: EASE_OUT },
                }
          }
          whileTap={
            context.reduce || context.disabled
              ? undefined
              : { transform: "scale(0.94)" }
          }
          transition={
            context.reduce
              ? { duration: 0 }
              : {
                  layout: SPRING_LAYOUT,
                  opacity: { duration: 0.16, ease: EASE_OUT },
                  filter: { duration: 0.16, ease: EASE_OUT },
                  transform: SPRING_PRESS,
                }
          }
          style={{ ...style, gridColumn: direction === -1 ? "1" : "3" }}
          className={cn(
            "relative z-10 grid size-12 place-items-center rounded-2xl border border-border bg-background text-foreground shadow-sm outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
            className,
          )}
          onClick={(event) => {
            onClick?.(event);
            if (!event.defaultPrevented) action(event.detail === 0);
          }}
        >
          <span aria-hidden="true">
            {children ??
              (direction === -1 ? (
                <Minus className="size-5" strokeWidth={2.5} />
              ) : (
                <Plus className="size-5" strokeWidth={2.5} />
              ))}
          </span>
        </motion.button>
      ) : null}
    </AnimatePresence>
  );
}

export function AdaptiveStepperDecrement(props: AdaptiveStepperActionProps) {
  return <StepperAction {...props} direction={-1} />;
}

export interface AdaptiveStepperValueProps
  extends Omit<HTMLMotionProps<"output">, "children"> {
  children?: ReactNode | ((value: number) => ReactNode);
}

export function AdaptiveStepperValue({
  children,
  className,
  style,
  ...props
}: AdaptiveStepperValueProps) {
  const context = useAdaptiveStepperContext("AdaptiveStepperValue");
  const gridColumn =
    context.atMin && context.atMax
      ? "1 / 4"
      : context.atMin
        ? "1 / 3"
        : context.atMax
          ? "2 / 4"
          : "2";
  const displayValue =
    typeof children === "function" ? children(context.value) : children;
  const enterFrom = context.direction >= 0 ? "65%" : "-65%";
  const exitTo = context.direction >= 0 ? "-65%" : "65%";

  return (
    <motion.output
      {...props}
      layout
      aria-live="polite"
      aria-atomic="true"
      transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT}
      style={{ ...style, gridColumn }}
      className={cn(
        "relative z-0 flex h-12 min-w-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background px-4 text-lg font-semibold tabular-nums text-foreground shadow-sm",
        className,
      )}
    >
      <span className="sr-only">{context.valueText}</span>
      <span aria-hidden="true" className="relative grid place-items-center">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={context.value}
            initial={
              context.reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    filter: "blur(4px)",
                    transform: `translateY(${enterFrom})`,
                  }
            }
            animate={{
              opacity: 1,
              filter: "blur(0px)",
              transform: "translateY(0%)",
            }}
            exit={
              context.reduce
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    filter: "blur(4px)",
                    transform: `translateY(${exitTo})`,
                  }
            }
            transition={{ duration: 0.18, ease: EASE_OUT }}
            className="col-start-1 row-start-1"
          >
            {displayValue ?? context.value}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.output>
  );
}

export function AdaptiveStepperIncrement(props: AdaptiveStepperActionProps) {
  return <StepperAction {...props} direction={1} />;
}
