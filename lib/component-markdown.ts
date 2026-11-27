import { componentAbout } from "@/lib/component-about";
import { componentDates } from "@/lib/component-dates";
import type { AgentGuide } from "@/lib/agent-guides";
import { getComponentProps, getReferencedTypes } from "@/lib/props-extractor";
import { soundApiDocs } from "@/lib/sound-api-docs";
import { findCategory, findComponent, type ComponentExample } from "@/lib/registry";
import { buildEntry } from "@/lib/registry-server";
import { pageUrlFor } from "@/lib/signature";
import { readOptionalSourceFile } from "@/lib/source-files";
import { native } from "@/lib/native";
import { buildNativeEntry } from "@/lib/native-registry";
import { SITE_URL } from "@/lib/site";
import { variantCopy } from "@/lib/variant-copy";
import { findVariant, isSplitPage, variantPath } from "@/lib/variant-pages";

function escapeTableCell(value: string) {
  return value.replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
}

function codeLanguage(file: string) {
  if (file.endsWith(".tsx")) return "tsx";
  if (file.endsWith(".ts")) return "ts";
  if (file.endsWith(".css")) return "css";
  return "text";
}

function apiReference(file: string) {
  const docs = file.startsWith("lib/sounds/")
    ? soundApiDocs(file === "lib/sounds/index.ts" ? "sound-kit" : file)
    : getComponentProps(file);
  if (!docs.length) return [];

  const lines: string[] = [];
  for (const doc of docs) {
    if (!doc.props.length) continue;
    lines.push(`### ${doc.displayName}`, "");
    lines.push("| Prop | Type | Default | Required | Description |");
    lines.push("| --- | --- | --- | --- | --- |");
    for (const prop of doc.props) {
      lines.push(
        `| \`${prop.name}\` | \`${escapeTableCell(prop.type)}\` | ${
          prop.defaultValue ? `\`${escapeTableCell(prop.defaultValue)}\`` : "-"
        } | ${prop.required ? "Yes" : "No"} | ${
          escapeTableCell(prop.description) || "-"
        } |`,
      );
    }
    lines.push("");
  }
  return lines.length > 2 ? lines : [];
}

/** The object types the props name (e.g. `CommandItem`), field by field. */
function typesReference(files: string[]) {
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const file of files) {
    if (file.startsWith("lib/sounds/")) continue;
    for (const type of getReferencedTypes(file)) {
      if (seen.has(type.name)) continue;
      seen.add(type.name);
      lines.push(`### ${type.name}`, "");
      lines.push("| Field | Type | Required | Description |");
      lines.push("| --- | --- | --- | --- |");
      for (const field of type.fields) {
        lines.push(
          `| \`${field.name}\` | \`${escapeTableCell(field.type)}\` | ${field.required ? "Yes" : "No"} | ${
            escapeTableCell(field.description) || "-"
          } |`,
        );
      }
      lines.push("");
    }
  }
  return lines;
}

/** How the parts fit together, for components that ship a composition guide. */
function compositionSection(guide: AgentGuide | undefined) {
  if (!guide) return [];
  return [
    "## Composition",
    "",
    guide.composition.description,
    "",
    "```text",
    guide.composition.tree.trim(),
    "```",
    "",
    ...guide.connections.map((connection) => `- \`${connection.slug}\`: ${connection.description}`),
    ...(guide.connections.length ? [""] : []),
    "### How it works",
    "",
    guide.introduction,
    "",
    ...guide.lifecycle.map((stage) => `- **${stage.title}.** ${stage.description}`),
    "",
    "### What it owns and what it leaves to you",
    "",
    `- **Owns:** ${guide.contract.owns}`,
    `- **Leaves to the app:** ${guide.contract.leaves}`,
    "",
    "### Principles",
    "",
    ...guide.principles.map((principle) => `- **${principle.title}.** ${principle.description}`),
    "",
    "### Use it when",
    "",
    guide.guidance.useWhen,
    "",
    "### Avoid it when",
    "",
    guide.guidance.avoidWhen,
    "",
  ];
}

