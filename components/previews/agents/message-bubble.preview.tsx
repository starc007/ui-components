"use client";

import { ChatPreview } from "@/components/previews/agents/chat-preview";

export function MessageBubblePreview() {
  return (
    <ChatPreview
      reply="That message mounted once with a spring pop. Streaming updates only change its content, so the entrance does not replay."
      placeholder="Send a bubble…"
    />
  );
}
