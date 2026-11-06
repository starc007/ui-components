/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const approvalCardMessages = {
  title: "Approval required",
  approve: "Approve",
  submit: "Submit response",
  requestChanges: "Request changes",
  reject: "Reject",
  dismiss: "Dismiss",
  previousQuestion: "Previous question",
  nextQuestion: "Next question",
  customPlaceholder: "Add another response…",
  questionProgress: "Question {current} of {total}",
  stepCount: "{current}/{total}",
  inputRequired: "Input required",
  submitting: "Submitting",
  approved: "Approved",
  rejected: "Rejected",
  changesRequested: "Changes requested",
  answered: "Response submitted",
};

export type ApprovalCardMessages = typeof approvalCardMessages;
