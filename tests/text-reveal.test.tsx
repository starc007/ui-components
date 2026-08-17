import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { TextReveal } from "@/components/motion/text-reveal";

/** The spans that actually animate, in stagger order. */
function units(container: HTMLElement) {
  return [...container.querySelectorAll("span.will-change-transform")].map(
    (span) => span.textContent ?? "",
  );
}

afterEach(cleanup);

describe("TextReveal tokenization", () => {
  test("word mode animates one unit per word, space included", () => {
    const { container } = render(<TextReveal text="Motion that feels" />);
    expect(units(container)).toEqual(["Motion ", "that ", "feels"]);
  });

  test("char mode animates one unit per character, in the same order", () => {
    const { container } = render(<TextReveal split="char" text="a bc" />);
    expect(units(container)).toEqual(["a", " ", "b", "c"]);
  });

  test("both modes reproduce the line exactly", () => {
    const line = "cd: no such file or directory: /page";
    for (const split of ["word", "char"] as const) {
      const { container, unmount } = render(
        <TextReveal split={split} text={line} />,
      );
      expect(units(container).join("")).toBe(line);
      unmount();
    }
  });

  test("char mode keeps each word in its own wrapping box", () => {
    const { container } = render(<TextReveal split="char" text="a bc" />);
    const boxes = [
      ...container.querySelectorAll("span.inline-block.whitespace-pre"),
    ].filter((span) => !span.className.includes("will-change-transform"));
    expect(boxes.map((box) => box.textContent)).toEqual(["a ", "bc"]);
  });

  test("interior runs of whitespace survive both modes", () => {
    const line = "a  b";
    expect(units(render(<TextReveal text={line} />).container).join("")).toBe(line);
    cleanup();
    expect(
      units(render(<TextReveal split="char" text={line} />).container).join(""),
    ).toBe(line);
  });

  test("every line renders its own block", () => {
    const { container } = render(
      <TextReveal text={["Motion that feels", "considered."]} />,
    );
    expect(container.querySelectorAll(":scope > span > span.block").length).toBe(2);
    expect(units(container)).toEqual([
      "Motion ",
      "that ",
      "feels",
      "considered.",
    ]);
  });
});
