"use client";

import { useEffect } from "react";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

/** Loads gtag on the first interaction (or after 8s), once per document. */
function loadGtag(measurementId: string) {
  if (document.getElementById("google-analytics-src")) return;
  window.dataLayer = window.dataLayer || [];
  const dataLayer = window.dataLayer;
  // gtag.js only reads Arguments objects from the data layer, not arrays.
  function gtag(..._args: unknown[]) {
    // biome-ignore lint/complexity/noArguments: gtag.js requires the Arguments object.
    dataLayer.push(arguments);
  }
  // trackEvent (lib/analytics.ts) sends events through the global.
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId);
  const script = document.createElement("script");
  script.id = "google-analytics-src";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  useEffect(() => {
    if (!measurementId) return;

    let started = false;
    const events = ["pointerdown", "keydown", "scroll"] as const;
    const start = () => {
      if (started) return;
      started = true;
      window.clearTimeout(fallback);
      for (const event of events) window.removeEventListener(event, start);
      loadGtag(measurementId);
    };
    const fallback = window.setTimeout(start, 8000);
    for (const event of events) {
      window.addEventListener(event, start, { passive: true, once: true });
    }

    return () => {
      window.clearTimeout(fallback);
      for (const event of events) window.removeEventListener(event, start);
    };
  }, [measurementId]);

  return null;
}
