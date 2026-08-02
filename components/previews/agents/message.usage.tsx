"use client";

import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/agents/message";
import {
  MessageBubble,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";

export function MessageUsage() {
  return (
    <MessageGroup spacing="default">
      <Message from="user" animateIn>
        <MessageAvatar>Y</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>You</span>
            <span>Now</span>
          </MessageHeader>
          <MessageBubble variant="solid">
            <MessageBubbleContent>
              Can you summarize the release notes?
            </MessageBubbleContent>
          </MessageBubble>
          <MessageFooter>Delivered</MessageFooter>
        </MessageContent>
      </Message>

      <Message from="assistant">
        <MessageAvatar>AI</MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span>Assistant</span>
            <span>Just now</span>
          </MessageHeader>
          <MessageBubble variant="soft">
            <MessageBubbleContent>
              The release improves streaming, navigation, and recovery states.
            </MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </MessageGroup>
  );
}
