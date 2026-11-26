export type AttachmentUploadKind = "file" | "link" | "image" | "audio";
export type AttachmentRejectReason = "too-large" | "max-files";
export type AttachmentUploadStatus =
  | "idle"
  | "uploading"
  | "complete"
  | "failed";

export type AttachmentUploadItem = {
  /** Unique key for the row in the list. */
  id: string;
  /** File or link name shown on the row and used in its labels. */
  name: string;
  /** Row type: picks the icon, image thumbnail or audio player. */
  kind: AttachmentUploadKind;
  /** File size in bytes, shown under the name. Hidden for links. */
  size?: number;
  /** Link opened by the row's open button; also the image source without `previewUrl`. */
  href?: string;
  /** Image used for the thumbnail and preview dialog of an `image` row. */
  previewUrl?: string;
  /** Audio playback position in seconds, shown and filled on the waveform. */
  currentTime?: number;
  /** Audio length in seconds, shown after the waveform. */
  duration?: number;
  /** Upload state; `uploading`, `complete` and `failed` change the row. */
  status?: AttachmentUploadStatus;
  /** Message shown when the status is `failed`. Default: "Upload failed" */
  error?: string;
  /** The picked File, kept for your upload code; the component does not read it. */
  file?: File;
};

export type AttachmentUploadClassNames = {
  /** The drop area, a button that also opens the file picker. */
  dropzone?: string;
  /** The list of attachment rows. */
  list?: string;
  /** Each attachment row. */
  row?: string;
};
