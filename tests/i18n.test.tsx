import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";

import { TodoList, todoListMessages } from "@/components/agents/todo-list";
import { LocaleProvider } from "@/lib/i18n";

afterEach(cleanup);

/** Every localized component's English defaults, keyed by its `useMessages` namespace. */
const DEFAULTS: Record<string, Record<string, string>> = {
  todoList: todoListMessages,
};

const ROOT = join(import.meta.dir, "..");

// Translations live in messages/<locale>/components.json (checked by
// tests/site-messages.test.ts). The English file must match the defaults the
// components ship with, or translators work from stale text.
test("messages/en/components.json matches component defaults", () => {
  const english = JSON.parse(readFileSync(join(ROOT, "messages/en/components.json"), "utf8"));
  expect(english).toEqual(DEFAULTS);
});

// Files that still hardcode English labels. Migrate them to `useMessages`
// and delete them from this list; never add to it.
const UNMIGRATED = new Set([
  "components/agents/approval-card/index.tsx",
  "components/agents/file-diff.tsx",
  "components/agents/prompt-input.tsx",
  "components/motion/alert.tsx",
  "components/motion/animated-sidebar.tsx",
  "components/motion/animated-toast-stack.tsx",
  "components/motion/attachment-upload.tsx",
  "components/motion/bloom-menu.tsx",
  "components/motion/bottom-sheet.tsx",
  "components/motion/breadcrumb.tsx",
  "components/motion/center-morph-modal.tsx",
  "components/motion/command-palette.tsx",
  "components/motion/date-range-picker.tsx",
  "components/motion/drawer.tsx",
  "components/motion/expandable-tabs.tsx",
  "components/motion/feedback-widget.tsx",
  "components/motion/file-upload.tsx",
  "components/motion/knockout-bracket.tsx",
  "components/motion/morphing-modal.tsx",
  "components/motion/morphing-search.tsx",
  "components/motion/project-folder.tsx",
  "components/motion/swap.tsx",
  "components/motion/swap/controls.tsx",
  "components/motion/swap/token-picker.tsx",
  "components/motion/table/table-header.tsx",
  "components/motion/tabs.tsx",
  "components/motion/wallet-card/index.tsx",
  "components/motion/wallet-card/search-bar.tsx",
]);

function sourceFiles(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) return sourceFiles(rel);
    return /\.tsx?$/.test(name) ? [rel] : [];
  });
}

test("no new hardcoded aria-label or title text in library components", () => {
  const literal = /\b(?:aria-label|title)="[^"]*[A-Za-z]/;
  const offenders = [
    ...sourceFiles("components/motion"),
    ...sourceFiles("components/agents"),
  ].filter((file) => literal.test(readFileSync(join(ROOT, file), "utf8")));

  const added = offenders.filter((file) => !UNMIGRATED.has(file));
  // Skip listed files that are not in this checkout (work in progress elsewhere).
  const migrated = [...UNMIGRATED].filter(
    (file) => existsSync(join(ROOT, file)) && !offenders.includes(file),
  );
  expect(added, "route these strings through useMessages").toEqual([]);
  expect(migrated, "remove these from UNMIGRATED").toEqual([]);
});

describe("useMessages", () => {
  const items = [
    { id: "a", title: "A", status: "completed" as const },
    { id: "b", title: "B" },
  ];

  test("falls back to English with plain digits", () => {
    render(<TodoList items={items} />);
    expect(screen.getByRole("region", { name: "Agent task list" })).toBeDefined();
    expect(screen.getByText("1 of 2 tasks completed")).toBeDefined();
  });

  test("prefers labels over provider messages over defaults", () => {
    render(
      <LocaleProvider locale="de" messages={{ todoList: { label: "Aufgaben", empty: "Leer" } }}>
        <TodoList items={[]} labels={{ label: "Override" }} />
      </LocaleProvider>,
    );
    expect(screen.getByRole("region", { name: "Override" })).toBeDefined();
    expect(screen.getByText("Leer")).toBeDefined();
    expect(screen.getByText("To-dos")).toBeDefined();
  });

  test("formats placeholder numbers for the provider locale", () => {
    const many = Array.from({ length: 1200 }, (_, index) => ({
      id: String(index),
      title: String(index),
      status: "completed" as const,
    }));
    render(
      <LocaleProvider locale="de">
        <TodoList items={many} defaultOpen={false} />
      </LocaleProvider>,
    );
    expect(screen.getByText("1.200 of 1.200 tasks completed")).toBeDefined();
  });
});
