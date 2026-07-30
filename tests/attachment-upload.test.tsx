import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
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
  test("removes attachments in uncontrolled mode", () => {
    const onRemove = mock(() => {});
    const { getByLabelText, queryByText } = render(
      <AttachmentUpload defaultValue={[FILE_ITEM]} onRemove={onRemove} />,
    );

    fireEvent.click(getByLabelText("Remove brief.pdf"));

    expect(queryByText("brief.pdf")).toBeNull();
    expect(onRemove).toHaveBeenCalledWith(FILE_ITEM);
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
});
