import type { ReactNode } from "react";
import type { ApprovalCardMessages } from "./messages";

export type ApprovalCardStatus =
  | "pending"
  | "submitting"
  | "approved"
  | "rejected"
  | "changes-requested"
  | "answered";

export interface ApprovalCardOption {
  /** Value stored in the answer's `selected` list when picked. */
  value: string;
  /** Text shown next to the radio or checkbox. */
  label: string;
  /** Plain supporting text rendered under the label. */
  description?: string;
  /** Stops the option from being picked. */
  disabled?: boolean;
}

export interface ApprovalCardQuestion {
  /** Unique key; the question's answer is stored under it. */
  id: string;
  /** Question text, shown as the card heading on its step. */
  title: ReactNode;
  /** Supporting text under the question. */
  description?: ReactNode;
  /** Choices shown as radios, or checkboxes when `multiple` is set. */
  options?: ApprovalCardOption[];
  /** Allows picking more than 1 option, shown as checkboxes. */
  multiple?: boolean;
  /** Set to false to stay on the step after a single choice is picked. */
  autoAdvance?: boolean;
  /** Adds a text field for a free-form answer. */
  allowCustom?: boolean;
  /** Placeholder of the free-form field. Default: "Add another response…" */
  customPlaceholder?: string;
}

export interface ApprovalCardAnswer {
  selected: string[];
  custom?: string;
}

export type ApprovalCardAnswers = Record<string, ApprovalCardAnswer>;

export interface ApprovalCardProps {
  /** Heading of the card. A question's own title replaces it. Default: "Approval required" */
  title?: ReactNode;
  /** Supporting text under the title when there are no questions. */
  description?: ReactNode;
  children?: ReactNode;
  /** Questions asked one step at a time. Replaces approve and reject buttons. */
  questions?: ApprovalCardQuestion[];
  /** Current state, which sets the badge, icon and whether the form shows. Default: "pending" */
  status?: ApprovalCardStatus;
  /** Answers keyed by question id, for controlled use. */
  answers?: ApprovalCardAnswers;
  /** The initial answers when uncontrolled. */
  defaultAnswers?: ApprovalCardAnswers;
  /** Called with all answers whenever one changes. */
  onAnswersChange?: (answers: ApprovalCardAnswers) => void;
  /** Index of the shown question, for controlled use. */
  step?: number;
  /** The initial question index when uncontrolled. Default: 0 */
  defaultStep?: number;
  /** Called with the new question index when the step changes. */
  onStepChange?: (step: number) => void;
  /** Called with all answers when the last question is submitted. */
  onSubmit?: (answers: ApprovalCardAnswers) => void;
  /** Called when the approve button is pressed. */
  onApprove?: () => void;
  /** Called when the reject button is pressed. The button shows only when set. */
  onReject?: () => void;
  /** Called when the request changes button is pressed. The button shows only when set. */
  onRequestChanges?: () => void;
  /** Called when the close button is pressed. The button shows only when set. */
  onDismiss?: () => void;
  /** Text of the approve button. Default: "Approve" */
  approveLabel?: ReactNode;
  /** Text of the last question's submit button. Default: "Submit response" */
  submitLabel?: ReactNode;
  /** Shown in place of the form once the card is settled. Defaults to the status label. */
  result?: ReactNode;
  /** Override any built-in string. */
  labels?: Partial<ApprovalCardMessages>;
  /** Classes merged onto the root element. */
  className?: string;
}
