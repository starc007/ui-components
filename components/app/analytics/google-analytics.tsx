"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!measurementId) return;

    let started = false;
    const events = ["pointerdown", "keydown", "scroll"] as const;
    const start = () => {
      if (started) return;
      started = true;
      window.clearTimeout(fallback);
      for (const event of events) window.removeEventListener(event, start);
      setReady(true);
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

  if (!measurementId || !ready) return null;

  const safeMeasurementId = JSON.stringify(measurementId);

  return (
    <>
      <Script
        id="google-analytics-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag("js", new Date());
            gtag("config", ${safeMeasurementId});
          `,
        }}
      />
    </>
  );
}
