"use client";

import { createContext, useContext } from "react";
import type { useMessages } from "@/lib/i18n";

export type SidebarState = "expanded" | "collapsed";
export type SidebarSide = "left" | "right";
export type SidebarVariant = "sidebar" | "floating" | "inset";
export type SidebarCollapsible = "offcanvas" | "icon" | "none";

/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const animatedSidebarMessages = {
  label: "Sidebar",
  toggle: "Toggle sidebar",
  close: "Close sidebar",
};

export type AnimatedSidebarMessages = typeof animatedSidebarMessages;

interface AnimatedSidebarContextValue {
  isMobile: boolean;
  layoutId: string;
  open: boolean;
  openMobile: boolean;
  reduce: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: SidebarState;
  toggleSidebar: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  t: ReturnType<typeof useMessages<AnimatedSidebarMessages>>;
}

export const AnimatedSidebarContext =
  createContext<AnimatedSidebarContextValue | null>(null);

interface AnimatedSidebarPanelContextValue {
  collapsed: boolean;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
}

export const AnimatedSidebarPanelContext =
  createContext<AnimatedSidebarPanelContextValue | null>(null);

export function useAnimatedSidebar() {
  const context = useContext(AnimatedSidebarContext);
  if (!context) {
    throw new Error(
      "useAnimatedSidebar must be used inside AnimatedSidebarProvider.",
    );
  }
  return context;
}

export function useAnimatedSidebarPanel() {
  const context = useContext(AnimatedSidebarPanelContext);
  if (!context) {
    throw new Error(
      "Animated Sidebar parts must be used inside AnimatedSidebar.",
    );
  }
  return context;
}
