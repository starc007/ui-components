"use client";

import { useEffect, useState } from "react";
import type { ToolResultStatus } from "@/components/agents/tool-result";

export function useToolResultDemo(
  steps: number,
  interval = 420,
  finalStatus: Exclude<ToolResultStatus, "running"> = "success",
) {
  const [visible, setVisible] = useState(0);
  const [status, setStatus] = useState<ToolResultStatus>("running");

  useEffect(() => {
    const timers = Array.from({ length: steps }, (_, index) =>
      window.setTimeout(() => setVisible(index + 1), index * interval + 180),
    );
    timers.push(
      window.setTimeout(
        () => setStatus(finalStatus),
        steps * interval + 480,
      ),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [finalStatus, interval, steps]);

  return { visible, status };
}
