import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { useState } from "react";
import {
  MorphingSearch,
  type MorphingSearchItem,
} from "@/components/motion/morphing-search";
import {
  cleanupOutsideAct,
  renderOutsideAct,
} from "@/tests/support/render-outside-act";

afterEach(cleanup);
afterEach(cleanupOutsideAct);

const itemsFor = (...titles: string[]): MorphingSearchItem[] =>
  titles.map((title) => ({ id: title, title }));

const FIVE = itemsFor("alpha", "beta", "gamma", "delta", "epsilon");
const TWO = itemsFor("alpha", "beta");
const OTHER_FIVE = itemsFor("one", "two", "three", "four", "five");

describe("MorphingSearch async results", () => {
  // Results arriving from a search reach the component as a new `items` prop,
  // in a commit of its own. These tests read that commit the way the browser
  // paints it, which is the window a real key press lands in. The dialog is
  // portalled to the body, so it is scoped to the document rather than to the
  // harness's own root. See tests/support/render-outside-act.tsx.
  const dialog = () => within(document.body).getByRole("dialog");
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
        dialog(),
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
      // A real key press gets a render between two keys, and nothing a
      // passive effect scheduled has settled in this window.
      view.flushPendingWork();
    }
  };

  test("keeps what the user types, and filters by it", () => {
    render(<MorphingSearch items={FIVE} defaultOpen />);
    const input = field() as HTMLInputElement;

    fireEvent.change(input, { target: { value: "gam" } });

    expect(input.value).toBe("gam");
    expect(rows().map((row) => row.textContent)).toEqual(["gamma"]);
  });

  test("keeps what the user types when the consumer tracks the query", () => {
    // The common shape: an inline `onQueryChange` that sets parent state. Each
    // keystroke re-renders the parent with a fresh callback, so anything keyed
    // to that callback's identity must not reset the field.
    function Consumer() {
      const [seen, setSeen] = useState("");
      return (
        <div>
          <output data-testid="seen">{seen}</output>
          <MorphingSearch
            items={FIVE}
            defaultOpen
            onQueryChange={(next) => setSeen(next)}
          />
        </div>
      );
    }
    const { container } = render(<Consumer />);
    const input = field() as HTMLInputElement;

    fireEvent.change(input, { target: { value: "gam" } });

    expect(input.value).toBe("gam");
    expect(
      container.querySelector("[data-testid='seen']")?.textContent,
    ).toBe("gam");
  });

  test("never points at a row that the new results no longer have", () => {
    const view = renderOutsideAct(<MorphingSearch items={FIVE} defaultOpen />);
    press(view, "ArrowDown", 3);

    view.commit(<MorphingSearch items={TWO} defaultOpen />);

    expect(rows()).toHaveLength(2);
    expect(activeRow()).not.toBeNull();
  });

  test("selects the first row on a key pressed as the list shrinks", () => {
    const onSelect = mock((_item: MorphingSearchItem) => {});
    const view = renderOutsideAct(
      <MorphingSearch items={FIVE} defaultOpen onSelect={onSelect} />,
    );
    press(view, "ArrowDown", 3);

    view.commit(<MorphingSearch items={TWO} defaultOpen onSelect={onSelect} />);
    press(view, "Enter");

    // The row the user was aiming at is gone. The first row is where a new
    // query already puts the highlight, so Enter commits that rather than
    // nothing at all, and never a row the user never chose.
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: "alpha" });
  });

  test("drops the highlight when the results change without changing length", () => {
    // The case a positional index cannot see. Five rows become five different
    // rows, so nothing overruns, and a highlight kept by position alone would
    // hand Enter to whichever row inherited the slot.
    const onSelect = mock((_item: MorphingSearchItem) => {});
    const view = renderOutsideAct(
      <MorphingSearch items={FIVE} defaultOpen onSelect={onSelect} />,
    );
    press(view, "ArrowDown", 3);
    expect(activeRow()?.textContent).toContain("delta");

    view.commit(
      <MorphingSearch items={OTHER_FIVE} defaultOpen onSelect={onSelect} />,
    );
    press(view, "Enter");

    expect(onSelect.mock.calls[0]?.[0]).toMatchObject({ id: "one" });
  });

  test("does not revive the old row when the results come back", () => {
    const view = renderOutsideAct(<MorphingSearch items={FIVE} defaultOpen />);
    press(view, "ArrowDown", 3);

    // A live search that blanks its rows while fetching and returns the same
    // ones must not glide the highlight back onto a row the user has stopped
    // aiming at.
    view.commit(<MorphingSearch items={TWO} defaultOpen />);
    view.commit(<MorphingSearch items={FIVE} defaultOpen />);

    expect(activeRow()?.textContent).toContain("alpha");
  });

  test("moves one row per key when two keys land in one batch", () => {
    // Programmatic replay — a synthetic key sequence, an e2e driver, an `act`
    // block — can put two keydowns in one batch. Each still has to count.
    const view = renderOutsideAct(<MorphingSearch items={FIVE} defaultOpen />);
    const target = dialog();
    for (let i = 0; i < 3; i += 1) {
      view.dispatch(
        target,
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    }
    view.flushPendingWork();

    expect(activeRow()?.textContent).toContain("delta");
  });
});
