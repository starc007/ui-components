"use client";

import { Faq } from "@/components/blocks/faq";

export function FaqPreview() {
  return (
    <Faq
      description="Everything you'd want to ask before shipping."
      items={[
        { id: "1", title: "Do I need to install a package?", content: "No. Components are designed to be copy-pasted into your project." },
        { id: "2", title: "Is this Tailwind v4?", content: "Yes — tokens are declared via @theme in CSS." },
        { id: "3", title: "Can I use my own theme?", content: "Edit the OKLCH tokens in globals.css to match your brand." },
        { id: "4", title: "Does it work with React Server Components?", content: "Yes. Client-only components are explicitly marked." },
      ]}
    />
  );
}
