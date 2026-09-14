import { afterEach, expect, test } from "bun:test";
import { cleanup, fireEvent, render, waitFor, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  HeatCalendar,
  HeatCalendarGrid,
  HeatCalendarLegend,
  HeatCalendarTooltip,
  type HeatCalendarSelection,
} from "@/components/charts/heat-calendar";
import {
  ReturnsCalendar,
  ReturnsCalendarGrid,
  ReturnsCalendarTooltip,
  type ReturnsCalendarSelection,
} from "@/components/charts/returns-calendar";
import {
  PriceTargetFan,
  PriceTargetFanHeader,
  PriceTargetFanPlot,
  PriceTargetFanSvg,
  PriceTargetFanHistory,
  PriceTargetFanTargets,
  PriceTargetFanTooltip,
  usePriceTargetFan,
  type PriceTargetFanActive,
  type PriceTarget,
} from "@/components/charts/price-target-fan";
import { Tooltip } from "@/components/motion/tooltip";
import { buildShadcnItem } from "@/lib/registry-server";

afterEach(cleanup);
const targets: [PriceTarget, PriceTarget, PriceTarget] = [
  { key: "High", price: 232, analysts: 9 },
  { key: "Mean", price: 205, analysts: 34 },
  { key: "Low", price: 168, analysts: 6 },
];
const history = [
  { date: "2026-01-01", price: 100 },
  { date: "2026-03-01", price: 140 },
];
const endDate = new Date("2026-09-12T00:00:00Z");

test("explicit HeatCalendar dates produce identical SSR in UTC and Los Angeles", () => {
  const source = `import {createElement} from "react"; import {renderToStaticMarkup} from "react-dom/server"; import {HeatCalendar} from "./components/charts/heat-calendar"; console.log(renderToStaticMarkup(createElement(HeatCalendar, {weeks:1,endDate:new Date("2026-09-12T00:00:00Z")})));`;
  const renderIn = (tz: string) => {
    const result = Bun.spawnSync(["bun", "-e", source], { env: { ...process.env, TZ: tz } });
    expect(result.exitCode).toBe(0);
    return result.stdout.toString();
  };
  const utc = renderIn("UTC");
  expect(renderIn("America/Los_Angeles")).toBe(utc);
  expect(utc).toContain("Sat, Sep 12");
  expect(utc).not.toContain("Sun, Sep 13");
});

test("HeatCalendar defaults to zero data and composes a custom tooltip without a legend", () => {
  const { getAllByRole, getByRole, queryByRole } = render(
    <HeatCalendar weeks={1} endDate={endDate}>
      <HeatCalendarGrid>
        <HeatCalendarTooltip>{(data) => <span>Count: {data.count}</span>}</HeatCalendarTooltip>
      </HeatCalendarGrid>
    </HeatCalendar>,
  );
  expect(getAllByRole("button")).toHaveLength(6);
  expect(queryByRole("button", { name: "Show activity level 0" })).toBeNull();
  fireEvent.focus(getByRole("button", { name: "0 commits on Mon, Sep 7" }));
  expect(getByRole("tooltip", { hidden: true }).textContent).toBe("Count: 0");
});

test("HeatCalendar supports controlled selection and sums inclusive spans", () => {
  const changes: (HeatCalendarSelection | null)[] = [];
  const props = {
    weeks: 1,
    endDate,
    maxCount: 10,
    values: [[0.1, 0.2, 0.3, 0, 0, 0, 0]],
    onSelectionChange: (v: HeatCalendarSelection | null) => changes.push(v),
  };
  const { getByRole, rerender } = render(<HeatCalendar {...props} selection={null} />);
  const first = getByRole("button", { name: "1 commits on Mon, Sep 7" });
  fireEvent.click(first);
  expect(changes).toEqual([{ start: { w: 0, d: 0 } }]);
  expect(first.getAttribute("aria-pressed")).toBe("false");
  rerender(<HeatCalendar {...props} selection={{ start: { w: 0, d: 0 } }} />);
  fireEvent.click(getByRole("button", { name: "3 commits on Wed, Sep 9" }));
  expect(changes.at(-1)).toEqual({ start: { w: 0, d: 0 }, end: { w: 0, d: 2 } });
  rerender(
    <HeatCalendar {...props} selection={changes.at(-1)}>
      <HeatCalendarGrid>
        <HeatCalendarTooltip>{(data) => `${data.total} over ${data.days} days`}</HeatCalendarTooltip>
      </HeatCalendarGrid>
    </HeatCalendar>,
  );
  expect(getByRole("tooltip", { hidden: true }).textContent).toBe("6 over 3 days");
  fireEvent.keyDown(getByRole("button", { name: "1 commits on Mon, Sep 7" }), { key: "Escape" });
  expect(changes.at(-1)).toBeNull();
});

