type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "event" | "config" | "js",
      action: string,
      params?: GtagParams,
    ) => void;
  }
}

/**
 * Fire a client-side GA4 event. No-ops when gtag is absent (analytics id
 * unset, ad-blocker, SSR), so callers never need to guard.
 */
export function trackEvent(name: string, params?: GtagParams) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", name, params);
}
