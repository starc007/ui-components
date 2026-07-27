"use client";

import {
  Check,
  Copy,
  Download,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/motion/context-menu";
import { SPRING_SWAP } from "@/lib/ease";

export function ContextMenuPreview() {
  const reduce = useReducedMotion() ?? false;
  const [message, setMessage] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  return (
    <div className="flex min-h-[360px] w-full items-center justify-center">
      <ContextMenu>
        <ContextMenuTrigger>
          <button
            type="button"
            className="group flex flex-col items-center outline-none"
          >
            <div className="relative h-24 w-32 transition-transform duration-150 group-active:scale-[0.98] group-focus-visible:rounded-2xl group-focus-visible:ring-2 group-focus-visible:ring-foreground/20 group-focus-visible:ring-offset-4 group-focus-visible:ring-offset-background">
              <div className="absolute left-1 top-1 h-7 w-14 rounded-t-[10px] bg-[#d4a84f] dark:bg-[#a77d2f]" />
              <div className="absolute inset-x-0 bottom-0 top-5 rounded-[14px] bg-[#e7bb61] shadow-[0_14px_24px_-16px_rgba(90,58,8,0.75)] dark:bg-[#bd8d36]" />
              <div className="absolute inset-x-0 bottom-0 top-9 rounded-[14px] bg-[#efc86f] dark:bg-[#cb9a41]" />
              <div className="absolute inset-x-5 bottom-4 h-px bg-black/10 dark:bg-white/10" />
            </div>

            <span className="mt-4 text-sm font-medium text-foreground">
              Right click on me
            </span>

            <div className="mt-1 h-4">
              <AnimatePresence mode="wait" initial={false}>
                {message ? (
                  <motion.span
                    key={message}
                    initial={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: 3, filter: "blur(2px)" }
                    }
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={
                      reduce
                        ? { opacity: 0 }
                        : { opacity: 0, y: -2, filter: "blur(2px)" }
                    }
                    transition={reduce ? { duration: 0.1 } : SPRING_SWAP}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground"
                  >
                    <Check aria-hidden="true" className="h-3 w-3 text-success" />
                    {message}
                  </motion.span>
                ) : (
                  <span className="text-[10px] text-muted-foreground">
                    or long-press · Shift + F10
                  </span>
                )}
              </AnimatePresence>
            </div>
          </button>
        </ContextMenuTrigger>

        <ContextMenuContent ariaLabel="Folder actions" className="w-60">
          <ContextMenuLabel>Project files</ContextMenuLabel>
          <ContextMenuItem
            textValue="Open"
            onSelect={() => setMessage("Folder opened")}
          >
            <Eye aria-hidden="true" className="h-4 w-4" />
            Open
            <ContextMenuShortcut>↵</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            textValue="Rename"
            onSelect={() => setMessage("Ready to rename")}
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Rename
            <ContextMenuShortcut>R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            textValue="Duplicate"
            onSelect={() => setMessage("Folder duplicated")}
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
            Duplicate
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem
            textValue="Download"
            onSelect={() => setMessage("Download started")}
          >
            <Download aria-hidden="true" className="h-4 w-4" />
            Download
          </ContextMenuItem>

          <ContextMenuSeparator />

          <ContextMenuCheckboxItem
            textValue="Keep offline"
            checked={offline}
            closeOnSelect={false}
            onCheckedChange={(checked) => {
              setOffline(checked);
              setMessage(checked ? "Available offline" : "Online only");
            }}
          >
            Keep offline
          </ContextMenuCheckboxItem>

          <ContextMenuSeparator />

          <ContextMenuItem
            tone="destructive"
            textValue="Move to trash"
            onSelect={() => setMessage("Moved to trash")}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            Move to trash
            <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
