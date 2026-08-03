import { describe, expect, test } from "bun:test";
import {
  getNewBadgeRemainingMs,
  isComponentNew,
  NEW_BADGE_DURATION_MS,
} from "@/lib/component-status";
import { registry } from "@/lib/registry";

const LAUNCH = Date.parse("2026-07-22T00:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

describe("component new status", () => {
  test("stays new during the seven-day launch window", () => {
    expect(
      isComponentNew(
        { badge: "new", launchedAt: "2026-07-22" },
        LAUNCH + NEW_BADGE_DURATION_MS - 1,
      ),
    ).toBe(true);
  });

  test("expires exactly seven days after launch", () => {
    expect(
      isComponentNew(
        { badge: "new", launchedAt: "2026-07-22" },
        LAUNCH + NEW_BADGE_DURATION_MS,
      ),
    ).toBe(false);
  });

  test("shows scheduled launches and excludes missing or unbadged launches", () => {
    expect(
      isComponentNew(
        { badge: "new", launchedAt: "2026-07-22" },
        LAUNCH - 1,
      ),
    ).toBe(true);
    expect(isComponentNew({ badge: "new" }, LAUNCH)).toBe(false);
    expect(
      isComponentNew({ launchedAt: "2026-07-22" }, LAUNCH),
    ).toBe(false);
  });

  test("returns the remaining badge lifetime", () => {
    expect(getNewBadgeRemainingMs("2026-07-22", LAUNCH + 1_000)).toBe(
      NEW_BADGE_DURATION_MS - 1_000,
    );
  });

  test("keeps a scheduled badge visible through its launch window", () => {
    expect(getNewBadgeRemainingMs("2026-07-22", LAUNCH - DAY_MS)).toBe(
      NEW_BADGE_DURATION_MS + DAY_MS,
    );
  });
});

describe("agent launch ordering", () => {
  test("keeps the composed examples last and excludes Chat App from new launches", () => {
    const agents = registry.find((category) => category.slug === "agents");
    const lastSlugs = agents?.components.slice(-2).map((component) => component.slug);
    const chatApp = agents?.components.find(
      (component) => component.slug === "chat-app",
    );

    expect(lastSlugs).toEqual(["ai-sidebar", "chat-app"]);
    expect(isComponentNew(chatApp ?? {})).toBe(false);
  });
});
