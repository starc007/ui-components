"use client";

import { SendButton } from "@/components/motion/send-button";

export function SendButtonUsage() {
  return (
    <SendButton
      onSend={async () => {
        // Replace with your request; Sending shows until it settles.
        await new Promise((resolve) => setTimeout(resolve, 800));
      }}
    />
  );
}
