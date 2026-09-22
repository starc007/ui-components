import { afterEach, describe, expect, test } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import { useState } from "react";
import {
  AttachmentUpload,
  type AttachmentUploadItem,
} from "@/components/motion/attachment-upload";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { CommandPalette } from "@/components/motion/command-palette";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";
import { MultiChainSwap } from "@/components/motion/swap";

// Every overlay here is opened the way a pointer opens it in WebKit: a click
// and nothing else. WebKit does not focus a clicked button, and neither does
// the test DOM, so `document.activeElement` is <body> at the moment the
// overlay opens — the state that used to survive the close and leave keyboard
// users back at the top of the page. No test focuses a trigger before
// clicking it.
//
// The bottom sheet and the command palette are the exception: their trigger
// belongs to the consumer, so the component never sees it and can only restore
// what held focus on open. Their harness triggers claim focus on click, the
// way the library's own triggers do.

afterEach(cleanup);

// Overlays that take focus on open do it from a requestAnimationFrame
// callback, so let one frame pass before reading document.activeElement.
const nextFrame = () =>
  act(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      }),
  );

const IMAGE: AttachmentUploadItem = {
  id: "shot",
  name: "shot.png",
  kind: "image",
  previewUrl: "blob:shot",
};

function SheetHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setOpen(true);
        }}
      >
        Open sheet
      </button>
      <BottomSheet open={open} onOpenChange={setOpen} title="Quick actions">
        <p>Sheet body</p>
      </BottomSheet>
    </>
  );
}

function PaletteHarness() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setOpen(true);
        }}
      >
        Open palette
      </button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={[{ id: "alpha", label: "alpha", onSelect: () => {} }]}
      />
    </>
  );
}

