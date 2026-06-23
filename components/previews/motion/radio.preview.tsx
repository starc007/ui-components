"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";

export function RadioPreview() {
  const [plan, setPlan] = useState("pro");

  return (
    <RadioGroup value={plan} onValueChange={setPlan} className="min-w-48">
      <RadioGroupItem value="starter" label="Starter — free" />
      <RadioGroupItem value="pro" label="Pro — $12/mo" />
      <RadioGroupItem value="team" label="Team — $29/mo" />
      <RadioGroupItem value="legacy" label="Legacy plan" disabled />
    </RadioGroup>
  );
}
