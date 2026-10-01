import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { StrictMode, useState } from "react";
import {
  type DateRange,
  DateRangePicker,
  DateRangePickerCalendar,
  DateRangePickerContent,
  DateRangePickerDropdown,
  DateRangePickerFooter,
  DateRangePickerGrid,
  DateRangePickerHeader,
  DateRangePickerPreset,
  DateRangePickerPresets,
  DateRangePickerTrigger,
  useDateRangePicker,
} from "@/components/motion/date-range-picker";
import { MorphingLightbox } from "@/components/motion/morphing-lightbox";
import { SortableStack } from "@/components/motion/sortable-stack";

afterEach(cleanup);

function CustomRangeControls() {
  const { clear, disabled, value } = useDateRangePicker();
  return (
    <button type="button" onClick={clear} disabled={disabled || !value}>
      Reset selection
    </button>
  );
}

function ControlledRangeComposition() {
  const [value, setValue] = useState<DateRange | null>({
    from: "2026-09-14",
    to: "2026-09-17",
  });
  const [open, setOpen] = useState(false);
  return (
    <DateRangePicker
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      defaultMonth="2026-09-01"
      max="2026-10-01"
      closeOnSelect
    >
      <DateRangePickerTrigger aria-label="Choose reporting dates">
        Reporting dates
      </DateRangePickerTrigger>
      <DateRangePickerContent>
        <DateRangePickerCalendar>
          <DateRangePickerHeader />
          <DateRangePickerGrid />
          <DateRangePickerFooter>
            <CustomRangeControls />
            <DateRangePickerPresets>
              <DateRangePickerPreset
                label="Previous week"
                value={{ from: "2026-09-01", to: "2026-09-07" }}
              />
              <DateRangePickerPreset
                label="Future week"
                value={{ from: "2026-10-02", to: "2026-10-08" }}
              />
            </DateRangePickerPresets>
          </DateRangePickerFooter>
        </DateRangePickerCalendar>
      </DateRangePickerContent>
    </DateRangePicker>
  );
}

