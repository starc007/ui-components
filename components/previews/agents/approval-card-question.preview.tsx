"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  ApprovalCard,
  type ApprovalCardAnswers,
  type ApprovalCardQuestion,
  type ApprovalCardStatus,
} from "@/components/agents/approval-card";

const QUESTIONS: ApprovalCardQuestion[] = [
  {
    id: "scope",
    title: "How focused should the first release be?",
    options: [
      { value: "focused", label: "A focused starter set" },
      { value: "broad", label: "A broader collection" },
      { value: "flagship", label: "One flagship experience" },
    ],
    allowCustom: true,
    customPlaceholder: "Describe another scope…",
  },
  {
    id: "checks",
    title: "Which checks should block publishing?",
    description: "Select every check the agent must pass before it can continue.",
    multiple: true,
    options: [
      { value: "types", label: "Type safety" },
      { value: "accessibility", label: "Accessibility" },
      { value: "registry", label: "Registry validation" },
    ],
  },
  {
    id: "preserve",
    title: "Anything the agent should preserve?",
    allowCustom: true,
    customPlaceholder: "Add a final constraint…",
  },
];

function QuestionFlow() {
  const [status, setStatus] = useState<ApprovalCardStatus>("pending");
  const timer = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const submit = (_answers: ApprovalCardAnswers) => {
    setStatus("submitting");
    timer.current = window.setTimeout(() => setStatus("answered"), 750);
  };

  return (
    <ApprovalCard
      questions={QUESTIONS}
      status={status}
      onSubmit={submit}
      result="Three responses sent to the agent."
    />
  );
}

export function ApprovalCardQuestionPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[470px] w-full max-w-lg">
      <QuestionFlow key={run} />
      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
