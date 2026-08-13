import { afterEach, describe, expect, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";

afterEach(cleanup);

function setTriggerRect(element: Element) {
  Object.defineProperty(element, "getBoundingClientRect", {
    configurable: true,
    value: () => ({
      bottom: 108,
      height: 40,
      left: 48,
      right: 168,
      top: 68,
      width: 120,
      x: 48,
      y: 68,
      toJSON: () => ({}),
    }),
  });
}

describe("portalled popovers", () => {
  test("Gooey escapes clipping and keeps inside interactions open", async () => {
    const { getByRole, getByText } = render(
      <div data-testid="clipping-parent" style={{ overflow: "hidden" }}>
        <Popover>
          <PopoverTrigger>
            <button type="button">Open Gooey</button>
          </PopoverTrigger>
          <PopoverContent>Gooey actions</PopoverContent>
        </Popover>
      </div>,
    );
    const trigger = getByRole("button", { name: "Open Gooey" });
    setTriggerRect(trigger);
    fireEvent(window, new Event("resize"));

    const portal = document.querySelector<HTMLElement>("[data-popover-portal]");
    expect(portal).toBeTruthy();
    expect(portal?.parentElement).toBe(document.body);

    fireEvent.click(trigger);
    fireEvent.pointerDown(getByText("Gooey actions"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    await waitFor(() => {
      expect(portal?.style.transform).toContain("48px, 68px");
    });
  });

  // The goo layer paints above the page, so the trigger has to be cut back out
  // of it. WebKit ignores `mask: url(#id)` that points at an SVG <mask>
  // element, which hid the trigger's label behind the goo in Safari. Keep the
  // cutout a clip path.
  test("Gooey cuts the trigger out with a clip path, not an SVG mask", async () => {
    const { getByRole } = render(
      <Popover>
        <PopoverTrigger>
          <button type="button">Open Gooey</button>
        </PopoverTrigger>
        <PopoverContent>Gooey actions</PopoverContent>
      </Popover>,
    );
    setTriggerRect(getByRole("button", { name: "Open Gooey" }));
    fireEvent(window, new Event("resize"));

    const gooLayer = await waitFor(() => {
      const layer = document.querySelector<HTMLElement>(
        '[data-popover-portal] div[aria-hidden="true"]',
      );
      // Two subpaths: the layer box, then the trigger that even-odd knocks out.
      expect(layer?.style.clipPath).toStartWith("path(evenodd,");
      expect(layer?.style.clipPath.match(/M/g)).toHaveLength(2);
      return layer as HTMLElement;
    });

    expect(gooLayer.getAttribute("style")).not.toContain("mask");
    expect(document.querySelector("[data-popover-portal] mask")).toBeNull();
  });

  test("Morph escapes clipping and tracks the trigger in viewport coordinates", async () => {
    const { getByRole, getByText } = render(
      <div style={{ overflow: "hidden" }}>
        <MorphPopover>
          <MorphPopoverTrigger>
            <button type="button">Open Morph</button>
          </MorphPopoverTrigger>
          <MorphPopoverContent>Popover actions</MorphPopoverContent>
        </MorphPopover>
      </div>,
    );
    const trigger = getByRole("button", { name: "Open Morph" });
    setTriggerRect(trigger);
    fireEvent.click(trigger);

    const portal = document.querySelector<HTMLElement>(
      "[data-morph-popover-portal]",
    );
    expect(portal).toBeTruthy();
    expect(portal?.parentElement).toBe(document.body);

    await waitFor(() => {
      expect(portal?.style.left).toBe("168px");
      expect(portal?.style.top).toBe("116px");
      expect(portal?.style.visibility).toBe("visible");
    });

    fireEvent.pointerDown(getByText("Popover actions"));
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(document.body);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });
});