test("composed controlled picker names custom controls, exposes disabled presets and restores focus in StrictMode", async () => {
  const { getByRole } = render(
    <StrictMode>
      <ControlledRangeComposition />
    </StrictMode>,
  );
  const trigger = getByRole("button", { name: "Choose reporting dates" });
  fireEvent.click(trigger);
  const dialog = await waitFor(() =>
    getByRole("dialog", { name: "Choose reporting dates" }),
  );
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(
    (getByRole("button", { name: "Future week" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  const reset = getByRole("button", { name: "Reset selection" });
  reset.focus();
  fireEvent.click(reset);
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect((reset as HTMLButtonElement).disabled).toBe(true);
  expect((await axe(dialog)).violations).toEqual([]);
  fireEvent.click(getByRole("button", { name: "Previous week" }));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});

test("date range dropdown labels its dialog, focuses the calendar and returns focus after nested Escape", async () => {
  const { container, getByRole } = render(
    <DateRangePickerDropdown
      label="Reporting period"
      defaultMonth="2026-10-01"
      defaultValue={{ from: "2026-10-05", to: "2026-10-12" }}
      max="2026-12-31"
    />,
  );
  const trigger = getByRole("button", { name: /^Reporting period:/ });
  expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
  expect((await axe(container)).violations).toEqual([]);
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await waitFor(() =>
    getByRole("dialog", { name: /^Reporting period:/ }),
  );
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect((await axe(dialog)).violations).toEqual([]);
  const start = getByRole("button", { name: "Monday, October 5, 2026" });
  act(() => start.focus());
  fireEvent.keyDown(start, { key: "Enter" });
  const end = getByRole("button", { name: "Wednesday, October 7, 2026" });
  act(() => end.focus());
  fireEvent.keyDown(end, { key: "Enter" });
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(end);
  expect(end.closest('[role="gridcell"]')?.getAttribute("aria-selected")).toBe(
    "true",
  );
  fireEvent.click(getByRole("button", { name: "Choose year" }));
  const year = getByRole("button", { name: "2026", pressed: true });
  expect(document.activeElement).toBe(year);
  expect((await axe(dialog)).violations).toEqual([]);
  fireEvent.keyDown(year, { key: "Escape" });
  const yearTrigger = getByRole("button", { name: "Choose year" });
  expect(document.activeElement).toBe(yearTrigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  fireEvent.keyDown(yearTrigger, { key: "Escape" });
  expect(document.activeElement).toBe(trigger);
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  fireEvent.click(trigger);
  await waitFor(() => {
    expect(
      getByRole("dialog", { name: /^Reporting period:/ }).contains(
        document.activeElement,
      ),
    ).toBe(true);
  });
});

test("sortable stack names the list and its keyboard handles", async () => {
  const { container, getByRole } = render(
    <SortableStack
      label="Priorities"
      defaultItems={[
        { id: "one", name: "Design" },
        { id: "two", name: "Build" },
      ]}
      getItemLabel={(item) => item.name}
      renderItem={(item) => item.name}
    />,
  );
  expect(getByRole("list", { name: "Priorities" })).toBeTruthy();
  expect(
    getByRole("button", { name: "Reorder Design" }).getAttribute(
      "aria-describedby",
    ),
  ).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("disabled sortable stack removes handle actions", async () => {
  const { container, getByRole } = render(
    <SortableStack
      disabled
      defaultItems={[{ id: "one", name: "Design" }]}
      getItemLabel={(item) => item.name}
      renderItem={(item) => item.name}
    />,
  );
  expect(
    (getByRole("button", { name: "Reorder Design" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect((await axe(container)).violations).toEqual([]);
});

const images = [
  {
    id: "one",
    src: "https://example.com/photo.jpg",
    alt: "Mountain at dusk",
    width: 800,
    height: 600,
  },
];

test("lightbox thumbnails expose dialog actions and image alternatives", async () => {
  const { container, getByRole } = render(
    <MorphingLightbox images={images} label="Photographs" />,
  );
  expect(
    getByRole("button", { name: "Open Mountain at dusk" }).getAttribute(
      "aria-haspopup",
    ),
  ).toBe("dialog");
  expect((await axe(container)).violations).toEqual([]);
});

test("open lightbox contains focus and restores its trigger in StrictMode", async () => {
  const { container, getByRole } = render(
    <StrictMode>
      <MorphingLightbox images={images} label="Photographs" />
    </StrictMode>,
  );
  const trigger = getByRole("button", { name: "Open Mountain at dusk" });
  trigger.focus();
  fireEvent.click(trigger);
  const dialog = await waitFor(() =>
    getByRole("dialog", { name: "Photographs" }),
  );
  expect(dialog.getAttribute("aria-modal")).toBe("true");
  expect(dialog.contains(document.activeElement)).toBe(true);
  expect(container.inert).toBe(true);
  expect(getByRole("button", { name: "Close viewer" })).toBeTruthy();
  expect((await axe(dialog)).violations).toEqual([]);
  fireEvent.click(getByRole("button", { name: "Close viewer" }));
  await waitFor(() => expect(document.activeElement).toBe(trigger));
  expect(container.inert).toBe(false);
});

test("date range grid exposes selection, full date names, disabled dates and one keyboard entry", async () => {
  const { container, getByRole, getAllByRole } = render(
    <DateRangePicker
      defaultMonth="2026-10-01"
      defaultValue={{ from: "2026-10-05", to: "2026-10-12" }}
      min="2026-10-03"
      isDateDisabled={(date) => date === "2026-10-20"}
    />,
  );
  expect(getByRole("grid", { name: "October 2026" })).toBeTruthy();
  expect(getAllByRole("gridcell", { selected: true }).length).toBe(8);
  expect(
    (
      getByRole("button", {
        name: "Tuesday, October 20, 2026",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(container.querySelectorAll('table button[tabindex="0"]').length).toBe(
    1,
  );
  expect((await axe(container)).violations).toEqual([]);
});

test("fully unavailable calendar remains labelled and keyboard reachable", async () => {
  const { container, getByRole } = render(
    <DateRangePicker defaultMonth="2026-10-01" disabled />,
  );
  expect(
    getByRole("grid", { name: "October 2026" }).getAttribute("tabindex"),
  ).toBe("0");
  expect((await axe(container)).violations).toEqual([]);
});

test("calendar month and year choices expose their selection, bounds and keyboard focus", async () => {
  const { container, getByRole, queryByRole } = render(
    <DateRangePicker
      defaultMonth="2026-10-01"
      min="2026-03-01"
      max="2027-12-31"
    />,
  );
  const monthTrigger = getByRole("button", { name: "Choose month" });
  fireEvent.click(monthTrigger);
  const months = getByRole("group", { name: "Choose a month in 2026" });
  const october = getByRole("button", { name: "October", pressed: true });
  expect(document.activeElement).toBe(october);
  expect(
    (getByRole("button", { name: "January" }) as HTMLButtonElement).disabled,
  ).toBe(true);
  expect(months.querySelectorAll('button[tabindex="0"]').length).toBe(1);
  expect((await axe(container)).violations).toEqual([]);
  fireEvent.keyDown(october, { key: "Escape" });
  expect(document.activeElement).toBe(monthTrigger);
  const yearTrigger = getByRole("button", { name: "Choose year" });
  fireEvent.click(yearTrigger);
  const years = getByRole("group", { name: "Choose a year from 2026 to 2027" });
  expect(document.activeElement).toBe(
    getByRole("button", { name: "2026", pressed: true }),
  );
  expect(queryByRole("button", { name: "Next years" })).toBeNull();
  expect(years.querySelectorAll('button[tabindex="0"]').length).toBe(1);
  expect((await axe(container)).violations).toEqual([]);
});
