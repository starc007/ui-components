"use client";

import { useState } from "react";

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
 * The owner clears the cursor when its own query changes; this hook only sees
 * the rows.
 */
export function useRowCursor(rows: readonly { id: string }[]) {
  const [cursor, setCursor] = useState<string | null>(null);
  const rowOf = (id: string | null) =>
    id === null ? -1 : rows.findIndex((row) => row.id === id);

  const cursorRow = rowOf(cursor);
  // Cleared rather than ignored: React re-runs this render with the cursor
  // already gone, so results that come back cannot revive a highlight the user
  // has stopped aiming at.
  if (cursor !== null && cursorRow < 0) setCursor(null);

  return {
    activeIndex: cursorRow < 0 ? 0 : cursorRow,
    setCursor,
    /**
     * Steps from the row the cursor is really on, through a functional update,
     * so that two keys landing in one batch move two rows rather than one.
     */
    moveActive: (direction: 1 | -1) => {
      const last = rows.length - 1;
      if (last < 0) return;
      setCursor((current) => {
        const from = Math.max(rowOf(current), 0);
        return rows[Math.min(Math.max(from + direction, 0), last)].id;
      });
    },
  };
}
