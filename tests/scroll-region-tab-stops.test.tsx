import { afterAll, afterEach, beforeAll, describe, expect, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { type ReactElement, useRef } from "react";

import { AgentActivity } from "@/components/agents/agent-activity";
import { CodeBlock } from "@/components/agents/code-block";
import { MessageScroller } from "@/components/agents/message-scroller";
import { InstallCommand } from "@/components/app/docs/install-command";
import { InfiniteMasonry } from "@/components/motion/infinite-masonry";
import { PullToRefresh } from "@/components/motion/pull-to-refresh";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Table, type TableColumn } from "@/components/motion/table";
import { ParallaxPreview } from "@/components/previews/motion/parallax.preview";
import { ScrollProgressPreview } from "@/components/previews/motion/scroll-progress.preview";
import { ScrollRevealPreview } from "@/components/previews/motion/scroll-reveal.preview";
import {
  needsScrollRegionTabStop,
  useScrollRegionTabStop,
} from "@/lib/hooks/use-scroll-region-tab-stop";

/**
 * The test DOM has no Tailwind build, so the overflow utilities these
 * components use are declared here with Tailwind's own definitions — as
 * longhands, because the test DOM does not expand the `overflow` shorthand.
 * `getComputedStyle` then reads a real overflow value; nothing below infers
 * one from a class name.
 */
const OVERFLOW_UTILITIES = `
  .overflow-auto { overflow-x: auto; overflow-y: auto; }
  .overflow-hidden { overflow-x: hidden; overflow-y: hidden; }
  .overflow-x-auto { overflow-x: auto; }
  .overflow-y-auto { overflow-y: auto; }
  .overflow-y-hidden { overflow-y: hidden; }
`;

let utilities: HTMLStyleElement;
beforeAll(() => {
  utilities = document.createElement("style");
  utilities.textContent = OVERFLOW_UTILITIES;
  document.head.appendChild(utilities);
});
afterAll(() => utilities.remove());
afterEach(cleanup);

const BOX_METRICS = [
  "scrollHeight",
  "clientHeight",
  "scrollWidth",
  "clientWidth",
  "offsetHeight",
] as const;

/**
 * The test DOM measures every box at zero. While this is installed, every box
 * reports content four times its own size — so every element whose computed
 * overflow scrolls is a box the user can scroll — and `offsetHeight` reports
 * `contentHeight`, which components that cap against measured content read.
 */
function stubLayout(contentHeight = 320) {
  const values: Record<(typeof BOX_METRICS)[number], number> = {
    scrollHeight: 400,
    clientHeight: 100,
    scrollWidth: 400,
    clientWidth: 100,
    offsetHeight: contentHeight,
  };
  for (const key of BOX_METRICS) {
    Object.defineProperty(HTMLElement.prototype, key, {
      configurable: true,
      get: () => values[key],
    });
  }
  return () => {
    // Deleting the shadowing property restores the test DOM's own getter.
    for (const key of BOX_METRICS) {
      Reflect.deleteProperty(HTMLElement.prototype, key);
    }
  };
}

// The hook checks from a requestAnimationFrame callback; let two frames run so
// a check scheduled by the first one's re-render lands too.
async function frames() {
  for (let i = 0; i < 2; i += 1) {
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  }
}

async function renderLaidOut(ui: ReactElement, overflowing: boolean) {
  const restore = overflowing ? stubLayout() : () => {};
  try {
    const result = render(ui);
    await frames();
    return result;
  } finally {
    restore();
  }
}

/** Elements whose computed overflow scrolls on either axis. */
function scrollers(root: HTMLElement) {
  return [root, ...root.querySelectorAll<HTMLElement>("*")].filter((element) => {
    const style = getComputedStyle(element);
    return (
      /^(auto|scroll)$/.test(style.overflowX) ||
      /^(auto|scroll)$/.test(style.overflowY)
    );
  });
}

function box(className: string, html = "") {
  const element = document.createElement("div");
  element.className = className;
  element.innerHTML = html;
  document.body.appendChild(element);
  return element;
}

