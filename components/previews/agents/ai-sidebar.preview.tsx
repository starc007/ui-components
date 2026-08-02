"use client";

import {
  Clock3,
  GitPullRequest,
  LayoutGrid,
  PanelLeft,
  Plug,
  SquarePen,
} from "lucide-react";
import { useState } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarProvider,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import {
  AISidebar,
  type SidebarResource,
  type SidebarResourceMove,
} from "@/components/agents/ai-sidebar";

const resources: SidebarResource[] = [
  {
    id: "design-system",
    label: "Design system",
    kind: "project",
  },
  {
    id: "client-portal",
    label: "Client portal",
    kind: "project",
  },
  {
    id: "marketing-site",
    label: "Marketing website",
    kind: "project",
  },
  {
    id: "platform",
    label: "Platform",
    kind: "project",
    children: [
      { id: "api", label: "API migration", kind: "file" },
      { id: "billing", label: "Billing states", kind: "file" },
      { id: "docs", label: "Read platform docs", kind: "bookmark" },
    ],
  },
  {
    id: "mobile-app",
    label: "Mobile app",
    kind: "project",
  },
  {
    id: "research-lab",
    label: "Research lab",
    kind: "folder",
  },
  {
    id: "agent-workspace",
    label: "Agent workspace",
    kind: "project",
    children: [
      {
        id: "resource-review",
        label: "Review resource sidebar interaction details",
        kind: "file",
      },
      {
        id: "release-offer",
        label: "Prepare release announcement",
        kind: "file",
      },
      {
        id: "haptics",
        label: "Explore interaction feedback",
        kind: "bookmark",
      },
      {
        id: "promotion",
        label: "Plan launch distribution",
        kind: "file",
      },
      {
        id: "motion-research",
        label: "Research motion implementation patterns",
        kind: "bookmark",
      },
    ],
  },
  {
    id: "release-notes",
    label: "Release notes",
    kind: "file",
  },
];

const actions = [
  { label: "New workspace", icon: SquarePen },
  { label: "Pull requests", icon: GitPullRequest },
  { label: "Sites", icon: LayoutGrid },
  { label: "Scheduled", icon: Clock3 },
  { label: "Extensions", icon: Plug },
] as const;

function findLabel(items: SidebarResource[], id: string): string | undefined {
  for (const item of items) {
    if (item.id === id) return item.label;
    const child = item.children ? findLabel(item.children, id) : undefined;
    if (child) return child;
  }
}

export function AISidebarPreview() {
  const [active, setActive] = useState("resource-review");
  const [items, setItems] = useState(resources);
  const activeLabel = findLabel(items, active) ?? active;

  const move = async (_event: SidebarResourceMove) => {
    await new Promise((resolve) => window.setTimeout(resolve, 450));
  };

  return (
    <div className="w-full px-0 py-2 sm:p-3">
      <AnimatedSidebarProvider
        style={{ "--sidebar-width": "16rem" }}
        className="h-[720px] min-h-0 w-full overflow-hidden rounded-2xl border border-foreground/[0.08] bg-background"
      >
        <AnimatedSidebar
          ariaLabel="Workspace resources"
          collapsible="offcanvas"
          className="min-h-0 w-full"
          panelClassName="h-full bg-background"
        >
          <AnimatedSidebarContent className="gap-4 overflow-hidden px-2 py-4">
            <AnimatedSidebarGroup className="shrink-0 px-1 py-0">
              <AnimatedSidebarGroupContent>
                <AnimatedSidebarMenu className="gap-1">
                  {actions.map(({ label, icon: Icon }) => (
                    <AnimatedSidebarMenuItem key={label}>
                      <AnimatedSidebarMenuButton
                        icon={<Icon className="size-4" />}
                        onSelect={() => {}}
                        className="font-normal text-foreground"
                      >
                        {label}
                      </AnimatedSidebarMenuButton>
                    </AnimatedSidebarMenuItem>
                  ))}
                </AnimatedSidebarMenu>
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>

            <AnimatedSidebarGroup className="min-h-0 flex-1 px-1 py-0">
              <AnimatedSidebarGroupLabel className="mb-1 h-8 px-2 text-xs font-medium normal-case tracking-normal">
                Projects
              </AnimatedSidebarGroupLabel>
              <AnimatedSidebarGroupContent className="relative min-h-0 flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto overscroll-contain pb-8 [overflow-anchor:none] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <AISidebar
                    items={items}
                    activeId={active}
                    defaultExpandedIds={["platform", "agent-workspace"]}
                    onActiveChange={setActive}
                    onItemsChange={setItems}
                    onMove={move}
                  />
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-8 bg-gradient-to-t from-background via-background/80 to-transparent"
                />
              </AnimatedSidebarGroupContent>
            </AnimatedSidebarGroup>
          </AnimatedSidebarContent>
          <AnimatedSidebarRail />
        </AnimatedSidebar>

        <AnimatedSidebarInset className="min-h-0 bg-background">
          <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-border border-b px-5">
            <div className="flex min-w-0 items-center gap-3">
              <AnimatedSidebarTrigger className="-ml-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                <PanelLeft aria-hidden="true" className="size-4" />
              </AnimatedSidebarTrigger>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                  Workspace
                </p>
                <p className="truncate text-sm font-medium text-foreground">
                  Agent workspace
                </p>
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
              Draft
            </span>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-6 sm:p-8">
            <div className="mx-auto max-w-xl">
              <p className="text-xs text-muted-foreground">Selected resource</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {activeLabel}
              </h3>
              <p className="mt-3 max-w-lg text-sm leading-6 text-muted-foreground">
                Keep the resource tree predictable while files move between
                projects, labels overflow, and folders expand around the
                current selection.
              </p>

              <div className="mt-8 border-border border-t pt-6">
                <p className="text-sm font-medium text-foreground">
                  Interaction notes
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-muted-foreground">
                  <li>Folders only reveal their contents.</li>
                  <li>Files can be selected, moved, or renamed.</li>
                  <li>Rejected moves return to their previous location.</li>
                </ul>
              </div>
            </div>
          </div>
        </AnimatedSidebarInset>
      </AnimatedSidebarProvider>
    </div>
  );
}
