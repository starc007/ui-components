import { afterEach, expect, test } from "bun:test";
import { act, cleanup, render, waitFor, within } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  VolumeProfile,
  VolumeProfilePlot,
  VolumeProfileSummary,
  VolumeProfileTooltip,
  type VolumeProfileBin,
} from "@/components/charts/volume-profile";
import { VolumeProfilePreview } from "@/components/previews/charts/volume-profile.preview";

afterEach(cleanup);

const data: readonly VolumeProfileBin[] = [
  { id: "low", priceLow: 100, priceHigh: 110, volume: 20 },
  { id: "middle", priceLow: 110, priceHigh: 120, volume: 60 },
  { id: "high", priceLow: 120, priceHigh: 130, volume: 20 },
];

test("volume profile has an exact-data table, text highlights and one vertical inspection control", async () => {
  const { container, getByRole, getAllByRole } = render(
    <VolumeProfile data={data} label="Trade volume" unit="shares" />,
  );
  const table = getByRole("table", { name: "Trade volume data" });
  expect(table.textContent).toContain("100 to 110");
  expect(table.textContent).toContain("Point of control");
  expect(table.textContent).toContain("60.0%");
  expect(getAllByRole("slider")).toHaveLength(1);
  const slider = getByRole("slider", { name: "Trade volume: inspect price level" });
  expect(slider.getAttribute("aria-orientation")).toBe("vertical");
  expect(slider.getAttribute("aria-valuetext")).toContain("20 shares");
  expect((await axe(container)).violations).toEqual([]);
});

test("composed controlled inspection links a focused price level to its custom tooltip", async () => {
  const { getByRole } = render(
    <main>
      <VolumeProfile
        data={data}
        activeId="middle"
        unit="contracts"
        label="Futures volume"
        formatPrice={(price) => `${price} USD`}
        formatVolume={(volume) => volume.toFixed(2)}
      >
        <VolumeProfilePlot showAxes={false} />
        <VolumeProfileTooltip>
          {(row) => (
            <span>
              {row.priceLow} to {row.priceHigh} USD: {row.volume} contracts
            </span>
          )}
        </VolumeProfileTooltip>
        <VolumeProfileSummary />
      </VolumeProfile>
    </main>,
  );
  const slider = getByRole("slider", { name: "Futures volume: inspect price level" });
  await act(async () => slider.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(document.activeElement).toBe(slider);
  expect(slider.getAttribute("aria-valuetext")).toContain("110 USD to 120 USD. 60.00 contracts");
  expect(slider.getAttribute("aria-valuetext")).toContain("Point of control");
  expect(slider.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect(getByRole("tooltip").textContent).toContain("60 contracts");
  // Tooltip is portaled outside this consumer's landmark; page landmarks are
  // the docs shell's responsibility, rather than part of this component audit.
  await act(async () =>
    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations,
    ).toEqual([]),
  );
});

test("animated tooltip numbers expose exact fractional prices and volume to screen readers", async () => {
  const { getByRole } = render(
    <main>
      <VolumeProfile
        data={[
          { id: "first", priceLow: 1.25, priceHigh: 1.5, volume: 0.125 },
          { id: "second", priceLow: 1.5, priceHigh: 1.75, volume: 1.875 },
        ]}
        activeId="second"
        unit="contracts"
        formatPrice={(price) => `$${price.toFixed(2)}`}
        formatVolume={(volume) => volume.toFixed(3)}
      />
    </main>,
  );
  const slider = getByRole("slider");
  await act(async () => slider.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  const tooltip = getByRole("tooltip");
  expect(slider.getAttribute("aria-describedby")).toBe(tooltip.id);
  expect(slider.getAttribute("aria-valuetext")).toContain("$1.50 to $1.75. 1.875 contracts");
  expect(within(tooltip).getByText("$1.50")).toBeTruthy();
  expect(within(tooltip).getByText("$1.75")).toBeTruthy();
  expect(within(tooltip).getByText("1.875")).toBeTruthy();
  expect(within(tooltip).getByText("93.8%")).toBeTruthy();
  await act(async () =>
    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations,
    ).toEqual([]),
  );
});

test("empty and zero-volume profiles provide readable accessible states", async () => {
  const { container, getByText, queryByRole, getByRole, rerender } = render(
    <VolumeProfile data={[]} />,
  );
  expect(getByText("No volume data")).toBeTruthy();
  expect(queryByRole("slider")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
  rerender(<VolumeProfile data={[{ id: "idle", priceLow: 0, priceHigh: 1, volume: 0 }]} />);
  expect(getByRole("slider").getAttribute("aria-valuetext")).toContain(
    "0 units. 0.0% of total volume",
  );
  expect(getByRole("table").textContent).not.toContain("Point of control");
  expect((await axe(container)).violations).toEqual([]);
});

test("session tabs name their shared chart panel and retain a single selected tab", async () => {
  const { container, getByRole, getAllByRole } = render(<VolumeProfilePreview />);
  const tabs = getAllByRole("tab");
  const panel = getByRole("tabpanel", { name: "Today" });
  expect(tabs.filter((tab) => tab.getAttribute("aria-selected") === "true")).toHaveLength(1);
  expect(tabs.filter((tab) => tab.tabIndex === 0)).toHaveLength(1);
  expect(getByRole("tab", { name: "Today" }).getAttribute("aria-controls")).toBe(panel.id);
  expect(getByRole("slider", { name: "BTC volume profile: inspect price level" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});
