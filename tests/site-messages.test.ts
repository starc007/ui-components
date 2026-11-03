import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@formatjs/icu-messageformat-parser";
import { englishMessages } from "@/i18n/messages";
import { routing } from "@/i18n/routing";

const DIR = join(import.meta.dir, "../messages");
// Namespace "Chrome" lives in messages/<locale>/chrome.json.
const ENGLISH = Object.fromEntries(
  Object.entries(englishMessages).map(([namespace, messages]) => [`${namespace.toLowerCase()}.json`, messages]),
) as Record<string, Tree>;
const AREAS = Object.keys(ENGLISH);

type Tree = string | Tree[] | { [key: string]: Tree };

function read(locale: string, area: string): Tree | undefined {
  const file = join(DIR, locale, area);
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : undefined;
}

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
function compare(english: Tree, translated: Tree, path: string, errors: string[]) {
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
      compare(english[index], item, `${path}[${index}]`, errors);
    });
    return;
  }
  if (typeof translated !== "object" || translated === null || Array.isArray(translated)) {
    return errors.push(`${path}: expected an object`);
  }
  for (const [key, value] of Object.entries(translated)) {
    if (!(key in english)) errors.push(`${path}.${key}: not in English`);
    else compare(english[key], value, `${path}.${key}`, errors);
  }
}

test("every English area file is registered in i18n/messages.ts", () => {
  expect(readdirSync(join(DIR, "en")).every((file) => AREAS.includes(file))).toBe(true);
});

describe("English messages", () => {
  for (const area of AREAS) {
    test(`${area} parses as ICU`, () => {
      const errors: string[] = [];
      const english = ENGLISH[area];
      compare(english, english, area, errors);
      expect(errors).toEqual([]);
    });
  }
});

for (const locale of routing.locales.filter((each) => each !== routing.defaultLocale)) {
  describe(`${locale} messages`, () => {
    for (const area of AREAS) {
      test(`${area} matches English keys and placeholders`, () => {
        const translated = read(locale, area);
        expect(translated, `messages/${locale}/${area} is missing`).toBeDefined();
        if (translated === undefined) return;
        const errors: string[] = [];
        compare(ENGLISH[area], translated, `${locale}/${area}`, errors);
        expect(errors).toEqual([]);
      });
    }

    test("has no stray files", () => {
      expect(readdirSync(join(DIR, locale)).filter((file) => !AREAS.includes(file))).toEqual([]);
    });
  });
}
