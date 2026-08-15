import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { BottomSheet } from "@/components/motion/bottom-sheet";

afterEach(cleanup);

function TestSheet() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open sheet
      </button>
      <BottomSheet
        open={open}
        onOpenChange={setOpen}
        title="Quick actions"
        description="Drag the handle to dismiss."
      >
        <p>Sheet body</p>
      </BottomSheet>
    </>
  );
}

describe("BottomSheet", () => {
  test("names the dialog from the visible title", () => {
    const { getByRole } = render(<TestSheet />);
    const dialog = getByRole("dialog", { name: "Quick actions" });
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(dialog.getAttribute("aria-label")).toBeNull();
  });

  test("closes on Escape", () => {
    const { getByRole, queryByRole } = render(<TestSheet />);
    expect(getByRole("dialog", { name: "Quick actions" })).toBeTruthy();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(queryByRole("dialog")).toBeNull();
  });

  test("keeps the title outside the drag handle", () => {
    const { getByRole } = render(<TestSheet />);
    const title = getByRole("heading", { name: "Quick actions" });
    expect(title.closest(".touch-none")).toBeNull();
  });
});
