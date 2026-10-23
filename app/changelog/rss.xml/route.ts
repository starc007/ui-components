import {
  CHANGE_LABELS,
  CHANGELOG_PATH,
  changelogAnchor,
  changelogEntries,
  changelogItemLink,
} from "@/lib/changelog";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

/** RSS 2.0 feed of the changelog, one item per week. */
export function GET() {
  const items = changelogEntries
    .map((entry) => {
      const url = `${SITE_URL}${CHANGELOG_PATH}#${changelogAnchor(entry.date)}`;
      const list = entry.items
        .map((item) => {
          const link = changelogItemLink(item);
          const text = escapeXml(item.text);
          const body = link ? `${text} <a href="${SITE_URL}${link.href}">${escapeXml(link.label ?? "Learn more")}</a>` : text;
          return `<li><strong>${CHANGE_LABELS[item.type]}:</strong> ${body}</li>`;
        })
        .join("");
      const html = `${entry.summary ? `<p>${escapeXml(entry.summary)}</p>` : ""}<ul>${list}</ul>`;
      return [
        "<item>",
        `<title>${escapeXml(entry.title)}</title>`,
        `<link>${url}</link>`,
        `<guid isPermaLink="true">${url}</guid>`,
        `<pubDate>${new Date(`${entry.date}T00:00:00Z`).toUTCString()}</pubDate>`,
        `<description><![CDATA[${html}]]></description>`,
        "</item>",
      ].join("");
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>beUI Changelog</title><link>${SITE_URL}${CHANGELOG_PATH}</link><description>New components, improvements and fixes in beUI.</description><language>en</language><atom:link href="${SITE_URL}${CHANGELOG_PATH}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`;

  return new Response(xml, {
    headers: {
      "content-type": "application/rss+xml; charset=utf-8",
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
