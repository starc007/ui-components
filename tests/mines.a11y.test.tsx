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

test("cashing out shows a labelled result, sends focus to Play again and hides on Escape", async () => {
  // Never swap during the shuffle, so the mines are tiles 0 to 2.
  const random = Math.random;
  Math.random = () => 0.999;
  try {
    const { container, getByRole, getAllByRole } = render(<Mines />);
    const tiles = () => getAllByRole("button", { name: /^Row \d, column \d,/ });
    await act(async () => {
      fireEvent.click(getByRole("button", { name: "Start" }));
    });
    await act(async () => {
      fireEvent.click(tiles()[24]);
    });
    await act(async () => {
      fireEvent.click(getByRole("button", { name: /^Cash out/ }));
      // The result waits for the cash-out pulse to finish.
      await new Promise((resolve) => setTimeout(resolve, 900));
    });
    const result = getByRole("group", { name: "Round result" });
    expect(result.textContent).toContain("Cashed out");
    expect(getByRole("button", { name: "Hide result and show the board" })).toBeTruthy();
    // The card has no buttons of its own: focus goes to the main action.
    expect(document.activeElement?.textContent).toBe("Play again");
    expect((await axe(container)).violations).toEqual([]);

    await act(async () => {
      fireEvent.keyDown(document.activeElement as Element, { key: "Escape" });
      await new Promise((resolve) => setTimeout(resolve, 300));
    });
    expect(container.querySelector("[aria-label='Round result']")).toBeNull();
  } finally {
    Math.random = random;
  }
});
