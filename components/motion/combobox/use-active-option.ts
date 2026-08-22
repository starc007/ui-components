import { useCallback, useState } from "react";

// Where the keyboard or the pointer last moved to, stamped with the query it
// was placed under. Which option is *active* is resolved from this during
// render, never in an effect: a passive effect lands after the browser paints,
// so a list would be on screen with none of its options active, and the first
// key would move from nowhere onto the row it was already about to highlight.
type ActiveCursor = { value: string; query: string };

export function useActiveOption({
  open,
  query,
  value,
  enabledItems,
}: {
  open: boolean;
  query: string;
  value: string | undefined;
  /** The enabled, visible options in list order — all this hook reads of them. */
  enabledItems: readonly { value: string }[];
}) {
  const [cursor, setCursor] = useState<ActiveCursor | null>(null);

  const isEnabled = (candidate: string | undefined): candidate is string =>
    candidate !== undefined &&
    enabledItems.some((item) => item.value === candidate);

  // A cursor outlives neither the query nor the result set it was placed in:
  // one that came back after either changed would steal Enter from the row the
  // user is aiming at. The result-set half costs something — a live search that
  // blanks its rows while fetching and returns the same ones loses the moved
  // highlight — and it is taken deliberately, because the alternative is Enter
  // committing a row the user stopped aiming at, which is the harm this whole
  // model exists to prevent. A visible highlight in the wrong place is worse
  // than a visible highlight back at the top.
  //
  // It is stamped with the query rather than with the identity of the visible
  // list because callers routinely pass an inline `filter`, which makes that
  // list a fresh array on every render.
  const cursorIsLive =
    cursor !== null && cursor.query === query && isEnabled(cursor.value);
  // Cleared rather than ignored: React re-runs this render with the cursor
  // gone, so a value that reappears later cannot revive it.
  if (cursor !== null && !cursorIsLive) setCursor(null);

  // Only enabled options can be active: an active disabled option would point
  // aria-activedescendant at a row Enter then refuses to select.
  const derived = cursorIsLive
    ? cursor.value
    : isEnabled(value)
      ? value
      : (enabledItems[0]?.value ?? null);

  // A closed list shows the last option it resolved while open: never anything
  // before the first open, and a stable highlight through the exit animation.
  // Closing clears the query, which would otherwise drop the cursor and glide
  // the highlight onto another row while the panel is still on screen.
  // The freeze covers the highlight; the same clear also un-filters the rows
  // behind the collapsing panel, which `ComboboxContent` owns.
  const [shown, setShown] = useState<string | null>(null);
  if (open && shown !== derived) setShown(derived);
  const activeValue = open ? derived : shown;

  const setActiveValue = useCallback(
    (next: string | null) => {
      setCursor(next === null ? null : { value: next, query });
    },
    [query],
  );

  const moveActive = useCallback(
    (direction: 1 | -1 | "first" | "last") => {
      const last = enabledItems.length - 1;
      if (last < 0) {
        setActiveValue(null);
        return;
      }
      const indexFor = () => {
        if (direction === "first") return 0;
        if (direction === "last") return last;
        // A miss means there is no row to step from: the key arrived before the
        // first open, or the frozen value's row has left the list while closed.
        // Either way, enter the list at the end the key points to.
        const current = enabledItems.findIndex(
          (item) => item.value === activeValue,
        );
        if (current < 0) return direction === 1 ? 0 : last;
        return (current + direction + enabledItems.length) % enabledItems.length;
      };
      setActiveValue(enabledItems[indexFor()].value);
    },
    [activeValue, enabledItems, setActiveValue],
  );

  return { activeValue, setActiveValue, moveActive };
}
