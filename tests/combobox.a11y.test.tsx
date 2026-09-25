import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
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

describe("combobox accessibility", () => {
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
