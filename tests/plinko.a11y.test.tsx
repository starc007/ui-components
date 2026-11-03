import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Plinko } from "@/components/motion/plinko";

afterEach(cleanup);

test("plinko board exposes named toggles and announces each landing", async () => {
  const { container, getByRole } = render(<Plinko slots={[10, 1, 10]} />);

  expect(getByRole("region", { name: "Plinko board" })).toBeTruthy();
  const flash = getByRole("button", { name: "Peg flash" });
  const sound = getByRole("button", { name: "Sound" });
  expect(flash.getAttribute("aria-pressed")).toBe("true");
  expect(sound.getAttribute("aria-pressed")).toBe("false");
  expect((await axe(container)).violations).toEqual([]);

  await act(async () => {
    fireEvent.click(flash);
    fireEvent.click(sound);
  });
  expect(flash.getAttribute("aria-pressed")).toBe("false");
  expect(sound.getAttribute("aria-pressed")).toBe("true");

  // A two-row board lands in under a second.
  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Drop ball" }));
    await new Promise((resolve) => setTimeout(resolve, 1200));
  });
  const live = container.querySelector("[aria-live='polite']");
  expect(live?.textContent).toMatch(/^Landed in slot [1-3]: (10|1)$/);
  expect((await axe(container)).violations).toEqual([]);
});

test("plinko drop button stays focusable while the board is full", async () => {
  const { container, getByRole } = render(<Plinko slots={[10, 1, 10]} maxBalls={1} />);
  const drop = getByRole("button", { name: "Drop ball" });
  drop.focus();
  await act(async () => {
    fireEvent.click(drop);
  });
  expect(drop.getAttribute("aria-disabled")).toBe("true");
  expect(document.activeElement).toBe(drop);
  expect((await axe(container)).violations).toEqual([]);
});
