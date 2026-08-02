"use client";

import { Check, Sparkles } from "lucide-react";
import { useState } from "react";
import {
  MessageBubble,
  MessageBubbleContent,
  MessageBubbleGroup,
} from "@/components/agents/message-bubble";
import { StreamingResponse } from "@/components/agents/streaming-response";

export function MessageBubblePreview() {
  const [saved, setSaved] = useState(false);

  return (
    <div className="flex h-[390px] w-full max-w-xl items-center px-3">
      <MessageBubbleGroup spacing="default">
        <MessageBubble variant="soft">
          <MessageBubbleContent>
            <StreamingResponse status="complete" showActions={false}>
              I found two directions that keep the release focused.
            </StreamingResponse>
          </MessageBubbleContent>
        </MessageBubble>

        <MessageBubble variant="soft">
          <MessageBubbleContent>
            <StreamingResponse status="complete" showActions={false}>
              The first prioritizes speed. The second leaves more room for teams
              with custom workflows.
            </StreamingResponse>
          </MessageBubbleContent>
        </MessageBubble>

        <MessageBubble variant="solid" align="end">
          <MessageBubbleContent>
            Keep the first release focused. We can expand after feedback.
          </MessageBubbleContent>
        </MessageBubble>

        <MessageBubble variant="tint" align="end">
          <MessageBubbleContent
            render={
              <button type="button" onClick={() => setSaved((value) => !value)} />
            }
          >
            <span className="flex items-center gap-2">
              {saved ? <Check className="size-3.5" /> : <Sparkles className="size-3.5" />}
              {saved ? "Direction saved" : "Save this direction"}
            </span>
          </MessageBubbleContent>
        </MessageBubble>
      </MessageBubbleGroup>
    </div>
  );
}
