"use client";

import { Bot, User } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
  MessageTyping,
} from "@/components/agents/message";
import {
  MessageBubble,
  MessageBubbleContent,
  type MessageBubbleVariant,
} from "@/components/agents/message-bubble";
import { MessageScroller } from "@/components/agents/message-scroller";
import { PromptInput } from "@/components/agents/prompt-input";
import { StreamingResponse } from "@/components/agents/streaming-response";
import { cn } from "@/lib/utils";

export interface ChatPreviewMessage {
  id: string;
  from: "user" | "assistant";
  content: string;
}

interface RenderedChatMessage extends ChatPreviewMessage {
  animateIn: boolean;
  streaming?: boolean;
}

export interface ChatPreviewProps {
  initialMessages?: ChatPreviewMessage[];
  reply?: string | ((prompt: string) => string);
  showAvatars?: boolean;
  showMetadata?: boolean;
  showRail?: boolean;
  assistantVariant?: MessageBubbleVariant;
  userVariant?: MessageBubbleVariant;
  placeholder?: string;
  className?: string;
  viewportClassName?: string;
}

const DEFAULT_MESSAGES: ChatPreviewMessage[] = [
  {
    id: "welcome-question",
    from: "user",
    content: "What should we include in the first release?",
  },
  {
    id: "welcome-answer",
    from: "assistant",
    content: "Start with the smallest workflow that still feels complete.",
  },
];

const DEFAULT_REPLY =
  "I’d include composing a prompt, following a streamed answer, recovering from an error, and returning to the latest response without losing the reader’s place.";
const CHARACTERS_PER_SECOND = 96;
const STREAM_DELAY = 140;

export function ChatPreview({
  initialMessages = DEFAULT_MESSAGES,
  reply = DEFAULT_REPLY,
  showAvatars = false,
  showMetadata = false,
  showRail = false,
  assistantVariant = "soft",
  userVariant = "solid",
  placeholder = "Send a message…",
  className,
  viewportClassName,
}: ChatPreviewProps) {
  const reduce = useReducedMotion() ?? false;
  const nextId = useRef(0);
  const replyTimer = useRef<number | undefined>(undefined);
  const [messages, setMessages] = useState<RenderedChatMessage[]>(() =>
    initialMessages.map((message) => ({ ...message, animateIn: false })),
  );
  const [pending, setPending] = useState(false);
  const [activeReply, setActiveReply] = useState<{
    id: string;
    content: string;
  } | null>(null);
  const loading = pending || activeReply !== null;

  useEffect(() => {
    if (!activeReply) return;

    if (reduce) {
      setMessages((current) =>
        current.map((message) =>
          message.id === activeReply.id
            ? { ...message, content: activeReply.content, streaming: false }
            : message,
        ),
      );
      setActiveReply(null);
      return;
    }

    const startedAt = performance.now() + STREAM_DELAY;
    let frame = 0;
    const stream = (now: number) => {
      const cursor = Math.min(
        activeReply.content.length,
        Math.floor(
          (Math.max(0, now - startedAt) / 1000) * CHARACTERS_PER_SECOND,
        ),
      );
      const content = activeReply.content.slice(0, cursor);
      setMessages((current) =>
        current.map((message) =>
          message.id === activeReply.id && message.content !== content
            ? { ...message, content }
            : message,
        ),
      );

      if (cursor < activeReply.content.length) {
        frame = requestAnimationFrame(stream);
      } else {
        setMessages((current) =>
          current.map((message) =>
            message.id === activeReply.id
              ? { ...message, streaming: false }
              : message,
          ),
        );
        setActiveReply(null);
      }
    };

    frame = requestAnimationFrame(stream);
    return () => cancelAnimationFrame(frame);
  }, [activeReply, reduce]);

  useEffect(
    () => () => {
      if (replyTimer.current) window.clearTimeout(replyTimer.current);
    },
    [],
  );

  const submit = useCallback(
    (prompt: string) => {
      if (loading) return;

      const run = nextId.current++;
      const userId = `sent-user-${run}`;
      const assistantId = `sent-assistant-${run}`;
      const response = typeof reply === "function" ? reply(prompt) : reply;

      setMessages((current) => [
        ...current,
        { id: userId, from: "user", content: prompt, animateIn: true },
      ]);
      setPending(true);

      replyTimer.current = window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: assistantId,
            from: "assistant",
            content: "",
            animateIn: true,
            streaming: true,
          },
        ]);
        setPending(false);
        setActiveReply({ id: assistantId, content: response });
      }, reduce ? 0 : 420);
    },
    [loading, reduce, reply],
  );

  const stop = useCallback(() => {
    if (replyTimer.current) window.clearTimeout(replyTimer.current);
    replyTimer.current = undefined;
    setPending(false);
    setMessages((current) =>
      current.map((message) =>
        message.streaming ? { ...message, streaming: false } : message,
      ),
    );
    setActiveReply(null);
  }, []);

  return (
    <div
      className={cn(
        "flex h-[440px] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-border/70 bg-background",
        className,
      )}
    >
      <MessageScroller
        busy={loading}
        navigation={showRail ? "rail" : undefined}
        className="min-h-0 flex-1"
        viewportClassName={cn("px-3 py-4", viewportClassName)}
        contentClassName="min-h-full"
      >
        <MessageGroup spacing="default">
          {messages.map((message) => (
            <Message
              key={message.id}
              id={message.id}
              from={message.from}
              animateIn={message.from === "user" && message.animateIn}
            >
              {showAvatars ? (
                <MessageAvatar>
                  {message.from === "user" ? <User /> : <Bot />}
                </MessageAvatar>
              ) : null}
              <MessageContent>
                {showMetadata ? (
                  <MessageHeader>
                    <span className="font-medium text-foreground/70">
                      {message.from === "user" ? "You" : "Assistant"}
                    </span>
                    <span>{message.streaming ? "Responding" : "Now"}</span>
                  </MessageHeader>
                ) : null}
                <MessageBubble
                  variant={
                    message.from === "user" ? userVariant : assistantVariant
                  }
                  animateIn={false}
                >
                  <MessageBubbleContent>
                    {message.from === "assistant" ? (
                      <StreamingResponse
                        status={message.streaming ? "streaming" : "complete"}
                        showActions={false}
                        announce={false}
                      >
                        {message.content || <MessageTyping />}
                      </StreamingResponse>
                    ) : (
                      message.content
                    )}
                  </MessageBubbleContent>
                </MessageBubble>
                {showMetadata && message.from === "user" ? (
                  <MessageFooter>Sent</MessageFooter>
                ) : null}
              </MessageContent>
            </Message>
          ))}
          {pending ? (
            <Message id="pending-assistant" from="assistant">
              {showAvatars ? (
                <MessageAvatar>
                  <Bot />
                </MessageAvatar>
              ) : null}
              <MessageContent>
                <MessageTyping label="Preparing response" />
              </MessageContent>
            </Message>
          ) : null}
        </MessageGroup>
      </MessageScroller>

      <div className="shrink-0 border-t border-border/60 p-2">
        <PromptInput
          minRows={1}
          maxRows={1}
          loading={loading}
          onSubmit={submit}
          onStop={stop}
          placeholder={placeholder}
          className="border-0 bg-muted shadow-none focus-within:border-transparent"
        />
      </div>
    </div>
  );
}
