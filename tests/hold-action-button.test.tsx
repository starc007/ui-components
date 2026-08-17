import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { HoldActionButton } from "@/components/motion/hold-action-button";

afterEach(cleanup);

const BOUNDS = { left: 100, top: 100, right: 300, bottom: 164 };

function renderHold() {
  const utils = render(
    <HoldActionButton holdingLabel="Keep holding">Confirm</HoldActionButton>,
  );
  const button = utils.getByRole("button", { name: "Confirm" });

  // happy-dom lays nothing out, so the button reports a zero-sized box the
  // bounds check could never read as "inside".
  button.getBoundingClientRect = () =>
    ({
      ...BOUNDS,
      x: BOUNDS.left,
      y: BOUNDS.top,
      width: BOUNDS.right - BOUNDS.left,
      height: BOUNDS.bottom - BOUNDS.top,
      toJSON: () => "",
    }) as DOMRect;

  const holding = () =>
    utils.getByText("Keep holding").getAttribute("aria-hidden") === "false";

  return { button, holding };
}

const inside = { clientX: 200, clientY: 130 };
const outside = { clientX: 200, clientY: 400 };

describe("HoldActionButton", () => {
  test("keeps a touch hold that stays on the button", () => {
    const { button, holding } = renderHold();

    fireEvent.pointerDown(button, { pointerType: "touch", button: 0, ...inside });
    expect(holding()).toBe(true);

    fireEvent.pointerMove(button, { pointerType: "touch", ...inside });
    expect(holding()).toBe(true);
  });

  test("abandons a touch hold that slides off the button", () => {
    const { button, holding } = renderHold();

    fireEvent.pointerDown(button, { pointerType: "touch", button: 0, ...inside });
    fireEvent.pointerMove(button, { pointerType: "touch", ...outside });

    expect(holding()).toBe(false);
  });

  test("abandons a mouse hold dragged off the button", () => {
    // The cursor gets no leave event once the pointer is captured either, so
    // the bounds check is the cancel path for both inputs.
    const { button, holding } = renderHold();

    fireEvent.pointerDown(button, { pointerType: "mouse", button: 0, ...inside });
    fireEvent.pointerMove(button, { pointerType: "mouse", ...outside });

    expect(holding()).toBe(false);
  });

  test("ignores the leave WebKit fires for a resting touch", () => {
    const { button, holding } = renderHold();

    fireEvent.pointerDown(button, { pointerType: "touch", button: 0, ...inside });
    fireEvent.pointerLeave(button, { pointerType: "touch", ...inside });

    expect(holding()).toBe(true);
  });
});
