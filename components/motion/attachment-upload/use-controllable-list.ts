"use client";

import { useCallback, useState } from "react";

export function useControllableList<T>({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (items: T[]) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const controlled = value !== undefined;
  const items = value ?? internalValue;

  const setItems = useCallback(
    (next: T[]) => {
      if (!controlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  return [items, setItems] as const;
}
