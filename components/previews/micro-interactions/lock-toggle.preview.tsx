"use client";

import { useState } from "react";
import { LockToggle } from "@/components/motion/lock-toggle";
import { useAutoplay } from "./autoplay";

export function LockTogglePreview() {
  const [locked, setLocked] = useState(true);
  const stage = useAutoplay(() => setLocked((value) => !value), 1600);

  return (
    <div {...stage}>
      <LockToggle locked={locked} onLockedChange={setLocked} />
    </div>
  );
}
