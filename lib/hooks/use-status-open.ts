"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useControllable } from "@/lib/hooks/use-controllable";

/**
 * Open state for a disclosure that opens or closes itself when a status
 * changes: a tool result that opens while it runs, a todo list that folds
 * when the work completes. Controlled through `open`, or uncontrolled from
 * `defaultOpen`.
 *
 * `decide(previous, next)` runs in the render that first sees a new status
 * and returns `true` to open, `false` to close, or `undefined` to leave it.
 * An uncontrolled panel flips in that same render, so it never shows one
 * commit in the old state. Telling the consumer through `onOpenChange` is a
 * side effect, so it waits for the commit.
 */
export function useStatusOpen<Status>({
  status,
  initialStatus = status,
  decide,
  open,
  defaultOpen,
  onOpenChange,
}: {
  status: Status;
  /**
   * The status to treat as already seen at mount. Defaults to `status`, so
   * mounting is not a change; pass another value to let the first render
   * count as one.
   */
  initialStatus?: Status;
  decide: (previous: Status, next: Status) => boolean | undefined;
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [currentOpen, setOpen, setInternal] = useControllable(open, defaultOpen, onOpenChange);
  const [seenStatus, setSeenStatus] = useState(initialStatus);
  const [request, setRequest] = useState<{ open: boolean; from: boolean } | null>(null);

  if (status !== seenStatus) {
    setSeenStatus(status);
    const wanted = decide(seenStatus, status);
    if (wanted !== undefined) {
      if (open === undefined) setInternal(wanted);
      setRequest({ open: wanted, from: currentOpen });
    }
  }

  const notify = useRef(onOpenChange);
  useLayoutEffect(() => {
    notify.current = onOpenChange;
  });
  useEffect(() => {
    if (request && request.open !== request.from) notify.current?.(request.open);
  }, [request]);

  return [currentOpen, setOpen] as const;
}
