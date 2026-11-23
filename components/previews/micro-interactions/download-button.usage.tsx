"use client";

import { DownloadButton } from "@/components/motion/download-button";

export function DownloadButtonUsage() {
  return (
    <DownloadButton
      onDownload={async (report) => {
        // Replace with your download; report progress from 0 to 1.
        for (let step = 1; step <= 10; step++) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          report(step / 10);
        }
      }}
    />
  );
}
