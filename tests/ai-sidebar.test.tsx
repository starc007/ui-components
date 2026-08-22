import { afterEach, expect, test } from "bun:test";
import { cleanup } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  AISidebar,
  type SidebarResource,
} from "@/components/agents/ai-sidebar";

afterEach(cleanup);

const ITEMS: SidebarResource[] = [
  {
    id: "docs",
    label: "Docs",
    kind: "folder",
    children: [
      { id: "readme", label: "Readme", kind: "file" },
      { id: "guide", label: "Guide", kind: "file" },
    ],
  },
  { id: "notes", label: "Notes", kind: "file" },
];

const tabIndexes = (markup: string) =>
  Array.from(markup.matchAll(/role="treeitem"[^>]*?tabindex="(-?\d+)"/g)).map(
    (match) => match[1],
  );

test("has a tabbable row in the markup of the very first render", () => {
  // The roving tabindex is resolved during render, not in an effect. An effect
  // lands after the browser paints, so a server-rendered page would ship
  // markup in which every row is tabindex="-1" and the whole tree is skipped
  // by Tab until hydration.
  const markup = renderToString(<AISidebar defaultItems={ITEMS} />);
  const indexes = tabIndexes(markup);

  expect(indexes.length).toBeGreaterThan(0);
  expect(indexes).toContain("0");
});
