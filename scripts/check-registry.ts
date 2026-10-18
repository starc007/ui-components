import { allComponents } from "../lib/registry";
import { componentAbout } from "../lib/component-about";
import { componentDates } from "../lib/component-dates";
import { componentSeo, SEO_DESCRIPTION_MAX, SEO_TITLE_MAX } from "../lib/component-seo";
import { seoPages } from "../lib/seo-pages";
import { allShadcnTargets, buildEntry, buildShadcnItem } from "../lib/registry-server";
import { readSourceFile } from "../lib/source-files";

const errors: string[] = [];
const slugLabels = new Map<string, string[]>();
const installSlugLabels = new Map<string, string[]>();

for (const component of allComponents()) {
  const label = `${component.category.slug}/${component.slug}`;
  slugLabels.set(component.slug, [...(slugLabels.get(component.slug) ?? []), label]);

  try {
    componentDates(component.category.slug, component.slug);
  } catch (error) {
    errors.push(`${label}: ${(error as Error).message}`);
  }

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

// Every component page needs About notes plus a search title and description
// within the limits search results display, all written without em dashes.
for (const component of allComponents()) {
  const label = `${component.category.slug}/${component.slug}`;
  const about = componentAbout[component.slug];
  if (!about) {
    errors.push(`${label}: missing entry in lib/component-about.ts`);
  } else if (/\u2014/.test(JSON.stringify(about))) {
    errors.push(`${label}: About copy contains an em dash`);
  }
  const seo = componentSeo[component.slug];
  if (!seo) {
    errors.push(`${label}: missing entry in lib/component-seo.ts`);
    continue;
  }
  if (seo.title.length > SEO_TITLE_MAX) {
    errors.push(`${label}: SEO title is ${seo.title.length} chars (max ${SEO_TITLE_MAX})`);
  }
  if (seo.description.length > SEO_DESCRIPTION_MAX) {
    errors.push(
      `${label}: SEO description is ${seo.description.length} chars (max ${SEO_DESCRIPTION_MAX})`,
    );
  }
  if (/\u2014/.test(seo.title + seo.description)) {
    errors.push(`${label}: SEO copy contains an em dash`);
  }
}

const componentSlugs = new Set(allComponents().map((component) => component.slug));
for (const slug of [...Object.keys(componentSeo), ...Object.keys(componentAbout)]) {
  if (!componentSlugs.has(slug)) errors.push(`SEO or About entry "${slug}" has no component`);
}

// Alternatives and guides pages: search copy limits, real component links,
// unique slugs and enough substance to stand on their own.
for (const kind of ["alternatives", "guides"] as const) {
  const seen = new Set<string>();
  for (const page of seoPages(kind)) {
    const label = `/${kind}/${page.slug}`;
    if (seen.has(page.slug)) errors.push(`${label}: duplicate slug`);
    seen.add(page.slug);
    if (page.title.length > SEO_TITLE_MAX) {
      errors.push(`${label}: title is ${page.title.length} chars (max ${SEO_TITLE_MAX})`);
    }
    if (page.description.length > SEO_DESCRIPTION_MAX) {
      errors.push(
        `${label}: description is ${page.description.length} chars (max ${SEO_DESCRIPTION_MAX})`,
      );
    }
    if (page.sections.length < 3) errors.push(`${label}: needs at least 3 sections`);
    if (page.faq.length < 3) errors.push(`${label}: needs at least 3 FAQ items`);
    if (/\u2014/.test(JSON.stringify(page))) errors.push(`${label}: contains an em dash`);
    for (const slug of page.components) {
      if (!componentSlugs.has(slug)) errors.push(`${label}: unknown component "${slug}"`);
    }
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
