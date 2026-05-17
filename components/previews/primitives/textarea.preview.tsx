"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function TextareaPreview() {
  const [value, setValue] = useState("This textarea grows as you type.\nTry it.");
  return (
    <div className="w-full max-w-md">
      <Textarea label="Bio" value={value} onChange={(e) => setValue(e.target.value)} hint="Auto-grows with content." />
    </div>
  );
}
