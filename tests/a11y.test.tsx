import { afterEach, describe, expect, test } from "bun:test";
import { cleanup, render } from "@testing-library/react";
import { axe } from "jest-axe";
import type { ReactElement } from "react";

import { AnimatedBadge } from "@/components/motion/animated-badge";
import { BloomMenu } from "@/components/motion/bloom-menu";
import { BounceSidebar } from "@/components/motion/bounce-sidebar";
import { Button } from "@/components/motion/button";
import {
  CenterMorphModal,
  CenterMorphModalContent,
  CenterMorphModalTrigger,
} from "@/components/motion/center-morph-modal";
import { Checkbox } from "@/components/motion/checkbox";
import { ChromaticTextReveal } from "@/components/motion/chromatic-text-reveal";
import { CommandPalette } from "@/components/motion/command-palette";
import { Input } from "@/components/motion/input";
import { Marquee } from "@/components/motion/marquee";
import { MorphingModal } from "@/components/motion/morphing-modal";
import {
  KnockoutWheel,
  ROUNDS as KNOCKOUT_WHEEL_ROUNDS,
} from "@/components/motion/knockout-wheel";
import { Parallax } from "@/components/motion/parallax";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/motion/popover";
import { PullToRefresh } from "@/components/motion/pull-to-refresh";
import { RadioGroup, RadioGroupItem } from "@/components/motion/radio";
import { RangeSlider } from "@/components/motion/range-slider";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ScrollTo } from "@/components/motion/scroll-to";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/motion/select";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { Switch } from "@/components/motion/switch";
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
    "KnockoutWheel",
    () => <KnockoutWheel rounds={KNOCKOUT_WHEEL_ROUNDS} />,
  ],
  [
    "BounceSidebar",
    () => (
      <BounceSidebar
        defaultValue="components"
        items={[
          { id: "overview", label: "Overview" },
          { id: "components", label: "Components" },
          { id: "changelog", label: "Changelog" },
        ]}
      />
    ),
  ],
  [
    "ChromaticTextReveal",
    () => (
      <ChromaticTextReveal
        prefix="Make it feel"
        words={["alive.", "effortless."]}
      />
    ),
  ],
  [
    "CenterMorphModal",
    () => (
      <CenterMorphModal>
        <CenterMorphModalTrigger>
          <button type="button">Open profile</button>
        </CenterMorphModalTrigger>
        <CenterMorphModalContent ariaLabel="Profile details">
          <p>Profile details</p>
        </CenterMorphModalContent>
      </CenterMorphModal>
    ),
  ],
  [
    "Switch",
    () => (
      <Switch checked={false} onCheckedChange={() => {}} label="Email notifications" />
    ),
  ],
  ["AnimatedBadge", () => <AnimatedBadge status="success">Live</AnimatedBadge>],
  [
    "Popover",
    () => (
      <Popover>
        <PopoverTrigger>
          <Button>Open details</Button>
        </PopoverTrigger>
        <PopoverContent>Popover details</PopoverContent>
      </Popover>
    ),
  ],
  [
    "Marquee with interactive content",
    () => (
      <Marquee>
        <a href="/components">Browse components</a>
        <button type="button">Pause preview</button>
      </Marquee>
    ),
  ],
  [
    "CommandPalette closed",
    () => (
      <CommandPalette
        items={[
          {
            id: "docs",
            label: "Open documentation",
            onSelect: () => {},
          },
        ]}
      />
    ),
  ],
  [
    "Select closed",
    () => (
      <Select defaultValue="react">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="next">Next.js</SelectItem>
        </SelectContent>
      </Select>
    ),
  ],
  [
    "MorphingModal closed",
    () => (
      <MorphingModal viewId={null} onClose={() => {}}>
        <button type="button">Modal action</button>
      </MorphingModal>
    ),
  ],
  [
    "SmoothScroll",
    () => (
      <SmoothScroll>
        <div>
          <h1>Page</h1>
          <p>Scrollable content.</p>
        </div>
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
    "PullToRefresh",
    () => (
      <PullToRefresh onRefresh={() => {}}>
        <p>Refreshable content.</p>
      </PullToRefresh>
    ),
  ],
  [
    "Checkbox",
    () => <Checkbox checked={false} onCheckedChange={() => {}} label="Accept terms" />,
  ],
  ["Input", () => <Input label="Email" type="email" />],
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
      render(<main>{renderCase()}</main>);
      const results = await axe(document.body);
      expect(results.violations).toEqual([]);
    });
  }
});
