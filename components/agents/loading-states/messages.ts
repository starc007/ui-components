/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const loadingStatesMessages = {
  thinking: "Thinking…",
  churning: "Churning",
  inProgress: "{label}, in progress",
  reasoning: "Reasoning",
  phraseThinking: "Thinking",
  phraseReading: "Reading the context",
  phraseConnecting: "Connecting the details",
  phraseForming: "Forming a response",
};

export type LoadingStatesMessages = typeof loadingStatesMessages;
