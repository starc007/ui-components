import { afterEach, describe, expect, mock, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { BounceSidebar } from "@/components/motion/bounce-sidebar";

afterEach(cleanup);

const items = [
  { id: "overview", label: "Overview" },
  { id: "components", label: "Components" },
  { id: "changelog", label: "Changelog" },
];

describe("BounceSidebar", () => {
  test("moves the current destination in uncontrolled mode", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <BounceSidebar
        items={items}
        defaultValue="overview"
        onValueChange={onValueChange}
      />,
    );

    const components = getByRole("button", { name: "Components" });
    fireEvent.click(components);

    expect(components.getAttribute("aria-current")).toBe("page");
    expect(onValueChange).toHaveBeenCalledWith("components");
  });

  test("respects a controlled value", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <BounceSidebar
        items={items}
        value="overview"
        onValueChange={onValueChange}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Components" }));

    expect(getByRole("button", { name: "Overview" }).getAttribute("aria-current")).toBe(
      "page",
    );
    expect(onValueChange).toHaveBeenCalledWith("components");
  });

  test("does not select disabled destinations", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <BounceSidebar
        items={[...items, { id: "settings", label: "Settings", disabled: true }]}
        defaultValue="overview"
        onValueChange={onValueChange}
      />,
    );

    const settings = getByRole("button", { name: "Settings" });
    fireEvent.click(settings);

    expect(settings.hasAttribute("aria-current")).toBe(false);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
