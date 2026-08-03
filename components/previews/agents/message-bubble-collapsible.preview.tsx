"use client";

import { Bot } from "lucide-react";
import {
  MessageBubble,
  MessageBubbleCollapsible,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageHeader,
} from "@/components/agents/message";
import { StreamingResponse } from "@/components/agents/streaming-response";

export function MessageBubbleCollapsiblePreview() {
  return (
    <div className="flex h-[410px] w-full max-w-xl items-start px-3 pt-14">
      <Message from="assistant">
        <MessageAvatar>
          <Bot />
        </MessageAvatar>
        <MessageContent>
          <MessageHeader>
            <span className="font-medium text-foreground/70">Assistant</span>
            <span>Summary</span>
          </MessageHeader>
          <MessageBubble variant="soft" animateIn={false}>
            <MessageBubbleContent className="max-w-[90%]">
              <StreamingResponse status="complete" showActions={false}>
                <MessageBubbleCollapsible collapsedLines={4}>
                  <p>
                    The release is ready for a focused rollout. The main conversation flow,
                    keyboard navigation, error recovery, and reduced-motion behavior are all
                    covered.
                  </p>
                  <p>
                    I would keep advanced workflow controls out of this version. They add
                    configuration without improving the first-run experience, and the usage
                    data from this release will give us a better basis for those decisions.
                  </p>
                  <p>
                    Before publishing, run the accessibility suite once more and verify the
                    streaming behavior with a long response on a smaller viewport.
                  </p>
                </MessageBubbleCollapsible>
              </StreamingResponse>
            </MessageBubbleContent>
          </MessageBubble>
        </MessageContent>
      </Message>
    </div>
  );
}