describe("focus return when an overlay closes", () => {
  test("the bottom sheet returns focus to the trigger", async () => {
    const { getByLabelText, getByRole } = render(<SheetHarness />);
    const trigger = getByRole("button", { name: "Open sheet" });

    fireEvent.click(trigger);
    await nextFrame();
    // The sheet takes focus itself on open, so the hand-back has to move it.
    expect(document.activeElement).toBe(getByRole("dialog"));

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    // Chrome focuses a pressed button, so the backdrop holds focus when its
    // click closes the sheet. It belongs to the overlay; focus still returns.
    fireEvent.click(trigger);
    await nextFrame();
    const backdrop = getByLabelText("Close bottom sheet");
    backdrop.focus();
    fireEvent.click(backdrop);
    expect(document.activeElement).toBe(trigger);
  });

  test("the command palette returns focus to the trigger", async () => {
    const { getByLabelText, getByRole } = render(<PaletteHarness />);
    const trigger = getByRole("button", { name: "Open palette" });

    fireEvent.click(trigger);
    await nextFrame();
    // The palette takes focus into its field on open.
    expect(document.activeElement).toBe(getByRole("combobox"));

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    await nextFrame();
    const backdrop = getByLabelText("Close command palette");
    backdrop.focus();
    fireEvent.click(backdrop);
    expect(document.activeElement).toBe(trigger);
  });

  test("the select returns focus to the trigger", () => {
    const { getByRole } = render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Time" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="09:00">09:00</SelectItem>
          <SelectItem value="17:00">17:00</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = getByRole("button", { name: /Time/ });

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    // Picking an option is the other close path: it unmounts the option the
    // pointer pressed, so nothing inside the panel is left to hold focus.
    fireEvent.click(trigger);
    fireEvent.click(getByRole("option", { name: "09:00" }));
    expect(document.activeElement).toBe(trigger);
  });

  test("the select leaves focus on a field an outside click focused", () => {
    const { getByRole } = render(
      <>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="09:00">09:00</SelectItem>
          </SelectContent>
        </Select>
        <input aria-label="Notes" />
      </>,
    );
    const trigger = getByRole("button", { name: /Time/ });
    const field = getByRole("textbox", { name: "Notes" });

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    // The outside pointerdown closes the panel, and the press focuses the
    // field it landed on. The close must not pull focus back to the trigger.
    act(() => {
      fireEvent.pointerDown(field);
      field.focus();
    });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(field);
  });

  test("the command palette keeps focus where onSelect moved it", async () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button
            type="button"
            onClick={(event) => {
              event.currentTarget.focus({ preventScroll: true });
              setOpen(true);
            }}
          >
            Open palette
          </button>
          <input aria-label="Destination" />
          <CommandPalette
            open={open}
            onOpenChange={setOpen}
            items={[
              {
                id: "go",
                label: "go",
                onSelect: () =>
                  document
                    .querySelector<HTMLInputElement>(
                      'input[aria-label="Destination"]',
                    )
                    ?.focus(),
              },
            ]}
          />
        </>
      );
    }
    const { getByRole } = render(<Harness />);
    const destination = getByRole("textbox", { name: "Destination" });

    fireEvent.click(getByRole("button", { name: "Open palette" }));
    await nextFrame();
    fireEvent.click(getByRole("option", { name: /go/ }));
    expect(document.activeElement).toBe(destination);
  });

  test("the morph select returns focus to the remounted trigger", () => {
    render(
      <MorphSelect>
        <MorphSelectTrigger>
          <MorphSelectValue placeholder="Time" />
        </MorphSelectTrigger>
        <MorphSelectContent>
          <MorphSelectItem value="09:00">09:00</MorphSelectItem>
          <MorphSelectItem value="17:00">17:00</MorphSelectItem>
        </MorphSelectContent>
      </MorphSelect>,
    );
    // The trigger morphs into the panel, so it unmounts while the panel is
    // open and the element that comes back is a new node with the same id.
    const trigger = () =>
      document.querySelector<HTMLButtonElement>('[aria-haspopup="listbox"]');

    const first = trigger();
    expect(first).not.toBeNull();
    fireEvent.click(first as HTMLButtonElement);

    fireEvent.keyDown(window, { key: "Escape" });
    expect(trigger()).not.toBeNull();
    expect(document.activeElement).toBe(trigger());

    // Picking an option is the other close path. The options are queried
    // inside the panel: the trigger keeps a hidden copy of the list mounted so
    // it can read the labels, so every option exists twice.
    fireEvent.click(trigger() as HTMLButtonElement);
    const panel = document.querySelector<HTMLElement>('[role="listbox"]');
    expect(panel).not.toBeNull();
    fireEvent.click(
      within(panel as HTMLElement).getByRole("option", { name: "09:00" }),
    );
    expect(document.activeElement).toBe(trigger());
  });

  test("the attachment preview returns focus to the thumbnail", () => {
    const { getByLabelText } = render(
      <AttachmentUpload defaultValue={[IMAGE]} />,
    );
    const trigger = getByLabelText("Preview shot.png");
    const closeControl = () =>
      document.activeElement instanceof HTMLElement &&
      document.activeElement.getAttribute("aria-label") ===
        "Close image preview"
        ? document.activeElement
        : null;

    fireEvent.click(trigger);
    // The overlay takes focus onto its close control on open.
    expect(closeControl()).not.toBeNull();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    const close = closeControl();
    expect(close).not.toBeNull();
    fireEvent.click(close as HTMLElement);
    expect(document.activeElement).toBe(trigger);
  });

  test("the swap token picker returns focus to the trigger", async () => {
    const { getAllByRole, getByRole } = render(<MultiChainSwap />);
    // The token trigger is the button carrying the selected token's symbol.
    const trigger = getAllByRole("button").find((button) =>
      button.textContent?.includes("ETH"),
    );
    expect(trigger).toBeTruthy();
    if (!trigger) return;

    fireEvent.click(trigger);
    await nextFrame();
    // The picker takes focus into its search field on open.
    expect(document.activeElement).toBe(
      within(getByRole("dialog")).getByPlaceholderText(
        "Search name or paste address",
      ),
    );

    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.activeElement).toBe(trigger);

    fireEvent.click(trigger);
    await nextFrame();
    fireEvent.click(within(getByRole("dialog")).getByLabelText("Close"));
    expect(document.activeElement).toBe(trigger);
  });
});
