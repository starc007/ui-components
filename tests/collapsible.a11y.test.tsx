import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger } from "@/components/motion/collapsible";

afterEach(cleanup);

function Disclosure({ open, disabled }: { open?: boolean; disabled?: boolean }) {
  return (
    <Collapsible open={open} disabled={disabled}>
      <CollapsibleTrigger>Project details<CollapsibleIndicator /></CollapsibleTrigger>
      <CollapsibleContent>
        <label>Project name<input defaultValue="beUI" /></label>
      </CollapsibleContent>
    </Collapsible>
  );
}

test("collapsible exposes its disclosure state and hides closed content from assistive technology", async () => {
  const { container, getByRole, queryByRole } = render(<Disclosure />);
  const trigger = getByRole("button", { name: "Project details" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(queryByRole("textbox", { name: "Project name" })).toBeNull();
  expect(document.getElementById(trigger.getAttribute("aria-controls") ?? "")?.inert).toBe(true);
  expect((await axe(container)).violations).toEqual([]);

  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("region", { name: "Project details" }).id).toBe(trigger.getAttribute("aria-controls") ?? "");
  expect(getByRole("textbox", { name: "Project name" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("controlled collapse restores focus when its field becomes inaccessible", async () => {
  const { container, getByRole, rerender } = render(<Disclosure open />);
  const input = getByRole("textbox", { name: "Project name" }) as HTMLInputElement;
  act(() => input.focus());
  rerender(<Disclosure open={false} />);
  expect(document.activeElement).toBe(getByRole("button", { name: "Project details" }));
  expect(input.closest("[data-slot='collapsible-content']")?.hasAttribute("inert")).toBe(true);
  rerender(<Disclosure open />);
  expect(getByRole("textbox", { name: "Project name" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("disabled collapsible exposes an unavailable trigger", async () => {
  const { container, getByRole } = render(<Disclosure disabled />);
  expect((getByRole("button", { name: "Project details" }) as HTMLButtonElement).disabled).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});
