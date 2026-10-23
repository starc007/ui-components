import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Timeline } from "@/components/motion/timeline";

afterEach(cleanup);

const EVENTS = [
  { id: "beta", date: "2025-06-12", title: "Private beta opens", meta: "1,204 likes" },
  { id: "android", date: "2025-08-03", title: "Android app" },
  { id: "two", date: "2026-08-05", title: "Version 2.0" },
];

test("timeline names each event and keeps one tab stop that follows the arrow keys", async () => {
  const { container, getByRole } = render(
    <Timeline events={EVENTS} defaultValue="android" aria-label="Release history" />,
  );
  expect(getByRole("region", { name: "Release history" })).toBeTruthy();
  const current = getByRole("button", { name: "Aug 3 ’25 Android app" });
  expect(current.getAttribute("aria-current")).toBe("step");
  expect(current.tabIndex).toBe(0);
  expect(getByRole("button", { name: "Jun 12 ’25 Private beta opens" }).tabIndex).toBe(-1);
  expect((await axe(container)).violations).toEqual([]);

  current.focus();
  fireEvent.keyDown(current, { key: "End" });
  const last = getByRole("button", { name: "Aug 5 ’26 Version 2.0" });
  expect(document.activeElement).toBe(last);
  expect(last.getAttribute("aria-current")).toBe("step");
  expect(last.tabIndex).toBe(0);
  expect((await axe(container)).violations).toEqual([]);
});
