"use client";

import { Upload } from "lucide-react";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { SPRING_PRESS } from "@/lib/ease";
import { useLocale, useMessages } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AttachmentRow } from "./attachment-upload/attachment-row";
import { ImagePreviewDialog } from "./attachment-upload/image-preview-dialog";
import {
  type AttachmentUploadMessages,
  attachmentUploadMessages,
} from "./attachment-upload/messages";
import type {
  AttachmentRejectReason,
  AttachmentUploadClassNames,
  AttachmentUploadItem,
} from "./attachment-upload/types";
import { useControllableList } from "./attachment-upload/use-controllable-list";
import {
  DEFAULT_MAX_FILE_SIZE,
  formatMaxSize,
  ITEM_TRANSITION,
  inferKind,
  REMOVE_PENDING_MS,
  UPLOAD_COMPLETE_HOLD_MS,
  UPLOAD_PROGRESS_MS,
} from "./attachment-upload/utils";

export {
  type AttachmentUploadMessages,
  attachmentUploadMessages,
} from "./attachment-upload/messages";
export type {
  AttachmentRejectReason,
  AttachmentUploadClassNames,
  AttachmentUploadItem,
  AttachmentUploadKind,
  AttachmentUploadStatus,
} from "./attachment-upload/types";

export interface AttachmentUploadProps {
  /** The attachment list, for controlled use. */
  value?: AttachmentUploadItem[];
  /** The initial attachment list when uncontrolled. */
  defaultValue?: AttachmentUploadItem[];
  /** Called with the full list when attachments are added or removed. */
  onValueChange?: (items: AttachmentUploadItem[]) => void;
  /** Called with the new items and their files after files are accepted. */
  onFilesAdded?: (items: AttachmentUploadItem[], files: File[]) => void;
  /** Called with files turned away for being too large or over `maxFiles`. */
  onFilesRejected?: (files: File[], reason: AttachmentRejectReason) => void;
  /** Called with the item after its remove animation finishes. */
  onRemove?: (item: AttachmentUploadItem) => void;
  /** Called with a failed item when its retry button is pressed. Shows the button. */
  onRetry?: (item: AttachmentUploadItem) => void;
  /** Id of the audio attachment that shows as playing. */
  playingId?: string;
  /** Called with an audio item when its play or pause button is pressed. */
  onAudioToggle?: (item: AttachmentUploadItem) => void;
  /** File types the picker allows, as in the input `accept` attribute. */
  accept?: string;
  /** Allows picking or dropping more than 1 file at a time. Default: true */
  multiple?: boolean;
  /** Most attachments allowed. The dropzone locks once reached. Default: 12 */
  maxFiles?: number;
  /** Largest file size allowed, in bytes. Default: 500 MB */
  maxFileSize?: number;
  /** Turns off the dropzone and file picker. Default: false */
  disabled?: boolean;
  /** Heading inside the dropzone. Default: "Drag and drop or browse files" */
  title?: string;
  /** Line under the dropzone heading. Defaults to the max file size. */
  description?: string;
  /** Heading above the attachment list. Default: "Attachments" */
  attachmentsLabel?: string;
  /** Override any built-in string. `{name}` fills the per-attachment labels; `{count}` and `{max}` fill `limitDescription`; `{size}` fills `description`. */
  labels?: Partial<AttachmentUploadMessages>;
  /** Classes merged onto the root element. */
  className?: string;
  /** Classes for the dropzone, list and each row. */
  classNames?: AttachmentUploadClassNames;
}

