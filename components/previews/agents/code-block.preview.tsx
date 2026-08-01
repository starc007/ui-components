"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CodeBlock } from "@/components/agents/code-block";

const LINES = [
  'import { generateText } from "ai";',
  "",
  "export async function summarize(input: string) {",
  "  const { text } = await generateText({",
  '    model: "openai/gpt-5",',
  `    prompt: \`Summarize this clearly: \${input}\`,`,
  "  });",
  "",
  "  return {",
  "    text,",
  "    generatedAt: new Date().toISOString(),",
  "  };",
  "}",
];

function StreamingCodeBlock() {
  const [visibleLines, setVisibleLines] = useState(1);
  const timer = useRef<number | undefined>(undefined);
  const complete = visibleLines === LINES.length;

  useEffect(() => {
    if (visibleLines >= LINES.length) return;
    timer.current = window.setTimeout(
      () => setVisibleLines((value) => value + 1),
      260,
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [visibleLines]);

  return (
    <CodeBlock
      filename="summarize.ts"
      language="typescript"
      code={LINES.slice(0, visibleLines).join("\n")}
      status={complete ? "complete" : "streaming"}
      highlightLines={[4, 5, 6, 7]}
      maxHeight={224}
    />
  );
}

export function CodeBlockPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[340px] w-full max-w-xl">
      <StreamingCodeBlock key={run} />
      <button
        type="button"
        onClick={() => setRun((value) => value + 1)}
        className="absolute bottom-0 left-0 inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
      >
        <RotateCcw className="size-3" />
        Replay
      </button>
    </div>
  );
}
