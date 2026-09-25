import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { createRef, StrictMode } from "react";
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

test("the entrance waits for its first positioned frame", async () => {
  const original = globalThis.requestAnimationFrame;
  const pending: FrameRequestCallback[] = [];
  globalThis.requestAnimationFrame = (callback) => {
    pending.push(callback);
    return pending.length;
  };
  const anchorRef = createRef<HTMLButtonElement>();
  try {
    const screen = render(
      <>
        <button ref={anchorRef} type="button">
          Anchor
        </button>
        <Tooltip open anchorRef={anchorRef} content="Measured first" />
      </>,
    );
    const surface = screen.getByRole("tooltip", { hidden: true });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 160));
    });
    expect(surface.style.opacity).toBe("0");
    expect(surface.parentElement?.style.visibility).toBe("hidden");
    globalThis.requestAnimationFrame = original;
    await act(async () => {
      for (const callback of pending) callback(performance.now());
    });
    await waitFor(() => expect(surface.parentElement?.style.visibility).toBe("visible"));
    await waitFor(() => expect(Number(surface.style.opacity)).toBeGreaterThan(0));
  } finally {
    globalThis.requestAnimationFrame = original;
  }
});

test("reopening during exit keeps the surface and a fully closed tooltip can open again", async () => {
  const anchorRef = createRef<HTMLButtonElement>();
  const view = (open: boolean) => (
    <>
      <button ref={anchorRef} type="button">
        Anchor
      </button>
      <Tooltip open={open} anchorRef={anchorRef} content="Reversible" />
    </>
  );
  const screen = render(view(true));
  const surface = await screen.findByRole("tooltip");
  screen.rerender(view(false));
  expect(surface.parentElement?.hasAttribute("inert")).toBe(true);
  screen.rerender(view(true));
  expect(screen.getByRole("tooltip")).toBe(surface);
  expect(surface.parentElement?.style.visibility).toBe("visible");
  screen.rerender(view(false));
  await waitFor(() => expect(surface.isConnected).toBe(false));
  screen.rerender(view(true));
  const nextSurface = await screen.findByRole("tooltip");
  expect(nextSurface).not.toBe(surface);
  await waitFor(() => expect(Number(nextSurface.style.opacity)).toBeGreaterThan(0));
});

test("Strict Mode entrance fades forward once and exit fades out before removal", async () => {
  const anchorRef = createRef<HTMLButtonElement>();
  const view = (open: boolean) => (
    <StrictMode>
      <button ref={anchorRef} type="button">
        Anchor
      </button>
      <Tooltip open={open} anchorRef={anchorRef} content="One entrance" />
    </StrictMode>
  );
  const screen = render(view(true));
  const surface = screen.getByRole("tooltip", { hidden: true });
  const sample = async (duration: number) => {
    const opacity: number[] = [];
    for (let i = 0; i < duration / 10; i++) {
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
      });
      if (surface.isConnected) opacity.push(Number(surface.style.opacity));
    }
    return opacity;
  };
  const entrance = await sample(260);
  expect(entrance.some((value) => value > 0 && value < 1)).toBe(true);
  expect(entrance.at(-1)).toBe(1);
  for (let i = 1; i < entrance.length; i++)
    expect(entrance[i]).toBeGreaterThanOrEqual(entrance[i - 1]);
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  screen.rerender(view(false));
  const exit = await sample(200);
  expect(exit.some((value) => value > 0 && value < 1)).toBe(true);
  for (let i = 1; i < exit.length; i++) expect(exit[i]).toBeLessThanOrEqual(exit[i - 1]);
  expect(surface.isConnected).toBe(false);
});
