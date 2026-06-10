# Contributing

beUI is a React, TypeScript, Motion and Tailwind CSS component library.

## Before You Open a PR

Run the project checks:

```bash
bun install
bun run check
```

`bun run check` typechecks the app and verifies every registry component can publish its source files.

## Motion Conventions

Every component follows the same motion language:

- Import easing curves and spring presets from `lib/ease.ts` (`EASE_OUT`, `SPRING_PRESS`, `SPRING_SWAP`, `SPRING_PANEL`, `SPRING_LAYOUT`, `SPRING_MOUSE`). Do not inline `cubic-bezier` values or one-off spring configs unless the tuning is genuinely component-specific, and leave a comment when it is.
- Gate transform-based motion behind `useReducedMotion()`. Reduced motion keeps opacity and color transitions for comprehension and drops movement.
- Gate decorative hover effects (magnetic pull, tilt) behind `useHoverCapable()` so touch devices never get sticky phantom-hover states.
- Animate `transform` and `opacity`; avoid animating layout properties. Keep blur under 10px and exits faster than entrances.

Internal imports are safe: the registry build follows `@/lib` and relative imports and bundles them with the component.

## Pull Requests

1. Open or comment on an issue before starting larger work.
2. Create a fork or feature branch.
3. Keep changes focused and include the component source, preview and registry entry together.
4. Open a pull request against `main`.
