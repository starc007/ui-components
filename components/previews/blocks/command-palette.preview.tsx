"use client";

import { FileText, Home, Plus, Settings, User } from "lucide-react";
import { useState } from "react";
import { CommandPalette } from "@/components/motion/command-palette";

export function CommandPalettePreview() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center rounded-full border border-border bg-card px-5 text-sm font-medium text-foreground press hover:border-(--color-border-strong)"
      >
        Open command palette
      </button>
      <p className="text-sm text-muted-foreground">
        Press{" "}
        <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-xs text-foreground">
          ⌘ J
        </kbd>{" "}
        (or <kbd className="rounded border border-border bg-card px-1.5 py-0.5 text-xs text-foreground">Ctrl J</kbd>) to open.
      </p>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        shortcut="j"
        items={[
          { id: "home", label: "Go to Home", group: "Navigation", icon: Home, hint: "G H", onSelect: () => {} },
          { id: "profile", label: "Open profile", group: "Navigation", icon: User, hint: "G P", onSelect: () => {} },
          { id: "settings", label: "Settings", group: "Navigation", icon: Settings, onSelect: () => {} },
          { id: "new-doc", label: "Create document", group: "Actions", icon: FileText, hint: "⌘ N", onSelect: () => {} },
          { id: "new-project", label: "New project", group: "Actions", icon: Plus, hint: "⌘ ⇧ N", onSelect: () => {} },
        ]}
      />
    </div>
  );
}
