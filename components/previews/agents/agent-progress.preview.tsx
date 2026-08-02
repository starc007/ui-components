"use client";

import { AgentProgress } from "@/components/agents/loading-states/agent-progress";

export function AgentProgressPreview() {
  return (
    <AgentProgress
      label="Churning"
      initialSeconds={151.6}
      className="text-base"
    />
  );
}
