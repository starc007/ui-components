import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@formatjs/icu-messageformat-parser";
import { englishMessages } from "../i18n/messages";
import { routing } from "../i18n/routing";

/**
 * Validates translations:
 * - every messages/<locale>/<area>.json matches English keys and placeholders
 * - messages/en/components.json matches the English defaults components ship
 * - library components don't hardcode aria-label/title text (use useMessages)
 */

const ROOT = join(import.meta.dir, "..");
const DIR = join(ROOT, "messages");
const errors: string[] = [];

type Tree = string | Tree[] | { [key: string]: Tree };

// Namespace "Chrome" lives in messages/<locale>/chrome.json.
const ENGLISH = Object.fromEntries(
  Object.entries(englishMessages).map(([namespace, messages]) => [`${namespace.toLowerCase()}.json`, messages]),
) as Record<string, Tree>;
const AREAS = Object.keys(ENGLISH);

/** Placeholder and tag names a message uses; a translation must use the same set. */
function signature(message: string) {
  const names = new Set<string>();
  // biome-ignore lint/suspicious/noExplicitAny: ICU AST nodes are a wide union.
  const walk = (nodes: any[]) => {
    for (const node of nodes) {
      if ("value" in node && node.type !== 0 && node.type !== 7) {
        names.add(node.type === 8 ? `<${node.value}>` : `{${node.value}}`);
      }
      if (node.children) walk(node.children);
      if (node.options) for (const option of Object.values(node.options)) walk((option as { value: unknown[] }).value);
    }
  };
  walk(parse(message));
  return [...names].sort();
}

/** Walks the translation against English: same shape, no unknown keys, same placeholders. */
function compare(english: Tree, translated: Tree, path: string) {
  if (typeof english === "string") {
    if (typeof translated !== "string") return errors.push(`${path}: expected a string`);
    try {
      const expected = signature(english);
      const actual = signature(translated);
      if (expected.join() !== actual.join()) {
        errors.push(`${path}: placeholders ${actual.join(" ")} should be ${expected.join(" ")}`);
      }
    } catch (error) {
      errors.push(`${path}: invalid ICU message (${(error as Error).message})`);
    }
    return;
  }
  if (Array.isArray(english)) {
    if (!Array.isArray(translated)) return errors.push(`${path}: expected a list`);
    if (translated.length > english.length) errors.push(`${path}: has extra items`);
    translated.forEach((item, index) => {
      compare(english[index], item, `${path}[${index}]`);
    });
    return;
  }
  if (typeof translated !== "object" || translated === null || Array.isArray(translated)) {
    return errors.push(`${path}: expected an object`);
  }
  for (const [key, value] of Object.entries(translated)) {
    if (!(key in english)) errors.push(`${path}.${key}: not in English`);
    else compare(english[key], value, `${path}.${key}`);
  }
}

for (const file of readdirSync(join(DIR, "en"))) {
  if (!AREAS.includes(file)) errors.push(`messages/en/${file}: not registered in i18n/messages.ts`);
}
for (const area of AREAS) compare(ENGLISH[area], ENGLISH[area], `en/${area}`);

for (const locale of routing.locales.filter((each) => each !== routing.defaultLocale)) {
  for (const area of AREAS) {
    const file = join(DIR, locale, area);
    if (!existsSync(file)) {
      errors.push(`messages/${locale}/${area} is missing`);
      continue;
    }
    compare(ENGLISH[area], JSON.parse(readFileSync(file, "utf8")), `${locale}/${area}`);
  }
  for (const file of readdirSync(join(DIR, locale))) {
    if (!AREAS.includes(file)) errors.push(`messages/${locale}/${file}: stray file`);
  }
}

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) return sourceFiles(rel);
    return /\.tsx?$/.test(name) ? [rel] : [];
  });
}

const library = ["components/motion", "components/agents", "components/charts"].flatMap(sourceFiles);

// The English file must match the defaults components ship with, or
// translators work from stale text. Defaults are `export const <ns>Messages`.
const english = JSON.parse(readFileSync(join(DIR, "en/components.json"), "utf8")) as Record<string, unknown>;
const shipped = new Map<string, unknown>();
for (const file of library) {
  for (const [, name] of readFileSync(join(ROOT, file), "utf8").matchAll(/export const (\w+)Messages\b/g)) {
    const module = await import(join(ROOT, file));
    shipped.set(name, module[`${name}Messages`]);
  }
}
for (const [namespace, defaults] of shipped) {
  if (JSON.stringify(english[namespace]) !== JSON.stringify(defaults)) {
    errors.push(`messages/en/components.json: "${namespace}" does not match ${namespace}Messages`);
  }
}
for (const namespace of Object.keys(english)) {
  if (!shipped.has(namespace)) errors.push(`messages/en/components.json: "${namespace}" has no ${namespace}Messages export`);
}

// Built-in strings go through useMessages so they can be translated. Flags
// literal attributes (aria-label="Close") and English literals inside
// expressions (aria-label={open ? "Hide" : "Show"}); message keys are camelCase.
const ATTRIBUTES = "aria-label|title|placeholder|aria-valuetext|aria-roledescription";
const literal = new RegExp(`\\b(?:${ATTRIBUTES})=(?:"[^"]*[A-Za-z]|\\{[^}]*["\`][A-Z][a-z]+)`);
for (const file of library) {
  if (literal.test(readFileSync(join(ROOT, file), "utf8"))) {
    errors.push(`${file}: hardcoded English in an accessible-name attribute; route it through useMessages`);
  }
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("Messages OK");
