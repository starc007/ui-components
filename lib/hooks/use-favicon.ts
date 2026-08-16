"use client";

import { useCallback, useState } from "react";
import { getFaviconUrl } from "@/lib/favicon";

/**
 * Resolves a site favicon and drops it once it is known to be unusable, so
 * callers can draw their own glyph instead of a broken image. Plenty of sites
 * answer `/favicon.ico` with a 403 or 404, and `onError` is not enough to catch
 * it: an image the browser starts loading from server-rendered HTML usually
 * fails before React attaches a handler, and that event is never replayed.
 * `decode()` settles on the image's final state instead of relying on an event
 * firing at the right moment.
 */
export function useFavicon(url?: string) {
  const resolved = url ? getFaviconUrl(url) : null;
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = resolved && resolved !== failedSrc ? resolved : null;

  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img || !src) return;

      let released = false;
      img.decode().catch(() => {
        if (!released) setFailedSrc(src);
      });

      // The node is going away or the source changed; a late rejection then
      // describes an image we are no longer showing.
      return () => {
        released = true;
      };
    },
    [src],
  );

  return { src, ref };
}
