import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import {
  AvailabilityScheduler,
  defaultWeek,
  type WeekAvailability,
} from "@/components/motion/availability-scheduler";
import {
  buildOptions,
  clampRange,
  endOptions,
  startOptions,
} from "@/components/motion/availability-scheduler/types";

function Scheduler({ initial }: { initial: WeekAvailability }) {
  const [value, setValue] = useState(initial);
  // A 12h step keeps every panel to two options — these tests only care which
  // panel is open, not what is in it.
  return <AvailabilityScheduler value={value} onChange={setValue} step={720} />;
}

/** Every time field, in row order: mon start, mon end, tue start, … */
const fields = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[aria-haspopup="listbox"]'));

const openFields = (container: HTMLElement) =>
  fields(container).filter((f) => f.getAttribute("aria-expanded") === "true");

afterEach(cleanup);

describe("AvailabilityScheduler open panel", () => {
  test("only one panel across the week is open at a time", () => {
    const { container } = render(<Scheduler initial={defaultWeek()} />);
    const [monStart, , tueStart] = fields(container);

    fireEvent.click(monStart);
    expect(monStart.getAttribute("aria-expanded")).toBe("true");

    fireEvent.click(tueStart);
    expect(tueStart.getAttribute("aria-expanded")).toBe("true");
    expect(monStart.getAttribute("aria-expanded")).toBe("false");
  });

  test("two days that reuse a range id open independently", () => {
    // Range ids are the consumer's to choose, and a controlled value may well
    // number them per day.
    const reused: WeekAvailability = {
      ...defaultWeek(),
      mon: { enabled: true, ranges: [{ id: "0", start: "09:00", end: "17:00" }] },
      tue: { enabled: true, ranges: [{ id: "0", start: "09:00", end: "17:00" }] },
    };
    const { container } = render(<Scheduler initial={reused} />);
    const [monStart, , tueStart] = fields(container);

    fireEvent.click(monStart);
    expect(monStart.getAttribute("aria-expanded")).toBe("true");
    expect(tueStart.getAttribute("aria-expanded")).toBe("false");
    expect(openFields(container)).toHaveLength(1);
  });

  test("switching a day off releases the panel it was holding open", () => {
    const { container, getByRole } = render(
      <Scheduler initial={defaultWeek()} />,
    );
    const [monStart] = fields(container);

    fireEvent.click(monStart);
    expect(openFields(container)).toHaveLength(1);

    // Keyboard-style activation: no outside pointerdown, so nothing dismisses
    // the controlled Select as its field leaves. The day keeps its range ids,
    // so the very same panel comes back when it returns.
    const monSwitch = getByRole("switch", {
      name: "Toggle Monday availability",
    });
    fireEvent.click(monSwitch);
    fireEvent.click(monSwitch);

    expect(openFields(container)).toHaveLength(0);
  });

  test("keeps a 12:00 PM start against a 5:00 PM end on a 12h step", () => {
    const { container, getByRole } = render(
      <Scheduler initial={defaultWeek()} />,
    );
    const [monStart, monEnd] = fields(container);

    fireEvent.click(monStart);
    fireEvent.click(getByRole("option", { name: "12:00 PM" }));

    expect(monStart.textContent).toContain("12:00 PM");
    expect(monEnd.textContent).toContain("5:00 PM");
  });

  test("shows a persisted overnight range instead of a blank Select", () => {
    const overnight: WeekAvailability = {
      ...defaultWeek(),
      mon: {
        enabled: true,
        ranges: [{ id: "mon-0", start: "19:00", end: "01:00" }],
      },
    };
    const { container } = render(
      <AvailabilityScheduler value={overnight} onChange={() => {}} />,
    );
    const [monStart, monEnd] = fields(container);
    expect(monStart.textContent).toContain("7:00 PM");
    expect(monEnd.textContent).toContain("1:00 AM");
  });
});

const options = buildOptions(30);
const options50 = buildOptions(50);

describe("availability scheduler ranges", () => {
  test("rejects an overnight window like 7:00 PM to 1:00 AM", () => {
    expect(clampRange("19:00", "01:00", options)).toEqual({
      start: "19:00",
      end: "19:30",
    });
  });

  test("keeps a same-day window", () => {
    expect(clampRange("09:00", "17:00", options)).toEqual({
      start: "09:00",
      end: "17:00",
    });
  });

  test("snaps onto generated options when step does not divide the day", () => {
    expect(clampRange("22:30", "23:20", options50)).toEqual({
      start: "22:30",
      end: "23:20",
    });
  });

  test("preserves a 12:00 start when the 17:00 end is off the 12h grid", () => {
    expect(clampRange("12:00", "17:00", buildOptions(720), "start")).toEqual({
      start: "12:00",
      end: "17:00",
    });
  });

  test("moves only the opposite end when the user picks an overnight end", () => {
    expect(clampRange("19:00", "01:00", options, "end")).toEqual({
      start: "00:30",
      end: "01:00",
    });
  });

  test("end picker only lists times after start", () => {
    const ends = endOptions(options, "19:00").map((o) => o.value);
    expect(ends).not.toContain("01:00");
    expect(ends[0]).toBe("19:30");
  });

  test("start picker only lists times before end", () => {
    const starts = startOptions(options, "17:00").map((o) => o.value);
    expect(starts).not.toContain("17:00");
    expect(starts.at(-1)).toBe("16:30");
  });

  test("keeps a persisted overnight range visible in both pickers", () => {
    expect(
      startOptions(options, "01:00", "19:00").map((o) => o.value),
    ).toContain("19:00");
    expect(
      endOptions(options, "19:00", "01:00").map((o) => o.value),
    ).toContain("01:00");
  });
});
