"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithRef,
  createContext,
  type ReactNode,
  useContext,
} from "react";
import { EASE_OUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { MessageSideContext } from "@/components/agents/message-context";

export {
  MessageBubble,
  MessageBubbleCollapsible,
  MessageBubbleContent,
  MessageBubbleGroup,
} from "@/components/agents/message-bubble";
export { MessageScroller } from "@/components/agents/message-scroller";
export type { MessageScrollerProps } from "@/components/agents/message-scroller";

export type MessageFrom = "user" | "assistant";

interface MessageContextValue {
  from: MessageFrom;
}

const MessageContext = createContext<MessageContextValue>({
  from: "assistant",
});

export interface MessageProps
  extends Omit<ComponentPropsWithRef<typeof motion.article>, "children"> {
  from: MessageFrom;
  /** Plays a trailing-edge pop-up once when this message row mounts. */
  animateIn?: boolean;
  children: ReactNode;
}

export interface MessageGroupProps extends ComponentPropsWithRef<"div"> {
  spacing?: "compact" | "default";
}

export interface MessageAvatarProps extends ComponentPropsWithRef<"div"> {
  /** Keep an empty avatar slot so grouped messages remain aligned. */
  placeholder?: boolean;
}

export type MessageContentProps = ComponentPropsWithRef<"div">;
export type MessageHeaderProps = ComponentPropsWithRef<"div">;
export type MessageFooterProps = ComponentPropsWithRef<"div">;

export type MessageMarkerProps = ComponentPropsWithRef<"div">;

export interface MessageTypingProps extends ComponentPropsWithRef<"span"> {
  label?: string;
}

// A sent row should rise from the live edge without changing measured layout.
const MESSAGE_POP_UP = {
  type: "spring",
  stiffness: 480,
  damping: 32,
  mass: 0.62,
} as const;

export function Message({
  from,
  animateIn = false,
  children,
  className,
  initial,
  animate,
  transition,
  exit,
  style,
  ...props
}: MessageProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <MessageSideContext.Provider value={from === "user" ? "end" : "start"}>
      <MessageContext.Provider value={{ from }}>
        <motion.article
          data-slot="message"
          data-from={from}
          aria-label={props["aria-label"] ?? `${from} message`}
          initial={
            initial ??
            (animateIn && !reduce
              ? {
                  opacity: 0,
                  transform: "translateY(8px) scale(0.95)",
                }
              : false)
          }
          animate={
            animate ??
            (animateIn && !reduce
              ? {
                  opacity: 1,
                  transform: "translateY(0px) scale(1)",
                }
              : { opacity: 1 })
          }
          exit={
            exit ??
            (reduce
              ? { opacity: 0 }
              : {
                  opacity: 0,
                  transform: "translateY(-3px) scale(0.99)",
                })
          }
          transition={
            transition ?? (reduce ? { duration: 0.12 } : MESSAGE_POP_UP)
          }
          style={{
            transformOrigin: from === "user" ? "100% 100%" : "0% 100%",
            ...style,
          }}
          className={cn(
            "group/message flex w-full items-start gap-2",
            from === "user" ? "flex-row-reverse" : "flex-row",
            className,
          )}
          {...props}
        >
          {children}
        </motion.article>
      </MessageContext.Provider>
    </MessageSideContext.Provider>
  );
}

export function MessageGroup({
  spacing = "compact",
  className,
  ...props
}: MessageGroupProps) {
  return (
    <div
      data-slot="message-group"
      className={cn(
        "flex w-full flex-col",
        spacing === "compact" ? "gap-1.5" : "gap-4",
        className,
      )}
      {...props}
    />
  );
}

export function MessageAvatar({
  placeholder = false,
  children,
  className,
  ...props
}: MessageAvatarProps) {
  return (
    <div
      data-slot="message-avatar"
      aria-hidden={placeholder || undefined}
      className={cn(
        "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground [&_img]:size-full [&_img]:object-cover [&_svg]:size-3.5",
        placeholder && "invisible",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MessageContent({ className, ...props }: MessageContentProps) {
  const { from } = useContext(MessageContext);

  return (
    <div
      data-slot="message-content"
      className={cn(
        "flex min-w-0 flex-1 flex-col gap-1.5",
        from === "user" ? "items-end" : "items-start",
        className,
      )}
      {...props}
    />
  );
}

export function MessageHeader({ className, ...props }: MessageHeaderProps) {
  const { from } = useContext(MessageContext);

  return (
    <div
      data-slot="message-header"
      className={cn(
        "flex items-center gap-1.5 px-1 text-[11px] leading-none text-muted-foreground",
        from === "user" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

export function MessageFooter({ className, ...props }: MessageFooterProps) {
  const { from } = useContext(MessageContext);

  return (
    <div
      data-slot="message-footer"
      className={cn(
        "flex min-h-5 items-center gap-1 px-1 text-[11px] text-muted-foreground",
        from === "user" ? "justify-end" : "justify-start",
        className,
      )}
      {...props}
    />
  );
}

export function MessageMarker({ className, ...props }: MessageMarkerProps) {
  return (
    <div
      data-slot="message-marker"
      className={cn(
        "mx-auto flex w-fit max-w-[88%] items-center gap-1.5 rounded-full bg-muted/70 px-2.5 py-1 text-center text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function MessageTyping({
  label = "Responding",
  className,
  ...props
}: MessageTypingProps) {
  const reduce = useReducedMotion() ?? false;

  return (
    <span
      data-slot="message-typing"
      className={cn("inline-flex h-5 items-center gap-1", className)}
      {...props}
    >
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          aria-hidden="true"
          className="size-1 rounded-full bg-current"
          animate={
            reduce
              ? { opacity: 0.45 }
              : { opacity: [0.28, 0.85, 0.28], y: [0, -2, 0] }
          }
          transition={{
            duration: 1.05,
            ease: EASE_OUT,
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.14,
          }}
        />
      ))}
    </span>
  );
}
