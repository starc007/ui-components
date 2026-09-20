import { afterEach, expect, test } from "bun:test";
import { cleanup, render, within } from "@testing-library/react";
import { OrderBook, OrderBookSide } from "@/components/charts/order-book";
import { buildOrderBook } from "@/components/charts/order-book/model";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);

test("normalizes snapshots without mutation, limits nearest prices, accumulates outward", () => {
  const bids = Object.freeze([
    { price: 98, size: 20 },
    { price: 99, size: 3 },
    { price: 99, size: 7 },
    { price: 97, size: 80 },
  ]);
  const book = buildOrderBook(
    bids,
    [
      { price: 103, size: 6 },
      { price: 101, size: 4 },
      { price: 102, size: 5 },
      { price: NaN, size: 2 },
      { price: 100, size: -1 },
    ],
    2,
  );
  expect(book.bids).toEqual([
    { price: 99, size: 10, total: 10 },
    { price: 98, size: 20, total: 30 },
  ]);
  expect(book.asks).toEqual([
    { price: 101, size: 4, total: 4 },
    { price: 102, size: 5, total: 9 },
  ]);
  expect(book.spread).toBe(2);
  expect(book.midpoint).toBe(100);
  expect(book.maxTotal).toBe(30);
});

test("empty and one-sided snapshots do not invent quotes or spreads", () => {
  const book = buildOrderBook(
    [
      { price: 99, size: 0 },
      { price: 98, size: Infinity },
    ],
    [],
    9,
  );
  expect(book.maxTotal).toBe(0);
  expect(book.midpoint).toBeNull();
  expect(book.spread).toBeNull();
  expect(buildOrderBook([{ price: 99, size: 3 }], [], 9).spread).toBeNull();
  const { getByText } = render(<OrderBook bids={[]} asks={[]} />);
  expect(getByText("No asks")).toBeTruthy();
  expect(getByText("No bids")).toBeTruthy();
  expect(getByText("Spread unavailable")).toBeTruthy();
});

test("asks display descending with totals accumulated from best ask and react to new snapshots", () => {
  const props = {
    bids: [{ price: 99, size: 10 }],
    asks: [
      { price: 101, size: 4 },
      { price: 102, size: 6 },
    ],
  };
  const { getByRole, rerender } = render(<OrderBook {...props} />);
  const table = getByRole("table", { name: "Asks · sell orders" });
  const rows = within(table).getAllByRole("row");
  expect(
    within(rows[1])
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["102.00", "6", "10"]);
  expect(
    within(rows[2])
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["101.00", "4", "4"]);
  rerender(<OrderBook {...props} asks={[{ price: 101, size: 20 }]} />);
  expect(within(table).getAllByRole("row")).toHaveLength(2);
  expect(
    within(table)
      .getAllByRole("cell")
      .map((cell) => cell.textContent),
  ).toEqual(["101.00", "20", "20"]);
});

test("supports custom composition and formatters, and labels crossed books", () => {
  const props = { bids: [{ price: 102, size: 10 }], asks: [{ price: 101, size: 4 }] };
  const { getByText, queryByRole, rerender } = render(<OrderBook {...props} />);
  expect(getByText("Crossed book")).toBeTruthy();
  rerender(
    <OrderBook {...props} formatPrice={(n) => `$${n}`}>
      <OrderBookSide side="bid" />
    </OrderBook>,
  );
  expect(getByText("$102")).toBeTruthy();
  expect(queryByRole("table", { name: "Asks · sell orders" })).toBeNull();
});

test("order book registry bundles its model and shared motion tokens", async () => {
  const item = await buildShadcnItem("charts", "order-book");
  expect(item).not.toBeNull();
  const paths = item?.files?.map((file) => file.path) ?? [];
  expect(paths).toContain("components/charts/order-book.tsx");
  expect(paths).toContain("components/charts/order-book/model.ts");
  expect(paths).toContain("components/charts/order-book/depth-row.tsx");
  expect(paths).toContain("lib/ease.ts");
});


test("quantity updates preserve the mounted cells and price row", () => {
  const { getByRole, rerender } = render(<OrderBook bids={[{ price: 99, size: 10 }]} asks={[]} />);
  const table = getByRole("table", { name: "Bids · buy orders" });
  const cells = within(table).getAllByRole("cell");
  const priceRow = cells[0].parentElement;
  rerender(<OrderBook bids={[{ price: 99, size: 12 }]} asks={[]} />);
  const updated = within(table).getAllByRole("cell");
  expect(updated[0].parentElement).toBe(priceRow);
  expect(updated[1]).toBe(cells[1]);
  expect(updated[1].textContent).toBe("12");
  expect(updated[2].textContent).toBe("12");
});
