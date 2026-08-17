import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import {
  AvailabilityScheduler,
  defaultWeek,
  type WeekAvailability,
} from "@/components/motion/availability-scheduler";

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
});
