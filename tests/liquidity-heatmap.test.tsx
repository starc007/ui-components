import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { LiquidityHeatmap } from "@/components/charts/liquidity-heatmap";
import { buildLiquidityHeatmap, pricePosition } from "@/components/charts/liquidity-heatmap/model";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);
const snapshots = [
  {
    id: "a",
    label: "10:00",
    price: 101,
    levels: [
      { price: 102, size: 10 },
      { price: 100, size: 0 },
    ],
  },
  { id: "b", label: "10:05", price: 102, levels: [{ price: 102, size: 20 }] },
];
test("merges price buckets, filters invalid values, preserves zero and missing observations", () => {
  const result = buildLiquidityHeatmap([
    ...snapshots,
    { id: "a", label: "duplicate", levels: [{ price: 999, size: 9 }] },
    {
      id: "c",
      label: "10:10",
      levels: [
        { price: 102, size: 10 },
        { price: 102, size: 15 },
        { price: NaN, size: 2 },
        { price: 1, size: -2 },
        { price: 3, size: Infinity },
      ],
    },
  ]);
  expect(result.prices).toEqual([102, 100]);
  expect(result.columns.length).toBe(3);
  expect(result.columns[2].levels.get(102)).toBe(25);
  expect(result.columns[0].levels.get(100)).toBe(0);
  expect(result.columns[1].levels.has(100)).toBe(false);
  expect(result.maximum).toBe(25);
  expect(snapshots[0].levels.length).toBe(2);
});
test("trace interpolates nonuniform buckets and breaks at missing or out-of-range prices", () => {
  expect(pricePosition(105, [110, 100, 99])).toBe(1);
  expect(pricePosition(99, [110, 100, 99])).toBe(2.5);
  expect(pricePosition(100, [100])).toBe(0.5);
  expect(pricePosition(98, [110, 100, 99])).toBeNull();
  expect(pricePosition(NaN, [100])).toBeNull();
  expect(pricePosition(100, [])).toBeNull();
});
test("keyboard inspection has one tab stop, navigates and dismisses tooltip", async () => {
  const view = render(<LiquidityHeatmap snapshots={snapshots} unit="SOL" />);
  const buttons = view.getAllByRole("button");
  expect(buttons.map((button) => button.tabIndex)).toEqual([0, -1, -1, -1]);
  fireEvent.keyDown(buttons[0], { key: "ArrowDown" });
  expect(document.activeElement === buttons[2]).toBe(true);
  await waitFor(() => expect(view.getByRole("tooltip").textContent).toContain("0 SOL"));
  fireEvent.keyDown(buttons[2], { key: "ArrowRight" });
  await waitFor(() => expect(view.getByRole("tooltip").textContent).toContain("No data"));
  fireEvent.keyDown(buttons[3], { key: "Escape" });
  await waitFor(() => expect(view.queryByRole("tooltip")).toBeNull());
});
test("removed cursor does not revive when snapshots return; empty state is explicit", () => {
  const view = render(<LiquidityHeatmap snapshots={snapshots} />);
  fireEvent.focus(view.getAllByRole("button")[1]);
  view.rerender(<LiquidityHeatmap snapshots={[snapshots[0]]} />);
  expect(view.getAllByRole("button")[0].tabIndex).toBe(0);
  view.rerender(<LiquidityHeatmap snapshots={snapshots} />);
  expect(view.getAllByRole("button")[0].tabIndex).toBe(0);
  view.rerender(<LiquidityHeatmap snapshots={[]} />);
  expect(view.getByText("No liquidity data")).toBeTruthy();
});
test("registry ships chart model and shared tooltip", async () => {
  const item = await buildShadcnItem("charts", "liquidity-heatmap");
  expect(item?.files.some((file) => file.path.endsWith("liquidity-heatmap/model.ts"))).toBe(true);
  expect(item?.files.some((file) => file.path.endsWith("motion/tooltip.tsx"))).toBe(true);
});
