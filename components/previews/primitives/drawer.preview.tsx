"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";

export function DrawerPreview() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>Open drawer</Button>
      <Drawer open={open} onOpenChange={setOpen} side="right" title="Settings" description="Adjust your preferences.">
        <div className="space-y-3 text-sm text-(--color-fg-muted)">
          <p>Drawer body content lives here.</p>
          <p>Try opening with different <code className="text-(--color-fg)">side</code> props.</p>
        </div>
      </Drawer>
    </>
  );
}
