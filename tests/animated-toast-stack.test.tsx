import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { AnimatedToastStack } from "@/components/motion/animated-toast-stack";

afterEach(cleanup);

// happy-dom does not lay out text. These assertions preserve the alignment
// classes; actual title, icon and close-button centers need browser evidence.
const action = { label: "View", onClick: () => {} };

test.each([
  ["title only", {}, true],
  ["empty description", { description: "" }, true],
  ["description", { description: "Changes saved." }, false],
  ["action", { action }, false],
  ["description and action", { description: "Changes saved.", action }, false],
] as const)("aligns a toast with %s", (_, details, centered) => {
  const { container } = render(
    <AnimatedToastStack
      toasts={[{ id: "saved", title: "Saved", ...details }]}
      onDismiss={() => {}}
      classNames={{ iconWrap: "toast-icon" }}
    />,
  );
  const icon = container.querySelector(".toast-icon");
  const row = icon?.parentElement;

  expect(row?.classList.contains("items-center")).toBe(centered);
  expect(row?.classList.contains("items-start")).toBe(!centered);
  expect(icon?.classList.contains("mt-0.5")).toBe(!centered);
});

test("centers the same toast when its details are removed", () => {
  const props = {
    onDismiss: () => {},
    classNames: { iconWrap: "toast-icon" },
  };
  const { container, rerender } = render(
    <AnimatedToastStack
      {...props}
      toasts={[{ id: "saved", title: "Saved", description: "Changes saved.", action }]}
    />,
  );
  const icon = container.querySelector(".toast-icon");
  expect(icon?.parentElement?.classList.contains("items-start")).toBe(true);
  expect(icon?.classList.contains("mt-0.5")).toBe(true);

  rerender(<AnimatedToastStack {...props} toasts={[{ id: "saved", title: "Saved" }]} />);

  expect(container.querySelector(".toast-icon")).toBe(icon);
  expect(icon?.parentElement?.classList.contains("items-center")).toBe(true);
  expect(icon?.parentElement?.classList.contains("items-start")).toBe(false);
  expect(icon?.classList.contains("mt-0.5")).toBe(false);
});
