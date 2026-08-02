"use client";

import {
  MessageBubble,
  MessageBubbleContent,
  MessageBubbleGroup,
} from "@/components/agents/message-bubble";

export function MessageBubbleUsage() {
  return (
    <MessageBubbleGroup spacing="default">
      <MessageBubble align="end" variant="solid">
        <MessageBubbleContent>
          Can you summarize the release notes?
        </MessageBubbleContent>
      </MessageBubble>

      <MessageBubble align="start" variant="soft">
        <MessageBubbleContent>
          The release improves streaming, navigation, and recovery states.
        </MessageBubbleContent>
      </MessageBubble>
    </MessageBubbleGroup>
  );
}
