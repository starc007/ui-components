import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { createRef, type Ref } from "react";
import { Button } from "@/components/motion/button";
import { Collapsible, CollapsibleContent, CollapsibleIndicator, CollapsibleTrigger, useCollapsible } from "@/components/motion/collapsible";

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

function CustomDetails({ triggerRef }: { triggerRef: Ref<HTMLButtonElement> }) {
  const { open, setOpen } = useCollapsible();
  return (
    <section>
      <CollapsibleTrigger render={<Button variant="outline" ref={triggerRef} />}>
        {open ? "Hide details" : "Show details"}
        <CollapsibleIndicator />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <label>Notes<input /></label>
        <button type="button" onClick={() => setOpen(false)}>Close details</button>
      </CollapsibleContent>
    </section>
  );
}

test("custom Button triggers retain keyboard focus and label content composed in a child component", async () => {
  const triggerRef = createRef<HTMLButtonElement>();
  const { container, getByRole, queryByRole } = render(
    <Collapsible contentClassName="grid">
      <CustomDetails triggerRef={triggerRef} />
    </Collapsible>,
  );
  act(() => triggerRef.current?.focus());
  expect(document.activeElement).toBe(getByRole("button", { name: "Show details" }));
  fireEvent.click(getByRole("button", { name: "Show details" }));
  const trigger = getByRole("button", { name: "Hide details" });
  expect(getByRole("region", { name: "Hide details" }).id).toBe(trigger.getAttribute("aria-controls") ?? "");
  expect((await axe(container)).violations).toEqual([]);

  const close = getByRole("button", { name: "Close details" });
  act(() => close.focus());
  fireEvent.click(close);
  expect(document.activeElement).toBe(getByRole("button", { name: "Show details" }));
  expect(queryByRole("textbox", { name: "Notes" })).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("nested disclosures keep distinct labels and return focus out of a hidden subtree", async () => {
  const { container, getByRole, queryByRole } = render(
    <Collapsible defaultOpen>
      <CollapsibleTrigger>Outer details</CollapsibleTrigger>
      <CollapsibleContent>
        <Collapsible>
          <CollapsibleTrigger>Inner details</CollapsibleTrigger>
          <CollapsibleContent><button type="button">Inner action</button></CollapsibleContent>
        </Collapsible>
      </CollapsibleContent>
    </Collapsible>,
  );
  fireEvent.click(getByRole("button", { name: "Inner details" }));
  const outer = getByRole("region", { name: "Outer details" });
  const inner = getByRole("region", { name: "Inner details" });
  expect(outer.id).not.toBe(inner.id);
  expect(inner.id).toBe(getByRole("button", { name: "Inner details" }).getAttribute("aria-controls") ?? "");
  expect((await axe(container)).violations).toEqual([]);
  act(() => getByRole("button", { name: "Inner action" }).focus());
  fireEvent.click(getByRole("button", { name: "Outer details" }));
  expect(document.activeElement).toBe(getByRole("button", { name: "Outer details" }));
  expect(queryByRole("button", { name: "Inner action" })).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});
