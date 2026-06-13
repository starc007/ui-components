"use client";

import { useState } from "react";
import { OTPInput, type OTPStatus } from "@/components/motion/otp-input";

const CODE = "123456";

export function OTPInputPreview() {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<OTPStatus>("idle");

  return (
    <div className="flex flex-col items-center gap-4">
      <OTPInput
        label="Verification code"
        hint={`Enter ${CODE} to verify.`}
        successMessage="Verified."
        errorMessage="Wrong code, try again."
        value={value}
        status={status}
        onChange={(v) => {
          setValue(v);
          if (status !== "idle") setStatus("idle");
        }}
        onComplete={(v) => setStatus(v === CODE ? "success" : "error")}
      />
    </div>
  );
}
