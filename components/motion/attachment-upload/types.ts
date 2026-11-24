export type AttachmentUploadKind = "file" | "link" | "image" | "audio";
export type AttachmentRejectReason = "too-large" | "max-files";
export type AttachmentUploadStatus =
  | "idle"
  | "uploading"
  | "complete"
  | "failed";

export type AttachmentUploadItem = {
  id: string;
  name: string;
  kind: AttachmentUploadKind;
  size?: number;
  href?: string;
  previewUrl?: string;
  currentTime?: number;
  duration?: number;
  status?: AttachmentUploadStatus;
  error?: string;
  file?: File;
};

export type AttachmentUploadClassNames = {
  dropzone?: string;
  list?: string;
  row?: string;
};
