import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  AdaptiveStepper,
  AdaptiveStepperDecrement,
  AdaptiveStepperIncrement,
  AdaptiveStepperValue,
} from "@/components/motion/adaptive-stepper";

afterEach(cleanup);

function Stepper() {
  return (
    <AdaptiveStepper defaultValue={2} min={0} max={3} aria-label="Guests">
      <AdaptiveStepperDecrement />
      <AdaptiveStepperValue />
      <AdaptiveStepperIncrement />
    </AdaptiveStepper>
  );
}

describe("AdaptiveStepper", () => {
  test("mounts matching interactive and liquid geometry", () => {
    const { container } = render(<Stepper />);
    const wrappers = container.querySelectorAll("fieldset > div > div");
    const shapes = container.querySelectorAll("fieldset svg g rect");

    expect(wrappers).toHaveLength(3);
    expect(shapes).toHaveLength(3);
    expect(wrappers[0]?.getAttribute("style")).toContain("width: 48px");
    expect(wrappers[1]?.getAttribute("style")).toContain("width: 88px");
    expect(wrappers[2]?.getAttribute("style")).toContain(
      "translate(168px, 0px)",
    );
    expect(Array.from(shapes, (shape) => shape.getAttribute("width"))).toEqual([
      "48",
      "88",
      "48",
    ]);
  });

  test("keeps the boundary action mounted but removes it from interaction", () => {
    const { getByRole } = render(<Stepper />);
    const increment = getByRole("button", { name: "Increase value" });

    fireEvent.click(increment);

    expect(getByRole("group").textContent).toContain("Current value: 3");
    expect(increment.getAttribute("aria-hidden")).toBe("true");
    expect((increment as HTMLButtonElement).disabled).toBe(true);
    expect(increment.tabIndex).toBe(-1);
  });
});
