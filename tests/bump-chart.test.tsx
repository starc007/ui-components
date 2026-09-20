import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { BumpChart, BumpChartLegend, useBumpChart } from "@/components/charts/bump-chart";
import { buildBumpChart, bumpPath } from "@/components/charts/bump-chart/model";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);
const periods = ["Jan", "Feb", "Mar"];
const series = [
  { id: "a", name: "Alpha", ranks: [3, 2, 1] },
  { id: "b", name: "Beta", ranks: [1, 1, 2] },
];
function Readout() {
  const { pinned, highlighted } = useBumpChart();
  return <output data-testid="state">{`${pinned ?? "none"}/${highlighted ?? "none"}`}</output>;
}

test("normalizes missing/invalid ranks and preserves numeric rank distances", () => {
  const model = buildBumpChart(
    [
      { id: "a", name: "A", ranks: [1, 3, null, 0, -1, NaN, Infinity, 2.5] },
      { id: "a", name: "Duplicate", ranks: [9] },
    ],
    9,
  );
  expect(model.rows).toHaveLength(1);
  expect(model.rows[0].ranks).toEqual([1, 3, null, null, null, null, null, null, null]);
  expect(model.y(2) - model.y(1)).toBe(model.y(3) - model.y(2));
  expect(Number.isFinite(buildBumpChart([{ id: "a", name: "A", ranks: [1] }], 1).x(0))).toBe(true);
});

test("missing periods split curves instead of bridging gaps", () => {
  const path = bumpPath(
    [1, 2, null, 1, 3],
    (i) => i * 10,
    (rank) => rank * 20,
  );
  expect(path).toBe("M 0 20 C 5 20, 5 40, 10 40 M 30 20 C 35 20, 35 60, 40 60");
});

test("focus isolates a series, clicking pins it, Escape clears the pin", () => {
  const { getByRole, getByTestId } = render(
    <BumpChart series={series} periods={periods}>
      <BumpChartLegend />
      <Readout />
    </BumpChart>,
  );
  const alpha = getByRole("button", { name: "Highlight Alpha" });
  fireEvent.focus(alpha);
  expect(getByTestId("state").textContent).toBe("none/a");
  fireEvent.click(alpha);
  expect(alpha.getAttribute("aria-pressed")).toBe("true");
  fireEvent.blur(alpha);
  expect(getByTestId("state").textContent).toBe("a/a");
  fireEvent.keyDown(alpha, { key: "Escape" });
  expect(getByTestId("state").textContent).toBe("none/none");
});

test("controlled selection reports intent without mutating the pinned series", () => {
  const changes: (string | null)[] = [];
  const { getByRole } = render(
    <BumpChart
      series={series}
      periods={periods}
      active="b"
      onActiveChange={(id) => changes.push(id)}
    />,
  );
  fireEvent.click(getByRole("button", { name: "Highlight Alpha" }));
  expect(changes).toEqual(["a"]);
  expect(getByRole("button", { name: "Highlight Beta" }).getAttribute("aria-pressed")).toBe("true");
});

test("removed series cannot revive an old uncontrolled selection", () => {
  const { rerender, getByRole } = render(
    <BumpChart series={series} periods={periods} defaultActive="a" />,
  );
  rerender(<BumpChart series={[series[1]]} periods={periods} defaultActive="a" />);
  rerender(<BumpChart series={series} periods={periods} defaultActive="a" />);
  expect(getByRole("button", { name: "Highlight Alpha" }).getAttribute("aria-pressed")).toBe(
    "false",
  );
});

test("empty data has an honest empty state and exact ranks have table semantics", () => {
  const { getByText, getByRole, rerender } = render(<BumpChart series={[]} periods={[]} />);
  expect(getByText("No rankings yet")).toBeTruthy();
  rerender(<BumpChart series={series} periods={periods} />);
  expect(getByRole("table").textContent).toContain("Alpha321");
  expect(getByRole("img", { name: "Rankings over time" })).toBeTruthy();
});

test("the registry includes all chart parts and its public preview", async () => {
  const item = await buildShadcnItem("charts", "bump-chart");
  expect(item).not.toBeNull();
  const paths = item?.files?.map((file) => file.path) ?? [];
  for (const path of [
    "components/charts/bump-chart.tsx",
    "components/charts/bump-chart/context.tsx",
    "components/charts/bump-chart/model.ts",
    "components/charts/bump-chart/plot.tsx",
    "components/charts/bump-chart/legend.tsx",
    "components/charts/bump-chart/point.tsx",
    "components/motion/tooltip.tsx",
  ])
    expect(paths).toContain(path);
});


test("rank dots expose focused tooltips with previous-period changes", async () => {
  const { getByRole } = render(<BumpChart series={series} periods={periods} />);
  const dot = getByRole("button", { name: "Alpha, Feb: rank 2" });
  fireEvent.focus(dot);
  await waitFor(() => expect(getByRole("tooltip").textContent).toContain("Up 1 place"));
  expect(getByRole("tooltip").textContent).toContain("Previously #3 in Jan");
  expect(dot.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  fireEvent.click(dot);
  expect(getByRole("button", { name: "Highlight Alpha" }).getAttribute("aria-pressed")).toBe("true");
});

test("first-period tooltips do not invent a previous rank", async () => {
  const { getByRole } = render(<BumpChart series={series} periods={periods} />);
  fireEvent.focus(getByRole("button", { name: "Alpha, Jan: rank 3" }));
  await waitFor(() => expect(getByRole("tooltip").textContent).toContain("No previous rank"));
});
