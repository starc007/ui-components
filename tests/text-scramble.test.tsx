import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { TextScramble } from "@/components/motion/text-scramble";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);

describe("TextScramble", () => {
  test("hides animated characters and exposes the final text", async () => {
    const scramble = render(<TextScramble text="Thinking…" />);
    const animated = scramble.container.querySelector('[aria-hidden="true"]');
    const accessible = scramble.container.querySelector(".sr-only");

    expect(animated?.textContent).toBe("Thinking…");
    expect(accessible?.textContent).toBe("Thinking…");

    scramble.rerender(<TextScramble text="Running tools…" />);
    await waitFor(() => {
      expect(scramble.container.querySelector(".sr-only")?.textContent).toBe(
        "Running tools…",
      );
    });
    expect(
      scramble.container.querySelector('[aria-hidden="true"]'),
    ).not.toBeNull();
  });

  test("packages as a directly installable motion component", async () => {
    const item = await buildShadcnItem("motion", "text-scramble");

    expect(item?.name).toBe("text-scramble");
    expect(
      item?.files.some(
        (file) => file.path === "components/motion/text-scramble.tsx",
      ),
    ).toBe(true);
  });
});
