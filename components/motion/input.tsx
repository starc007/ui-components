"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

// Caret glide — snappy enough to feel attached to the keystroke, soft enough to read.
const CARET_SPRING = {
  type: "spring",
  stiffness: 700,
  damping: 40,
  mass: 0.5,
} as const;

// Horizontal padding inside the field, in px. Wider when an icon occupies the edge.
const EDGE_PAD = 14;
const ICON_PAD = 40;

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange"
> {
  label?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Truthy error triggers a shake, red border and (if a string) a message. */
  error?: string | boolean;
  success?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
}

export function Input({
  label,
  value: valueProp,
  defaultValue,
  onChange,
  error,
  success,
  leftIcon,
  rightIcon,
  className,
  disabled,
  id: idProp,
  type,
  ...rest
}: InputProps) {
  // Password masks characters as dots, so a plain-text mirror can't measure the
  // caret position. Use the native caret there; the gliding caret is for text.
  const customCaret = type !== "password";
  const reactId = useId();
  const id = idProp ?? reactId;
  const reduce = useReducedMotion();

  const controlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue ?? "");
  const value = controlled ? (valueProp ?? "") : internal;

  const [focused, setFocused] = useState(false);
  const [caretIndex, setCaretIndex] = useState<number | null>(null);
  const [caretX, setCaretX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const fieldRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);

  const hasError = Boolean(error);
  const errorMessage = typeof error === "string" ? error : null;
  const index = caretIndex ?? value.length;

  // Right edge shows the success check, otherwise the caller's right icon.
  const rightSlot = success ? null : rightIcon;
  const leftPad = leftIcon ? ICON_PAD : EDGE_PAD;
  const rightPad = rightSlot || success ? ICON_PAD : EDGE_PAD;

  // Measure text width up to the caret, and read the input's scroll so the
  // caret stays aligned once the value overflows and the field scrolls.
  useLayoutEffect(() => {
    if (mirrorRef.current) {
      mirrorRef.current.textContent = value.slice(0, index);
      setCaretX(mirrorRef.current.offsetWidth);
    }
    if (inputRef.current) setScrollLeft(inputRef.current.scrollLeft);
  }, [value, index]);

  // Shake the field when an error appears.
  useEffect(() => {
    if (!fieldRef.current || reduce || !hasError) return;
    animate(
      fieldRef.current,
      { x: [0, -6, 6, -4, 4, -2, 0] },
      { duration: 0.45 },
    );
  }, [hasError, reduce]);

  const handleChange = (next: string) => {
    if (!controlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="px-1 text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}

      <div
        ref={fieldRef}
        data-state={
          hasError
            ? "error"
            : success
              ? "success"
              : focused
                ? "focused"
                : "idle"
        }
        className={cn(
          "relative h-11 overflow-hidden rounded-full border transition-colors duration-200",
          "border-border",
          focused && !hasError && "border-foreground/40 ring-2 ring-ring/40",
          hasError && "border-destructive ring-2 ring-destructive/25",
          disabled && "opacity-60",
        )}
      >
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={inputRef}
          id={id}
          type={type}
          value={value}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={errorMessage ? `${id}-error` : undefined}
          style={{ paddingLeft: leftPad, paddingRight: rightPad }}
          onChange={(e) => {
            handleChange(e.target.value);
            setCaretIndex(e.target.selectionStart);
          }}
          onFocus={(e) => {
            setFocused(true);
            setCaretIndex(e.target.selectionStart);
          }}
          onBlur={() => setFocused(false)}
          onSelect={(e) => setCaretIndex(e.currentTarget.selectionStart)}
          onScroll={(e) => setScrollLeft(e.currentTarget.scrollLeft)}
          className={cn(
            "peer h-full w-full bg-transparent text-base leading-6 text-foreground outline-none",
            customCaret ? "caret-transparent" : "caret-foreground",
            "placeholder:text-muted-foreground/60",
            disabled && "cursor-not-allowed",
          )}
          {...rest}
        />

        {customCaret ? (
          <>
            {/* Hidden mirror measures caret x for the value up to the caret index. */}
            <span
              ref={mirrorRef}
              aria-hidden
              style={{ left: leftPad }}
              className="pointer-events-none invisible absolute top-1/2 -translate-y-1/2 whitespace-pre text-base leading-6"
            />

            {/* Custom caret glides between positions and blinks while focused. */}
            <motion.span
              aria-hidden
              initial={false}
              style={{ left: leftPad }}
              animate={{
                x: caretX - scrollLeft,
                opacity: focused && !disabled ? [1, 1, 0, 0] : 0,
              }}
              transition={{
                x: reduce ? { duration: 0 } : CARET_SPRING,
                opacity: focused
                  ? {
                      duration: 1,
                      repeat: Infinity,
                      times: [0, 0.5, 0.5, 1],
                      ease: "linear",
                    }
                  : { duration: 0.1 },
              }}
              className={cn(
                "pointer-events-none absolute top-1/2 h-5 w-px -translate-y-1/2 rounded-full bg-foreground",
                hasError && "bg-destructive",
                success && "bg-(--color-success)",
              )}
            />
          </>
        ) : null}

        {success ? (
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-(--color-success)"
          >
            <motion.path
              d="M5 12.5l4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </motion.svg>
        ) : rightSlot ? (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-muted-foreground [&_svg]:h-4 [&_svg]:w-4">
            {rightSlot}
          </span>
        ) : null}
      </div>

      <AnimatePresence initial={false}>
        {errorMessage ? (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -4, filter: "blur(4px)" }
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -4, filter: "blur(4px)" }
            }
            transition={{ duration: 0.2 }}
            className="px-1 text-xs text-destructive"
          >
            {errorMessage}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
