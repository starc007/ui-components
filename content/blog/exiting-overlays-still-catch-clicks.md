---
title: "Your closing modal is still eating clicks"
description: "An overlay animating out with AnimatePresence is still the top layer for its whole exit. Here is why gating on open misses it, and the fix with useIsPresent and inert."
publishedAt: 2026-11-16
tags: react, framermotion, animation, accessibility
product: beui
draft: false
devto: https://dev.to/saurra3h/your-closing-modal-is-still-eating-clicks-kig
medium: https://saurra3h.medium.com/your-closing-modal-is-still-eating-clicks-bbe8c01782bf
---

You close a modal. The exit animation plays for 200ms. During those 200ms the user clicks the button behind it. Nothing happens.

The modal is fading out, so it looks gone. But it is still in the DOM, still on top, still catching the click.

This is one of the most common bugs in animated overlays, and almost every Framer Motion modal tutorial has it.

## Why it happens

`AnimatePresence` keeps a child mounted after you remove it, so it can play the `exit` animation. That is the whole point. But "mounted" means the full overlay: the backdrop, the panel, the focus trap, everything.

So for the length of the exit:

- the backdrop still covers the page and swallows pointer events
- the dialog is still in the tab order, so focus can land in it
- screen readers still see a dialog that is already closing

Most code gates interaction on `open`:

```tsx title="modal.tsx"
<AnimatePresence>
  {open && (
    <motion.div
      className="fixed inset-0 bg-black/40"
      style={{ pointerEvents: open ? "auto" : "none" }}
      exit={{ opacity: 0 }}
    />
  )}
</AnimatePresence>
```

That check never works. When `open` is false, this element is not rendered with new props anymore. `AnimatePresence` keeps the last render, the one where `open` was true, and animates it out. The `pointerEvents: "auto"` is frozen in.

## The boolean that knows

Framer Motion already tracks this. `useIsPresent()` returns `false` from the moment a child starts its exit. The catch: it only works inside the `AnimatePresence` subtree, one component below it.

So read it in a small child component, and pass it down:

```tsx title="presence-gate.tsx"
import { useIsPresent } from "motion/react";
import type { ReactNode } from "react";

export function PresenceGate({
  children,
}: {
  children: (gate: { inert: boolean; style: { pointerEvents: "auto" | "none" } }) => ReactNode;
}) {
  const isPresent = useIsPresent();
  return children({
    inert: !isPresent,
    style: { pointerEvents: isPresent ? "auto" : "none" },
  });
}
```

Then spread the gate onto every layer that takes pointer events:

```tsx title="modal.tsx"
<AnimatePresence>
  {open && (
    <PresenceGate>
      {(gate) => (
        <>
          <motion.div {...gate} className="fixed inset-0 bg-black/40" exit={{ opacity: 0 }} />
          <motion.div {...gate} role="dialog" aria-modal="true" exit={{ opacity: 0, y: 8 }}>
            ...
          </motion.div>
        </>
      )}
    </PresenceGate>
  )}
</AnimatePresence>
```

## Why inert, not just pointer-events

`pointer-events: none` fixes the mouse. It does nothing for the keyboard or screen readers.

`inert` does all three in one attribute: no pointer events, out of the tab order, hidden from the accessibility tree. An exiting dialog is not a dialog anyone should still be able to type into.

Both flip in the same commit that starts the exit. The visual exit keeps playing. The page behind is usable instantly.

## The rule

Gate interaction on presence, not on `open`.

`open` tells you what the user wants. Presence tells you what is actually on screen and still in charge. During an exit those two disagree, and the page should follow the user.

Every overlay in [beUI](https://beui.dev) works this way: the [command palette](https://beui.dev/components/blocks/command-palette), [bottom sheet](https://beui.dev/components/motion/bottom-sheet) and [image viewer](https://beui.dev/components/motion/image-viewer) all release the page the moment they start closing. Install any of them with the shadcn CLI and the gate comes with it:

```bash
npx shadcn@latest add @beui/bottom-sheet
```
