import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/motion/dropdown-menu";
import { DropdownMenuPreview } from "@/components/previews/motion/dropdown-menu.preview";

afterEach(cleanup);

function Menu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button type="button">Actions</button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Rename</DropdownMenuItem>
        <DropdownMenuCheckboxItem checked>Pinned</DropdownMenuCheckboxItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Move to</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

test("closed dropdown menu exposes a collapsed menu button", async () => {
  const { container, getByRole, queryByRole } = render(<Menu />);
  const trigger = getByRole("button", { name: "Actions" });
  expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(queryByRole("menu")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("open dropdown menu is labelled by its trigger and its submenu opens from the keyboard", async () => {
  const { getByRole } = render(<Menu />);
  const trigger = getByRole("button", { name: "Actions" });
  act(() => {
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
  });

  const menu = getByRole("menu", { name: "Actions" });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("menuitemcheckbox", { name: "Pinned" }).getAttribute("aria-checked")).toBe("true");
  expect(getByRole("menuitem", { name: "Delete" }).getAttribute("aria-disabled")).toBe("true");

  const subTrigger = getByRole("menuitem", { name: "Move to" });
  act(() => {
    subTrigger.focus();
    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
  });
  expect(subTrigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("menu", { name: "Move to" })).toBeTruthy();
  expect(menu).toBeTruthy();
  const results = await axe(document.body, {
    // The menus portal to the body; pages provide the landmark around them.
    rules: { region: { enabled: false } },
  });
  expect(results.violations).toEqual([]);
});

test("dropdown menu preview passes axe", async () => {
  const { container } = render(<DropdownMenuPreview />);
  expect((await axe(container)).violations).toEqual([]);
});