describe("needsScrollRegionTabStop", () => {
  let restore = () => {};
  afterEach(() => {
    restore();
    restore = () => {};
    for (const element of document.body.querySelectorAll("div")) {
      element.remove();
    }
  });

  test("a box that scrolls vertically with nothing focusable needs one", () => {
    restore = stubLayout();
    expect(
      needsScrollRegionTabStop(box("overflow-y-auto", "<p>Text</p>")),
    ).toBe(true);
  });

  test("a box that scrolls horizontally needs one", () => {
    restore = stubLayout();
    expect(
      needsScrollRegionTabStop(box("overflow-x-auto", "<p>Text</p>")),
    ).toBe(true);
  });

  test("overflowing content in a box that does not scroll needs none", () => {
    restore = stubLayout();
    expect(
      needsScrollRegionTabStop(box("overflow-hidden", "<p>Text</p>")),
    ).toBe(false);
    expect(needsScrollRegionTabStop(box("", "<p>Text</p>"))).toBe(false);
  });

  test("a scrolling box whose content fits needs none", () => {
    expect(needsScrollRegionTabStop(box("overflow-auto", "<p>Text</p>"))).toBe(
      false,
    );
  });

  test("a box that holds focusable content needs none", () => {
    restore = stubLayout();
    for (const html of [
      '<a href="#x">Link</a>',
      "<button>Button</button>",
      "<input>",
      "<select></select>",
      "<textarea></textarea>",
      '<span tabindex="0">Stop</span>',
    ]) {
      expect(needsScrollRegionTabStop(box("overflow-auto", html))).toBe(false);
    }
  });

  test("content that only looks focusable does not count", () => {
    restore = stubLayout();
    for (const html of [
      "<a>No href</a>",
      "<button disabled>Disabled</button>",
      '<span tabindex="-1">Programmatic only</span>',
    ]) {
      expect(needsScrollRegionTabStop(box("overflow-auto", html))).toBe(true);
    }
  });
});

describe("useScrollRegionTabStop", () => {
  function Region({
    enabled = true,
    withButton = false,
  }: {
    enabled?: boolean;
    withButton?: boolean;
  }) {
    const ref = useRef<HTMLDivElement>(null);
    const tabStop = useScrollRegionTabStop(ref, enabled);
    return (
      <div
        ref={ref}
        data-testid="region"
        tabIndex={tabStop}
        className="overflow-auto"
      >
        <p>Text</p>
        {withButton ? <button type="button">Action</button> : null}
      </div>
    );
  }

  test("adds the stop, and drops it when focusable content arrives", async () => {
    const restore = stubLayout();
    try {
      const { getByTestId, rerender } = render(<Region />);
      await frames();
      expect(getByTestId("region").getAttribute("tabindex")).toBe("0");

      rerender(<Region withButton />);
      await frames();
      expect(getByTestId("region").getAttribute("tabindex")).toBeNull();
    } finally {
      restore();
    }
  });

  test("adds none while disabled", async () => {
    const { getByTestId } = await renderLaidOut(
      <Region enabled={false} />,
      true,
    );
    expect(getByTestId("region").getAttribute("tabindex")).toBeNull();
  });
});

const CODE = Array.from({ length: 40 }, (_, i) => `const line${i} = ${i};`).join(
  "\n",
);

type Row = { id: string; name: string; role: string };

const ROWS: Row[] = [
  { id: "r1", name: "Ava Cole", role: "Owner" },
  { id: "r2", name: "Ben Diaz", role: "Editor" },
];

const COLUMNS: TableColumn<Row>[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
];

const MASONRY_ITEMS = Array.from({ length: 6 }, (_, i) => ({ id: `card-${i}` }));

/** A case may narrow the search to one region when the tree holds several. */
type Case = [
  name: string,
  render: () => ReactElement,
  scope?: (container: HTMLElement) => HTMLElement,
];

const cases: Case[] = [
  ["CodeBlock viewport", () => <CodeBlock code={CODE} filename="demo.ts" />],
  [
    "Table body",
    () => <Table data={ROWS} columns={COLUMNS} getRowId={(row) => row.id} />,
  ],
  [
    "InfiniteMasonry",
    () => (
      <InfiniteMasonry
        items={MASONRY_ITEMS}
        getItemKey={(item) => item.id}
        renderItem={(item) => <div>{item.id}</div>}
        onLoadMore={() => {}}
        hasMore={false}
        ariaLabel="Gallery"
      />
    ),
  ],
  [
    "PullToRefresh",
    () => (
      <PullToRefresh onRefresh={() => {}}>
        <p>Refreshable content.</p>
      </PullToRefresh>
    ),
  ],
  [
    "MessageScroller",
    () => (
      <MessageScroller>
        <p>A streamed answer.</p>
      </MessageScroller>
    ),
  ],
  [
    "docs install command",
    () => <InstallCommand slug="button" />,
    // The package-manager tab row above the command scrolls too, but holds
    // its tab buttons; scope to the command line.
    (container) =>
      container.querySelector<HTMLElement>("[class~='font-mono']")
        ?.parentElement as HTMLElement,
  ],
];