/**
 * An example's usage code: its public composition (`usageFile`) when it has
 * one, the same file the docs page's Usage tab shows, else its preview.
 */
async function usageSection(example: ComponentExample) {
  const file = example.usageFile ?? example.previewFile;
  const usage = await readOptionalSourceFile(file);
  if (!usage) return [];
  return [
    `### ${example.name} usage`,
    "",
    ...(example.description ? [example.description, ""] : []),
    `\`\`\`${codeLanguage(file)}`,
    usage.trim(),
    "```",
    "",
  ];
}

export async function buildComponentMarkdown(
  categorySlug: string,
  componentSlug: string,
) {
  const component = findComponent(categorySlug, componentSlug);
  if (!component) return null;

  const pageUrl = pageUrlFor(categorySlug, component.slug);
  const markdownUrl = `${pageUrl}.md`;
  const dates = componentDates(categorySlug, component.slug);
  const examples = component.examples ?? [];
  const installTargets = examples.some((example) => example.installSlug)
    ? examples.filter((example) => example.installSlug)
    : [];
  const primaryEntry = await buildEntry(categorySlug, component.slug);
  if (!primaryEntry) return null;

  const lines = [
    "---",
    `title: ${JSON.stringify(component.name)}`,
    `description: ${JSON.stringify(component.description)}`,
    `category: ${JSON.stringify(
      findCategory(categorySlug)?.name ?? "Components",
    )}`,
    `publishedAt: ${JSON.stringify(dates.publishedAt)}`,
    `updatedAt: ${JSON.stringify(dates.updatedAt)}`,
    `documentation: ${JSON.stringify(pageUrl)}`,
    `markdown: ${JSON.stringify(markdownUrl)}`,
    `license: ${JSON.stringify("MIT")}`,
    "---",
    "",
    `# ${component.name}`,
    "",
    `> ${component.description}`,
    "",
    "## Install",
    "",
  ];

  if (installTargets.length) {
    for (const example of installTargets) {
      lines.push(`### ${example.name}`, "");
      if (example.description) lines.push(example.description, "");
      lines.push("```bash");
      lines.push(`npx shadcn@latest add @beui/${example.installSlug}`);
      lines.push("```", "");
      if (isSplitPage(component)) {
        lines.push(
          `Docs: ${SITE_URL}${variantPath(categorySlug, component.slug, example.slug)}.md`,
          "",
        );
      }
    }
  } else {
    lines.push("```bash");
    lines.push(`npx shadcn@latest add @beui/${component.slug}`);
    lines.push("```", "");
  }

  lines.push("## Dependencies", "");
  lines.push(
    primaryEntry.dependencies.length
      ? primaryEntry.dependencies.map((dependency) => `- \`${dependency}\``).join("\n")
      : "This component has no external package dependencies.",
  );
  lines.push("", "## Usage", "");

  if (examples.length) {
    for (const example of examples) lines.push(...(await usageSection(example)));
  } else {
    const usageFile =
      component.usageFile ?? `components/previews/${categorySlug}/${component.slug}.preview.tsx`;
    const usage = await readOptionalSourceFile(usageFile);
    if (usage) {
      lines.push(`\`\`\`${codeLanguage(usageFile)}`, usage.trim(), "```", "");
    } else {
      lines.push(`See the live example at ${pageUrl}.`, "");
    }
  }

  const apiFiles = examples.length
    ? Array.from(new Set(examples.map((example) => example.file)))
    : [component.file];
  const apiLines = apiFiles.flatMap((file) => apiReference(file));
  if (apiLines.length) lines.push("## API Reference", "", ...apiLines);
  const typeLines = typesReference(apiFiles);
  if (typeLines.length) lines.push("## Types", "", ...typeLines);
  lines.push(...compositionSection(component.guide));

  const about = componentAbout[component.slug];
  if (about) {
    lines.push(
      `## About ${component.name}`,
      "",
      about.overview,
      "",
      "### When to use it",
      "",
      ...about.useWhen.map((item) => `- ${item}`),
      "",
      "### Accessibility",
      "",
      about.accessibility,
      "",
      "### FAQ",
      "",
      ...about.faq.flatMap((item) => [`**${item.question}**`, "", item.answer, ""]),
    );
  }

  const nativeEntry = buildNativeEntry(component.slug);
  if (nativeEntry) {
    lines.push(
      "## React Native",
      "",
      `A React Native version ships in ${native.name}. The detail JSON has every file to copy.`,
      "",
      "```bash",
      ...nativeEntry.install,
      "```",
      "",
      `- Native detail: ${nativeEntry.detail_url}`,
      `- GitHub: ${nativeEntry.source_url}`,
      "",
    );
  }

  lines.push(
    "## Source",
    "",
    `- Registry detail: ${primaryEntry.detail_url}`,
    `- Raw source: ${primaryEntry.raw_url}`,
    `- GitHub: https://github.com/starc007/ui-components`,
    "",
  );

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}

