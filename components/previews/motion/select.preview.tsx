"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";

export function SelectPreview() {
  const [value, setValue] = useState("next");
  return (
    <div className="w-56">
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger>
          <SelectValue placeholder="Pick a framework" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="remix">Remix</SelectItem>
          <SelectItem value="astro">Astro</SelectItem>
          <SelectItem value="vite">Vite</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
