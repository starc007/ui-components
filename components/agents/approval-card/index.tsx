"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleHelp,
  LoaderCircle,
  MessageSquareText,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ClipResizeFrame } from "@/components/agents/clip-resize-frame";
import { IconSwap } from "@/components/agents/icon-swap";
import { ActionSwapRollText } from "@/components/motion/action-swap-roll";
import { Button } from "@/components/motion/button";
import { Checkbox } from "@/components/motion/checkbox";
import { Input } from "@/components/motion/input";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_SWAP } from "@/lib/ease";
import { useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { type ApprovalCardMessages, approvalCardMessages } from "./messages";
import type {
  ApprovalCardAnswer,
  ApprovalCardAnswers,
  ApprovalCardProps,
  ApprovalCardQuestion,
  ApprovalCardStatus,
} from "./types";

export { type ApprovalCardMessages, approvalCardMessages } from "./messages";
export type {
  ApprovalCardAnswer,
  ApprovalCardAnswers,
  ApprovalCardOption,
  ApprovalCardProps,
  ApprovalCardQuestion,
  ApprovalCardStatus,
} from "./types";

const EMPTY_ANSWER: ApprovalCardAnswer = { selected: [], custom: "" };

// `custom` is the step direction (1 forward, -1 back). The leaving question
// goes faster than the new one arrives.
const QUESTION_VARIANTS: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: 10 * direction }),
  center: { opacity: 1, x: 0, transition: { duration: 0.2, ease: EASE_OUT } },
  exit: (direction: number) => ({
    opacity: 0,
    x: -8 * direction,
    transition: { duration: 0.12, ease: EASE_OUT },
  }),
};

const STATUS_MESSAGE = {
  pending: "inputRequired",
  submitting: "submitting",
  approved: "approved",
  rejected: "rejected",
  "changes-requested": "changesRequested",
  answered: "answered",
} as const satisfies Record<ApprovalCardStatus, keyof ApprovalCardMessages>;

function getStatusClass(status: ApprovalCardStatus) {
  if (status === "approved" || status === "answered") {
    return "text-emerald-600 dark:text-emerald-400";
  }
  if (status === "rejected") return "text-rose-600 dark:text-rose-400";
  if (status === "changes-requested") {
    return "text-amber-600 dark:text-amber-400";
  }
  return "text-muted-foreground";
}

function getStatusBadgeClass(status: ApprovalCardStatus) {
  if (status === "pending" || status === "changes-requested") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400";
  }
  if (status === "submitting") {
    return "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }
  if (status === "approved" || status === "answered") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  return "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400";
}

function isAnswered(answer: ApprovalCardAnswer) {
  return answer.selected.length > 0 || Boolean(answer.custom?.trim());
}

function QuestionOptions({
  question,
  answer,
  disabled,
  placeholder,
  onChange,
  onSingleSelect,
}: {
  question: ApprovalCardQuestion;
  answer: ApprovalCardAnswer;
  disabled: boolean;
  placeholder: string;
  onChange: (answer: ApprovalCardAnswer) => void;
  onSingleSelect?: () => void;
}) {
  const custom = answer.custom ?? "";

  return (
    <div className="mt-3">
      {question.options?.length ? (
        question.multiple ? (
          <div className="grid gap-0.5">
            {question.options.map((option) => (
              <Checkbox
                key={option.value}
                checked={answer.selected.includes(option.value)}
                disabled={disabled || option.disabled}
                label={option.label}
                description={option.description}
                onCheckedChange={(checked) =>
                  onChange({
                    ...answer,
                    selected: checked
                      ? [...answer.selected, option.value]
                      : answer.selected.filter((value) => value !== option.value),
                  })
                }
                className="min-h-9 rounded-lg px-1.5 py-1"
              />
            ))}
          </div>
        ) : (
          <RadioGroup
            value={answer.selected[0] ?? ""}
            onValueChange={(value) => {
              onChange({ selected: [value], custom: "" });
              onSingleSelect?.();
            }}
            className="gap-0.5"
          >
            {question.options.map((option) => (
              <RadioGroupItem
                key={option.value}
                value={option.value}
                label={option.label}
                description={option.description}
                disabled={disabled || option.disabled}
                className="min-h-9 rounded-lg px-1.5 py-1"
              />
            ))}
          </RadioGroup>
        )
      ) : null}

      {question.allowCustom ? (
        <Input
          value={custom}
          disabled={disabled}
          placeholder={question.customPlaceholder ?? placeholder}
          onChange={(value) =>
            onChange({
              selected: question.multiple ? answer.selected : [],
              custom: value,
            })
          }
          className={cn("p-0.5", question.options?.length && "mt-1.5")}
          classNames={{
            field: "h-10 rounded-full border border-border bg-transparent",
            input: "px-4 text-sm",
          }}
        />
      ) : null}
    </div>
  );
}

