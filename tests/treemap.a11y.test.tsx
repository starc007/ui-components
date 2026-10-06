import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Treemap,
  TreemapLegend,
  TreemapPlot,
  TreemapTooltip,
  type TreemapNode,
} from "@/components/charts/treemap";
import { TreemapPreview } from "@/components/previews/charts/treemap.preview";

afterEach(cleanup);

const data: readonly TreemapNode[] = [
  {
    id: "group",
    label: "Investments",
    children: [
      { id: "equity", label: "Equity", value: 60, description: "Long-term holdings" },
      { id: "bonds", label: "Bonds", value: 40 },
      { id: "cash", label: "Cash", value: 0 },
    ],
  },
];

test("treemap exposes hierarchy and exact values with one tile in the tab order", async () => {
  const { container, getByRole, getAllByRole } = render(<Treemap data={data} label="Allocation" />);
  const table = getByRole("table", { name: "Allocation data" });
  expect(table.textContent).toContain("Investments / Equity");
  expect(table.textContent).toContain("Cash");
  expect(table.textContent).toContain("Long-term holdings");
  const buttons = getAllByRole("button");
  expect(buttons).toHaveLength(2);
  expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
  expect(getByRole("button", { name: /Investments \/ Equity. 60. 60.0% of total/ })).toBeTruthy();
  expect(getByRole("list", { name: "Treemap legend" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("composed controlled tiles link keyboard focus to custom tooltip content", async () => {
  const { getByRole } = render(
    <main>
      <Treemap data={data} activeId="equity" label="Allocation">
        <TreemapPlot renderTile={(tile) => <span>{tile.label}</span>} />
        <TreemapTooltip>
          {(item) => (
            <span>
              {item.path.join(" / ")}: {item.value}. {item.description}
            </span>
          )}
        </TreemapTooltip>
        <TreemapLegend showValues />
      </Treemap>
    </main>,
  );
  const button = getByRole("button", { name: /Investments \/ Equity/ });
  await act(async () => button.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(document.activeElement).toBe(button);
  expect(button.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect(getByRole("tooltip").textContent).toContain("Long-term holdings");
  // The shared Tooltip portals outside the consumer's page landmarks.
  await act(async () =>
    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations,
    ).toEqual([]),
  );
});

test("animated default tooltip retains exact fractional values for assistive technology", async () => {
  const { getByRole } = render(
    <main>
      <Treemap
        data={[{ id: "fraction", label: "Fraction", value: 1.875 }]}
        formatValue={(value) => value.toFixed(3)}
      />
    </main>,
  );
  const button = getByRole("button", { name: "Fraction. 1.875. 100.0% of total" });
  await act(async () => button.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(within(getByRole("tooltip")).getByText("1.875")).toBeTruthy();
  expect(within(getByRole("tooltip")).getByText("100.0%")).toBeTruthy();
  await act(async () =>
    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations,
    ).toEqual([]),
  );
});

test("removed focused tiles hand focus to a surviving tile with a valid tab stop", async () => {
  const { container, getByRole, rerender } = render(
    <Treemap
      data={[
        { id: "first", label: "First", value: 20 },
        { id: "second", label: "Second", value: 40 },
      ]}
    />,
  );
  await act(async () => getByRole("button", { name: /Second/ }).focus());
  rerender(<Treemap data={[{ id: "first", label: "First", value: 20 }]} />);
  expect(document.activeElement).toBe(getByRole("button", { name: /First/ }));
  expect(getByRole("button", { name: /First/ }).tabIndex).toBe(0);
  expect((await axe(container)).violations).toEqual([]);
});

test("empty and zero-weight trees keep readable states without unusable tile controls", async () => {
  const { container, getByText, queryByRole, getByRole, rerender } = render(<Treemap data={[]} />);
  expect(getByText("No treemap data")).toBeTruthy();
  expect(queryByRole("button")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
  rerender(<Treemap data={[{ id: "zero", label: "Empty holding", value: 0 }]} />);
  expect(getByText("No positive values")).toBeTruthy();
  expect(getByRole("table").textContent).toContain("Empty holding");
  expect(queryByRole("button")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("quarter tabs label the chart panel and expose one selected tab", async () => {
  const { container, getByRole, getAllByRole } = render(<TreemapPreview />);
  const panel = getByRole("tabpanel", { name: "Q1" });
  expect(getByRole("tab", { name: "Q1" }).getAttribute("aria-controls")).toBe(panel.id);
  expect(getAllByRole("tab").filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  expect(
    getAllByRole("tab").filter((tab) => tab.getAttribute("aria-selected") === "true"),
  ).toHaveLength(1);
  expect((await axe(container)).violations).toEqual([]);
});
