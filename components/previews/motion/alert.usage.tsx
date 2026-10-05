"use client";

import { useRef, useState } from "react";
import { Alert, AlertClose, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/motion/alert";
import { Button } from "@/components/motion/button";

export function AlertUsage() {
  const [open, setOpen] = useState(true);
  const showRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="w-full max-w-md space-y-4">
      <Alert variant="info" open={open} onOpenChange={setOpen} returnFocusRef={showRef}>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>A little heads up</AlertTitle>
          <AlertDescription>Your changes are saved automatically as you work.</AlertDescription>
        </AlertContent>
        <AlertClose />
      </Alert>
      <Button ref={showRef} variant="outline" size="sm" onClick={() => setOpen(true)} disabled={open}>Show alert</Button>
    </div>
  );
}
