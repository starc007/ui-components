"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/motion/button";
import { TextSlot } from "@/components/motion/text-slot";

const PHRASES = [
  "Ship buttery interfaces",
  "Ship delightful interfaces",
  "Build delightful interfaces",
  "Build buttery motion",
];

export function TextSlotPreview() {
  const [copied, setCopied] = useState(false);
  const [phrase, setPhrase] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhrase((p) => (p + 1) % PHRASES.length);
    }, 2600);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <Button
        variant="secondary"
        onClick={() => {
          setCopied(true);
          if (timer.current) window.clearTimeout(timer.current);
          timer.current = window.setTimeout(() => setCopied(false), 1600);
        }}
      >
        {copied ? <Check className="h-4 w-4 text-(--color-success)" /> : <Copy className="h-4 w-4" />}
        {/* Letter-by-letter cascade: old letters drop away right-lagging
            while new ones land from above, left to right. */}
        <TextSlot text={copied ? "Copied!" : "Copy link"} split="char" direction="down" />
      </Button>

      <p className="text-lg font-medium text-foreground">
        <TextSlot text={PHRASES[phrase] ?? PHRASES[0]} split="word" />
      </p>
    </div>
  );
}
