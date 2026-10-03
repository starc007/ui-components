import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { VoiceOrb } from "@/components/agents/voice-orb";
import { ArcPicker } from "@/components/motion/arc-picker";

afterEach(cleanup);

const OPTIONS = [
  { value: "quiet", label: "Quiet" },
  { value: "warm", label: "Warm", disabled: true },
  { value: "bright", label: "Bright" },
];

test("arc picker names its choices and exposes one selected tab stop immediately", async () => {
  const { container, getByRole } = render(
    <ArcPicker
      options={OPTIONS}
      defaultValue="bright"
      aria-label="Voice tone"
      side="left"
    />,
  );
  const selected = getByRole("radio", { name: "Bright" });
  expect(
    selected.querySelectorAll(
      '[data-slot="arc-picker-bracket"][aria-hidden="true"]',
    ).length,
  ).toBe(2);
  expect(selected.getAttribute("aria-checked")).toBe("true");
  expect(selected.tabIndex).toBe(0);
  expect(getByRole("radio", { name: "Quiet" }).tabIndex).toBe(-1);
  expect(
    (getByRole("radio", { name: "Warm" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
  selected.focus();
  fireEvent.keyDown(selected, { key: "ArrowUp" });
  const quiet = getByRole("radio", { name: "Quiet" });
  expect(document.activeElement).toBe(quiet);
  expect(quiet.getAttribute("aria-checked")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
});

test("horizontal sides expose their axis and keep the selected radio focused when the side changes", async () => {
  const { container, getByRole, rerender } = render(
    <ArcPicker
      options={OPTIONS}
      defaultValue="bright"
      side="top"
      aria-label="Voice tone"
    />,
  );
  expect(getByRole("radiogroup").getAttribute("aria-orientation")).toBe(
    "horizontal",
  );
  expect(container.textContent).toContain("Drag horizontally");
  getByRole("radio", { name: "Bright" }).focus();
  fireEvent.keyDown(document.activeElement as HTMLElement, {
    key: "ArrowLeft",
  });
  const selected = getByRole("radio", { name: "Quiet" });
  expect(document.activeElement).toBe(selected);
  expect(selected.getAttribute("aria-checked")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
  rerender(
    <ArcPicker options={OPTIONS} side="bottom" aria-label="Voice tone" />,
  );
  expect(document.activeElement).toBe(selected);
  expect(selected.tabIndex).toBe(0);
  expect((await axe(container)).violations).toEqual([]);
});

test("removed selections have a valid accessible replacement in the same commit", async () => {
  const { container, getByRole, rerender } = render(
    <ArcPicker
      options={OPTIONS}
      defaultValue="bright"
      aria-label="Voice tone"
    />,
  );
  getByRole("radio", { name: "Bright" }).focus();
  rerender(<ArcPicker options={OPTIONS.slice(0, 2)} aria-label="Voice tone" />);
  const selected = getByRole("radio", { name: "Quiet" });
  expect(selected.tabIndex).toBe(0);
  expect(selected.getAttribute("aria-checked")).toBe("true");
  expect(document.activeElement).toBe(selected);
  expect((await axe(container)).violations).toEqual([]);
});

test("disabled arc choices cannot take focus and the orb has an optional stable accessible name", async () => {
  const { container, getByRole } = render(
    <div>
      <ArcPicker options={OPTIONS} disabled aria-label="Voice tone" />
      <VoiceOrb aria-label="Warm voice visualization" active={false} />
      <VoiceOrb active={false} />
    </div>,
  );
  expect(getByRole("radiogroup").getAttribute("aria-disabled")).toBe("true");
  expect(
    container.querySelectorAll('[role="radio"][tabindex="0"]').length,
  ).toBe(0);
  expect(getByRole("img", { name: "Warm voice visualization" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
