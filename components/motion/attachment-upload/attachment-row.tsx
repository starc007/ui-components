"use client";

import {
  ExternalLink,
  FileImage,
  Link as LinkIcon,
  Mic,
  Paperclip,
  Pause,
  Play,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { ImageThumbnail } from "./image-thumbnail";
import type { Translate } from "./messages";
import { RowAction, type RowActionState } from "./row-action";
import type { AttachmentUploadItem, AttachmentUploadKind } from "./types";
import {
  formatBytes,
  formatDuration,
  ITEM_TRANSITION,
  UPLOAD_PROGRESS_MS,
} from "./utils";

const WAVEFORM_BARS = [
  18, 31, 24, 39, 30, 43, 27, 18, 9, 29, 38, 24, 34, 18, 26, 37, 21, 14,
  7, 11, 22, 35, 18, 26, 41, 29, 17, 33,
].map((height, index) => ({ id: `wave-${index}-${height}`, height }));

function AttachmentIcon({ kind }: { kind: AttachmentUploadKind }) {
  if (kind === "link") return <LinkIcon className="size-4" />;
  if (kind === "image") return <FileImage className="size-4" />;
  if (kind === "audio") return <Mic className="size-4" />;
  return <Paperclip className="size-4" />;
}

export function AttachmentRow({
  item,
  playing,
  uploading,
  uploadComplete,
  failed,
  removing,
  arrivalIndex,
  imageLayoutId,
  onAudioToggle,
  onImagePreview,
  onRemove,
  onRetry,
  reduce,
  className,
  t,
}: {
  item: AttachmentUploadItem;
  playing: boolean;
  uploading: boolean;
  uploadComplete: boolean;
  failed: boolean;
  removing: boolean;
  arrivalIndex: number;
  imageLayoutId?: string;
  onAudioToggle?: (item: AttachmentUploadItem) => void;
  onImagePreview: (item: AttachmentUploadItem) => void;
  onRemove: (item: AttachmentUploadItem) => void;
  onRetry?: (item: AttachmentUploadItem) => void;
  reduce: boolean;
  className?: string;
  t: Translate;
}) {
  const { locale } = useLocale();
  const size = formatBytes(item.size, locale);
  const progress =
    item.duration && item.duration > 0
      ? Math.min(1, Math.max(0, (item.currentTime ?? 0) / item.duration))
      : 0;
  const actionState: RowActionState = removing
    ? "removing"
    : uploading
      ? "uploading"
      : uploadComplete
        ? "complete"
        : failed
          ? "failed"
          : "idle";
  const arrivalDelay = Math.min(Math.max(arrivalIndex, 0), 5) * 0.055;
  const rowTransition =
    !reduce && arrivalIndex >= 0
      ? {
          ...SPRING_LAYOUT,
          delay: arrivalDelay,
          opacity: {
            duration: 0.16,
            ease: EASE_OUT,
            delay: arrivalDelay,
          },
        }
      : ITEM_TRANSITION;
  const showUploadProgress = uploading || uploadComplete;
  const uploadProgress = (
    <motion.span
      role="progressbar"
      aria-label={t("uploading", { name: item.name })}
      className="pointer-events-none absolute inset-0 -z-10 origin-left bg-emerald-400/25 dark:bg-emerald-500/20"
      initial={{ opacity: 1, scaleX: 0 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={reduce ? undefined : { opacity: 0 }}
      transition={{
        duration: reduce ? 0.1 : UPLOAD_PROGRESS_MS / 1000,
        ease: EASE_OUT,
      }}
    />
  );

  return (
    <motion.li
      layout={!reduce}
      initial={
        reduce
          ? { opacity: 0 }
          : arrivalIndex >= 0
            ? { opacity: 0, y: -16, scale: 0.985 }
            : { opacity: 0, y: 6 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduce ? undefined : { opacity: 0, y: -4 }}
      transition={rowTransition}
      className={cn(
        "flex min-h-14 items-center gap-1 rounded-2xl bg-muted/70 p-1",
        className,
      )}
    >
      <div className="relative isolate flex min-w-0 flex-1 items-center gap-3 self-stretch overflow-hidden rounded-xl bg-background px-2 py-1">
        {failed ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 bg-destructive/10"
          />
        ) : null}

        {item.kind === "image" ? (
          <ImageThumbnail
            item={item}
            layoutId={imageLayoutId}
            onPreview={onImagePreview}
            reduce={reduce}
            t={t}
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid size-7 shrink-0 place-items-center text-muted-foreground"
          >
            <AttachmentIcon kind={item.kind} />
          </span>
        )}

        {item.kind === "audio" ? (
          <>
            <span className="w-9 shrink-0 text-xs tabular-nums text-muted-foreground">
              {formatDuration(item.currentTime)}
            </span>
            <span
              aria-hidden="true"
              className="flex h-11 min-w-0 flex-1 items-center gap-[3px] overflow-hidden"
            >
              {WAVEFORM_BARS.map((bar, index) => (
                <motion.span
                  key={bar.id}
                  className={cn(
                    "w-[3px] shrink-0 rounded-full",
                    index / WAVEFORM_BARS.length <= progress
                      ? "bg-primary"
                      : "bg-muted-foreground/35",
                  )}
                  style={{ height: bar.height }}
                  animate={
                    reduce || !playing
                      ? undefined
                      : { scaleY: [0.72, 1, 0.78] }
                  }
                  transition={{
                    duration: 0.55,
                    ease: EASE_OUT,
                    repeat: Infinity,
                    delay: index * 0.018,
                  }}
                />
              ))}
            </span>
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
              {formatDuration(item.duration)}
            </span>
            <motion.button
              type="button"
              aria-label={t(playing ? "pause" : "play", { name: item.name })}
              onClick={() => onAudioToggle?.(item)}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              transition={SPRING_PRESS}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={playing ? "pause" : "play"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
                  transition={ITEM_TRANSITION}
                >
                  {playing ? (
                    <Pause className="size-4 fill-current" />
                  ) : (
                    <Play className="size-4 translate-x-px fill-current" />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </>
        ) : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-foreground">
                {item.name}
              </span>
              {failed ? (
                <span className="block truncate text-[11px] text-destructive">
                  {item.error ?? t("uploadFailed")}
                </span>
              ) : null}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.kind === "link" ? t("web") : size}
            </span>
            {item.kind === "link" && item.href ? (
              <a
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={t("open", { name: item.name })}
                className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </>
        )}

        {reduce ? (
          showUploadProgress ? (
            uploadProgress
          ) : null
        ) : (
          <AnimatePresence>
            {showUploadProgress ? uploadProgress : null}
          </AnimatePresence>
        )}
      </div>

      <RowAction
        label={item.name}
        onClick={() => {
          if (actionState === "failed") {
            onRetry?.(item);
            return;
          }
          onRemove(item);
        }}
        state={actionState}
        retryable={onRetry !== undefined}
        reduce={reduce}
        t={t}
      />
    </motion.li>
  );
}
