"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * A value that is controlled when `value` is defined and uncontrolled
 * otherwise. Returns the current value, a setter whose identity never changes,
 * and the raw internal setter for callers that resolve state during render.
 *
 * The setter calls `onChange` only when the value actually changes, so a
 * consumer is never told about a no-op.
 */
export function useControllable<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (next: T) => void,
) {
  const [internal, setInternal] = useState(defaultValue);
  const latest = useRef({ value, internal, onChange });
  useLayoutEffect(() => {
    latest.current = { value, internal, onChange };
  });
  const set = useCallback((next: T) => {
    const current = latest.current;
    if (current.value === undefined) setInternal(next);
    if ((current.value === undefined ? current.internal : current.value) !== next)
      current.onChange?.(next);
  }, []);
  return [value === undefined ? internal : value, set, setInternal] as const;
}
