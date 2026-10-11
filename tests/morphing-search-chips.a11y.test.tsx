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

test("panel below the bar with a loading list stays a valid combobox", async () => {
  const { container, getByRole } = render(
    <main>
      <MorphingSearchChips {...props} side="bottom" defaultQuery="da" loading defaultOpen />
    </main>,
  );
  const field = getByRole("combobox", { name: "Search inspiration" });
  const list = getByRole("listbox", { name: "Suggestions" });
  expect(list.getAttribute("aria-busy")).toBe("true");
  expect(field.getAttribute("aria-controls")).toBe(list.id);
  expect((await axe(container)).violations).toEqual([]);
});

test("nothing to show keeps the combobox collapsed", async () => {
  const { container, getByRole, queryByRole } = render(
    <main>
      <MorphingSearchChips label="Search inspiration" defaultOpen />
    </main>,
  );
  expect(getByRole("combobox", { name: "Search inspiration" }).getAttribute("aria-expanded")).toBe(
    "false",
  );
  expect(queryByRole("listbox")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("disabled bar exposes a disabled field and remove buttons", async () => {
  const { container, getByRole } = render(
    <main>
      <MorphingSearchChips {...props} disabled />
    </main>,
  );
  expect((getByRole("combobox", { name: "Search inspiration" }) as HTMLInputElement).disabled).toBe(
    true,
  );
  expect(
    (getByRole("button", { name: "Remove filter onboarding" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});
