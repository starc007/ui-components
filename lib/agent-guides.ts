export interface AgentGuidePrinciple {
  title: string;
  description: string;
}

export interface AgentGuideStage {
  title: string;
  description: string;
}

export interface AgentGuideConnection {
  slug: string;
  name: string;
  description: string;
}

export interface AgentGuide {
  seo: {
    title: string;
    description: string;
  };
  introduction: string;
  composition: {
    description: string;
    tree: string;
  };
  lifecycle: [AgentGuideStage, AgentGuideStage, AgentGuideStage];
  principles: [
    AgentGuidePrinciple,
    AgentGuidePrinciple,
    AgentGuidePrinciple,
  ];
  implementation: {
    title: string;
    description: string;
  };
  connections: AgentGuideConnection[];
  contract: {
    owns: string;
    leaves: string;
  };
  guidance: {
    useWhen: string;
    avoidWhen: string;
  };
}

export const agentGuides = {
  "animated-sidebar": {
    seo: {
      title: "Animated Sidebar · React Component",
      description:
        "A composable React application sidebar with responsive collapse, nested navigation, an animated icon rail, and a focus-managed mobile sheet.",
    },
    introduction:
      "An application sidebar is the responsive shell around persistent navigation. It coordinates desktop collapse, mobile presentation, nested destinations, and the content inset without owning the data rendered inside those regions.",
    composition: {
      description:
        "Compose navigation groups inside the sidebar and place the application surface in the sibling inset.",
      tree: "AnimatedSidebarProvider\n├── AnimatedSidebar\n│   ├── AnimatedSidebarHeader\n│   ├── AnimatedSidebarContent\n│   │   └── AnimatedSidebarMenu\n│   ├── AnimatedSidebarFooter\n│   └── AnimatedSidebarRail\n└── AnimatedSidebarInset",
    },
    lifecycle: [
      {
        title: "Compose the shell",
        description:
          "Header, navigation groups, footer, rail, and inset establish one responsive application frame.",
      },
      {
        title: "Change presentation",
        description:
          "Desktop navigation folds into an icon rail while mobile navigation becomes a focus-managed sheet.",
      },
      {
        title: "Preserve the destination",
        description:
          "Active and expanded navigation state remains application-owned while the shell changes shape around it.",
      },
    ],
    principles: [
      {
        title: "Keep state composable",
        description:
          "Controlled and uncontrolled provider state lets the shell fit both local layouts and routed applications.",
      },
      {
        title: "Keep content independent",
        description:
          "The inset responds to sidebar width without coupling page content to menu implementation details.",
      },
      {
        title: "Protect mobile focus",
        description:
          "The mobile sheet traps focus, closes on Escape, and restores focus to the trigger when dismissed.",
      },
    ],
    implementation: {
      title: "Keep navigation state outside visual motion",
      description:
        "Let routing or application state decide the active destination. The sidebar should animate presentation changes without replacing links, remounting content, or inferring navigation state from motion.",
    },
    connections: [
      {
        slug: "ai-sidebar",
        name: "AI Sidebar",
        description:
          "Composes the shell with editable projects, folders, files, and bookmarks.",
      },
    ],
    contract: {
      owns: "Responsive sidebar presentation, desktop collapse, mobile disclosure, navigation composition, rail behavior, and inset layout.",
      leaves:
        "Routing, destination data, authorization, resource editing, and inset content to the application or composed components.",
    },
    guidance: {
      useWhen:
        "An application needs responsive persistent navigation with a coordinated content inset and mobile sheet.",
      avoidWhen:
        "A short static link list needs no responsive shell, collapsed rail, mobile focus management, or inset coordination.",
    },
  },
  "ai-sidebar": {
    seo: {
      title: "AI Sidebar for Agent Workspaces · React Component",
      description:
        "A collapsible React AI sidebar for draggable folders, projects, files, and bookmarks with keyboard navigation, rename, and optimistic rollback.",
    },
    introduction:
      "An AI sidebar organizes changing workspace resources rather than only routing between fixed destinations. Folder and project rows disclose children, while files and bookmarks become the active resource and can move or rename without destabilizing the surrounding workspace.",
    composition: {
      description:
        "Place the resource tree inside Animated Sidebar content and keep the selected resource surface in the sibling inset.",
      tree: "AnimatedSidebarProvider\n├── AnimatedSidebar\n│   ├── AnimatedSidebarContent\n│   │   └── AISidebar\n│   │       ├── Folder or project\n│   │       └── File or bookmark\n│   └── AnimatedSidebarRail\n└── AnimatedSidebarInset",
    },
    lifecycle: [
      {
        title: "Disclose",
        description:
          "Folders and projects reveal children without becoming active destinations.",
      },
      {
        title: "Interact",
        description:
          "Files select, rename, and move through distinct pointer and keyboard paths.",
      },
      {
        title: "Persist",
        description:
          "Moves render immediately, then settle or roll back after persistence responds.",
      },
    ],
    principles: [
      {
        title: "Separate disclosure from selection",
        description:
          "Folder clicks only expand or collapse. Files and bookmarks own active-resource selection.",
      },
      {
        title: "Resolve gesture conflicts",
        description:
          "Whole-row dragging suppresses the following click, and double-click rename applies only to leaf resources.",
      },
      {
        title: "Keep the frame stable",
        description:
          "Only the resource list scrolls, leaving utility actions, the section heading, and inset content fixed while folders open.",
      },
    ],
    implementation: {
      title: "Treat movement as an optimistic transaction",
      description:
        "Update the local tree first and persist the normalized source, target, and position. Restore the captured tree and announce the rollback when saving fails.",
    },
    connections: [
      {
        slug: "message-scroller",
        name: "Message Scroller",
        description: "Can fill the inset with the selected conversation.",
      },
      {
        slug: "prompt-input",
        name: "Prompt Input",
        description: "Can anchor the composer beneath active resource content.",
      },
    ],
    contract: {
      owns: "Resource disclosure, leaf selection, keyboard focus, drag targets, rename presentation, overflow labels, and optimistic rollback.",
      leaves:
        "Sidebar shell behavior, authorization, persistence, resource fetching, and inset content to the application.",
    },
    guidance: {
      useWhen:
        "An agent workspace needs editable folders, projects, files, bookmarks, or conversations inside a collapsible sidebar.",
      avoidWhen:
        "The sidebar contains only fixed application destinations with no hierarchy, editing, movement, or optimistic state.",
    },
  },
  "message-bubble": {
    seo: {
      title: "Message Bubble for AI Chat · React Component",
      description:
        "An animated React message bubble for AI chat with alignment, visual tones, grouped replies, interactive content, and expandable long messages.",
    },
    introduction:
      "A bubble is the visible surface of one message, not the conversation itself. It should give content a clear reading shape without taking ownership of sender identity, delivery, or scroll behavior.",
    composition: {
      description:
        "Place the bubble inside message content so identity and layout remain separate from the visible response surface.",
      tree: "Message\n├── MessageAvatar\n└── MessageContent\n    └── MessageBubble\n        └── MessageBubbleContent",
    },
    lifecycle: [
      {
        title: "Shape the content",
        description:
          "The surface takes its width and alignment from the message it contains.",
      },
      {
        title: "Update in place",
        description:
          "Streaming content grows inside the same geometry without replaying the entrance.",
      },
      {
        title: "Disclose overflow",
        description:
          "Long content can open downward while the original reading position stays clear.",
      },
    ],
    principles: [
      {
        title: "Size around the content",
        description:
          "Short replies stay compact while longer responses gain a comfortable measure. The surface should never force every message to the same width.",
      },
      {
        title: "Keep geometry stable",
        description:
          "Streaming text updates inside the final surface. Backgrounds and neighboring rows should not chase every arriving word.",
      },
      {
        title: "Disclose with intent",
        description:
          "Collapse only content that benefits from a preview. Keep the control outside the clipped text so opening the message always moves downward.",
      },
    ],
    implementation: {
      title: "Do not animate the bubble on every content update",
      description:
        "Mount motion belongs to the new message event. Streaming should update only the inner content; replaying scale or layout motion for every token makes the surface flicker and causes nearby messages to drift.",
    },
    connections: [
      {
        slug: "message",
        name: "Message",
        description: "Adds sender alignment, metadata, and avatar placement.",
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Provides the active and completed response lifecycle.",
      },
    ],
    contract: {
      owns: "Surface tone, content width, alignment, grouping, and optional disclosure.",
      leaves:
        "Sender metadata, streaming state, transcript order, and message transport to surrounding components.",
    },
    guidance: {
      useWhen:
        "One conversational item needs a distinct surface, alignment, tone, or optional expansion.",
      avoidWhen:
        "The content is an execution log, permission request, or structured agent event with its own semantics.",
    },
  },
  message: {
    seo: {
      title: "Message for AI Chat · React Component",
      description:
        "A composable React message row for AI chat with sender alignment, avatars, metadata, grouped messages, streaming content, and arrival motion.",
    },
    introduction:
      "A message is a conversation row. It coordinates the avatar, metadata, content surface, and delivery details while allowing the content itself to be a bubble, an agent activity, a tool result, or a composed response.",
    composition: {
      description:
        "Build each conversation row from independent identity, content, and metadata primitives.",
      tree: "MessageGroup\n└── Message\n    ├── MessageAvatar\n    └── MessageContent\n        ├── MessageHeader\n        ├── MessageBubble\n        └── MessageFooter",
    },
    lifecycle: [
      {
        title: "Establish the sender",
        description:
          "Alignment, avatar, and metadata locate the row in the conversation.",
      },
      {
        title: "Compose the payload",
        description:
          "A bubble, response, activity stream, or tool surface fills the content slot.",
      },
      {
        title: "Hold its position",
        description:
          "The row stays stable while its inner content streams or changes state.",
      },
    ],
    principles: [
      {
        title: "Compose the row",
        description:
          "Keep identity and metadata outside the message surface. This preserves alignment when the visible content changes shape.",
      },
      {
        title: "Group by speaker",
        description:
          "Consecutive messages can share rhythm and avatar placement without losing their individual semantic boundaries.",
      },
      {
        title: "Animate only arrivals",
        description:
          "A newly sent row may pop into place once. Existing rows remain still when text streams or the composer updates.",
      },
    ],
    implementation: {
      title: "Keep the row identity stable",
      description:
        "Use a durable message id as the React key and keep arrival state separate from render state. Typing in the composer or appending streamed content should not remount a message that already exists.",
    },
    connections: [
      {
        slug: "message-bubble",
        name: "Message Bubble",
        description: "Supplies the visual surface inside the row.",
      },
      {
        slug: "message-scroller",
        name: "Message Scroller",
        description: "Positions message rows inside a reader-aware transcript.",
      },
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Renders progressive agent work as message content.",
      },
    ],
    contract: {
      owns: "Row alignment, avatar placement, metadata slots, grouping, and one-time entrance motion.",
      leaves:
        "Bubble styling, transcript scrolling, response parsing, and persistence to composed primitives and application state.",
    },
    guidance: {
      useWhen:
        "Content needs sender alignment, identity, metadata, or grouping inside a conversation.",
      avoidWhen:
        "You only need a visual content surface with no conversation-level identity or row layout.",
    },
  },
  "message-scroller": {
    seo: {
      title: "Message Scroller for Streaming AI Chat · React Component",
      description:
        "A React message scroller that follows streamed AI responses at the live edge and releases automatic scrolling when the reader moves away.",
    },
    introduction:
      "A streaming transcript is not ordinary overflow. It must follow new output while the reader stays at the live edge, then stop moving the moment they choose to inspect earlier work.",
    composition: {
      description:
        "Keep the scrolling viewport outside the message primitives it follows.",
      tree: "MessageScroller\n└── MessageGroup\n    └── Message\n        └── MessageContent",
    },
    lifecycle: [
      {
        title: "Follow",
        description:
          "While the reader remains at the end, each content update stays in view.",
      },
      {
        title: "Release",
        description:
          "A deliberate scroll or rail jump transfers control back to the reader immediately.",
      },
      {
        title: "Resume",
        description:
          "Returning to the live edge restores automatic following for later output.",
      },
    ],
    principles: [
      {
        title: "Follow the live edge",
        description:
          "New output remains visible only while the reader is already following it. Returning to the end re-enables that behavior.",
      },
      {
        title: "Respect reader intent",
        description:
          "Wheel, touch, and keyboard navigation release automatic following so incoming content never fights deliberate reading.",
      },
      {
        title: "Protect the transcript",
        description:
          "Scroll behavior stays outside message state. An optional rail derives navigation and hover excerpts from Message rows without rewriting their streamed content.",
      },
    ],
    implementation: {
      title: "Treat auto-follow as a reader state",
      description:
        "Do not call scroll-to-end for every render. Follow only while the viewport is already near the live edge, release on deliberate navigation, and let an explicit return to the end resume following.",
    },
    connections: [
      {
        slug: "message",
        name: "Message",
        description: "Provides stable, semantic rows for the transcript.",
      },
      {
        slug: "prompt-input",
        name: "Prompt Input",
        description: "Starts new turns without owning transcript movement.",
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Supplies the growing content the viewport follows.",
      },
    ],
    contract: {
      owns: "The scroll viewport, live-edge following, optional message navigation, reader release, and transcript accessibility state.",
      leaves:
        "Message data, transport, persistence, branching, and content rendering to the application.",
    },
    guidance: {
      useWhen:
        "A transcript grows through streamed responses and should follow output without trapping the reader at the bottom.",
      avoidWhen:
        "The content is a static list, a short non-streaming exchange, or a virtualized feed with its own scroll engine.",
    },
  },
  "prompt-input": {
    seo: {
      title: "AI Prompt Input · React Component",
      description:
        "An auto-growing React prompt input for AI apps with model selection, attachments, prompt actions, keyboard submission, and send or stop states.",
    },
    introduction:
      "The composer is the handoff point between a person and an agent. It should keep the current instruction editable, make available capabilities discoverable, and clearly separate sending from stopping active work.",
    composition: {
      description:
        "Place the prompt beside the transcript so drafting never becomes part of the scrolling message history.",
      tree: "Chat\n├── MessageScroller\n│   └── MessageGroup\n└── PromptInput",
    },
    lifecycle: [
      {
        title: "Compose",
        description:
          "The draft grows within a bounded editor while secondary controls stay available.",
      },
      {
        title: "Submit",
        description:
          "Keyboard or button submission sends one trimmed instruction and clears the draft.",
      },
      {
        title: "Continue or stop",
        description:
          "Focus remains ready for the next turn while the primary action reflects active work.",
      },
    ],
    principles: [
      {
        title: "Keep writing primary",
        description:
          "Model and attachment controls stay secondary to the prompt. The text area gets the space and focus behavior needed for uninterrupted input.",
      },
      {
        title: "Show the current mode",
        description:
          "The selected model and available prompt actions remain visible before submission, not hidden after the request starts.",
      },
      {
        title: "Preserve momentum",
        description:
          "Submission clears the draft and returns focus without moving the surrounding conversation. Loading swaps the action from send to stop.",
      },
    ],
    implementation: {
      title: "Measure auto-growth without shifting the page",
      description:
        "A fixed-row composer should skip the reset-and-measure cycle entirely. For auto-growing input, cap the measured height and preserve focus after submission so the transcript does not jump when the next draft begins.",
    },
    connections: [
      {
        slug: "message-scroller",
        name: "Message Scroller",
        description: "Keeps the conversation stable around the composer.",
      },
      {
        slug: "tool-approval",
        name: "Tool Approval",
        description: "Temporarily replaces freeform input with scoped permission.",
      },
      {
        slug: "approval-card",
        name: "Approval Card",
        description: "Collects structured human input during a paused run.",
      },
    ],
    contract: {
      owns: "Draft input, model and action selection, keyboard submission, focus, and send or stop controls.",
      leaves:
        "Uploads, request transport, conversation state, and model availability to supplied handlers and data.",
    },
    guidance: {
      useWhen:
        "People need to compose agent instructions with optional models, attachments, or prompt actions.",
      avoidWhen:
        "The interaction is a fixed command, a single structured field, or a form that requires validation across many inputs.",
    },
  },
  "todo-list": {
    seo: {
      title: "Agent Todo List · React Component",
      description:
        "A collapsible React todo list for AI agents with pending, active, and completed tasks, animated status marks, and a live completion count.",
    },
    introduction:
      "An agent plan should explain what remains without pretending every internal thought is a task. Use a todo list for durable work items whose state matters to the person following the run.",
    composition: {
      description:
        "Render the plan as message content when it belongs to a conversational agent run.",
      tree: "Message\n└── MessageContent\n    └── TodoList",
    },
    lifecycle: [
      {
        title: "Plan",
        description:
          "Durable tasks enter in a readable order with one clear active item.",
      },
      {
        title: "Execute",
        description:
          "Status marks advance in place as the agent completes meaningful work.",
      },
      {
        title: "Summarize",
        description:
          "The final count and completed icon reduce the plan to a compact record.",
      },
    ],
    principles: [
      {
        title: "Show durable steps",
        description:
          "Items represent meaningful work that can be pending, active, or complete—not every token-level action the agent performs.",
      },
      {
        title: "Advance in place",
        description:
          "Status marks morph without replacing the row, so labels and metadata remain easy to track as work progresses.",
      },
      {
        title: "Summarize progress",
        description:
          "The heading carries a compact completed count and the list can collapse once the plan no longer needs attention.",
      },
    ],
    implementation: {
      title: "Update status without replacing the task",
      description:
        "Keep each task keyed by a durable id and morph only its status mark. Replacing the complete row breaks reading continuity, replays text motion, and makes progress feel less trustworthy.",
    },
    connections: [
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Shows the chronological events occurring between tasks.",
      },
      {
        slug: "loading-states",
        name: "Agent Loading States",
        description: "Covers work before a durable plan is available.",
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        description: "Presents the evidence produced by an active task.",
      },
    ],
    contract: {
      owns: "Task presentation, status marks, completion count, disclosure, and list transitions.",
      leaves:
        "Planning logic, task execution, ordering decisions, and persistence to the agent runtime.",
    },
    guidance: {
      useWhen:
        "A multi-step run has durable tasks whose progress helps the reader understand what remains.",
      avoidWhen:
        "The events are transient reasoning, tool output, or an execution trace better represented chronologically.",
    },
  },
  "code-block": {
    seo: {
      title: "Streaming Code Block for AI Agents · React Component",
      description:
        "A syntax-highlighted React code block for AI output with stable streaming, line numbers, focused ranges, smooth following, and copy feedback.",
    },
    introduction:
      "Generated code changes faster than a conventional static snippet. The surface must remain readable while lines arrive, preserve syntax structure, and make copying the final result predictable.",
    composition: {
      description:
        "Nest generated source inside the response that owns its streaming lifecycle.",
      tree: "StreamingResponse\n└── CodeBlock",
    },
    lifecycle: [
      {
        title: "Receive",
        description:
          "Source text may arrive incrementally without changing the surrounding block.",
      },
      {
        title: "Highlight",
        description:
          "Tokens, line numbers, and focused ranges update as stable visual layers.",
      },
      {
        title: "Finalize",
        description:
          "Following stops at completion and the complete source becomes ready to copy.",
      },
    ],
    principles: [
      {
        title: "Highlight complete units",
        description:
          "Token colors should update without flashing the entire block. Partial input remains legible until the current language structure is complete.",
      },
      {
        title: "Keep lines addressable",
        description:
          "Line numbers and focused ranges give discussions a stable reference even when only part of the file is emphasized.",
      },
      {
        title: "Follow without flicker",
        description:
          "A bounded viewport follows appended lines smoothly while the code background and existing rows remain fixed.",
      },
    ],
    implementation: {
      title: "Separate source updates from highlighted output",
      description:
        "Do not rebuild and crossfade the entire highlighted tree for every character. Preserve the container and existing lines, then update the smallest complete source unit the highlighter can render reliably.",
    },
    connections: [
      {
        slug: "file-diff",
        name: "File Diff",
        description: "Explains additions and removals around highlighted code.",
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        description: "Wraps generated code in an execution outcome.",
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Embeds highlighted code inside a rich answer.",
      },
    ],
    contract: {
      owns: "Highlighted presentation, line numbers, focused ranges, streaming follow behavior, and copy feedback.",
      leaves:
        "Code generation, language detection policy, execution, and file persistence to the application.",
    },
    guidance: {
      useWhen:
        "Generated or retrieved source needs syntax highlighting, line references, streaming, or focused ranges.",
      avoidWhen:
        "You need to explain file changes with additions and removals; use a file diff for that relationship.",
    },
  },
  "approval-card": {
    seo: {
      title: "Human-in-the-Loop Approval Card · React Component",
      description:
        "A React approval card for human-in-the-loop AI workflows with questions, custom responses, multi-step review, revision, approval, and rejection.",
    },
    introduction:
      "Human-in-the-loop work is a temporary transfer of control. The card should state the decision clearly, collect only the required input, and return a durable answer to the paused agent run.",
    composition: {
      description:
        "Place the approval surface inside the message that pauses the agent run.",
      tree: "Message\n└── MessageContent\n    └── ApprovalCard",
    },
    lifecycle: [
      {
        title: "Pause",
        description:
          "The run exposes the exact question or review that prevents safe continuation.",
      },
      {
        title: "Decide",
        description:
          "The person selects, writes, revises, approves, or rejects the requested input.",
      },
      {
        title: "Resume",
        description:
          "The completed decision replaces the controls and returns a stable result to the run.",
      },
    ],
    principles: [
      {
        title: "Ask one decision at a time",
        description:
          "Each step has a focused question and mutually understandable choices. Selecting a single answer can advance immediately.",
      },
      {
        title: "Keep context attached",
        description:
          "The request, options, and custom response field stay in one surface so the decision never becomes detached from its reason.",
      },
      {
        title: "Record the outcome",
        description:
          "Completion replaces the input state with a concise summary that remains readable in the conversation history.",
      },
    ],
    implementation: {
      title: "Model the pause as durable workflow state",
      description:
        "The selected answer must survive remounts and reconnects because the agent run is waiting on it. Record the completed decision before resuming work, then render that record in place of the controls.",
    },
    connections: [
      {
        slug: "tool-approval",
        name: "Tool Approval",
        description: "Handles the narrower case of one tool permission.",
      },
      {
        slug: "message",
        name: "Message",
        description: "Places the decision inside the conversation history.",
      },
      {
        slug: "todo-list",
        name: "Todo List",
        description: "Shows which planned work is paused by the decision.",
      },
    ],
    contract: {
      owns: "Question flow, choice state, freeform input, review controls, and completed decision summary.",
      leaves:
        "Authorization policy, workflow suspension, side effects, and resumption to the agent runtime.",
    },
    guidance: {
      useWhen:
        "An agent cannot continue responsibly without a human choice, clarification, revision, or approval.",
      avoidWhen:
        "The question is optional, can be inferred safely, or concerns permission to execute one specific tool.",
    },
  },
  "file-diff": {
    seo: {
      title: "Streaming File Diff for AI Agents · React Component",
      description:
        "A syntax-highlighted React file diff for AI edits with old and new line numbers, streamed rows, live change counts, and completion collapse.",
    },
    introduction:
      "A file diff explains a proposed or completed edit. It should preserve the relationship between old and new lines while making the scale and status of the change visible at a glance.",
    composition: {
      description:
        "Place the patch inside the tool output that produced the file change.",
      tree: "ToolResult\n└── ToolResultOutput\n    └── FileDiff",
    },
    lifecycle: [
      {
        title: "Open the change",
        description:
          "Filename, language, and live counts establish the scope of the edit.",
      },
      {
        title: "Append rows",
        description:
          "Context, additions, and removals arrive without reanimating earlier lines.",
      },
      {
        title: "Reduce to summary",
        description:
          "Completion collapses the patch while keeping the full change one action away.",
      },
    ],
    principles: [
      {
        title: "Keep both line spaces",
        description:
          "Old and new line numbers remain distinct so additions, removals, and unchanged context can be discussed precisely.",
      },
      {
        title: "Stream by row",
        description:
          "New diff rows arrive as stable units. Existing syntax and backgrounds do not reanimate when another row is appended.",
      },
      {
        title: "Collapse to the result",
        description:
          "After completion, the disclosure can reduce to the filename and change counts while preserving access to the full patch.",
      },
    ],
    implementation: {
      title: "Append complete diff rows",
      description:
        "A streamed patch should reveal one parsed row at a time. Character-level updates can change diff markers, line numbers, and syntax classification mid-frame, producing visible flicker and incorrect alignment.",
    },
    connections: [
      {
        slug: "code-block",
        name: "Code Block",
        description: "Provides the shared syntax presentation for source lines.",
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        description: "Summarizes the command or edit that produced the patch.",
      },
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Records the file edit among surrounding agent events.",
      },
    ],
    contract: {
      owns: "Diff rows, old and new line numbers, syntax presentation, change counts, and completion disclosure.",
      leaves:
        "Diff generation, patch application, conflict handling, and repository state to the application.",
    },
    guidance: {
      useWhen:
        "A person needs to inspect how an agent changed a file, including old and new line relationships.",
      avoidWhen:
        "The content is a standalone snippet, a complete file, or raw terminal output with no before-and-after structure.",
    },
  },
  "tool-result": {
    seo: {
      title: "AI Tool Result · React Component",
      description:
        "A React tool-result disclosure for AI agents with terminal or request output, streaming status, bounded following, retry, copy, and completion states.",
    },
    introduction:
      "A tool result is evidence from an execution, not another chat bubble. It should connect a compact run summary to the output needed for inspection, recovery, or reuse.",
    composition: {
      description:
        "Use the output primitive for terminal text, request details, generated code, or another structured result.",
      tree: "ToolResult\n└── ToolResultOutput",
    },
    lifecycle: [
      {
        title: "Run",
        description:
          "The header identifies the action, target, duration, and current execution state.",
      },
      {
        title: "Stream evidence",
        description:
          "Output follows inside a bounded viewport while the summary remains readable.",
      },
      {
        title: "Resolve",
        description:
          "Success or failure replaces the active state and exposes relevant recovery actions.",
      },
    ],
    principles: [
      {
        title: "Lead with the outcome",
        description:
          "The title and colored status explain success, failure, or progress before the reader inspects raw output.",
      },
      {
        title: "Keep output bounded",
        description:
          "Long terminal or response bodies stream inside a capped area instead of expanding the entire conversation indefinitely.",
      },
      {
        title: "Keep recovery nearby",
        description:
          "Retry and copy actions appear with the result they affect, then the completed disclosure can return to a compact row.",
      },
    ],
    implementation: {
      title: "Keep status separate from raw output",
      description:
        "The execution state should remain readable even when output is empty, malformed, or extremely long. Derive the summary from the tool lifecycle, not from strings found inside the result body.",
    },
    connections: [
      {
        slug: "tool-approval",
        name: "Tool Approval",
        description: "Collects permission before the execution begins.",
      },
      {
        slug: "code-block",
        name: "Code Block",
        description: "Renders highlighted code returned by a tool.",
      },
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Summarizes the tool invocation within a longer run.",
      },
    ],
    contract: {
      owns: "Execution summary, status presentation, streamed output viewport, disclosure, and result actions.",
      leaves:
        "Tool invocation, retries, cancellation, response parsing, and error policy to supplied callbacks.",
    },
    guidance: {
      useWhen:
        "A tool execution produces output that may need inspection, copying, retrying, or a durable completion record.",
      avoidWhen:
        "The tool is still awaiting permission, the output is a file patch, or only a transient activity label is needed.",
    },
  },
  "streaming-response": {
    seo: {
      title: "Streaming AI Response · React Component",
      description:
        "A React streaming-response surface that renders rich content, then reveals copy, retry, feedback, and expandable citations after completion.",
    },
    introduction:
      "A response has two distinct phases: content is still arriving, then the answer becomes available for action. The layout should remain stable across that boundary while rich content continues to render normally.",
    composition: {
      description:
        "Keep response state inside the message surface while the outer row remains stable.",
      tree: "Message\n└── MessageContent\n    └── MessageBubble\n        └── StreamingResponse",
    },
    lifecycle: [
      {
        title: "Receive",
        description:
          "Partial content enters the same semantic response container used by the final answer.",
      },
      {
        title: "Render",
        description:
          "Markdown, links, lists, and code remain styled as the body grows.",
      },
      {
        title: "Complete",
        description:
          "The settled answer reveals only the actions and sources that are now usable.",
      },
    ],
    principles: [
      {
        title: "Render real content",
        description:
          "Links, lists, code, and other rendered Markdown remain part of the response instead of being flattened into a streaming-only text effect.",
      },
      {
        title: "Separate phase from content",
        description:
          "Streaming state controls announcements and completion affordances without replacing the response body or adding a cursor artifact.",
      },
      {
        title: "Reveal actions on completion",
        description:
          "Copy, retry, feedback, and sources appear only when they are meaningful, leaving the active response visually quiet.",
      },
    ],
    implementation: {
      title: "Stream source content, not presentation fragments",
      description:
        "Keep one canonical response value and pass its current slice through the same renderer used at completion. Swapping between separate streaming and final trees causes Markdown, links, and backgrounds to shift at the phase boundary.",
    },
    connections: [
      {
        slug: "message",
        name: "Message",
        description: "Places the response in a stable assistant row.",
      },
      {
        slug: "citations",
        name: "Citations",
        description: "Connects completed claims to supporting sources.",
      },
      {
        slug: "code-block",
        name: "Code Block",
        description: "Renders structured source inside a rich response.",
      },
    ],
    contract: {
      owns: "Response phase, rendered-content styling, completion actions, feedback state, and source disclosure.",
      leaves:
        "Token transport, Markdown parsing, retry implementation, and citation data to the application.",
    },
    guidance: {
      useWhen:
        "An assistant answer arrives incrementally and may finish with actions, feedback, or supporting sources.",
      avoidWhen:
        "The content is an opaque loading state, a structured tool event, or a short message with no response lifecycle.",
    },
  },
  "image-generation": {
    seo: {
      title: "AI Image Generation Animation · React Component",
      description:
        "A React image-generation surface with stable aspect ratio, queued and refining states, progressive media reveal, completion feedback, and retry recovery.",
    },
    introduction:
      "Generated media should occupy its final space before pixels are ready. The surface keeps one stable canvas while generation state progressively reveals the result, then settles into an ordinary image that remains easy to inspect.",
    composition: {
      description:
        "Place generated media inside the response row that owns its prompt and completion state.",
      tree: "Message\n└── MessageContent\n    └── ImageGeneration\n        └── GeneratedMedia",
    },
    lifecycle: [
      {
        title: "Reserve",
        description:
          "The final aspect ratio is present before generated media becomes available.",
      },
      {
        title: "Resolve",
        description:
          "A single dither cluster responds to fine-pointer movement while the result resolves.",
      },
      {
        title: "Settle",
        description:
          "The veil and blur clear without remounting or resizing the completed image.",
      },
    ],
    principles: [
      {
        title: "Keep one canvas",
        description:
          "Generation phases update visual treatment inside a fixed aspect ratio so nearby transcript content never shifts.",
      },
      {
        title: "Reveal progressively",
        description:
          "The responsive particle field, focus, and saturation communicate refinement without pretending to expose model progress as a percentage.",
      },
      {
        title: "Preserve the result",
        description:
          "Completion removes generation effects and leaves the supplied media as the primary, stable content.",
      },
    ],
    implementation: {
      title: "Keep generated media mounted across status changes",
      description:
        "Drive the veil and media treatment from generation status instead of replacing the canvas at every phase. Remounting can replay loading motion, flash the background, and shift the surrounding conversation.",
    },
    connections: [
      {
        slug: "message",
        name: "Message",
        description: "Keeps the generated result attached to its assistant turn.",
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Carries accompanying text before or after the media result.",
      },
      {
        slug: "prompt-input",
        name: "Prompt Input",
        description: "Collects the instruction that starts generation.",
      },
    ],
    contract: {
      owns: "Canvas geometry, generation-state presentation, progressive media reveal, status messaging, and retry affordance.",
      leaves:
        "Prompt submission, generation transport, progress interpretation, media loading, persistence, and moderation to the application.",
    },
    guidance: {
      useWhen:
        "Generated visual media needs a stable place in a conversation while work moves through queued, active, refining, complete, or failed states.",
      avoidWhen:
        "The result is already available, the media has no generation lifecycle, or the application needs an editable image workspace rather than a status surface.",
    },
  },
  "tool-approval": {
    seo: {
      title: "AI Tool Approval · React Component",
      description:
        "A React permission card for reviewing AI tool calls, allowing one execution, remembering access, or denying the requested action.",
    },
    introduction:
      "Tool approval is a permission boundary. The person must understand what will run, what access it needs, and whether their choice applies once or changes future behavior.",
    composition: {
      description:
        "Place executable source inside the approval request when the decision depends on reviewing it.",
      tree: "Message\n└── MessageContent\n    └── ToolApproval\n        └── ToolApprovalCode",
    },
    lifecycle: [
      {
        title: "Inspect",
        description:
          "The pending card exposes the tool, command, target, and relevant risk context.",
      },
      {
        title: "Choose scope",
        description:
          "The person allows once, remembers access, or denies the requested execution.",
      },
      {
        title: "Resolve",
        description:
          "The card records the permission outcome before the host decides what runs next.",
      },
    ],
    principles: [
      {
        title: "Name the action",
        description:
          "Show the tool, command, target, or request details before presenting the approval controls.",
      },
      {
        title: "Separate permission scope",
        description:
          "Allow once and remember access are different commitments. Their labels and outcomes should never be interchangeable.",
      },
      {
        title: "Make denial complete",
        description:
          "Denying is a first-class outcome with the same clarity as approval, not a quiet dismissal of the card.",
      },
    ],
    implementation: {
      title: "Return a permission decision, not a button event",
      description:
        "Model allow-once, remembered access, and denial as explicit outcomes. The host can then enforce scope consistently instead of inferring security policy from whichever control happened to fire.",
    },
    connections: [
      {
        slug: "approval-card",
        name: "Approval Card",
        description: "Handles broader questions and review decisions.",
      },
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Shows the pending and resumed execution context.",
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        description: "Displays the outcome after an approved tool runs.",
      },
    ],
    contract: {
      owns: "Permission details, pending and resolved states, scope choices, and approval or denial controls.",
      leaves:
        "Security policy, credential access, tool execution, and remembered permissions to the host application.",
    },
    guidance: {
      useWhen:
        "One tool call crosses a permission boundary and the person must review its exact scope before execution.",
      avoidWhen:
        "The workflow needs a product decision, clarification, or multi-step review rather than execution permission.",
    },
  },
  citations: {
    seo: {
      title: "AI Citations · React Component",
      description:
        "React citation components for grounded AI responses with inline reference markers, real source destinations, favicons, and a collapsible source list.",
    },
    introduction:
      "Citations connect a claim to supporting material without interrupting the answer. Inline markers should stay lightweight while the source collection provides enough information to inspect the evidence.",
    composition: {
      description:
        "Pair inline citation markers with a source disclosure owned by the same response.",
      tree: "StreamingResponse\n├── Citation\n└── Citations\n    ├── CitationStack\n    └── CitationList",
    },
    lifecycle: [
      {
        title: "Mark the claim",
        description:
          "A compact inline reference stays attached to the statement it supports.",
      },
      {
        title: "Collect sources",
        description:
          "Repeated references resolve into a concise source summary below the response.",
      },
      {
        title: "Inspect evidence",
        description:
          "The disclosure opens real destinations without replacing or obscuring the answer.",
      },
    ],
    principles: [
      {
        title: "Keep claims readable",
        description:
          "Markers sit with the relevant text and remain compact enough that they do not become the dominant visual element.",
      },
      {
        title: "Use real destinations",
        description:
          "Source labels, hosts, and favicons derive from the supplied URLs rather than a fixed catalog of known websites.",
      },
      {
        title: "Disclose the collection",
        description:
          "A compact source summary opens into the complete list while preserving the response layout above it.",
      },
    ],
    implementation: {
      title: "Use stable source identities",
      description:
        "Deduplicate citations by a normalized source id rather than their rendered index. Inline marker numbers may change as content streams, but the link between a claim and its destination must remain stable.",
    },
    connections: [
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Reveals the source summary when the answer completes.",
      },
      {
        slug: "message",
        name: "Message",
        description: "Keeps cited answers within a semantic conversation row.",
      },
    ],
    contract: {
      owns: "Inline markers, source identity presentation, favicon resolution, and collection disclosure.",
      leaves:
        "Retrieval, ranking, citation correctness, and URL trust decisions to the application.",
    },
    guidance: {
      useWhen:
        "A generated answer makes grounded claims that readers may need to verify against supplied URLs.",
      avoidWhen:
        "Links are ordinary navigation, sources cannot be tied to claims, or the application has not validated the destinations.",
    },
  },
  "agent-activity": {
    seo: {
      title: "AI Agent Activity · React Component",
      description:
        "A React activity stream for AI agents that progressively renders reasoning, searches, tool calls, messages, and mixed execution events.",
    },
    introduction:
      "Agent activity explains how work is progressing without exposing an unfiltered internal transcript. Events should arrive chronologically, remain easy to scan, and reduce to a useful summary when the run finishes.",
    composition: {
      description:
        "Render progressive work as message content so it remains attached to the turn that produced it.",
      tree: "Message\n└── MessageContent\n    └── AgentActivity",
    },
    lifecycle: [
      {
        title: "Start with intent",
        description:
          "The active label explains the kind of work before the first event arrives.",
      },
      {
        title: "Append evidence",
        description:
          "Reasoning, searches, tools, and messages enter in their true execution order.",
      },
      {
        title: "Collapse the run",
        description:
          "Completion replaces the live label with a reopenable summary of recorded work.",
      },
    ],
    principles: [
      {
        title: "Begin at the beginning",
        description:
          "Reasoning, searches, messages, and tool calls append in execution order. A replay never appears to begin halfway through the run.",
      },
      {
        title: "Adapt to the event",
        description:
          "Freeform text, structured steps, search results, and tool calls keep their own readable shapes inside one shared disclosure.",
      },
      {
        title: "Summarize completed work",
        description:
          "The active viewport follows new events, then collapses into a reopenable label that describes what actually happened.",
      },
    ],
    implementation: {
      title: "Normalize events before rendering",
      description:
        "Convert transport-specific chunks into durable text, step, search, tool, and message events first. A shared chronological model lets mixed activity render consistently and prevents the UI from starting in the middle of a replay.",
    },
    connections: [
      {
        slug: "loading-states",
        name: "Agent Loading States",
        description: "Covers the interval before the first structured event.",
      },
      {
        slug: "todo-list",
        name: "Todo List",
        description: "Separates durable planned work from transient events.",
      },
      {
        slug: "tool-result",
        name: "Tool Result",
        description: "Expands one completed execution into inspectable output.",
      },
    ],
    contract: {
      owns: "Chronological event presentation, live summary, bounded following, completion collapse, and replay behavior.",
      leaves:
        "Reasoning generation, event transport, tool execution, and trace storage to the agent runtime.",
    },
    guidance: {
      useWhen:
        "A run contains multiple progressive events whose order and completion help explain what the agent is doing.",
      avoidWhen:
        "You only need a simple wait signal, a durable task plan, or the final output from one tool invocation.",
    },
  },
  "loading-states": {
    seo: {
      title: "AI Agent Loading States · React Components",
      description:
        "Animated React loading states for AI agents with readable thinking shimmer, elapsed progress, and reasoning phrases that respect reduced motion.",
    },
    introduction:
      "An agent loading state should communicate ongoing work without inventing progress. Choose the smallest signal that matches what the system actually knows and keep its language stable while work continues.",
    composition: {
      description:
        "Choose one loading primitive for the amount of progress information the agent can truthfully expose.",
      tree: "Message\n└── MessageContent\n    ├── ThinkingShimmer\n    ├── AgentProgress\n    └── ReasoningText",
    },
    lifecycle: [
      {
        title: "Signal",
        description:
          "A truthful label appears immediately when work begins or the interface must wait.",
      },
      {
        title: "Sustain",
        description:
          "Quiet motion confirms activity without implying unavailable progress or steps.",
      },
      {
        title: "Resolve",
        description:
          "The indicator leaves cleanly when content, an error, or a richer progress state replaces it.",
      },
    ],
    principles: [
      {
        title: "Match the available signal",
        description:
          "Use a shimmer for an unknown wait, elapsed time for sustained work, and changing phrases only when the label reflects a real stage.",
      },
      {
        title: "Keep motion secondary",
        description:
          "Animation confirms activity but never makes the status harder to read. Reduced motion keeps the same meaning with a calmer treatment.",
      },
      {
        title: "Avoid false precision",
        description:
          "Do not show percentages, steps, or promises that the underlying process cannot measure reliably.",
      },
    ],
    implementation: {
      title: "Choose labels from known state",
      description:
        "A phrase such as “Searching” should come from an actual stage or event, not a decorative timer. When only elapsed work is known, keep the language general and let motion communicate continued activity.",
    },
    connections: [
      {
        slug: "agent-activity",
        name: "Agent Activity",
        description: "Takes over once structured execution events exist.",
      },
      {
        slug: "todo-list",
        name: "Todo List",
        description: "Shows durable progress when a plan becomes available.",
      },
      {
        slug: "streaming-response",
        name: "Streaming Response",
        description: "Replaces loading once answer content begins arriving.",
      },
    ],
    contract: {
      owns: "Readable activity signals, elapsed presentation, phrase transitions, and reduced-motion behavior.",
      leaves:
        "Progress calculation, stage selection, timeout policy, and cancellation to the application.",
    },
    guidance: {
      useWhen:
        "The interface knows work is active but has little or no structured progress to display yet.",
      avoidWhen:
        "Real tasks, execution events, elapsed stages, or tool output are available and can communicate progress more honestly.",
    },
  },
} satisfies Record<string, AgentGuide>;
