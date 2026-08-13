import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/motion/combobox";

afterEach(cleanup);

function ExampleCombobox({
  onValueChange,
}: {
  onValueChange?: (value: string) => void;
}) {
  return (
    <Combobox defaultValue="next" onValueChange={onValueChange}>
      <ComboboxTrigger>
        <ComboboxInput
          aria-label="Search frameworks"
          placeholder="Search frameworks…"
        />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList ariaLabel="Frameworks">
          <ComboboxEmpty>No frameworks found.</ComboboxEmpty>
          <ComboboxItem value="next" keywords={["react"]}>
            Next.js
          </ComboboxItem>
          <ComboboxItem value="remix" keywords={["react"]}>
            Remix
          </ComboboxItem>
          <ComboboxItem value="astro" keywords={["static"]}>
            Astro
          </ComboboxItem>
          <ComboboxItem value="vite" disabled>
            Vite
          </ComboboxItem>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

describe("Combobox", () => {
  test("filters and selects an option from its morphed list", async () => {
    const onValueChange = mock(() => {});
    const { getByRole, queryByRole } = render(
      <ExampleCombobox onValueChange={onValueChange} />,
    );

    const input = getByRole("combobox", { name: "Search frameworks" });
    expect(input.getAttribute("value")).toBe("Next.js");
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "ast" } });

    expect(getByRole("option", { name: "Astro" })).toBeTruthy();
    expect(queryByRole("option", { name: "Remix" })).toBeNull();

    fireEvent.click(getByRole("option", { name: "Astro" }));
    expect(onValueChange).toHaveBeenCalledWith("astro");
    expect(input.getAttribute("aria-expanded")).toBe("false");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
    await waitFor(() => expect(input.getAttribute("value")).toBe("Astro"));

    fireEvent.click(input);
    expect(input.getAttribute("aria-expanded")).toBe("true");
  });

  test("renders the popup in a body portal and closes when focus leaves", async () => {
    const { container, getByRole } = render(
      <div>
        <ExampleCombobox />
        <button type="button">Outside</button>
      </div>,
    );
    const input = getByRole("combobox", { name: "Search frameworks" });
    fireEvent.focus(input);

    const panel = document.querySelector<HTMLElement>(
      "[data-combobox-content]",
    );
    expect(panel).toBeTruthy();
    expect(panel?.parentElement).toBe(document.body);
    expect(container.contains(panel)).toBe(false);

    fireEvent.focus(getByRole("button", { name: "Outside" }));
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  test("wraps keyboard navigation and skips disabled options", async () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <ExampleCombobox onValueChange={onValueChange} />,
    );
    const input = getByRole("combobox", { name: "Search frameworks" });
    fireEvent.focus(input);

    await waitFor(() => {
      expect(
        getByRole("option", { name: "Next.js" }).dataset.active,
      ).toBe("true");
    });
    fireEvent.keyDown(input, { key: "End" });
    expect(getByRole("option", { name: "Astro" }).dataset.active).toBe(
      "true",
    );
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(getByRole("option", { name: "Next.js" }).dataset.active).toBe(
      "true",
    );
    fireEvent.keyDown(input, { key: "ArrowUp" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onValueChange).toHaveBeenCalledWith("astro");
  });

  test("filters grouped options and hides empty groups", async () => {
    const { getByRole, getByText, queryByRole } = render(
      <Combobox defaultValue="studio">
        <ComboboxTrigger>
          <ComboboxInput aria-label="Search workspaces" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList ariaLabel="Workspaces">
            <ComboboxGroup>
              <ComboboxLabel>Recent</ComboboxLabel>
              <ComboboxItem value="studio" textValue="Design studio">
                Design studio
              </ComboboxItem>
            </ComboboxGroup>
            <ComboboxGroup>
              <ComboboxLabel>Workspaces</ComboboxLabel>
              <ComboboxItem value="playground" textValue="Playground">
                Playground
              </ComboboxItem>
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    fireEvent.focus(getByRole("combobox", { name: "Search workspaces" }));
    fireEvent.change(
      getByRole("combobox", { name: "Search workspaces" }),
      { target: { value: "play" } },
    );

    expect(queryByRole("option", { name: "Design studio" })).toBeNull();
    expect(getByRole("option", { name: "Playground" })).toBeTruthy();
    expect(getByText("Recent").closest("fieldset")?.hidden).toBe(true);
    expect(getByRole("group", { name: "Workspaces" }).hidden).toBe(false);
  });

  test("keeps a collision-resolved top placement while closing", async () => {
    const originalInnerHeight = window.innerHeight;
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 100,
    });

    const { container, getByRole } = render(
      <Combobox defaultValue="next">
        <ComboboxTrigger>
          <ComboboxInput aria-label="Search frameworks" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="next">Next.js</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    const trigger = container.querySelector<HTMLElement>("[data-state]");
    if (trigger) {
      trigger.getBoundingClientRect = () =>
        ({
          left: 20,
          right: 220,
          top: 80,
          bottom: 100,
          width: 200,
          height: 20,
        }) as DOMRect;
    }

    const input = getByRole("combobox", { name: "Search frameworks" });
    const panel = document.querySelector<HTMLElement>(
      "[data-combobox-content]",
    );
    const measureNode = panel?.firstElementChild as HTMLElement | undefined;
    if (measureNode) {
      Object.defineProperties(measureNode, {
        offsetHeight: { configurable: true, value: 40 },
        offsetWidth: { configurable: true, value: 200 },
      });
    }
    fireEvent.focus(input);
    fireEvent.scroll(window);
    await waitFor(() => expect(panel?.dataset.side).toBe("top"));

    fireEvent.keyDown(input, { key: "Escape" });
    expect(panel?.dataset.side).toBe("top");
    expect(panel?.style.bottom).toBe("20px");
    expect(panel?.style.top).toBe("");

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: originalInnerHeight,
    });
  });

  test("has no accessibility violations while open", async () => {
    const { container, getByRole } = render(<ExampleCombobox />);
    fireEvent.focus(getByRole("combobox", { name: "Search frameworks" }));
    await waitFor(() =>
      expect(
        getByRole("combobox", { name: "Search frameworks" }),
      ).toBeTruthy(),
    );

    const results = await axe(container.ownerDocument.body, {
      rules: {
        // Product pages provide the page landmark around this composition.
        region: { enabled: false },
      },
    });
    expect(results.violations).toEqual([]);
  });
});
