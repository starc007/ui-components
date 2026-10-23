import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Tabs, TabsList, TabsTrigger } from "@/components/motion/tabs";

afterEach(cleanup);

function IconTabs({ icons }: { icons: "always" | "selected" }) {
  return (
    <Tabs defaultValue="home" icons={icons}>
      <TabsList aria-label="Sections">
        <TabsTrigger value="home" icon={<svg data-icon="home" />}>
          Home
        </TabsTrigger>
        <TabsTrigger value="alerts" icon={<svg data-icon="alerts" />}>
          Alerts
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

for (const icons of ["always", "selected"] as const) {
  test(`icon tabs (${icons}) keep text names and one selected tab`, async () => {
    const { container, getByRole } = render(<IconTabs icons={icons} />);
    const home = getByRole("tab", { name: "Home" });
    const alerts = getByRole("tab", { name: "Alerts" });
    expect(home.getAttribute("aria-selected")).toBe("true");
    // Icons are decoration: hidden from assistive tech in both label layers.
    for (const icon of container.querySelectorAll("[data-icon]")) {
      expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    }
    expect((await axe(container)).violations).toEqual([]);

    await act(async () => {
      fireEvent.click(alerts);
    });
    expect(alerts.getAttribute("aria-selected")).toBe("true");
    expect(home.getAttribute("aria-selected")).toBe("false");
    expect((await axe(container)).violations).toEqual([]);
  });
}
