import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { AspectRatio, AspectRatioImage } from "@/components/motion/aspect-ratio";
import { AspectRatioPreview } from "@/components/previews/motion/aspect-ratio.preview";

afterEach(cleanup);

test("aspect ratio preserves the accessible image and interactive content", async () => {
  const { container, getByRole } = render(
    <AspectRatio ratio={16 / 9} contentClassName="grid place-items-center">
      <AspectRatioImage src="/landscape.jpg" alt="Mountain lake at sunrise" width={1000} height={667} />
      <button type="button">View landscape</button>
    </AspectRatio>,
  );

  expect(getByRole("img", { name: "Mountain lake at sunrise" })).toBeTruthy();
  getByRole("button", { name: "View landscape" }).focus();
  expect(document.activeElement).toBe(getByRole("button", { name: "View landscape" }));
  expect((await axe(container)).violations).toEqual([]);
});

test("aspect ratio preview names its controls and exposes the selected ratio", async () => {
  const { container, getByRole } = render(<AspectRatioPreview />);

  expect(getByRole("tablist", { name: "Aspect ratio" })).toBeTruthy();
  expect(getByRole("tab", { name: "16:9" }).getAttribute("aria-selected")).toBe("true");
  expect(getByRole("tab", { name: "9:16" }).getAttribute("aria-selected")).toBe("false");
  act(() => {
    getByRole("tab", { name: "16:9" }).focus();
    fireEvent.keyDown(getByRole("tab", { name: "16:9" }), { key: "End" });
  });
  expect(document.activeElement).toBe(getByRole("tab", { name: "9:16" }));
  expect(getByRole("tab", { name: "9:16" }).getAttribute("aria-selected")).toBe("true");
  expect(getByRole("tabpanel", { name: "9:16" }).id).toBe(getByRole("tab", { name: "9:16" }).getAttribute("aria-controls") ?? "");
  expect(getByRole("tab", { name: "9:16" }).tabIndex).toBe(0);
  expect(getByRole("tab", { name: "16:9" }).tabIndex).toBe(-1);
  expect((await axe(container)).violations).toEqual([]);
});
