import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import {
  AttachmentUpload,
  type AttachmentUploadItem,
} from "@/components/motion/attachment-upload";

afterEach(cleanup);

const FILE_ITEM: AttachmentUploadItem = {
  id: "brief",
  name: "brief.pdf",
  kind: "file",
  size: 240_000,
};

describe("AttachmentUpload", () => {
  test("shows pending feedback before removing an attachment", async () => {
    const onRemove = mock(() => {});
    const { getByLabelText, queryByLabelText, queryByText } = render(
      <AttachmentUpload defaultValue={[FILE_ITEM]} onRemove={onRemove} />,
    );

    fireEvent.click(getByLabelText("Remove brief.pdf"));

    expect(getByLabelText("Removing brief.pdf")).toBeTruthy();
    expect(queryByText("brief.pdf")).toBeTruthy();

    await waitFor(() => {
      expect(onRemove).toHaveBeenCalledWith(FILE_ITEM);
      expect(queryByLabelText("Removing brief.pdf")).toBeNull();
      expect(queryByLabelText("Remove brief.pdf")).toBeNull();
    });
  });

  test("rejects files over the size limit", () => {
    const onFilesRejected = mock(() => {});
    const file = new File(["too large"], "archive.zip", {
      type: "application/zip",
    });
    const { getByLabelText } = render(
      <AttachmentUpload
        maxFileSize={1}
        onFilesRejected={onFilesRejected}
      />,
    );

    fireEvent.change(getByLabelText("Upload attachments"), {
      target: { files: [file] },
    });

    expect(onFilesRejected).toHaveBeenCalledWith([file], "too-large");
  });

  test("shows upload progress for newly added files", async () => {
    const file = new File(["draft"], "draft.txt", {
      type: "text/plain",
    });
    const {
      getByLabelText,
      getByRole,
      queryByLabelText,
    } = render(
      <AttachmentUpload />,
    );

    fireEvent.change(getByLabelText("Upload attachments"), {
      target: { files: [file] },
    });

    expect(
      getByRole("progressbar", { name: "Uploading draft.txt" }),
    ).toBeTruthy();
    expect(queryByLabelText("Remove draft.txt")).toBeNull();

    await waitFor(() => {
      expect(
        getByLabelText("Upload complete for draft.txt"),
      ).toBeTruthy();
      expect(queryByLabelText("Remove draft.txt")).toBeNull();
    });

    await waitFor(() => {
      expect(getByLabelText("Remove draft.txt")).toBeTruthy();
    }, { timeout: 1600 });
  });

  test("shows failed uploads with a retry action", () => {
    const failedItem: AttachmentUploadItem = {
      ...FILE_ITEM,
      status: "failed",
      error: "Network interrupted",
    };
    const onRetry = mock(() => {});
    const { getByLabelText, getByText } = render(
      <AttachmentUpload
        defaultValue={[failedItem]}
        onRetry={onRetry}
      />,
    );

    expect(getByText("Network interrupted")).toBeTruthy();
    fireEvent.click(getByLabelText("Retry brief.pdf"));

    expect(onRetry).toHaveBeenCalledWith(failedItem);
  });

  test("forwards audio playback actions", () => {
    const audio: AttachmentUploadItem = {
      id: "note",
      name: "note.m4a",
      kind: "audio",
      currentTime: 4,
      duration: 18,
    };
    const onAudioToggle = mock(() => {});
    const { getByLabelText } = render(
      <AttachmentUpload
        defaultValue={[audio]}
        onAudioToggle={onAudioToggle}
      />,
    );

    fireEvent.click(getByLabelText("Play note.m4a"));

    expect(onAudioToggle).toHaveBeenCalledWith(audio);
  });

  test("opens image rows in a dismissible preview dialog", async () => {
    const image: AttachmentUploadItem = {
      id: "cover",
      name: "cover.png",
      kind: "image",
      size: 320_000,
      previewUrl: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' />",
    };
    const { getByLabelText, getByRole } = render(
      <AttachmentUpload defaultValue={[image]} />,
    );

    const previewTrigger = getByLabelText("Preview cover.png");
    fireEvent.click(previewTrigger);

    expect(
      getByRole("dialog", { name: "Preview of cover.png" }),
    ).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(document.body.style.overflow).toBe("");
      expect(document.activeElement).toBe(previewTrigger);
    });
  });
});
