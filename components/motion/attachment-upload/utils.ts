import { EASE_OUT } from "@/lib/ease";
import type { AttachmentUploadItem, AttachmentUploadKind } from "./types";

export const ITEM_TRANSITION = { duration: 0.2, ease: EASE_OUT } as const;
export const DEFAULT_MAX_FILE_SIZE = 500 * 1024 * 1024;
export const UPLOAD_PROGRESS_MS = 900;
export const UPLOAD_COMPLETE_HOLD_MS = 1000;
export const REMOVE_PENDING_MS = 420;

const UNITS = ["byte", "kilobyte", "megabyte", "gigabyte"] as const;

/** `locale` localizes digits and unit names; without it the English `KB`/`MB` form stays. */
function formatUnit(value: number, unit: number, digits: number, locale?: string) {
  if (!locale) return `${value.toFixed(digits)} ${["B", "KB", "MB", "GB"][unit]}`;
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit: UNITS[unit],
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

export function formatBytes(bytes: number | undefined, locale?: string) {
  if (bytes === undefined || !Number.isFinite(bytes) || bytes <= 0) {
    return null;
  }

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    UNITS.length - 1,
  );
  const value = bytes / 1024 ** exponent;

  return formatUnit(value, exponent, value >= 10 || exponent === 0 ? 0 : 1, locale);
}

export function formatDuration(seconds: number | undefined) {
  const safeSeconds = Math.max(0, Math.round(seconds ?? 0));
  const minutes = Math.floor(safeSeconds / 60);
  return `${minutes}:${String(safeSeconds % 60).padStart(2, "0")}`;
}

export function formatMaxSize(bytes: number, locale?: string) {
  const megabytes = bytes / (1024 * 1024);
  return formatUnit(megabytes, 2, Number.isInteger(megabytes) ? 0 : 1, locale);
}

export function inferKind(file: File): AttachmentUploadKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  return "file";
}

export function imageSource(item: AttachmentUploadItem) {
  if (item.kind !== "image") return undefined;
  return item.previewUrl ?? item.href;
}