function ProgressDots({
  current,
  ids,
  label,
}: {
  current: number;
  ids: string[];
  label: string;
}) {
  const reduce = useReducedMotion() ?? false;
  return (
    <span className="flex gap-1.5">
      <span className="sr-only">{label}</span>
      {ids.map((id, index) => (
        <motion.span
          key={id}
          aria-hidden="true"
          initial={{
            scale: reduce || index === current ? 1 : 0.75,
            opacity: index <= current ? 1 : 0.35,
          }}
          animate={{
            scale: reduce || index === current ? 1 : 0.75,
            opacity: index <= current ? 1 : 0.35,
          }}
          transition={SPRING_SWAP}
          className="size-1.5 rounded-full bg-foreground"
        />
      ))}
    </span>
  );
}

export function ApprovalCard({
  title,
  description,
  children,
  questions = [],
  status = "pending",
  answers,
  defaultAnswers = {},
  onAnswersChange,
  step,
  defaultStep = 0,
  onStepChange,
  onSubmit,
  onApprove,
  onReject,
  onRequestChanges,
  onDismiss,
  approveLabel,
  submitLabel,
  result,
  labels,
  className,
}: ApprovalCardProps) {
  const t = useMessages("approvalCard", approvalCardMessages, labels);
  const reduce = useReducedMotion() ?? false;
  const [internalAnswers, setInternalAnswers] =
    useState<ApprovalCardAnswers>(defaultAnswers);
  const [internalStep, setInternalStep] = useState(defaultStep);
  const autoAdvanceTimer = useRef<number | undefined>(undefined);
  const currentAnswers = answers ?? internalAnswers;
  const currentStep = Math.min(
    Math.max(0, step ?? internalStep),
    Math.max(0, questions.length - 1),
  );
  const question = questions[currentStep];
  const questionMode = questions.length > 0;
  const multipleQuestions = questions.length > 1;
  const pending = status === "pending";
  const busy = status === "submitting";
  const interactive = pending || busy;
  const currentAnswer = question
    ? (currentAnswers[question.id] ?? EMPTY_ANSWER)
    : EMPTY_ANSWER;
  const displayTitle = question?.title ?? title ?? t("title");
  const titleKey = question?.id ?? String(status);
  const statusLabel = t(STATUS_MESSAGE[status]);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimer.current === undefined) return;
    window.clearTimeout(autoAdvanceTimer.current);
    autoAdvanceTimer.current = undefined;
  }, []);

  useEffect(() => clearAutoAdvance, [clearAutoAdvance]);

  const setAnswers = useCallback(
    (next: ApprovalCardAnswers) => {
      if (answers === undefined) setInternalAnswers(next);
      onAnswersChange?.(next);
    },
    [answers, onAnswersChange],
  );

  // Which way the last step went: 1 forward, -1 back. Set before the step
  // changes, so the question that leaves and the one that enters agree.
  const [direction, setDirection] = useState<1 | -1>(1);

  const setStep = (next: number) => {
    clearAutoAdvance();
    setDirection(next < currentStep ? -1 : 1);
    if (step === undefined) setInternalStep(next);
    onStepChange?.(next);
  };

  // Two answers set in one batch would otherwise both spread the answers
  // from this render, and the second would drop the first.
  const answersRef = useRef(currentAnswers);
  useLayoutEffect(() => {
    answersRef.current = currentAnswers;
  });
  const updateCurrentAnswer = (next: ApprovalCardAnswer) => {
    if (!question) return;
    const merged = { ...answersRef.current, [question.id]: next };
    answersRef.current = merged;
    setAnswers(merged);
  };

  const continueQuestion = () => {
    if (currentStep < questions.length - 1) {
      setStep(currentStep + 1);
      return;
    }
    onSubmit?.(currentAnswers);
  };

  const queueAutoAdvance = () => {
    if (
      !question ||
      question.multiple ||
      question.autoAdvance === false ||
      currentStep >= questions.length - 1 ||
      busy
    ) {
      return;
    }

    clearAutoAdvance();
    const queuedFor = question.id;
    autoAdvanceTimer.current = window.setTimeout(() => {
      autoAdvanceTimer.current = undefined;
      // Read the card as it is now: the question may have changed, or the
      // card may no longer be waiting for an answer.
      const now = latest.current;
      if (!now.pending || now.questionId !== queuedFor) return;
      if (now.currentStep >= now.questionCount - 1) return;
      now.setStep(now.currentStep + 1);
    }, 240);
  };
  const latest = useRef({
    pending,
    questionId: question?.id,
    currentStep,
    questionCount: questions.length,
    setStep,
  });
  useLayoutEffect(() => {
    latest.current = {
      pending,
      questionId: question?.id,
      currentStep,
      questionCount: questions.length,
      setStep,
    };
  });

  return (
    // The card's bottom edge glides when it grows or shrinks (a step with
    // more options, or the form folding away on submit) instead of jumping.
    <ClipResizeFrame
      data-state={status}
      aria-busy={busy}
      className={cn("w-full text-sm", className)}
      contentClassName="p-4"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-5 shrink-0 place-items-center text-muted-foreground",
            getStatusClass(status),
          )}
        >
          <IconSwap id={busy ? "busy" : interactive ? "ask" : status}>
            {busy ? (
              <LoaderCircle className={cn("size-4", !reduce && "animate-spin")} />
            ) : interactive ? (
              questionMode ? (
                <CircleHelp className="size-4" />
              ) : (
                <MessageSquareText className="size-4" />
              )
            ) : status === "rejected" ? (
              <X className="size-4" />
            ) : (
              <Check className="size-4" />
            )}
          </IconSwap>
        </span>

        <div className="relative min-w-0 flex-1">
          <div className="flex min-w-0 items-start gap-3">
            <h3 className="min-w-0 flex-1 text-base font-medium leading-5 text-foreground">
              <ActionSwapRollText value={titleKey}>
                {displayTitle}
              </ActionSwapRollText>
            </h3>
            {questionMode && interactive ? (
              multipleQuestions ? (
                <span className="shrink-0 text-xs tabular-nums text-muted-foreground/65">
                  {t("stepCount", {
                    current: currentStep + 1,
                    total: questions.length,
                  })}
                </span>
              ) : null
            ) : (
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium transition-colors",
                  getStatusBadgeClass(status),
                )}
              >
                <ActionSwapRollText value={status}>{statusLabel}</ActionSwapRollText>
              </span>
            )}
            {onDismiss ? (
              <Tooltip content={t("dismiss")} side="top">
                <button
                  type="button"
                  aria-label={t("dismiss")}
                  onClick={onDismiss}
                  className="grid size-5 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X className="size-4" />
                </button>
              </Tooltip>
            ) : null}
          </div>

          {/* On submit the form leaves the layout at once (popLayout) and
              fades out while the card's edge glides up over it. */}
          <AnimatePresence initial={false} mode="popLayout">
          {interactive ? (
          <motion.div
            key="form"
            exit={{ opacity: 0, transition: { duration: 0.14, ease: EASE_OUT } }}
          >
            {questionMode && question ? (
              // Forward slides in from the right, back from the left, so the
              // steps read as a row the card moves along. The old question
              // leaves fast, so the next one is never kept waiting.
              <AnimatePresence initial={false} mode="wait" custom={direction}>
                <motion.div
                  key={question.id}
                  custom={direction}
                  variants={QUESTION_VARIANTS}
                  initial={reduce ? false : "enter"}
                  animate="center"
                  exit={reduce ? { opacity: 0, transition: { duration: 0 } } : "exit"}
                >
                  {question.description ? (
                    <p className="mt-1 leading-5 text-muted-foreground">
                      {question.description}
                    </p>
                  ) : null}
                  <QuestionOptions
                    question={question}
                    answer={currentAnswer}
                    disabled={busy}
                    placeholder={t("customPlaceholder")}
                    onChange={updateCurrentAnswer}
                    onSingleSelect={queueAutoAdvance}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div>
                {description ? (
                  <p className="mt-1 leading-5 text-muted-foreground">
                    {description}
                  </p>
                ) : null}
                {children ? <div className="mt-3">{children}</div> : null}
              </div>
            )}

            {questionMode ? (
              <div className="mt-4 flex items-center gap-3">
                {multipleQuestions ? (
                  <>
                    <Tooltip content={t("previousQuestion")} side="top">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("previousQuestion")}
                        disabled={busy || currentStep === 0}
                        onClick={() => setStep(currentStep - 1)}
                        className="rounded-full"
                      >
                        <ArrowLeft className="size-4" />
                      </Button>
                    </Tooltip>
                    <ProgressDots
                      current={currentStep}
                      ids={questions.map((item) => item.id)}
                      label={t("questionProgress", {
                        current: currentStep + 1,
                        total: questions.length,
                      })}
                    />
                  </>
                ) : null}
                <Tooltip
                  // The last step's button carries its own text label.
                  content={currentStep === questions.length - 1 ? null : t("nextQuestion")}
                  side="top"
                >
                  <Button
                    size={currentStep === questions.length - 1 ? "sm" : "icon"}
                    aria-label={
                      currentStep === questions.length - 1
                        ? t("submit")
                        : t("nextQuestion")
                    }
                    disabled={busy || !isAnswered(currentAnswer)}
                    onClick={continueQuestion}
                    className="ml-auto rounded-full"
                  >
                    {busy ? (
                      <LoaderCircle className={cn("size-4", !reduce && "animate-spin")} />
                    ) : currentStep === questions.length - 1 ? (
                      <>
                        {submitLabel ?? t("submit")}
                        <ArrowRight className="size-3.5" />
                      </>
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                  </Button>
                </Tooltip>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  disabled={busy}
                  onClick={onApprove}
                  className="rounded-full"
                >
                  {approveLabel ?? t("approve")}
                </Button>
                {onRequestChanges ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={onRequestChanges}
                    className="rounded-full"
                  >
                    {t("requestChanges")}
                  </Button>
                ) : null}
                {onReject ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={busy}
                    onClick={onReject}
                    className="rounded-full text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    {t("reject")}
                  </Button>
                ) : null}
              </div>
            )}
          </motion.div>
          ) : (
            <motion.p
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.2, delay: 0.06, ease: EASE_OUT } }}
              className="mt-1 text-sm text-muted-foreground"
            >
              {result ?? statusLabel}
            </motion.p>
          )}
          </AnimatePresence>
        </div>
      </div>
    </ClipResizeFrame>
  );
}
