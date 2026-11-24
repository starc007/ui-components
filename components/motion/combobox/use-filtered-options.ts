"use client";

import { type MutableRefObject, useCallback, useEffect, useMemo, useState } from "react";
import { useActiveOption } from "./use-active-option";

/** An option as it registers with its list. */
export type RegisteredItem = {
  value: string;
  label: string;
  keywords: string[];
  disabled: boolean;
  groupId: string | null;
  id: string;
  ref: MutableRefObject<HTMLButtonElement | null>;
};

export type OptionFilter = (value: string, query: string, keywords: string[]) => boolean;

/** Fuzzy match: the query's characters appear in order in the value or a keyword. */
export const defaultOptionFilter: OptionFilter = (value, query, keywords) => {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return true;

  const haystack = [value, ...keywords].join(" ").toLocaleLowerCase();
  let queryIndex = 0;
  for (const character of haystack) {
    if (character === needle[queryIndex]) queryIndex += 1;
    if (queryIndex === needle.length) return true;
  }
  return false;
};

/**
 * The options a searchable list registers, filtered by its query, with the
 * active option resolved during render and kept scrolled into view. Shared by
 * Combobox and Multi Select, which differ only in what a pick does.
 */
export function useFilteredOptions({
  open,
  query,
  value,
  filter,
}: {
  open: boolean;
  query: string;
  /** The selected value the cursor starts on when the list opens. */
  value: string | undefined;
  filter: OptionFilter;
}) {
  const [items, setItems] = useState<Map<string, RegisteredItem>>(new Map());

  const registerItem = useCallback((item: RegisteredItem) => {
    setItems((current) => {
      const existing = current.get(item.value);
      if (
        existing?.label === item.label &&
        existing.disabled === item.disabled &&
        existing.id === item.id &&
        existing.ref === item.ref &&
        existing.groupId === item.groupId &&
        existing.keywords.join("\u0000") === item.keywords.join("\u0000")
      ) {
        return current;
      }
      const next = new Map(current);
      next.set(item.value, item);
      return next;
    });
  }, []);

  const unregisterItem = useCallback((itemValue: string) => {
    setItems((current) => {
      if (!current.has(itemValue)) return current;
      const next = new Map(current);
      next.delete(itemValue);
      return next;
    });
  }, []);

  // The query the list filters by. Closing clears `query`, but the panel is
  // still on screen for its exit, so it keeps filtering by the query it was
  // open with rather than repopulating mid-collapse. The input already reads
  // `query` only while open, so nothing the user can see reads the other one.
  const [openQuery, setOpenQuery] = useState(query);
  if (open && openQuery !== query) setOpenQuery(query);
  const listQuery = open ? query : openQuery;

  const visibleItems = useMemo(
    () =>
      Array.from(items.values()).filter((item) =>
        filter(item.value, listQuery, [item.label, ...item.keywords]),
      ),
    [filter, items, listQuery],
  );
  const enabledVisibleItems = useMemo(
    () => visibleItems.filter((item) => !item.disabled),
    [visibleItems],
  );
  const visibleValues = useMemo(
    () => new Set(visibleItems.map((item) => item.value)),
    [visibleItems],
  );
  const visibleGroupIds = useMemo(
    () => new Set(visibleItems.map((item) => item.groupId)),
    [visibleItems],
  );

  const { activeValue, setActiveValue, moveActive } = useActiveOption({
    open,
    query: listQuery,
    value,
    enabledItems: enabledVisibleItems,
  });

  useEffect(() => {
    if (!activeValue || !open) return;
    const item = items.get(activeValue)?.ref.current;
    const list = item?.closest<HTMLElement>("[role='listbox']");
    if (!item || !list) return;
    const itemRect = item.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (itemRect.top < listRect.top) list.scrollTop -= listRect.top - itemRect.top;
    else if (itemRect.bottom > listRect.bottom) list.scrollTop += itemRect.bottom - listRect.bottom;
  }, [activeValue, items, open]);

  return {
    items,
    registerItem,
    unregisterItem,
    listQuery,
    visibleValues,
    visibleGroupIds,
    visibleCount: visibleItems.length,
    activeValue,
    setActiveValue,
    moveActive,
    activeItemId: activeValue ? items.get(activeValue)?.id : undefined,
  };
}
