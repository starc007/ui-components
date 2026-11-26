"use client";

import {
  ArrowDown,
  ArrowUp,
  Bookmark,
  FileText,
  Folder,
  FolderInput,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Undo2,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentProps,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_LAYOUT } from "@/lib/ease";
import { useTouchCapable } from "@/lib/hooks/use-touch-capable";
import { cn } from "@/lib/utils";
import { MarqueeLabel } from "./marquee-label";
import type { Translate } from "./messages";
import { ResourceMenuAction } from "./resource-menu-action";
import { canContain } from "./tree";
import type {
  AISidebarProps,
  DropTarget,
  FlatResource,
  SidebarResource,
  SidebarResourceMoveCommands,
} from "./types";

function defaultIcon(item: SidebarResource, expanded: boolean) {
  const Icon =
    item.kind === "folder" || item.kind === "project"
      ? expanded
        ? FolderOpen
        : Folder
      : item.kind === "bookmark"
          ? Bookmark
          : FileText;
  return <Icon className="size-4" />;
}

interface ResourceRowProps {
  row: FlatResource;
  active: boolean;
  expanded: boolean;
  focused: boolean;
  draggingId: string | null;
  dropTarget: DropTarget | null;
  menuOpen: boolean;
  moves: SidebarResourceMoveCommands;
  renaming: boolean;
  onDragEnd: () => void;
  onDragOver: (event: DragEvent<HTMLDivElement>, row: FlatResource) => void;
  onDragStart: (event: DragEvent<HTMLDivElement>, id: string) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
  onMenuOpenChange: (open: boolean) => void;
  onRenameCancel: () => void;
  onRenameCommit: (label: string) => void;
  onRenameStart: () => void;
  onSelect: () => void;
  onToggle: () => void;
  renderIcon?: (item: SidebarResource) => ReactNode;
  renderMenu?: AISidebarProps["renderMenu"];
  setRef: (node: HTMLDivElement | null) => void;
  t: Translate;
}

