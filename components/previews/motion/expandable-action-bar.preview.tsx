"use client";

import {
  Archive,
  Bell,
  Check,
  Copy,
  Download,
  Maximize2,
  Minimize2,
  Send,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  ExpandableActionBar,
  type ExpandableActionBarItem,
} from "@/components/motion/expandable-action-bar";

const ACTIONS: ExpandableActionBarItem[] = [
  {
    id: "send",
    label: "Send",
    icon: <Send className="h-4 w-4 transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />,
    shortcut: "S",
  },
  {
    id: "copy",
    label: "Copy",
    icon: <Copy className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-110" />,
    shortcut: "C",
  },
  {
    id: "download",
    label: "Export",
    icon: <Download className="h-4 w-4 transition-all duration-300 ease-out group-hover:translate-y-0.5" />,
    shortcut: "E",
  },
  {
    id: "archive",
    label: "Archive",
    icon: <Archive className="h-4 w-4 transition-all duration-300 ease-out group-hover:scale-110" />,
  },
  {
    id: "alerts",
    label: "Alerts",
    icon: <Bell className="h-4 w-4 origin-top transition-all duration-300 ease-out group-hover:rotate-12" />,
    badge: "3",
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="h-4 w-4 transition-all duration-300 ease-out group-hover:rotate-90" />,
  },
];

export function ExpandableActionBarPreview() {
  const [expanded, setExpanded] = useState(false);
  const [activeId, setActiveId] = useState("send");

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
          layout
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="relative flex h-9 items-center justify-center overflow-hidden rounded-full border border-(--color-border) bg-(--color-bg-elev) px-4 text-xs font-medium text-(--color-fg) transition-colors hover:border-(--color-border-strong)"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
        >
          <motion.div layout className="flex items-center gap-2">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={expanded ? "expanded" : "collapsed"}
                initial={{ opacity: 0, y: -25, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: 25, filter: "blur(4px)" }}
                transition={{ type: "spring", bounce: 0, duration: 0.3 }}
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
          </motion.div>
        </motion.button>
      </div>
    </div>
  );
}
