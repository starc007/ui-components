"use client";

import { Accordion } from "@/components/ui/accordion";

export function AccordionPreview() {
  return (
    <div className="w-full max-w-md">
      <Accordion
        items={[
          { id: "a", title: "What is beUI?", content: "An open-source set of React + Tailwind components, copy-paste friendly." },
          { id: "b", title: "Is it free?", content: "Yes, MIT licensed." },
          { id: "c", title: "Does it support dark mode?", content: "First-class light and dark themes via next-themes." },
        ]}
      />
    </div>
  );
}
