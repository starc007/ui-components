import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";

// Every component here used to pick an interaction *mode* from a device
// capability. These lock in the replacement contract: both paths stay live and
// each event is routed by the pointer that produced it, so a machine that
// reports a touchscreen keeps its mouse behaviour.
function withTouchCapability() {
  Object.defineProperty(navigator, "maxTouchPoints", {
    value: 10,
    configurable: true,
  });
  return () =>
    Object.defineProperty(navigator, "maxTouchPoints", {
      value: 0,
      configurable: true,
    });
}

const mouse = { pointerType: "mouse", buttons: 0 } as const;
const touch = { pointerType: "touch", buttons: 1 } as const;

afterEach(cleanup);

describe("Popover trigger='hover'", () => {
  test("opens on mouse hover on a touch-capable machine", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button type="button">Hover me</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    fireEvent.pointerOver(trigger, mouse);

    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));
    restore();
  });

  test("ignores the phantom hover a tap fires, and opens from the tap itself", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button type="button">Hover me</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    fireEvent.pointerOver(trigger, touch);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");

    fireEvent.pointerDown(trigger, touch);
    fireEvent.click(trigger);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    // ...and the next tap on the trigger closes it again.
    fireEvent.pointerDown(trigger, touch);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
    restore();
  });

  test("leaves a mouse click on the trigger alone", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button type="button">Hover me</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    fireEvent.pointerOver(trigger, mouse);
    await waitFor(() => expect(trigger.getAttribute("aria-expanded")).toBe("true"));

    fireEvent.pointerDown(trigger, mouse);
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    restore();
  });
});
