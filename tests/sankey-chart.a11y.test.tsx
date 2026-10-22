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
  // Two unnamed links between one pair are summed into a single 70 band.
  { source: "search", target: "signup", value: 50 },
  { source: "search", target: "signup", value: 20 },
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
  expect(table.textContent).toContain("70");
  expect(table.querySelectorAll("tbody tr")).toHaveLength(4);
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

test("data with nothing to draw names the chart and explains why", async () => {
  const { container, getByRole, getByText, rerender } = render(
    <SankeyChart
      nodes={nodes}
      links={[{ source: "ads", target: "ads", value: 5 }]}
      label="Signup flow"
    />,
  );
  expect(getByRole("region", { name: "Signup flow" })).toBeTruthy();
  expect(getByText("No flows to show")).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
  rerender(<SankeyChart nodes={[]} links={[]} label="Signup flow" />);
  expect(getByText("No sankey data")).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("removing the focused node hands focus to the remaining tab stop", async () => {
  const { getByRole, rerender } = render(
    <SankeyChart nodes={nodes} links={links} label="Signup flow" />,
  );
  const paid = getByRole("button", { name: /^Paid/ });
  await act(async () => paid.focus());
  rerender(
    <SankeyChart
      nodes={nodes.filter((node) => node.id !== "paid")}
      links={links.filter((link) => link.target !== "paid")}
      label="Signup flow"
    />,
  );
  const focused = document.activeElement as HTMLElement;
  expect(focused.tagName).toBe("BUTTON");
  expect(focused.tabIndex).toBe(0);
  expect(focused.getAttribute("aria-label")).not.toMatch(/^Paid/);
});