export function AttachmentUpload({
  value,
  defaultValue,
  onValueChange,
  onFilesAdded,
  onFilesRejected,
  onRemove,
  onRetry,
  playingId,
  onAudioToggle,
  accept,
  multiple = true,
  maxFiles = 12,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  disabled = false,
  title,
  description,
  attachmentsLabel,
  labels,
  className,
  classNames,
}: AttachmentUploadProps) {
  const t = useMessages("attachmentUpload", attachmentUploadMessages, labels);
  const { locale } = useLocale();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const ownedUrlsRef = useRef(new Set<string>());
  const lifecycleTimersRef = useRef(
    new Set<ReturnType<typeof setTimeout>>(),
  );
  const reduce = useReducedMotion() ?? false;
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] =
    useState<AttachmentUploadItem | null>(null);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [uploadCompleteIds, setUploadCompleteIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [removingIds, setRemovingIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [items, setItems] = useControllableList({
    value,
    defaultValue,
    onValueChange,
  });
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(
    () => () => {
      for (const url of ownedUrlsRef.current) URL.revokeObjectURL(url);
      ownedUrlsRef.current.clear();
      for (const timer of lifecycleTimersRef.current) {
        clearTimeout(timer);
      }
      lifecycleTimersRef.current.clear();
    },
    [],
  );

  const maxReached = items.length >= maxFiles;
  const scheduleLifecycle = useCallback(
    (callback: () => void, delay: number) => {
      const timer = setTimeout(() => {
        lifecycleTimersRef.current.delete(timer);
        callback();
      }, delay);
      lifecycleTimersRef.current.add(timer);
    },
    [],
  );

  const addFiles = useCallback(
    (incomingFiles: File[]) => {
      if (disabled || incomingFiles.length === 0) return;

      const availableSlots = Math.max(0, maxFiles - items.length);
      if (availableSlots === 0) {
        onFilesRejected?.(incomingFiles, "max-files");
        return;
      }

      const selectedFiles = incomingFiles.slice(
        0,
        multiple ? availableSlots : Math.min(1, availableSlots),
      );
      const oversized = selectedFiles.filter(
        (file) => file.size > maxFileSize,
      );
      const accepted = selectedFiles.filter(
        (file) => file.size <= maxFileSize,
      );

      if (oversized.length > 0) onFilesRejected?.(oversized, "too-large");
      if (incomingFiles.length > selectedFiles.length) {
        onFilesRejected?.(incomingFiles.slice(selectedFiles.length), "max-files");
      }

      const added = accepted.map((file, index) => {
        const kind = inferKind(file);
        const objectUrl = URL.createObjectURL(file);
        ownedUrlsRef.current.add(objectUrl);

        return {
          id: `${Date.now()}-${index}-${file.name}`,
          name: file.name,
          kind,
          size: file.size,
          previewUrl: kind === "image" ? objectUrl : undefined,
          href: objectUrl,
          currentTime: kind === "audio" ? 0 : undefined,
          duration: kind === "audio" ? 0 : undefined,
          file,
        };
      });

      if (added.length === 0) return;
      setItems([...items, ...added]);
      const addedIds = added.map((item) => item.id);
      setUploadingIds((current) => new Set([...current, ...addedIds]));
      scheduleLifecycle(
        () => {
          setUploadingIds((current) => {
            const next = new Set(current);
            for (const id of addedIds) next.delete(id);
            return next;
          });
          setUploadCompleteIds(
            (current) => new Set([...current, ...addedIds]),
          );
          scheduleLifecycle(() => {
            setUploadCompleteIds((current) => {
              const next = new Set(current);
              for (const id of addedIds) next.delete(id);
              return next;
            });
          }, UPLOAD_COMPLETE_HOLD_MS);
        },
        reduce ? 140 : UPLOAD_PROGRESS_MS,
      );
      onFilesAdded?.(added, accepted);
    },
    [
      disabled,
      items,
      maxFileSize,
      maxFiles,
      multiple,
      onFilesAdded,
      onFilesRejected,
      reduce,
      scheduleLifecycle,
      setItems,
    ],
  );

  const finalizeRemove = useCallback(
    (item: AttachmentUploadItem) => {
      const ownedUrl = [item.previewUrl, item.href].find(
        (url): url is string =>
          url !== undefined && ownedUrlsRef.current.has(url),
      );
      if (ownedUrl) {
        URL.revokeObjectURL(ownedUrl);
        ownedUrlsRef.current.delete(ownedUrl);
      }
      setPreviewItem((current) =>
        current?.id === item.id ? null : current,
      );
      setUploadingIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      setUploadCompleteIds((current) => {
        const next = new Set(current);
        next.delete(item.id);
        return next;
      });
      setItems(itemsRef.current.filter((entry) => entry.id !== item.id));
      onRemove?.(item);
    },
    [onRemove, setItems],
  );

  const requestRemove = useCallback(
    (item: AttachmentUploadItem) => {
      if (removingIds.has(item.id)) return;

      setRemovingIds((current) => new Set(current).add(item.id));
      scheduleLifecycle(
        () => {
          finalizeRemove(item);
          setRemovingIds((current) => {
            const next = new Set(current);
            next.delete(item.id);
            return next;
          });
        },
        reduce ? 140 : REMOVE_PENDING_MS,
      );
    },
    [
      finalizeRemove,
      reduce,
      removingIds,
      scheduleLifecycle,
    ],
  );

  const resetDrag = useCallback(() => {
    dragDepthRef.current = 0;
    setDragging(false);
  }, []);
  const closePreview = useCallback(() => setPreviewItem(null), []);

  useEffect(() => {
    if (
      previewItem &&
      !items.some((item) => item.id === previewItem.id)
    ) {
      setPreviewItem(null);
    }
  }, [items, previewItem]);

  const uploadOrder = Array.from(uploadingIds);
  const previewLayoutId = previewItem
    ? `attachment-image-${previewItem.id}`
    : undefined;

  return (
    <LayoutGroup id={inputId}>
      <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        aria-label={t("input")}
        accept={accept}
        multiple={multiple}
        disabled={disabled || maxReached}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          addFiles(Array.from(event.currentTarget.files ?? []));
          event.currentTarget.value = "";
        }}
      />

      <motion.button
        type="button"
        disabled={disabled || maxReached}
        data-dragging={dragging}
        animate={
          reduce
            ? undefined
            : { scale: dragging ? 1.006 : 1 }
        }
        whileTap={reduce ? undefined : { scale: 0.995 }}
        transition={SPRING_PRESS}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          dragDepthRef.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
          if (dragDepthRef.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          if (disabled || maxReached) return;
          event.preventDefault();
          resetDrag();
          addFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          "group relative isolate flex min-h-52 w-full flex-col items-center justify-center overflow-hidden rounded-3xl bg-muted/65 p-2 text-center outline-none",
          "transition-colors duration-200 hover:bg-muted/85",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[dragging=true]:bg-muted",
          "disabled:pointer-events-none disabled:opacity-55",
          classNames?.dropzone,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-2 -z-10 rounded-2xl border border-dashed border-muted-foreground/25 bg-background transition-[border-color,background-color] duration-200 group-hover:border-muted-foreground/45 group-data-[dragging=true]:border-foreground/65 group-data-[dragging=true]:bg-muted/20"
        />
        <motion.span
          aria-hidden="true"
          animate={
            reduce
              ? undefined
              : {
                  y: dragging ? -4 : 0,
                  scale: dragging ? 1.08 : 1,
                }
          }
          transition={ITEM_TRANSITION}
          className="mb-3 grid size-11 place-items-center rounded-full bg-muted text-foreground transition-colors duration-200 group-hover:bg-muted/80 group-data-[dragging=true]:bg-primary group-data-[dragging=true]:text-primary-foreground"
        >
          <Upload className="size-[18px]" />
        </motion.span>
        <span className="text-sm font-medium tracking-[-0.01em] text-foreground">
          {maxReached ? t("limitTitle") : (title ?? t("title"))}
        </span>
        <span className="mt-1 text-xs leading-5 text-muted-foreground">
          {maxReached
            ? t("limitDescription", { count: items.length, max: maxFiles })
            : (description ??
              t("description", { size: formatMaxSize(maxFileSize, locale) }))}
        </span>
      </motion.button>

      {items.length > 0 ? (
        <section className="mt-8" aria-labelledby={`${inputId}-attachments`}>
          <h3
            id={`${inputId}-attachments`}
            className="text-sm font-medium text-foreground"
          >
            {attachmentsLabel ?? t("attachments")}
          </h3>

          {items.length > 0 ? (
            <ul className={cn("mt-3 space-y-2", classNames?.list)}>
              <AnimatePresence initial={uploadOrder.length > 0}>
                {items.map((item) => (
                  <AttachmentRow
                    key={item.id}
                    item={item}
                    playing={playingId === item.id}
                    uploading={
                      uploadingIds.has(item.id) ||
                      item.status === "uploading"
                    }
                    uploadComplete={
                      uploadCompleteIds.has(item.id) ||
                      item.status === "complete"
                    }
                    failed={item.status === "failed"}
                    removing={removingIds.has(item.id)}
                    arrivalIndex={uploadOrder.indexOf(item.id)}
                    imageLayoutId={
                      reduce ? undefined : `attachment-image-${item.id}`
                    }
                    onAudioToggle={onAudioToggle}
                    onImagePreview={setPreviewItem}
                    onRemove={requestRemove}
                    onRetry={onRetry}
                    reduce={reduce}
                    className={classNames?.row}
                    t={t}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : null}
        </section>
      ) : null}

      <ImagePreviewDialog
        item={previewItem}
        layoutId={reduce ? undefined : previewLayoutId}
        onClose={closePreview}
        reduce={reduce}
        t={t}
      />
      </div>
    </LayoutGroup>
  );
}
