"use client";

import { ArrowUpRight } from "lucide-react";
import { SharedLayoutBg } from "@/components/motion/shared-layout-bg";

const items = [
  { title: "Neon Dreams", body: "Where pixels dance and gradients collide in perfect harmony." },
  { title: "Quantum Interface", body: "Bridging the gap between imagination and digital reality." },
  { title: "Ethereal Canvas", body: "A blank slate whispering possibilities into existence." },
  { title: "Vector Whispers", body: "Lines and curves carrying the weight of every interaction." },
];

export function SharedLayoutBgPreview() {
  return (
    <div className="w-full max-w-lg px-2">
      <SharedLayoutBg>
        {items.map((it) => (
          <a
            key={it.title}
            href="#"
            className="group flex flex-col gap-1 px-2 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-(--color-fg)">{it.title}</span>
              <ArrowUpRight className="h-3.5 w-3.5 text-(--color-fg-muted) transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <p className="text-sm text-(--color-fg-muted)">{it.body}</p>
          </a>
        ))}
      </SharedLayoutBg>
    </div>
  );
}
