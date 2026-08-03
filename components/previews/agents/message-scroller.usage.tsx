"use client";

import {
  Message,
  MessageContent,
  MessageGroup,
} from "@/components/agents/message";
import {
  MessageBubble,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";
import { MessageScroller } from "@/components/agents/message-scroller";

const messages = [
  {
    id: "release-question",
    from: "user" as const,
    content: "What should the first release include?",
  },
  {
    id: "release-answer",
    from: "assistant" as const,
    content: "Start with the smallest workflow that still feels complete.",
  },
  {
    id: "states-question",
    from: "user" as const,
    content: "Include streaming and recovery states too.",
  },
  {
    id: "states-answer",
    from: "assistant" as const,
    content: "Yes. Those states make the first version feel dependable.",
  },
];

export function MessageScrollerUsage() {
  return (
    <MessageScroller
      navigation="rail"
      className="h-[420px]"
      viewportClassName="px-4 py-5"
      contentClassName="min-h-full"
    >
      <MessageGroup spacing="default">
        {messages.map((message) => (
          <Message key={message.id} id={message.id} from={message.from}>
            <MessageContent>
              <MessageBubble
                variant={message.from === "user" ? "solid" : "soft"}
              >
                <MessageBubbleContent>{message.content}</MessageBubbleContent>
              </MessageBubble>
            </MessageContent>
          </Message>
        ))}
      </MessageGroup>
    </MessageScroller>
  );
}
