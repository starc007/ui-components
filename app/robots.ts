import type { MetadataRoute } from "next";

const SITE = "https://beui.dev";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Machine endpoints: image generation and raw source text.
        // Agents fetch these directly; they are not search content.
        disallow: ["/api/", "/r/*/raw"],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
