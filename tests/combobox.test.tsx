import { afterEach, describe, expect, mock, test } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  waitFor,
  within,
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

import {
  cleanupOutsideAct,
  renderOutsideAct,
} from "@/tests/support/render-outside-act";

afterEach(cleanup);
afterEach(cleanupOutsideAct);

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

function AsyncCombobox({
  query = "a",
  results,
  onValueChange,
}: {
  query?: string;
  results: string[];
  onValueChange?: (value: string) => void;
}) {
  return (
    <Combobox
      open
      query={query}
      onQueryChange={() => {}}
      filter={() => true}
      onValueChange={onValueChange}
    >
      <ComboboxTrigger>
        <ComboboxInput aria-label="Search results" />
      </ComboboxTrigger>
      <ComboboxContent>
        <ComboboxList ariaLabel="Results">
          {results.map((result) => (
            <ComboboxItem key={result} value={result}>
              {result}
            </ComboboxItem>
          ))}
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

  test("has no active option until the list has been opened", () => {
    const { container, getByRole } = render(<ExampleCombobox />);

    expect(container.ownerDocument.querySelector("[data-active]")).toBeNull();

    fireEvent.focus(getByRole("combobox", { name: "Search frameworks" }));
    expect(getByRole("option", { name: "Next.js" }).dataset.active).toBe("true");
  });

  test("keeps the highlight where it was through the closing animation", () => {
    const { container, getByRole } = render(<ExampleCombobox />);
    const activeOption = () =>
      container.ownerDocument.querySelector("[data-active]");
    const input = getByRole("combobox", { name: "Search frameworks" });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "r" } });
    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(activeOption()?.textContent).toBe("Remix");

    // The panel stays mounted and animates out. Closing clears the query, so
    // the list has to keep filtering by the query it was open with: neither
    // the rows nor the highlight may change while the panel is on screen. The
    // closing panel is aria-hidden, so this reads the DOM, not the a11y tree.
    const rowText = () =>
      Array.from(
        container.ownerDocument.querySelectorAll("[data-combobox-item]"),
      ).map((row) => row.textContent);
    const openRows = rowText();
    // Non-vacuous: the query really is filtering rows out while open.
    expect(openRows).not.toContain("Vite");

    fireEvent.keyDown(input, { key: "Escape" });
    expect(rowText()).toEqual(openRows);
    expect(activeOption()?.textContent).toBe("Remix");
    expect(input.hasAttribute("aria-activedescendant")).toBe(false);
  });

  test("never makes a disabled option active", () => {
    const onValueChange = mock(() => {});
    const { getByRole } = render(
      <Combobox defaultValue="vite" onValueChange={onValueChange}>
        <ComboboxTrigger>
          <ComboboxInput aria-label="Search frameworks" />
        </ComboboxTrigger>
        <ComboboxContent>
          <ComboboxList ariaLabel="Frameworks">
            <ComboboxItem value="next">Next.js</ComboboxItem>
            <ComboboxItem value="remix">Remix</ComboboxItem>
            <ComboboxItem value="vite" disabled>
              Vite
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );

    const input = getByRole("combobox", { name: "Search frameworks" });
    fireEvent.focus(input);

    // The selected option is disabled, so the first enabled one takes over.
    expect(getByRole("option", { name: "Next.js" }).dataset.active).toBe("true");
    expect(input.getAttribute("aria-activedescendant")).toBe(
      getByRole("option", { name: "Next.js" }).id,
    );

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(getByRole("option", { name: "Remix" }).dataset.active).toBe("true");
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onValueChange).toHaveBeenCalledWith("remix");
  });

  test("drops a cursor placed under an earlier query", () => {
    const { getByRole, rerender } = render(
      <AsyncCombobox query="a" results={["alpha", "beta"]} />,
    );
    const input = getByRole("combobox", { name: "Search results" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(getByRole("option", { name: "beta" }).dataset.active).toBe("true");

    rerender(<AsyncCombobox query="ab" results={["alpha", "beta"]} />);
    expect(getByRole("option", { name: "alpha" }).dataset.active).toBe("true");

    // Reverting the query must not revive the cursor it was placed under.
    rerender(<AsyncCombobox query="a" results={["alpha", "beta"]} />);
    expect(getByRole("option", { name: "alpha" }).dataset.active).toBe("true");
    expect(getByRole("option", { name: "beta" }).dataset.active).toBeUndefined();
  });

  test("drops a cursor whose row left the result set", () => {
    // A live search replaces results without the query string changing.
    const { getByRole, rerender } = render(
      <AsyncCombobox query="a" results={["alpha", "beta"]} />,
    );
    const input = getByRole("combobox", { name: "Search results" });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    expect(getByRole("option", { name: "beta" }).dataset.active).toBe("true");

    rerender(<AsyncCombobox query="a" results={["gamma"]} />);
    rerender(<AsyncCombobox query="a" results={["alpha", "beta"]} />);
    expect(getByRole("option", { name: "alpha" }).dataset.active).toBe("true");
    expect(getByRole("option", { name: "beta" }).dataset.active).toBeUndefined();
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

describe("Combobox async results", () => {
  // A debounced search reveals its options in a commit of their own. These
  // tests read that commit the way the browser would paint it, which is the
  // window a real key press lands in. See tests/support/render-outside-act.tsx.
  // The panel is portalled to the body, so options are scoped to the document
  // while the input is scoped to the harness's own root.
  const field = (container: HTMLElement) =>
    within(container).getByRole("combobox");
  const options = () => within(document.body).getAllByRole("option");

  test("makes the first option active in the commit that reveals it", () => {
    const view = renderOutsideAct(<AsyncCombobox results={[]} />);
    view.commit(<AsyncCombobox results={["alpha", "beta"]} />);

    const [first] = options();
    expect(first.textContent).toBe("alpha");
    expect(field(view.container).getAttribute("aria-activedescendant")).toBe(
      first.id,
    );
    expect(first.dataset.active).toBe("true");
  });

  test("steps past the first option on the first key after they appear", () => {
    const onValueChange = mock(() => {});
    const view = renderOutsideAct(
      <AsyncCombobox results={[]} onValueChange={onValueChange} />,
    );
    view.commit(
      <AsyncCombobox
        results={["alpha", "beta"]}
        onValueChange={onValueChange}
      />,
    );

    const input = field(view.container);
    view.dispatch(
      input,
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    // A real key press gets a render between the two keys, and nothing a
    // passive effect scheduled has settled in this window.
    view.flushPendingWork();
    view.dispatch(
      input,
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(onValueChange).toHaveBeenCalledWith("beta");
  });

  test("moves one option per key when two keys land in one batch", () => {
    // Programmatic replay — a synthetic key sequence, an e2e driver, an `act`
    // block — can put two keydowns in one batch. Each still has to count.
    const view = renderOutsideAct(
      <AsyncCombobox results={["alpha", "beta", "gamma", "delta"]} />,
    );
    const input = field(view.container);
    for (let i = 0; i < 3; i += 1) {
      view.dispatch(
        input,
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    }
    view.flushPendingWork();

    const active = input.getAttribute("aria-activedescendant");
    expect(options().find((option) => option.id === active)?.textContent).toBe(
      "delta",
    );
  });
});
