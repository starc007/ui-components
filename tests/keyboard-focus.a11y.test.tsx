import { afterEach, describe, expect, mock, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { useState } from "react";
import { BloomMenu } from "@/components/motion/bloom-menu";
import { BottomSheet } from "@/components/motion/bottom-sheet";
import { Drawer } from "@/components/motion/drawer";
import { FeedbackWidget } from "@/components/motion/feedback-widget";
import { MorphingModal } from "@/components/motion/morphing-modal";
import { OTPInput } from "@/components/motion/otp-input";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import {
  MorphSelect,
  MorphSelectContent,
  MorphSelectItem,
  MorphSelectTrigger,
  MorphSelectValue,
} from "@/components/motion/select-morph";
import { SwipeableList } from "@/components/motion/swipeable-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";

afterEach(cleanup);

// Product pages provide the page landmark around each component.
const audit = (node: Element) =>
  axe(node, { rules: { region: { enabled: false } } });

const tabStops = (root: ParentNode, selector: string) =>
  Array.from(root.querySelectorAll<HTMLElement>(selector)).filter(
    (element) => element.tabIndex === 0,
  );

describe("select keyboard", () => {
  test("open listbox has one tab stop and focus follows the arrow keys", async () => {
    const { container, getByRole } = render(
      <Select defaultValue="next">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="next">Next.js</SelectItem>
          <SelectItem value="off" disabled>
            Unavailable
          </SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
        </SelectContent>
      </Select>,
    );
    const trigger = getByRole("button", { name: /Next\.js/ });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    const listbox = getByRole("listbox");
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Next.js"),
    );
    expect(tabStops(listbox, '[role="option"]')).toHaveLength(1);

    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    await waitFor(() => expect(document.activeElement?.textContent).toBe("Vue"));
    fireEvent.keyDown(document.activeElement as Element, { key: "r" });
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("React"),
    );
    expect((await audit(container)).violations).toEqual([]);

    fireEvent.keyDown(window, { key: "Escape" });
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  test("open morph listbox has one tab stop", async () => {
    const { container, getByRole } = render(
      <MorphSelect defaultValue="react">
        <MorphSelectTrigger>
          <MorphSelectValue placeholder="Framework" />
        </MorphSelectTrigger>
        <MorphSelectContent>
          <MorphSelectItem value="react">React</MorphSelectItem>
          <MorphSelectItem value="next">Next.js</MorphSelectItem>
        </MorphSelectContent>
      </MorphSelect>,
    );
    fireEvent.click(getByRole("button", { name: /React/ }));
    const listbox = await waitFor(() => getByRole("listbox"));
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("React"),
    );
    expect(tabStops(listbox, '[role="option"]')).toHaveLength(1);
    expect((await audit(container)).violations).toEqual([]);
  });
});

describe("radio group keyboard", () => {
  test("is named, has one tab stop and arrows select", async () => {
    const { container, getByRole } = render(
      <RadioGroup aria-label="Plan" defaultValue="pro">
        <RadioGroupItem value="free" label="Free" />
        <RadioGroupItem value="pro" label="Pro" />
        <RadioGroupItem value="team" label="Team" disabled />
      </RadioGroup>,
    );
    const group = getByRole("radiogroup", { name: "Plan" });
    await waitFor(() => expect(tabStops(group, '[role="radio"]')).toHaveLength(1));
    const pro = getByRole("radio", { name: "Pro" });
    expect(pro.tabIndex).toBe(0);

    pro.focus();
    fireEvent.keyDown(pro, { key: "ArrowDown" });
    const free = getByRole("radio", { name: "Free" });
    await waitFor(() => expect(free.getAttribute("aria-checked")).toBe("true"));
    expect(document.activeElement).toBe(free);
    expect(free.tabIndex).toBe(0);
    expect((await audit(container)).violations).toEqual([]);
  });
});

