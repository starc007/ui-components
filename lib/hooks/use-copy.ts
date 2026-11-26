"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** How long the copied state holds after a copy, in ms. */
const COPIED_MS = 1600;

/**
 * A copy action and a `copied` flag that holds for a moment after it works.
 *
 * `copy` runs `onCopy` when given, else writes `text` to the clipboard. The
 * flag turns on only once that succeeded: no clipboard (an insecure origin),
 * a refused write or a throwing `onCopy` leave it off rather than claiming a
 * copy that never happened.
 */
export function useCopy({
  text,
  onCopy,
}: {
  text?: string;
  onCopy?: () => void | Promise<void>;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = useCallback(async () => {
    try {
      if (onCopy) await onCopy();
      else if (text !== undefined && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else return;
    } catch {
      return;
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), COPIED_MS);
  }, [onCopy, text]);

  return { copied, copy };
}
