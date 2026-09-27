import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  ColorSelector,
  ColorSelectorItem,
  ColorSelectorLabel,
  ColorSelectorList,
} from "@/components/motion/color-selector";

afterEach(cleanup);

test("color selector exposes its group label, named choices, selection and disabled state", async () => {
  const { container, getByRole } = render(
    <ColorSelector defaultValue="blue">
      <ColorSelectorLabel>Accent</ColorSelectorLabel>
      <ColorSelectorList>
        <ColorSelectorItem value="blue" color="#3478f6" label="Blue" />
        <ColorSelectorItem value="purple" color="#9270e8" label="Purple" />
        <ColorSelectorItem value="teal" color="#169d83" label="Teal" disabled />
      </ColorSelectorList>
    </ColorSelector>,
  );
  expect(getByRole("group", { name: "Accent" })).toBeTruthy();
  expect((getByRole("radio", { name: "Blue" }) as HTMLInputElement).checked).toBe(true);
  expect((getByRole("radio", { name: "Teal" }) as HTMLInputElement).disabled).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});

test("an externally labelled disabled selector keeps each radio disabled", async () => {
  const { container, getAllByRole } = render(
    <ColorSelector aria-label="Chart color" value="white" disabled>
      <ColorSelectorList>
        <ColorSelectorItem value="white" color="#fff" label="White" />
        <ColorSelectorItem value="black" color="#000" label="Black" />
      </ColorSelectorList>
    </ColorSelector>,
  );
  for (const radio of getAllByRole("radio")) expect((radio as HTMLInputElement).disabled).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});
