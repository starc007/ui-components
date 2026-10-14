import { afterEach, expect, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BouncyAccordion } from "@/components/motion/bouncy-accordion";

afterEach(cleanup);

test("open accordion names its region and keeps closed content inaccessible", async () => {
  const { container } = render(
    <BouncyAccordion
      defaultValue="open"
      items={[
        { id: "open", title: "Open section", description: <a href="/open">Open details</a> },
        { id: "closed", title: "Closed section", description: <a href="/closed">Closed details</a> },
        { id: "disabled", title: "Disabled section", disabled: true },
      ]}
    />,
  );
  expect(screen.getByRole("region", { name: "Open section" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Open section" }).getAttribute("aria-expanded")).toBe("true");
  expect(screen.getByRole("button", { name: "Disabled section" }).hasAttribute("disabled")).toBe(true);
  const closed = screen.getByText("Closed details").closest('section');
  expect(closed?.getAttribute("aria-hidden")).toBe("true");
  expect(closed?.hasAttribute("inert")).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});

test("controlled null exposes a collapsed trigger despite an open default", async () => {
  const { container } = render(
    <BouncyAccordion
      value={null}
      defaultValue="section"
      items={[{ id: "section", title: "Details", description: <a href="/details">Read details</a> }]}
    />,
  );
  expect(screen.getByRole("button", { name: "Details" }).getAttribute("aria-expanded")).toBe("false");
  expect(screen.queryByRole("region")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});