test("HeatCalendar parts can be reordered and two roots remain isolated", () => {
  const { getAllByRole, container } = render(
    <>
      <HeatCalendar weeks={1} endDate={endDate}>
        <HeatCalendarLegend />
        <HeatCalendarGrid />
      </HeatCalendar>
      <HeatCalendar weeks={1} endDate={endDate}>
        <HeatCalendarGrid />
      </HeatCalendar>
    </>,
  );
  fireEvent.click(getAllByRole("button", { name: "0 commits on Mon, Sep 7" })[0]);
  expect(
    getAllByRole("button", { name: "0 commits on Mon, Sep 7" }).map((el) => el.getAttribute("aria-pressed")),
  ).toEqual(["true", "false"]);
  expect(container.firstElementChild?.firstElementChild?.textContent).toContain("less");
});

test("ReturnsCalendar compounds custom data and accepts a controlled year selection", () => {
  const changes: (ReturnsCalendarSelection | null)[] = [];
  const props = {
    years: [2024, 2025],
    returns: [[10], [20]],
    onSelectionChange: (v: ReturnsCalendarSelection | null) => changes.push(v),
  };
  const { getByRole, rerender } = render(
    <ReturnsCalendar {...props} selection={null}>
      <ReturnsCalendarGrid>
        <ReturnsCalendarTooltip>{(data) => `${data.label}: ${data.value.toFixed(1)}`}</ReturnsCalendarTooltip>
      </ReturnsCalendarGrid>
    </ReturnsCalendar>,
  );
  const first = getByRole("button", { name: "2024 +10.0% for the year" });
  fireEvent.click(first);
  expect(changes.at(-1)).toEqual({ start: { y: 0, m: 12 } });
  expect(first.getAttribute("aria-pressed")).toBe("false");
  rerender(
    <ReturnsCalendar {...props} selection={{ start: { y: 0, m: 12 }, end: { y: 1, m: 12 } }}>
      <ReturnsCalendarGrid>
        <ReturnsCalendarTooltip>{(data) => `${data.label}: ${data.value.toFixed(1)}`}</ReturnsCalendarTooltip>
      </ReturnsCalendarGrid>
    </ReturnsCalendar>,
  );
  expect(getByRole("tooltip", { hidden: true }).textContent).toBe("2024 – 2025: 32.0");
});

test("PriceTargetFan never creates history when it is omitted", () => {
  const { queryByRole, container } = render(<PriceTargetFan current={178.52} targets={targets} />);
  expect(queryByRole("slider", { name: "Price history" })).toBeNull();
  expect(container.querySelector("[data-price-history]")).toBeNull();
  expect(container.innerHTML).not.toContain("NaN");
});

test("PriceTargetFan scrubs supplied prices and dates using the keyboard", () => {
  const { getByRole } = render(<PriceTargetFan current={178.52} targets={targets} history={history} />);
  const slider = getByRole("slider", { name: "Price history" });
  fireEvent.focus(slider);
  expect(slider.getAttribute("aria-valuetext")).toBe("2026-03-01: $140.00");
  fireEvent.keyDown(slider, { key: "Home" });
  expect(slider.getAttribute("aria-valuetext")).toBe("2026-01-01: $100.00");
  const tip = getByRole("tooltip", { hidden: true });
  expect(tip.textContent).toContain("Thu, Jan 1");
  expect(tip.textContent).toContain("$100.00");
  expect(slider.getAttribute("aria-describedby")).toBe(tip.id);
});

test("PriceTargetFan supports one-point history and controlled target activation", () => {
  const changes: (PriceTargetFanActive | null)[] = [];
  const { getByRole, rerender, container } = render(
    <PriceTargetFan
      current={178.52}
      targets={targets}
      history={[history[0]]}
      active={null}
      onActiveChange={(value) => changes.push(value)}
    />,
  );
  const high = getByRole("button", { name: "High target $232.00, 9 analysts" });
  fireEvent.focus(high);
  expect(changes.at(-1)).toEqual({ type: "target", key: "High" });
  expect(high.getAttribute("aria-pressed")).toBe("false");
  expect(container.innerHTML).not.toContain("NaN");
  rerender(
    <PriceTargetFan
      current={178.52}
      targets={targets}
      history={history}
      active={{ type: "target", key: "High" }}
    />,
  );
  expect(high.getAttribute("aria-pressed")).toBe("true");
});

