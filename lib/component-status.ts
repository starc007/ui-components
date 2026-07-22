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
  if (launched === null || now < launched) return 0;

  return Math.max(0, launched + NEW_BADGE_DURATION_MS - now);
}

export function isComponentNew(component: ComponentLaunch, now = Date.now()) {
  return (
    component.badge === "new" &&
    getNewBadgeRemainingMs(component.launchedAt, now) > 0
  );
}
