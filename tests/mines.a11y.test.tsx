import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Mines } from "@/components/motion/mines";

afterEach(cleanup);

test("mines board is one tab stop of named tiles and announces each pick", async () => {
  const { container, getByRole, getAllByRole } = render(<Mines />);
  const tiles = () => getAllByRole("button", { name: /^Row \d, column \d,/ });

  expect(getByRole("region", { name: "Mines" })).toBeTruthy();
  expect(getByRole("group", { name: "Tiles" })).toBeTruthy();
  expect(tiles()).toHaveLength(25);
  expect(tiles().filter((tile) => tile.tabIndex === 0)).toHaveLength(1);
  expect(tiles().every((tile) => tile.getAttribute("aria-disabled") === "true")).toBe(true);
  expect((await axe(container)).violations).toEqual([]);

  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Start" }));
  });
  expect(tiles().every((tile) => tile.getAttribute("aria-disabled") === "false")).toBe(true);

  // Arrow keys move the single tab stop.
  await act(async () => {
    tiles()[0].focus();
    fireEvent.keyDown(tiles()[0], { key: "ArrowRight" });
  });
  expect(tiles()[1].tabIndex).toBe(0);

  await act(async () => {
    fireEvent.click(tiles()[1]);
  });
  // The stepper has its own live region; the game's is last.
  const live = [...container.querySelectorAll("[aria-live='polite']")].at(-1);
  expect(live?.textContent).toMatch(/^(Gem\. \d+\.\d{2}×\.|Mine\. The round is over\.)$/);
  expect(tiles()[1].getAttribute("aria-label")).toMatch(/, (gem|mine)$/);
  expect((await axe(container)).violations).toEqual([]);
});
