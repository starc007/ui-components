/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const agentActivityMessages = {
  thinking: "Thinking…",
  searching: "Searching the web…",
  runningTools: "Running tools…",
  workingTrace: "Working through the run…",
  workingMixed: "Working through it…",
  thoughtFor: "Thought for {duration}",
  seconds: "{seconds}s",
  minutes: "{minutes}m",
  minutesSeconds: "{minutes}m {seconds}s",
  searched: "Searched the web",
  ranToolsOne: "Ran {count} tool",
  ranToolsOther: "Ran {count} tools",
  traceSummary: "{toolCalls}, {messages}",
  toolCallsOne: "{count} tool call",
  toolCallsOther: "{count} tool calls",
  messagesOne: "{count} message",
  messagesOther: "{count} messages",
  completedStepsOne: "Completed {count} step",
  completedStepsOther: "Completed {count} steps",
  moreResults: "+{count} more",
  read: "Read",
  edit: "Edit",
  write: "Write",
  run: "Run",
};

export type AgentActivityMessages = typeof agentActivityMessages;

export type AgentActivityTranslate = (
  key: keyof AgentActivityMessages,
  values?: Record<string, string | number>,
) => string;
