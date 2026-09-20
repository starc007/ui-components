import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { buildFunnel, funnelPath } from "@/components/charts/funnel-chart/model";
import { FunnelChartPreview } from "@/components/previews/charts/funnel-chart.preview";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);
const stages = [{ id: "a", label: "Visited", value: 100 }, { id: "b", label: "Paid", value: 25 }];
test("derives overall and step conversions without mutating input", () => {
  const model = buildFunnel(stages);
  expect(model.conversion).toBe(25);
  expect(model.rows[1].stepConversion).toBe(25);
  expect(model.rows[1].change).toBe(-75);
  expect(model.rows[1].proportion).toBe(0.25);
  expect(stages[1].value).toBe(25);
});
test("handles zeros, increases, invalid values, and repeated IDs", () => {
  const model = buildFunnel([{ ...stages[0], value: 0 }, stages[1], { ...stages[1], value: 999 }, { id: "bad", label: "Bad", value: NaN }, { id: "negative", label: "Negative", value: -1 }]);
  expect(model.rows.length).toBe(2);
  expect(model.conversion).toBeNull();
  expect(model.rows[1].stepConversion).toBeNull();
  expect(model.rows[1].change).toBe(25);
  expect(model.rows[1].proportion).toBe(1);
  expect(buildFunnel([{ ...stages[0], value: 10 }, stages[1]]).conversion).toBe(250);
});
test("focused tooltips expose animated quantities and drop-off", async () => {
  const view = render(<FunnelChart stages={stages} unit="users" />);
  fireEvent.focus(view.getByRole("button", { name: "Paid: 25 users, 25.0% of starting total" }));
  await waitFor(() => expect(view.getByRole("tooltip").textContent).toContain("75 dropped"));
  expect(view.getByRole("tooltip").textContent).toContain("25 users");
  expect(view.getByRole("tooltip").textContent).toContain("25.0% from previous stage");
});
test("cohort updates preserve stage buttons and update readable totals", () => {
  const view = render(<FunnelChartPreview />);
  const before = view.getByRole("button", { name: "Subscribed: 4,320 people, 18.0% of starting total" });
  fireEvent.click(view.getByRole("button", { name: "Next cohort" }));
  const after = view.getByRole("button", { name: "Subscribed: 6,370 people, 22.8% of starting total" });
  expect(before === after).toBe(true);
});
test("empty state and registry dependencies are complete", async () => {
  const view = render(<FunnelChart stages={[]} />);
  expect(view.getByText("No funnel data")).toBeTruthy();
  const item = await buildShadcnItem("charts", "funnel-chart");
  const paths = item?.files.map((file) => file.path);
  expect(paths).toContain("components/charts/funnel-chart/model.ts");
  expect(paths).toContain("components/motion/number-ticker.tsx");
});


test("direction switches morph geometry without remounting stages or changing counts", async () => {
  const view = render(<FunnelChart stages={stages} direction="vertical" />);
  const stage = view.getByRole("button", { name: "Paid: 25 people, 25.0% of starting total" });
  const path = view.container.querySelector("svg path");
  expect(path?.getAttribute("d")).toBe(funnelPath([1, 0.25], 0, "vertical"));
  view.rerender(<FunnelChart stages={stages} direction="horizontal" />);
  const coordinates = (path: string) => (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map((value) => Math.round(Number(value) * 1000) / 1000);
  await waitFor(() => expect(coordinates(path?.getAttribute("d") ?? "")).toEqual(coordinates(funnelPath([1, 0.25], 0, "horizontal"))));
  expect(view.getByRole("button", { name: "Paid: 25 people, 25.0% of starting total" }) === stage).toBe(true);
});

test("zero-volume and single-stage paths remain finite in either direction", () => {
  for (const direction of ["vertical", "horizontal"] as const) {
    for (const values of [[0], [1], [1, 0, 0]]) {
      values.forEach((_, index) => {
        const path = funnelPath(values, index, direction);
        expect(path).not.toMatch(/NaN|Infinity/);
        expect(path.endsWith(" Z")).toBe(true);
      });
    }
  }
});
