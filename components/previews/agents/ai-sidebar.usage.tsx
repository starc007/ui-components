"use client";

import { useState } from "react";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarProvider,
} from "@/components/motion/animated-sidebar";
import {
  AISidebar,
  type SidebarResource,
} from "@/components/agents/ai-sidebar";

const resources: SidebarResource[] = [
  {
    id: "project",
    label: "Website redesign",
    kind: "project",
    children: [
      { id: "brief", label: "Project brief", kind: "file" },
      { id: "research", label: "Research links", kind: "bookmark" },
    ],
  },
  { id: "archive", label: "Archive", kind: "folder" },
];

export function AISidebarUsage() {
  const [items, setItems] = useState(resources);

  return (
    <AnimatedSidebarProvider>
      <AnimatedSidebar
        ariaLabel="Project resources"
        collapsible="offcanvas"
      >
        <AnimatedSidebarContent>
          <AnimatedSidebarGroup>
            <AnimatedSidebarGroupLabel>Resources</AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent>
              <AISidebar
                items={items}
                onItemsChange={setItems}
                defaultExpandedIds={["project"]}
                onMove={async (move) => {
                  await saveResourceMove(move);
                }}
              />
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        </AnimatedSidebarContent>
      </AnimatedSidebar>
    </AnimatedSidebarProvider>
  );
}

async function saveResourceMove(_move: unknown) {
  // Persist the move. Rejecting this promise restores the previous tree.
}
