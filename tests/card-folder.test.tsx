import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { CardFolder } from "@/components/motion/card-folder";

afterEach(cleanup);

describe("CardFolder", () => {
  test("toggles the folder and keeps purse controls separate", async () => {
    const openStates: boolean[] = [];
    let actionsOpened = 0;
    const { container, getByRole, queryByRole } = render(
      <CardFolder
        title="Studio card"
        cardNumber="4242424242420806"
        expiry="08/29"
        cvv="123"
        card={<span>Card artwork</span>}
        onOpenChange={(open) => openStates.push(open)}
        onAction={() => actionsOpened++}
      />,
    );

    const folder = getByRole("button", { name: /^Open Studio card/ });
    const back = container.querySelector('[data-slot="card-folder-back"]');
    expect(back?.className).toContain("border-foreground/10");
    expect(
      getByRole("button", { name: "Show card details" }).className,
    ).toContain("z-30");
    expect(folder.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(folder);
    expect(folder.getAttribute("aria-expanded")).toBe("true");
    expect(openStates).toEqual([true]);
    expect(actionsOpened).toBe(0);
    await waitFor(() => {
      expect(
        queryByRole("button", { name: "Show card details" }),
      ).toBeNull();
    });

    fireEvent.click(
      getByRole("button", { name: "Open actions for Studio card" }),
    );
    expect(openStates).toEqual([true]);
    expect(actionsOpened).toBe(1);

    fireEvent.click(getByRole("button", { name: /^Close Studio card/ }));
    expect(openStates).toEqual([true, false]);
  });

  test("supports controlled open state", () => {
    let requestedOpen = false;
    const { getByRole } = render(
      <CardFolder
        title="Studio card"
        cardNumber="4242424242420806"
        expiry="08/29"
        cvv="123"
        card={<span>Card artwork</span>}
        open
        onOpenChange={(open) => {
          requestedOpen = open;
        }}
      />,
    );

    const folder = getByRole("button", { name: /^Close Studio card/ });
    fireEvent.click(folder);

    expect(requestedOpen).toBe(false);
    expect(folder.getAttribute("aria-expanded")).toBe("true");
  });

  test("reveals and hides the full number and CVV", () => {
    const { getByRole, getByText, queryByText } = render(
      <CardFolder
        title="Studio card"
        cardNumber="4242424242420806"
        expiry="08/29"
        cvv="123"
        card={<span>Card artwork</span>}
      />,
    );

    expect(queryByText("4242 4242 4242 0806")).toBeNull();
    expect(queryByText("123")).toBeNull();

    fireEvent.click(getByRole("button", { name: "Show card details" }));

    expect(getByText("4242 4242 4242 0806")).toBeTruthy();
    expect(getByText("123")).toBeTruthy();
    expect(
      getByRole("button", { name: "Hide card details" }).getAttribute(
        "aria-pressed",
      ),
    ).toBe("true");

    fireEvent.click(getByRole("button", { name: "Hide card details" }));
    expect(queryByText("4242 4242 4242 0806")).toBeNull();
    expect(queryByText("123")).toBeNull();
  });

  test("reports a controlled detail visibility change", () => {
    let requestedVisible = false;
    const { getByRole, queryByText } = render(
      <CardFolder
        title="Studio card"
        cardNumber="4242424242420806"
        expiry="08/29"
        cvv="123"
        card={<span>Card artwork</span>}
        detailsVisible={false}
        onDetailsVisibleChange={(visible) => {
          requestedVisible = visible;
        }}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Show card details" }));

    expect(requestedVisible).toBe(true);
    expect(queryByText("4242 4242 4242 0806")).toBeNull();
  });

  test("disables both controls together", () => {
    const { getAllByRole } = render(
      <CardFolder
        title="Studio card"
        cardNumber="4242424242420806"
        expiry="08/29"
        cvv="123"
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
