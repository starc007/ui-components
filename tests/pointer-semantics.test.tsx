import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { ExpandableActionBar } from "@/components/motion/expandable-action-bar";
import { KnockoutWheel, ROUNDS } from "@/components/motion/knockout-wheel";
import { NotificationStack } from "@/components/motion/notification-stack";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";
import { PreviewRail } from "@/components/motion/preview-rail";
import { SwipeableList } from "@/components/motion/swipeable-list";
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
// A pen with no hover reports contact on the way in and, per the spec, its
// release boundary event on the way out — after the click, buttons back to 0.
const penDown = { pointerType: "pen", buttons: 1 } as const;
const penUp = { pointerType: "pen", buttons: 0 } as const;
// A mouse dragged off a surface with the button still held.
const mouseHeld = { pointerType: "mouse", buttons: 1 } as const;

const settle = (ms: number) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

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

  test("keeps the panel a pen tap opened, whichever way the boundary lands", async () => {
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button type="button">Hover me</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    // Chromium order: the release boundary event comes after the click.
    fireEvent.pointerEnter(trigger, penDown);
    fireEvent.pointerDown(trigger, penDown);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("true"),
    );
    fireEvent.pointerLeave(trigger, penUp);
    await settle(200);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    // WebKit order: the boundary event comes first and used to schedule the
    // close that then fired 120ms after the click had opened the panel.
    fireEvent.pointerDown(trigger, penDown);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
    fireEvent.pointerEnter(trigger, penDown);
    fireEvent.pointerDown(trigger, penDown);
    fireEvent.pointerLeave(trigger, penUp);
    fireEvent.click(trigger);
    await settle(200);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("closes when a held mouse drags off the trigger", async () => {
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button type="button">Hover me</button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    fireEvent.pointerEnter(trigger, mouse);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("true"),
    );

    // Pressed inside, released outside: this leave is the only exit notice
    // the panel gets.
    fireEvent.pointerDown(trigger, mouseHeld);
    fireEvent.pointerLeave(trigger, mouseHeld);
    await settle(200);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("records the tap even when the child prevents the pointerdown default", async () => {
    const restore = withTouchCapability();
    const { getByRole } = render(
      <Popover trigger="hover">
        <PopoverTrigger>
          <button
            type="button"
            onPointerDown={(event) => event.preventDefault()}
          >
            Hover me
          </button>
        </PopoverTrigger>
        <PopoverContent>Panel</PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Hover me" });
    fireEvent.pointerDown(trigger, touch);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("true"),
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

  test("keeps the label a pen tap opened when the pen lifts off", async () => {
    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.pointerEnter(trigger, penDown);
    fireEvent.pointerDown(trigger, penDown);
    fireEvent.click(trigger);
    await waitFor(() =>
      expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1),
    );

    // Long enough for the exit animation to have taken it away had the leave
    // been read as the end of a hover.
    fireEvent.pointerLeave(trigger, penUp);
    await settle(300);
    expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1);
  });

  test("hides when a held mouse drags off the trigger", async () => {
    const { getByRole } = render(
      <Tooltip content="Like this post" delay={0}>
        <button type="button">Like</button>
      </Tooltip>,
    );

    const trigger = getByRole("button", { name: "Like" });
    fireEvent.pointerEnter(trigger, mouse);
    await waitFor(() =>
      expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(1),
    );

    fireEvent.pointerDown(trigger, mouseHeld);
    fireEvent.pointerLeave(trigger, mouseHeld);
    await waitFor(() =>
      expect(document.querySelectorAll("[role=tooltip]")).toHaveLength(0),
    );
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

  test("stays expanded after the pen that tapped it lifts off", async () => {
    const fired: string[] = [];
    const { getByTitle } = render(
      <ExpandableActionBar
        items={items}
        onAction={(item) => fired.push(item.id)}
      />,
    );

    const send = getByTitle("Send");
    fireEvent.pointerEnter(send, penDown);
    fireEvent.pointerDown(send, penDown);
    fireEvent.click(send);
    expect(fired).toEqual([]);

    fireEvent.pointerLeave(send, penUp);
    await settle(200);
    // The labels the first tap revealed are still readable for the second.
    fireEvent.pointerDown(send, penDown);
    fireEvent.click(send);
    expect(fired).toEqual(["send"]);
  });

  test("collapses when a held mouse drags off the bar", async () => {
    const { getByTitle } = render(<ExpandableActionBar items={items} />);
    const send = getByTitle("Send");

    fireEvent.pointerEnter(send, mouse);
    const label = send.querySelector("[aria-hidden]");
    await waitFor(() => expect(label?.getAttribute("aria-hidden")).toBe("false"));

    fireEvent.pointerDown(send, mouseHeld);
    fireEvent.pointerLeave(send, mouseHeld);
    await settle(200);
    expect(label?.getAttribute("aria-hidden")).toBe("true");
  });

  test("a cancelled tap does not swallow the next keyboard action", () => {
    const restore = withTouchCapability();
    const fired: string[] = [];
    const { getByTitle } = render(
      <ExpandableActionBar
        items={items}
        onAction={(item) => fired.push(item.id)}
      />,
    );

    const send = getByTitle("Send");
    fireEvent.pointerDown(send, touch);
    fireEvent.pointerCancel(send, touch);

    // Enter on the focused action: the bar is collapsed, but a keyboard user
    // reads the labels from the accessible name, so it acts straight away.
    fireEvent.keyDown(send, { key: "Enter" });
    fireEvent.click(send, { detail: 0 });
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

  test("collapses when a held mouse drags off the stack", () => {
    const { getByRole } = render(<NotificationStack items={items} />);
    const stack = getByRole("button");

    fireEvent.pointerEnter(stack, mouse);
    expect(stack.getAttribute("aria-expanded")).toBe("true");

    fireEvent.pointerDown(stack, mouseHeld);
    fireEvent.pointerLeave(stack, mouseHeld);
    expect(stack.getAttribute("aria-expanded")).toBe("false");
  });

  test("a cancelled tap does not stand in for the next keyboard activation", () => {
    let viewedAll = 0;
    const { getByRole } = render(
      <NotificationStack
        items={items}
        onViewAll={() => {
          viewedAll += 1;
        }}
      />,
    );

    const stack = getByRole("button");
    fireEvent.pointerDown(stack, touch);
    fireEvent.pointerCancel(stack, touch);

    // Focus expands the stack, so Enter on it is the "view all" activation.
    fireEvent.focus(stack);
    expect(stack.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(stack, { key: "Enter" });
    fireEvent.click(stack, { detail: 0 });
    expect(viewedAll).toBe(1);
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

describe("SwipeableList", () => {
  test("leaves the row's content selectable to a mouse", () => {
    const { getByText } = render(
      <SwipeableList
        items={[
          {
            id: "one",
            title: "Design review",
            description: "Selectable copy",
            rightActions: [
              { id: "delete", label: "Delete", icon: <span>x</span> },
            ],
          },
        ]}
      />,
    );

    const surface = getByText("Selectable copy").closest(
      "[class*='cursor-grab']",
    ) as HTMLElement;
    // The row wraps content the consumer rendered, so selection is suppressed
    // only where the platform runs its own press gestures.
    expect(surface.className).toContain("pointer-coarse:select-none");
    expect(surface.className.split(/\s+/)).not.toContain("select-none");
  });
});

describe("Escape", () => {
  test("hands focus back to the popover trigger", async () => {
    const { getByRole } = render(
      <Popover defaultOpen>
        <PopoverTrigger>
          <button type="button">Menu</button>
        </PopoverTrigger>
        <PopoverContent>
          <button type="button">Pick</button>
        </PopoverContent>
      </Popover>,
    );

    const trigger = getByRole("button", { name: "Menu" });
    const pick = getByRole("button", { name: "Pick" });
    pick.focus();
    expect(document.activeElement).toBe(pick);

    fireEvent.keyDown(pick, { key: "Escape" });
    await waitFor(() =>
      expect(trigger.getAttribute("aria-expanded")).toBe("false"),
    );
    // The panel goes inert on close, so focus cannot be left inside it.
    expect(document.activeElement).toBe(trigger);
  });

  test("leaves focus on the notification stack it collapsed", () => {
    const { getByRole } = render(
      <NotificationStack
        items={[{ id: "a", title: "Motion review approved" }]}
      />,
    );

    const stack = getByRole("button");
    stack.focus();
    fireEvent.focus(stack);
    expect(stack.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(stack, { key: "Escape" });
    expect(stack.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(stack);
  });
});

describe("consumed dismissal", () => {
  const items = [
    { id: "send", label: "Send", icon: <span>S</span> },
    { id: "export", label: "Export", icon: <span>E</span> },
  ];

  test("releases the swallower when the keyboard takes over", () => {
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

    // The dismissing gesture is dragged away and released outside: it
    // dismisses, but no click and no cancel ever follows it.
    fireEvent.pointerDown(outside, touch);

    // Enter on a focused control must not hand its click to that gesture.
    fireEvent.keyDown(outside, { key: "Enter" });
    fireEvent.click(outside, { detail: 0 });
    expect(outsideClicks).toBe(1);

    outside.remove();
    restore();
  });

  test("leaves a click that belongs to another open overlay alone", async () => {
    const restore = withTouchCapability();
    let picked = 0;
    const { getByTitle, getByRole } = render(
      <>
        <ExpandableActionBar items={items} />
        <Popover defaultOpen>
          <PopoverTrigger>
            <button type="button">Menu</button>
          </PopoverTrigger>
          <PopoverContent>
            <button
              type="button"
              onClick={() => {
                picked += 1;
              }}
            >
              Pick
            </button>
          </PopoverContent>
        </Popover>
      </>,
    );

    const send = getByTitle("Send");
    fireEvent.pointerDown(send, touch);
    fireEvent.click(send);

    // Opened from the keyboard, so the gesture that expanded the bar is not
    // also the one that dismissed it.
    fireEvent.click(getByRole("button", { name: "Menu" }), { detail: 0 });

    // The bar is behind the popover and dismisses on this tap — but the tap
    // belongs to the popover in front of it.
    const pick = getByRole("button", { name: "Pick" });
    fireEvent.pointerDown(pick, touch);
    fireEvent.click(pick);
    expect(picked).toBe(1);

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

  test("a cancelled tap is not spent on the next keyboard activation", () => {
    const restore = withTouchCapability();
    const { container, getByLabelText } = render(<PreviewRail items={items} />);
    const two = getByLabelText("Two");

    // The OS claims the touch mid-gesture — a scroll, a system edge swipe — so
    // no click ever lands on the tick.
    fireEvent.pointerDown(two, touch);
    fireEvent.pointerCancel(two, touch);

    // Enter on the focused tick must navigate on the first press.
    expect(fireEvent.click(two, { detail: 0 })).toBe(true);
    expect(container.textContent).not.toContain("Second");
    restore();
  });

  test("a gesture that ends in a key press is not spent on that key's click", () => {
    const restore = withTouchCapability();
    const { container, getByLabelText } = render(<PreviewRail items={items} />);
    const two = getByLabelText("Two");

    // Pressed, then dragged away and released outside: no click, no cancel.
    fireEvent.pointerDown(two, touch);
    fireEvent.keyDown(two, { key: "Enter" });

    expect(fireEvent.click(two, { detail: 0 })).toBe(true);
    expect(container.textContent).not.toContain("Second");
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

describe("KnockoutWheel", () => {
  // iPadOS answers this query with true while a finger is the only input
  // there is — the case the tap path was written for and used to miss.
  function withHoverCapability() {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) =>
      ({
        matches:
          query.includes("prefers-reduced-motion") || query.includes("hover"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList) as typeof window.matchMedia;
    return () => {
      window.matchMedia = original;
    };
  }

  test("a tap isolates a flag on a machine that claims it can hover", async () => {
    const restoreHover = withHoverCapability();
    const restore = withTouchCapability();
    const { container, getAllByRole } = render(<KnockoutWheel rounds={ROUNDS} />);
    const rim = getAllByRole("button").at(-1) as HTMLButtonElement;

    fireEvent.pointerDown(rim, touch);
    fireEvent.click(rim);
    await waitFor(() => {
      expect(container.querySelectorAll(".stroke-foreground")).toHaveLength(1);
    });

    // ...and tapping it again releases the isolation.
    fireEvent.pointerDown(rim, touch);
    fireEvent.click(rim);
    await waitFor(() => {
      expect(
        container.querySelectorAll(".stroke-foreground").length,
      ).toBeGreaterThan(1);
    });
    restore();
    restoreHover();
  });

  test("a mouse click leaves the isolation to the hover it already has", () => {
    const restoreHover = withHoverCapability();
    const { container, getAllByRole } = render(<KnockoutWheel rounds={ROUNDS} />);
    const rim = getAllByRole("button").at(-1) as HTMLButtonElement;

    fireEvent.pointerDown(rim, mouse);
    fireEvent.click(rim);
    expect(
      container.querySelectorAll(".stroke-foreground").length,
    ).toBeGreaterThan(1);
    restoreHover();
  });

  test("no window listener is installed until a tap pins a flag", () => {
    const restoreHover = withHoverCapability();
    const outside = document.createElement("button");
    let outsideClicks = 0;
    outside.addEventListener("click", () => {
      outsideClicks += 1;
    });
    document.body.appendChild(outside);

    const { container, getAllByRole } = render(<KnockoutWheel rounds={ROUNDS} />);
    const rim = getAllByRole("button").at(-1) as HTMLButtonElement;

    // Mouse users never pin, so an outside mousedown must not reach in.
    fireEvent.pointerDown(outside, mouse);
    fireEvent.click(outside);
    expect(outsideClicks).toBe(1);

    fireEvent.pointerDown(rim, touch);
    fireEvent.click(rim);
    fireEvent.pointerDown(outside, touch);
    fireEvent.click(outside);
    expect(outsideClicks).toBe(1);
    expect(
      container.querySelectorAll(".stroke-foreground").length,
    ).toBeGreaterThan(1);

    outside.remove();
    restoreHover();
  });
});
