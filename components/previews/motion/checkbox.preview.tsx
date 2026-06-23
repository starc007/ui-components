"use client";

import { useState } from "react";
import { Checkbox } from "@/components/motion/checkbox";

export function CheckboxPreview() {
  const [terms, setTerms] = useState(true);
  const [updates, setUpdates] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Checkbox
        checked={terms}
        onCheckedChange={setTerms}
        label="Accept terms and conditions"
      />
      <Checkbox
        checked={updates}
        onCheckedChange={setUpdates}
        label="Email me product updates"
      />
      <Checkbox checked indeterminate onCheckedChange={() => {}} label="Select all (partial)" />
      <Checkbox checked disabled onCheckedChange={() => {}} label="Disabled" />
    </div>
  );
}
