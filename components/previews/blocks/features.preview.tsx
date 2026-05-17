"use client";

import { Zap, ShieldCheck, Sparkles, Code, Palette, Globe } from "lucide-react";
import { Features } from "@/components/blocks/features";

export function FeaturesPreview() {
  return (
    <Features
      title="Built for craft"
      description="Every component composes, themes and animates the same way."
      features={[
        { icon: Zap, title: "Fast by default", description: "Server components, Tailwind v4, zero runtime CSS-in-JS.", span: "2" },
        { icon: ShieldCheck, title: "Accessible", description: "Keyboard, focus, ARIA — built in." },
        { icon: Sparkles, title: "Motion", description: "Tasteful animation with Motion." },
        { icon: Code, title: "Typed", description: "Strict TypeScript end to end." },
        { icon: Palette, title: "Themed", description: "OKLCH tokens, light + dark.", span: "2" },
        { icon: Globe, title: "Open source", description: "MIT licensed forever." },
      ]}
    />
  );
}
