import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { Tooltip } from "@/components/motion/tooltip";

afterEach(cleanup);

test("a controlled tooltip retains its surface when content, anchor point, and side change", () => {
  const anchorRef = createRef<HTMLButtonElement>();
  const content = (label: string, x: number, side: "left" | "right") => (
    <>
      <button ref={anchorRef} type="button">Chart anchor</button>
      <Tooltip open anchorRef={anchorRef} anchorPoint={{ x, y: 0.5 }} side={side} content={label} />
    </>
  );
  const screen = render(content("First period", 0.2, "right"));
  const surface = screen.getByRole("tooltip");
  const positioner = surface.parentElement;
  screen.rerender(content("Second period with a longer label", 0.8, "left"));
  expect(screen.getByRole("tooltip")).toBe(surface);
  expect(surface.parentElement).toBe(positioner);
  expect(surface.textContent).toBe("Second period with a longer label");
  expect(screen.getAllByRole("tooltip")).toHaveLength(1);
  expect(positioner?.className).toContain("pointer-events-none");
});
