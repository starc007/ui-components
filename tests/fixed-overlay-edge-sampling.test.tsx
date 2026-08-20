import { afterEach, describe, expect, test } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  type RenderResult,
  waitFor,
} from "@testing-library/react";
import type { ReactElement } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarProvider,
} from "@/components/motion/animated-sidebar";
import { AttachmentUpload } from "@/components/motion/attachment-upload";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";
import { CommandPalette } from "@/components/motion/command-palette";
import { Drawer } from "@/components/motion/drawer";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { MorphingSearch } from "@/components/motion/morphing-search";
import { ProjectFolder } from "@/components/motion/project-folder";
import { TableMenu } from "@/components/motion/table/table-menu";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

// One defect, every overlay in the library. A `position: fixed` element that is
// transparent and spans the viewport edges makes iOS 26 Safari snapshot the page
// and read the pixels back from the GPU process on every committed frame, to
// pick the colour for the browser chrome. That read is synchronous.
//
// WebKit asks for the colour only when all of these hold, so breaking any one
// of them removes the cost. The helper below states them as one rule, so the
// test says what is true rather than which class happens to buy it.
//
// What a green sweep does and does not prove:
//
// - The rule is transcribed from WebKit's LocalFrameView.cpp. WebKit moves and
//   the transcription can drift with it, so the sweep confirms the model, never
//   the engine.
// - The predicate reads Tailwind class shapes, not computed styles — happy-dom
//   computes none — so it only sees the class vocabulary this codebase writes.
//   It is blind to geometry spelled as arbitrary properties
//   (`[position:fixed]`, `inset-[0px]`), to anything coming from a CSS file or
//   a `style` prop, and to an `absolute inset-0` child of a fixed edge-spanning
//   parent, which is the same layer geometrically but carries none of the
//   classes that say so (modelling that needs the ancestor chain, and a
//   per-element class check has none). Arbitrary *colours* are read:
//   `bg-[#fff]` paints, `bg-[transparent]` does not.
// - Only a literal zero alpha counts as no colour. WebKit actually skips
//   anything below `nearlyTransparentAlphaThreshold`, but the exact value is an
//   internal, and a scrim tuned just above zero is a bug this test should flag
//   rather than excuse.

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