test("PriceTargetFan parts allow a custom header, tooltip, and omitted axes", () => {
  const { getByText, getByRole, container } = render(
    <PriceTargetFan
      current={178.52}
      targets={targets}
      history={history}
      defaultActive={{ type: "target", key: "High" }}
    >
      <PriceTargetFanHeader>Forecast</PriceTargetFanHeader>
      <PriceTargetFanPlot>
        <PriceTargetFanSvg>
          <PriceTargetFanHistory />
          <PriceTargetFanTargets />
        </PriceTargetFanSvg>
        <PriceTargetFanTooltip>{(data) => data.title}</PriceTargetFanTooltip>
      </PriceTargetFanPlot>
    </PriceTargetFan>,
  );
  expect(getByText("Forecast")).toBeTruthy();
  expect(getByRole("tooltip", { hidden: true }).textContent).toBe("High target");
  expect(container.querySelectorAll("svg text")).toHaveLength(3);
});

test("PriceTargetFan rejects invalid and unordered history rather than fabricating a replacement", () => {
  expect(() =>
    renderToStaticMarkup(
      <PriceTargetFan current={178.52} targets={targets} history={[history[1], history[0]]} />,
    ),
  ).toThrow("ascending");
});

test("a price tooltip converts viewBox units and repositions when its container resizes", async () => {
  const Original = globalThis.ResizeObserver;
  const callbacks: ResizeObserverCallback[] = [];
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      callbacks.push(callback);
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as typeof ResizeObserver;
  try {
    const { container, getByRole } = render(<PriceTargetFan current={178.52} targets={targets} />);
    const svg = container.querySelector("svg");
    if (!svg) throw new Error("Missing price chart SVG");
    let width = 320;
    Object.defineProperties(svg, {
      clientWidth: { get: () => width },
      clientHeight: { get: () => (width * 236) / 520 },
    });
    fireEvent.focus(getByRole("button", { name: "High target $232.00, 9 analysts" }));
    const tip = getByRole("tooltip", { hidden: true });
    Object.defineProperties(tip, { offsetWidth: { get: () => 148 }, offsetHeight: { get: () => 110 } });
    const resize = () =>
      act(() => {
        for (const callback of callbacks) callback([], {} as ResizeObserver);
      });
    resize();
    await waitFor(() => expect(tip.style.transform).toContain("translateX(172px)"));
    width = 240;
    resize();
    await waitFor(() => expect(tip.style.transform).toContain("translateX(92px)"));
  } finally {
    globalThis.ResizeObserver = Original;
  }
});

test("the original Tooltip still shows the shared surface on focus", async () => {
  const { getByRole } = render(
    <Tooltip content="Shared label" delay={0}>
      <button type="button">Trigger</button>
    </Tooltip>,
  );
  fireEvent.focus(getByRole("button", { name: "Trigger" }));
  await waitFor(() => expect(getByRole("tooltip", { hidden: true }).textContent).toBe("Shared label"));
});

test("chart installs include composable parts and the shared tooltip surface", async () => {
  for (const slug of ["heat-calendar", "returns-calendar", "price-target-fan"]) {
    const item = await buildShadcnItem("charts", slug);
    expect(item?.name).toBe(slug);
    expect(item?.files.some((file) => file.path === "components/motion/tooltip-surface.tsx")).toBe(true);
    expect(item?.files.some((file) => file.path === "components/charts/shared/chart-tooltip.tsx")).toBe(true);
  }
});

test("calendar selections do not revive after their cells are removed and restored", () => {
  const heat = render(
    <HeatCalendar weeks={2} endDate={endDate} defaultSelection={{ start: { w: 1, d: 0 } }} />,
  );
  heat.rerender(<HeatCalendar weeks={1} endDate={endDate} />);
  heat.rerender(<HeatCalendar weeks={2} endDate={endDate} />);
  expect(heat.container.querySelector('[aria-pressed="true"]')).toBeNull();
  heat.unmount();
  const returns = render(
    <ReturnsCalendar
      years={[2024, 2025]}
      returns={[[10], [20]]}
      defaultSelection={{ start: { y: 1, m: 12 } }}
    />,
  );
  returns.rerender(<ReturnsCalendar years={[2024]} returns={[[10]]} />);
  returns.rerender(<ReturnsCalendar years={[2024, 2025]} returns={[[10], [20]]} />);
  expect(returns.container.querySelector('[aria-pressed="true"]')).toBeNull();
});

test("a removed price history sample does not regain stale active state when restored", () => {
  function ActiveState() {
    const { active } = usePriceTargetFan();
    return <output>{active ? "active" : "inactive"}</output>;
  }
  const { rerender, getByText } = render(
    <PriceTargetFan
      current={178.52}
      targets={targets}
      history={history}
      defaultActive={{ type: "history", date: history[0].date }}
    >
      <ActiveState />
    </PriceTargetFan>,
  );
  expect(getByText("active")).toBeTruthy();
  rerender(
    <PriceTargetFan current={178.52} targets={targets} history={[]}>
      <ActiveState />
    </PriceTargetFan>,
  );
  rerender(
    <PriceTargetFan current={178.52} targets={targets} history={history}>
      <ActiveState />
    </PriceTargetFan>,
  );
  expect(getByText("inactive")).toBeTruthy();
});
