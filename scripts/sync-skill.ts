// Writes the picker table from lib/agent-picker.ts into skills/beui/SKILL.md,
// between the picker markers. `check:registry` fails when they differ.
import { readFileSync, writeFileSync } from "node:fs";
import { PICKER_END, PICKER_START, pickerTable } from "../lib/agent-picker";

export const SKILL_PATH = "skills/beui/SKILL.md";

/** SKILL.md with the picker section replaced by the generated table. */
export function syncedSkill(source: string) {
  const block = `${PICKER_START}\n\n${pickerTable()}\n\n${PICKER_END}`;
  const start = source.indexOf(PICKER_START);
  const end = source.indexOf(PICKER_END);
  if (start !== -1 && end !== -1) {
    return source.slice(0, start) + block + source.slice(end + PICKER_END.length);
  }
  // First run: the hand-written table under "## Picker", up to the next heading.
  const tableStart = source.indexOf("| User asks for");
  const tableEnd = source.indexOf("\n## ", tableStart);
  if (tableStart === -1 || tableEnd === -1) throw new Error("SKILL.md has no picker table to replace");
  return `${source.slice(0, tableStart)}${block}\n${source.slice(tableEnd)}`;
}

if (import.meta.main) {
  const source = readFileSync(SKILL_PATH, "utf8");
  const next = syncedSkill(source);
  if (next !== source) {
    writeFileSync(SKILL_PATH, next);
    console.log(`Updated the picker in ${SKILL_PATH}.`);
  } else {
    console.log(`${SKILL_PATH} is up to date.`);
  }
}
