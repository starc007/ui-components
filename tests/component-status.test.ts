import { describe, expect, test } from "bun:test";
import {
  getNewBadgeRemainingMs,
  isComponentNew,
  NEW_BADGE_DURATION_MS,
} from "@/lib/component-status";

const LAUNCH = Date.parse("2026-07-22T00:00:00Z");

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

  test("does not show for future, missing, or unbadged launches", () => {
    expect(
      isComponentNew(
        { badge: "new", launchedAt: "2026-07-22" },
        LAUNCH - 1,
      ),
    ).toBe(false);
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
});