describe("overlay focus", () => {
  test("drawer moves focus in and ignores Escape when not dismissable", async () => {
    const onOpenChange = mock(() => {});
    const { getByRole } = render(
      <Drawer
        open
        onOpenChange={onOpenChange}
        ariaLabel="Settings"
        dismissable={false}
      >
        <button type="button">Save</button>
      </Drawer>,
    );
    const dialog = getByRole("dialog", { name: "Settings" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect((await audit(document.body)).violations).toEqual([]);
  });

  test("drawer closes on Escape and returns focus to the opener", async () => {
    function Example() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>
            Open
          </button>
          <Drawer open={open} onOpenChange={setOpen} ariaLabel="Settings">
            <button type="button">Save</button>
          </Drawer>
        </>
      );
    }
    const { getByRole } = render(<Example />);
    const opener = getByRole("button", { name: "Open" });
    opener.focus();
    fireEvent.click(opener);
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Save"),
    );
    act(() => {
      fireEvent.keyDown(document, { key: "Escape" });
    });
    await waitFor(() => expect(document.activeElement).toBe(opener));
  });

  test("bottom sheet moves focus into the dialog", async () => {
    const { findByRole } = render(
      <BottomSheet open onOpenChange={() => {}} title="Share">
        <button type="button">Copy link</button>
      </BottomSheet>,
    );
    const dialog = await findByRole("dialog", { name: "Share" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    expect((await audit(document.body)).violations).toEqual([]);
  });

  test("morphing modal is a dialog named by its view heading", async () => {
    const onClose = mock(() => {});
    const { findByRole } = render(
      <MorphingModal viewId="options" onClose={onClose}>
        <h2>Options</h2>
        <button type="button">Remove wallet</button>
      </MorphingModal>,
    );
    const dialog = await findByRole("dialog", { name: "Options" });
    await waitFor(() => expect(dialog.contains(document.activeElement)).toBe(true));
    expect((await audit(document.body)).violations).toEqual([]);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe("bloom menu keyboard", () => {
  test("open menu has one tab stop and focus moves into it", async () => {
    const { container, getByRole } = render(<BloomMenu />);
    fireEvent.click(getByRole("button", { name: "Create" }));
    const menu = await waitFor(() => getByRole("menu", { name: "Create" }));
    await waitFor(() =>
      expect(document.activeElement?.getAttribute("role")).toBe("menuitem"),
    );
    expect(tabStops(menu, '[role="menuitem"]')).toHaveLength(1);
    fireEvent.keyDown(document.activeElement as Element, { key: "ArrowDown" });
    await waitFor(() =>
      expect(document.activeElement?.textContent).toBe("Folder"),
    );
    expect((await audit(container)).violations).toEqual([]);
  });
});

describe("swipeable list keyboard", () => {
  test("a row's actions open from the keyboard", async () => {
    const { container, getByRole } = render(
      <SwipeableList
        items={[
          {
            id: "a",
            title: "Invoice",
            rightActions: [{ id: "archive", label: "Archive", icon: "A" }],
          },
        ]}
      />,
    );
    const toggle = getByRole("button", { name: "Actions for Invoice" });
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
    toggle.focus();
    fireEvent.click(toggle);
    await waitFor(() =>
      expect(document.activeElement?.textContent).toContain("Archive"),
    );
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect((await audit(container)).violations).toEqual([]);
  });
});

describe("form field names", () => {
  test("feedback message field is labelled", async () => {
    const { container, getByRole } = render(<FeedbackWidget />);
    fireEvent.click(getByRole("button", { name: "Help us improve" }));
    await waitFor(() =>
      expect(getByRole("textbox", { name: "Help us improve" })).toBeTruthy(),
    );
    expect((await audit(container)).violations).toEqual([]);
  });

  test("OTP input announces typed digits", async () => {
    const { container, getByRole } = render(<OTPInput length={4} />);
    const input = getByRole("textbox", { name: "One-time passcode" });
    input.focus();
    fireEvent.keyDown(input, { key: "7" });
    await waitFor(() =>
      expect(container.textContent).toContain("7. 1 of 4 digits entered."),
    );
    expect((await audit(container)).violations).toEqual([]);
  });
});

describe("tabs keyboard", () => {
  test("one tab stop, arrows select, and tabs control their panels", async () => {
    const { container, getByRole } = render(
      <Tabs defaultValue="code">
        <TabsList aria-label="View">
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>
        <TabsContent value="preview">Preview panel</TabsContent>
        <TabsContent value="code">Code panel</TabsContent>
      </Tabs>,
    );
    const list = getByRole("tablist", { name: "View" });
    await waitFor(() => expect(tabStops(list, '[role="tab"]')).toHaveLength(1));
    const code = getByRole("tab", { name: "Code" });
    expect(code.tabIndex).toBe(0);
    expect(getByRole("tabpanel", { name: "Code" }).id).toBe(
      code.getAttribute("aria-controls") as string,
    );

    code.focus();
    fireEvent.keyDown(code, { key: "ArrowRight" });
    const preview = getByRole("tab", { name: "Preview" });
    await waitFor(() => expect(preview.getAttribute("aria-selected")).toBe("true"));
    expect(document.activeElement).toBe(preview);
    expect((await audit(container)).violations).toEqual([]);
  });
});
