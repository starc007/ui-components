"use client";

import { FileText, Home, Settings, User } from "lucide-react";
import { CommandK } from "@/components/data-nav/command-k";

export function CommandKPreview() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-(--color-fg-muted)">
        Press <kbd className="rounded border border-(--color-border) bg-(--color-bg-elev) px-1.5 py-0.5 text-xs text-(--color-fg)">⌘ K</kbd> to open the command menu.
      </p>
      <CommandK
        items={[
          { id: "home", label: "Go to Home", group: "Navigation", icon: Home, onSelect: () => {} },
          { id: "profile", label: "Open profile", group: "Navigation", icon: User, hint: "G then P", onSelect: () => {} },
          { id: "settings", label: "Settings", group: "Navigation", icon: Settings, onSelect: () => {} },
          { id: "new-doc", label: "Create document", group: "Actions", icon: FileText, hint: "⌘ N", onSelect: () => {} },
        ]}
      />
    </div>
  );
}