/** Markdown for one variant page (`/components/motion/button/metallic.md`). */
export async function buildVariantMarkdown(
  categorySlug: string,
  componentSlug: string,
  variantSlug: string,
) {
  const found = findVariant(categorySlug, componentSlug, variantSlug);
  const installSlug = found?.example.installSlug;
  if (!found || !installSlug) return null;
  const { comp, example } = found;
  const copy = variantCopy[installSlug];
  const name = copy?.name ?? example.name;
  const description = copy?.description ?? example.description ?? comp.description;

  const pageUrl = `${SITE_URL}${variantPath(categorySlug, comp.slug, example.slug)}`;
  const dates = componentDates(categorySlug, comp.slug);
  const entry = await buildEntry(categorySlug, installSlug);
  if (!entry) return null;

  const lines = [
    "---",
    `title: ${JSON.stringify(name)}`,
    `description: ${JSON.stringify(description)}`,
    `category: ${JSON.stringify(findCategory(categorySlug)?.name ?? "Components")}`,
    `parent: ${JSON.stringify(pageUrlFor(categorySlug, comp.slug))}`,
    `publishedAt: ${JSON.stringify(dates.publishedAt)}`,
    `updatedAt: ${JSON.stringify(dates.updatedAt)}`,
    `documentation: ${JSON.stringify(pageUrl)}`,
    `markdown: ${JSON.stringify(`${pageUrl}.md`)}`,
    `license: ${JSON.stringify("MIT")}`,
    "---",
    "",
    `# ${name}`,
    "",
    `> ${description}`,
    "",
    "## Install",
    "",
    "```bash",
    `npx shadcn@latest add @beui/${installSlug}`,
    "```",
    "",
    "## Dependencies",
    "",
    entry.dependencies.length
      ? entry.dependencies.map((dependency) => `- \`${dependency}\``).join("\n")
      : "This component has no external package dependencies.",
    "",
    "## Usage",
    "",
    ...(await usageSection(example)),
  ];

  const apiLines = apiReference(example.file);
  if (apiLines.length) lines.push("## API Reference", "", ...apiLines);
  const typeLines = typesReference([example.file]);
  if (typeLines.length) lines.push("## Types", "", ...typeLines);

  const siblings = (comp.examples ?? []).filter((candidate) => candidate.slug !== example.slug);
  if (siblings.length) {
    lines.push(`## More in ${comp.name}`, "");
    for (const sibling of siblings) {
      const siblingName =
        (sibling.installSlug && variantCopy[sibling.installSlug]?.name) || sibling.name;
      lines.push(
        `- [${siblingName}](${SITE_URL}${variantPath(categorySlug, comp.slug, sibling.slug)}.md)`,
      );
    }
    lines.push("");
  }

  lines.push(
    "## Source",
    "",
    `- Registry detail: ${entry.detail_url}`,
    `- Raw source: ${entry.raw_url}`,
    `- GitHub: https://github.com/starc007/ui-components`,
    "",
  );

  return `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trim()}\n`;
}
