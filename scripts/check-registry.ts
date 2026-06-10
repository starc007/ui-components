import { allComponents } from "../lib/registry";
import { allShadcnTargets, buildEntry, buildShadcnItem } from "../lib/registry-server";
import { readSourceFile } from "../lib/source-files";

const errors: string[] = [];
const slugLabels = new Map<string, string[]>();
const installSlugLabels = new Map<string, string[]>();

for (const component of allComponents()) {
  const label = `${component.category.slug}/${component.slug}`;
  slugLabels.set(component.slug, [...(slugLabels.get(component.slug) ?? []), label]);

  try {
    const entry = await buildEntry(component.category.slug, component.slug);
    if (!entry) {
      errors.push(`${label}: registry entry was not created`);
    } else if (entry.files.length === 0) {
      errors.push(`${label}: registry entry has no files`);
    }
  } catch (error) {
    errors.push(`${label}: ${(error as Error).message}`);
  }

  for (const example of component.examples ?? []) {
    for (const file of [example.file, example.previewFile]) {
      try {
        await readSourceFile(file);
      } catch (error) {
        errors.push(`${label}/${example.slug}: ${(error as Error).message}`);
      }
    }
  }
}

for (const target of allShadcnTargets()) {
  const label = `${target.categorySlug}/${target.slug}`;
  installSlugLabels.set(target.slug, [...(installSlugLabels.get(target.slug) ?? []), label]);

  try {
    const item = await buildShadcnItem(target.categorySlug, target.slug);
    if (!item) {
      errors.push(`${label}: shadcn item was not created`);
    } else if (item.files.length === 0) {
      errors.push(`${label}: shadcn item has no files`);
    }
  } catch (error) {
    errors.push(`${label}: ${(error as Error).message}`);
  }
}

for (const [slug, labels] of slugLabels) {
  if (labels.length > 1) {
    errors.push(`Duplicate component slug "${slug}" used by: ${labels.join(", ")}`);
  }
}

for (const [slug, labels] of installSlugLabels) {
  if (labels.length > 1) {
    errors.push(`Duplicate install slug "${slug}" used by: ${labels.join(", ")}`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${allComponents().length} registry components.`);
