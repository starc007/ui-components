"use client";

import { useCallback, useState } from "react";

/**
 * Where the keyboard or the pointer last moved to: the row's id, stamped with
 * the query it was placed under.
 */
type RowCursor = { id: string; query: string };

/**
 * The highlighted row of a list whose rows can change under it.
 *
 * Which row is highlighted is resolved during render, never in a passive
 * effect: an effect lands after the browser paints, so a list that had just
 * changed would be on screen with `aria-activedescendant` naming a row that is
 * no longer at that position, and a key pressed in that frame would commit the
 * wrong row or nothing at all.
 *
 * The cursor holds the row's id, not its position. A position alone cannot tell
 * a list that shrank from one that swapped its rows for a different set of the
 * same length, and the second case is the one that silently hands Enter to a
 * row the user never chose. A cursor whose row has left the list returns the
 * highlight to the first row rather than to the nearest surviving one: the row
 * the user aimed at is gone, and the first row is where a new query already
 * puts the highlight.
 *
 * Pass the query the list is filtered by. The cursor is stamped with it and
 * dropped when it changes, so a caller cannot forget to clear it — including a
 * caller whose query arrives as a prop and so never runs its own handler. Rows
 * that come back under a query that has moved on cannot revive it either.
 * `moveTo(null)` is for deliberate resets, such as reopening the list.
 */
export function useRowCursor(rows: readonly { id: string }[], query: string) {
  const [cursor, setCursor] = useState<RowCursor | null>(null);

  const rowOf = (candidate: RowCursor | null) =>
    candidate === null || candidate.query !== query
      ? -1
      : rows.findIndex((row) => row.id === candidate.id);

  const cursorRow = rowOf(cursor);
  // Cleared rather than ignored: React re-runs this render with the cursor
  // already gone, so rows that come back cannot revive a highlight the user has
  // stopped aiming at.
  if (cursor !== null && cursorRow < 0) setCursor(null);
  const activeIndex = cursorRow < 0 ? 0 : cursorRow;

  const moveTo = useCallback(
    (id: string | null) => setCursor(id === null ? null : { id, query }),
    [query],
  );

  const moveActive = useCallback(
    (direction: 1 | -1) => {
      const last = rows.length - 1;
      if (last < 0) return;
      // Steps from the row the cursor is really on, inside the update, so that
      // two keys landing in one batch move two rows rather than one. `rowOf` is
      // inlined here because it is rebuilt every render, and depending on it
      // would rebuild this callback with it.
      setCursor((current) => {
        const at =
          current === null || current.query !== query
            ? -1
            : rows.findIndex((row) => row.id === current.id);
        const next = Math.min(Math.max(Math.max(at, 0) + direction, 0), last);
        return { id: rows[next].id, query };
      });
    },
    [query, rows],
  );

  return {
    activeIndex,
    activeId: rows[activeIndex]?.id ?? null,
    moveTo,
    moveActive,
  };
}
