import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { CardFolder } from "@/components/motion/card-folder";

afterEach(cleanup);

describe("CardFolder", () => {
  test("toggles the folder and keeps the overflow action separate", () => {
    const openStates: boolean[] = [];
    let actionsOpened = 0;
    const { getByRole } = render(
      <CardFolder
        title="Studio card"
        description="Auto-matching funds"
        card={<span>Card artwork</span>}
        onOpenChange={(open) => openStates.push(open)}
        onAction={() => actionsOpened++}
      />,
    );

    const folder = getByRole("button", { name: "Open Studio card" });
    expect(folder.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(folder);
    expect(folder.getAttribute("aria-expanded")).toBe("true");
    expect(openStates).toEqual([true]);
    expect(actionsOpened).toBe(0);

    fireEvent.click(
      getByRole("button", { name: "Open actions for Studio card" }),
    );
    expect(openStates).toEqual([true]);
    expect(actionsOpened).toBe(1);

    fireEvent.click(getByRole("button", { name: "Close Studio card" }));
    expect(openStates).toEqual([true, false]);
  });

  test("supports controlled open state", () => {
    let requestedOpen = false;
    const { getByRole } = render(
      <CardFolder
        title="Studio card"
        card={<span>Card artwork</span>}
        open
        onOpenChange={(open) => {
          requestedOpen = open;
        }}
      />,
    );

    const folder = getByRole("button", { name: "Close Studio card" });
    fireEvent.click(folder);

    expect(requestedOpen).toBe(false);
    expect(folder.getAttribute("aria-expanded")).toBe("true");
  });

  test("disables both controls together", () => {
    const { getAllByRole } = render(
      <CardFolder
        title="Studio card"
        card={<span>Card artwork</span>}
        onAction={() => {}}
        disabled
      />,
    );

    for (const button of getAllByRole("button")) {
      expect(button.hasAttribute("disabled")).toBe(true);
    }
  });
});
