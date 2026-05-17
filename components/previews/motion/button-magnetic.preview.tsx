"use client";

import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/motion/button";

export function ButtonMagneticPreview() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <MagneticButton variant="primary" size="md" strength={0.35}>
        Hover me
        <ArrowRight className="h-4 w-4" />
      </MagneticButton>
      <MagneticButton variant="secondary" size="md" strength={0.25}>
        Subtle pull
      </MagneticButton>
      <MagneticButton variant="outline" size="md" strength={0.5}>
        Strong pull
      </MagneticButton>
    </div>
  );
}
