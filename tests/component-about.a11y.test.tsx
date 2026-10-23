import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { ComponentAbout } from "@/components/app/docs/component-about";
import { componentAbout } from "@/lib/component-about";

afterEach(cleanup);

const tabs = componentAbout.tabs;

test("component about section names its heading disclosure and hides closed notes from assistive technology", async () => {
  if (!tabs) throw new Error("Tabs about content is missing");
  const { container, getByRole, getByText, queryByRole } = render(<ComponentAbout name="Tabs" about={tabs} />);
  const trigger = getByRole("button", { name: "About Tabs" });
  expect(getByRole("heading", { level: 2, name: "About Tabs" })).toBeTruthy();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(queryByRole("heading", { level: 3, name: "FAQ" })).toBeNull();
  expect((await axe(container)).violations).toEqual([]);

  fireEvent.click(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(getByRole("region", { name: "About Tabs" })).toBeTruthy();
  expect(getByRole("heading", { level: 3, name: "FAQ" })).toBeTruthy();
  expect(getByText(tabs.faq[0].question).tagName).toBe("DT");
  expect((await axe(container)).violations).toEqual([]);
});
