"use client";

import { createContext, type MutableRefObject, useContext } from "react";
import type { Point } from "./placement";

export type FocusTarget = "first" | "last" | "panel" | "none";

export interface RootContextValue {
  open: boolean;
  /**
   * `instant` skips the open or close animation: the keyboard asked for it,
   * and keyboard users open and close menus far too often to wait on motion.
   */
  setOpen: (open: boolean, focus?: FocusTarget, instant?: boolean) => void;
  focusTarget: FocusTarget;
  /** Whether the latest open or close skips its animation. */
  instant: boolean;
  menuId: string;
  triggerId: string;
  triggerRef: MutableRefObject<HTMLElement | null>;
  reduce: boolean;
  mounted: boolean;
  /** Plays the select sound when the menu's `sound` prop is on. */
  playSelect: () => void;
}

export const RootContext = createContext<RootContextValue | null>(null);

export function useRoot(component: string) {
  const context = useContext(RootContext);
  if (!context) throw new Error(`${component} must be used within <DropdownMenu>`);
  return context;
}

/** One open panel: the root menu or a submenu. */
export interface LevelContextValue {
  levelId: string;
  present: boolean;
  panelRef: MutableRefObject<HTMLDivElement | null>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  /** The highlight glides after the pointer, and jumps after a key. */
  glide: boolean;
  openSub: string | null;
  /** `instant` defaults to true when a focus target says the keyboard opened it. */
  setOpenSub: (id: string | null, focus?: FocusTarget, instant?: boolean) => void;
  subFocus: FocusTarget;
  /** Whether the submenu's latest open or close skips its animation. */
  subInstant: boolean;
  /** A pointer on its way from a submenu trigger to the submenu it opened. */
  grace: MutableRefObject<{ polygon: Point[]; until: number } | null>;
}

export const LevelContext = createContext<LevelContextValue | null>(null);

export function useLevel(component: string) {
  const context = useContext(LevelContext);
  if (!context) {
    throw new Error(`${component} must be used within <DropdownMenuContent>`);
  }
  return context;
}
