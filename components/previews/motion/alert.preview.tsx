"use client";

import { useRef, useState } from "react";
import { Alert, AlertAction, AlertClose, AlertContent, AlertDescription, AlertIcon, AlertTitle } from "@/components/motion/alert";
import { Button } from "@/components/motion/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

const messages = {
  info: { label: "Info", title: "A little heads up", description: "Your changes are saved automatically as you work." },
  success: { label: "Success", title: "All set", description: "Your changes have been saved." },
  warning: { label: "Warning", title: "Almost at the limit", description: "You're getting close to your storage limit. Free up some space before uploading more files." },
  destructive: { label: "Error", title: "Something went wrong", description: "We couldn't save your changes. Give it another try." },
} as const;

type PreviewVariant = keyof typeof messages;

export function AlertPreview() {
  const [variant, setVariant] = useState<PreviewVariant>("info");
  const [open, setOpen] = useState(true);
  const showRef = useRef<HTMLButtonElement>(null);
  const message = messages[variant];

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      <Tabs value={variant} onValueChange={(value) => { setVariant(value as PreviewVariant); setOpen(true); }} className="w-full">
        <TabsList aria-label="Alert variant" className="bg-muted">
          {Object.entries(messages).map(([value, item]) => <TabsTrigger key={value} value={value} className="px-3 py-1.5 text-xs">{item.label}</TabsTrigger>)}
        </TabsList>
      </Tabs>
      <Alert variant={variant} open={open} onOpenChange={setOpen} returnFocusRef={showRef}>
        <AlertIcon />
        <AlertContent>
          <AlertTitle>{message.title}</AlertTitle>
          <AlertDescription>{message.description}</AlertDescription>
          {variant === "destructive" && (
            <AlertAction>
              <Button size="sm" variant="outline" onClick={() => setVariant("success")}>Try again</Button>
            </AlertAction>
          )}
        </AlertContent>
        <AlertClose />
      </Alert>
      <Button ref={showRef} variant="ghost" size="sm" onClick={() => setOpen(true)} disabled={open}>Show alert</Button>
    </div>
  );
}
