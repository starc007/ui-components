"use client";

import { Bot, RotateCcw, User } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageMarker,
  MessageScroller,
  MessageTyping,
} from "@/components/agents/message";
import {
  MessageBubble,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";
import { StreamingResponse } from "@/components/agents/streaming-response";

const RESPONSE_PIECES = [
  "Start with a focused release. ",
  "Ship the complete conversation flow, ",
  "including keyboard navigation and reduced motion.",
  "Then validate these states:",
  "Empty conversation",
  "Streaming response",
  "Failed response with retry",
  "That keeps the first version small without leaving the experience unfinished.",
] as const;

const PIECE_STARTS = RESPONSE_PIECES.map((_, index) =>
  RESPONSE_PIECES.slice(0, index).reduce(
    (total, piece) => total + piece.length,
    0,
  ),
);
const RESPONSE_LENGTH = RESPONSE_PIECES.reduce(
  (total, piece) => total + piece.length,
  0,
);
const RESPONSE_MARKDOWN = `Start with a focused release. Ship the complete conversation flow, including keyboard navigation and reduced motion.

Then validate these states:

- Empty conversation
- Streaming response
- Failed response with retry

That keeps the first version small without leaving the experience unfinished.`;
const CHARACTERS_PER_SECOND = 105;
const RESPONSE_DELAY = 500;

function MessageConversation({ onReplay }: { onReplay: () => void }) {
  const reduce = useReducedMotion() ?? false;
  const [cursor, setCursor] = useState(reduce ? RESPONSE_LENGTH : 0);
  const [complete, setComplete] = useState(reduce);

  useEffect(() => {
    if (reduce) {
      setCursor(RESPONSE_LENGTH);
      setComplete(true);
      return;
    }

    setCursor(0);
    setComplete(false);

    const startedAt = performance.now() + RESPONSE_DELAY;
    let frame = 0;
    let completionTimer: number | undefined;

    const stream = (now: number) => {
      const nextCursor = Math.min(
        RESPONSE_LENGTH,
        Math.floor(
          (Math.max(0, now - startedAt) / 1000) * CHARACTERS_PER_SECOND,
        ),
      );
      setCursor((current) =>
        current === nextCursor ? current : nextCursor,
      );

      if (nextCursor < RESPONSE_LENGTH) {
        frame = requestAnimationFrame(stream);
      } else {
        completionTimer = window.setTimeout(() => setComplete(true), 350);
      }
    };

    frame = requestAnimationFrame(stream);
    return () => {
      cancelAnimationFrame(frame);
      if (completionTimer) window.clearTimeout(completionTimer);
    };
  }, [reduce]);

  const reveal = (index: number) =>
    RESPONSE_PIECES[index].slice(
      0,
      Math.max(0, cursor - PIECE_STARTS[index]),
    );
  const started = (index: number) => cursor > PIECE_STARTS[index];

  return (
    <div className="flex h-[440px] w-full max-w-xl flex-col">
      <MessageScroller
        className="flex-1"
        viewportClassName="px-2 py-4"
      >
        <MessageGroup spacing="default">
          <MessageMarker>Project context added</MessageMarker>

          <Message from="user">
            <MessageAvatar>
              <User />
            </MessageAvatar>
            <MessageContent>
              <MessageHeader>
                <span className="font-medium text-foreground/70">You</span>
                <span>Now</span>
              </MessageHeader>
              <MessageBubble variant="solid">
                <MessageBubbleContent>
                  Help me decide what belongs in the first release.
                </MessageBubbleContent>
              </MessageBubble>
              <MessageFooter>Delivered</MessageFooter>
            </MessageContent>
          </Message>

          <Message from="assistant">
            <MessageAvatar>
              <Bot />
            </MessageAvatar>
            <MessageContent className="max-w-[88%]">
              <MessageHeader>
                <span className="font-medium text-foreground/70">
                  Assistant
                </span>
                <span>{complete ? "Just now" : "Responding"}</span>
              </MessageHeader>
              <MessageBubble variant="ghost">
                <MessageBubbleContent>
                  <StreamingResponse
                    status={complete ? "complete" : "streaming"}
                    copyText={RESPONSE_MARKDOWN}
                    onRetry={onReplay}
                    announce={false}
                  >
                    {cursor > 0 ? (
                      <>
                        <p>
                          {reveal(0)}
                          {reveal(1)}
                          {reveal(2)}
                        </p>
                        {started(3) ? <p>{reveal(3)}</p> : null}
                        {started(4) ? (
                          <ul>
                            <li>{reveal(4)}</li>
                            {started(5) ? <li>{reveal(5)}</li> : null}
                            {started(6) ? <li>{reveal(6)}</li> : null}
                          </ul>
                        ) : null}
                        {started(7) ? <p>{reveal(7)}</p> : null}
                      </>
                    ) : (
                      <MessageTyping />
                    )}
                  </StreamingResponse>
                </MessageBubbleContent>
              </MessageBubble>
            </MessageContent>
          </Message>
        </MessageGroup>
      </MessageScroller>

      <div className="flex h-11 shrink-0 items-end justify-center">
        <button
          type="button"
          onClick={onReplay}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3.5" />
          Replay
        </button>
      </div>
    </div>
  );
}

export function MessagePreview() {
  const [run, setRun] = useState(0);

  return (
    <MessageConversation
      key={run}
      onReplay={() => setRun((value) => value + 1)}
    />
  );
}
