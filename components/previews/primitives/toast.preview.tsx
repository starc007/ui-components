"use client";

import { Button } from "@/components/ui/button";
import { ToastProvider, useToast } from "@/components/ui/toast";

function Demo() {
  const { push } = useToast();
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => push({ title: "Saved", description: "Your settings are up to date.", variant: "success" })}>Success</Button>
      <Button variant="secondary" onClick={() => push({ title: "Heads up", description: "Bandwidth nearing the limit.", variant: "warning" })}>Warning</Button>
      <Button variant="destructive" onClick={() => push({ title: "Failed", description: "Could not connect to server.", variant: "danger" })}>Danger</Button>
      <Button variant="outline" onClick={() => push({ title: "Build complete", variant: "info" })}>Info</Button>
    </div>
  );
}

export function ToastPreview() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
