import { afterAll, afterEach, beforeAll, describe, expect, mock, test } from "bun:test";
import { act, cleanup, render } from "@testing-library/react";
import { ChatApp } from "@/components/agents/chat-app";

type ResizeCallback = (
  entries: Array<{ contentRect: { width: number } }>,
) => void;

const watchers = new Set<ResizeCallback>();
const RealResizeObserver = globalThis.ResizeObserver;

class WidthObserver {
  constructor(private callback: ResizeCallback) {}
  observe() {
    watchers.add(this.callback);
  }
  unobserve() {}
  disconnect() {
    watchers.delete(this.callback);
  }
}

beforeAll(() => {
  globalThis.ResizeObserver = WidthObserver as unknown as typeof ResizeObserver;
});

afterAll(() => {
  globalThis.ResizeObserver = RealResizeObserver;
});

/** Drive every ShellFit observer as if the shell had been laid out at `width`. */
function resizeShell(width: number) {
  act(() => {
    for (const callback of watchers) callback([{ contentRect: { width } }]);
  });
}

function shellState(container: HTMLElement) {
  return container
    .querySelector('[data-slot="sidebar-wrapper"]')
    ?.getAttribute("data-state");
}

afterEach(() => {
  cleanup();
  watchers.clear();
});

describe("ChatApp shell fit", () => {
  test("mounting in a roomy shell leaves defaultOpen alone", () => {
    const onOpenChange = mock(() => {});
    const { container } = render(
      <ChatApp defaultOpen={false} onOpenChange={onOpenChange}>
        <div>conversation</div>
      </ChatApp>,
    );

    expect(shellState(container)).toBe("collapsed");
    resizeShell(1200);
    expect(shellState(container)).toBe("collapsed");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  test("mounting in a shell with no room still folds the sidebar", () => {
    const { container } = render(
      <ChatApp>
        <div>conversation</div>
      </ChatApp>,
    );

    resizeShell(400);
    expect(shellState(container)).toBe("collapsed");
  });

  test("a crossing folds the sidebar away and brings it back", () => {
    const { container } = render(
      <ChatApp>
        <div>conversation</div>
      </ChatApp>,
    );

    resizeShell(1200);
    expect(shellState(container)).toBe("expanded");
    resizeShell(400);
    expect(shellState(container)).toBe("collapsed");
    resizeShell(1200);
    expect(shellState(container)).toBe("expanded");
  });

  test("a shell that stays on one side of the threshold is left alone", () => {
    const { container } = render(
      <ChatApp defaultOpen={false}>
        <div>conversation</div>
      </ChatApp>,
    );

    resizeShell(1200);
    resizeShell(1100);
    resizeShell(900);
    expect(shellState(container)).toBe("collapsed");
  });

  test("a controlled sidebar is never resized out from under the consumer", () => {
    const onOpenChange = mock(() => {});
    const { container } = render(
      <ChatApp open={false} onOpenChange={onOpenChange}>
        <div>conversation</div>
      </ChatApp>,
    );

    resizeShell(1200);
    resizeShell(400);
    resizeShell(1200);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(shellState(container)).toBe("collapsed");
  });
});
