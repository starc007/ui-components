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
  {
    id: "evidence-question",
    from: "user",
    content: "How should we present tool results?",
  },
  {
    id: "evidence-answer",
    from: "assistant",
    content: "Keep results close to the action that produced them.",
  },
  {
    id: "approval-question",
    from: "user",
    content: "What about actions that need confirmation?",
  },
  {
    id: "approval-answer",
    from: "assistant",
    content: "Pause the run, explain the impact, and ask before continuing.",
  },
  {
    id: "summary-question",
    from: "user",
    content: "Can the transcript stay easy to navigate?",
  },
  {
    id: "summary-answer",
    from: "assistant",
    content: "Use the rail to jump between turns without losing your place.",
  },
];

export function MessageScrollerPreview() {
  return (
    <ChatPreview
      initialMessages={MESSAGES}
      showRail
      reply="The viewport follows while you stay at the live edge. Scroll upward while this response streams and it will leave your reading position alone."
      placeholder="Send another message…"
    />
  );
}
