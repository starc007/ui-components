import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useRowCursor } from "@/lib/hooks/use-row-cursor";

afterEach(cleanup);

const ROWS = ["a", "b", "c"].map((id) => ({ id }));

/**
 * A caller that never clears the cursor itself — the case the hook has to
 * survive, because a query can arrive as a prop and so change without the
 * component's own handler ever running.
 */
function Probe({ query, rows = ROWS }: { query: string; rows?: { id: string }[] }) {
  const { activeId, moveActive, moveTo } = useRowCursor(rows, query);
  return (
    <div>
      <output data-testid="active">{activeId ?? "none"}</output>
      <button type="button" onClick={() => moveActive(1)}>
        down
      </button>
      <button type="button" onClick={() => moveTo(null)}>
        reset
      </button>
    </div>
  );
}

const active = (c: HTMLElement) =>
  c.querySelector("[data-testid='active']")?.textContent;
const click = (c: HTMLElement, name: string) => {
  const button = Array.from(c.querySelectorAll("button")).find(
    (b) => b.textContent === name,
  );
  if (!button) throw new Error(`no ${name} button`);
  fireEvent.click(button);
};

test("drops a cursor placed under an earlier query, with no help from the caller", () => {
  const { container, rerender } = render(<Probe query="" />);
  click(container, "down");
  click(container, "down");
  expect(active(container)).toBe("c");

  rerender(<Probe query="x" />);
  expect(active(container)).toBe("a");
});

test("does not revive that cursor when the query comes back", () => {
  const { container, rerender } = render(<Probe query="" />);
  click(container, "down");
  expect(active(container)).toBe("b");

  rerender(<Probe query="x" />);
  rerender(<Probe query="" />);
  expect(active(container)).toBe("a");
});

test("drops a cursor whose row has left the list", () => {
  const { container, rerender } = render(<Probe query="" />);
  click(container, "down");
  click(container, "down");
  expect(active(container)).toBe("c");

  rerender(<Probe query="" rows={[{ id: "a" }, { id: "b" }]} />);
  expect(active(container)).toBe("a");
});

test("keeps the cursor when the row merely moves", () => {
  const { container, rerender } = render(<Probe query="" />);
  click(container, "down");
  expect(active(container)).toBe("b");

  rerender(<Probe query="" rows={[{ id: "z" }, { id: "a" }, { id: "b" }]} />);
  expect(active(container)).toBe("b");
});

test("moves one row per click when two land in one batch", () => {
  const { container } = render(<Probe query="" />);
  const down = Array.from(container.querySelectorAll("button")).find(
    (b) => b.textContent === "down",
  );
  if (!down) throw new Error("no down button");
  // One synthetic batch: both updates have to count.
  fireEvent.click(down);
  fireEvent.click(down);

  expect(active(container)).toBe("c");
});

test("moveTo(null) resets a cursor the query would have kept", () => {
  const { container } = render(<Probe query="" />);
  click(container, "down");
  expect(active(container)).toBe("b");

  click(container, "reset");
  expect(active(container)).toBe("a");
});
