const DAY_MS = 24 * 60 * 60 * 1000;

export const NEW_BADGE_DURATION_MS = 7 * DAY_MS;

type ComponentLaunch = {
  badge?: "new";
  launchedAt?: string;
};

function launchTimestamp(launchedAt?: string) {
  if (!launchedAt) return null;

  const timestamp = Date.parse(`${launchedAt}T00:00:00Z`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

export function getNewBadgeRemainingMs(
  launchedAt?: string,
  now = Date.now(),
) {
  const launched = launchTimestamp(launchedAt);
  if (launched === null) return 0;

  return Math.max(0, launched + NEW_BADGE_DURATION_MS - now);
}

export function isComponentNew(component: ComponentLaunch, now = Date.now()) {
  return (
    component.badge === "new" &&
    getNewBadgeRemainingMs(component.launchedAt, now) > 0
  );
}

// Overview pages that lead their list instead of sorting in with the items
// they cover.
const PINNED_FIRST = new Set(["sound-kit"]);

function isPinned(item: unknown) {
  return (
    typeof item === "object" &&
    item !== null &&
    "slug" in item &&
    typeof item.slug === "string" &&
    PINNED_FIRST.has(item.slug)
  );
}

/**
 * Sidebar order: pinned overviews first, then alphabetical by the shown name.
 * New items keep their badge in place.
 */
export function sidebarOrder<T>(items: readonly T[], nameOf: (item: T) => string) {
  return [...items].sort(
    (a, b) =>
      Number(isPinned(b)) - Number(isPinned(a)) ||
      nameOf(a).localeCompare(nameOf(b), "en", { sensitivity: "base" }),
  );
}
