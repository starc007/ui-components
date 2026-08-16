import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { ExpandableActionBar } from "@/components/motion/expandable-action-bar";
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

describe("ExpandableActionBar", () => {
  const items = [
    { id: "send", label: "Send", icon: <span>S</span> },
    { id: "export", label: "Export", icon: <span>E</span> },
  ];

  test("the first tap on a collapsed bar expands it and runs no action", async () => {
    const restore = withTouchCapability();
    const fired: string[] = [];
    const { getByTitle } = render(
      <ExpandableActionBar
        items={items}
        onAction={(item) => fired.push(item.id)}
      />,
    );

    const send = getByTitle("Send");
    // The compatibility mouse burst a tap fires must not drive the bar.
    fireEvent.pointerEnter(send, touch);
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);
    expect(fired).toEqual([]);

    // ...and the second tap acts, now that the labels are readable.
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);
    expect(fired).toEqual(["send"]);
    restore();
  });

  test("a mouse click acts straight away", () => {
    const restore = withTouchCapability();
    const fired: string[] = [];
    const { getByTitle } = render(
      <ExpandableActionBar
        items={items}
        onAction={(item) => fired.push(item.id)}
      />,
    );

    const send = getByTitle("Send");
    fireEvent.pointerEnter(send, mouse);
    fireEvent.pointerDown(send, mouse);
    fireEvent.click(send);
    expect(fired).toEqual(["send"]);
    restore();
  });

  test("a controlled bar that declines to expand still acts on the second tap", () => {
    const restore = withTouchCapability();
    const fired: string[] = [];
    const { getByTitle } = render(
      <ExpandableActionBar
        items={items}
        expanded={false}
        onAction={(item) => fired.push(item.id)}
      />,
    );

    const send = getByTitle("Send");
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);
    expect(fired).toEqual(["send"]);
    restore();
  });

  test("the tap that dismisses an expanded bar does not also fire what it hit", async () => {
    const restore = withTouchCapability();
    const outside = document.createElement("button");
    let outsideClicks = 0;
    outside.addEventListener("click", () => {
      outsideClicks += 1;
    });
    document.body.appendChild(outside);

    const { getByTitle } = render(<ExpandableActionBar items={items} />);
    const send = getByTitle("Send");
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);

    fireEvent.pointerDown(outside, touch);
    fireEvent.click(outside);
    expect(outsideClicks).toBe(0);
    expect(send.closest("[aria-hidden]")).toBeNull();

    // The swallower releases with that click, so once the bar has finished
    // collapsing the next tap lands normally.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
    });
    fireEvent.pointerDown(outside, touch);
    fireEvent.click(outside);
    expect(outsideClicks).toBe(1);

    outside.remove();
    restore();
  });
});
