import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { changelogEntries } from "@/lib/changelog";
import { withIntl } from "./intl";

afterEach(cleanup);

test("changelog lists dated releases under one heading outline with named item links", async () => {
  const { container, getAllByRole, getByRole } = render(withIntl(<ChangelogContent />));

  const months = new Set(changelogEntries.map((entry) => entry.date.slice(0, 7)));
  expect(getAllByRole("heading", { level: 1 })).toHaveLength(1);
  // Months are h2; each release is an h3 under its month.
  expect(getAllByRole("heading", { level: 2 })).toHaveLength(months.size);
  expect(getAllByRole("heading", { level: 3 })).toHaveLength(changelogEntries.length);
  expect(container.querySelectorAll("time[datetime]")).toHaveLength(changelogEntries.length);
  expect(getByRole("link", { name: "RSS feed" }).getAttribute("href")).toBe("/changelog/rss.xml");
  for (const link of getAllByRole("link")) {
    const name = link.getAttribute("aria-label") ?? link.textContent ?? "";
    expect(name.trim().length).toBeGreaterThan(0);
  }
  expect((await axe(container)).violations).toEqual([]);
});
