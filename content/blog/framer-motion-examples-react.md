---
title: "7 Framer Motion Examples You Can Copy Into Your React App"
description: "Seven Framer Motion examples with code you can copy: sliding tabs, press feedback, exit animations, hold to confirm, rolling digits and morphing panels."
publishedAt: 2026-11-28
tags: react, framermotion, animation, webdev
product: beui
draft: false
devto: https://dev.to/saurra3h/7-framer-motion-examples-you-can-copy-into-your-react-app-4h66
medium: https://saurra3h.medium.com/7-framer-motion-examples-you-can-copy-into-your-react-app-220c09b508ae
---

Most Framer Motion examples online are a box that fades in. You will rarely ship that.

The motion people notice in real apps is smaller. A tab pill slides. A button gives a little under your finger. A toast leaves and the list closes the gap without jumping.

Here are seven Framer Motion examples for real React UI. Each one has a short snippet you can paste, and a link to the full component in [beUI](https://beui.dev) if you want the finished version with keyboard support and reduced motion handled.

All snippets import from `motion/react`, the current package name for Framer Motion.

## 1. Sliding tab indicator with layoutId

Render the indicator only inside the active tab and give it the same `layoutId` every time. When the active tab changes, Framer Motion sees one element that moved and animates it from the old box to the new one.

```tsx title="tabs.tsx"
"use client";

import { motion } from "motion/react";
import { useState } from "react";

const tabs = ["Overview", "Activity", "Settings"];

export function Tabs() {
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="flex gap-1 rounded-full border p-1">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActive(tab)}
          className="relative rounded-full px-3 py-1.5 text-sm"
        >
          {active === tab && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-full bg-primary/10"
              transition={{ type: "spring", stiffness: 460, damping: 30, mass: 0.55 }}
            />
          )}
          <span className="relative">{tab}</span>
        </button>
      ))}
    </div>
  );
}
```

One catch: a fixed `layoutId` string is shared across the whole page. Two tab bars on one page will fight over the same pill. Build the id with `useId()` per instance. The [beUI Tabs](https://beui.dev/components/motion/tabs) component does this, and adds pill, segment and underline styles, icons and arrow key navigation. The [animated tabs guide](https://beui.dev/guides/framer-motion-animated-tabs) goes deeper on the technique.

## 2. Press feedback with whileTap

A button that scales down a little on press feels physical. The trick is keeping it small and fast. Scale to 0.97 or 0.98, not 0.9, and use a stiff spring so it settles in about 100ms.

```tsx title="press-button.tsx"
"use client";

import { motion, useReducedMotion } from "motion/react";

export function PressButton({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      whileTap={reduce ? undefined : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30, mass: 0.6 }}
      className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground"
    >
      {children}
    </motion.button>
  );
}
```

That spring is the same press spring beUI uses across its buttons. See the variants on the [Button page](https://beui.dev/components/motion/button).

## 3. Exit animations in a list with AnimatePresence

Removing an item from a list is where most UIs snap. `AnimatePresence` keeps the removed item mounted while it plays `exit`. Add `layout` to each item and `mode="popLayout"` to the presence, and the items below slide up into the gap instead of jumping.

```tsx title="toast-list.tsx"
"use client";

import { AnimatePresence, motion } from "motion/react";

type Toast = { id: string; text: string };

export function ToastList({ toasts }: { toasts: Toast[] }) {
  return (
    <ul className="flex flex-col gap-2">
      <AnimatePresence mode="popLayout" initial={false}>
        {toasts.map((toast) => (
          <motion.li
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 24, transition: { duration: 0.15 } }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-2xl border px-4 py-3 text-sm"
          >
            {toast.text}
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
```

The exit (150ms) is faster than the entrance (220ms). A toast the user dismissed should not hang around. The [Animated Toast Stack](https://beui.dev/components/motion/animated-toast-stack) builds on this with stacking, status changes, actions and swipe to dismiss.

## 4. Hold to confirm button

For destructive actions, a hold is a nice middle ground between a plain click and a confirm dialog. A fill grows while the pointer is down, and the action runs only when the fill completes. Let go early and it drains back.

Writing this by hand means pointer events, keyboard holds, cancel on pointer leave and a linear fill timed to the hold. beUI ships it as a component:

```bash
npx shadcn@latest add @beui/hold-action-button
```

```tsx title="delete-project.tsx"
import { HoldActionButton } from "@/components/motion/hold-action-button";

export function DeleteProject({ onDelete }: { onDelete: () => void }) {
  return (
    <HoldActionButton
      holdDuration={1600}
      holdingLabel="Keep holding"
      completeLabel="Deleted"
      onHoldComplete={onDelete}
    >
      Hold to delete
    </HoldActionButton>
  );
}
```

It also has a `type` prop for a vertical or horizontal fill, and with reduced motion the fill fades instead of moving.

## 5. Rolling number digits

Prices, counters and stats read better when each digit rolls instead of the whole number swapping. Split the number into characters and give each one its own `AnimatePresence`, keyed by the digit.

```tsx title="digit.tsx"
"use client";

import { AnimatePresence, motion } from "motion/react";

export function Digit({ value }: { value: string }) {
  return (
    <span className="relative inline-flex h-[1lh] overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
```

Use `tabular-nums` so the width stays the same as digits change, or the text around it will shift. The [Number Animation page](https://beui.dev/components/motion/number) has three versions: Digit Swap, a slot machine style Number Ticker, and a count up that starts when it scrolls into view.

## 6. A gliding highlight in a menu

The tab trick works for hover too. Track which row is highlighted and render one `layoutId` highlight inside it. As the pointer or arrow keys move, the highlight glides between rows instead of blinking.

Two details matter here. Drive the highlight from the same state as keyboard focus, so mouse and keyboard never show two different rows. And scope the `layoutId` per menu level, so a submenu does not steal its parent's highlight. The [Dropdown Menu](https://beui.dev/components/motion/dropdown-menu) does both, with submenus, checkbox and radio items and shortcuts.

## 7. A panel that morphs between views

Multi-step modals often jump in size when the content changes. Put `layout` on the panel and Framer Motion animates the size change with transforms. Cross-fade the inner content with `AnimatePresence` and a small blur so the old and new views blend.

```tsx title="panel.tsx"
<motion.div layout className="overflow-hidden rounded-2xl border">
  <AnimatePresence mode="popLayout" initial={false}>
    <motion.div
      key={step}
      initial={{ opacity: 0, filter: "blur(4px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, filter: "blur(4px)" }}
    >
      {views[step]}
    </motion.div>
  </AnimatePresence>
</motion.div>
```

Keep blur at 10px or less. Large blurs get expensive, especially on phones. The [Morphing Modal](https://beui.dev/components/motion/morphing-modal) is the full version of this pattern.

## Framer Motion and reduced motion

Every example above should respect the "reduce motion" setting. A CSS media query will not stop a JS spring, so check `useReducedMotion()` and drop the movement: keep opacity and color changes, remove slides and scales. The [reduced motion guide](https://beui.dev/guides/reduced-motion-framer-motion) covers the pattern in more detail.

## FAQ

### Is Framer Motion the same as Motion?

Yes. Framer Motion was renamed to Motion, and the React API now imports from `motion/react`. The components and props in these examples are the same ones Framer Motion has had.

### How do I animate height in Framer Motion?

Use the `layout` prop rather than animating `height` directly. Framer Motion measures the new size and animates it with transforms, which is cheaper than animating a layout property every frame.

### Why does my exit animation not play?

The element must be a direct child of `AnimatePresence` and have a unique `key`. If you conditionally render `AnimatePresence` itself, it unmounts with the child and the exit never runs.

### Can I use these with shadcn/ui?

Yes. beUI is listed in the shadcn registry as `@beui`, so its components install with the same CLI into your project as plain source.

## Takeaway

You do not need big animations. Most of the feel comes from a shared `layoutId`, a stiff press spring, exits that are quicker than entrances, and a reduced motion fallback. Copy the snippets to start, or install the finished components and edit the source to fit your app.

Browse all of them at [beui.dev](https://beui.dev). To start with the tabs:

```bash
npx shadcn@latest add @beui/tabs
```
