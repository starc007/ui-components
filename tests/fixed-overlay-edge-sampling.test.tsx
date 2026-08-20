import { afterEach, describe, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
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

// `bg-*` utilities that paint nothing: attachment, size, position, repeat,
// clip, origin and blend mode all share the prefix with the colour utilities.
const NON_PAINTING_BG_EXACT = new Set([
  "fixed",
  "local",
  "scroll",
  "auto",
  "cover",
  "contain",
  "no-repeat",
  "center",
  "top",
  "bottom",
  "left",
  "right",
  "top-left",
  "top-right",
  "bottom-left",
  "bottom-right",
  "left-top",
  "left-bottom",
  "right-top",
  "right-bottom",
]);
const NON_PAINTING_BG_PREFIXES = ["repeat", "clip-", "origin-", "blend-"];

// Colour keywords that name a background yet leave nothing to read.
const TRANSPARENT_BG = new Set(["transparent", "inherit", "none", "[transparent]"]);

// A trailing Tailwind opacity modifier: `/40`, `/[0]`, `/[0.05]`. Anchored to
// the end and closed against `]`, so an arbitrary value that contains a slash
// (`bg-[rgb(0_0_0/0.5)]`) is left alone.
const OPACITY_MODIFIER = /\/(?:\[([^\]]*)\]|([^/[\]]+))$/;

/**
 * Whether one class is a `bg-*` utility that paints a colour WebKit can read.
 *
 * Alpha 0 counts as no colour. WebKit actually skips anything below
 * `nearlyTransparentAlphaThreshold`, but the exact value is an internal, and a
 * scrim tuned just above zero is a bug this test should flag rather than
 * excuse — so only a literal zero alpha is modelled here.
 */
function paintsBackground(cls: string): boolean {
  if (!cls.startsWith("bg-")) return false;
  const utility = cls.slice("bg-".length);

  const modifier = utility.match(OPACITY_MODIFIER);
  if (modifier && Number.parseFloat(modifier[1] ?? modifier[2] ?? "") === 0) {
    return false;
  }

  const base = modifier ? utility.slice(0, modifier.index) : utility;
  if (TRANSPARENT_BG.has(base)) return false;
  if (NON_PAINTING_BG_EXACT.has(base)) return false;
  return !NON_PAINTING_BG_PREFIXES.some((prefix) => base.startsWith(prefix));
}

// Tailwind's backdrop filters all carry the `backdrop-` prefix, behind a
// variant or not (`backdrop-blur-sm`, `md:backdrop-saturate-150`); arbitrary
// property classes spell the CSS out inside brackets, plain or vendored
// (`[backdrop-filter:blur(12px)]`, `[-webkit-backdrop-filter:blur(12px)]`).
const BACKDROP_FILTER = /(?:^|[\s:[])(?:-webkit-)?backdrop-/;

/** Elements that would make WebKit sample the page for its edge colours. */
function samplingLayers(root: ParentNode): HTMLElement[] {
  const spansEdges = (el: HTMLElement) =>
    el.classList.contains("fixed") && el.classList.contains("inset-0");
  const hidden = (el: HTMLElement) => el.classList.contains("invisible");
  const hasBackground = (el: HTMLElement) =>
    Array.from(el.classList).some(paintsBackground);
  const hasBackdropFilter = (el: HTMLElement) => BACKDROP_FILTER.test(el.className);
  const hasChildren = (el: HTMLElement) => el.childElementCount > 0;

  // WebKit skips a fixed box that has no background, no backdrop-filter and no
  // children, so a layer costs nothing however transparent it is as long as it
  // is childless and filters nothing behind it.
  return Array.from(root.querySelectorAll<HTMLElement>("*")).filter(
    (el) =>
      spansEdges(el) &&
      !hidden(el) &&
      !hasBackground(el) &&
      (hasChildren(el) || hasBackdropFilter(el)),
  );
}

function classesOf(layers: HTMLElement[]): string[] {
  return layers.map((el) => el.className);
}

describe("samplingLayers", () => {
  // `cleanup` only unmounts what testing-library rendered, so these fixtures
  // have to take themselves back out or they leak into the component tests.
  const fixtures: HTMLElement[] = [];
  afterEach(() => {
    for (const el of fixtures.splice(0)) el.remove();
  });

  function fixture(className: string, { children = 0 } = {}): HTMLElement {
    const el = document.createElement("div");
    el.className = className;
    for (let i = 0; i < children; i += 1) {
      el.append(document.createElement("span"));
    }
    document.body.append(el);
    fixtures.push(el);
    return el;
  }

  test("flags a transparent edge-spanning layer with children", () => {
    const el = fixture("fixed inset-0 z-50", { children: 1 });

    expect(samplingLayers(document.body)).toContain(el);
  });

  test("flags `bg-transparent`, which names a colour but paints none", () => {
    const el = fixture("fixed inset-0 bg-transparent", { children: 1 });

    expect(samplingLayers(document.body)).toContain(el);
  });

  test("flags a zero-alpha background", () => {
    const el = fixture("fixed inset-0 bg-white/0", { children: 1 });

    expect(samplingLayers(document.body)).toContain(el);
  });

  test("flags a childless layer that carries a backdrop filter", () => {
    const arbitrary = fixture(
      "fixed inset-0 [backdrop-filter:blur(12px)_saturate(140%)]",
    );
    const utility = fixture("fixed inset-0 backdrop-blur-sm");

    expect(samplingLayers(document.body)).toEqual([arbitrary, utility]);
  });

  test("skips a childless transparent layer", () => {
    fixture("fixed inset-0 z-40");

    expect(samplingLayers(document.body)).toEqual([]);
  });

  test("skips a layer that carries a real scrim colour", () => {
    fixture("fixed inset-0 bg-black/40", { children: 1 });
    fixture("fixed inset-0 bg-background/10 backdrop-blur-sm", { children: 1 });

    expect(samplingLayers(document.body)).toEqual([]);
  });

  test("does not mistake non-painting `bg-*` utilities for a colour", () => {
    const el = fixture("fixed inset-0 bg-cover bg-center bg-no-repeat", {
      children: 1,
    });

    expect(samplingLayers(document.body)).toContain(el);
  });
});

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

  test("the open command palette carries no visibility transition", () => {
    const { getByRole } = render(<CommandPalette items={[]} open />);

    const overlay = getByRole("button", { name: "Close command palette" })
      .parentElement as HTMLElement;
    expect(overlay.className).toContain("visible");
    expect(overlay.className).not.toContain("invisible");
    // `visibility` holds its start value for the whole transition, so a
    // transition covering hidden → visible would leave the container computing
    // as hidden on the first frame after opening — the frame the palette
    // focuses its input on. The property is only transitioned while closing.
    expect(overlay.className).not.toContain("transition-[visibility]");
    expect(overlay.style.transitionDelay).toBe("");
  });

  test("the opening command palette focuses its search input", async () => {
    const { getByRole } = render(<CommandPalette items={[]} open />);

    // The focus runs from a requestAnimationFrame callback, so let one frame pass.
    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(document.activeElement).toBe(getByRole("combobox"));
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