/** Whether one class is a `bg-*` utility that paints a colour WebKit can read. */
function paintsBackground(cls: string): boolean {
  if (!cls.startsWith("bg-")) return false;
  const utility = cls.slice("bg-".length);

  // `exec`, not `match`: its result types `index` as a number, so trimming the
  // modifier off the base cannot silently fall back to the whole utility.
  const modifier = OPACITY_MODIFIER.exec(utility);
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

// Utilities that size a box to the viewport on one axis. `h-full`/`w-full` are
// deliberately absent: they are 100% of the containing block, which is the
// viewport only while no ancestor establishes another one, so they say nothing
// about coverage on their own.
const VIEWPORT_HEIGHT = ["h-screen", "h-dvh", "h-lvh", "h-svh"];
const VIEWPORT_WIDTH = ["w-screen", "w-dvw", "w-lvw", "w-svw"];

/**
 * Whether a fixed box covers the viewport, however that shape is spelled:
 * `inset-0`, `inset-x-0 inset-y-0`, all four of `top/right/bottom/left-0`, or a
 * viewport-sized dimension pinned to the corner (`h-dvh w-screen top-0 left-0`).
 *
 * Both axes have to span for real. Being at the corner is not coverage, so the
 * library's zero-size grouping anchors (`fixed left-0 top-0 size-0`) are not
 * layers, and neither is a bar pinned across one axis (`fixed inset-x-0 top-0`).
 */
function spansViewport(el: HTMLElement): boolean {
  const has = (cls: string) => el.classList.contains(cls);
  if (!has("fixed")) return false;

  // An explicit zero size beats the insets that pin it, so a corner anchor
  // stays a point no matter how it is pinned.
  const spansX =
    !has("size-0") &&
    !has("w-0") &&
    (has("inset-0") ||
      has("inset-x-0") ||
      (has("left-0") &&
        (has("right-0") || VIEWPORT_WIDTH.some((cls) => has(cls)))));
  const spansY =
    !has("size-0") &&
    !has("h-0") &&
    (has("inset-0") ||
      has("inset-y-0") ||
      (has("top-0") &&
        (has("bottom-0") || VIEWPORT_HEIGHT.some((cls) => has(cls)))));

  return spansX && spansY;
}

/** Elements that would make WebKit sample the page for its edge colours. */
function samplingLayers(root: ParentNode): HTMLElement[] {
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
      spansViewport(el) &&
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

  test("flags the shapes that spell full coverage without `inset-0`", () => {
    const axes = fixture("fixed inset-x-0 inset-y-0", { children: 1 });
    const sides = fixture("fixed top-0 right-0 bottom-0 left-0", { children: 1 });
    const sized = fixture("fixed h-dvh w-screen top-0 left-0", { children: 1 });

    expect(samplingLayers(document.body)).toEqual([axes, sides, sized]);
  });

  test("skips a corner anchor, which is pinned but covers nothing", () => {
    // The library's grouping anchors: `fixed` so their children resolve against
    // the viewport, sized to nothing so they are under it on every side.
    fixture("fixed left-0 top-0 size-0", { children: 1 });
    fixture("fixed left-0 top-0 z-50 size-0", { children: 2 });
    // An explicit zero size beats the insets that would otherwise span.
    fixture("fixed inset-0 size-0", { children: 1 });
    fixture("fixed inset-0 w-0", { children: 1 });
    fixture("fixed inset-0 h-0", { children: 1 });

    expect(samplingLayers(document.body)).toEqual([]);
  });

  test("skips a bar that spans one axis only", () => {
    fixture("fixed inset-x-0 top-0 z-40", { children: 1 });
    fixture("fixed inset-y-0 w-80", { children: 1 });
    fixture("fixed inset-y-0 flex h-dvh w-(--sidebar-width-mobile)", {
      children: 1,
    });

    expect(samplingLayers(document.body)).toEqual([]);
  });

  test("does not read `h-full`/`w-full` as viewport coverage", () => {
    // Both are 100% of the containing block, which is the viewport only while
    // no ancestor establishes another one — not enough to call it a span.
    fixture("fixed top-0 left-0 h-full w-full", { children: 1 });

    expect(samplingLayers(document.body)).toEqual([]);
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

/** Render this case with a mobile viewport, the way the sidebar sheet needs. */
function withMobileViewport<T>(render: () => T): T {
  window.matchMedia = (query: string) =>
    ({
      matches:
        query.includes("prefers-reduced-motion") || query.includes("max-width"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
  return render();
}

const IMAGE_ITEM = {
  id: "shot",
  name: "screenshot.png",
  kind: "image" as const,
  previewUrl: "blob:preview",
  status: "complete" as const,
};

// Every overlay in the library that puts a `position: fixed` layer over the
// page, in the state that layer exists in. Render thunks (not bare JSX) keep
// these out of an iterable literal; the optional third entry drives a case that
// only reaches its overlay through an interaction. Add a row here when you ship
// an overlay, and a row for its closed state too when it stays mounted.
const cases: Array<
  [name: string, render: () => ReactElement, open?: (view: RenderResult) => void]
> = [
  ["CommandPalette closed", () => <CommandPalette items={[]} />],
  ["CommandPalette open", () => <CommandPalette items={[]} open />],
  [
    "CenterMorphModal open",
    () => (
      <CenterMorphModal>
        <CenterMorphModalTrigger>
          <button type="button">Open profile</button>
        </CenterMorphModalTrigger>
        <CenterMorphModalContent ariaLabel="Profile">
          <p>Profile content</p>
        </CenterMorphModalContent>
      </CenterMorphModal>
    ),
    ({ getByRole }) => fireEvent.click(getByRole("button", { name: "Open profile" })),
  ],
  [
    "TableMenu open",
    () => (
      <TableMenu
        ariaLabel="Row actions"
        trigger={<span>Actions</span>}
        items={[{ label: "Delete", onSelect: () => {} }]}
      />
    ),
    ({ getByRole }) => fireEvent.click(getByRole("button", { name: "Row actions" })),
  ],
  [
    "MorphingModal closed",
    () => (
      <MorphingModal viewId={null} onClose={() => {}}>
        <p>Wallet options</p>
      </MorphingModal>
    ),
  ],
  [
    "MorphingModal open",
    () => (
      <MorphingModal viewId="options" onClose={() => {}}>
        <p>Wallet options</p>
      </MorphingModal>
    ),
  ],
  [
    "BottomSheet open",
    () => (
      <BottomSheet open onOpenChange={() => {}} title="Quick actions">
        <p>Sheet body</p>
      </BottomSheet>
    ),
  ],
  [
    "Drawer open",
    () => (
      <Drawer open onOpenChange={() => {}} ariaLabel="Demo drawer">
        <p>Drawer body</p>
      </Drawer>
    ),
  ],
  [
    "MorphingSearch closed",
    () => <MorphingSearch items={[{ id: "one", title: "Alpha" }]} />,
  ],
  [
    "MorphingSearch open",
    () => <MorphingSearch items={[{ id: "one", title: "Alpha" }]} defaultOpen />,
  ],
  [
    "AnimatedSidebar mobile closed",
    () =>
      withMobileViewport(() => (
        <AnimatedSidebarProvider>
          <AnimatedSidebar ariaLabel="Workspace navigation">
            <AnimatedSidebarContent>
              <button type="button">Overview</button>
            </AnimatedSidebarContent>
          </AnimatedSidebar>
        </AnimatedSidebarProvider>
      )),
  ],
  [
    "AnimatedSidebar mobile open",
    () =>
      withMobileViewport(() => (
        <AnimatedSidebarProvider defaultOpenMobile>
          <AnimatedSidebar ariaLabel="Workspace navigation">
            <AnimatedSidebarContent>
              <button type="button">Overview</button>
            </AnimatedSidebarContent>
          </AnimatedSidebar>
        </AnimatedSidebarProvider>
      )),
  ],
  [
    "ProjectFolder overlay open",
    () => <ProjectFolder title="Brand assets" count={3} defaultOpen defaultExpanded />,
  ],
  [
    "AttachmentUpload image preview open",
    () => <AttachmentUpload defaultValue={[IMAGE_ITEM]} />,
    ({ getByRole }) =>
      fireEvent.click(getByRole("button", { name: "Preview screenshot.png" })),
  ],
];

describe("fixed full-viewport overlays", () => {
  for (const [name, renderCase, openCase] of cases) {
    test(`${name} leaves no sampling layer`, () => {
      const view = render(renderCase());
      openCase?.(view);

      expect(classesOf(samplingLayers(document.body))).toEqual([]);
    });
  }
});

describe("overlay show and hide", () => {
  test("the closed command palette leaves no chrome behind", () => {
    const { queryByRole } = render(<CommandPalette items={[]} />);

    // Nothing to hide, because nothing is mounted: no dialog, no backdrop, and
    // so no fixed layer for WebKit to sample the page behind.
    expect(queryByRole("dialog", { hidden: true })).toBeNull();
    expect(
      queryByRole("button", { name: "Close command palette", hidden: true }),
    ).toBeNull();
    expect(samplingLayers(document.body)).toEqual([]);
  });

  test("the opening command palette focuses its search input", async () => {
    const { getByRole } = render(<CommandPalette items={[]} open />);

    // The overlay only exists while open, so there is no visibility machinery
    // for the focus to race: the input is in the document from the same commit
    // that opened the palette, and focus() on it always lands.
    expect(getByRole("dialog").className).not.toContain("invisible");

    // The focus runs from a requestAnimationFrame callback, so let one frame pass.
    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(document.activeElement).toBe(getByRole("combobox"));
  });

  test("the uncontrolled command palette opens on its shortcut and focuses", async () => {
    const { getByRole, queryByRole } = render(<CommandPalette items={[]} />);

    act(() => {
      fireEvent.keyDown(window, { key: "k", metaKey: true });
    });
    expect(queryByRole("dialog")).not.toBeNull();

    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(document.activeElement).toBe(getByRole("combobox"));
  });

  test("the mobile sidebar sheet is visible the moment it opens", () => {
    const { getByRole, rerender } = render(
      withMobileViewport(() => (
        <AnimatedSidebarProvider openMobile={false}>
          <AnimatedSidebar ariaLabel="Workspace navigation">
            <AnimatedSidebarContent>
              <button type="button">Overview</button>
            </AnimatedSidebarContent>
          </AnimatedSidebar>
        </AnimatedSidebarProvider>
      )),
    );

    // A closed sheet is `aria-hidden`, which leaves it without a name to query.
    const sheet = getByRole("dialog", { hidden: true })
      .parentElement as HTMLElement;
    expect(sheet.className).toContain("invisible");

    rerender(
      <AnimatedSidebarProvider openMobile>
        <AnimatedSidebar ariaLabel="Workspace navigation">
          <AnimatedSidebarContent>
            <button type="button">Overview</button>
          </AnimatedSidebarContent>
        </AnimatedSidebar>
      </AnimatedSidebarProvider>,
    );

    // Shown in the same commit that starts the slide: the sheet focuses its
    // first control from a rAF callback right after, and focus() on a hidden
    // element is ignored.
    expect(sheet.className).toContain("visible");
    expect(sheet.className).not.toContain("invisible");
  });

  test("the closing mobile sidebar sheet stays visible through its exit", async () => {
    const { getByRole, rerender } = render(
      withMobileViewport(() => (
        <AnimatedSidebarProvider openMobile>
          <AnimatedSidebar ariaLabel="Workspace navigation">
            <AnimatedSidebarContent>
              <button type="button">Overview</button>
            </AnimatedSidebarContent>
          </AnimatedSidebar>
        </AnimatedSidebarProvider>
      )),
    );

    const sheet = getByRole("dialog", { name: "Workspace navigation" })
      .parentElement as HTMLElement;

    rerender(
      <AnimatedSidebarProvider openMobile={false}>
        <AnimatedSidebar ariaLabel="Workspace navigation">
          <AnimatedSidebarContent>
            <button type="button">Overview</button>
          </AnimatedSidebarContent>
        </AnimatedSidebar>
      </AnimatedSidebarProvider>,
    );

    // Hiding waits for the panel's own exit to finish rather than a duration
    // copied from the transition, so the slide and the backdrop fade are never
    // cut off mid-animation.
    expect(sheet.className).toContain("visible");
    expect(sheet.className).not.toContain("invisible");

    // And it does hide, once the slide settles — the sheet stays mounted for
    // the life of the mobile viewport, so it cannot stay a live layer.
    await waitFor(() => expect(sheet.className).toContain("invisible"));
  });

  test("the opening mobile sidebar sheet focuses its first control", async () => {
    const { getByRole } = render(
      withMobileViewport(() => (
        <AnimatedSidebarProvider defaultOpenMobile>
          <AnimatedSidebar ariaLabel="Workspace navigation">
            <AnimatedSidebarContent>
              <button type="button">Overview</button>
            </AnimatedSidebarContent>
          </AnimatedSidebar>
        </AnimatedSidebarProvider>
      )),
    );

    await act(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => resolve());
        }),
    );

    expect(document.activeElement).toBe(
      getByRole("button", { name: "Overview" }),
    );
  });
});

describe("overlay shapes", () => {
  test("the center morph modal keeps the colour on the edge-spanning layer", () => {
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
  });
});
