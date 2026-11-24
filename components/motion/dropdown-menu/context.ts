"use client";

import { createContext, type MutableRefObject, useContext } from "react";
import type { Point } from "./placement";

export type FocusTarget = "first" | "last" | "panel" | "none";

export interface RootContextValue {
  open: boolean;
  setOpen: (open: boolean, focus?: FocusTarget) => void;
  focusTarget: FocusTarget;
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
  openSub: string | null;
  setOpenSub: (id: string | null, focus?: FocusTarget) => void;
  subFocus: FocusTarget;
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
