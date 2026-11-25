export type SearchableCommand = {
  label: string;
  group?: string;
  keywords?: string[];
};

function normalize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

// A keyword longer than this many words is prose (a description), not an
// alias, and only ever matches as a fallback.
const PROSE_WORDS = 3;

/** The label: whole words, word starts, then abbreviations. Never the middle
 * of a word: "tab" finds Tabs and Table, not Sortable List. */
function labelScore(token: string, label: string) {
  const words = label.split(" ");
  if (words.includes(token)) return 100;
  if (words.some((word) => word.startsWith(token))) return 80;
  // Keep short queries precise; fuzzy abbreviations may skip at most two
  // letters within a word, rather than matching across a whole name.
  if (token.length < 3) return 0;
  for (const word of words) {
    if (word.length - token.length > 2) continue;
    let matched = 0;
    for (const char of word) {
      if (char === token[matched]) matched++;
    }
    if (matched === token.length) return 20;
  }
  return 0;
}

/** Groups, aliases and prose: whole words and word starts only, so "tab"
 * never matches inside "stable". */
function wordScore(token: string, field: string, exact: number, prefix: number) {
  const words = field.split(" ");
  if (words.includes(token)) return exact;
  if (token.length >= 2 && words.some((word) => word.startsWith(token))) return prefix;
  return 0;
}

/**
 * Match every query word and rank direct name matches first. A command
 * whose every word matched its name, group or a short keyword is a strong
 * match; one that needed a long keyword (a description) is weak, and weak
 * matches show only when nothing matched strongly. Typing "swap" lists the
 * swap components, not everything whose description mentions swapping.
 */
export function searchCommands<T extends SearchableCommand>(items: T[], query: string): T[] {
  const normalized = normalize(query);
  if (!normalized) return items;
  const tokens = normalized.split(/\s+/);

  const scored = items.map((item) => {
    const label = normalize(item.label);
    const group = normalize(item.group ?? "");
    const keywords = (item.keywords ?? []).map(normalize).filter(Boolean);
    const aliases = keywords.filter((k) => k.split(" ").length <= PROSE_WORDS);
    const prose = keywords.filter((k) => k.split(" ").length > PROSE_WORDS);

    let score = label === normalized ? 10000 : label.startsWith(normalized) ? 2000 : 0;
    let strong = true;
    for (const token of tokens) {
      const best = Math.max(
        labelScore(token, label) + 40,
        wordScore(token, group, 90, 70),
        ...aliases.map((alias) => wordScore(token, alias, 90, 70)),
      );
      if (best > 40) {
        score += best;
        continue;
      }
      // Prose needs at least three letters; shorter words are everywhere.
      const fallback =
        token.length >= 3 ? Math.max(0, ...prose.map((text) => wordScore(token, text, 30, 20))) : 0;
      if (!fallback) return { item, score: 0, strong: false };
      score += fallback;
      strong = false;
    }
    return { item, score, strong };
  });

  const matches = scored.filter(({ score }) => score > 0);
  const anyStrong = matches.some(({ strong }) => strong);
  return matches
    .filter(({ strong }) => strong || !anyStrong)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
}
