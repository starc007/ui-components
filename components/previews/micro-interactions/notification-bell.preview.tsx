"use client";

import { useState } from "react";
import { NotificationBell } from "@/components/motion/notification-bell";
import { useAutoplay } from "./autoplay";

export function NotificationBellPreview() {
  const [count, setCount] = useState(0);
  // A few arrive, then they are read and the badge clears.
  const stage = useAutoplay(() => setCount((value) => (value < 3 ? value + 1 : 0)), 1400);

  return (
    <div {...stage}>
      <NotificationBell count={count} onCountChange={setCount} />
    </div>
  );
}
