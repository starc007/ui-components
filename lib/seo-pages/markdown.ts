import { componentPath } from "@/lib/component-paths";
import { allComponents } from "@/lib/registry";
import { seoPagePath } from "@/lib/seo-pages";
import type { AlternativePage, SeoPage, SeoPageKind } from "@/lib/seo-pages/types";
import { SITE_URL } from "@/lib/site";

const cell = (value: string) => value.replace(/\|/g, "\\|").replace(/\n/g, " ");

function table(columns: string[], rows: string[][]) {
  return [
    `| ${columns.map(cell).join(" | ")} |`,
    `| ${columns.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

/** A guide or comparison page as Markdown, for llms-full.txt. */
export function seoPageMarkdown(kind: SeoPageKind, page: SeoPage | AlternativePage) {
  const parts = [
    `# ${page.heading}`,
    "",
    `URL: ${SITE_URL}${seoPagePath(kind, page.slug)}`,
    `Updated: ${page.updatedAt}`,
    "",
    page.intro,
  ];

  if ("comparison" in page) {
    parts.push(
      "",
      `## beUI vs ${page.competitor}`,
      "",
      table(
        ["", "beUI", page.competitor],
        page.comparison.map((row) => [row.label, row.beui, row.other]),
      ),
      "",
      `${page.competitor} official site: ${page.competitorUrl}`,
    );
  }

  for (const section of page.sections) {
    parts.push("", `## ${section.heading}`);
    for (const paragraph of section.paragraphs) parts.push("", paragraph);
    if (section.list?.length) parts.push("", ...section.list.map((item) => `- ${item}`));
    if (section.table) parts.push("", table(section.table.columns, section.table.rows));
    if (section.code) {
      parts.push("", `\`\`\`${section.code.lang}`, section.code.code, "```");
    }
  }

  const components = page.components.flatMap((slug) => {
    const component = allComponents().find((item) => item.slug === slug);
    return component ? [component] : [];
  });
  if (components.length) {
    parts.push(
      "",
      "## Components",
      "",
      ...components.map(
        (component) =>
          `- [${component.name}](${SITE_URL}${componentPath(component.category.slug, component.slug)}): ${component.description}`,
      ),
    );
  }

  parts.push("", "## FAQ");
  for (const item of page.faq) parts.push("", `### ${item.question}`, "", item.answer);

  return parts.join("\n");
}
