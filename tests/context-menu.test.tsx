import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { axe } from "jest-axe";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
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

describe("ContextMenu", () => {
  test("opens at the pointer and selects an item", async () => {
    const onOpen = mock(() => {});
    const { getByRole } = render(<ExampleMenu onOpen={onOpen} />);

    const trigger = getByRole("button", { name: "Launch plan" });
    fireEvent.contextMenu(trigger, {
      clientX: 80,
      clientY: 64,
    });

    const menu = await waitFor(() => getByRole("menu"));
    expect(menu.closest("[data-context-menu-portal]")?.parentElement).toBe(
      document.body,
    );

    fireEvent.click(getByRole("menuitem", { name: "Open" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  test("supports keyboard invocation and roving focus", async () => {
    const onRename = mock(() => {});
    const trigger = render(<ExampleMenu onRename={onRename} />).getByRole(
      "button",
      { name: "Launch plan" },
    );

    trigger.focus();
    fireEvent.keyDown(trigger, { key: "F10", shiftKey: true });

    await waitFor(() =>
      expect(document.activeElement?.textContent).toContain("Open"),
    );
    const openItem = document.activeElement as HTMLButtonElement;
    expect(openItem.textContent).toContain("Open");

    fireEvent.keyDown(openItem, { key: "ArrowDown" });
    expect(document.activeElement?.textContent).toContain("Rename");

    fireEvent.click(document.activeElement as Element);
    expect(onRename).toHaveBeenCalledTimes(1);
  });

  test("updates checkbox items without forcing the menu closed", async () => {
    const onCheckedChange = mock(() => {});
    const { getByRole } = render(
      <ContextMenu>
        <ContextMenuTrigger>
          <button type="button">Options</button>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuCheckboxItem
            checked={false}
            closeOnSelect={false}
            onCheckedChange={onCheckedChange}
          >
            Show hidden files
          </ContextMenuCheckboxItem>
        </ContextMenuContent>
      </ContextMenu>,
    );

    fireEvent.contextMenu(getByRole("button", { name: "Options" }));
    const checkbox = await waitFor(() =>
      getByRole("menuitemcheckbox", { name: "Show hidden files" }),
    );
    fireEvent.click(checkbox);

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(getByRole("menu")).toBeTruthy();
  });

  test("keeps reopening after repeated dismissals", async () => {
    const { getByRole } = render(<ExampleMenu />);
    const trigger = getByRole("button", { name: "Launch plan" });

    for (let invocation = 1; invocation <= 8; invocation++) {
      fireEvent.contextMenu(trigger, {
        clientX: 40 + invocation,
        clientY: 50 + invocation,
      });
      const menu = getByRole("menu");
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
      expect(menu.dataset.invocation).toBe(String(invocation));

      fireEvent.pointerDown(document.body);
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
    }

    fireEvent.contextMenu(trigger, { clientX: 72, clientY: 84 });
    expect(getByRole("menu")).toBeTruthy();
  });

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
