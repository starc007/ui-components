import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, within } from "@testing-library/react";
import {
  type CommandItem,
  CommandPalette,
} from "@/components/motion/command-palette";
import {
  cleanupOutsideAct,
  renderOutsideAct,
} from "@/tests/support/render-outside-act";

afterEach(cleanup);
afterEach(cleanupOutsideAct);

const noop = () => {};

const itemsFor = (...labels: string[]): CommandItem[] =>
  labels.map((label) => ({ id: label, label, onSelect: noop }));

const FOUR = itemsFor("alpha", "beta", "gamma", "delta");
const TWO = itemsFor("alpha", "beta");
const OTHER_FOUR = itemsFor("one", "two", "three", "four");

describe("CommandPalette async results", () => {
  // The palette is portalled to the body, and `items` can change underneath an
  // open list — a command source that loads, or a parent that refilters. These
  // tests read the commit that lands them the way the browser paints it, which
  // is the window a real key press falls in.
  const field = () => within(document.body).getByRole("combobox");
  const rows = () => within(document.body).getAllByRole("option");
  const activeRow = () => {
    const id = field().getAttribute("aria-activedescendant");
    return rows().find((row) => row.id === id) ?? null;
  };

  const press = (
    view: ReturnType<typeof renderOutsideAct>,
    key: string,
    times = 1,
  ) => {
    for (let i = 0; i < times; i += 1) {
      view.dispatch(
        field(),
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
      view.flushPendingWork();
    }
  };

  test("never points at a row the new results no longer have", () => {
    const view = renderOutsideAct(<CommandPalette items={FOUR} open />);
    press(view, "ArrowDown", 3);

    view.commit(<CommandPalette items={TWO} open />);

    expect(rows()).toHaveLength(2);
    expect(activeRow()).not.toBeNull();
  });

  test("drops the highlight when the results change without changing length", () => {
    const onSelect = mock(() => {});
    const swapped = OTHER_FOUR.map((item) => ({ ...item, onSelect }));
    const view = renderOutsideAct(<CommandPalette items={FOUR} open />);
    press(view, "ArrowDown", 3);
    expect(activeRow()?.textContent).toContain("delta");

    view.commit(<CommandPalette items={swapped} open />);
    press(view, "Enter");

    // Whatever inherited the slot must not be committed in place of the row
    // the user was aiming at.
    expect(activeRow()?.textContent).toContain("one");
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  test("commits the row it highlights when groups reorder the list", () => {
    // `grouped` collects items by group, so the rendered order is not the
    // filtered order when groups interleave. The highlight and Enter have to
    // resolve to the same row regardless.
    const picked: string[] = [];
    const interleaved: CommandItem[] = [
      { id: "a", label: "a", group: "One", onSelect: () => picked.push("a") },
      { id: "b", label: "b", group: "Two", onSelect: () => picked.push("b") },
      { id: "c", label: "c", group: "One", onSelect: () => picked.push("c") },
    ];

    const view = renderOutsideAct(
      <CommandPalette items={interleaved} open />,
    );
    press(view, "ArrowDown");
    const highlighted = activeRow()?.textContent ?? "";
    press(view, "Enter");

    expect(picked).toEqual([highlighted.trim()]);
  });

  test("moves one row per key when two keys land in one batch", () => {
    const view = renderOutsideAct(<CommandPalette items={FOUR} open />);
    const input = field();
    for (let i = 0; i < 3; i += 1) {
      view.dispatch(
        input,
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    }
    view.flushPendingWork();

    expect(activeRow()?.textContent).toContain("delta");
  });
});
