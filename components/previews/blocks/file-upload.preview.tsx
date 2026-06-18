"use client";

import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FileUpload,
  type FileUploadItem,
  type FileUploadVariant,
} from "@/components/motion/file-upload";

const initialItems: FileUploadItem[] = [
  {
    id: "brand-assets",
    name: "brand-assets.zip",
    size: 18_400_000,
    type: "application/zip",
    progress: 100,
    status: "success",
  },
  {
    id: "release-video",
    name: "release-cut.mov",
    size: 84_200_000,
    type: "video/quicktime",
    progress: 58,
    status: "uploading",
  },
  {
    id: "contracts",
    name: "vendor-contract.pdf",
    size: 2_800_000,
    type: "application/pdf",
    progress: 32,
    status: "error",
    error: "Connection lost",
  },
];

const variants: { id: FileUploadVariant; label: string }[] = [
  { id: "centered", label: "Centered" },
  { id: "default", label: "Row" },
];

export function FileUploadPreview() {
  const [items, setItems] = useState(initialItems);
  const [variant, setVariant] = useState<FileUploadVariant>("centered");
  const timersRef = useRef<Map<string, ReturnType<typeof setInterval>>>(
    new Map(),
  );

  const stopUpload = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (!timer) return;
    clearInterval(timer);
    timersRef.current.delete(id);
  }, []);

  const startUpload = useCallback(
    (id: string) => {
      stopUpload(id);

      const timer = setInterval(() => {
        setItems((current) => {
          const target = current.find((item) => item.id === id);
          if (target?.status !== "uploading") {
            stopUpload(id);
            return current;
          }

          const nextProgress = Math.min(
            100,
            (target.progress ?? 0) + 7 + Math.random() * 12,
          );

          if (nextProgress >= 100) {
            stopUpload(id);
          }

          return current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  progress: nextProgress,
                  status: nextProgress >= 100 ? "success" : "uploading",
                }
              : item,
          );
        });
      }, 520);

      timersRef.current.set(id, timer);
    },
    [stopUpload],
  );

  useEffect(() => {
    startUpload("release-video");

    return () => {
      for (const timer of timersRef.current.values()) {
        clearInterval(timer);
      }
      timersRef.current.clear();
    };
  }, [startUpload]);

  return (
    <div className="flex min-h-[30rem] w-full items-center justify-center">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-background p-3">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Upload package
            </p>
            <p className="text-xs text-muted-foreground">
              {items.filter((item) => item.status === "success").length} of{" "}
              {items.length} files ready
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex rounded-full border border-border bg-muted p-1">
              {variants.map((entry) => {
                const selected = entry.id === variant;

                return (
                  <button
                    key={entry.id}
                    type="button"
                    onClick={() => setVariant(entry.id)}
                    data-selected={selected}
                    className="h-7 rounded-full px-3 text-xs font-medium text-muted-foreground transition-[background-color,color,transform] duration-150 hover:text-foreground active:scale-95 data-[selected=true]:bg-background data-[selected=true]:text-foreground"
                  >
                    {entry.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => {
                for (const item of items) {
                  stopUpload(item.id);
                }
                setItems(initialItems);
                startUpload("release-video");
              }}
              className="grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground active:scale-95"
              aria-label="Reset upload queue"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <FileUpload
          value={items}
          variant={variant}
          onValueChange={setItems}
          onFilesAdded={(added) => {
            for (const item of added) {
              startUpload(item.id);
            }
          }}
          onRetry={(item) => startUpload(item.id)}
          onRemove={(item) => stopUpload(item.id)}
          maxFiles={5}
          title={variant === "centered" ? "Drop files to upload" : "Drop release files"}
          description="PDF, images, video or zipped assets"
        />
      </div>
    </div>
  );
}
