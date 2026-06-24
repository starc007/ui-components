import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactElement } from "react";

import { AnimatedBadge } from "@/components/motion/animated-badge";
import { Button } from "@/components/motion/button";
import { Switch } from "@/components/motion/switch";
import { ScrollProgress } from "@/components/motion/scroll-progress";
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
