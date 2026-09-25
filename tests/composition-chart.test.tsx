import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CompositionChart, useCompositionChart } from "@/components/charts/composition-chart";
import { buildComposition, compositionArea } from "@/components/charts/composition-chart/model";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);
const periods = ["Jan", "Feb", "Mar"];
const series = [
  { id: "a", name: "Search", color: "#2563eb", values: [30, 10, 70] },
  { id: "b", name: "Direct", color: "#0d9488", values: [10, 30, 30] },
];

test("normalizes raw values and preserves the supplied stack order", () => {
  const { columns } = buildComposition(series, periods);
  expect(columns[0].segments.map((segment) => segment.share)).toEqual([75, 25]);
  expect(columns[0].segments.map((segment) => segment.offset)).toEqual([0, 75]);
  const huge = buildComposition(
    series.map((row) => ({ ...row, values: [Number.MAX_VALUE] })),
    ["Now"],
  );
  expect(huge.columns[0].segments.map((segment) => segment.share)).toEqual([50, 50]);
});

test("missing, negative, nonfinite, and zero-total periods are gaps", () => {
  const { columns } = buildComposition(
    [{ ...series[0], values: [1, null, -1, NaN, Infinity, 0] }],
    ["a", "b", "c", "d", "e", "f", "g"],
  );
  expect(columns.map((column) => column.valid)).toEqual([
    true,
    false,
    false,
    false,
    false,
    false,
    false,
  ]);
  expect(compositionArea(columns, 0)).not.toMatch(/NaN|Infinity/);
  const incomplete = buildComposition(
    [
      { ...series[0], values: [10] },
      { ...series[1], values: [null] },
    ],
    ["Now"],
  );
  expect(incomplete.columns[0].valid).toBe(false);
});

test("area paths break at missing periods and single points remain visible", () => {
  const { columns } = buildComposition(
    [{ ...series[0], values: [1, 2, null, 3] }],
    ["a", "b", "c", "d"],
  );
  const path = compositionArea(columns, 0);
  expect(path.match(/M/g)).toHaveLength(2);
  expect(path).toContain("M75,100 L75,0 L100,0 L100,100 Z");
  expect(compositionArea([], 0)).toBe("");
});

test("duplicate identities keep the first observation and series", () => {
  const model = buildComposition([...series, series[0]], ["Jan", "Jan", "Mar"]);
  expect(model.rows).toHaveLength(2);
  expect(model.columns.map((column) => column.id)).toEqual(["Jan", "Mar"]);
  expect(model.columns[1].segments[0].value).toBe(70);
});

test("direct chart inspection updates shares without reordering the legend", () => {
  const screen = render(<CompositionChart series={series} periods={periods} />);
  const slider = screen.getByRole("slider", { name: "Inspect period" });
  expect(slider.getAttribute("aria-valuetext")).toBe("Mar");
  fireEvent.change(slider, { target: { value: "1" } });
  expect(slider.getAttribute("aria-valuetext")).toBe("Feb");
  expect(screen.getAllByRole("button")[0].textContent).toContain("Search");
  expect(screen.getByRole("button", { name: "Highlight Direct" }).textContent).toContain("75.0%");
  expect(screen.container.querySelector("table")).toBeNull();
  expect(screen.queryByText("View data")).toBeNull();
  expect(screen.queryByText("Inspect period")).toBeNull();
});

test("controlled periods emit a request and wait for the parent", () => {
  const changes: string[] = [];
  const screen = render(
    <CompositionChart
      series={series}
      periods={periods}
      period="Jan"
      onPeriodChange={(id) => changes.push(id)}
    />,
  );
  const slider = screen.getByRole("slider");
  fireEvent.change(slider, { target: { value: "2" } });
  expect(changes).toEqual(["Mar"]);
  expect(slider.getAttribute("aria-valuetext")).toBe("Jan");
});

function State() {
  const { column, highlight } = useCompositionChart();
  return (
    <output data-testid="state">
      {column?.id}/{highlight ?? "none"}
    </output>
  );
}

test("removed period identities clear and do not revive when data returns", () => {
  const screen = render(
    <CompositionChart series={series} periods={periods} defaultPeriod="Feb">
      <State />
    </CompositionChart>,
  );
  expect(screen.getByTestId("state").textContent).toBe("Feb/none");
  screen.rerender(
    <CompositionChart series={series} periods={["Apr", "May", "Jun"]}>
      <State />
    </CompositionChart>,
  );
  expect(screen.getByTestId("state").textContent).toBe("Jun/none");
  screen.rerender(
    <CompositionChart series={series} periods={periods}>
      <State />
    </CompositionChart>,
  );
  expect(screen.getByTestId("state").textContent).toBe("Mar/none");
});

test("legend supports focus, pinning, and Escape", () => {
  const screen = render(<CompositionChart series={series} periods={periods} />);
  const button = screen.getByRole("button", { name: "Highlight Search" });
  fireEvent.focus(button);
  fireEvent.click(button);
  expect(button.getAttribute("aria-pressed")).toBe("true");
  fireEvent.keyDown(button, { key: "Escape" });
  expect(button.getAttribute("aria-pressed")).toBe("false");
});

test("empty input and a single zero sample remain usable", () => {
  const screen = render(<CompositionChart series={[]} periods={[]} />);
  expect(screen.getByText("No composition data")).toBeTruthy();
  screen.rerender(<CompositionChart series={[{ ...series[0], values: [0] }]} periods={["Now"]} />);
  expect(screen.getByRole("slider").hasAttribute("disabled")).toBe(true);
  expect(screen.getByText("Now · No data")).toBeTruthy();
});

test("chart supports both representations", () => {
  const screen = render(<CompositionChart series={series} periods={periods} view="bar" />);
  expect(screen.container.querySelectorAll("svg rect").length).toBe(6);
  screen.rerender(<CompositionChart series={series} periods={periods} view="area" />);
  expect(screen.container.querySelectorAll("svg path[fill]").length).toBe(2);
});

test("registry ships the composition parts and no illustrative dataset", async () => {
  const item = await buildShadcnItem("charts", "composition-chart");
  expect(item).toBeTruthy();
  const paths = item?.files.map((file) => file.path) ?? [];
  expect(paths.some((path) => path.endsWith("composition-chart/model.ts"))).toBe(true);
  expect(paths.some((path) => path.endsWith("composition-chart/plot.tsx"))).toBe(true);
  expect(item?.dependencies).toContain("motion");
  expect(paths.some((path) => path.endsWith("composition-chart.preview.tsx"))).toBe(false);
});
