import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { BeforeAfterSlider } from "@/components/motion/before-after-slider";
import { BeforeAfterSliderPreview } from "@/components/previews/motion/before-after-slider.preview";

afterEach(cleanup);

test("before after slider exposes a named, keyboard-operable slider", async () => {
  const { container, getByRole } = render(
    <BeforeAfterSlider
      before={<img src="/before.jpg" alt="Room before" />}
      after={<img src="/after.jpg" alt="Room after" />}
    />,
  );

  const slider = getByRole("slider", { name: "Before and after comparison" });
  expect(slider.tabIndex).toBe(0);
  expect(slider.getAttribute("aria-valuenow")).toBe("50");
  expect(slider.getAttribute("aria-valuetext")).toBe("50% before");
  expect(getByRole("img", { name: "Room before" })).toBeTruthy();
  expect(getByRole("img", { name: "Room after" })).toBeTruthy();

  act(() => {
    slider.focus();
    fireEvent.keyDown(slider, { key: "End" });
  });
  expect(slider.getAttribute("aria-valuenow")).toBe("100");
  act(() => {
    fireEvent.keyDown(slider, { key: "ArrowLeft", shiftKey: true });
  });
  expect(slider.getAttribute("aria-valuenow")).toBe("90");
  expect((await axe(container)).violations).toEqual([]);
});

test("disabled before after slider leaves the tab order", async () => {
  const { container, getByRole } = render(
    <BeforeAfterSlider
      disabled
      before={<img src="/before.jpg" alt="Room before" />}
      after={<img src="/after.jpg" alt="Room after" />}
    />,
  );

  const slider = getByRole("slider", { name: "Before and after comparison" });
  expect(slider.tabIndex).toBe(-1);
  expect(slider.getAttribute("aria-disabled")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
});

test("before after slider preview passes axe", async () => {
  const { container } = render(<BeforeAfterSliderPreview />);
  expect((await axe(container)).violations).toEqual([]);
});
