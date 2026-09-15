import { describe, expect, test } from "bun:test";
import { searchCommands } from "@/lib/command-search";
import { componentSearchEntries } from "@/lib/site-search";

const items = [
  { label: "Animated Sidebar", group: "Components", keywords: ["navigation"] },
  { label: "Button", group: "Components", keywords: ["spring press"] },
  { label: "Inline Slider", group: "Components", keywords: ["range-slider-inline", "volume"] },
];

describe("command search", () => {
  test("ranks exact names ahead of incidental fuzzy matches", () => {
    expect(searchCommands([{ label: "But then on" }, { label: "Button" }], "button").map(x => x.label)).toEqual(["Button"]);
    expect(searchCommands([{ label: "Button Group" }, { label: "Button" }], "button")[0].label).toBe("Button");
  });
  test("normalizes whitespace, punctuation, case, and accents", () => {
    expect(searchCommands(items, "  INLINE--slider  ")[0].label).toBe("Inline Slider");
    expect(searchCommands([{ label: "Café" }], "cafe")).toHaveLength(1);
    expect(searchCommands(items, "   ")).toBe(items);
  });
  test("matches words in any order across label, group and keywords", () => {
    expect(searchCommands(items, "slider components volume").map(x => x.label)).toEqual(["Inline Slider"]);
    expect(searchCommands(items, "slider inline")[0].label).toBe("Inline Slider");
    expect(searchCommands(items, "slider missing")).toEqual([]);
  });
  test("supports bounded abbreviations without matching unrelated descriptions", () => {
    expect(searchCommands(items, "sldr")[0].label).toBe("Inline Slider");
    expect(searchCommands([{ label: "Something long and distant" }], "sldr")).toEqual([]);
  });
  test("indexes real variants and their install slugs with section links", () => {
    const result = searchCommands(componentSearchEntries, "Inline Slider")[0];
    expect(result.label).toBe("Inline Slider");
    expect(result.href).toStartWith("/components/motion/range-slider#");
    expect(searchCommands(componentSearchEntries, "range-slider-inline").some(x => x.id === result.id)).toBe(true);
    expect(new Set(componentSearchEntries.map(x => x.id)).size).toBe(componentSearchEntries.length);
  });
});
