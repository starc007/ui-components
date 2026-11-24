"use client";

import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";

const TYPEAHEAD_RESET = 500;

/**
 * The enabled rows of one menu panel, in order. Rows carry `data-menu-item`
 * and the panel's `data-level`, so a submenu rendered inside the panel keeps
 * its own rows to itself.
 */
export function enabledItems(panel: HTMLElement | null) {
  if (!panel) return [];
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      `[data-menu-item][data-level="${panel.dataset.level}"]:not([data-disabled])`,
    ),
  );
}

/**
 * Arrow keys, Home, End and typeahead for a menu panel. The returned handler
 * moves focus between the panel's rows and says whether it used the key.
 * Typeahead matches a row's `data-text-value`, or its text.
 */
export function useMenuNavigation() {
  const query = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return useCallback((event: KeyboardEvent<HTMLElement>, panel: HTMLElement | null) => {
    const items = enabledItems(panel);
    const index = items.indexOf(event.target as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (items.length === 0) return true;
      const step = event.key === "ArrowDown" ? 1 : -1;
      const next =
        index < 0
          ? step === 1
            ? 0
            : items.length - 1
          : (index + step + items.length) % items.length;
      items[next]?.focus();
      return true;
    }
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      items[event.key === "Home" ? 0 : items.length - 1]?.focus();
      return true;
    }
    const typed = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
    // A space with nothing typed yet presses the row instead.
    if (!typed || (event.key === " " && query.current === "")) return false;
    query.current += event.key.toLocaleLowerCase();
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      query.current = "";
    }, TYPEAHEAD_RESET);
    // Start after the current row, so repeating a letter cycles its matches.
    const ordered = [...items.slice(index + 1), ...items.slice(0, index + 1)];
    const typedSoFar = query.current;
    const repeated = typedSoFar.length > 1 && [...typedSoFar].every((char) => char === typedSoFar[0]);
    const needle = repeated ? typedSoFar[0] : typedSoFar;
    const match = ordered.find((item) =>
      (item.dataset.textValue ?? item.textContent ?? "").trim().toLocaleLowerCase().startsWith(needle),
    );
    if (!match) return false;
    event.preventDefault();
    match.focus();
    return true;
  }, []);
}
