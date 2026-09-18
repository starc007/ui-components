import { afterAll, afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const OriginalObserver = globalThis.ResizeObserver;
let resize: () => void;
class Observer {
  constructor(callback: () => void) { resize = callback; }
  observe() {}
  disconnect() {}
  unobserve() {}
}
globalThis.ResizeObserver = Observer as unknown as typeof ResizeObserver;
afterEach(cleanup);

function Example({ value = "one", variant = "pill", extra = false }: { value?: string; variant?: "pill" | "segment" | "underline"; extra?: boolean }) {
  return <Tabs value={value} variant={variant}><TabsList><TabsTrigger value="one">One</TabsTrigger><TabsTrigger value="two">Two</TabsTrigger>{extra && <TabsTrigger value="three">Three</TabsTrigger>}</TabsList></Tabs>;
}

// Model the browser's CSSOM geometry explicitly: LTR runs 0..max, RTL -max..0.
// Resize notifications and scroll events are dispatched separately, like the browser.
function geometry(view: ReturnType<typeof render>, rtl = false) {
  const list = view.getByRole("tablist");
  const viewport = list.parentElement as HTMLDivElement;
  const root = viewport.parentElement as HTMLDivElement;
  let width = 600;
  let rootWidth = 300;
  Object.defineProperty(root, "clientWidth", { configurable: true, get: () => rootWidth });
  Object.defineProperty(viewport, "clientWidth", { configurable: true, get: () => rootWidth });
  Object.defineProperty(viewport, "scrollWidth", { configurable: true, get: () => width });
  viewport.style.direction = rtl ? "rtl" : "ltr";
  const calls: ScrollToOptions[] = [];
  viewport.scrollBy = (options?: ScrollToOptions | number) => { if (options && typeof options !== "number") calls.push(options); };
  act(() => resize());
  return { viewport, calls, resizeTo: (next: number, content = width) => { rootWidth = next; width = content; act(() => resize()); } };
}

describe("Tabs overflow", () => {
  for (const variant of ["pill", "segment", "underline"] as const) {
    test(`${variant}: exposes controls only for overflow and handles LTR ends`, () => {
      const view = render(<Example variant={variant} />);
      expect(view.queryByRole("button", { name: "Scroll tabs left" })).toBeNull();
      const { viewport, resizeTo } = geometry(view);
      const left = view.getByRole("button", { name: "Scroll tabs left" }) as HTMLButtonElement;
      const right = view.getByRole("button", { name: "Scroll tabs right" }) as HTMLButtonElement;
      expect(left.disabled).toBe(true);
      expect(right.disabled).toBe(false);
      viewport.scrollLeft = 100;
      fireEvent.scroll(viewport);
      expect(left.disabled).toBe(false);
      expect(right.disabled).toBe(false);
      viewport.scrollLeft = 300;
      fireEvent.scroll(viewport);
      expect(right.disabled).toBe(true);
      resizeTo(700);
      expect(view.queryByRole("button", { name: "Scroll tabs left" })).toBeNull();
    });
  }

  test("RTL starts at the right edge and clamps overscroll at both ends", () => {
    const view = render(<Example />);
    const { viewport } = geometry(view, true);
    const left = view.getByRole("button", { name: "Scroll tabs left" }) as HTMLButtonElement;
    const right = view.getByRole("button", { name: "Scroll tabs right" }) as HTMLButtonElement;
    expect(left.disabled).toBe(false);
    expect(right.disabled).toBe(true);
    viewport.scrollLeft = -100;
    fireEvent.scroll(viewport);
    expect(left.disabled).toBe(false);
    expect(right.disabled).toBe(false);
    viewport.scrollLeft = -400;
    fireEvent.scroll(viewport);
    expect(left.disabled).toBe(true);
    expect(right.disabled).toBe(false);
    viewport.scrollLeft = 20;
    fireEvent.scroll(viewport);
    expect(right.disabled).toBe(true);
  });

  test("controls scroll in their physical direction", () => {
    const view = render(<Example />);
    const { viewport, calls } = geometry(view);
    fireEvent.click(view.getByRole("button", { name: "Scroll tabs right" }));
    expect(calls.at(-1)?.left).toBeCloseTo(240);
    expect(calls.at(-1)?.behavior).toBe(window.matchMedia("(prefers-reduced-motion)").matches ? "instant" : "smooth");
    viewport.scrollLeft = 100;
    fireEvent.scroll(viewport);
    fireEvent.click(view.getByRole("button", { name: "Scroll tabs left" }));
    expect(calls.at(-1)?.left).toBeCloseTo(-240);
  });

  test("reveals controlled selection and focused tabs without scrolling ancestors", () => {
    const view = render(<Example />);
    const { viewport, calls } = geometry(view);
    viewport.getBoundingClientRect = () => ({ left: 40, right: 268 } as DOMRect);
    const tab = view.getByRole("tab", { name: "Two" });
    tab.getBoundingClientRect = () => ({ left: 400, right: 460 } as DOMRect);
    view.rerender(<Example value="two" />);
    expect(calls.at(-1)?.left).toBe(228);
    tab.getBoundingClientRect = () => ({ left: 10, right: 70 } as DOMRect);
    fireEvent.focus(tab);
    expect(calls.at(-1)?.left).toBe(-30);
  });

  test("removes controls when dynamic content fits, then restores them on resize", () => {
    const view = render(<Example extra />);
    const { resizeTo } = geometry(view);
    resizeTo(300, 250);
    view.rerender(<Example />);
    expect(view.queryByRole("button", { name: "Scroll tabs right" })).toBeNull();
    resizeTo(150, 250);
    expect(view.queryByRole("button", { name: "Scroll tabs right" })).not.toBeNull();
  });
});

// Other test files must retain their normal observer implementation.
afterAll(() => { globalThis.ResizeObserver = OriginalObserver; });
