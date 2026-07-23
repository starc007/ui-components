"use client";

import { useState } from "react";
import { BounceSidebar } from "@/components/motion/bounce-sidebar";

const destinations = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "motion", label: "Motion" },
  { id: "templates", label: "Templates" },
  { id: "changelog", label: "Changelog" },
];

export function BounceSidebarPreview() {
  const [active, setActive] = useState("components");

  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      <BounceSidebar
        items={destinations}
        value={active}
        onValueChange={setActive}
        ariaLabel="beUI sections"
        className="w-52"
        listClassName="w-full"
        itemClassName="text-base"
      />
    </div>
  );
}
