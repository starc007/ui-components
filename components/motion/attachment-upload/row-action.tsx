"use client";

import { AlertCircle, Check, LoaderCircle, RotateCcw, X } from "lucide-react";
import { motion } from "motion/react";
import { Tooltip } from "@/components/motion/tooltip";
import { SPRING_PRESS } from "@/lib/ease";
import type { Translate } from "./messages";
import { ITEM_TRANSITION } from "./utils";

export type RowActionState =
  | "idle"
  | "uploading"
  | "complete"
  | "failed"
  | "removing";

export function RowAction({
  label,
  onClick,
  state,
  retryable = false,
  reduce = false,
  t,
}: {
  label: string;
  t: Translate;
  onClick: () => void;
  state: RowActionState;
  retryable?: boolean;
  reduce?: boolean;
}) {
  if (state === "uploading") {
    return <span aria-hidden="true" className="size-9 shrink-0" />;
  }

  if (state === "complete") {
    return (
      <Tooltip content={t("uploadComplete")} side="top" delay={100}>
        <motion.span
          role="status"
          aria-label={t("uploadCompleteFor", { name: label })}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.75 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={ITEM_TRANSITION}
          className="grid size-9 shrink-0 place-items-center rounded-full text-emerald-600 dark:text-emerald-400"
        >
          <Check className="size-4" />
        </motion.span>
      </Tooltip>
    );
  }

  if (state === "removing") {
    return (
      <Tooltip content={t("removingAttachment")} side="top" delay={100}>
        <span
          role="status"
          aria-label={t("removing", { name: label })}
          className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground"
        >
          <motion.span
            animate={reduce ? undefined : { rotate: 360 }}
            transition={{
              duration: 0.7,
              ease: "linear",
              repeat: Infinity,
            }}
            className="grid place-items-center"
          >
            <LoaderCircle className="size-4" />
          </motion.span>
        </span>
      </Tooltip>
    );
  }

  if (state === "failed") {
    if (!retryable) {
      return (
        <Tooltip content={t("uploadFailed")} side="top" delay={100}>
          <span
            role="status"
            aria-label={t("uploadFailedFor", { name: label })}
            className="grid size-9 shrink-0 place-items-center rounded-full text-destructive"
          >
            <AlertCircle className="size-4" />
          </span>
        </Tooltip>
      );
    }

    return (
      <Tooltip content={t("retryUpload")} side="top" delay={100}>
        <motion.button
          type="button"
          aria-label={t("retry", { name: label })}
          onClick={onClick}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          transition={SPRING_PRESS}
          className="grid size-9 shrink-0 place-items-center rounded-full text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring"
        >
          <RotateCcw className="size-4" />
        </motion.button>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t("removeAttachment")} side="top" delay={100}>
      <motion.button
        type="button"
        aria-label={t("remove", { name: label })}
        onClick={onClick}
        whileTap={reduce ? undefined : { scale: 0.92 }}
        transition={SPRING_PRESS}
        className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-4" />
      </motion.button>
    </Tooltip>
  );
}
