"use client";

import { useState } from "react";
import { NotificationBell } from "@/components/motion/notification-bell";

export function NotificationBellUsage() {
  const [count, setCount] = useState(3);
  return <NotificationBell count={count} onCountChange={setCount} />;
}
