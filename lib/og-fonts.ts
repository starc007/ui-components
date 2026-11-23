import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Fonts for the social cards and blog banners, matching the site: Plus Jakarta
 * Sans for titles, Inter for everything else. Satori needs static TTF files,
 * so these live in public/og/fonts instead of coming from the variable
 * fontsource packages the site uses. Build scripts only.
 */
export const CARD_TITLE_FONT = "Plus Jakarta Sans";
export const CARD_TEXT_FONT = "Inter";

export async function loadCardFonts() {
  const read = (file: string) => readFile(path.join("public/og/fonts", file));
  const [regular, medium, title] = await Promise.all([
    read("Inter-Regular.ttf"),
    read("Inter-Medium.ttf"),
    read("PlusJakartaSans-Medium.ttf"),
  ]);
  return [
    { name: CARD_TEXT_FONT, data: regular, weight: 400 as const, style: "normal" as const },
    { name: CARD_TEXT_FONT, data: medium, weight: 500 as const, style: "normal" as const },
    { name: CARD_TITLE_FONT, data: title, weight: 500 as const, style: "normal" as const },
  ];
}
