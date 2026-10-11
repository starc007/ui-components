import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/motion/tooltip";

afterEach(cleanup);

test("keyboard focus shows the tooltip as the trigger's description", async () => {
  const { container, getByRole } = render(
    <Tooltip content="Copies the link">
      <button type="button">Share</button>
    </Tooltip>,
  );
  const trigger = getByRole("button", { name: "Share" });
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  await act(async () => {
    trigger.focus();
  });
  await waitFor(() => expect(getByRole("tooltip").textContent).toBe("Copies the link"));
  expect(trigger.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect((await axe(container)).violations).toEqual([]);
  expect((await axe(getByRole("tooltip"))).violations).toEqual([]);
});

test("asLabel names an icon-only trigger while the tooltip is closed", async () => {
  const { container, getByRole, queryByRole } = render(
    <TooltipProvider>
      <Tooltip asLabel>
        <TooltipTrigger>
          <svg aria-hidden="true" width="16" height="16" />
        </TooltipTrigger>
        <TooltipContent arrow>Bold</TooltipContent>
      </Tooltip>
    </TooltipProvider>,
  );
  expect(queryByRole("tooltip")).toBeNull();
  const trigger = getByRole("button", { name: "Bold" });
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  expect((await axe(container)).violations).toEqual([]);
});

test("asLabel open state keeps a single name and no duplicate description", async () => {
  const { container, getByRole } = render(
    <Tooltip asLabel content="Italic">
      <button type="button">
        <svg aria-hidden="true" width="16" height="16" />
      </button>
    </Tooltip>,
  );
  const trigger = getByRole("button", { name: "Italic" });
  await act(async () => {
    trigger.focus();
  });
  await waitFor(() => expect(getByRole("tooltip", { hidden: true }).textContent).toBe("Italic"));
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);
  expect((await axe(container)).violations).toEqual([]);
});

test("empty content adds no tooltip or description", async () => {
  const { getByRole, queryByRole } = render(
    <Tooltip content={null}>
      <button type="button">Plain</button>
    </Tooltip>,
  );
  const trigger = getByRole("button", { name: "Plain" });
  await act(async () => {
    trigger.focus();
  });
  expect(queryByRole("tooltip", { hidden: true })).toBeNull();
  expect(trigger.hasAttribute("aria-describedby")).toBe(false);
});
