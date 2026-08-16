import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";
import { Tooltip } from "@/components/motion/tooltip";

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

describe("Tooltip", () => {
  test("keeps the label up when the trigger is clicked with a mouse", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.pointerEnter(trigger, mouse);
    await waitFor(() => expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1));

    fireEvent.pointerDown(trigger, mouse);
    fireEvent.click(trigger);
    expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1);
    restore();
  });

  test("opens on a tap and ignores the phantom hover that comes with it", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.pointerEnter(trigger, touch);
    expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(0);

    fireEvent.pointerDown(trigger, touch);
    fireEvent.click(trigger);
    await waitFor(() => expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1));
    restore();
  });

  test("keyboard activation does not close the label focus just opened", async () => {
    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.focus(trigger);
    await waitFor(() => expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1));

    // Enter/Space synthesize a click with no pointerdown behind it.
    fireEvent.click(trigger, { detail: 0 });
    expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1);
  });

  test("an outside tap closes the label and still activates what it hit", async () => {
    const restore = withTouchCapability();
    const outside = document.createElement("button");
    let outsideClicks = 0;
    outside.addEventListener("click", () => {
      outsideClicks += 1;
    });
    document.body.appendChild(outside);

    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.pointerDown(trigger, touch);
    fireEvent.click(trigger);
    await waitFor(() => expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1));

    fireEvent.pointerDown(outside, touch);
    fireEvent.click(outside);
    await waitFor(() => expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(0));
    expect(outsideClicks).toBe(1);

    outside.remove();
    restore();
  });
});
