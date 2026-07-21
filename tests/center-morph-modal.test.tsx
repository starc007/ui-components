import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";

afterEach(cleanup);

function TestModal() {
  return (
    <CenterMorphModal>
      <CenterMorphModalTrigger>
        <button type="button">Open profile</button>
      </CenterMorphModalTrigger>
      <CenterMorphModalContent ariaLabel="Profile">
        <p>Profile content</p>
      </CenterMorphModalContent>
    </CenterMorphModal>
  );
}

describe("CenterMorphModal", () => {
  test("opens from its trigger and closes from the inset control", () => {
    const { getByRole, queryByRole } = render(<TestModal />);

    expect(queryByRole("dialog")).toBeNull();
    const trigger = getByRole("button", { name: "Open profile" });
    fireEvent.click(trigger);
    expect(getByRole("dialog", { name: "Profile" })).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "Close modal" }));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("closes on Escape", () => {
    const { getByRole } = render(<TestModal />);

    const trigger = getByRole("button", { name: "Open profile" });
    fireEvent.click(trigger);
    fireEvent.keyDown(window, { key: "Escape" });

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("releases pointer events as soon as closing starts", () => {
    const { getByRole } = render(<TestModal />);

    fireEvent.click(getByRole("button", { name: "Open profile" }));
    const dialog = getByRole("dialog", { name: "Profile" });
    const backdrop = getByRole("button", { name: "Dismiss modal" });

    fireEvent.click(getByRole("button", { name: "Close modal" }));

    expect(dialog.style.pointerEvents).toBe("none");
    expect(backdrop.style.pointerEvents).toBe("none");
  });
});
