import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { StrictMode } from "react";
import { MorphPopover, MorphPopoverContent, MorphPopoverTrigger } from "@/components/motion/popover-morph";

afterEach(cleanup);

test("MorphPopover labels its open dialog and restores keyboard focus in StrictMode", async () => {
  const { getByRole } = render(
    <StrictMode>
      <MorphPopover>
        <MorphPopoverTrigger><button type="button">Options</button></MorphPopoverTrigger>
        <MorphPopoverContent><button type="button">Edit</button></MorphPopoverContent>
      </MorphPopover>
    </StrictMode>,
  );
  const trigger = getByRole("button", { name: "Options" });
  fireEvent.click(trigger);
  await waitFor(() => expect(getByRole("dialog", { name: "Options" })).toBeTruthy());
  expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  act(() => getByRole("button", { name: "Edit" }).focus());
  fireEvent.keyDown(document.activeElement ?? window, { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});
