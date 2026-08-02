"use client";

import {
  ChatPreview,
  type ChatPreviewMessage,
} from "@/components/previews/agents/chat-preview";

const MESSAGES: ChatPreviewMessage[] = [
  {
    id: "scope-question",
    from: "user",
    content: "What should the first release include?",
  },
  {
    id: "scope-answer",
    from: "assistant",
    content: "Start with the smallest workflow that still feels complete.",
  },
  {
    id: "states-question",
    from: "user",
    content: "Include streaming and recovery states too.",
  },
  {
    id: "states-answer",
    from: "assistant",
    content: "Yes. Those states make the first version feel dependable.",
  },
];

export function MessageScrollerPreview() {
  return (
    <ChatPreview
      initialMessages={MESSAGES}
      reply="The viewport follows while you stay at the live edge. Scroll upward while this response streams and it will leave your reading position alone."
      placeholder="Send another message…"
    />
  );
}
