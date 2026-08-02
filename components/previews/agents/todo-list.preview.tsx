"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  type TodoItem,
  TodoList,
} from "@/components/agents/todo-list";

const TASKS = [
  "Inspect the current data flow",
  "Update the response schema",
  "Add coverage for edge cases",
  "Run checks and prepare the result",
];

const TICKS_PER_TASK = 4;

function itemsAtStep(step: number): TodoItem[] {
  return TASKS.map((title, index) => ({
    id: `task-${index}`,
    title,
    status:
      step >= (index + 1) * TICKS_PER_TASK
        ? "completed"
        : step >= index * TICKS_PER_TASK
          ? "in-progress"
          : "pending",
    progress:
      step >= index * TICKS_PER_TASK &&
      step < (index + 1) * TICKS_PER_TASK
        ? ((step % TICKS_PER_TASK) + 1) * 25
        : undefined,
    detail:
      step >= index * TICKS_PER_TASK &&
      step < (index + 1) * TICKS_PER_TASK
        ? `${((step % TICKS_PER_TASK) + 1) * 25}%`
        : undefined,
  }));
}

function TodoRun() {
  const [step, setStep] = useState(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (step >= TASKS.length * TICKS_PER_TASK) return;
    timer.current = window.setTimeout(() => setStep((value) => value + 1), 280);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step]);

  return <TodoList items={itemsAtStep(step)} title="Implementation plan" />;
}

export function TodoListPreview() {
  const [run, setRun] = useState(0);

  return (
    <div className="relative h-[330px] w-full max-w-lg">
      <TodoRun key={run} />
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
