"use client";

import { useEffect, useState } from "react";
import { TextCascade } from "@/components/motion/text-cascade";

const PHRASES = ["Install skills", "Open settings", "Ship updates"];

export function TextCascadePreview() {
  const [phrase, setPhrase] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setPhrase((p) => (p + 1) % PHRASES.length);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex w-full justify-center">
      <p className="text-lg font-medium text-foreground">
        <TextCascade text={PHRASES[phrase] ?? PHRASES[0]} />
      </p>
    </div>
  );
}
