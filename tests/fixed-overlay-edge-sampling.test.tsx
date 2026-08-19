import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";
import { CommandPalette } from "@/components/motion/command-palette";
import { TableMenu } from "@/components/motion/table/table-menu";

afterEach(cleanup);

// One defect, three components. A `position: fixed` element that is transparent
// and spans the viewport edges makes iOS 26 Safari snapshot the page and read
// the pixels back from the GPU process on every committed frame, to pick the
// colour for the browser chrome. That read is synchronous.
//
// WebKit asks for the colour only when all of these hold, so breaking any one
// of them removes the cost. The helper below states them as one rule, so the
// test says what is true rather than which class happens to buy it.

/** Elements that would make WebKit sample the page for its edge colours. */
function samplingLayers(root: ParentNode): HTMLElement[] {
  const spansEdges = (el: HTMLElement) =>
    el.classList.contains("fixed") && el.classList.contains("inset-0");
  const hidden = (el: HTMLElement) => el.classList.contains("invisible");
  const hasBackground = (el: HTMLElement) => /(^|\s)bg-\S+/.test(el.className);
  // WebKit skips a fixed box with no background, no backdrop-filter and no
  // children, so a childless layer costs nothing however transparent it is.
  const hasChildren = (el: HTMLElement) => el.childElementCount > 0;

  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
    (el) => spansEdges(el) && !hidden(el) && !hasBackground(el) && hasChildren(el),
  );
}

function classesOf(layers: HTMLElement[]): string[] {
  return layers.map((el) => el.className);
}

describe("fixed full-viewport overlays", () => {
  test("the closed command palette leaves no sampling layer behind", () => {
    const { getByRole } = render(<CommandPalette items={[]} />);

    // It is mounted for the life of the app, so a colour would paint over the
    // page. Hiding is the lever, held back until the exit animation has played.
    expect(classesOf(samplingLayers(document.body))).toEqual([]);

    const overlay = getByRole("button", {
      name: "Close command palette",
      hidden: true,
    }).parentElement as HTMLElement;
    expect(overlay.className).toContain("invisible");
    expect(Number.parseFloat(overlay.style.transitionDelay)).toBeGreaterThan(0);
  });

  test("the open command palette shows itself without delay", () => {
    const { getByRole } = render(<CommandPalette items={[]} open />);

    const overlay = getByRole("button", { name: "Close command palette" })
      .parentElement as HTMLElement;
    expect(overlay.className).toContain("visible");
    expect(overlay.className).not.toContain("invisible");
    expect(overlay.style.transitionDelay).toBe("0ms");
  });

  test("the open modal has no sampling layer", () => {
    const { getByRole } = render(
      <CenterMorphModal>
        <CenterMorphModalTrigger>
          <button type="button">Open profile</button>
        </CenterMorphModalTrigger>
        <CenterMorphModalContent ariaLabel="Profile">
          <p>Profile content</p>
        </CenterMorphModalContent>
      </CenterMorphModal>,
    );

    fireEvent.click(getByRole("button", { name: "Open profile" }));

    // The backdrop spans the edges and carries the scrim colour. The layer that
    // centres the panel is inset off the edges instead.
    expect(classesOf(samplingLayers(document.body))).toEqual([]);
    expect(getByRole("button", { name: "Dismiss modal" }).className).toContain(
      "fixed inset-0",
    );
  });

  test("the table menu click catcher was never a sampling layer", () => {
    const { getByRole } = render(
      <TableMenu
        ariaLabel="Row actions"
        trigger={<span>Actions</span>}
        items={[{ label: "Delete", onSelect: () => {} }]}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Row actions" }));

    // It spans the edges and it is transparent, so it looks like the other two.
    // It has no children, and WebKit skips a fixed box with no background, no
    // backdrop-filter and no children. This component needs no change, and this
    // test is here so nobody adds one to it by pattern.
    const catcher = getByRole("menu").previousElementSibling as HTMLElement;
    expect(catcher.className).toContain("fixed inset-0");
    expect(catcher.childElementCount).toBe(0);
    expect(classesOf(samplingLayers(document.body))).toEqual([]);
  });
});
