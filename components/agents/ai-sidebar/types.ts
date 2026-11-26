import type { ReactNode } from "react";
import type { AISidebarMessages } from "./messages";

export type SidebarResourceKind =
  | "folder"
  | "project"
  | "file"
  | "bookmark";

export interface SidebarResource {
  /** Unique key for the row, used for selection, expansion and moves. */
  id: string;
  /** Name shown in the row and edited on rename. */
  label: string;
  /** Picks the row icon; folders and projects can hold children. */
  kind: SidebarResourceKind;
  /** Nested rows shown when a folder or project is expanded. */
  children?: SidebarResource[];
  /** Dims the row and blocks selecting, renaming, dragging and dropping into it. */
  disabled?: boolean;
}

export type SidebarResourceDropPosition = "before" | "inside" | "after";

export interface SidebarResourceMove {
  /** Id of the row being moved. */
  itemId: string;
  /** Id of the row it lands next to or inside, or null for the end of the root. */
  targetId: string | null;
  /** Where the row lands relative to the target. */
  position: SidebarResourceDropPosition;
}

/**
 * The moves this row can make right now, the same four the keyboard offers on
 * `Alt+Shift+Arrow`. A pointer drag is the fast path for them; a finger has no
 * drag to give, so the row menu carries them too. Absent keys are moves this
 * row cannot make from where it sits.
 */
export interface SidebarResourceMoveCommands {
  /** Moves the row above the row before it. */
  up?: () => void;
  /** Moves the row below the row after it. */
  down?: () => void;
  /** Moves the row into the folder or project above it, named by `label`. */
  into?: { label: string; run: () => void };
  /** Moves the row out of its parent, just after it. */
  out?: () => void;
}

export interface SidebarResourceMenuControls {
  /** Closes the row menu. */
  close: () => void;
  /** Closes the menu and starts renaming the row in place. */
  rename: () => void;
  /** The moves this row can make right now. */
  moves: SidebarResourceMoveCommands;
}

export interface AISidebarProps {
  /** The resource tree, for controlled use. */
  items?: SidebarResource[];
  /** The initial resource tree when uncontrolled. */
  defaultItems?: SidebarResource[];
  /** Called with the new tree after a move, rename or rollback. */
  onItemsChange?: (items: SidebarResource[]) => void;
  /** Reject the promise to roll the optimistic move back. */
  onMove?: (move: SidebarResourceMove) => void | Promise<void>;
  /** Called with the error and the move when `onMove` rejects. */
  onMoveError?: (error: unknown, move: SidebarResourceMove) => void;
  /** Called with the item and trimmed new label. Reject to roll it back. */
  onRename?: (item: SidebarResource, label: string) => void | Promise<void>;
  /** Id of the selected row, for controlled use. */
  activeId?: string | null;
  /** Id of the initially selected row when uncontrolled. Default: null */
  defaultActiveId?: string | null;
  /** Called with the row's id when a row is selected. */
  onActiveChange?: (id: string) => void;
  /** Ids of folders and projects that start expanded. */
  defaultExpandedIds?: string[];
  /** Renders a row's icon in place of the built-in kind icon. */
  renderIcon?: (item: SidebarResource) => ReactNode;
  /** Renders a row's actions menu, with controls to close, rename and move. */
  renderMenu?: (
    item: SidebarResource,
    controls: SidebarResourceMenuControls,
  ) => ReactNode;
  /** Accessible name for the tree. Default: "Resources" */
  ariaLabel?: string;
  /** Classes merged onto the tree element. */
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
