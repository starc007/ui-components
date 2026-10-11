"use client";

import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";

export function RadioDescriptionPreview() {
  const [schedule, setSchedule] = useState("once");

  return (
    <RadioGroup value={schedule} onValueChange={setSchedule} className="w-full max-w-64">
      <RadioGroupItem
        value="once"
        label="Run once"
        description="Runs a single time, right now."
      />
      <RadioGroupItem
        value="schedule"
        label="Run on a schedule"
        description="Repeats on a set interval until stopped."
      />
      <RadioGroupItem
        value="trigger"
        label="Run on a trigger"
        description="Waits for an event before it starts."
      />
      <RadioGroupItem
        value="manual"
        label="Manual approval"
        description="Not available on your plan."
        disabled
      />
    </RadioGroup>
  );
}
