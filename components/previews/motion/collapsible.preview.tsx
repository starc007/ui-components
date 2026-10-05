"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleIndicator,
  CollapsibleTrigger,
} from "@/components/motion/collapsible";

export function CollapsiblePreview() {
  return (
    <Collapsible className="max-w-sm rounded-xl border border-border bg-background p-1">
      <CollapsibleTrigger>
        More details
        <CollapsibleIndicator />
      </CollapsibleTrigger>
      <CollapsibleContent contentClassName="px-3 pb-3 pt-1 text-sm leading-6 text-muted-foreground">
        <p>Keep extra information tucked away until you need it.</p>
      </CollapsibleContent>
    </Collapsible>
  );
}
