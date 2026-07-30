"use client";

import {
  Download,
  ExternalLink,
  FileImage,
  Link as LinkIcon,
  Mic,
  Paperclip,
  Pause,
  Play,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Tooltip } from "@/components/motion/tooltip";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

export type AttachmentUploadKind = "file" | "link" | "image" | "audio";
export type AttachmentRejectReason = "too-large" | "max-files";

export type AttachmentUploadItem = {
  id: string;
  name: string;
  kind: AttachmentUploadKind;
  size?: number;
  href?: string;
  previewUrl?: string;
  currentTime?: number;
  duration?: number;
  file?: File;
};

export type AttachmentUploadClassNames = {
  dropzone?: string;
  list?: string;
  row?: string;
};

export interface AttachmentUploadProps {
  value?: AttachmentUploadItem[];
  defaultValue?: AttachmentUploadItem[];
  onValueChange?: (items: AttachmentUploadItem[]) => void;
  onFilesAdded?: (items: AttachmentUploadItem[], files: File[]) => void;
  onFilesRejected?: (files: File[], reason: AttachmentRejectReason) => void;
  onRemove?: (item: AttachmentUploadItem) => void;
  playingId?: string;
  onAudioToggle?: (item: AttachmentUploadItem) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  disabled?: boolean;
  title?: string;
  description?: string;
  attachmentsLabel?: string;
  className?: string;
  classNames?: AttachmentUploadClassNames;
}

const ITEM_TRANSITION = { duration: 0.2, ease: EASE_OUT } as const;
const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024;

const WAVEFORM_BARS = [
  18, 31, 24, 39, 30, 43, 27, 18, 9, 29, 38, 24, 34, 18, 26, 37, 21, 14,
  7, 11, 22, 35, 18, 26, 41, 29, 17, 33,
].map((height, index) => ({ id: `wave-${index}-${height}`, height }));

function useControllableList<T>({
  value,
  defaultValue,
  onValueChange,
}: {
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (items: T[]) => void;
}) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? []);
  const controlled = value !== undefined;
  const items = value ?? internalValue;

  const setItems = useCallback(
    (next: T[]) => {
      if (!controlled) setInternalValue(next);
      onValueChange?.(next);
    },
    [controlled, onValueChange],
  );

  return [items, setItems] as const;
}

function formatBytes(bytes: number | undefined) {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return `${value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[exponent]}`;
}

