import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitForElementToBeRemoved } from "@testing-library/react";
import { axe } from "jest-axe";
import { createRef } from "react";
import { Alert, AlertAction, AlertClose, AlertContent, AlertDescription, AlertIcon, AlertTitle, useAlert } from "@/components/motion/alert";
import { AlertPreview } from "@/components/previews/motion/alert.preview";

afterEach(cleanup);

test("informational feedback has polite semantics, readable text and decorative icons", async () => {
  const { container, getByRole, getByText } = render(
    <Alert variant="info">
      <AlertIcon />
      <AlertContent>
        <AlertTitle>Changes saved</AlertTitle>
        <AlertDescription>Your work is up to date.</AlertDescription>
      </AlertContent>
    </Alert>,
  );
  expect(getByRole("status").textContent).toContain("Changes saved");
  expect(getByText("Your work is up to date.")).toBeTruthy();
  expect(container.querySelector("[data-slot='alert-icon']")?.getAttribute("aria-hidden")).toBe("true");
  expect((await axe(container)).violations).toEqual([]);
});

test("urgent alerts expose named action and dismiss controls", async () => {
  const { container, getByRole } = render(
    <Alert variant="destructive">
      <AlertContent>
        <AlertTitle>Unable to save</AlertTitle>
        <AlertDescription>Please try again.</AlertDescription>
        <AlertAction><a href="/help">Get help</a><button type="button" disabled>Retry</button></AlertAction>
      </AlertContent>
      <AlertClose />
    </Alert>,
  );
  expect(getByRole("alert")).toBeTruthy();
  expect(getByRole("link", { name: "Get help" })).toBeTruthy();
  expect((getByRole("button", { name: "Retry" }) as HTMLButtonElement).disabled).toBe(true);
  expect(getByRole("button", { name: "Dismiss alert" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("dismissing a composed alert removes its controls and returns keyboard focus", async () => {
  const { container, getByRole, queryByRole } = render(<AlertPreview />);
  fireEvent.click(getByRole("tab", { name: "Error" }));
  const close = getByRole("button", { name: "Dismiss alert" });
  act(() => close.focus());
  await act(async () => { fireEvent.click(close); });
  expect(queryByRole("alert")).toBeNull();
  expect(queryByRole("button", { name: "Try again" })).toBeNull();
  expect(document.activeElement).toBe(getByRole("button", { name: "Show alert" }));
  if (container.querySelector("[data-slot='alert']")) {
    await waitForElementToBeRemoved(() => container.querySelector("[data-slot='alert']"));
  }
  expect((await axe(container)).violations).toEqual([]);

  fireEvent.click(getByRole("button", { name: "Show alert" }));
  expect(getByRole("alert")).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

function CustomAction() {
  const { dismiss } = useAlert();
  return <AlertAction><button type="button" onClick={dismiss}>Got it</button></AlertAction>;
}

test("controlled alerts compose custom child actions and restore focus on external close", async () => {
  const showRef = createRef<HTMLButtonElement>();
  const titleRef = createRef<HTMLDivElement>();
  const example = (open: boolean) => (
    <>
      <button type="button" ref={showRef}>Show notice</button>
      <Alert open={open} role="status" variant="warning" returnFocusRef={showRef}>
        <AlertContent>
          <AlertTitle ref={titleRef}>Storage almost full</AlertTitle>
          <AlertDescription>Review your files.</AlertDescription>
          <CustomAction />
        </AlertContent>
      </Alert>
    </>
  );
  const { container, getByRole, queryByRole, rerender } = render(example(true));
  expect(getByRole("status")).toBeTruthy();
  act(() => getByRole("button", { name: "Got it" }).focus());
  await act(async () => { rerender(example(false)); });
  expect(document.activeElement).toBe(showRef.current);
  expect(queryByRole("status")).toBeNull();
  if (container.querySelector("[data-slot='alert']")) {
    await waitForElementToBeRemoved(() => container.querySelector("[data-slot='alert']"));
  }
  expect((await axe(container)).violations).toEqual([]);
});
