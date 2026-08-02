import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactElement } from "react";

import { AgentActivity } from "@/components/agents/agent-activity";
import { ApprovalCard } from "@/components/agents/approval-card";
import { Citation, Citations } from "@/components/agents/citations";
import { CodeBlock } from "@/components/agents/code-block";
import { FileDiff } from "@/components/agents/file-diff";
import { AgentProgress } from "@/components/agents/loading-states/agent-progress";
import { ReasoningText } from "@/components/agents/loading-states/reasoning-text";
import { ThinkingShimmer } from "@/components/agents/loading-states/thinking-shimmer";
import {
  Message,
  MessageContent,
  MessageScroller,
} from "@/components/agents/message";
import {
  MessageBubble,
  MessageBubbleCollapsible,
  MessageBubbleContent,
} from "@/components/agents/message-bubble";
import { PromptInput } from "@/components/agents/prompt-input";
import { StreamingResponse } from "@/components/agents/streaming-response";
import { TodoList } from "@/components/agents/todo-list";
import { ToolApproval } from "@/components/agents/tool-approval";
import { ToolResult } from "@/components/agents/tool-result";
import { AnimatedBadge } from "@/components/motion/animated-badge";
import {
  AnimatedSidebar,
  AnimatedSidebarContent,
  AnimatedSidebarProvider,
  AnimatedSidebarTrigger,
} from "@/components/motion/animated-sidebar";
import { AttachmentUpload } from "@/components/motion/attachment-upload";
import { BloomMenu } from "@/components/motion/bloom-menu";
import { BounceSidebar } from "@/components/motion/bounce-sidebar";
import { Button } from "@/components/motion/button";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";
import { Checkbox } from "@/components/motion/checkbox";
import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";
import { CommandPalette } from "@/components/motion/command-palette";
import { Input } from "@/components/motion/input";
import {
  ROUNDS as KNOCKOUT_WHEEL_ROUNDS,
  KnockoutWheel,
} from "@/components/motion/knockout-wheel";
import { Marquee } from "@/components/motion/marquee";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { Parallax } from "@/components/motion/parallax";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";
import { PullToRefresh } from "@/components/motion/pull-to-refresh";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";
import { RangeSlider } from "@/components/motion/range-slider";
import { BubbleSlider } from "@/components/motion/range-slider-bubble";
import { FluidSlider } from "@/components/motion/range-slider-fluid";
import { RulerSlider } from "@/components/motion/range-slider-ruler";
import { WaveSlider } from "@/components/motion/range-slider-wave";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ScrollTo } from "@/components/motion/scroll-to";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Switch } from "@/components/motion/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { TextReveal } from "@/components/motion/text-reveal";
import { Tooltip } from "@/components/motion/tooltip";

afterEach(cleanup);

