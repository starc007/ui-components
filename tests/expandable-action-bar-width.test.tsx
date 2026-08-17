import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "@/components/motion/expandable-action-bar";

// Labelled actions are wider than the space a phone gives the bar, so the
// expanded pill has to stop at its container and scroll its rail instead of
// running off the edge with the last actions unreachable. happy-dom lays
// nothing out, so the assertion is on what produces the clamp rather than on
// the box it produces: the pill bounded by its container, a rail that scrolls
// inside it, and actions that hold their size instead of being squeezed to
// fit. Measured on an iPhone at 402pt with six labelled actions, those three
// give a 370px pill over a 554px rail; dropping any one of them puts Alerts
// and Settings past the viewport with nothing to scroll.
const ITEMS: ExpandableActionBarItem[] = [
  { id: "send", label: "Send", icon: <span>S</span> },
  { id: "copy", label: "Copy", icon: <span>C</span> },
  { id: "export", label: "Export", icon: <span>E</span> },
  { id: "archive", label: "Archive", icon: <span>A</span> },
  { id: "alerts", label: "Alerts", icon: <span>B</span> },
  { id: "settings", label: "Settings", icon: <span>G</span> },
];

function parts(container: HTMLElement) {
  const actions = Array.from(container.querySelectorAll("button[title]"));
  const track = actions[0]?.parentElement;
  return { actions, track, root: track?.parentElement };
}

afterEach(cleanup);

describe("ExpandableActionBar expanded width", () => {
  test("the expanded pill is bounded by its container and scrolls its rail", () => {
    const { container } = render(
      <ExpandableActionBar items={ITEMS} expanded onExpandedChange={() => {}} />,
    );
    const { track, root } = parts(container);

    expect(root?.className).toContain("max-w-full");
    expect(track?.className).toContain("max-w-full");
    expect(track?.className).toContain("overflow-x-auto");
  });

  test("actions keep their labelled width instead of shrinking to fit", () => {
    const { container } = render(
      <ExpandableActionBar items={ITEMS} expanded onExpandedChange={() => {}} />,
    );
    const { actions } = parts(container);

    expect(actions).toHaveLength(ITEMS.length);
    for (const action of actions) {
      expect(action.className).toContain("shrink-0");
    }
  });

  test("a caller's track class cannot be the thing that drops the clamp", () => {
    const { container } = render(
      <ExpandableActionBar
        items={ITEMS}
        expanded
        onExpandedChange={() => {}}
        classNames={{ root: "mx-auto", track: "bg-transparent" }}
      />,
    );
    const { track, root } = parts(container);

    expect(root?.className).toContain("max-w-full");
    expect(track?.className).toContain("max-w-full");
    expect(track?.className).toContain("overflow-x-auto");
  });
});
