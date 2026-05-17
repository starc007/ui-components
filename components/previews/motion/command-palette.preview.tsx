"use client";

import { FileText, Home, Plus, Settings, User } from "lucide-react";
import { CommandPalette } from "@/components/motion/command-palette";

export function CommandPalettePreview() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-(--color-fg-muted)">
        Press{" "}
        <kbd className="rounded border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-xs text-(--color-fg)">
          ⌘ K
        </kbd>{" "}
        (or <kbd className="rounded border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-xs text-(--color-fg)">Ctrl K</kbd>) to open.
      </p>
      <CommandPalette
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
