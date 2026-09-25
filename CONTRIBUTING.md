# Contributing

beUI is a React, TypeScript, Framer Motion and Tailwind CSS component library.

## Before You Open a PR

Run the project checks:

```bash
bun install
bun run check
bun test
```

`bun run check` runs TypeScript, Biome lint, and registry source validation. `bun test` runs the accessibility suite.

## Testing policy

The automated test suite is accessibility-only. Add or update audits in `tests/a11y.test.tsx` or focused `tests/*.a11y.test.tsx` files using the shared `tests/setup.ts`. Cover meaningful accessible states, including open overlays where relevant, without duplicating existing cases.

Do not add general unit, interaction, calculation, snapshot, styling, or animation-timing tests unless a maintainer explicitly requests them. Typechecking, linting, and registry validation remain required.

Check changed interactions and visual behavior in the browser: keyboard navigation and focus, touch where applicable, responsive layouts, reduced motion, and enter/exit animations. Axe checks do not prove complete accessibility or visual quality. Include the checks you performed and any unverified behavior in your PR description.

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

Agents working in this repository should follow [`skills/beui/SKILL.md`](./skills/beui/SKILL.md) and `AGENTS.md`.
