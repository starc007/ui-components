import type { ReactNode } from "react";
import type { AISidebarMessages } from "./messages";

export type SidebarResourceKind =
  | "folder"
  | "project"
  | "file"
  | "bookmark";

export interface SidebarResource {
  id: string;
  label: string;
  kind: SidebarResourceKind;
  children?: SidebarResource[];
  disabled?: boolean;
}

export type SidebarResourceDropPosition = "before" | "inside" | "after";

export interface SidebarResourceMove {
  itemId: string;
  targetId: string | null;
  position: SidebarResourceDropPosition;
}

/**
 * The moves this row can make right now, the same four the keyboard offers on
 * `Alt+Shift+Arrow`. A pointer drag is the fast path for them; a finger has no
 * drag to give, so the row menu carries them too. Absent keys are moves this
 * row cannot make from where it sits.
 */
export interface SidebarResourceMoveCommands {
  up?: () => void;
  down?: () => void;
  into?: { label: string; run: () => void };
  out?: () => void;
}

export interface SidebarResourceMenuControls {
  close: () => void;
  rename: () => void;
  moves: SidebarResourceMoveCommands;
}

export interface AISidebarProps {
  items?: SidebarResource[];
  defaultItems?: SidebarResource[];
  onItemsChange?: (items: SidebarResource[]) => void;
  /** Reject the promise to roll the optimistic move back. */
  onMove?: (move: SidebarResourceMove) => void | Promise<void>;
  onMoveError?: (error: unknown, move: SidebarResourceMove) => void;
  onRename?: (item: SidebarResource, label: string) => void | Promise<void>;
  activeId?: string | null;
  defaultActiveId?: string | null;
  onActiveChange?: (id: string) => void;
  defaultExpandedIds?: string[];
  renderIcon?: (item: SidebarResource) => ReactNode;
  renderMenu?: (
    item: SidebarResource,
    controls: SidebarResourceMenuControls,
  ) => ReactNode;
  ariaLabel?: string;
  className?: string;
  /** Override any built-in string. */
  labels?: Partial<AISidebarMessages>;
}

export interface FlatResource {
  item: SidebarResource;
  depth: number;
  parentId: string | null;
}

export interface DropTarget {
  id: string | null;
  position: SidebarResourceDropPosition;
}
