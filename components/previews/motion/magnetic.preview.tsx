"use client";

import { Magnetic } from "@/components/motion/magnetic";

export function MagneticPreview() {
  return (
    <div className="flex items-center justify-center p-12">
      <Magnetic>
        <button className="rounded-full bg-(--color-accent) px-8 py-4 text-sm font-semibold text-(--color-accent-fg) shadow-[0_0_40px_-8px_var(--color-accent)]">
          Hover me
        </button>
      </Magnetic>
    </div>
  );
}
