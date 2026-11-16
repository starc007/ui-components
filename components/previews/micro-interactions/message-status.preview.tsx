"use client";

import { useState } from "react";
import { MessageStatus, type MessageStatusValue } from "@/components/motion/message-status";
import { useAutoplay } from "./autoplay";

const STEPS: MessageStatusValue[] = ["sending", "sent", "delivered", "read"];

export function MessageStatusPreview() {
  const [step, setStep] = useState(0);
  const stage = useAutoplay(() => setStep((value) => (value + 1) % STEPS.length), 1200);

  return (
    <div {...stage}>
      <MessageStatus status={STEPS[step]} showLabel />
    </div>
  );
}
