"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

/**
 * Where the keyboard or the pointer last moved to, stamped with the query it
 * was placed under. Which option is *active* is resolved from this during
 * render, never in an effect: a passive effect runs after the commit, so a list
 * would briefly have none of its options active, and a key arriving in that
 * window would move from nowhere onto the row it was already about to
 * highlight.
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

  // Nothing is active until the list has been opened once. After that the
  // resolution above is already stable across a close — the list keeps
  // filtering by the query it was open with — so the highlight holds its row
  // through the exit without being frozen separately.
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  const activeValue = opened ? derived : null;

  // Both callbacks keep one identity for the life of the component, and read
  // the list through a ref to do it. A caller will put them in a `useMemo` or
  // an effect's dependencies — the exhaustive-deps rule makes it — and
  // `enabledItems` is a fresh array on every render for any consumer passing an
  // inline `filter`, so a callback keyed to it would be rebuilt every render.
  // Written after commit rather than during render: a render React discards
  // still runs the component body, and a handler reading this in that window
  // would step against a list the committed tree does not have.
  const latest = useRef({ open, query, value, enabledItems });
  useLayoutEffect(() => {
    latest.current = { open, query, value, enabledItems };
  });

  const setActiveValue = useCallback((next: string | null) => {
    setCursor(
      next === null ? null : { value: next, query: latest.current.query },
    );
  }, []);

  // Steps from the option the cursor really resolves to, inside the update, so
  // that two keys landing in one batch move two rows rather than one.
  const moveActive = useCallback(
    (direction: 1 | -1 | "first" | "last") => {
      const options = latest.current;
      // While closed the list is still filtering by the query it was open
      // with, so a step taken now would be measured against rows the next
      // render replaces. Opening is the caller's job; stepping waits for it.
      if (!options.open) return;
      const rows = options.enabledItems;
      const last = rows.length - 1;
      if (last < 0) {
        setCursor(null);
        return;
      }
      setCursor((current) => {
        // `resolveActive` always lands on a member of `enabledItems` once the
        // list is non-empty, which the early return above guarantees, so there
        // is always a row to step from.
        const from = resolveActive(current, options);
        const at = rows.findIndex((item) => item.value === from);
        const index =
          direction === "first"
            ? 0
            : direction === "last"
              ? last
              : (at + direction + rows.length) % rows.length;
        return { value: rows[index].value, query: options.query };
      });
    },
    [],
  );

  return { activeValue, setActiveValue, moveActive };
}
