import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { BarChart } from "@/components/charts/bar-chart";
import { LineChart } from "@/components/charts/line-chart";
import { Sparkline } from "@/components/charts/sparkline";
import { BarChartPreview } from "@/components/previews/charts/bar-chart.preview";
import { LineChartPreview } from "@/components/previews/charts/line-chart.preview";
import { SparklinePreview } from "@/components/previews/charts/sparkline.preview";

afterEach(cleanup);

const categories = ["Jan", "Feb", "Mar"];
const series = [
  { id: "revenue", name: "Revenue", color: "#2563eb", values: [12, null, 18] },
  { id: "costs", name: "Costs", color: "#a1a1aa", values: [8, 9, 11] },
];
// The shared Tooltip portals outside the consumer's landmarks. This is a
// component audit; page-level landmark placement belongs to the docs shell.
const auditBody = async () =>
  (await axe(document.body, { rules: { region: { enabled: false } } })).violations;

test("line chart exposes every value, one named inspection slider and series toggles", async () => {
  const { container, getByRole, getAllByRole } = render(
    <LineChart series={series} categories={categories} label="Revenue" />,
  );
  const table = getByRole("table", { name: "Revenue data" });
  expect(table.textContent).toContain("No data");
  expect(getAllByRole("slider")).toHaveLength(1);
  const slider = getByRole("slider", { name: "Revenue: inspect values" });
  expect(slider.getAttribute("aria-valuetext")).toBe("Mar. Revenue 18. Costs 11");
  const costs = getByRole("button", { name: "Costs" });
  expect(costs.getAttribute("aria-pressed")).toBe("true");
  fireEvent.click(costs);
  expect(costs.getAttribute("aria-pressed")).toBe("false");
  expect(slider.getAttribute("aria-valuetext")).toBe("Mar. Revenue 18");
  expect((await axe(container)).violations).toEqual([]);
});

test("focused line chart opens a described tooltip that names the gap", async () => {
  const { getByRole } = render(
    <main>
      <LineChart series={series} categories={categories} defaultActiveId="Feb" label="Revenue" />
    </main>,
  );
  const slider = getByRole("slider", { name: "Revenue: inspect values" });
  await act(async () => slider.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(slider.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect(getByRole("tooltip").textContent).toContain("No data");
  await act(async () => expect(await auditBody()).toEqual([]));
});

test("stacked horizontal bar chart announces totals in visual order", async () => {
  const { container, getByRole } = render(
    <BarChart
      series={series}
      categories={categories}
      layout="stacked"
      orientation="horizontal"
      sort="descending"
      label="Spend"
    />,
  );
  const slider = getByRole("slider", { name: "Spend: inspect categories" });
  expect(slider.getAttribute("aria-orientation")).toBe("vertical");
  // Sorted descending, the last visual row is the smallest total (Feb: 9).
  expect(slider.getAttribute("aria-valuetext")).toBe("Feb. Revenue no data. Costs 9. Total 9");
  expect(getByRole("table", { name: "Spend data" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("focused bar chart tooltip lists each series and the stack total", async () => {
  const { getByRole } = render(
    <main>
      <BarChart series={series} categories={categories} layout="stacked" label="Spend" />
    </main>,
  );
  const slider = getByRole("slider", { name: "Spend: inspect categories" });
  await act(async () => slider.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(slider.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect(getByRole("tooltip").textContent).toContain("Total");
  await act(async () => expect(await auditBody()).toEqual([]));
});

test("empty charts stay readable without an unusable slider", async () => {
  const { container, getAllByText, queryByRole } = render(
    <>
      <LineChart series={[]} categories={[]} label="Empty line" />
      <BarChart series={[]} categories={[]} label="Empty bars" />
    </>,
  );
  expect(getAllByText("No data")).toHaveLength(2);
  expect(queryByRole("slider")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("static sparkline is one labelled image and the interactive one adds a single slider", async () => {
  const { container, getByRole, getAllByRole } = render(
    <>
      <Sparkline data={[10, 12, 15]} label="Revenue" showDelta />
      <Sparkline data={[3, 2, 4]} labels={["Mon", "Tue", "Wed"]} label="Errors" interactive />
    </>,
  );
  expect(getByRole("img", { name: "Revenue, from 10 to 15, up 50.0%" })).toBeTruthy();
  expect(getAllByRole("slider")).toHaveLength(1);
  expect(
    getByRole("slider", { name: "Errors: inspect samples" }).getAttribute("aria-valuetext"),
  ).toBe("Wed: 4");
  expect((await axe(container)).violations).toEqual([]);
});

test("chart previews keep their controls and charts named", async () => {
  const { container, getByRole, getAllByRole } = render(
    <>
      <LineChartPreview />
      <BarChartPreview />
      <SparklinePreview />
    </>,
  );
  expect(getByRole("region", { name: "Illustrative monthly revenue" })).toBeTruthy();
  expect(getByRole("region", { name: "Illustrative revenue by region" })).toBeTruthy();
  fireEvent.click(getByRole("button", { name: "Horizontal" }));
  expect(getByRole("button", { name: "Horizontal" }).getAttribute("aria-pressed")).toBe("true");
  expect(getAllByRole("img").length).toBeGreaterThanOrEqual(3);
  expect(getByRole("slider", { name: "Active users, last 30 days: inspect samples" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("loading line chart is busy, announces its label and offers no stale data", async () => {
  const { container, getByRole, queryByRole, rerender } = render(
    <LineChart series={series} categories={categories} status="loading" label="Revenue" />,
  );
  expect(getByRole("region", { name: "Revenue" }).getAttribute("aria-busy")).toBe("true");
  expect(getByRole("status").textContent).toContain("Loading data");
  expect(queryByRole("slider")).toBeNull();
  expect(queryByRole("table")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
  rerender(<LineChart series={series} categories={categories} status="ready" label="Revenue" />);
  expect(getByRole("region", { name: "Revenue" }).getAttribute("aria-busy")).toBeNull();
  expect(getByRole("slider", { name: "Revenue: inspect values" })).toBeTruthy();
  expect(getByRole("table", { name: "Revenue data" })).toBeTruthy();
});
