"use client";

import {
  AnimatePresence,
  animate,
  motion,
  useReducedMotion,
} from "motion/react";
import { useEffect, useId, useRef, useState } from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type OTPStatus = "idle" | "error" | "success";

export interface OTPInputProps {
  /** Number of slots. Default 6. */
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  /** Fires once every slot is filled. */
  onComplete?: (value: string) => void;
  /** Optional label rendered above the slots. */
  label?: string;
  /** Helper text shown below the slots while idle. */
  hint?: string;
  /** Message shown below the slots when status is "success". */
  successMessage?: string;
  /** Message shown below the slots when status is "error". */
  errorMessage?: string;
  /** External validation feedback. "error" shakes, "success" draws a check. */
  status?: OTPStatus;
  /** Render dots instead of the typed digits. */
  mask?: boolean;
  disabled?: boolean;
  autoFocus?: boolean;
  /** Accessible label for the underlying input. */
  "aria-label"?: string;
  className?: string;
}

export function OTPInput({
  length = 6,
  value: controlledValue,
  defaultValue = "",
  onChange,
  onComplete,
  label,
  hint,
  successMessage,
  errorMessage,
  status = "idle",
  mask = false,
  disabled = false,
  autoFocus = false,
  "aria-label": ariaLabel = "One-time passcode",
  className,
}: OTPInputProps) {
  const uid = useId();
  const reduce = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const slotsRef = useRef<HTMLDivElement>(null);

  const controlled = controlledValue !== undefined;

  // Source of truth is a fixed-length array, so a cleared middle slot stays an
  // in-place hole instead of collapsing the digits after it to the left.
  const [slots, setSlots] = useState<string[]>(() =>
    toSlots(controlled ? controlledValue : defaultValue, length),
  );
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(0);

  const joined = slots.join("");
  const joinedRef = useRef(joined);

  useEffect(() => {
    joinedRef.current = joined;
  }, [joined]);

  // Pull in external value changes; skip when the parent is just echoing our own
  // onChange, so internal holes survive the controlled round-trip.
  useEffect(() => {
    if (!controlled) return;
    const incoming = sanitize(controlledValue, length);
    if (incoming !== joinedRef.current) setSlots(toSlots(incoming, length));
  }, [controlled, controlledValue, length]);

  const commit = (next: string[]) => {
    const wasComplete = slots.every((c) => c !== "");
    setSlots(next);
    const str = next.join("");
    onChange?.(str);
    // Fire only on the empty→full transition, not on every edit of a full code.
    if (!wasComplete && next.every((c) => c !== "")) onComplete?.(str);
  };

  const clearSlot = (idx: number) => {
    const next = [...slots];
    next[idx] = "";
    commit(next);
  };

  const slotFromClientX = (clientX: number) => {
    const els = slotsRef.current?.children;
    if (!els) return 0;
    for (let i = 0; i < els.length; i++) {
      if (clientX < els[i].getBoundingClientRect().right) return i;
    }
    return length - 1;
  };

  // Single insertion path: one digit overwrites the active slot and advances; a
  // multi-digit chunk (paste / SMS autofill) fills forward from the active slot.
  const insert = (raw: string, from = active) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return;
    const next = [...slots];
    let i = from;
    for (const ch of digits) {
      if (i >= length) break;
      next[i] = ch;
      i++;
    }
    commit(next);
    setActive(Math.min(i, length - 1));
  };

  // The keyboard is the single source of truth: preventDefault on keydown
  // reliably blocks native insertion (unlike beforeinput in React), so the hidden
  // input never accumulates a competing string and slot holes survive.
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled || e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (/^[0-9]$/.test(k)) {
      e.preventDefault();
      insert(k);
    } else if (k === "Backspace") {
      e.preventDefault();
      // A filled slot clears in place; an empty slot steps back and clears there.
      if (slots[active]) {
        clearSlot(active);
      } else if (active > 0) {
        clearSlot(active - 1);
        setActive((current) => Math.max(current - 1, 0));
      }
    } else if (k === "Delete") {
      e.preventDefault();
      clearSlot(active);
    } else if (k === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (k === "ArrowRight") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, length - 1));
    } else if (k === "Home") {
      e.preventDefault();
      setActive(0);
    } else if (k === "End") {
      e.preventDefault();
      setActive(length - 1);
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    // preventDefault suppresses the duplicate onChange, keeping that path autofill-only.
    e.preventDefault();
    insert(e.clipboardData.getData("text"), active);
  };

  // Autofill path: SMS one-time-code arrives as a whole value in one shot.
  // Keystrokes go through onKeyDown and paste through onPaste, so only autofill
  // reaches here — spread it across the slots from the start.
  const onChangeNative = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = sanitize(e.target.value, length);
    if (!digits) return;
    commit(toSlots(digits, length));
    setActive(Math.min(digits.length, length - 1));
  };

  // Error shake — imperative so it replays on every transition into "error".
  useEffect(() => {
    if (status !== "error" || reduce || !slotsRef.current) return;
    animate(
      slotsRef.current,
      { x: [0, -5, 5, -3, 3, -1, 0] },
      { duration: 0.45, ease: EASE_OUT },
    );
  }, [status, reduce]);

  const showSuccess = status === "success";
  const activeIndex = focused ? active : -1;
  const message = showSuccess
    ? successMessage
    : status === "error"
      ? errorMessage
      : hint;

  return (
    <div className={cn("inline-flex flex-col gap-2", className)}>
      {label ? (
        <label
          htmlFor={`${uid}-input`}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      ) : null}
      <fieldset
        className="relative m-0 inline-flex w-max border-0 p-0"
        onMouseDown={(e) => {
          if (disabled) return;
          // Suppress the native click-caret; we drive the active slot ourselves.
          e.preventDefault();
          // Clamp to the first empty slot so a click can't jump ahead of progress.
          const firstEmpty = slots.indexOf("");
          const cap = firstEmpty === -1 ? length - 1 : firstEmpty;
          setActive(Math.min(slotFromClientX(e.clientX), cap));
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          id={`${uid}-input`}
          inputMode="numeric"
          autoComplete="one-time-code"
          // biome-ignore lint/a11y/noAutofocus: opt-in via prop for OTP-first screens.
          autoFocus={autoFocus}
          disabled={disabled}
          aria-label={ariaLabel}
          aria-invalid={status === "error"}
          // Kept empty on purpose — our state owns the digits, native holds none.
          value=""
          maxLength={length}
          onKeyDown={onKeyDown}
          onChange={onChangeNative}
          onPaste={onPaste}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          // Transparent overlay owns focus, the soft keyboard, paste and autofill;
          // the slots below are purely presentational.
          className="absolute inset-0 z-20 h-full w-full cursor-text bg-transparent text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        />

        <div ref={slotsRef} className="flex items-center gap-2">
          {Array.from({ length }, (_, i) => {
            const char = slots[i] ?? "";
            const isActive = i === activeIndex;
            return (
              <div
                // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length slot grid, never reordered.
                key={`${uid}-${i}`}
                data-active={isActive}
                data-filled={char !== ""}
                className={cn(
                  "relative grid h-14 w-12 place-items-center overflow-hidden rounded-xl border text-xl font-semibold tabular-nums transition-colors duration-200",
                  showSuccess
                    ? "border-emerald-500/60 text-foreground"
                    : status === "error"
                      ? "border-destructive/60 text-foreground"
                      : char
                        ? "border-border-strong text-foreground"
                        : "border-border text-muted-foreground",
                  // Active slot reads stronger; twMerge lets this win the border.
                  isActive && !showSuccess && status !== "error" && "border-foreground",
                  disabled && "opacity-50",
                )}
              >
                {/* Blinking caret marks the active slot — centered when empty,
                    trailing the digit when the slot is already filled. */}
                {isActive && !showSuccess ? (
                  <motion.span
                    aria-hidden
                    animate={reduce ? undefined : { opacity: [1, 1, 0, 0] }}
                    transition={
                      reduce
                        ? undefined
                        : { duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
                    }
                    className={cn(
                      "pointer-events-none absolute top-1/2 h-6 w-px -translate-y-1/2 bg-foreground",
                      char ? "right-3" : "left-1/2 -translate-x-1/2",
                    )}
                  />
                ) : null}

                {/* Digits roll vertically. Each is absolutely centered so enter and
                    exit overlap in place — no in-flow reflow, no sideways drift. */}
                <AnimatePresence initial={false}>
                  {char ? (
                    <motion.span
                      key={char}
                      initial={
                        reduce
                          ? { opacity: 0 }
                          : { y: 14, opacity: 0, filter: "blur(4px)" }
                      }
                      animate={
                        reduce
                          ? { opacity: 1 }
                          : { y: 0, opacity: 1, filter: "blur(0px)" }
                      }
                      exit={
                        reduce
                          ? { opacity: 0 }
                          : { y: -14, opacity: 0, filter: "blur(4px)" }
                      }
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.22, ease: EASE_OUT }
                      }
                      className="absolute inset-0 grid place-items-center leading-none"
                    >
                      {mask ? "•" : char}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {showSuccess ? (
            <motion.span
              initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 500, damping: 28 }
              }
              className="pointer-events-none absolute -right-7 top-1/2 -translate-y-1/2 text-emerald-500"
              aria-hidden
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Verified</title>
                <motion.path
                  d="M5 13l4 4L19 7"
                  initial={reduce ? { pathLength: 1 } : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={
                    reduce
                      ? { duration: 0 }
                      : { duration: 0.35, ease: EASE_OUT, delay: 0.1 }
                  }
                />
              </svg>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </fieldset>

      {message ? (
        <p
          aria-live="polite"
          className={cn(
            "text-sm",
            showSuccess
              ? "text-emerald-500"
              : status === "error"
                ? "text-destructive"
                : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

function sanitize(raw: string, length: number) {
  return raw.replace(/\D/g, "").slice(0, length);
}

function toSlots(raw: string, length: number) {
  const digits = sanitize(raw, length);
  return Array.from({ length }, (_, i) => digits[i] ?? "");
}
