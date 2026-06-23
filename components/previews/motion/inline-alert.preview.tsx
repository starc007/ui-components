"use client";

import { useState } from "react";
import { Button } from "@/components/motion/button/base";
import { InlineAlert } from "@/components/motion/inline-alert";

export function InlineAlertPreview() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex w-full max-w-md flex-col gap-3">
      {open ? (
        <InlineAlert
          variant="warning"
          title="Storage is nearly full"
          dismissible
          open={open}
          onOpenChange={setOpen}
          action={<Button size="sm" variant="outline">Review files</Button>}
        >
          Less than 2 GB remains in your shared workspace. Archive old uploads to avoid sync failures.
        </InlineAlert>
      ) : (
        <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
          Reopen alert
        </Button>
      )}

      <InlineAlert variant="success" title="Backup completed">
        128 design assets were safely copied to cold storage 2 minutes ago.
      </InlineAlert>
    </div>
  );
}
