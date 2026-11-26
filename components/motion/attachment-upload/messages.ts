/** English defaults. Override per instance with `labels`, or app-wide with `LocaleProvider`. */
export const attachmentUploadMessages = {
  title: "Drag and drop or browse files",
  description: "Maximum {size} file size",
  attachments: "Attachments",
  input: "Upload attachments",
  limitTitle: "Attachment limit reached",
  limitDescription: "{count} of {max} attachments added",
  uploading: "Uploading {name}",
  uploadComplete: "Upload complete",
  uploadCompleteFor: "Upload complete for {name}",
  removingAttachment: "Removing attachment",
  removing: "Removing {name}",
  uploadFailed: "Upload failed",
  uploadFailedFor: "Upload failed for {name}",
  retryUpload: "Retry upload",
  retry: "Retry {name}",
  removeAttachment: "Remove attachment",
  remove: "Remove {name}",
  clickToPreview: "Click to preview",
  preview: "Preview {name}",
  previewOf: "Preview of {name}",
  closePreview: "Close image preview",
  play: "Play {name}",
  pause: "Pause {name}",
  open: "Open {name}",
  web: "Web",
};

export type AttachmentUploadMessages = typeof attachmentUploadMessages;

export type Translate = (
  key: keyof AttachmentUploadMessages,
  values?: Record<string, string | number>,
) => string;
