"use client";

import { Bot, RotateCcw, User } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageBubble,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/agents/message";
import { StreamingResponse } from "@/components/agents/streaming-response";

export function MessageBubbleAvatarsPreview() {
  const timer = useRef<number | undefined>(undefined);
  const [run, setRun] = useState(0);
  const [step, setStep] = useState(0);

  const replay = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setStep(0);
    setRun((value) => value + 1);
  }, []);

  useEffect(() => {
    if (step >= 2) return;
    timer.current = window.setTimeout(
      () => setStep((value) => value + 1),
      step === 0 ? 650 : 900,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step]);

  return (
    <div className="flex h-[410px] w-full max-w-xl flex-col justify-center px-3">
      <MessageGroup key={run} spacing="default">
        <Message from="user">
          <MessageAvatar className="bg-foreground text-background">
            <User />
          </MessageAvatar>
          <MessageContent>
            <MessageHeader>
              <span className="font-medium text-foreground/70">You</span>
              <span>Now</span>
            </MessageHeader>
            <MessageBubble variant="solid">
              <MessageBubbleContent>
                Can you turn these notes into a launch update?
              </MessageBubbleContent>
            </MessageBubble>
            <MessageFooter>Delivered</MessageFooter>
          </MessageContent>
        </Message>

        <AnimatePresence mode="popLayout">
          {step >= 1 ? (
            <Message key="draft" from="assistant">
              <MessageAvatar>
                <Bot />
              </MessageAvatar>
              <MessageContent>
                <MessageHeader>
                  <span className="font-medium text-foreground/70">Assistant</span>
                  <span>Just now</span>
                </MessageHeader>
                <MessageBubble variant="soft">
                  <MessageBubbleContent>
                    <StreamingResponse status="complete" showActions={false}>
                      Absolutely. I’ll keep it concise and lead with what changed.
                    </StreamingResponse>
                  </MessageBubbleContent>
                </MessageBubble>
              </MessageContent>
            </Message>
          ) : null}

          {step >= 2 ? (
            <Message key="follow-up" from="assistant">
              <MessageAvatar placeholder />
              <MessageContent>
                <MessageBubble variant="soft">
                  <MessageBubbleContent>
                    <StreamingResponse status="complete" showActions={false}>
                      Do you want the tone to feel more technical or more customer-facing?
                    </StreamingResponse>
                  </MessageBubbleContent>
                </MessageBubble>
              </MessageContent>
            </Message>
          ) : null}
        </AnimatePresence>
      </MessageGroup>

      <div className="flex h-11 items-end justify-center">
        <button
          type="button"
          onClick={replay}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-3.5" />
          Replay
        </button>
      </div>
    </div>
  );
}
