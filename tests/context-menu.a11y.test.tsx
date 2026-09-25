import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/motion/context-menu";

afterEach(cleanup);

function ExampleMenu({
  onOpen = () => {},
  onRename = () => {},
}: {
  onOpen?: () => void;
  onRename?: () => void;
}) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <button type="button">Launch plan</button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem textValue="Open" onSelect={onOpen}>
          Open
        </ContextMenuItem>
        <ContextMenuItem textValue="Rename" onSelect={onRename}>
          Rename
        </ContextMenuItem>
        <ContextMenuItem disabled textValue="Archive">
          Archive
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

describe("context-menu accessibility", () => {
  test("has no accessibility violations while open", async () => {
    const { getByRole } = render(<ExampleMenu />);
    fireEvent.contextMenu(getByRole("button", { name: "Launch plan" }));
    const menu = await waitFor(() => {
      const openMenu = getByRole("menu");
      expect(openMenu.dataset.morphReady).toBe("true");
      return openMenu;
    });

    const results = await axe(menu);
    expect(results.violations).toEqual([]);
  });
});
