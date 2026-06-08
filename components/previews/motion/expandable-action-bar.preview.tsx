"use client";

import {
  Archive,
  Bell,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Send,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "@/components/motion/expandable-action-bar";

const ACTIONS: ExpandableActionBarItem[] = [
  {
    id: "send",
    label: "Send",
    icon: <Send className="h-4 w-4 motion-safe:group-hover:animate-action-send" />,
    shortcut: "S",
  },
  {
    id: "copy",
    label: "Copy",
    icon: <Copy className="h-4 w-4 motion-safe:group-hover:animate-action-copy" />,
    shortcut: "C",
  },
  {
    id: "download",
    label: "Export",
    icon: <Download className="h-4 w-4 motion-safe:group-hover:animate-action-download" />,
    shortcut: "E",
  },
  {
    id: "archive",
    label: "Archive",
    icon: <Archive className="h-4 w-4 motion-safe:group-hover:animate-action-archive" />,
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4 origin-top motion-safe:group-hover:animate-action-bell" />,
    badge: "3",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4 motion-safe:group-hover:animate-action-settings" />,
  },
];

export function ExpandableActionBarPreview() {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState("send");
  const reduceMotion = useReducedMotion();

  const items = useMemo(
    () =>
      ACTIONS.map((item) => ({
        ...item,
        active: item.id === activeId,
      })),
    [activeId],
  );

  return (
    <div className="flex min-h-72 w-full flex-col items-center justify-center gap-6">
      <div className="flex min-h-24 items-center justify-center">
        <ExpandableActionBar
          items={items}
          expanded={expanded}
          onExpandedChange={setExpanded}
          activeId={activeId}
          onAction={(item) => setActiveId(item.id)}
          classNames={{
            item: "group",
          }}
        />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <motion.button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="relative flex h-9 w-28 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg-elev) px-4 text-xs font-medium text-(--color-fg) transition-colors hover:border-(--color-border-strong)"
          whileHover={reduceMotion ? undefined : { scale: 1.02 }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={expanded ? "expanded" : "collapsed"}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
              animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-1.5"
            >
              {expanded ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span>Collapse</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  <span>Expand</span>
                </>
              )}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}
