"use client";

import { motion, type Variants } from "motion/react";
import {
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { enabledItems, useMenuNavigation } from "@/components/motion/menu/use-menu-navigation";
import { usePopoverPortalPosition } from "@/components/motion/popover-position";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { type FocusTarget, LevelContext, type LevelContextValue, useRoot } from "./context";
import { type Align, type Placement, type Point, place, type Side } from "./placement";

const EXIT = { duration: 0.12, ease: EASE_OUT };
// The panel grows out of its trigger from this scale and distance.
const OPEN_SCALE = 0.94;
const OPEN_TRAVEL = 6;
const OPEN = { duration: 0.2, ease: EASE_OUT };
const INSTANT = { duration: 0 };

interface PanelProps {
  children: ReactNode;
  className?: string;
  id: string;
  anchorRef: MutableRefObject<HTMLElement | null>;
  side: Side;
  align: Align;
  sideOffset: number;
  focus: FocusTarget;
  /** Show without animating; the AnimatePresence around it carries the same flag to the exit. */
  instant: boolean;
  present: boolean;
  gate: { inert: boolean; style: { pointerEvents: "auto" | "none" } };
  labelledBy: string;
  onClose: () => void;
  onKeyDown?: (event: ReactKeyboardEvent<HTMLDivElement>) => boolean;
  onPointerEnter?: () => void;
  panelRef: MutableRefObject<HTMLDivElement | null>;
}

/** One panel, shared by the menu and its submenus. */
export function MenuPanel({
  children,
  className,
  id,
  anchorRef,
  side,
  align,
  sideOffset,
  focus,
  instant,
  present,
  gate,
  labelledBy,
  onClose,
  onKeyDown,
  onPointerEnter,
  panelRef,
}: PanelProps) {
  const root = useRoot("DropdownMenuContent");
  const parent = useContext(LevelContext);
  const levelId = useId();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [glide, setGlide] = useState(true);
  const [openSub, setOpenSubState] = useState<string | null>(null);
  const [subFocus, setSubFocus] = useState<FocusTarget>("none");
  const [subInstant, setSubInstant] = useState(false);
  const grace = useRef<{ polygon: Point[]; until: number } | null>(null);
  const navigate = useMenuNavigation();

  const layout = usePopoverPortalPosition(anchorRef, panelRef, true);
  // Held once placed: an exiting panel stays where it was, even if the
  // trigger scrolls away under it.
  const [placement, setPlacement] = useState<Placement | null>(null);
  useLayoutEffect(() => {
    if (!layout || !present) return;
    // A submenu measures its gap from the parent panel's edge, not from the
    // row inside it, so the two panels never touch.
    const edge = parent?.panelRef.current?.getBoundingClientRect();
    const anchor = edge ? { ...layout.trigger, left: edge.left, width: edge.width } : layout.trigger;
    setPlacement(place(anchor, layout.content, side, align, sideOffset));
  }, [layout, present, side, align, sideOffset, parent]);

  const setOpenSub = useCallback(
    (next: string | null, nextFocus: FocusTarget = "none", now = nextFocus !== "none") => {
      setSubFocus(nextFocus);
      setSubInstant(now);
      setOpenSubState(next);
    },
    [],
  );

  // Waits for the first placement: the panel is `visibility: hidden` until
  // then, and the browser will not focus anything inside it.
  const placed = placement !== null;
  useEffect(() => {
    const panel = panelRef.current;
    // `present` too: reopening during the exit brings this same panel back.
    if (!placed || !present || !panel || focus === "none") return;
    if (focus === "panel") {
      panel.focus({ preventScroll: true });
      return;
    }
    const items = enabledItems(panel);
    (focus === "last" ? items[items.length - 1] : items[0])?.focus({ preventScroll: true });
  }, [placed, present, focus, panelRef]);

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    // Submenus render inside this panel's React tree, so their keys bubble
    // here too. Each panel answers only for its own rows.
    const panel = panelRef.current;
    const target = event.target as HTMLElement;
    if (!panel || target.closest("[data-menu-panel]") !== panel) return;
    // Set before the key moves focus, so the highlight it lands on jumps.
    setGlide(false);
    if (onKeyDown?.(event)) return;
    if (event.key === "Tab") {
      event.preventDefault();
      onClose();
      return;
    }
    navigate(event, panel);
  };

  const level = useMemo<LevelContextValue>(
    () => ({
      levelId,
      present,
      panelRef,
      activeId,
      setActiveId,
      glide,
      openSub,
      setOpenSub,
      subFocus,
      subInstant,
      grace,
    }),
    [levelId, present, panelRef, activeId, glide, openSub, setOpenSub, subFocus, subInstant],
  );

  // The panel starts tucked toward its trigger and springs out of it.
  const used = placement?.side ?? side;
  const toward = used === "top" || used === "left" ? 1 : -1;
  const vertical = used === "top" || used === "bottom";
  const offset = (distance: number) => (vertical ? { y: distance * toward } : { x: distance * toward });
  // `custom` is the instant flag. An exiting panel reads it from its
  // AnimatePresence, so Escape removes the menu at once even after it has
  // already left the React tree.
  const variants: Variants = root.reduce
    ? {
        hidden: { opacity: 0 },
        shown: (now = false) => ({
          opacity: 1,
          transition: now ? INSTANT : { duration: 0.15, ease: EASE_OUT },
        }),
        gone: (now = false) => ({ opacity: 0, transition: now ? INSTANT : EXIT }),
      }
    : {
        hidden: { opacity: 0, scale: OPEN_SCALE, ...offset(OPEN_TRAVEL) },
        shown: (now = false) => ({
          opacity: 1,
          scale: 1,
          x: 0,
          y: 0,
          transition: now
            ? INSTANT
            : {
                ...OPEN,
                opacity: { duration: 0.12, ease: EASE_OUT },
              },
        }),
        gone: (now = false) => ({
          opacity: 0,
          scale: 0.97,
          ...offset(OPEN_TRAVEL / 2),
          transition: now ? INSTANT : EXIT,
        }),
      };

  return createPortal(
    <motion.div
      {...gate}
      ref={panelRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      aria-orientation="vertical"
      tabIndex={-1}
      data-menu-panel=""
      data-menu-root={root.menuId}
      data-level={levelId}
      data-side={placement?.side ?? side}
      custom={instant}
      variants={variants}
      initial="hidden"
      animate="shown"
      exit="gone"
      onKeyDown={handleKeyDown}
      onPointerMove={(event) => {
        if (event.pointerType !== "touch") setGlide(true);
      }}
      onFocus={(event) => {
        if (event.target === event.currentTarget) setActiveId(null);
      }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={(event) => {
        // Leaving the panel drops the highlight, unless the row it sits on
        // owns the open submenu the pointer is heading into.
        if (event.pointerType === "touch" || openSub) return;
        const panel = panelRef.current;
        if (panel?.contains(document.activeElement)) panel.focus({ preventScroll: true });
      }}
      style={{
        ...gate.style,
        left: placement?.left ?? 0,
        top: placement?.top ?? 0,
        transformOrigin: placement?.origin,
        maxHeight: placement?.maxHeight,
        visibility: placement ? undefined : "hidden",
      }}
      className={cn(
        "fixed z-[100] min-w-48 overflow-y-auto overscroll-contain rounded-2xl border border-border bg-background p-2 text-foreground shadow-[0_8px_24px_-8px_rgb(0_0_0/0.16)] outline-none",
        parent && "z-[101]",
        className,
      )}
    >
      <LevelContext.Provider value={level}>{children}</LevelContext.Provider>
    </motion.div>,
    document.body,
  );
}
