import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { MorphingSearchChips } from "@/components/motion/morphing-search-chips";

afterEach(cleanup);

const props = {
  label: "Search inspiration",
  defaultChips: ["onboarding"],
  defaultRecents: ["dashboards", "empty states"],
  suggestions: ["dark mode", "data tables"],
};

test("closed bar exposes a collapsed combobox and named chip controls", async () => {
  const { container, getByRole } = render(
    <main>
      <MorphingSearchChips {...props} />
    </main>,
  );
  const field = getByRole("combobox", { name: "Search inspiration" });
  expect(field.getAttribute("aria-expanded")).toBe("false");
  expect(getByRole("button", { name: "Remove filter onboarding" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("open panel lists recents with an active descendant", async () => {
  const { container, getByRole } = render(
    <main>
      <MorphingSearchChips {...props} defaultOpen />
    </main>,
  );
  const field = getByRole("combobox", { name: "Search inspiration" });
  const list = getByRole("listbox", { name: "Recent searches" });
  expect(field.getAttribute("aria-expanded")).toBe("true");
  expect(field.getAttribute("aria-controls")).toBe(list.id);
  const active = document.getElementById(field.getAttribute("aria-activedescendant") ?? "");
  expect(active?.getAttribute("role")).toBe("option");
  expect(active?.getAttribute("aria-selected")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
});

test("typing switches the list to suggestions", async () => {
  const { container, getByRole } = render(
    <main>
      <MorphingSearchChips {...props} defaultOpen />
    </main>,
  );
  const field = getByRole("combobox", { name: "Search inspiration" });
  await act(async () => {
    fireEvent.change(field, { target: { value: "da" } });
  });
  expect(getByRole("listbox", { name: "Suggestions" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
