"use client";

import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ButtonPreview() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button variant="primary">Primary</Button>
      <Button variant="accent" rightIcon={<ArrowRight className="h-4 w-4" />}>Accent</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button leftIcon={<Download className="h-4 w-4" />}>With icon</Button>
      <Button loading>Loading</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