function formatDuration(seconds: number | undefined) {
  const safeSeconds = Math.max(0, Math.round(seconds ?? 0));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

function formatMaxSize(bytes: number) {
  const megabytes = bytes / (1024 * 1024);
  return `${Number.isInteger(megabytes) ? megabytes : megabytes.toFixed(1)} MB`;
}

function inferKind(file: File): AttachmentUploadKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

function AttachmentIcon({ kind }: { kind: AttachmentUploadKind }) {
  if (kind === "link") return <LinkIcon className="size-4" />;
  if (kind === "image") return <FileImage className="size-4" />;
  if (kind === "audio") return <Mic className="size-4" />;
  return <Paperclip className="size-4" />;
}

function imageSource(item: AttachmentUploadItem) {
  if (item.kind !== "image") return undefined;
  return item.previewUrl ?? item.href;
}

function RemoveButton({
  label,
  onClick,
  className,
}: {
  label: string;
  onClick: () => void;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      transition={SPRING_PRESS}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <X className="size-4" />
    </motion.button>
  );
}

function ImageThumbnail({
  item,
  onPreview,
  reduce,
}: {
  item: AttachmentUploadItem;
  onPreview: (item: AttachmentUploadItem) => void;
  reduce: boolean;
}) {
  const src = imageSource(item);

  if (!src) {
    return (
      <span
        aria-hidden="true"
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"
      >
        <FileImage className="size-4" />
      </span>
    );
  }

  return (
    <Tooltip
      side="top"
      delay={160}
      wrapperClassName="shrink-0"
      className="rounded-xl p-1 shadow-xl"
      content={
        <span className="block w-32">
          <img
            src={src}
            alt=""
            className="h-20 w-full rounded-lg object-cover"
          />
          <span className="block px-1 pb-0.5 pt-1 text-center text-[10px] font-medium text-muted-foreground">
            Click to preview
          </span>
        </span>
      }
    >
      <motion.button
        type="button"
        aria-label={`Preview ${item.name}`}
        onClick={(event) => {
          event.currentTarget.blur();
          onPreview(item);
        }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        transition={SPRING_PRESS}
        className="group/image relative size-9 shrink-0 overflow-hidden rounded-[10px] bg-muted outline-none ring-1 ring-border/70 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img
          src={src}
          alt=""
          className="size-full object-cover"
        />
      </motion.button>
    </Tooltip>
  );
}

function ImagePreviewDialog({
  item,
  onClose,
  reduce,
}: {
  item: AttachmentUploadItem | null;
  onClose: () => void;
  reduce: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "Tab") {
        event.preventDefault();
        closeRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [item, onClose]);

  if (typeof document === "undefined") return null;

  const src = item ? imageSource(item) : undefined;

  return createPortal(
    <AnimatePresence>
      {item && src ? (
        <div className="pointer-events-none fixed inset-0 z-[10000]">
          <motion.button
            type="button"
            aria-label="Close image preview"
            tabIndex={-1}
            className="pointer-events-auto absolute inset-0 size-full cursor-default bg-black/45 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.1 : 0.2, ease: EASE_OUT }}
            onClick={onClose}
          />

          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`Preview of ${item.name}`}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.96, y: 12 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97, y: 8 }
              }
              transition={ITEM_TRANSITION}
              className="pointer-events-auto relative"
            >
              <img
                src={src}
                alt={item.name}
                className="max-h-[90vh] max-w-[90vw] rounded-2xl object-contain shadow-2xl"
              />
              <motion.button
                ref={closeRef}
                type="button"
                aria-label="Close image preview"
                onClick={onClose}
                whileTap={reduce ? undefined : { scale: 0.92 }}
                transition={SPRING_PRESS}
                className="absolute -right-3 -top-3 grid size-9 place-items-center rounded-full bg-background text-foreground shadow-xl outline-none ring-1 ring-border/70 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              >
                <X className="size-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

function AttachmentRow({
  item,
  playing,
  onAudioToggle,
  onImagePreview,
  onRemove,
  reduce,
  className,
}: {
  item: AttachmentUploadItem;
  playing: boolean;
  onAudioToggle?: (item: AttachmentUploadItem) => void;
  onImagePreview: (item: AttachmentUploadItem) => void;
  onRemove: (item: AttachmentUploadItem) => void;
  reduce: boolean;
  className?: string;
}) {
  const size = formatBytes(item.size);
  const progress =
    item.duration && item.duration > 0
      ? Math.min(1, Math.max(0, (item.currentTime ?? 0) / item.duration))
      : 0;

  return (
    <motion.li
      layout={!reduce}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
      transition={ITEM_TRANSITION}
      className={cn(
        "flex min-h-14 items-center gap-1 rounded-2xl bg-muted/70 p-1",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 self-stretch rounded-xl bg-background px-2 py-1">
        {item.kind === "image" ? (
          <ImageThumbnail
            item={item}
            onPreview={onImagePreview}
            reduce={reduce}
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
                      ? "bg-foreground"
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
              aria-label={`${playing ? "Pause" : "Play"} ${item.name}`}
              onClick={() => onAudioToggle?.(item)}
              whileTap={{ scale: 0.94 }}
              transition={SPRING_PRESS}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {item.name}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {item.kind === "link" ? "Web" : size}
            </span>
            {item.href ? (
              <a
                href={item.href}
                target={item.kind === "link" ? "_blank" : undefined}
                rel={item.kind === "link" ? "noreferrer noopener" : undefined}
                download={item.kind === "link" ? undefined : item.name}
                aria-label={
                  item.kind === "link"
                    ? `Open ${item.name}`
                    : `Download ${item.name}`
                }
                className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.kind === "link" ? (
                  <ExternalLink className="size-4" />
                ) : (
                  <Download className="size-4" />
                )}
              </a>
            ) : null}
          </>
        )}
      </div>

      <RemoveButton
        label={`Remove ${item.name}`}
        onClick={() => onRemove(item)}
      />
    </motion.li>
  );
}

export function AttachmentUpload({
  value,
  defaultValue,
  onValueChange,
  onFilesAdded,
  onFilesRejected,
  onRemove,
  playingId,
  onAudioToggle,
  accept,
  multiple = true,
  maxFiles = 12,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  disabled = false,
  title = "Drag and drop or browse files",
  description,
  attachmentsLabel = "Attachments",
  className,
  classNames,
}: AttachmentUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const ownedUrlsRef = useRef(new Set<string>());
  const reduce = useReducedMotion() ?? false;
  const [dragging, setDragging] = useState(false);
  const [previewItem, setPreviewItem] =
    useState<AttachmentUploadItem | null>(null);
  const [items, setItems] = useControllableList({
    value,
    defaultValue,
    onValueChange,
  });

  useEffect(
    () => () => {
      for (const url of ownedUrlsRef.current) URL.revokeObjectURL(url);
      ownedUrlsRef.current.clear();
    },
    [],
  );

  const maxReached = items.length >= maxFiles;

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
      setItems,
    ],
  );

  const removeItem = useCallback(
    (item: AttachmentUploadItem) => {
      const ownedUrl = [item.previewUrl, item.href].find(
        (url): url is string =>
          url !== undefined && ownedUrlsRef.current.has(url),
      );
      if (ownedUrl) {
        URL.revokeObjectURL(ownedUrl);
        ownedUrlsRef.current.delete(ownedUrl);
      }
      if (previewItem?.id === item.id) setPreviewItem(null);
      setItems(items.filter((entry) => entry.id !== item.id));
      onRemove?.(item);
    },
    [items, onRemove, previewItem, setItems],
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

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        aria-label="Upload attachments"
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
          "group relative isolate flex min-h-52 w-full flex-col items-center justify-center overflow-hidden rounded-[2rem] bg-muted/65 p-2 text-center outline-none",
          "transition-colors duration-200 hover:bg-muted/85",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "data-[dragging=true]:bg-muted",
          "disabled:pointer-events-none disabled:opacity-55",
          classNames?.dropzone,
        )}
      >
        <span
          aria-hidden="true"
          className="absolute inset-2 -z-10 rounded-[1.5rem] border border-dashed border-muted-foreground/25 bg-background transition-[border-color,background-color] duration-200 group-hover:border-muted-foreground/45 group-data-[dragging=true]:border-foreground/65 group-data-[dragging=true]:bg-muted/20"
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
          className="mb-3 grid size-11 place-items-center rounded-2xl bg-muted text-foreground transition-colors duration-200 group-hover:bg-muted/80 group-data-[dragging=true]:bg-foreground group-data-[dragging=true]:text-background"
        >
          <Upload className="size-[18px]" />
        </motion.span>
        <span className="text-sm font-semibold tracking-[-0.01em] text-foreground">
          {maxReached ? "Attachment limit reached" : title}
        </span>
        <span className="mt-1 text-xs leading-5 text-muted-foreground">
          {maxReached
            ? `${items.length} of ${maxFiles} attachments added`
            : description ?? `Maximum ${formatMaxSize(maxFileSize)} file size`}
        </span>
      </motion.button>

      {items.length > 0 ? (
        <section className="mt-8" aria-labelledby={`${inputId}-attachments`}>
          <h3
            id={`${inputId}-attachments`}
            className="text-sm font-semibold text-foreground"
          >
            {attachmentsLabel}
          </h3>

          {items.length > 0 ? (
            <ul className={cn("mt-3 space-y-2", classNames?.list)}>
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <AttachmentRow
                    key={item.id}
                    item={item}
                    playing={playingId === item.id}
                    onAudioToggle={onAudioToggle}
                    onImagePreview={setPreviewItem}
                    onRemove={removeItem}
                    reduce={reduce}
                    className={classNames?.row}
                  />
                ))}
              </AnimatePresence>
            </ul>
          ) : null}
        </section>
      ) : null}

      <ImagePreviewDialog
        item={previewItem}
        onClose={closePreview}
        reduce={reduce}
      />
    </div>
  );
}
