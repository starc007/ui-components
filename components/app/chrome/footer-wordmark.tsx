"use client";

import { useInView } from "motion/react";
import { lazy, type PointerEvent, Suspense, useRef } from "react";
import { EASE_OUT_CSS } from "@/lib/ease";
import { useHoverCapable } from "@/lib/hooks/use-hover-capable";

const WORD = "beUI";

const FooterShader = lazy(() =>
  import("./footer-shader").then((module) => ({ default: module.FooterShader })),
);

/**
 * The footer's closing wordmark: faint letters bleeding off the bottom edge
 * over a slow mesh gradient, with a soft light that follows the pointer and
 * lifts the letters under it. The pointer position lives in CSS variables, so
 * moving never re-renders. Touch screens have no hover, so they get the
 * letters and the gradient alone. The gradient mounts only near the viewport.
 */
export function FooterWordmark() {
  const zone = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLDivElement>(null);
  const near = useInView(zone, { margin: "200px 0px" });
  const canHover = useHoverCapable();

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--y", `${event.clientY - rect.top}px`);
  };

  const text =
    "block select-none text-center text-[clamp(7rem,30vw,22rem)] leading-[0.78] font-semibold tracking-[-0.06em]";

  return (
    <div ref={zone} aria-hidden="true" className="relative isolate">
      <div className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10">
        {near ? (
          <Suspense fallback={null}>
            <FooterShader />
          </Suspense>
        ) : null}
      </div>
      <div
        ref={ref}
        onPointerMove={canHover ? move : undefined}
        className="group relative mx-auto -mb-[0.14em] max-w-6xl overflow-hidden px-4 text-[clamp(7rem,30vw,22rem)]"
      >
        {/* Opaque fill, mixed from the page colours: the letters sit on top
            of the shader instead of letting its dots show through. */}
        <span
          className={`${text} relative bg-linear-to-b from-[color-mix(in_oklab,var(--foreground)_14%,var(--background))] to-[color-mix(in_oklab,var(--foreground)_5%,var(--background))] bg-clip-text text-transparent`}
        >
          {WORD}
        </span>
        {canHover ? (
          <span
            style={{
              transitionTimingFunction: EASE_OUT_CSS,
              maskImage: "radial-gradient(240px circle at var(--x) var(--y), black, transparent 70%)",
              WebkitMaskImage: "radial-gradient(240px circle at var(--x) var(--y), black, transparent 70%)",
            }}
            className={`${text} pointer-events-none absolute inset-x-4 top-0 bg-linear-to-b from-foreground/60 to-foreground/10 bg-clip-text text-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
          >
            {WORD}
          </span>
        ) : null}
      </div>
    </div>
  );
}
