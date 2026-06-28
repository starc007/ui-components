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
        // Machine endpoints: raw source text and the rest of /api/.
        // Agents fetch these directly; they are not search content.
        disallow: ["/api/", "/r/*/raw"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
