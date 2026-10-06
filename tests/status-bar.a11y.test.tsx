import { afterEach, expect, test } from "bun:test";
import { act, cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import {
  StatusBar,
  StatusBarLegend,
  StatusBarPlot,
  StatusBarTooltip,
  type StatusBarDatum,
} from "@/components/charts/status-bar";
import { StatusBarPreview } from "@/components/previews/charts/status-bar.preview";

afterEach(cleanup);

const data: readonly StatusBarDatum[] = [
  { id: "first", label: "Oct 5", status: "operational", description: "All checks passed." },
  { id: "second", label: "Oct 6", status: "degraded", description: "Elevated response times." },
  { id: "third", label: "Oct 7", status: "unknown", description: "Monitoring paused." },
];

test("status history exposes text for every colored period and one named inspection control", async () => {
  const { container, getByRole, getAllByRole } = render(
    <StatusBar data={data} label="API status" />,
  );
  const history = getByRole("table", { name: "API status data" });
  expect(history.textContent).toContain("Operational");
  expect(history.textContent).toContain("Elevated response times.");
  expect(history.textContent).toContain("No data");
  expect(getAllByRole("slider")).toHaveLength(1);
  expect(
    getByRole("slider", { name: "API status: inspect period" }).getAttribute("aria-valuetext"),
  ).toBe("Oct 5. Operational. All checks passed.");
  expect(getByRole("list", { name: "Status legend" })).toBeTruthy();
  expect((await axe(container)).violations).toEqual([]);
});

test("composed custom statuses expose the focused period and its tooltip description", async () => {
  const { getByRole } = render(
    <main>
      <StatusBar
        data={[
          {
            id: "deployment",
            label: "Build 42",
            status: "queued",
            description: "Waiting for a runner.",
          },
        ]}
        statuses={[{ id: "queued", label: "Queued", color: "#7c3aed" }]}
        activeId="deployment"
        label="Deployment status"
      >
        <StatusBarPlot showLabels={false} />
        <StatusBarTooltip>
          {({ datum, status }) => (
            <span>
              {datum.label}: {status.label}. {datum.description}
            </span>
          )}
        </StatusBarTooltip>
        <StatusBarLegend showCounts />
      </StatusBar>
    </main>,
  );
  const slider = getByRole("slider", { name: "Deployment status: inspect period" });
  await act(async () => slider.focus());
  await waitFor(() => expect(getByRole("tooltip")).toBeTruthy());
  expect(document.activeElement).toBe(slider);
  expect(slider.getAttribute("aria-valuetext")).toBe("Build 42. Queued. Waiting for a runner.");
  expect(slider.getAttribute("aria-describedby")).toBe(getByRole("tooltip").id);
  expect(getByRole("tooltip").textContent).toContain("Waiting for a runner.");
  // The shared Tooltip portals outside the consumer's landmarks. This is a
  // component audit; page-level landmark placement belongs to the docs shell.
  await act(async () =>
    expect(
      (await axe(document.body, { rules: { region: { enabled: false } } })).violations,
    ).toEqual([]),
  );
});

test("empty history stays readable without an unusable inspection control", async () => {
  const { container, getByText, queryByRole } = render(
    <StatusBar data={[]} label="Empty history" />,
  );
  expect(getByText("No status data")).toBeTruthy();
  expect(queryByRole("slider")).toBeNull();
  expect((await axe(container)).violations).toEqual([]);
});

test("preview incident controls and both service histories retain accessible names", async () => {
  const { container, getByRole } = render(<StatusBarPreview />);
  expect(getByRole("button", { name: "Replay" })).toBeTruthy();
  expect(getByRole("slider", { name: "Website status: inspect period" })).toBeTruthy();
  fireEvent.click(getByRole("button", { name: "Simulate incident" }));
  expect(getByRole("button", { name: "Resolve incident" })).toBeTruthy();
  expect(getByRole("table", { name: "API status data" }).textContent).toContain("Outage");
  expect((await axe(container)).violations).toEqual([]);
});
