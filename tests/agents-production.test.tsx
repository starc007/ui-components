import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { AISidebar } from "@/components/agents/ai-sidebar";
import { ApprovalCard } from "@/components/agents/approval-card";
import { AgentActivity } from "@/components/agents/agent-activity";
import { Citation, Citations } from "@/components/agents/citations";
import { FileDiff } from "@/components/agents/file-diff";
import { MessageScroller } from "@/components/agents/message-scroller";
import { TodoList } from "@/components/agents/todo-list";
import { ToolResult } from "@/components/agents/tool-result";
import { ChatAppPreview } from "@/components/previews/agents/chat-app.preview";
import { ChatAppExample } from "@/components/previews/agents/chat-app-usage";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);

describe("agent production contracts", () => {
  test("customizes activity status content without replacing disclosure semantics", () => {
    const activity = render(
      <AgentActivity
        items={[{ id: "one", type: "text", content: "Inspect context" }]}
        status="working"
        renderWorkingStatus={({ label }) => <span>Custom {label}</span>}
        renderCompletedStatus={({ summary }) => <span>Done: {summary}</span>}
      />,
    );

    expect(activity.getByRole("status").textContent).toContain("Custom");
    expect(activity.queryByRole("button")).toBeNull();

    activity.rerender(
      <AgentActivity
        items={[{ id: "one", type: "text", content: "Inspect context" }]}
        status="complete"
        summary="Completed work"
        renderCompletedStatus={({ summary }) => <span>Done: {summary}</span>}
      />,
    );
    const trigger = activity.getByRole("button", { name: /Done: Completed work/ });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });

  test("packages every component used by the complete chat app", async () => {
    const item = await buildShadcnItem("agents", "chat-app");
    const paths = new Set(item?.files.map((file) => file.path));
    const required = [
      "components/agents/agent-activity/index.tsx",
      "components/agents/ai-sidebar.tsx",
      "components/agents/approval-card/index.tsx",
      "components/agents/code-block.tsx",
      "components/agents/file-diff.tsx",
      "components/agents/image-generation.tsx",
      "components/agents/loading-states/thinking-shimmer.tsx",
      "components/agents/message.tsx",
      "components/agents/message-bubble.tsx",
      "components/agents/message-scroller.tsx",
      "components/agents/prompt-input.tsx",
      "components/agents/streaming-response.tsx",
      "components/agents/todo-list.tsx",
      "components/agents/tool-approval.tsx",
      "components/agents/tool-result.tsx",
    ];

    expect(item).not.toBeNull();
    for (const path of required) expect(paths.has(path)).toBe(true);
  });

  test("keeps the complete chat timeline behind tool approval", () => {
    const { getAllByText, getByRole, queryByText } = render(<ChatAppExample />);

    expect(queryByText("Checkout checks passed")).toBeNull();
    expect(queryByText("The checkout patch is ready for review.")).toBeNull();
    fireEvent.click(getByRole("button", { name: "Deny" }));
    expect(getAllByText("Checkout checks were not run").length).toBeGreaterThan(0);
    expect(queryByText("Checkout checks passed")).toBeNull();
  });

  test("isolates and restores the page around the expanded chat preview", () => {
    const { getByRole } = render(
      <>
        <button type="button">Outside action</button>
        <ChatAppPreview />
      </>,
    );
    const outside = getByRole("button", { name: "Outside action" });
    const dialog = getByRole("dialog", { name: "Chat app preview" });

    fireEvent.click(getByRole("button", { name: "Expand preview" }));
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(outside.inert).toBe(true);
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.keyDown(window, { key: "Escape" });
    expect(dialog.getAttribute("aria-modal")).toBeNull();
    expect(outside.inert).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  test("keeps disabled sidebar resources navigable but immutable", () => {
    const onActiveChange = mock(() => {});
    const onItemsChange = mock(() => {});
    const onMove = mock(() => {});
    const { getByRole, getByText, queryByRole, queryByLabelText } = render(
      <AISidebar
        defaultItems={[
          { id: "locked", label: "Locked folder", kind: "folder", disabled: true },
          { id: "source", label: "Movable file", kind: "file" },
          { id: "disabled-file", label: "Read only file", kind: "file", disabled: true },
        ]}
        onActiveChange={onActiveChange}
        onItemsChange={onItemsChange}
        onMove={onMove}
      />,
    );
    const disabledFile = getByText("Read only file").closest("[role=treeitem]");
    const source = getByText("Movable file").closest("[role=treeitem]");

    expect(disabledFile).not.toBeNull();
    expect(source).not.toBeNull();
    fireEvent.keyDown(disabledFile as Element, { key: "Enter" });
    fireEvent.keyDown(disabledFile as Element, { key: "F2" });
    expect(onActiveChange).not.toHaveBeenCalled();
    expect(queryByRole("textbox", { name: "Rename Read only file" })).toBeNull();
    expect(queryByLabelText("Actions for Read only file")).toBeNull();

    fireEvent.keyDown(source as Element, {
      key: "ArrowRight",
      altKey: true,
      shiftKey: true,
    });
    expect(onItemsChange).not.toHaveBeenCalled();
    expect(onMove).not.toHaveBeenCalled();
    expect(getByRole("tree")).toBeTruthy();
  });

  test("announces streamed text updates from the message log", () => {
    const { getByRole } = render(
      <MessageScroller>
        <p>Streaming response</p>
      </MessageScroller>,
    );
    expect(getByRole("log").getAttribute("aria-relevant")).toBe(
      "additions text",
    );
  });

  test("keeps completed approval controls out of the focus order", () => {
    const { getByTestId } = render(
      <ApprovalCard status="answered" title="Done">
        <button type="button" data-testid="hidden-action">Hidden action</button>
      </ApprovalCard>,
    );
    const disclosure = getByTestId("hidden-action").closest("[aria-hidden=true]");
    expect(disclosure).not.toBeNull();
    expect((disclosure as HTMLElement).inert).toBe(true);
  });

  test("uses unique citation targets and explicit inline links", () => {
    const citation = { id: "guide", title: "Guide", url: "/guide" };
    const { container, getByRole } = render(
      <>
        <p>
          Supported claim <Citation citationId="guide" index={1} idPrefix="claim" />
        </p>
        <Citations citations={[citation]} idPrefix="claim" defaultOpen />
        <Citations citations={[citation]} defaultOpen />
        <Citations citations={[citation]} defaultOpen />
      </>,
    );
    const ids = Array.from(container.querySelectorAll("[id$='-guide']"), (node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(getByRole("link", { name: "View citation 1" }).getAttribute("href")).toBe(
      "#claim-guide",
    );
  });

  test("reopens disclosures when a new lifecycle begins", () => {
    const diffProps = {
      file: "agent.ts",
      lines: [{ id: "one", content: "const ready = true;" }],
    };
    const diff = render(
      <FileDiff {...diffProps} status="complete" defaultOpen={false} />,
    );
    const diffTrigger = diff.getByRole("button", { name: /agent\.ts/i });
    diff.rerender(<FileDiff {...diffProps} status="streaming" defaultOpen={false} />);
    expect(diffTrigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      diff.container.querySelector("[data-slot='file-diff-viewport']")?.className,
    ).toContain("overflow-auto");
    diff.unmount();

    const result = render(
      <ToolResult tool="terminal.run" title="Result" status="success" defaultOpen={false}>
        Done
      </ToolResult>,
    );
    const resultTrigger = result.getByRole("button", { name: /result/i });
    result.rerender(
      <ToolResult tool="terminal.run" title="Result" status="running" defaultOpen={false}>
        Running
      </ToolResult>,
    );
    expect(resultTrigger.getAttribute("aria-expanded")).toBe("true");
    result.unmount();

    const todo = render(
      <TodoList
        items={[{ id: "one", title: "Task", status: "completed" }]}
        defaultOpen={false}
      />,
    );
    const todoTrigger = todo.getByRole("button", { name: /to-dos/i });
    todo.rerender(
      <TodoList
        items={[{ id: "one", title: "Task", status: "pending" }]}
        defaultOpen={false}
      />,
    );
    expect(todoTrigger.getAttribute("aria-expanded")).toBe("true");
  });
});
