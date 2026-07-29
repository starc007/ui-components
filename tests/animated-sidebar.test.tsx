import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  within,
} from "@testing-library/react";
import { useState } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarClose,
  AnimatedSidebarContent,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarMenuSub,
  AnimatedSidebarMenuSubButton,
  AnimatedSidebarMenuSubItem,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  cleanup();
  window.matchMedia = originalMatchMedia;
});

function useMobileViewport() {
  window.matchMedia = (query: string) =>
    ({
      matches:
        query.includes("prefers-reduced-motion") ||
        query.includes("max-width"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

function SidebarExample({
  open,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const [projectsOpen, setProjectsOpen] = useState(false);

  return (
    <AnimatedSidebarProvider open={open} onOpenChange={onOpenChange}>
      <AnimatedSidebar ariaLabel="Workspace navigation">
        <AnimatedSidebarContent>
          <AnimatedSidebarClose>Close</AnimatedSidebarClose>
          <AnimatedSidebarMenu>
            <AnimatedSidebarMenuItem>
              <AnimatedSidebarMenuButton isActive>
                Overview
              </AnimatedSidebarMenuButton>
            </AnimatedSidebarMenuItem>
            <AnimatedSidebarMenuItem>
              <AnimatedSidebarMenuButton
                ariaExpanded={projectsOpen}
                onSelect={() => setProjectsOpen((current) => !current)}
              >
                Projects
              </AnimatedSidebarMenuButton>
              <AnimatedSidebarMenuSub open={projectsOpen}>
                <AnimatedSidebarMenuSubItem>
                  <AnimatedSidebarMenuSubButton>
                    Active projects
                  </AnimatedSidebarMenuSubButton>
                </AnimatedSidebarMenuSubItem>
              </AnimatedSidebarMenuSub>
            </AnimatedSidebarMenuItem>
          </AnimatedSidebarMenu>
        </AnimatedSidebarContent>
      </AnimatedSidebar>
      <AnimatedSidebarInset>
        <AnimatedSidebarTrigger>Toggle</AnimatedSidebarTrigger>
      </AnimatedSidebarInset>
    </AnimatedSidebarProvider>
  );
}

describe("AnimatedSidebar", () => {
  test("collapses to an icon sidebar in uncontrolled mode", () => {
    const { getByLabelText, getByRole } = render(<SidebarExample />);
    const sidebar = getByLabelText("Workspace navigation");

    expect(sidebar.getAttribute("data-state")).toBe("expanded");
    fireEvent.click(getByRole("button", { name: "Toggle sidebar" }));

    expect(sidebar.getAttribute("data-state")).toBe("collapsed");
    expect(sidebar.getAttribute("data-collapsible")).toBe("icon");
  });

  test("respects controlled desktop state", () => {
    const onOpenChange = mock(() => {});
    const { getByLabelText, getByRole } = render(
      <SidebarExample open={false} onOpenChange={onOpenChange} />,
    );

    fireEvent.click(getByRole("button", { name: "Toggle sidebar" }));

    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(
      getByLabelText("Workspace navigation").getAttribute("data-state"),
    ).toBe("collapsed");
  });

  test("toggles with the platform keyboard shortcut", () => {
    const { getByLabelText } = render(<SidebarExample />);
    const sidebar = getByLabelText("Workspace navigation");

    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(sidebar.getAttribute("data-state")).toBe("collapsed");

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(sidebar.getAttribute("data-state")).toBe("expanded");
  });

  test("keeps desktop navigation selections open", () => {
    const { getByLabelText, getByRole } = render(<SidebarExample />);

    fireEvent.click(getByRole("button", { name: "Projects" }));

    expect(
      getByLabelText("Workspace navigation").getAttribute("data-state"),
    ).toBe("expanded");
  });

  test("reveals nested navigation from its parent item", () => {
    const { getByRole, queryByRole } = render(<SidebarExample />);
    const projects = getByRole("button", { name: "Projects" });

    expect(queryByRole("button", { name: "Active projects" })).toBeNull();

    fireEvent.click(projects);
    expect(projects.getAttribute("aria-expanded")).toBe("true");
    expect(
      getByRole("button", { name: "Active projects" }),
    ).toBeTruthy();

    fireEvent.click(projects);
    expect(projects.getAttribute("aria-expanded")).toBe("false");
  });

  test("uses a dismissible sheet only on mobile", () => {
    useMobileViewport();
    const { getByRole } = render(<SidebarExample />);
    const trigger = getByRole("button", { name: "Toggle sidebar" });

    fireEvent.click(trigger);
    const dialog = getByRole("dialog", { name: "Workspace navigation" });
    expect(dialog.getAttribute("data-mobile")).toBe("true");
    expect(dialog.getAttribute("data-state")).toBe("expanded");
    expect(document.body.style.position).toBe("fixed");

    fireEvent.click(
      within(dialog).getByRole("button", { name: "Close sidebar" }),
    );
    expect(dialog.getAttribute("data-state")).toBe("collapsed");

    fireEvent.click(trigger);
    fireEvent.click(getByRole("button", { name: "Projects" }));
    expect(dialog.getAttribute("data-state")).toBe("collapsed");
    expect(dialog.hasAttribute("inert")).toBe(true);
    expect(document.body.style.position).toBe("");
  });
});
