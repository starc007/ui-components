"use client";

import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";

export function CheckboxPreview() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Checkbox label="Subscribe to updates" checked={a} onChange={(e) => setA(e.target.checked)} />
      <Checkbox label="Unchecked" checked={b} onChange={(e) => setB(e.target.checked)} />
      <Checkbox label="Indeterminate" indeterminate checked={false} readOnly />
      <Checkbox label="Disabled" disabled />
    </div>
  );
}
