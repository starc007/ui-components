import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render, waitFor } from "@testing-library/react";
import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";

afterEach(cleanup);

describe("ChromaticTextReveal", () => {
  test("renders the fixed prefix and active word as accessible content", () => {
    const { getByText } = render(
      <ChromaticTextReveal
        prefix="Make it feel"
        words={["alive.", "effortless."]}
      />,
    );

    expect(getByText("Make it feel").tagName).toBe("SPAN");
    expect(getByText("alive.", { selector: "span:not([aria-hidden])" })).toBeTruthy();
  });

  test("cycles only the final word while keeping the prefix mounted", async () => {
    const { getByText } = render(
      <ChromaticTextReveal
        prefix="Make it feel"
        words={["alive.", "effortless."]}
        duration={0.01}
        pauseDuration={0.01}
        startOnView={false}
        loop={false}
      />,
    );
    const prefix = getByText("Make it feel");

    await waitFor(() => {
      expect(
        getByText("effortless.", { selector: "span:not([aria-hidden])" }),
      ).toBeTruthy();
    });
    expect(getByText("Make it feel")).toBe(prefix);
  });

  test("uses custom colors in the reveal gradient", () => {
    const { getByText } = render(
      <ChromaticTextReveal
        prefix="Your"
        words={["colors."]}
        colors={["rgb(96, 165, 250)", "rgb(244, 114, 182)"]}
      />,
    );

    const text = getByText("colors.", {
      selector: "span.absolute[aria-hidden]",
    });
    const gradient = text.style.getPropertyValue("--chromatic-gradient");
    expect(gradient).toContain("rgb(96, 165, 250)");
    expect(gradient).toContain("rgb(244, 114, 182)");
  });

  test("applies the final text color and custom classes", async () => {
    const { getByText } = render(
      <ChromaticTextReveal
        prefix="Styled"
        words={["reveal."]}
        foregroundColor="rgb(10, 20, 30)"
        duration={0}
        startOnView={false}
        className="headline"
      />,
    );

    expect(getByText("Styled").parentElement?.classList.contains("headline")).toBe(
      true,
    );
    await waitFor(() => {
      expect(
        getByText("reveal.", {
          selector: "span.absolute[aria-hidden]",
        }).style.getPropertyValue("--chromatic-gradient"),
      ).toContain("rgb(10, 20, 30)");
    });
  });
});
