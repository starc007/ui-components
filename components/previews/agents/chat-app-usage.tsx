"use client";

import {
  Bot,
  Clock3,
  FolderKanban,
  MessageSquarePlus,
  PanelLeft,
  Paperclip,
  Search,
  User,
  WandSparkles,
} from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ComponentProps } from "react";
import { AgentActivity } from "@/components/agents/agent-activity";
import {
  AISidebar,
  type SidebarResource,
} from "@/components/agents/ai-sidebar";
import {
  ApprovalCard,
  type ApprovalCardQuestion,
  type ApprovalCardStatus,
} from "@/components/agents/approval-card";
import { CodeBlock } from "@/components/agents/code-block";
import { ChatApp } from "@/components/agents/chat-app";
import { FileDiff } from "@/components/agents/file-diff";
import { ImageGeneration } from "@/components/agents/image-generation";
import { ThinkingShimmer } from "@/components/agents/loading-states";
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
import { MessageScroller } from "@/components/agents/message-scroller";
import { PromptInput } from "@/components/agents/prompt-input";
import { StreamingResponse } from "@/components/agents/streaming-response";
import { TodoList, type TodoItem } from "@/components/agents/todo-list";
import {
  ToolApproval,
  ToolApprovalCode,
  type ToolApprovalStatus,
} from "@/components/agents/tool-approval";
import {
  ToolResult,
  ToolResultOutput,
} from "@/components/agents/tool-result";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarGroup,
  AnimatedSidebarGroupContent,
  AnimatedSidebarGroupLabel,
  AnimatedSidebarInset,
  AnimatedSidebarMenu,
  AnimatedSidebarMenuButton,
  AnimatedSidebarMenuItem,
  AnimatedSidebarRail,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { cn } from "@/lib/utils";

const resources: SidebarResource[] = [
  {
    id: "release",
    label: "Release workspace",
    kind: "project",
    children: [
      { id: "checkout", label: "Checkout audit", kind: "file" },
      { id: "release-notes", label: "Release notes", kind: "file" },
      { id: "references", label: "Research sources", kind: "bookmark" },
    ],
  },
  {
    id: "design",
    label: "Design system",
    kind: "folder",
    children: [
      { id: "tokens", label: "Motion tokens", kind: "file" },
      { id: "components", label: "Component inventory", kind: "file" },
    ],
  },
  { id: "archive", label: "Archived runs", kind: "folder" },
];

const plan: TodoItem[] = [
  { id: "inspect", title: "Inspect the checkout flow", status: "completed" },
  { id: "patch", title: "Prepare the validation patch", status: "completed" },
  { id: "checks", title: "Run focused checks", status: "completed" },
  {
    id: "review",
    title: "Collect release approval",
    status: "in-progress",
    progress: 72,
    detail: "72%",
  },
];

const diffLines = [
  {
    id: "context-1",
    type: "context" as const,
    oldLine: 41,
    newLine: 41,
    content: "  const total = subtotal + shipping;",
  },
  {
    id: "removed-1",
    type: "removed" as const,
    oldLine: 42,
    content: "  return submitOrder(total);",
  },
  {
    id: "added-1",
    type: "added" as const,
    newLine: 42,
    content: "  const result = validateOrder({ total, items });",
  },
  {
    id: "added-2",
    type: "added" as const,
    newLine: 43,
    content: "  return result.ok ? submitOrder(total) : result;",
  },
];

const approvalQuestions: ApprovalCardQuestion[] = [
  {
    id: "release",
    title: "How should the patch be released?",
    options: [
      { value: "focused", label: "Ship the focused checkout fix" },
      { value: "bundle", label: "Bundle it with the next release" },
    ],
    allowCustom: true,
    customPlaceholder: "Add another release instruction…",
  },
];

const reply =
  "I’ll keep the patch focused, preserve the current checkout layout, and run the same validation path before preparing the release.";

