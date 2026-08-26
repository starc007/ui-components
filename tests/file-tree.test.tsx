import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/motion/file-tree";

afterEach(cleanup);

const tree = (
  <>
    <FileTreeFolder value="src" name="src">
      <FileTreeFile value="index" name="index.ts" />
    </FileTreeFolder>
    <FileTreeFile value="readme" name="README.md" />
  </>
);

test("ships a tabbable tree item in the first render", () => {
  const markup = renderToString(<FileTree>{tree}</FileTree>);
  expect(markup).toContain('role="tree"');
  expect(markup).toMatch(/role="treeitem"[^>]*tabindex="0"/);
});

test("opens folders and navigates the visible tree with arrow keys", async () => {
  const { findByRole, getByRole } = render(<FileTree>{tree}</FileTree>);
  const folder = getByRole("treeitem", { name: "src" });

  fireEvent.keyDown(folder, { key: "ArrowRight" });
  expect(folder.getAttribute("aria-expanded")).toBe("true");
  await findByRole("treeitem", { name: "index.ts" });

  fireEvent.keyDown(getByRole("treeitem", { name: "src" }), {
    key: "ArrowRight",
  });
  await waitFor(() => {
    expect(document.activeElement).toBe(
      getByRole("treeitem", { name: "index.ts" }),
    );
  });
});

test("reports controlled expansion and selection changes", () => {
  const expanded: string[][] = [];
  const selected: string[] = [];
  const { getByRole } = render(
    <FileTree
      expandedIds={[]}
      value={null}
      onExpandedChange={(ids) => expanded.push(ids)}
      onValueChange={(id) => selected.push(id)}
    >
      {tree}
    </FileTree>,
  );

  fireEvent.click(getByRole("treeitem", { name: "src" }));
  expect(expanded).toEqual([["src"]]);
  expect(selected).toEqual(["src"]);
});

test("uses one shared hover surface instead of a persistent selection", () => {
  const { container, getByRole } = render(
    <FileTree defaultValue="readme">{tree}</FileTree>,
  );

  expect(container.querySelector('[class*="bg-muted/70"]')).toBeNull();

  fireEvent.mouseEnter(getByRole("treeitem", { name: "README.md" }));
  expect(container.querySelectorAll('[class*="bg-muted/70"]')).toHaveLength(1);

  fireEvent.mouseEnter(getByRole("treeitem", { name: "src" }));
  expect(container.querySelectorAll('[class*="bg-muted/70"]')).toHaveLength(1);
});
