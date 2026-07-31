import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import type { ReactElement } from "react";

import type { SliderOptions } from "@/lib/hooks/use-slider";
import { RangeSlider } from "@/components/motion/range-slider";
import { BubbleSlider } from "@/components/motion/range-slider-bubble";
import { FluidSlider } from "@/components/motion/range-slider-fluid";
import { RulerSlider } from "@/components/motion/range-slider-ruler";
import { WaveSlider } from "@/components/motion/range-slider-wave";

afterEach(cleanup);

/** Track geometry happy-dom does not lay out, so pointer maths has real numbers. */
function stubTrackRect(element: Element, left = 0, width = 200) {
  element.getBoundingClientRect = () =>
    ({ left, width, right: left + width, top: 0, bottom: 40, height: 40, x: left, y: 0 }) as DOMRect;
}

// The four track-style variants share every value path through useSlider, so
// they run the same suite; the ruler drives its scale differently and has its own.
const variants: Array<{ name: string; render: (props?: SliderOptions) => ReactElement }> = [
  { name: "RangeSlider", render: (props) => <RangeSlider aria-label="Level" {...props} /> },
  { name: "FluidSlider", render: (props) => <FluidSlider aria-label="Level" {...props} /> },
  { name: "WaveSlider", render: (props) => <WaveSlider aria-label="Level" {...props} /> },
  { name: "BubbleSlider", render: (props) => <BubbleSlider aria-label="Level" {...props} /> },
];

for (const { name, render: renderVariant } of variants) {
  describe(`${name} value plumbing`, () => {
  test("steps, clamps and reports through the keyboard", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(renderVariant({ defaultValue: 50, step: 5, onValueChange }));
    const slider = getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("55");

    fireEvent.keyDown(slider, { key: "PageDown" });
    expect(slider.getAttribute("aria-valuenow")).toBe("5");

    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.getAttribute("aria-valuenow")).toBe("0");

    // already at the floor — stays there instead of going negative
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider.getAttribute("aria-valuenow")).toBe("0");

    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("100");

    expect(onValueChange).toHaveBeenLastCalledWith(100);
  });

  test("stays put when controlled, and still reports the requested value", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(renderVariant({ value: 30, onValueChange }));
    const slider = getByRole("slider");

    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(slider.getAttribute("aria-valuenow")).toBe("30");
    expect(onValueChange).toHaveBeenCalledWith(31);
  });

  test("ignores input and leaves the tab order when disabled", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(renderVariant({ defaultValue: 20, disabled: true, onValueChange }));
    const slider = getByRole("slider");

    expect(slider.getAttribute("tabindex")).toBe("-1");
    expect(slider.getAttribute("aria-disabled")).toBe("true");

    fireEvent.keyDown(slider, { key: "ArrowRight" });

    expect(slider.getAttribute("aria-valuenow")).toBe("20");
    expect(onValueChange).not.toHaveBeenCalled();
  });

  test("commits the value the pointer lands on, clamped to the track", () => {
    const onValueChange = mock(() => {});
    const { getByRole, container } = render(
      renderVariant({ defaultValue: 0, min: 0, max: 100, onValueChange }),
    );
    const slider = getByRole("slider");
    // the track owns the pointer handlers; it is the element holding the ref
    const track = slider.parentElement as HTMLElement;
    stubTrackRect(track);

    fireEvent.pointerDown(track, { clientX: 150, pointerId: 1 });
    expect(slider.getAttribute("aria-valuenow")).toBe("75");

    fireEvent.pointerMove(track, { clientX: 40, pointerId: 1 });
    expect(slider.getAttribute("aria-valuenow")).toBe("20");

    // past either edge resolves to the edge, never beyond it
    fireEvent.pointerMove(track, { clientX: 900, pointerId: 1 });
    expect(slider.getAttribute("aria-valuenow")).toBe("100");
    fireEvent.pointerMove(track, { clientX: -900, pointerId: 1 });
    expect(slider.getAttribute("aria-valuenow")).toBe("0");

      fireEvent.pointerUp(track, { pointerId: 1 });
      // pointer released: further movement must not drag the value along
      fireEvent.pointerMove(track, { clientX: 150, pointerId: 1 });
      expect(slider.getAttribute("aria-valuenow")).toBe("0");

      expect(container).toBeTruthy();
    });

    test("never reports past max when the step does not divide the range", () => {
      const onValueChange = mock(() => {});
      const { getByRole } = render(
        renderVariant({ defaultValue: 0, min: 0, max: 10, step: 4, onValueChange }),
      );
      const slider = getByRole("slider");

      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.getAttribute("aria-valuenow")).toBe("4");
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.getAttribute("aria-valuenow")).toBe("8");

      // the next step lands on 12 — max, not the step beyond it
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.getAttribute("aria-valuenow")).toBe("10");
      expect(onValueChange).toHaveBeenLastCalledWith(10);
    });
  });
}