interface AddedMessage {
  id: string;
  from: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

function GeneratedPreview() {
  return (
    <svg
      viewBox="0 0 640 420"
      aria-label="Generated checkout confirmation preview"
      className="size-full"
    >
      <rect width="640" height="420" fill="currentColor" className="text-muted" />
      <rect x="64" y="52" width="512" height="316" rx="28" fill="currentColor" className="text-background" />
      <circle cx="320" cy="144" r="38" fill="currentColor" className="text-emerald-500" />
      <path d="m301 144 13 13 26-29" fill="none" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="204" y="210" width="232" height="18" rx="9" fill="currentColor" className="text-foreground/85" />
      <rect x="238" y="246" width="164" height="12" rx="6" fill="currentColor" className="text-muted-foreground/35" />
      <rect x="248" y="298" width="144" height="34" rx="17" fill="currentColor" className="text-foreground" />
    </svg>
  );
}

function AssistantIdentity({ label = "beUI Agent" }: { label?: string }) {
  return (
    <MessageHeader>
      <span>{label}</span>
      <span>Now</span>
    </MessageHeader>
  );
}

export function ChatAppExample({
  className,
}: Pick<ComponentProps<typeof ChatApp>, "className">) {
  const reduce = useReducedMotion() ?? false;
  const timers = useRef<number[]>([]);
  const runId = useRef(0);
  const [items, setItems] = useState(resources);
  const [activeResource, setActiveResource] = useState("checkout");
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const [messages, setMessages] = useState<AddedMessage[]>([]);
  const [toolStatus, setToolStatus] =
    useState<ToolApprovalStatus>("pending");
  const [approvalStatus, setApprovalStatus] =
    useState<ApprovalCardStatus>("pending");

  const clearTimers = useCallback(() => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }, []);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    if (!activeReply) return;

    if (reduce) {
      setMessages((current) =>
        current.map((message) =>
          message.id === activeReply
            ? { ...message, content: reply, streaming: false }
            : message,
        ),
      );
      setActiveReply(null);
      return;
    }

