import { componentPath } from "@/lib/component-paths";
import { allComponents } from "@/lib/registry";
import { changelogEntries } from "@/lib/changelog/entries";
import type { ChangelogItem } from "@/lib/changelog/types";

export const CHANGELOG_PATH = "/changelog";
export const CHANGELOG_FEED_PATH = "/changelog/rss.xml";
export const CHANGELOG_DESCRIPTION =
  "Every week of beUI: new animated React and React Native components, improvements, and accessibility and motion fixes.";

export { changelogEntries };

export const CHANGE_LABELS: Record<ChangelogItem["type"], string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

/** Where an item links: its component page, its own path, or nowhere. */
export function changelogItemLink(item: ChangelogItem) {
  if (item.component) {
    const component = allComponents().find((entry) => entry.slug === item.component);
    if (component) {
      return { href: componentPath(component.category.slug, component.slug), label: component.name };
    }
  }
  return item.href ? { href: item.href, label: undefined } : null;
}

/** Stable anchor for an entry, so a week can be linked directly. */
export function changelogAnchor(date: string) {
  return `week-${date}`;
}
