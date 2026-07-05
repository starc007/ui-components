import type { MetadataRoute } from "next";
import { SITE_URL as SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        // Allow the OG image route so social crawlers (Twitter/X, etc.) can
        // fetch link-preview images; the more specific allow overrides the
        // /api/ disallow below.
        allow: ["/", "/api/og"],
        // API endpoints do not need crawler traffic. Raw registry source stays
        // crawlable so bots can read its X-Robots-Tag: noindex directive.
        disallow: ["/api/"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
