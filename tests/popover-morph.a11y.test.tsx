import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { StrictMode, useRef, useState } from "react";
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

// Enter on a button fires its keydown, then a click whose detail is 0.
function pressEnter(element: HTMLElement) {
  fireEvent.keyDown(element, { key: "Enter" });
  fireEvent.click(element, { detail: 0 });
}

function Switcher() {
  const selected = useRef<HTMLButtonElement>(null);
  return (
    <MorphPopover>
      <MorphPopoverTrigger><button type="button">Project</button></MorphPopoverTrigger>
      <MorphPopoverContent initialFocus={selected}>
        <button type="button">Alpha</button>
        <button ref={selected} type="button" aria-current="true">Beta</button>
      </MorphPopoverContent>
    </MorphPopover>
  );
}

function renderOptions() {
  const view = render(
    <StrictMode>
      <MorphPopover>
        <MorphPopoverTrigger><button type="button">Options</button></MorphPopoverTrigger>
        <MorphPopoverContent><button type="button">Edit</button></MorphPopoverContent>
      </MorphPopover>
    </StrictMode>,
  );
  const trigger = view.getByRole("button", { name: "Options" });
  act(() => trigger.focus());
  return { ...view, trigger };
}

test("MorphPopover moves focus into the panel when opened by keyboard", async () => {
  const { getByRole, trigger } = renderOptions();
  pressEnter(trigger);
  await waitFor(() => expect(document.activeElement).toBe(getByRole("button", { name: "Edit" })));
  fireEvent.keyDown(document.activeElement ?? window, { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
});

test("MorphPopover leaves focus on the trigger when opened by pointer", async () => {
  const { getByRole, trigger } = renderOptions();
  fireEvent.click(trigger, { detail: 1 });
  await waitFor(() => expect(getByRole("dialog", { name: "Options" })).toBeTruthy());
  expect(document.activeElement).toBe(trigger);
});

test("MorphPopover focuses its initialFocus target when opened by keyboard", async () => {
  const { getByRole } = render(<StrictMode><Switcher /></StrictMode>);
  const trigger = getByRole("button", { name: "Project" });
  act(() => trigger.focus());
  pressEnter(trigger);
  await waitFor(() => expect(document.activeElement).toBe(getByRole("button", { name: "Beta" })));
});

test("MorphPopover skips candidates that cannot take focus when opened by keyboard", async () => {
  const { getByRole } = render(
    <StrictMode>
      <MorphPopover>
        <MorphPopoverTrigger><button type="button">Filters</button></MorphPopoverTrigger>
        <MorphPopoverContent>
          <input type="hidden" name="filter" value="all" />
          <button type="button" disabled tabIndex={0}>Reset</button>
          <button type="button">Apply</button>
        </MorphPopoverContent>
      </MorphPopover>
    </StrictMode>,
  );
  const trigger = getByRole("button", { name: "Filters" });
  act(() => trigger.focus());
  pressEnter(trigger);
  await waitFor(() => expect(document.activeElement).toBe(getByRole("button", { name: "Apply" })));
});

test("MorphPopover does not carry a declined keyboard open over to a later open", async () => {
  function Declined() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <MorphPopover open={open}>
          <MorphPopoverTrigger><button type="button">Share</button></MorphPopoverTrigger>
          <MorphPopoverContent><button type="button">Copy link</button></MorphPopoverContent>
        </MorphPopover>
        <button type="button" onClick={() => setOpen(true)}>Open share</button>
      </>
    );
  }
  const { getByRole } = render(<StrictMode><Declined /></StrictMode>);
  const trigger = getByRole("button", { name: "Share" });
  act(() => trigger.focus());
  pressEnter(trigger);
  const opener = getByRole("button", { name: "Open share" });
  act(() => opener.focus());
  // The later open comes from another control, through the keyboard too.
  pressEnter(opener);
  await waitFor(() => expect(getByRole("dialog", { name: "Share" })).toBeTruthy());
  expect(document.activeElement).toBe(opener);
});
