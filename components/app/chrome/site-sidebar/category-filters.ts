import { Blocks, Bot, LayoutGrid, Shapes } from "lucide-react";

export const CATEGORY_FILTERS = [
  { value: "all", label: "sidebar.all", icon: LayoutGrid },
  { value: "agents", label: "header.agents", icon: Bot },
  { value: "motion", label: "header.components", icon: Shapes },
  { value: "blocks", label: "header.blocks", icon: Blocks },
] as const;

export type CategoryFilter = (typeof CATEGORY_FILTERS)[number];
