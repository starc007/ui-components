import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { ExpandableActionBar } from "@/components/motion/expandable-action-bar";
import { NotificationStack } from "@/components/motion/notification-stack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";
import { PreviewRail } from "@/components/motion/preview-rail";
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

describe("NotificationStack", () => {
  const items = [
    { id: "a", title: "Motion review approved" },
    { id: "b", title: "The pull request is ready" },
  ];

  test("a pen resting on the stack does not expand it before its tap", () => {
    const onViewAll = () => {
      viewedAll += 1;
    };
    let viewedAll = 0;
    const { getByRole } = render(
      <NotificationStack items={items} onViewAll={onViewAll} />,
    );

    const stack = getByRole("button");
    // Contact, not hover: pointerenter arrives with the pen already down.
    fireEvent.pointerEnter(stack, { pointerType: "pen", buttons: 1 });
    expect(stack.getAttribute("aria-expanded")).toBe("false");

    fireEvent.pointerDown(stack, { pointerType: "pen", buttons: 1 });
    fireEvent.click(stack);
    expect(stack.getAttribute("aria-expanded")).toBe("true");
    expect(viewedAll).toBe(0);

    fireEvent.pointerDown(stack, { pointerType: "pen", buttons: 1 });
    fireEvent.click(stack);
    expect(viewedAll).toBe(1);
  });

  test("a hovering pen expands it the way a mouse does", () => {
    const { container } = render(<NotificationStack items={items} />);
    const stack = container.querySelector("button") as HTMLButtonElement;
    fireEvent.pointerEnter(stack, { pointerType: "pen", buttons: 0 });
    expect(stack.getAttribute("aria-expanded")).toBe("true");
  });

  test("the tap that collapses it does not fire the control it landed on", () => {
    const restore = withTouchCapability();
    const outside = document.createElement("button");
    let outsideClicks = 0;
    outside.addEventListener("click", () => {
      outsideClicks += 1;
    });
    document.body.appendChild(outside);

    const { container } = render(<NotificationStack items={items} />);
    const stack = container.querySelector("button") as HTMLButtonElement;
    fireEvent.pointerDown(stack, touch);
    fireEvent.click(stack);
    expect(stack.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(outside, touch);
    fireEvent.click(outside);
    expect(stack.getAttribute("aria-expanded")).toBe("false");
    expect(outsideClicks).toBe(0);

    outside.remove();
    restore();
  });

  test("an outside pointerdown that a handler stops still dismisses", () => {
    const restore = withTouchCapability();
    const outside = document.createElement("div");
    outside.addEventListener("pointerdown", (event) => event.stopPropagation());
    document.body.appendChild(outside);

    const { container } = render(<NotificationStack items={items} />);
    const stack = container.querySelector("button") as HTMLButtonElement;
    fireEvent.pointerDown(stack, touch);
    fireEvent.click(stack);
    expect(stack.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(outside, touch);
    expect(stack.getAttribute("aria-expanded")).toBe("false");

    outside.remove();
    restore();
  });
});

describe("PreviewRail", () => {
  const items = [
    { id: "one", label: "One", description: "First", href: "#one" },
    { id: "two", label: "Two", description: "Second", href: "#two" },
  ];

  test("a tap previews the link before it follows it", () => {
    const restore = withTouchCapability();
    const { container, getByLabelText } = render(<PreviewRail items={items} />);
    const two = getByLabelText("Two");

    fireEvent.pointerDown(two, touch);
    const first = fireEvent.click(two);
    expect(first).toBe(false); // default prevented: the page stays put
    expect(container.textContent).toContain("Second");

    fireEvent.pointerDown(two, touch);
    const second = fireEvent.click(two);
    expect(second).toBe(true);
    restore();
  });

  test("a mouse click follows the link on the first go", () => {
    const restore = withTouchCapability();
    const { getByLabelText } = render(<PreviewRail items={items} />);
    const two = getByLabelText("Two");

    fireEvent.pointerDown(two, mouse);
    expect(fireEvent.click(two)).toBe(true);
    restore();
  });

  test("keyboard activation leaves no preview behind, and focus loss clears a tapped one", () => {
    const restore = withTouchCapability();
    const { container, getByLabelText } = render(
      <PreviewRail items={items.map(({ href, ...rest }) => rest)} />,
    );
    const two = getByLabelText("Two");

    // Enter on a focused tick: a click with no pointerdown behind it. It used
    // to light the tick with nothing but a future outside tap to clear it.
    fireEvent.click(two, { detail: 0 });
    expect(container.textContent).not.toContain("Second");

    fireEvent.pointerDown(two, touch);
    fireEvent.click(two);
    expect(container.textContent).toContain("Second");

    fireEvent.blur(two);
    expect(container.textContent).not.toContain("Second");
    restore();
  });
});
