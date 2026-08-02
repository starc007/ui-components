"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type ComponentPropsWithRef,
  createContext,
  type ReactNode,
  type Ref,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { EASE_OUT, SPRING_LAYOUT } from "@/lib/ease";
import { cn } from "@/lib/utils";
import { MessageSideContext } from "@/components/agents/message-context";

export {
  MessageBubble,
  MessageBubbleCollapsible,
  MessageBubbleContent,
  MessageBubbleGroup,
} from "@/components/agents/message-bubble";

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
  children: ReactNode;
}

export interface MessageScrollerProps extends ComponentPropsWithRef<"div"> {
  /** Keep streamed output pinned while the reader remains near the end. */
  followOutput?: boolean;
  /** Distance from the end that still counts as following the output. */
  followThreshold?: number;
  /** Smoothly follow growing content. */
  smooth?: boolean;
  /** Reports when the reader leaves or returns to the live edge. */
  onFollowChange?: (following: boolean) => void;
  label?: string;
  viewportClassName?: string;
  viewportRef?: Ref<HTMLDivElement>;
  viewportProps?: Omit<
    ComponentPropsWithRef<"div">,
    "children" | "className"
  >;
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

export function Message({
  from,
  children,
  className,
  transition,
  exit,
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
        initial={false}
        animate={{ opacity: 1 }}
        exit={
          exit ??
          (reduce
            ? { opacity: 0 }
            : { opacity: 0 })
        }
        transition={transition ?? (reduce ? { duration: 0.12 } : SPRING_LAYOUT)}
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

export function MessageScroller({
  followOutput = true,
  followThreshold = 56,
  smooth = true,
  onFollowChange,
  label = "Conversation",
  viewportClassName,
  viewportRef: externalViewportRef,
  viewportProps,
  className,
  children,
  ...props
}: MessageScrollerProps) {
  const reduce = useReducedMotion() ?? false;
  const viewportRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const followingRef = useRef(followOutput);
  const programmaticScrollRef = useRef(false);
  const scrollTimerRef = useRef<number | undefined>(undefined);
  const frameRef = useRef<number | undefined>(undefined);
  const {
    onScroll: onViewportScroll,
    onWheel: onViewportWheel,
    onTouchStart: onViewportTouchStart,
    ...restViewportProps
  } = viewportProps ?? {};

  const setViewportRef = useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node;
      if (typeof externalViewportRef === "function") {
        externalViewportRef(node);
      } else if (externalViewportRef) {
        externalViewportRef.current = node;
      }
    },
    [externalViewportRef],
  );

  const setFollowing = useCallback(
    (next: boolean) => {
      if (followingRef.current === next) return;
      followingRef.current = next;
      onFollowChange?.(next);
    },
    [onFollowChange],
  );

  const scrollToEnd = useCallback(
    (behavior: ScrollBehavior) => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      programmaticScrollRef.current = true;
      if (typeof viewport.scrollTo === "function") {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
      } else {
        viewport.scrollTop = viewport.scrollHeight;
      }
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = window.setTimeout(() => {
        programmaticScrollRef.current = false;
      }, behavior === "smooth" ? 320 : 0);
    },
    [],
  );

  const handleScroll = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport || programmaticScrollRef.current) return;

    const distance =
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
    setFollowing(distance <= followThreshold);
  }, [followThreshold, setFollowing]);

  const leaveLiveEdge = useCallback(() => {
    programmaticScrollRef.current = false;
  }, []);

  useLayoutEffect(() => {
    followingRef.current = followOutput;
    if (!followOutput) return;

    frameRef.current = requestAnimationFrame(() => scrollToEnd("auto"));
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [followOutput, scrollToEnd]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      if (!followOutput || !followingRef.current) return;
      scrollToEnd(reduce || !smooth ? "auto" : "smooth");
    });
    observer.observe(content);

    return () => observer.disconnect();
  }, [followOutput, reduce, scrollToEnd, smooth]);

  useEffect(
    () => () => {
      if (scrollTimerRef.current) window.clearTimeout(scrollTimerRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  return (
    <div
      data-slot="message-scroller"
      className={cn("min-h-0", className)}
      {...props}
    >
      <div
        ref={setViewportRef}
        role="log"
        aria-label={label}
        aria-live="polite"
        aria-relevant="additions text"
        {...restViewportProps}
        onScroll={(event) => {
          handleScroll();
          onViewportScroll?.(event);
        }}
        onWheel={(event) => {
          leaveLiveEdge();
          onViewportWheel?.(event);
        }}
        onTouchStart={(event) => {
          leaveLiveEdge();
          onViewportTouchStart?.(event);
        }}
        className={cn(
          "h-full overflow-y-auto overscroll-contain [scrollbar-gutter:stable]",
          viewportClassName,
        )}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    </div>
  );
}
