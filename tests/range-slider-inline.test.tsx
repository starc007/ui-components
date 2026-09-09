import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";

import { InlineSlider } from "@/components/motion/range-slider-inline";

afterEach(cleanup);

describe("InlineSlider snap stops", () => {
  test("tracks single-pixel moves independently of the readout and snaps from the release position", async () => {
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} />);
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
    const thumb = track.querySelector<HTMLElement>(".h-6") as HTMLElement;
    const readX = () => Number.parseFloat(thumb.style.transform.match(/translateX\(([^p]+)px\)/)?.[1] ?? "NaN");
    const startX = readX();
    // Grabbing three pixels into the thumb must preserve that grab point.
    fireEvent.pointerDown(track, { clientX: startX + 3, pointerId: 1, button: 0 });
    expect(readX()).toBe(startX);
    fireEvent.pointerMove(track, { clientX: startX + 8, pointerId: 1 });
    await waitFor(() => expect(readX()).toBeCloseTo(startX + 5, 2));
    expect(slider.getAttribute("aria-valuenow")).toBe("51");
    fireEvent.pointerMove(track, { clientX: startX + 9, pointerId: 1 });
    await waitFor(() => expect(readX()).toBeCloseTo(startX + 6, 2));
    // The thumb still responds to a single-pixel move when the rounded
    // readout happens to remain on the same integer.
    expect(slider.getAttribute("aria-valuenow")).toBe("51");
    const releaseX = readX();
    fireEvent.pointerUp(track, { clientX: startX + 9, pointerId: 1 });
    expect(readX()).toBeCloseTo(releaseX, 2);
    expect(slider.getAttribute("aria-valuenow")).toBe("48");
    await waitFor(() => expect(readX()).toBeCloseTo(startX, 1), {
      interval: 30, mutationObserverOptions: { childList: true },
    });
  });

  test("follows one-pixel direction changes without a startup dead zone", async () => {
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} />);
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
    const thumb = track.querySelector<HTMLElement>(".h-6") as HTMLElement;
    const readX = () => Number.parseFloat(thumb.style.transform.match(/translateX\(([^p]+)px\)/)?.[1] ?? "NaN");
    const startX = readX();

    fireEvent.pointerDown(track, { clientX: startX + 3, pointerId: 1, button: 0 });
    fireEvent.pointerMove(track, { clientX: startX + 4, pointerId: 1 });
    await waitFor(() => expect(readX()).toBeCloseTo(startX + 1, 2));
    fireEvent.pointerMove(track, { clientX: startX + 2, pointerId: 1 });
    await waitFor(() => expect(readX()).toBeCloseTo(startX - 1, 2));
    fireEvent.pointerUp(track, { clientX: startX + 2, pointerId: 1 });
  });

  test("a track click glides directly to its dot without an intermediate value", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} onValueChange={onValueChange} />);
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
    const thumb = track.querySelector<HTMLElement>(".h-6") as HTMLElement;
    const startTransform = thumb.style.transform;
    fireEvent.pointerDown(track, { clientX: 190, pointerId: 1, button: 0 });
    expect(document.activeElement).toBe(slider);
    expect(thumb.style.transform).toBe(startTransform);
    expect(onValueChange).not.toHaveBeenCalled();
    fireEvent.pointerUp(track, { clientX: 190, pointerId: 1 });
    expect(onValueChange).toHaveBeenCalledTimes(1);
    expect(onValueChange).toHaveBeenLastCalledWith(88);
  });

  test("parts the thumb into two dots across both inline labels", async () => {
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} />);
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
    const stem = track.querySelector<HTMLElement>(".inset-y-0.w-1") as HTMLElement;

    fireEvent.pointerDown(track, { clientX: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(track, { clientX: 36, pointerId: 1 });
    await waitFor(() => expect(stem.style.opacity).toBe("0"));

    fireEvent.pointerMove(track, { clientX: 150, pointerId: 1 });
    await waitFor(() => expect(stem.style.opacity).toBe("1"));

    fireEvent.pointerMove(track, { clientX: 260, pointerId: 1 });
    await waitFor(() => expect(stem.style.opacity).toBe("0"));
  });

  for (const width of [292, 384]) {
    test(`lands on every evenly spaced stop at ${width}px, including hidden markers`, async () => {
      const rect = spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
        const measuredWidth = this.classList.contains("h-10") ? width : 24;
        return { left: 100, width: measuredWidth, right: 100 + measuredWidth,
          top: 0, bottom: 40, height: 40, x: 100, y: 0, toJSON() {} } as DOMRect;
      });
      try {
        const onValueChange = mock(() => {});
        const { getByRole } = render(
          <InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} onValueChange={onValueChange} />,
        );
        const slider = getByRole("slider");
        const track = slider.parentElement as HTMLElement;
        const dots = [...track.querySelectorAll<HTMLElement>("span[style*='left']")];
        const endX = width - 12;
        const stopXs = Array.from({ length: 10 }, (_, index) =>
          8 + (index / 9) * (endX - 8),
        );
        const visibleIndexes = width === 292 ? [0, 2, 3, 4, 5, 6, 7, 9] :
          Array.from({ length: 10 }, (_, index) => index);
        for (const [dotIndex, stopIndex] of visibleIndexes.entries()) {
          expect(Number.parseFloat(dots[dotIndex].style.left)).toBeCloseTo(stopXs[stopIndex], 5);
        }
        const thumb = track.querySelector<HTMLElement>(".h-6") as HTMLElement;
        for (const [index, value] of [8, 24, 32, 48, 64, 72, 88, 104, 112, 128].entries()) {
          const stopX = stopXs[index];
          fireEvent.pointerDown(track, { clientX: 100 + stopX + 2, pointerId: 1, button: 0 });
          fireEvent.pointerUp(track, { clientX: 100 + stopX + 2, pointerId: 1 });
          expect(slider.getAttribute("aria-valuenow")).toBe(String(value));
          expect(onValueChange).toHaveBeenLastCalledWith(value);
          await waitFor(() => {
            const x = Number.parseFloat(thumb.style.transform.match(/translateX\(([^p]+)px\)/)?.[1] ?? "NaN");
            expect(x).toBeCloseTo(stopX, 1);
          }, { interval: 30, mutationObserverOptions: { childList: true } });
        }
      } finally {
        cleanup();
        rect.mockRestore();
      }
    });
  }

  test("keyboard advances between dots and reaches both edges", () => {
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={8} />);
    const slider = getByRole("slider");
    for (const value of [24, 32, 48, 64, 72, 88, 104, 112, 128, 128]) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.getAttribute("aria-valuenow")).toBe(String(value));
    }
    for (const value of [112, 104, 88, 72, 64, 48, 32, 24, 8, 8]) {
      fireEvent.keyDown(slider, { key: "ArrowLeft" });
      expect(slider.getAttribute("aria-valuenow")).toBe(String(value));
    }
    for (const [key, value] of [["End", 128], ["Home", 8], ["PageUp", 128], ["PageDown", 8]] as const) {
      fireEvent.keyDown(slider, { key });
      expect(slider.getAttribute("aria-valuenow")).toBe(String(value));
    }
  });

  test("reports the nearest stop without changing a controlled value", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} value={48} onValueChange={onValueChange} />);
    const slider = getByRole("slider");
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(64);
    expect(slider.getAttribute("aria-valuenow")).toBe("48");
  });

  test("handles coarse steps, fractional stops, and an empty range", () => {
    const { getByRole, rerender } = render(<InlineSlider label="Size" min={0} max={10} step={4} defaultValue={0} />);
    const slider = getByRole("slider");
    for (const value of [4, 8, 10]) {
      fireEvent.keyDown(slider, { key: "ArrowRight" });
      expect(slider.getAttribute("aria-valuenow")).toBe(String(value));
    }
    rerender(<InlineSlider label="Size" min={0} max={3} step={0.5} value={1} />);
    const onValueChange = mock(() => {});
    rerender(<InlineSlider label="Size" min={0} max={3} step={0.5} value={1} onValueChange={onValueChange} />);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(1.5);
    rerender(<InlineSlider label="Size" min={5} max={5} value={5} onValueChange={onValueChange} />);
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith(5);
    expect(slider.getAttribute("aria-valuenow")).toBe("5");
  });

  for (const ending of ["pointerUp", "pointerCancel", "lostPointerCapture"] as const) {
    test(`${ending} snaps once and ends the drag`, () => {
      const onValueChange = mock(() => {});
      const { getByRole } = render(<InlineSlider label="Size" min={8} max={128} step={8} defaultValue={48} onValueChange={onValueChange} />);
      const slider = getByRole("slider");
      const track = slider.parentElement as HTMLElement;
      track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
      fireEvent.pointerDown(track, { clientX: 100, pointerId: 1, button: 0 });
      fireEvent.pointerMove(track, { clientX: 190, pointerId: 1 });
      onValueChange.mockClear();
      fireEvent[ending](track, { clientX: ending === "pointerUp" ? 190 : 0, pointerId: 1 });
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(onValueChange).toHaveBeenLastCalledWith(88);
      fireEvent.lostPointerCapture(track, { pointerId: 1 });
      fireEvent.pointerMove(track, { clientX: 0, pointerId: 1 });
      expect(onValueChange).toHaveBeenCalledTimes(1);
      expect(slider.getAttribute("aria-valuenow")).toBe("88");
    });
  }

  test("ignores disabled and secondary-button gestures", () => {
    const onValueChange = mock(() => {});
    const { getByRole, rerender } = render(<InlineSlider label="Size" defaultValue={48} disabled onValueChange={onValueChange} />);
    const slider = getByRole("slider");
    const track = slider.parentElement as HTMLElement;
    track.getBoundingClientRect = () => ({ left: 0, width: 292 }) as DOMRect;
    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1, button: 0 });
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1 });
    fireEvent.keyDown(slider, { key: "ArrowRight" });
    expect(slider.tabIndex).toBe(-1);
    expect(onValueChange).not.toHaveBeenCalled();
    rerender(<InlineSlider label="Size" defaultValue={48} onValueChange={onValueChange} />);
    fireEvent.pointerDown(track, { clientX: 200, pointerId: 1, button: 2 });
    fireEvent.pointerUp(track, { clientX: 200, pointerId: 1, button: 2 });
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
