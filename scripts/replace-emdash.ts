import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * Replaces all em dashes (—) with hyphens (-) across tracked files in the repo.
 *
 * Usage:
 *   bun scripts/replace-emdash.ts            # Run replacements
 *   bun scripts/replace-emdash.ts --dry-run  # Preview replacements without modifying files
 *   bun scripts/replace-emdash.ts --all      # Also modify check scripts (check-registry, blog-export)
 */

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const includeAll = args.includes("--all");

// Files that intentionally reference the em dash as a validation rule or regex separator
const EXCLUDED_FILES = new Set([
  "scripts/check-registry.ts",
  "scripts/blog-export.ts",
  "lib/seo.ts",
]);

const trackedFiles = execSync("git ls-files", { encoding: "utf-8" })
  .trim()
  .split("\n")
  .filter(Boolean);

let totalReplaced = 0;
let modifiedFilesCount = 0;

for (const file of trackedFiles) {
  if (!includeAll && EXCLUDED_FILES.has(file)) continue;

  try {
    const content = readFileSync(file, "utf-8");
    if (!content.includes("—")) continue;

    const occurrences = (content.match(/—/g) || []).length;
    const updated = content.replaceAll("—", "-");

    if (!isDryRun) {
      writeFileSync(file, updated, "utf-8");
    }

    console.log(`${isDryRun ? "[DRY RUN] " : "✓ "}${file} (${occurrences} replaced)`);
    totalReplaced += occurrences;
    modifiedFilesCount++;
  } catch {
    // Ignore binary or inaccessible files
  }
}

console.log(
  `\n${isDryRun ? "[DRY RUN] Would replace" : "Finished! Replaced"} ${totalReplaced} em dash${
    totalReplaced === 1 ? "" : "es"
  } across ${modifiedFilesCount} file${modifiedFilesCount === 1 ? "" : "s"}.`
);
