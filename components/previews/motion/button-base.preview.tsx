"use client";

import { ArrowRight, Download, Trash2 } from "lucide-react";
import { Button } from "@/components/motion/button";

export function ButtonBasePreview() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button sound variant="primary" size="md">
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button sound variant="secondary" size="md">
          <Download className="h-4 w-4" />
          Download
        </Button>
        <Button sound variant="outline" size="md">Outline</Button>
        <Button sound variant="ghost" size="md">Ghost</Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button sound variant="primary" size="sm">Small</Button>
        <Button sound variant="primary" size="md">Medium</Button>
        <Button sound variant="primary" size="lg">Large</Button>
        <Button sound variant="secondary" size="icon" aria-label="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button sound variant="primary" size="md" ripple>Ripple</Button>
        <Button sound variant="outline" size="md" ripple>Tap me</Button>
      </div>
    </div>
  );
}
