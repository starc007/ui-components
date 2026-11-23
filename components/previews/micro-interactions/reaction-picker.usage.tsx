"use client";

import { ReactionPicker } from "@/components/motion/reaction-picker";

export function ReactionPickerUsage() {
  return (
    <div className="pt-12">
      <ReactionPicker count={24} />
    </div>
  );
}
