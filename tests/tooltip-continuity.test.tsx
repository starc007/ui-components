import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { Tooltip } from "@/components/motion/tooltip";

afterEach(cleanup);

test("a controlled tooltip retains its surface when content, anchor point, and side change", async () => {
  const anchorRef = createRef<HTMLButtonElement>();
  const content = (label: string, x: number, side: "left" | "right") => (
    <>
      <button ref={anchorRef} type="button">
        Chart anchor
      </button>
      <Tooltip open anchorRef={anchorRef} anchorPoint={{ x, y: 0.5 }} side={side} content={label} />
    </>
  );
  const screen = render(content("First period", 0.2, "right"));
  const surface = await screen.findByRole("tooltip");
  const positioner = surface.parentElement;
  screen.rerender(content("Second period with a longer label", 0.8, "left"));
  expect(screen.getByRole("tooltip")).toBe(surface);
  expect(surface.parentElement).toBe(positioner);
  expect(surface.textContent).toBe("Second period with a longer label");
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  expect(positioner?.className).toContain("pointer-events-none");
});

// The readout must not rerender for raw pointer coordinates: only the positioning layer moves.
test("cursor movement updates geometry without rerendering content", async () => {
  let renders = 0;
  function Content() {
    renders++;
    return <span>Cursor details</span>;
  }
  const screen = render(
    <Tooltip content={<Content />} followCursor delay={0}>
      <button type="button">Inspect</button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button");
  fireEvent.pointerEnter(trigger, { pointerType: "mouse", buttons: 0, clientX: 300, clientY: 300 });
  const surface = await screen.findByRole("tooltip");
  const count = renders;
  const layer = surface.parentElement as HTMLElement;
  for (let i = 0; i < 20; i++) {
    fireEvent.pointerMove(trigger, {
      pointerType: "mouse",
      buttons: 0,
      clientX: 300 + i * 4,
      clientY: 300 + i * 3,
    });
  }
  await waitFor(() => expect(layer.style.visibility).toBe("visible"));
  expect(renders).toBe(count);
  expect(screen.getByRole("tooltip")).toBe(surface);
  expect(layer.style.transition).toBe("");
  expect(layer.style.transform).not.toMatch(/NaN|Infinity/);
});

test("Escape dismisses without reopening on further cursor movement", async () => {
  const screen = render(
    <Tooltip content="Details" followCursor delay={0}>
      <button type="button">Inspect</button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button");
  fireEvent.pointerEnter(trigger, { pointerType: "mouse", buttons: 0 });
  await screen.findByRole("tooltip");
  fireEvent.keyDown(trigger, { key: "Escape" });
  fireEvent.pointerMove(trigger, { pointerType: "mouse", buttons: 0, clientX: 500, clientY: 300 });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);
});

test("Escape cancels an opening delay and existing descriptions survive", async () => {
  const screen = render(
    <Tooltip content="Details" delay={30}>
      <button type="button" aria-describedby="help">
        Inspect
      </button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button");
  fireEvent.focus(trigger);
  fireEvent.keyDown(trigger, { key: "Escape" });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 60));
  });
  expect(screen.queryByRole("tooltip")).toBeNull();
  expect(trigger.getAttribute("aria-describedby")).toBe("help");
});

test("a static tooltip stays open across the gap and while its content is hovered", async () => {
  const screen = render(
    <Tooltip content="Readable details" delay={0}>
      <button type="button">Inspect</button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button");
  fireEvent.pointerEnter(trigger, { pointerType: "mouse", buttons: 0 });
  const surface = await screen.findByRole("tooltip");
  fireEvent.pointerLeave(trigger, { pointerType: "mouse", buttons: 0 });
  fireEvent.pointerEnter(surface, { pointerType: "mouse", buttons: 0 });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 120));
  });
  expect(screen.getByRole("tooltip")).toBe(surface);
  fireEvent.pointerLeave(surface, { pointerType: "mouse", buttons: 0 });
  await waitFor(() => expect(screen.queryByRole("tooltip")).toBeNull());
});

test("cursor tooltips dismiss on scroll while keyboard anchored tooltips remain", async () => {
  const screen = render(
    <Tooltip content="Details" followCursor delay={0}>
      <button type="button">Inspect</button>
    </Tooltip>,
  );
  const trigger = screen.getByRole("button");
  fireEvent.pointerEnter(trigger, { pointerType: "mouse", buttons: 0 });
  fireEvent.pointerMove(trigger, { pointerType: "mouse", buttons: 0, clientX: 300, clientY: 300 });
  await screen.findByRole("tooltip");
  fireEvent.scroll(window);
  expect(screen.queryByRole("tooltip")).toBeNull();
  fireEvent.focus(trigger);
  await screen.findByRole("tooltip");
  fireEvent.scroll(window);
  expect(screen.getByRole("tooltip")).toBeTruthy();
});
