import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { SlideGame } from "@/components/motion/slide-game";

afterEach(cleanup);

async function audit(container: HTMLElement) {
  let results: Awaited<ReturnType<typeof axe>> | undefined;
  await act(async () => {
    results = await axe(container);
  });
  expect(results?.violations).toEqual([]);
}

test("slide game names its controls and announces a settled round", async () => {
  const { container, getByRole, getByLabelText } = render(<SlideGame getResult={() => 3.5} duration={0.05} />);

  expect(getByRole("region", { name: "Slide" })).toBeTruthy();
  expect(getByRole("list", { name: "Recent slides" })).toBeTruthy();
  expect(getByRole("button", { name: "Sound" }).getAttribute("aria-pressed")).toBe("false");
  expect(getByLabelText("Bet amount")).toBeTruthy();
  expect(getByRole("button", { name: "Halve bet" })).toBeTruthy();
  expect(getByRole("button", { name: "Double bet" })).toBeTruthy();
  expect(getByRole("button", { name: /^Target/ })).toBeTruthy();
  await audit(container);

  await act(async () => {
    fireEvent.click(getByRole("button", { name: "Slide" }));
  });
  const live = container.querySelector("[aria-live='polite']");
  await waitFor(() => expect(live?.textContent).toBe("Landed on 3.50×. Win, target 2×."), { timeout: 3000 });
  expect(getByRole("button", { name: "Slide again" })).toBeTruthy();
  await audit(container);
});

test("slide game blocks a round without a bet and marks the field invalid", async () => {
  const { container, getByRole, getByLabelText } = render(<SlideGame getResult={() => 3.5} duration={0.05} />);
  const field = getByLabelText("Bet amount");
  await act(async () => {
    fireEvent.change(field, { target: { value: "" } });
  });
  expect(field.getAttribute("aria-invalid")).toBe("true");
  const main = getByRole("button", { name: "Enter a bet" });
  expect(main.getAttribute("aria-disabled")).toBe("true");
  await act(async () => {
    fireEvent.click(main);
  });
  expect(container.querySelector("[aria-live='polite']")?.textContent).toBe("");
  await audit(container);
});
