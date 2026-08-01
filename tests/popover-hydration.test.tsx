import { afterEach, describe, expect, test } from "bun:test";
import { act, type ReactElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import {
  MorphPopover,
  MorphPopoverContent,
  MorphPopoverTrigger,
} from "@/components/motion/popover-morph";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";

const mountedRoots: Array<ReturnType<typeof hydrateRoot>> = [];
const mountedContainers: HTMLDivElement[] = [];

afterEach(async () => {
  await act(async () => {
    for (const root of mountedRoots.splice(0)) root.unmount();
  });
  for (const container of mountedContainers.splice(0)) container.remove();
});

async function hydrate(element: ReactElement) {
  const container = document.createElement("div");
  container.innerHTML = renderToString(element);
  document.body.appendChild(container);
  mountedContainers.push(container);

  const recoverableErrors: unknown[] = [];
  await act(async () => {
    const root = hydrateRoot(container, element, {
      onRecoverableError: (error) => recoverableErrors.push(error),
    });
    mountedRoots.push(root);
  });

  return recoverableErrors;
}

describe("Popover hydration", () => {
  test("hydrates Gooey before attaching its body portal", async () => {
    const errors = await hydrate(
      <Popover>
        <PopoverTrigger>
          <button type="button">Open Gooey</button>
        </PopoverTrigger>
        <PopoverContent>Gooey actions</PopoverContent>
      </Popover>,
    );

    expect(errors).toEqual([]);
    expect(document.querySelector("[data-popover-portal]")).toBeTruthy();
  });

  test("hydrates Morph before attaching its body portal", async () => {
    const errors = await hydrate(
      <MorphPopover defaultOpen>
        <MorphPopoverTrigger>
          <button type="button">Open Morph</button>
        </MorphPopoverTrigger>
        <MorphPopoverContent>Morph actions</MorphPopoverContent>
      </MorphPopover>,
    );

    expect(errors).toEqual([]);
    expect(
      document.querySelector("[data-morph-popover-portal]"),
    ).toBeTruthy();
  });
});
