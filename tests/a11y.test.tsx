import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactElement } from "react";

import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button";
import { Checkbox } from "@/components/motion/checkbox";
import { BloomMenu } from "@/components/motion/bloom-menu";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";
import { Switch } from "@/components/motion/switch";
import { Parallax } from "@/components/motion/parallax";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ScrollTo } from "@/components/motion/scroll-to";
import { RangeSlider } from "@/components/motion/range-slider";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/motion/tabs";
import { TextReveal } from "@/components/motion/text-reveal";
import { Tooltip } from "@/components/motion/tooltip";

afterEach(cleanup);

// Each entry renders a component in a representative state and asserts axe finds
// no violations. Add a row here when you ship a new interactive component.
// Render thunks (not bare JSX) keep these out of an iterable literal.
const cases: Array<[name: string, render: () => ReactElement]> = [
  ["Button", () => <Button>Subscribe</Button>],
  ["Button disabled", () => <Button disabled>Subscribe</Button>],
  ["Button ripple", () => <Button ripple>Subscribe</Button>],
  ["BloomMenu", () => <BloomMenu />],
  [
    "Switch",
    () => (
      <Switch checked={false} onCheckedChange={() => {}} label="Email notifications" />
    ),
  ],
  ["AnimatedBadge", () => <AnimatedBadge status="success">Live</AnimatedBadge>],
  [
    "SmoothScroll",
    () => (
      <SmoothScroll>
        <main>
          <h1>Page</h1>
          <p>Scrollable content.</p>
        </main>
      </SmoothScroll>
    ),
  ],
  ["ScrollProgress bar", () => <ScrollProgress />],
  ["ScrollProgress circle", () => <ScrollProgress variant="circle" />],
  [
    "Parallax",
    () => (
      <Parallax>
        <p>Drifting content.</p>
      </Parallax>
    ),
  ],
  ["ScrollTo", () => <ScrollTo to="#top">Back to top</ScrollTo>],
  ["RangeSlider", () => <RangeSlider defaultValue={40} aria-label="Volume" />],
  [
    "Checkbox",
    () => <Checkbox checked={false} onCheckedChange={() => {}} label="Accept terms" />,
  ],
  [
    "RadioGroup",
    () => (
      <RadioGroup defaultValue="a">
        <RadioGroupItem value="a" label="Option A" />
        <RadioGroupItem value="b" label="Option B" />
      </RadioGroup>
    ),
  ],
  [
    "ScrollReveal",
    () => (
      <ScrollReveal>
        <p>Revealed content.</p>
      </ScrollReveal>
    ),
  ],
  ["TextReveal", () => <TextReveal text="Ship it" />],
  [
    "Tooltip",
    () => (
      <Tooltip content="More info">
        <button type="button">Hover me</button>
      </Tooltip>
    ),
  ],
  [
    "Tabs",
    () => (
      <Tabs defaultValue="one">
        <TabsList>
          <TabsTrigger value="one">One</TabsTrigger>
          <TabsTrigger value="two">Two</TabsTrigger>
        </TabsList>
        <TabsContent value="one">First panel</TabsContent>
        <TabsContent value="two">Second panel</TabsContent>
      </Tabs>
    ),
  ],
];

describe("accessibility", () => {
  for (const [name, renderCase] of cases) {
    test(`${name} has no axe violations`, async () => {
      const { container } = render(renderCase());
      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });
  }
});
