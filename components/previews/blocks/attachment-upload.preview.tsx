"use client";

import { useEffect, useRef, useState } from "react";
import {
  AttachmentUpload,
  type AttachmentUploadItem,
} from "@/components/motion/attachment-upload";

const INITIAL_ITEMS: AttachmentUploadItem[] = [
  {
    id: "brief",
    name: "launch-brief.pdf",
    kind: "file",
    size: 32_400_000,
    href: "data:application/pdf,beUI%20launch%20brief",
    status: "failed",
    error: "Upload failed",
  },
  {
    id: "flowers",
    name: "orange-flowers.jpg",
    kind: "image",
    size: 9_800_000,
    previewUrl:
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1200&q=85",
  },
  {
    id: "voice-note",
    name: "launch-note.m4a",
    kind: "audio",
    currentTime: 12,
    duration: 48,
  },
];

export function AttachmentUploadPreview() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [playingId, setPlayingId] = useState<string>();
  const retryTimersRef = useRef<number[]>([]);

  useEffect(
    () => () => {
      for (const timer of retryTimersRef.current) {
        window.clearTimeout(timer);
      }
    },
    [],
  );

  useEffect(() => {
    if (!playingId) return;

    const timer = window.setInterval(() => {
      setItems((current) =>
        current.map((item) => {
          if (item.id !== playingId || !item.duration) return item;
          const nextTime = Math.min(
            item.duration,
            (item.currentTime ?? 0) + 1,
          );
          return { ...item, currentTime: nextTime };
        }),
      );
    }, 1000);

    return () => window.clearInterval(timer);
  }, [playingId]);

  useEffect(() => {
    if (!playingId) return;
    const playingItem = items.find((item) => item.id === playingId);
    if (
      playingItem?.duration &&
      (playingItem.currentTime ?? 0) >= playingItem.duration
    ) {
      setPlayingId(undefined);
    }
  }, [items, playingId]);

  return (
    <div className="w-full max-w-2xl px-3 py-6 sm:px-6">
      <AttachmentUpload
        value={items}
        onValueChange={setItems}
        onRetry={(retryItem) => {
          setItems((current) =>
            current.map((item) =>
              item.id === retryItem.id
                ? { ...item, status: "uploading", error: undefined }
                : item,
            ),
          );

          const completeTimer = window.setTimeout(() => {
            setItems((current) =>
              current.map((item) =>
                item.id === retryItem.id
                  ? { ...item, status: "complete" }
                  : item,
              ),
            );
          }, 900);
          const readyTimer = window.setTimeout(() => {
            setItems((current) =>
              current.map((item) =>
                item.id === retryItem.id
                  ? { ...item, status: "idle" }
                  : item,
              ),
            );
          }, 1900);
          retryTimersRef.current.push(completeTimer, readyTimer);
        }}
        playingId={playingId}
        onAudioToggle={(item) => {
          setPlayingId((current) =>
            current === item.id ? undefined : item.id,
          );
        }}
        attachmentsLabel="Attachments:"
      />
    </div>
  );
}
