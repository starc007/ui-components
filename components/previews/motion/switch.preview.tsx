"use client";

import { useState } from "react";
import { Switch } from "@/components/motion/switch";

export function SwitchPreview() {
  const [on, setOn] = useState(true);
  return (
    <div className="flex flex-col gap-3">
      <Switch checked={on} onCheckedChange={setOn} label="Enable notifications" />
      <Switch checked={false} onCheckedChange={() => {}} label="Off" />
      <Switch checked disabled onCheckedChange={() => {}} label="Disabled" />
    </div>
  );
}
