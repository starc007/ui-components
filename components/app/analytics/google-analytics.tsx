import Script from "next/script";

type GoogleAnalyticsProps = {
  measurementId?: string;
};

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  if (!measurementId) return null;

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