// Each entry renders a component in a representative state and asserts axe finds
// no violations. Add a row here when you ship a new interactive component.
// Render thunks (not bare JSX) keep these out of an iterable literal.
const cases: Array<[name: string, render: () => ReactElement]> = [
  [
    "MessageBubble collapsible",
    () => (
      <MessageBubble>
        <MessageBubbleContent>
          <MessageBubbleCollapsible>
            This is a longer assistant response that can be expanded when the
            reader wants the complete detail.
          </MessageBubbleCollapsible>
        </MessageBubbleContent>
      </MessageBubble>
    ),
  ],
  [
    "MessageBubble interactive",
    () => (
      <MessageBubble variant="tint" align="end">
        <MessageBubbleContent render={<button type="button" />}>
          Save this direction
        </MessageBubbleContent>
      </MessageBubble>
    ),
  ],
  [
    "Message streaming",
    () => (
      <MessageScroller>
        <Message from="user">
          <MessageContent>
            <MessageBubble variant="solid">
              <MessageBubbleContent>Plan this release.</MessageBubbleContent>
            </MessageBubble>
          </MessageContent>
        </Message>
        <Message from="assistant">
          <MessageContent>
            <MessageBubble variant="ghost">
              <MessageBubbleContent>
                <StreamingResponse status="streaming" announce={false}>
                  I am reviewing the scope.
                </StreamingResponse>
              </MessageBubbleContent>
            </MessageBubble>
          </MessageContent>
        </Message>
      </MessageScroller>
    ),
  ],
  [
    "PromptInput",
    () => (
      <PromptInput
        actions={[
          { value: "image", label: "Attach image" },
          { value: "skill", label: "Use a skill" },
        ]}
        models={[
          { value: "gpt-5.2", label: "GPT-5.2" },
          { value: "claude-sonnet-4", label: "Claude Sonnet 4" },
        ]}
        defaultModel="gpt-5.2"
        onSubmit={() => {}}
      />
    ),
  ],
  [
    "TodoList active",
    () => (
      <TodoList
        items={[
          { id: "one", title: "Inspect files", status: "completed" },
          { id: "two", title: "Update implementation", status: "in-progress" },
          { id: "three", title: "Run checks", status: "pending" },
        ]}
      />
    ),
  ],
  [
    "CodeBlock streaming",
    () => (
      <CodeBlock
        filename="task.ts"
        code={"export async function run() {\n  return true;\n}"}
        status="streaming"
      />
    ),
  ],
  [
    "ApprovalCard question",
    () => (
      <ApprovalCard
        questions={[
          {
            id: "scope",
            title: "Choose a release scope",
            options: [
              { value: "focused", label: "Focused" },
              { value: "broad", label: "Broad" },
            ],
            allowCustom: true,
          },
        ]}
        onSubmit={() => {}}
      />
    ),
  ],
  [
    "ApprovalCard review",
    () => (
      <ApprovalCard
        title="Publish this update?"
        onApprove={() => {}}
        onRequestChanges={() => {}}
        onReject={() => {}}
      />
    ),
  ],
  [
    "StreamingResponse complete",
    () => (
      <StreamingResponse
        status="complete"
        copyText="The response is ready."
        onRetry={() => {}}
        defaultSourcesOpen
        sources={[
          {
            id: "docs",
            title: "Product documentation",
            domain: "example.com",
            url: "https://example.com/docs",
          },
        ]}
      >
        The response is ready.
      </StreamingResponse>
    ),
  ],
  [
    "ToolResult terminal output",
    () => (
      <ToolResult
        tool="terminal.run"
        title="Tests passed"
        kind="terminal"
        status="success"
        copyText="49 pass"
        onRetry={() => {}}
      >
        49 pass
      </ToolResult>
    ),
  ],
  [
    "FileDiff complete",
    () => (
      <FileDiff
        file="src/runner.ts"
        status="complete"
        copyText="return normalize(result);"
        lines={[
          {
            id: "line",
            type: "added",
            newLine: 20,
            content: "return normalize(result);",
          },
        ]}
      />
    ),
  ],
  [
    "ToolApproval pending",
    () => (
      <ToolApproval
        tool="terminal.run"
        description="Run the test suite in this workspace."
        defaultOpen
        parameters={[
          { id: "command", label: "Command", value: "bun test" },
        ]}
        onApprove={() => {}}
        onAlwaysAllow={() => {}}
        onDeny={() => {}}
      />
    ),
  ],
  [
    "Citations expanded",
    () => (
      <div>
        A supported claim <Citation citationId="guide" index={1} />
        <Citations
          defaultOpen
          citations={[
            {
              id: "guide",
              title: "Accessibility guide",
              domain: "example.com",
              url: "https://example.com/guide",
            },
          ]}
        />
      </div>
    ),
  ],
  [
    "AgentActivity text complete",
    () => (
      <AgentActivity
        status="complete"
        duration={5}
        defaultOpen
        items={[
          {
            id: "reasoning",
            type: "text",
            content: "Checked the request and prepared a response.",
          },
        ]}
      />
    ),
  ],
  [
    "AgentActivity steps complete",
    () => (
      <AgentActivity
        status="complete"
        duration={6}
        defaultOpen
        items={[
          { id: "read", type: "step", label: "Read the brief" },
          { id: "plan", type: "step", label: "Prepared the plan" },
        ]}
      />
    ),
  ],
  [
    "AgentActivity search complete",
    () => (
      <AgentActivity
        status="complete"
        defaultOpen
        items={[
          {
            id: "search",
            type: "search",
            query: "component accessibility guidance",
            results: [
              {
                id: "result",
                title: "Accessibility guide",
                domain: "example.com",
                url: "https://example.com/guide",
              },
            ],
          },
        ]}
      />
    ),
  ],
  [
    "AgentActivity tools complete",
    () => (
      <AgentActivity
        status="complete"
        defaultOpen
        items={[
          { id: "read", type: "tool", action: "read", target: "brief.md" },
          {
            id: "edit",
            type: "tool",
            action: "edit",
            target: "plan.ts",
            additions: 12,
            deletions: 3,
          },
        ]}
      />
    ),
  ],
  [
    "AgentActivity mixed complete",
    () => (
      <AgentActivity
        status="complete"
        defaultOpen
        items={[
          { id: "step", type: "step", label: "Checked the request" },
          { id: "tool", type: "tool", action: "read", target: "brief.md" },
        ]}
      />
    ),
  ],
  [
    "AgentActivity trace complete",
    () => (
      <AgentActivity
        status="complete"
        defaultOpen
        items={[
          {
            id: "message",
            type: "trace",
            kind: "thinking",
            label: "Thinking",
            detail: "Planning the interaction",
          },
          {
            id: "tool",
            type: "trace",
            kind: "run",
            label: "Validate types",
            detail: "bun run typecheck",
          },
        ]}
      />
    ),
  ],
  [
    "AttachmentUpload",
    () => (
      <AttachmentUpload
        defaultValue={[
          {
            id: "brief",
            name: "brief.pdf",
            kind: "file",
            size: 240_000,
            status: "failed",
            error: "Upload failed",
          },
          {
            id: "voice",
            name: "note.m4a",
            kind: "audio",
            currentTime: 4,
            duration: 18,
          },
        ]}
        onRetry={() => {}}
      />
    ),
  ],
  ["ThinkingShimmer", () => <ThinkingShimmer />],
  [
    "AgentProgress",
    () => <AgentProgress elapsedSeconds={12.4} label="Searching" />,
  ],
  [
    "ReasoningText cascade",
    () => <ReasoningText variant="cascade" phrases={["Thinking"]} />,
  ],
  [
    "ReasoningText swap",
    () => <ReasoningText variant="swap" phrases={["Thinking"]} />,
  ],
  [
    "ReasoningText scramble",
    () => <ReasoningText variant="scramble" phrases={["Thinking"]} />,
  ],
  ["Button", () => <Button>Subscribe</Button>],
  ["Button disabled", () => <Button disabled>Subscribe</Button>],
  ["Button ripple", () => <Button ripple>Subscribe</Button>],
  ["BloomMenu", () => <BloomMenu />],
  [
    "KnockoutWheel",
    () => <KnockoutWheel rounds={KNOCKOUT_WHEEL_ROUNDS} />,
  ],
  [
    "BounceSidebar",
    () => (
      <BounceSidebar
        defaultValue="components"
        items={[
          { id: "overview", label: "Overview" },
          { id: "components", label: "Components" },
          { id: "changelog", label: "Changelog" },
        ]}
      />
    ),
  ],
  [
    "ChromaticTextReveal",
    () => (
      <ChromaticTextReveal
        prefix="Make it feel"
        words={["alive.", "effortless."]}
      />
    ),
  ],
  [
    "CenterMorphModal",
    () => (
      <CenterMorphModal>
        <CenterMorphModalTrigger>
          <button type="button">Open profile</button>
        </CenterMorphModalTrigger>
        <CenterMorphModalContent ariaLabel="Profile details">
          <p>Profile details</p>
        </CenterMorphModalContent>
      </CenterMorphModal>
    ),
  ],
  [
    "Switch",
    () => (
      <Switch checked={false} onCheckedChange={() => {}} label="Email notifications" />
    ),
  ],
  ["AnimatedBadge", () => <AnimatedBadge status="success">Live</AnimatedBadge>],
  [
    "AnimatedSidebar expanded",
    () => (
      <AnimatedSidebarProvider>
        <AnimatedSidebar ariaLabel="Workspace navigation">
          <AnimatedSidebarContent>
            <a href="/overview">Overview</a>
          </AnimatedSidebarContent>
        </AnimatedSidebar>
        <div>
          <AnimatedSidebarTrigger>Toggle</AnimatedSidebarTrigger>
        </div>
      </AnimatedSidebarProvider>
    ),
  ],
  [
    "Popover",
    () => (
      <Popover>
        <PopoverTrigger>
          <Button>Open details</Button>
        </PopoverTrigger>
        <PopoverContent>Popover details</PopoverContent>
      </Popover>
    ),
  ],
  [
    "Marquee with interactive content",
    () => (
      <Marquee>
        <a href="/components">Browse components</a>
        <button type="button">Pause preview</button>
      </Marquee>
    ),
  ],
  [
    "CommandPalette closed",
    () => (
      <CommandPalette
        items={[
          {
            id: "docs",
            label: "Open documentation",
            onSelect: () => {},
          },
        ]}
      />
    ),
  ],
  [
    "Select closed",
    () => (
      <Select defaultValue="react">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="next">Next.js</SelectItem>
        </SelectContent>
      </Select>
    ),
  ],
  [
    "MorphingModal closed",
    () => (
      <MorphingModal viewId={null} onClose={() => {}}>
        <button type="button">Modal action</button>
      </MorphingModal>
    ),
  ],
  [
    "SmoothScroll",
    () => (
      <SmoothScroll>
        <div>
          <h1>Page</h1>
          <p>Scrollable content.</p>
        </div>
      </SmoothScroll>
    ),
  ],
  ["ScrollProgress bar", () => <ScrollProgress />],
  ["ScrollProgress circle", () => <ScrollProgress variant="circle" />],
  [
    "Parallax",
    () => (
      <Parallax>
        <p>Drifting content.</p>
      </Parallax>
    ),
  ],
  ["ScrollTo", () => <ScrollTo to="#top">Back to top</ScrollTo>],
  ["RangeSlider", () => <RangeSlider defaultValue={40} aria-label="Volume" />],
  [
    "FluidSlider",
    () => <FluidSlider defaultValue={35} label="Brightness" aria-label="Brightness" />,
  ],
  ["WaveSlider", () => <WaveSlider defaultValue={45} aria-label="Gain" />],
  ["BubbleSlider", () => <BubbleSlider defaultValue={28} aria-label="Volume" />],
  [
    "RulerSlider",
    () => (
      <RulerSlider defaultValue={72.5} min={40} max={120} step={0.5} unit="kg" aria-label="Weight" />
    ),
  ],
  ["FluidSlider disabled", () => <FluidSlider defaultValue={35} disabled aria-label="Brightness" />],
  [
    "PullToRefresh",
    () => (
      <PullToRefresh onRefresh={() => {}}>
        <p>Refreshable content.</p>
      </PullToRefresh>
    ),
  ],
  [
    "Checkbox",
    () => <Checkbox checked={false} onCheckedChange={() => {}} label="Accept terms" />,
  ],
  ["Input", () => <Input label="Email" type="email" />],
  [
    "RadioGroup",
    () => (
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" label="Option A" />
        <RadioGroupItem value="b" label="Option B" />
      </RadioGroup>
    ),
  ],
  [
    "ScrollReveal",
    () => (
      <ScrollReveal>
        <p>Revealed content.</p>
      </ScrollReveal>
    ),
  ],
  ["TextReveal", () => <TextReveal text="Ship it" />],
  [
    "Tooltip",
    () => (
      <Tooltip content="More info">
        <button type="button">Hover me</button>
      </Tooltip>
    ),
  ],
  [
    "Tabs",
    () => (
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
    ),
  ],
];

describe("accessibility", () => {
  for (const [name, renderCase] of cases) {
    test(`${name} has no axe violations`, async () => {
      render(<main>{renderCase()}</main>);
      const results = await axe(document.body);
      expect(results.violations).toEqual([]);
    });
  }
});