export function ResourceRow({
  row,
  active,
  expanded,
  focused,
  draggingId,
  dropTarget,
  menuOpen,
  moves,
  renaming,
  onDragEnd,
  onDragOver,
  onDragStart,
  onDrop,
  onFocus,
  onKeyDown,
  onMenuOpenChange,
  onRenameCancel,
  onRenameCommit,
  onRenameStart,
  onSelect,
  onToggle,
  renderIcon,
  renderMenu,
  setRef,
  t,
}: ResourceRowProps) {
  const reduce = useReducedMotion() ?? false;
  const canTouch = useTouchCapable();
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipRenameBlurRef = useRef(false);
  const draggedRef = useRef(false);
  const [draft, setDraft] = useState(row.item.label);
  const acceptsChildren = canContain(row.item);
  const isDragging = draggingId === row.item.id;
  const dropPosition = dropTarget?.id === row.item.id ? dropTarget.position : null;

  useEffect(() => {
    if (!renaming) return;
    skipRenameBlurRef.current = false;
    setDraft(row.item.label);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  }, [renaming, row.item.label]);

  const runFromMenu = (action: () => void) => () => {
    onMenuOpenChange(false);
    action();
  };

  const menu = renderMenu?.(row.item, {
    close: () => onMenuOpenChange(false),
    rename: () => {
      onMenuOpenChange(false);
      onRenameStart();
    },
    moves,
  }) ?? (
    <>
      <ResourceMenuAction icon={Pencil} onSelect={runFromMenu(onRenameStart)}>
        {t("rename")}
      </ResourceMenuAction>
      {moves.up || moves.down || moves.into || moves.out ? (
        <div aria-hidden="true" className="my-1 h-px bg-border" />
      ) : null}
      {moves.up ? (
        <ResourceMenuAction icon={ArrowUp} onSelect={runFromMenu(moves.up)}>
          {t("moveUp")}
        </ResourceMenuAction>
      ) : null}
      {moves.down ? (
        <ResourceMenuAction icon={ArrowDown} onSelect={runFromMenu(moves.down)}>
          {t("moveDown")}
        </ResourceMenuAction>
      ) : null}
      {moves.into ? (
        <ResourceMenuAction
          icon={FolderInput}
          onSelect={runFromMenu(moves.into.run)}
        >
          {t("moveInto", { target: moves.into.label })}
        </ResourceMenuAction>
      ) : null}
      {moves.out ? (
        <ResourceMenuAction icon={Undo2} onSelect={runFromMenu(moves.out)}>
          {t("moveOut")}
        </ResourceMenuAction>
      ) : null}
    </>
  );

  return (
    <motion.div
      ref={setRef}
      layout="position"
      transition={reduce ? { duration: 0 } : SPRING_LAYOUT}
      role="treeitem"
      aria-level={row.depth + 1}
      aria-selected={acceptsChildren ? undefined : active}
      aria-expanded={acceptsChildren ? expanded : undefined}
      aria-disabled={row.item.disabled || undefined}
      tabIndex={focused ? 0 : -1}
      draggable={!row.item.disabled && !renaming}
      data-menu-open={menuOpen || undefined}
      data-drop={dropPosition ?? undefined}
      data-dragging={isDragging || undefined}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      onClick={(event) => {
        if (
          event.defaultPrevented ||
          draggedRef.current ||
          renaming ||
          row.item.disabled
        )
          return;
        if (acceptsChildren) onToggle();
        else onSelect();
      }}
      onDoubleClick={(event) => {
        if (acceptsChildren || row.item.disabled) return;
        event.preventDefault();
        onRenameStart();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onDragStartCapture={(event) => {
        draggedRef.current = true;
        onDragStart(event, row.item.id);
      }}
      onDragEndCapture={() => {
        onDragEnd();
        requestAnimationFrame(() => {
          draggedRef.current = false;
        });
      }}
      onDragOver={(event) => onDragOver(event, row)}
      onDrop={onDrop}
      className={cn(
        "group/resource relative flex min-h-9 min-w-0 cursor-pointer items-center gap-2.5 rounded-xl pr-3 text-sm outline-none",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        "focus-visible:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
        "data-[menu-open=true]:bg-muted data-[menu-open=true]:text-foreground",
        "data-[dragging=true]:opacity-40",
        "data-[drop=inside]:bg-muted data-[drop=inside]:ring-1 data-[drop=inside]:ring-primary/45",
        "data-[drop=before]:before:absolute data-[drop=before]:before:-top-0.5 data-[drop=before]:before:right-2 data-[drop=before]:before:left-2 data-[drop=before]:before:h-0.5 data-[drop=before]:before:rounded-full data-[drop=before]:before:bg-primary",
        "data-[drop=after]:after:absolute data-[drop=after]:after:-bottom-0.5 data-[drop=after]:after:right-2 data-[drop=after]:after:left-2 data-[drop=after]:after:h-0.5 data-[drop=after]:after:rounded-full data-[drop=after]:after:bg-primary",
        !acceptsChildren && active && "bg-muted text-foreground",
        row.item.disabled && "cursor-not-allowed opacity-45",
      )}
      style={{ paddingLeft: `${12 + row.depth * 16}px` }}
    >
      <span aria-hidden="true" className="grid size-5 shrink-0 place-items-center">
        {renderIcon?.(row.item) ?? defaultIcon(row.item, expanded)}
      </span>

      {renaming ? (
        <input
          ref={inputRef}
          value={draft}
          aria-label={t("renameItem", { item: row.item.label })}
          onChange={(event) => setDraft(event.target.value)}
          draggable={false}
          onClick={(event) => event.stopPropagation()}
          onDoubleClick={(event) => event.stopPropagation()}
          onBlur={() => {
            if (!skipRenameBlurRef.current) onRenameCommit(draft);
          }}
          onKeyDown={(event) => {
            event.stopPropagation();
            if (event.key === "Enter") {
              skipRenameBlurRef.current = true;
              onRenameCommit(draft);
            }
            if (event.key === "Escape") {
              skipRenameBlurRef.current = true;
              onRenameCancel();
            }
          }}
          className="mx-1 h-7 min-w-0 flex-1 rounded-full border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <MarqueeLabel active={hovered || menuOpen}>{row.item.label}</MarqueeLabel>
      )}

      {!renaming && !row.item.disabled ? (
        <MorphPopover
          open={menuOpen}
          onOpenChange={onMenuOpenChange}
        >
          <Tooltip content={menuOpen ? null : t("actions", { item: row.item.label })} side="top">
            <ActionsTrigger
              aria-label={t("actions", { item: row.item.label })}
              className={cn(
                // A finger never hovers, and this menu is the only path to
                // rename and move without a drag — keep it on screen there.
                canTouch ? "opacity-100" : "opacity-0",
              )}
            />
          </Tooltip>
          <MorphPopoverContent
            side="bottom"
            align="end"
            sideOffset={8}
            className="w-40 p-2"
          >
            <div data-sidebar-resource-menu={row.item.id}>{menu}</div>
          </MorphPopoverContent>
        </MorphPopover>
      ) : null}
    </motion.div>
  );
}

/**
 * The row's "…" button. Its own component so the tooltip around it and the
 * popover trigger inside both reach the button.
 */
function ActionsTrigger({ className, ...props }: ComponentProps<"button">) {
  return (
    <MorphPopoverTrigger>
      <button
        type="button"
        draggable={false}
        tabIndex={-1}
        {...props}
        onClick={(event) => {
          props.onClick?.(event);
          event.stopPropagation();
        }}
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full outline-none transition-opacity hover:bg-foreground/5 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring group-hover/resource:opacity-100 group-data-[menu-open=true]/resource:opacity-100",
          className,
        )}
      >
        <MoreHorizontal aria-hidden="true" className="size-4" />
      </button>
    </MorphPopoverTrigger>
  );
}
