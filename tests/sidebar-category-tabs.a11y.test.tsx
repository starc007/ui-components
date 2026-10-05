import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { useState } from "react";
import { SidebarCategoryTabs } from "@/components/app/chrome/site-sidebar";

afterEach(cleanup);

function CategoryTabs() {
  const [value, setValue] = useState("all");
  return (
    <>
      <SidebarCategoryTabs id="categories" panelId="category-panel" value={value} onValueChange={setValue} />
      <div id="category-panel" role="tabpanel" aria-labelledby={`categories-${value}`}>
        <a href="/components/motion">Browse category</a>
      </div>
    </>
  );
}

test("icon category tabs retain accessible names, one tab stop, and a labelled panel", async () => {
  const { container, getByRole } = render(<CategoryTabs />);
  expect(getByRole("tablist", { name: "Component categories" })).toBeTruthy();
  for (const name of ["All", "Agents", "Components", "Blocks"]) {
    expect(getByRole("tab", { name }).getAttribute("tabindex")).toBe(name === "All" ? "0" : "-1");
  }
  expect(getByRole("tabpanel", { name: "All" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("arrow and boundary keys move category selection and focus together", async () => {
  const { container, getByRole } = render(<CategoryTabs />);
  const all = getByRole("tab", { name: "All" });
  await act(async () => {
    all.focus();
    fireEvent.keyDown(all, { key: "ArrowRight" });
  });
  const agents = getByRole("tab", { name: "Agents" });
  expect(document.activeElement).toBe(agents);
  expect(agents.getAttribute("aria-selected")).toBe("true");
  expect(getByRole("tabpanel", { name: "Agents" })).toBeTruthy();
  await act(async () => { fireEvent.keyDown(agents, { key: "End" }); });
  const blocks = getByRole("tab", { name: "Blocks" });
  expect(document.activeElement).toBe(blocks);
  expect(blocks.getAttribute("tabindex")).toBe("0");
  expect(container.querySelectorAll('[role="tab"][tabindex="0"]').length).toBe(1);
  expect((await axe(container)).violations).toEqual([]);
  await act(async () => { fireEvent.keyDown(blocks, { key: "Home" }); });
  expect(document.activeElement).toBe(all);
  expect(all.getAttribute("aria-selected")).toBe("true");
});

test("inactive icon tabs expose a tooltip description that clears on selection", async () => {
  const { container, getByRole, queryByRole } = render(<CategoryTabs />);
  const agents = getByRole("tab", { name: "Agents" });
  await act(async () => { agents.focus(); });
  await waitFor(() => expect(getByRole("tooltip").textContent).toBe("Agents"));
  expect(agents.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect((await axe(container)).violations).toEqual([]);
  expect((await axe(getByRole("tooltip"))).violations).toEqual([]);
  await act(async () => { fireEvent.click(agents); });
  expect(agents.getAttribute("aria-selected")).toBe("true");
  expect(agents.getAttribute("aria-describedby")).toBeNull();
  await waitFor(() => expect(queryByRole("tooltip")).toBeNull());
});
