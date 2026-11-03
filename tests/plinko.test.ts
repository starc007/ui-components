import { expect, test } from "bun:test";
import { plinkoSlots } from "@/components/motion/plinko";

test("plinkoSlots grows evenly from the centre to both edges", () => {
  expect(plinkoSlots(12)).toEqual([100, 50, 20, 10, 5, 2, 1, 2, 5, 10, 20, 50, 100]);
  expect(plinkoSlots(8, { center: 2, edge: 1000 })).toEqual([1000, 200, 40, 9, 2, 9, 40, 200, 1000]);
  for (const rows of [1, 7, 16]) {
    const slots = plinkoSlots(rows);
    expect(slots).toHaveLength(rows + 1);
    expect(slots).toEqual([...slots].reverse());
  }
});
