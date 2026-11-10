import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@formatjs/icu-messageformat-parser";
import { messages } from "../i18n/messages";

/**
 * Validates site copy and library labels:
 * - every messages/en/<area>.json is registered and holds valid ICU messages
 * - library components don't hardcode aria-label/title text (use useMessages,
 *   so apps can pass translated `labels`)
 */

const ROOT = join(import.meta.dir, "..");
const DIR = join(ROOT, "messages");
const errors: string[] = [];

type Tree = string | Tree[] | { [key: string]: Tree };

// Namespace "Chrome" lives in messages/en/chrome.json.
const AREAS = Object.keys(messages).map((namespace) => `${namespace.toLowerCase()}.json`);

function validate(tree: Tree, path: string) {
  if (typeof tree === "string") {
    try {
      parse(tree);
    } catch (error) {
      errors.push(`${path}: invalid ICU message (${(error as Error).message})`);
    }
    return;
  }
  if (Array.isArray(tree)) {
    for (const [index, item] of tree.entries()) validate(item, `${path}[${index}]`);
    return;
  }
  for (const [key, value] of Object.entries(tree)) validate(value, `${path}.${key}`);
}

for (const file of readdirSync(join(DIR, "en"))) {
  if (!AREAS.includes(file)) errors.push(`messages/en/${file}: not registered in i18n/messages.ts`);
}
for (const [namespace, tree] of Object.entries(messages)) validate(tree as Tree, `en/${namespace}`);

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) return sourceFiles(rel);
    return /\.tsx?$/.test(name) ? [rel] : [];
  });
}

const library = ["components/motion", "components/agents", "components/charts"].flatMap(sourceFiles);

// Built-in strings go through useMessages so apps can translate them. Flags
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
