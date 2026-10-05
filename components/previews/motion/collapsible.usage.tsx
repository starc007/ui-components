"use client";

import { Button } from "@/components/motion/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
  useCollapsible,
} from "@/components/motion/collapsible";

function Details() {
  const { open, setOpen } = useCollapsible();

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-medium">Additional information</span>
        <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
          {open ? "Hide details" : "Show details"}
          <CollapsibleIndicator />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent contentClassName="space-y-3 pt-3 text-sm text-muted-foreground">
        <p>Keep extra information tucked away until you need it.</p>
        <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
          Close details
        </Button>
      </CollapsibleContent>
    </>
  );
}

export function CollapsibleUsage() {
  return (
    <Collapsible
      className="max-w-sm rounded-xl border border-border bg-background p-4"
      contentClassName="grid"
    >
      <Details />
    </Collapsible>
  );
}
