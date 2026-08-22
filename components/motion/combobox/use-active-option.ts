"use client";

import { useCallback, useState } from "react";

/**
 * Where the keyboard or the pointer last moved to, stamped with the query it
 * was placed under. Which option is *active* is resolved from this during
 * render, never in an effect: a passive effect lands after the browser paints,
 * so a list would be on screen with none of its options active, and the first
 * key would move from nowhere onto the row it was already about to highlight.
 */
type ActiveCursor = { value: string; query: string };

type Options = {
  query: string;
  value: string | undefined;
  /** The enabled, visible options in list order — all this hook reads of them. */
  enabledItems: readonly { value: string }[];
};

const isEnabled = (
  enabledItems: Options["enabledItems"],
  candidate: string | undefined,
): candidate is string =>
  candidate !== undefined && enabledItems.some((i) => i.value === candidate);

/**
 * The cursor's option, or null once the query or the result set it was placed
 * in has changed. A cursor that outlived either would steal Enter from the row
 * the user is aiming at. The result-set half costs something: a live search
 * that blanks its rows while fetching and returns the same ones loses the moved
 * highlight. That is deliberate — a highlight visibly back at the top beats one
 * silently in the wrong place.
 *
 * It is stamped with the query rather than with the identity of the visible
 * list because callers routinely pass an inline `filter`, which makes that list
 * a fresh array on every render.
 */
function liveCursorValue(cursor: ActiveCursor | null, options: Options) {
  if (cursor === null || cursor.query !== options.query) return null;
  return isEnabled(options.enabledItems, cursor.value) ? cursor.value : null;
}

/**
 * Where the highlight sits with no live cursor: the selection if it can be
 * selected, otherwise the first option that can. Only enabled options qualify —
 * an active disabled option would point `aria-activedescendant` at a row Enter
 * then refuses to select.
 */
function fallbackActive({ value, enabledItems }: Options) {
  return isEnabled(enabledItems, value) ? value : (enabledItems[0]?.value ?? null);
}

/** The active option, from a cursor that may or may not still be live. */
const resolveActive = (cursor: ActiveCursor | null, options: Options) =>
  liveCursorValue(cursor, options) ?? fallbackActive(options);

export function useActiveOption({ open, ...options }: Options & { open: boolean }) {
  const { query, value, enabledItems } = options;
  const [cursor, setCursor] = useState<ActiveCursor | null>(null);

  const live = liveCursorValue(cursor, options);
  // Cleared rather than ignored: React re-runs this render with the cursor
  // gone, so a value that reappears later cannot revive it.
  if (cursor !== null && live === null) setCursor(null);
  const derived = live ?? fallbackActive(options);

  // A closed list shows the last option it resolved while open: never anything
  // before the first open, and a stable highlight through the exit animation.
  // Closing clears the query, which would otherwise drop the cursor and glide
  // the highlight onto another row while the panel is still on screen.
  const [shown, setShown] = useState<string | null>(null);
  if (open && shown !== derived) setShown(derived);
  const activeValue = open ? derived : shown;

  const setActiveValue = useCallback(
    (next: string | null) => {
      setCursor(next === null ? null : { value: next, query });
    },
    [query],
  );

  // Steps from the option the cursor really resolves to, inside the update, so
  // that two keys landing in one batch move two rows rather than one. Reading
  // the resolved value from the render closure instead would also make this
  // callback change identity on every pointer move.
  const moveActive = useCallback(
    (direction: 1 | -1 | "first" | "last") => {
      const last = enabledItems.length - 1;
      if (last < 0) {
        setCursor(null);
        return;
      }
      setCursor((current) => {
        const from = resolveActive(current, { query, value, enabledItems });
        // A miss means there is no row to step from: the key arrived before the
        // first open, or the frozen value's row has left the list while closed.
        // Either way, enter the list at the end the key points to.
        const at = enabledItems.findIndex((item) => item.value === from);
        const index =
          direction === "first"
            ? 0
            : direction === "last"
              ? last
              : at < 0
                ? direction === 1
                  ? 0
                  : last
                : (at + direction + enabledItems.length) % enabledItems.length;
        return { value: enabledItems[index].value, query };
      });
    },
    [enabledItems, query, value],
  );

  return { activeValue, setActiveValue, moveActive };
}
