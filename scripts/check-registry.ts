import { allComponents } from "../lib/registry";
import { buildEntry, buildShadcnItem } from "../lib/registry-server";
import { readSourceFile } from "../lib/source-files";

const errors: string[] = [];

for (const component of allComponents()) {
  const label = `${component.category.slug}/${component.slug}`;

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

  try {
    const item = await buildShadcnItem(component.category.slug, component.slug);
    if (!item) {
      errors.push(`${label}: shadcn item was not created`);
    } else if (item.files.length === 0) {
      errors.push(`${label}: shadcn item has no files`);
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

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Validated ${allComponents().length} registry components.`);
