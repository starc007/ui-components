import { afterEach, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerArea,
  ColorPickerChannels,
  ColorPickerContent,
  ColorPickerHexInput,
  ColorPickerHue,
  ColorPickerPreset,
  ColorPickerPresets,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from "@/components/motion/color-picker";

afterEach(cleanup);

test("color picker exposes named sliders, fields and pressed presets", async () => {
  const { container, getByRole } = render(
    <ColorPicker aria-label="Brand color" defaultValue="#3478f6">
      <ColorPickerArea />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <ColorPickerHexInput />
      <ColorPickerSwatch />
      <ColorPickerPresets aria-label="Presets">
        <ColorPickerPreset value="#3478f6" label="Blue" />
        <ColorPickerPreset value="#e55656" label="Red" />
      </ColorPickerPresets>
    </ColorPicker>,
  );
  expect(getByRole("group", { name: "Brand color" })).toBeTruthy();
  expect(getByRole("slider", { name: "Saturation and brightness" }).getAttribute("aria-valuetext")).toContain("Saturation");
  expect(getByRole("slider", { name: "Hue" })).toBeTruthy();
  expect(getByRole("slider", { name: "Opacity" })).toBeTruthy();
  expect((getByRole("textbox", { name: "Hex color" }) as HTMLInputElement).value).toBe("3478F6");
  expect(getByRole("button", { name: "Blue" }).getAttribute("aria-pressed")).toBe("true");
  expect(getByRole("button", { name: "Red" }).getAttribute("aria-pressed")).toBe("false");
  expect((await axe(container)).violations).toEqual([]);
});

test("opaque disabled picker with HSL channels removes opacity and disables controls", async () => {
  const { container, getByRole, queryByRole } = render(
    <ColorPicker aria-label="Accent" value="#808080" alpha={false} disabled>
      <ColorPickerArea />
      <ColorPickerHue />
      <ColorPickerAlpha />
      <ColorPickerChannels format="hsl" />
    </ColorPicker>,
  );
  expect(queryByRole("slider", { name: "Opacity" })).toBeNull();
  expect(getByRole("slider", { name: "Hue" }).getAttribute("aria-disabled")).toBe("true");
  expect((getByRole("textbox", { name: "Lightness" }) as HTMLInputElement).disabled).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});

test("popover picker links its trigger to an open labelled dialog", async () => {
  const { container, getByRole } = render(
    <ColorPicker aria-label="Brand color" defaultValue="#3478f6" defaultOpen>
      <ColorPickerTrigger />
      <ColorPickerContent aria-label="Brand color">
        <ColorPickerArea />
        <ColorPickerHue />
        <ColorPickerHexInput />
      </ColorPickerContent>
    </ColorPicker>,
  );
  const trigger = getByRole("button", { expanded: true });
  const dialog = getByRole("dialog", { name: "Brand color" });
  expect(trigger.getAttribute("aria-controls")).toBe(dialog.id);
  expect(getByRole("slider", { name: "Saturation and brightness" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
