"use client";

import {
  Bot,
  FileText,
  ImagePlus,
  Puzzle,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PromptInput } from "@/components/agents/prompt-input";
import { EASE_OUT } from "@/lib/ease";
import { useFavicon } from "@/lib/hooks/use-favicon";

function ModelLogo({ url }: { url: string }) {
  const favicon = useFavicon(url);

  if (!favicon.src) return <Bot />;

  return (
    // biome-ignore lint/performance/noImgElement: Remote provider favicons keep the registry preview framework-agnostic.
    <img
      ref={favicon.ref}
      src={favicon.src}
      alt=""
      width={16}
      height={16}
      referrerPolicy="no-referrer"
      className="size-4 rounded-sm object-contain"
    />
  );
}

const MODELS = [
  {
    value: "gpt-5.2",
    label: "GPT-5.2",
    icon: <ModelLogo url="https://openai.com" />,
  },
  {
    value: "claude-sonnet-4",
    label: "Claude Sonnet 4",
    icon: <ModelLogo url="https://www.anthropic.com" />,
  },
  {
    value: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    // gemini.google.com has no /favicon.ico; Google DeepMind ships Gemini.
    icon: <ModelLogo url="https://deepmind.google" />,
  },
  {
    value: "grok-4.5",
    label: "Grok 4.5",
    icon: <ModelLogo url="https://x.ai" />,
  },
  {
    value: "mistral-large-3",
    label: "Mistral Large 3",
    icon: <ModelLogo url="https://mistral.ai" />,
  },
];

const ACTIONS = [
  {
    value: "image",
    label: "Attach image",
    description: "Add a screenshot or visual reference.",
    icon: <ImagePlus />,
  },
  {
    value: "skill",
    label: "Use a skill",
    description: "Give the agent a specialized workflow.",
    icon: <Puzzle />,
  },
  {
    value: "context",
    label: "Add context",
    description: "Include a file with supporting details.",
    icon: <FileText />,
  },
];

export function PromptInputPreview() {
  const reduce = useReducedMotion() ?? false;
  const timer = useRef<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState<string>();
  const [notice, setNotice] = useState<string>();

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const submit = (prompt: string) => {
    setSent(undefined);
    setNotice(undefined);
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      setSent(prompt);
    }, 900);
  };

  const stop = () => {
    if (timer.current) window.clearTimeout(timer.current);
    setLoading(false);
  };

  return (
    <div className="flex h-[360px] w-full max-w-xl flex-col justify-center">
      <PromptInput
        models={MODELS}
        actions={ACTIONS}
        defaultModel="gpt-5.2"
        defaultValue="Review the current implementation and suggest the next improvement."
        loading={loading}
        onSubmit={submit}
        onStop={stop}
        onAction={(action) => {
          const selected = ACTIONS.find((item) => item.value === action);
          setNotice(selected ? `${selected.label} selected.` : undefined);
        }}
      />
      <div className="h-8 px-2 pt-2 text-xs text-muted-foreground">
        <AnimatePresence mode="wait">
          {sent || notice ? (
            <motion.p
              key={sent ?? notice}
              initial={reduce ? { opacity: 1 } : { opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.18, ease: EASE_OUT }}
            >
              {sent ? "Prompt sent to the selected model." : notice}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
