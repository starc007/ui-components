"use client";

import { Blocks, BookOpen, Bot, FolderOpen, Palette } from "lucide-react";
import {
  MorphingSearch,
  type MorphingSearchItem,
} from "@/components/motion/morphing-search";

const ITEMS: MorphingSearchItem[] = [
  {
    id: "project-folder",
    title: "Project Folder",
    description: "Block · Files and previews",
    keywords: ["files", "overlay"],
    icon: FolderOpen,
  },
  {
    id: "motion-components",
    title: "Motion components",
    description: "Collection · Interaction primitives",
    keywords: ["animation", "components"],
    icon: Blocks,
  },
  {
    id: "agent-interfaces",
    title: "Agent interfaces",
    description: "Collection · AI building blocks",
    keywords: ["ai", "chat"],
    icon: Bot,
  },
  {
    id: "installation",
    title: "Installation guide",
    description: "Documentation · Add your first component",
    keywords: ["setup", "shadcn"],
    icon: BookOpen,
  },
  {
    id: "design-tokens",
    title: "Design tokens",
    description: "Documentation · Color, type, and motion",
    keywords: ["theme", "styles"],
    icon: Palette,
  },
];

export function MorphingSearchPreview() {
  return (
    <div className="flex w-full max-w-[22rem] items-center gap-3">
      <MorphingSearch items={ITEMS} placeholder="Find components" />
      <MorphingSearch
        items={ITEMS}
        placeholder="Find components"
        shortcut=""
        iconOnly
      />
    </div>
  );
}
