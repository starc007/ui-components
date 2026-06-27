"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { type ButtonState, StatefulButton } from "@/components/motion/button";

export function ButtonStatefulPreview() {
  const [okState, setOkState] = useState<ButtonState>("idle");
  const [errState, setErrState] = useState<ButtonState>("idle");

  const run = (target: "ok" | "err") => {
    const setter = target === "ok" ? setOkState : setErrState;
    setter("loading");
    setTimeout(() => {
      setter(target === "ok" ? "success" : "error");
      setTimeout(() => setter("idle"), 1800);
    }, 1400);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <StatefulButton
        state={okState}
        variant="primary"
        size="md"
        onClick={() => run("ok")}
        loadingText="Saving"
        successText="Saved"
        icon={<ArrowRight className="h-4 w-4" />}
      >
        Save changes
      </StatefulButton>
      <StatefulButton
        state={errState}
        variant="secondary"
        size="md"
        onClick={() => run("err")}
        loadingText="Submitting"
        errorText="Failed"
      >
        Submit
      </StatefulButton>
    </div>
  );
}
