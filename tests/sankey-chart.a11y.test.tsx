import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  SankeyChart,
  SankeyChartPlot,
  SankeyChartTooltip,
  type SankeyLink,
  type SankeyNode,
} from "@/components/charts/sankey-chart";

afterEach(cleanup);

const nodes: SankeyNode[] = [
  { id: "ads", label: "Ads" },
  { id: "search", label: "Search" },
  { id: "signup", label: "Signup" },
  { id: "paid", label: "Paid" },
  { id: "free", label: "Free" },
];

const links: SankeyLink[] = [
  { source: "ads", target: "signup", value: 30 },
  { source: "search", target: "signup", value: 70 },
  { source: "signup", target: "paid", value: 40 },
  { source: "signup", target: "free", value: 60 },
  // Closes a loop, so it is left out of the chart and the table.
  { source: "paid", target: "ads", value: 5 },
];

test("sankey chart names its nodes, lists exact flows and keeps one tab stop", async () => {
  const { container, getByRole, getAllByRole } = render(
    <SankeyChart nodes={nodes} links={links} label="Signup flow" />,
  );
  expect(getByRole("region", { name: "Signup flow" })).toBeTruthy();
  const table = getByRole("table", { name: "Signup flow data" });
  expect(table.textContent).toContain("Search to Signup");
  expect(table.textContent).toContain("60.0%");
  expect(table.textContent).not.toContain("Paid to Ads");
  const buttons = getAllByRole("button");
  expect(buttons).toHaveLength(5);
  expect(buttons.filter((button) => button.tabIndex === 0)).toHaveLength(1);
  expect(getByRole("button", { name: /Signup. 100. in 100, out 100/ })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("arrow keys move focus across columns and focus opens the described tooltip", async () => {
  const { container, getByRole } = render(
    <main>
      <SankeyChart nodes={nodes} links={links} label="Signup flow">
        <SankeyChartPlot />
        <SankeyChartTooltip />
      </SankeyChart>
    </main>,
  );
  const first = getByRole("button", { name: /^Ads/ });
  await act(async () => first.focus());
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const signup = getByRole("button", { name: /^Signup/ });
  expect(document.activeElement).toBe(signup);
  expect(signup.tabIndex).toBe(0);
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(signup.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect((await axe(container)).violations).toEqual([]);
});