describe("scroll region tab stops", () => {
  for (const [name, renderCase, scope] of cases) {
    test(`${name} takes a tab stop while it overflows`, async () => {
      const { container } = await renderLaidOut(renderCase(), true);
      const regions = scrollers(scope ? scope(container) : container);

      expect(regions.length).toBeGreaterThan(0);
      expect(regions.map((r) => r.getAttribute("tabindex"))).toEqual(
        regions.map(() => "0"),
      );
    });

    test(`${name} takes none while its content fits`, async () => {
      const { container } = await renderLaidOut(renderCase(), false);
      const regions = scrollers(scope ? scope(container) : container);

      expect(regions.length).toBeGreaterThan(0);
      expect(regions.map((r) => r.getAttribute("tabindex"))).toEqual(
        regions.map(() => null),
      );
    });
  }

  test("a table with row checkboxes takes none: Tab already reaches it", async () => {
    const { container } = await renderLaidOut(
      <Table
        data={ROWS}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        selectable
      />,
      true,
    );
    const regions = scrollers(container);

    expect(regions.length).toBeGreaterThan(0);
    expect(regions.map((r) => r.getAttribute("tabindex"))).toEqual(
      regions.map(() => null),
    );
  });

  // The demos scroll a fixed column of text, so they carry a fixed stop.
  for (const [name, Preview] of [
    ["Parallax preview", ParallaxPreview],
    ["ScrollReveal preview", ScrollRevealPreview],
    ["ScrollProgress preview", ScrollProgressPreview],
  ] as const) {
    test(`${name} is reachable from the keyboard`, () => {
      const { container } = render(<Preview />);
      const regions = scrollers(container);

      expect(regions.length).toBeGreaterThan(0);
      expect(regions.map((r) => r.getAttribute("tabindex"))).toEqual(
        regions.map(() => "0"),
      );
    });
  }
});

describe("AgentActivity viewport", () => {
  const ITEMS = Array.from({ length: 8 }, (_, i) => ({
    id: `step-${i}`,
    type: "step" as const,
    label: `Step ${i + 1}`,
  }));

  // The viewport scrolls only while its content is capped, expanded and no
  // longer streaming; otherwise it clips with overflow hidden.
  const viewportOf = (container: HTMLElement) => {
    const viewport =
      container.querySelector<HTMLElement>("[role='list']")?.parentElement;
    if (!viewport) throw new Error("AgentActivity viewport not rendered");
    return viewport;
  };

  test("takes a tab stop once capped content is expanded", async () => {
    const { container } = await renderLaidOut(
      <AgentActivity
        status="complete"
        duration={4}
        defaultOpen
        items={ITEMS}
      />,
      true,
    );
    expect(viewportOf(container).getAttribute("tabindex")).toBe("0");
  });

  test("takes none while collapsed", async () => {
    const { container } = await renderLaidOut(
      <AgentActivity status="complete" duration={4} items={ITEMS} />,
      true,
    );
    expect(viewportOf(container).getAttribute("tabindex")).toBeNull();
  });

  test("takes none while the agent is still working", async () => {
    const { container } = await renderLaidOut(
      <AgentActivity status="working" items={ITEMS} />,
      true,
    );
    expect(viewportOf(container).getAttribute("tabindex")).toBeNull();
  });
});

/**
 * The shared setup answers every media query as reduced motion, which is the
 * branch SmoothScroll renders a plain div from. Undoing it for one render is
 * what puts the Lenis wrapper — a different element — in the tree.
 */
async function withoutReducedMotion<T>(run: () => Promise<T>): Promise<T> {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList) as typeof window.matchMedia;
  try {
    return await run();
  } finally {
    window.matchMedia = original;
  }
}

describe("SmoothScroll", () => {
  const contained = (
    <SmoothScroll root={false} className="h-64 overflow-y-auto">
      <p>Contained content.</p>
    </SmoothScroll>
  );
  const page = (
    <SmoothScroll>
      <p>Page content.</p>
    </SmoothScroll>
  );

  test("a contained reduced-motion scroller takes a tab stop", async () => {
    const { container } = await renderLaidOut(contained, true);
    expect(container.firstElementChild?.getAttribute("tabindex")).toBe("0");
  });

  test("the reduced-motion page root takes none", async () => {
    const { container } = await renderLaidOut(page, true);
    expect(container.firstElementChild?.getAttribute("tabindex")).toBeNull();
  });

  test("a contained Lenis scroller takes a tab stop", async () => {
    const { container } = await withoutReducedMotion(() =>
      renderLaidOut(contained, true),
    );
    expect(container.firstElementChild?.getAttribute("tabindex")).toBe("0");
  });

  test("the Lenis page root takes none", async () => {
    const { container } = await withoutReducedMotion(() =>
      renderLaidOut(page, true),
    );
    expect(container.firstElementChild?.getAttribute("tabindex")).toBeNull();
  });
});