    const startedAt = performance.now();
    let frame = 0;
    const stream = (now: number) => {
      const cursor = Math.min(
        reply.length,
        Math.floor(((now - startedAt) / 1000) * 92),
      );
      const content = reply.slice(0, cursor);
      setMessages((current) =>
        current.map((message) =>
          message.id === activeReply && message.content !== content
            ? { ...message, content }
            : message,
        ),
      );

      if (cursor < reply.length) {
        frame = requestAnimationFrame(stream);
      } else {
        setMessages((current) =>
          current.map((message) =>
            message.id === activeReply
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

  const approveTool = () => {
    clearTimers();
    setToolStatus("approving");
    timers.current = [
      window.setTimeout(() => setToolStatus("approved"), 450),
      window.setTimeout(() => setToolStatus("running"), 850),
      window.setTimeout(() => setToolStatus("complete"), 1650),
    ];
  };

  const submit = (value: string) => {
    if (!value.trim() || pending || activeReply) return;
    const id = runId.current++;
    const assistantId = `assistant-${id}`;
    setMessages((current) => [
      ...current,
      { id: `user-${id}`, from: "user", content: value },
    ]);
    setInput("");
    setPending(true);
    timers.current.push(
      window.setTimeout(() => {
        setMessages((current) => [
          ...current,
          {
            id: assistantId,
            from: "assistant",
            content: "",
            streaming: true,
          },
        ]);
        setPending(false);
        setActiveReply(assistantId);
      }, reduce ? 0 : 420),
    );
  };

  const stop = () => {
    clearTimers();
    setPending(false);
    setMessages((current) =>
      current.map((message) =>
        message.streaming ? { ...message, streaming: false } : message,
      ),
    );
    setActiveReply(null);
  };

  const busy = pending || activeReply !== null;

  return (
    <ChatApp sidebarWidth="17rem" className={cn("h-[760px]", className)}>
      <AnimatedSidebar
        ariaLabel="Agent workspace"
        collapsible="offcanvas"
        className="min-h-0"
        panelClassName="h-full bg-background"
      >
        <AnimatedSidebarContent className="gap-4 overflow-hidden px-2 py-4">
          <AnimatedSidebarGroup className="shrink-0 px-1 py-0">
            <AnimatedSidebarGroupContent>
              <AnimatedSidebarMenu className="gap-1">
                {[
                  { label: "New task", icon: MessageSquarePlus },
                  { label: "Search", icon: Search },
                  { label: "Runs", icon: Clock3 },
                ].map(({ label, icon: Icon }) => (
                  <AnimatedSidebarMenuItem key={label}>
                    <AnimatedSidebarMenuButton
                      icon={<Icon className="size-4" />}
                      onSelect={() => {}}
                      className="font-normal"
                    >
                      {label}
                    </AnimatedSidebarMenuButton>
                  </AnimatedSidebarMenuItem>
                ))}
              </AnimatedSidebarMenu>
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>

          <AnimatedSidebarGroup className="min-h-0 flex-1 px-1 py-0">
            <AnimatedSidebarGroupLabel className="mb-1 h-8 px-2 text-xs font-medium normal-case tracking-normal">
              Projects
            </AnimatedSidebarGroupLabel>
            <AnimatedSidebarGroupContent className="relative min-h-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto overscroll-contain pb-8 [overflow-anchor:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <AISidebar
                  items={items}
                  activeId={activeResource}
                  defaultExpandedIds={["release", "design"]}
                  onActiveChange={setActiveResource}
                  onItemsChange={setItems}
                />
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-background to-transparent" />
            </AnimatedSidebarGroupContent>
          </AnimatedSidebarGroup>
        </AnimatedSidebarContent>
        <AnimatedSidebarRail />
      </AnimatedSidebar>

      <AnimatedSidebarInset className="min-h-0 bg-background">
        <header className="flex h-14 shrink-0 items-center justify-between border-border border-b px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <AnimatedSidebarTrigger className="text-muted-foreground hover:bg-muted hover:text-foreground">
              <PanelLeft className="size-4" />
            </AnimatedSidebarTrigger>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                Checkout release
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                Agent workspace · focused patch
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
            Connected
          </span>
        </header>

        <MessageScroller
          busy={busy}
          navigation="rail"
          className="min-h-0 flex-1"
          viewportClassName="px-3 py-5 sm:px-5"
          contentClassName="mx-auto min-h-full w-full max-w-3xl"
        >
          <MessageGroup spacing="default">
            <Message from="user">
              <MessageAvatar><User /></MessageAvatar>
              <MessageContent>
                <MessageHeader><span>You</span><span>10:24</span></MessageHeader>
                <MessageBubble variant="solid">
                  <MessageBubbleContent>
                    Audit the checkout flow, fix the validation gap, and prepare a release-ready patch.
                  </MessageBubbleContent>
                </MessageBubble>
              </MessageContent>
            </Message>

            <Message from="assistant">
              <MessageAvatar><Bot /></MessageAvatar>
              <MessageContent className="gap-3">
                <MessageHeader><span>beUI Agent</span><span>10:24</span></MessageHeader>
                <AgentActivity
                  status="complete"
                  duration={6}
                  defaultOpen
                  collapseOnComplete={false}
                  items={[
                    { id: "reason", type: "text", content: "Tracing the checkout submission path and validation boundary." },
                    { id: "read", type: "tool", action: "read", target: "checkout/submit.ts" },
                    { id: "search", type: "search", query: "order validation failures", results: [
                      { id: "result-1", title: "Validation contract", domain: "docs.beui.dev", url: "/docs/validation" },
                    ] },
                  ]}
                />
                <TodoList items={plan} title="Release plan" collapseOnComplete={false} />
              </MessageContent>
            </Message>

            <Message from="assistant">
              <MessageAvatar placeholder />
              <MessageContent>
                <ToolApproval
                  tool="terminal.run"
                  title="Run focused checkout checks?"
                  description="The agent needs permission to run the validation and accessibility suites."
                  status={toolStatus}
                  defaultOpen
                  parameters={[
                    { id: "command", label: "Command", value: <ToolApprovalCode code="bun test checkout --coverage" language="bash" /> },
                    { id: "scope", label: "Scope", value: "Current workspace" },
                  ]}
                  onApprove={approveTool}
                  onAlwaysAllow={approveTool}
                  onDeny={() => setToolStatus("denied")}
                />
              </MessageContent>
            </Message>

            <Message from="assistant">
              <MessageAvatar placeholder />
              <MessageContent className="gap-3">
                <ToolResult
                  tool="terminal.run"
                  title="Checkout checks passed"
                  status="success"
                  kind="terminal"
                  meta="2.8s"
                  defaultOpen
                  collapseOnComplete={false}
                >
                  <ToolResultOutput>{"✓ validation contract\n✓ checkout keyboard flow\n✓ order submission recovery"}</ToolResultOutput>
                </ToolResult>
                <FileDiff
                  file="checkout/submit.ts"
                  lines={diffLines}
                  status="complete"
                  defaultOpen
                  collapseOnComplete={false}
                />
                <CodeBlock
                  filename="validation.ts"
                  language="typescript"
                  status="complete"
                  code={"export function validateOrder(order: Order) {\n  return schema.safeParse(order);\n}"}
                  showLineNumbers
                />
              </MessageContent>
            </Message>

            <Message from="assistant">
              <MessageAvatar placeholder />
              <MessageContent className="gap-3">
                <ImageGeneration
                  status="complete"
                  prompt="a clear checkout confirmation screen"
                  resolution="1280 × 840"
                  size="compact"
                >
                  <GeneratedPreview />
                </ImageGeneration>
                <MessageBubble variant="ghost" className="w-full">
                  <MessageBubbleContent>
                    <StreamingResponse
                      status="complete"
                      copyText="The checkout patch is ready for review."
                      sources={[
                        { id: "message", title: "Message composition", domain: "beui.dev", url: "/components/agents/message" },
                        { id: "diff", title: "File Diff", domain: "beui.dev", url: "/components/agents/file-diff" },
                        { id: "approval", title: "Tool Approval", domain: "beui.dev", url: "/components/agents/tool-approval" },
                      ]}
                    >
                      <p>The checkout patch is ready for review.</p>
                      <ul>
                        <li>Validation now runs before submission.</li>
                        <li>Failure output stays inside the current flow.</li>
                        <li>Focused checks pass without changing the layout.</li>
                      </ul>
                    </StreamingResponse>
                  </MessageBubbleContent>
                </MessageBubble>
              </MessageContent>
            </Message>

            <Message from="assistant">
              <MessageAvatar placeholder />
              <MessageContent>
                <ApprovalCard
                  questions={approvalQuestions}
                  status={approvalStatus}
                  onSubmit={() => {
                    setApprovalStatus("submitting");
                    timers.current.push(window.setTimeout(() => setApprovalStatus("answered"), 650));
                  }}
                  result="Release direction sent to the agent."
                />
              </MessageContent>
            </Message>

            {messages.map((message) => (
              <Message key={message.id} from={message.from} animateIn>
                {message.from === "assistant" ? (
                  <MessageAvatar><Bot /></MessageAvatar>
                ) : (
                  <MessageAvatar><User /></MessageAvatar>
                )}
                <MessageContent>
                  {message.from === "assistant" ? <AssistantIdentity label="beUI Agent" /> : null}
                  <MessageBubble variant={message.from === "user" ? "solid" : "soft"}>
                    <MessageBubbleContent>
                      {message.from === "assistant" ? (
                        <StreamingResponse status={message.streaming ? "streaming" : "complete"} showActions={!message.streaming} copyText={message.content}>
                          {message.content}
                        </StreamingResponse>
                      ) : message.content}
                    </MessageBubbleContent>
                  </MessageBubble>
                  {message.from === "user" ? <MessageFooter>Sent</MessageFooter> : null}
                </MessageContent>
              </Message>
            ))}

            {pending ? (
              <Message from="assistant" animateIn>
                <MessageAvatar><Bot /></MessageAvatar>
                <MessageContent>
                  <ThinkingShimmer>Reviewing your direction</ThinkingShimmer>
                </MessageContent>
              </Message>
            ) : null}
          </MessageGroup>
        </MessageScroller>

        <div className="shrink-0 border-border border-t bg-background p-3">
          <div className="mx-auto max-w-3xl">
            <PromptInput
              value={input}
              onValueChange={setInput}
              loading={busy}
              onStop={stop}
              onSubmit={submit}
              minRows={1}
              maxRows={4}
              placeholder="Ask the agent to continue…"
              models={[
                { value: "balanced", label: "Balanced" },
                { value: "fast", label: "Fast" },
                { value: "deep", label: "Deep reasoning" },
              ]}
              defaultModel="balanced"
              actions={[
                { value: "attach", label: "Attach file", icon: <Paperclip /> },
                { value: "project", label: "Add project context", icon: <FolderKanban /> },
                { value: "skill", label: "Use a skill", icon: <WandSparkles /> },
              ]}
            />
          </div>
        </div>
      </AnimatedSidebarInset>
    </ChatApp>
  );
}
