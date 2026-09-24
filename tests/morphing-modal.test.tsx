import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { type ReactNode, useState } from "react";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/motion/combobox";
import { MorphingModal } from "@/components/motion/morphing-modal";

afterEach(cleanup);

function TestModal({
  onClose,
  children = <p>Wallet options</p>,
}: {
  onClose?: () => void;
  children?: ReactNode;
}) {
  const [view, setView] = useState<string | null>(null);

  return (
    <>
      {/* The modal owns no trigger. WebKit never focuses a clicked button,
          so a trigger that wants focus back claims it on click. */}
      <button
        type="button"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setView("options");
        }}
      >
        Open wallet options
      </button>
      <MorphingModal
        viewId={view}
        onClose={() => {
          setView(null);
          onClose?.();
        }}
        ariaLabel="Wallet options"
      >
        {children}
      </MorphingModal>
    </>
  );
}

// The panel takes focus from a rAF callback, so let one frame run.
async function frame() {
  await act(async () => {
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  });
}

describe("MorphingModal dialog semantics", () => {
  test("names the open panel as a modal dialog", async () => {
    const { getByRole, queryByRole } = render(<TestModal />);

    expect(queryByRole("dialog")).toBeNull();

    fireEvent.click(getByRole("button", { name: "Open wallet options" }));
    await frame();

    const dialog = getByRole("dialog", { name: "Wallet options" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
  });

  test("renders into body, outside a transformed ancestor", async () => {
    const { container, getByRole } = render(
      <div style={{ transform: "translateZ(0)" }}>
        <TestModal />
      </div>,
    );

    fireEvent.click(getByRole("button", { name: "Open wallet options" }));
    await frame();

    // A transformed ancestor would become the containing block of the fixed
    // layers and clip them to itself.
    expect(container.contains(getByRole("dialog"))).toBe(false);
  });

  test("closes on Escape", async () => {
    const onClose = mock(() => {});
    const { getByRole, queryByRole } = render(<TestModal onClose={onClose} />);

    fireEvent.click(getByRole("button", { name: "Open wallet options" }));
    await frame();
    const dialog = getByRole("dialog");

    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(onClose).toHaveBeenCalledTimes(1);
    // The panel outlives the close by its exit animation, so it is the release
    // of the overlay — not its removal — that says the modal has closed.
    expect(dialog.style.pointerEvents).toBe("none");
    expect(queryByRole("button", { name: "Close modal" })?.style.pointerEvents)
      .toBe("none");
  });

  test("leaves the modal open when a nested combobox handles Escape", async () => {
    const onClose = mock(() => {});
    const { getByRole } = render(
      <TestModal onClose={onClose}>
        <Combobox>
          <ComboboxTrigger>
            <ComboboxInput aria-label="Network" />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxList ariaLabel="Networks">
              <ComboboxItem value="base">Base</ComboboxItem>
              <ComboboxItem value="optimism">Optimism</ComboboxItem>
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </TestModal>,
    );

    fireEvent.click(getByRole("button", { name: "Open wallet options" }));
    await frame();
    const input = getByRole("combobox", { name: "Network" });
    input.focus();
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(input.getAttribute("aria-expanded")).toBe("true");

    await act(async () => {
      fireEvent.keyDown(input, { key: "Escape" });
    });

    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(onClose).not.toHaveBeenCalled();

    // With the list closed, the next Escape is the modal's.
    await act(async () => {
      fireEvent.keyDown(input, { key: "Escape" });
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("keeps Tab inside the panel", async () => {
    const { getByRole } = render(
      <TestModal>
        <button type="button">First</button>
        <button type="button">Middle</button>
        <button type="button">Last</button>
      </TestModal>,
    );

    fireEvent.click(getByRole("button", { name: "Open wallet options" }));
    await frame();
    const first = getByRole("button", { name: "First" });
    const last = getByRole("button", { name: "Last" });

    // The panel itself holds focus on open; Shift+Tab wraps to the end.
    expect(document.activeElement).toBe(getByRole("dialog"));
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(window, { key: "Tab" });
    expect(document.activeElement).toBe(first);

    // Every step moves by hand, not only the wrap: Safari's default Tab
    // skips buttons, so a native step would leave the panel.
    const middleStep = fireEvent.keyDown(window, { key: "Tab" });
    expect(middleStep).toBe(false);
    expect(document.activeElement).toBe(getByRole("button", { name: "Middle" }));

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  test("hands focus back to the trigger after close", async () => {
    const { getByRole } = render(<TestModal />);

    const trigger = getByRole("button", { name: "Open wallet options" });
    fireEvent.click(trigger);
    await frame();

    expect(document.activeElement).toBe(getByRole("dialog"));

    await act(async () => {
      fireEvent.keyDown(window, { key: "Escape" });
    });

    expect(document.activeElement).toBe(trigger);
  });
});
