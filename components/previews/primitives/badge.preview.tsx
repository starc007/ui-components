"use client";

import { Badge } from "@/components/ui/badge";

export function BadgePreview() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge>Default</Badge>
      <Badge variant="accent">Accent</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge dot dotColor="var(--color-success)">Online</Badge>
      <Badge dot dotColor="var(--color-warning)">Idle</Badge>
    </div>
  );
}
