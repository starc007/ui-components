"use client";

import { Cta } from "@/components/blocks/cta";

export function CtaPreview() {
  return (
    <Cta
      title="Ready to ship something good?"
      description="Copy-paste components, theme them once, focus on the work that matters."
      primary={{ label: "Get started", href: "#" }}
      secondary={{ label: "Documentation", href: "#" }}
    />
  );
}
