import { componentDates } from "@/lib/component-dates";
import { getComponentProps } from "@/lib/props-extractor";
import { findComponent, type ComponentExample } from "@/lib/registry";
import { buildEntry } from "@/lib/registry-server";
import { pageUrlFor } from "@/lib/signature";
import { readOptionalSourceFile } from "@/lib/source-files";

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
  const docs = getComponentProps(file);
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
          prop.defaultValue ? `\`${escapeTableCell(prop.defaultValue)}\`` : "—"
        } | ${prop.required ? "Yes" : "No"} | ${
          escapeTableCell(prop.description) || "—"
        } |`,
      );
    }
    lines.push("");
  }
  return lines.length > 2 ? lines : [];
}

async function usageSection(example: ComponentExample) {
  const usage = await readOptionalSourceFile(example.previewFile);
  if (!usage) return [];
  return [
    `### ${example.name} usage`,
    "",
    ...(example.description ? [example.description, ""] : []),
    `\`\`\`${codeLanguage(example.previewFile)}`,
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
    `category: ${JSON.stringify(categorySlug === "blocks" ? "Blocks" : "Components")}`,
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
    const previewFile = `components/previews/${categorySlug}/${component.slug}.preview.tsx`;
    const usage = await readOptionalSourceFile(previewFile);
    if (usage) {
      lines.push(`\`\`\`${codeLanguage(previewFile)}`, usage.trim(), "```", "");
    } else {
      lines.push(`See the live example at ${pageUrl}.`, "");
    }
  }

  const apiFiles = examples.length
    ? Array.from(new Set(examples.map((example) => example.file)))
    : [component.file];
  const apiLines = apiFiles.flatMap((file) => apiReference(file));
  if (apiLines.length) lines.push("## API Reference", "", ...apiLines);

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
