import { SITE_URL as SITE } from "@/lib/site";

type Rule = { userAgent: string; allow: string[]; disallow: string[] };

/** robots.txt, written by scripts/build-static.ts. */
export function robotsTxt() {
  const searchCrawlerRule = (userAgent: string): Rule => ({
    userAgent,
    allow: ["/", "/api/og"],
    disallow: ["/api/"],
  });

  const rules: Rule[] = [
    {
      userAgent: "*",
      // Old social cards point at /api/og, which now redirects to the static
      // PNG; the more specific allow overrides the /api/ disallow below.
      allow: ["/", "/api/og"],
      // API endpoints do not need crawler traffic. Raw registry source stays
      // crawlable so bots can read its X-Robots-Tag: noindex directive.
      disallow: ["/api/"],
    },
    searchCrawlerRule("OAI-SearchBot"),
    searchCrawlerRule("ChatGPT-User"),
  ];

  const groups = rules.map((rule) =>
    [
      `User-Agent: ${rule.userAgent}`,
      ...rule.allow.map((path) => `Allow: ${path}`),
      ...rule.disallow.map((path) => `Disallow: ${path}`),
    ].join("\n"),
  );
  return `${groups.join("\n\n")}\n\nHost: ${SITE}\nSitemap: ${SITE}/sitemap.xml\n`;
}
