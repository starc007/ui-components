import type { IndexComponent } from "./registry.js";

// The same ranking as the site's command palette (lib/command-search.ts):
// every query word must match, names and short keywords are strong matches,
// and a description only counts when nothing matched strongly, so "swap"
// finds the swap components rather than every page that mentions swapping.

function normalize(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/** Whole word, then word start; never the middle of a word. */
function wordScore(token: string, field: string, exact: number, prefix: number) {
  const words = field.split(" ");
  if (words.includes(token)) return exact;
  if (token.length >= 2 && words.some((word) => word.startsWith(token))) return prefix;
  return 0;
}

/** Abbreviations like "swp": letters in order inside one similar-length word. */
function abbreviationScore(token: string, field: string) {
  if (token.length < 3) return 0;
  for (const word of field.split(" ")) {
    if (word.length - token.length > 2) continue;
    let matched = 0;
    for (const char of word) if (char === token[matched]) matched++;
    if (matched === token.length) return 20;
  }
  return 0;
}

export function searchComponents(components: IndexComponent[], query: string) {
  const normalized = normalize(query);
  if (!normalized) return [];
  const tokens = normalized.split(/\s+/);

  const scored = components.map((component) => {
    const name = normalize(component.name);
    const slug = normalize(component.slug);
    const category = normalize(component.category);
    const keywords = (component.keywords ?? []).map(normalize).filter(Boolean);
    const aliases = [
      slug,
      ...(component.install_slugs ?? []).map(normalize),
      ...keywords.filter((k) => k.split(" ").length <= 3),
    ];
    const prose = [
      normalize(component.description),
      ...keywords.filter((k) => k.split(" ").length > 3),
    ];

    let score = name === normalized || slug === normalized ? 10000 : name.startsWith(normalized) ? 2000 : 0;
    let strong = true;
    for (const token of tokens) {
      const best = Math.max(
        wordScore(token, name, 140, 120),
        abbreviationScore(token, name),
        wordScore(token, category, 90, 70),
        ...aliases.map((alias) => wordScore(token, alias, 90, 70)),
      );
      if (best > 0) {
        score += best;
        continue;
      }
      const fallback =
        token.length >= 3 ? Math.max(0, ...prose.map((text) => wordScore(token, text, 30, 20))) : 0;
      if (!fallback) return { component, score: 0, strong: false };
      score += fallback;
      strong = false;
    }
    return { component, score, strong };
  });

  const matches = scored.filter(({ score }) => score > 0);
  const anyStrong = matches.some(({ strong }) => strong);
  return matches
    .filter(({ strong }) => strong || !anyStrong)
    .sort((a, b) => b.score - a.score)
    .map(({ component }) => component);
}
