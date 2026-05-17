"use client";

import { useState } from "react";
import { Select } from "@/components/ui/select";

const options = [
  { value: "next", label: "Next.js" },
  { value: "remix", label: "Remix" },
  { value: "astro", label: "Astro" },
  { value: "vite", label: "Vite" },
];

export function SelectPreview() {
  const [value, setValue] = useState<string | null>("next");
  return (
    <div className="w-full max-w-xs">
      <Select label="Framework" value={value} onChange={setValue} options={options} />
    </div>
  );
}
