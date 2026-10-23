import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ChangelogContent } from "@/components/app/changelog/changelog-content";
import { changelogEntries } from "@/lib/changelog";

afterEach(cleanup);

test("changelog lists dated weeks under one heading outline with named item links", async () => {
  const { container, getAllByRole, getByRole } = render(<ChangelogContent />);

  expect(getAllByRole("heading", { level: 1 })).toHaveLength(1);
  expect(getAllByRole("heading", { level: 2 })).toHaveLength(changelogEntries.length);
  expect(container.querySelectorAll("time[datetime]")).toHaveLength(changelogEntries.length);
  expect(getByRole("link", { name: "RSS feed" }).getAttribute("href")).toBe("/changelog/rss.xml");
  for (const link of getAllByRole("link")) {
    expect(link.textContent?.trim().length).toBeGreaterThan(0);
  }
  expect((await axe(container)).violations).toEqual([]);
});