describe("FluidSlider", () => {
  test("announces the formatted value, not the bare number", () => {
    const { getByRole } = render(<FluidSlider defaultValue={35} aria-label="Brightness" />);
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("35%");
  });

  test("uses a custom format for both the label and the announcement", () => {
    const { getByRole, getAllByText } = render(
      <FluidSlider defaultValue={2} max={10} format={(v) => `${v} of 10`} aria-label="Seats" />,
    );
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("2 of 10");
    // rendered twice: once on the track, once inverted inside the fill
    expect(getAllByText("2 of 10")).toHaveLength(2);
  });
});

describe("BubbleSlider", () => {
  test("adds no valueText for a bare number", () => {
    const { getByRole } = render(<BubbleSlider defaultValue={28} aria-label="Level" />);
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBeNull();
  });

  test("announces a formatted value when one is supplied", () => {
    const { getByRole } = render(
      <BubbleSlider defaultValue={28} format={(v) => `$${v}`} aria-label="Budget" />,
    );
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("$28");
  });

  test("shows a fractional value in the bubble instead of rounding it", () => {
    const { getByRole, getByText } = render(
      <BubbleSlider defaultValue={0} step={0.5} aria-label="Weight" />,
    );
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    stubTrackRect(track);

    // the bubble only mounts while dragging — 145/200 of 0–100 is 72.5
    fireEvent.pointerDown(track, { clientX: 145, pointerId: 1 });

    expect(slider.getAttribute("aria-valuenow")).toBe("72.5");
    expect(getByText("72.5")).toBeTruthy();
  });
});

describe("WaveSlider", () => {
  test("draws the requested number of bars", () => {
    const { getByRole } = render(<WaveSlider defaultValue={50} bars={12} aria-label="Gain" />);
    const bars = getByRole("slider").parentElement?.querySelectorAll("span") ?? [];
    expect(bars).toHaveLength(12);
  });
});

describe("RulerSlider", () => {
  test("snaps fractional steps without float dust", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <RulerSlider defaultValue={72.5} min={40} max={120} step={0.1} onValueChange={onValueChange} aria-label="Weight" />,
    );
    const slider = getByRole("slider");

    // 0.1 + 0.2 arithmetic would leave 72.60000000000001 without the trim
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("72.6");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("72.7");
    expect(onValueChange).toHaveBeenLastCalledWith(72.7);
  });

  test("reads the value at the step's precision, with its unit", () => {
    // majorEvery 10 puts tick labels on whole numbers, so "72.5" can only be
    // the readout — a half-step scale would label 72.5 as a tick too
    const { getByRole, getByText } = render(
      <RulerSlider
        defaultValue={72.5}
        min={40}
        max={120}
        step={0.5}
        majorEvery={10}
        unit="kg"
        aria-label="Weight"
      />,
    );
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("72.5 kg");
    expect(getByText("72.5")).toBeTruthy();
  });

  test("keeps whole-number scales free of trailing zeroes", () => {
    const { getByRole, getByText } = render(
      <RulerSlider defaultValue={70} min={40} max={120} unit="kg" aria-label="Weight" />,
    );
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("70 kg");
    // major tick labels stay trimmed: "40", never "40.0"
    expect(getByText("40")).toBeTruthy();
  });

  test("keeps a caller's formatValueText when no unit is given", () => {
    const { getByRole } = render(
      <RulerSlider
        defaultValue={70}
        min={40}
        max={120}
        formatValueText={(v) => `${v} kilos`}
        aria-label="Weight"
      />,
    );
    expect(getByRole("slider").getAttribute("aria-valuetext")).toBe("70 kilos");
  });

  test("ends the scale at max when the step does not divide the range", () => {
    const { getByRole, getByText, queryByText } = render(
      <RulerSlider defaultValue={0} min={0} max={10} step={4} majorEvery={1} aria-label="Level" />,
    );
    const slider = getByRole("slider");

    // ticks run 0, 4, 8, then max itself — never the 12 a whole step would give
    expect(getByText("10")).toBeTruthy();
    expect(queryByText("12")).toBeNull();

    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.getAttribute("aria-valuenow")).toBe("10");
  });

  test("clamps to the ends and honours PageUp/PageDown", () => {
    const { getByRole } = render(
      <RulerSlider defaultValue={100} min={40} max={120} step={0.5} aria-label="Weight" />,
    );
    const slider = getByRole("slider");

    fireEvent.keyDown(slider, { key: "PageUp" });
    expect(slider.getAttribute("aria-valuenow")).toBe("105");

    fireEvent.keyDown(slider, { key: "End" });
    expect(slider.getAttribute("aria-valuenow")).toBe("120");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.getAttribute("aria-valuenow")).toBe("120");

    fireEvent.keyDown(slider, { key: "Home" });
    expect(slider.getAttribute("aria-valuenow")).toBe("40");
    fireEvent.keyDown(slider, { key: "ArrowLeft" });
    expect(slider.getAttribute("aria-valuenow")).toBe("40");
  });
});
