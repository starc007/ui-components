"use client";

import {
  animate,
  cubicBezier,
  type HTMLMotionProps,
  type MotionValue,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
} from "motion/react";
import {
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { EASE_OUT, SPRING_PRESS } from "@/lib/ease";
import { focusFirstIn } from "@/lib/focusable";
import { cn } from "@/lib/utils";

export type WaveRevealType = "vertical" | "horizontal" | "center";

export interface WaveRevealProps
  extends Omit<
    HTMLMotionProps<"div">,
    "children" | "style" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"
  > {
  /** The first screen, shown while `revealed` is false. */
  children: ReactNode;
  /** The screen the wave carries in when `revealed` turns true. */
  revealedContent: ReactNode;
  /** Which screen shows. Flip it to play the wave; flipping it back plays the wave again toward the first screen. */
  revealed: boolean;
  /** Shape of the wave front: a wide arc that travels up or down, a tall arc that travels sideways, or a ring from the centre. Default: "vertical" */
  type?: WaveRevealType;
  /** Element the wave leaves from, such as the confirm button. Without it the wave leaves from the last press inside, else from the bottom edge, the left edge or the centre. */
  sourceRef?: RefObject<HTMLElement | null>;
  /** Time the wave takes to cross the screen, in seconds. A short gather before it and the fading edge glow after it add about 1.3s. Default: 1.6 */
  duration?: number;
  /** Colours of the wave and the glow it leaves on the edges, any CSS colour. Default: amber, sky, pink, peach and cyan */
  colors?: string[];
  /** How far the wave swells the screen under it, in px. 0 turns the swell off. Default: 26 */
  distortion?: number;
  /** Called when a wave finishes, with the `revealed` value it carried in. */
  onRevealComplete?: (revealed: boolean) => void;
}

const DEFAULT_COLORS = ["#ffc915", "#7ec4ff", "#eb64a0", "#ffb07a", "#7fd9ee"];
/** Tints laid over the palette just ahead of the front and deep in its tail. */
const AHEAD = "rgb(255 122 182 / 0.55)";
const BEHIND = "rgb(90 190 255 / 0.5)";

/** Anticipation: the screen pulls toward the source and gathers light there. */
const GATHER_S = 0.42;
/** How long the edge glow stays after the front has left, fading out. */
const LINGER_S = 0.9;
const REDUCED_S = 0.2;
/** How far the screen pulls in toward the source while it gathers. */
const PULL = 0.962;

/** Width of the soft seam between the two screens, in px. */
const SEAM = 24;
/** Colour reaching ahead of the front, in px. */
const LEAD = 110;
/** Colour trailing behind the front, in px. */
const TAIL = 280;
/** Extra travel past the farthest corner so the colour fully leaves. */
const OVERSHOOT = 140;
/** Width of the glow the wave leaves on the edges, in px. */
const RIM = 18;
/** How much wider (vertical) or taller (horizontal) the arc is than it is deep. */
const ARC = 1.45;
/** Backdrop blur under the front, in px. */
const BLUR = 8;
/** Where the front sits in the lens map, as a share of its radius. */
const LENS_FRONT = 0.8;
const DOTS = 26;
/** Sparks thrown off the front as it travels. */
const SPARKS = 44;
const SPARK_LIFE_S = 0.9;
/** How far the front ripples either way, in px. */
const RIPPLE = 18;
/** The colour layers reach this far past the card, so the ripple never pulls in a bare edge. */
const PAD = 24;
const NOISE_PERIOD = 1024;
const NOISE_SPAN = 2048;

// The front leaves briskly and eases as it reaches the far edge, like a wave
// spreading from a touch. EASE_OUT reaches the edge too soon for a sweep this
// long; EASE_IN_OUT stalls at the start.
const WAVE_EASE = cubicBezier(0.3, 0.1, 0.3, 1);

type Run = { id: number; target: boolean };
type Dot = { angle: number; reach: number; delay: number; size: number; color: string };
type Spark = { at: number; angle: number; drift: number; size: number; color: string };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smooth = (edge0: number, edge1: number, value: number) => {
  const x = clamp01((value - edge0) / (edge1 - edge0));
  return x * x * (3 - 2 * x);
};

/**
 * The swell as a displacement map: red and green carry the inward direction,
 * scaled by a bump centred on the front (at LENS_FRONT of the radius),
 * narrow ahead of it and wider behind. The filter stretches it over the
 * wave's ellipse every frame.
 */
let lensMap: string | null = null;
function getLensMap() {
  if (lensMap || typeof document === "undefined") return lensMap;
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const nx = ((x + 0.5) / size) * 2 - 1;
      const ny = ((y + 0.5) / size) * 2 - 1;
      const d = Math.hypot(nx, ny);
      const u = (d - LENS_FRONT) / (d > LENS_FRONT ? 0.07 : 0.17);
      const lift = d < 1 ? Math.exp(-u * u) : 0;
      const ux = d > 0 ? nx / d : 0;
      const uy = d > 0 ? ny / d : 0;
      const i = (y * size + x) * 4;
      image.data[i] = 128 - 127 * ux * lift;
      image.data[i + 1] = 128 - 127 * uy * lift;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  lensMap = canvas.toDataURL();
  return lensMap;
}

/**
 * Slow, smooth noise that tiles every NOISE_PERIOD px, as a displacement map.
 * Sliding it under the colour makes the front ripple the way a real wave's
 * crest does instead of staying a perfect ellipse.
 */
let noiseMap: string | null = null;
function getNoiseMap() {
  if (noiseMap || typeof document === "undefined") return noiseMap;
  const size = NOISE_SPAN / 8;
  const period = NOISE_PERIOD / 8;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(size, size);
  const turn = (Math.PI * 2) / period;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const r = 0.6 * Math.sin(turn * (x + y) + 1.3) + 0.4 * Math.sin(turn * (2 * x - y) + 4.1);
      const g = 0.6 * Math.sin(turn * (x - y) + 2.2) + 0.4 * Math.sin(turn * (x + 2 * y) + 0.7);
      const i = (y * size + x) * 4;
      image.data[i] = 128 + 127 * r;
      image.data[i + 1] = 128 + 127 * g;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  noiseMap = canvas.toDataURL();
  return noiseMap;
}

/** The palette as gradient stops that wrap seamlessly, repeated `times` over. */
function loop(colors: string[], times = 1) {
  const list = colors.length > 0 ? colors : DEFAULT_COLORS;
  return [...Array.from({ length: times }, () => list).flat(), list[0]].join(", ");
}

/** A radial gradient on the wave's ellipse; stops are px from the front, + ahead. */
function ellipseGradient(
  rx: number,
  ry: number,
  ox: number,
  oy: number,
  ax: number,
  stops: [number, string][],
) {
  const list = stops
    .map(([offset, color]) => `${color} ${(rx + offset * ax).toFixed(1)}px`)
    .join(", ");
  return `radial-gradient(${rx.toFixed(1)}px ${ry.toFixed(1)}px at ${ox.toFixed(1)}px ${oy.toFixed(1)}px, ${list})`;
}

const a = (alpha: number) => `rgb(0 0 0 / ${alpha})`;

export function WaveReveal({
  children,
  revealedContent,
  revealed,
  type = "vertical",
  sourceRef,
  duration = 1.6,
  colors = DEFAULT_COLORS,
  distortion = 26,
  onRevealComplete,
  className,
  onPointerDownCapture,
  ...props
}: WaveRevealProps) {
  const reduce = useReducedMotion() ?? false;
  const filterId = `wave-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

  // `shown` is the settled screen; a run carries the other one in on top.
  const [shown, setShown] = useState(revealed);
  const [run, setRun] = useState<Run | null>(null);
  const [lastRevealed, setLastRevealed] = useState(revealed);
  if (revealed !== lastRevealed) {
    setLastRevealed(revealed);
    setRun((current) => ({ id: (current?.id ?? 0) + 1, target: revealed }));
  }
  const target = run ? run.target : shown;

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const layerRefs = useRef<(HTMLDivElement | null)[]>([null, null]);
  const imageRef = useRef<SVGFEImageElement>(null);
  const displaceRefs = useRef<(SVGFEDisplacementMapElement | null)[]>([null, null, null]);
  const pressRef = useRef<{ x: number; y: number; at: number } | null>(null);
  const dotsRef = useRef<Dot[]>([]);
  const sparksRef = useRef<Spark[]>([]);
  const noiseRef = useRef<SVGFEImageElement>(null);
  const completeRef = useRef(onRevealComplete);
  const colorsRef = useRef(colors);
  useLayoutEffect(() => {
    completeRef.current = onRevealComplete;
    colorsRef.current = colors;
  });
  const [map, setMap] = useState<string | null>(null);
  const [noise, setNoise] = useState<string | null>(null);
  useEffect(() => {
    setMap(getLensMap());
    setNoise(getNoiseMap());
  }, []);

  // Geometry of the current run, in px from the stage's top-left corner.
  const ox = useMotionValue(0);
  const oy = useMotionValue(0);
  const ax = useMotionValue(ARC);
  const ay = useMotionValue(1);
  const reach = useMotionValue(1);
  const travel = useMotionValue(duration);
  // Seconds since the run began: gather, then travel, then linger.
  const t = useMotionValue(0);
  const fade = useMotionValue(1);
  const scale = useMotionValue(1);

  const progress = useTransform(() => clamp01((t.get() - GATHER_S) / travel.get()));
  const front = useTransform(() => WAVE_EASE(progress.get()));
  const radius = useTransform(() => Math.max(0.5, front.get() * reach.get()));
  const rx = useTransform(() => radius.get() * ax.get());
  const ry = useTransform(() => radius.get() * ay.get());
  const released = useTransform(() => smooth(GATHER_S, GATHER_S + 0.14, t.get()));
  const bandOpacity = useTransform(() => released.get() * (1 - smooth(0.62, 1, progress.get())));
  // The core only lights once the front has room, so the first frames are not a white disc.
  const coreOpacity = useTransform(() => bandOpacity.get() * smooth(24, 110, radius.get()));
  const energy = useTransform(() => released.get() * (1 - smooth(0.45, 1, progress.get())));
  const rimOpacity = useTransform(
    () => released.get() * (1 - smooth(0, LINGER_S, t.get() - GATHER_S - travel.get())),
  );
  const gatherOpacity = useTransform(
    () => 0.55 * smooth(0, GATHER_S, t.get()) * (1 - smooth(GATHER_S, GATHER_S + 0.3, t.get())),
  );
  const gatherScale = useTransform(() => 0.55 + 0.45 * smooth(0, GATHER_S, t.get()));

  const shape = (stops: [number, string][], pad = 0) =>
    ellipseGradient(rx.get(), ry.get(), ox.get() + pad, oy.get() + pad, ax.get(), stops);

  const insideMask = useTransform(() => shape([[-SEAM, "#000"], [0, "transparent"]]));
  const outsideMask = useTransform(() => shape([[-SEAM, "transparent"], [0, "#000"]]));
  // The colour is strongest toward the card's edges and lighter over its middle,
  // so the content stays readable through the wave.
  const bandMask = useTransform(
    () =>
      `${shape(
        [
          [-TAIL, a(0)],
          [-TAIL * 0.72, a(0.14)],
          [-TAIL * 0.42, a(0.45)],
          [-TAIL * 0.14, a(0.84)],
          [0, a(0.97)],
          [LEAD * 0.22, a(0.6)],
          [LEAD * 0.58, a(0.2)],
          [LEAD, a(0)],
        ],
        PAD,
      )}, radial-gradient(closest-side at 50% 50%, ${a(0.62)} 35%, #000 100%)`,
  );
  const coreMask = useTransform(() =>
    shape(
      [
        [-36, a(0)],
        [-10, a(0.55)],
        [2, a(0.8)],
        [14, a(0)],
      ],
      PAD,
    ),
  );
  const blurMask = useTransform(() =>
    shape([
      [-320, a(0)],
      [-230, a(0.2)],
      [-110, a(0.7)],
      [0, a(1)],
      [40, a(0.55)],
      [95, a(0)],
    ]),
  );
  const reached = useTransform(() =>
    shape([
      [LEAD * 0.25, "#000"],
      [LEAD * 0.7, "transparent"],
    ]),
  );
  const tints = useTransform(() =>
    shape(
      [
        [-160, "transparent"],
        [-84, BEHIND],
        [-24, "transparent"],
        [8, "transparent"],
        [32, AHEAD],
        [84, "transparent"],
      ],
      PAD,
    ),
  );
  const palette = loop(colors);
  const doubled = loop(colors, 2);
  // The colour flows along the front as it travels.
  const bandFill = useTransform(() => {
    const flow = ((t.get() * 9) % 100).toFixed(2);
    if (type === "center") {
      return `${tints.get()}, conic-gradient(from ${(t.get() * 40).toFixed(1)}deg at ${(ox.get() + PAD).toFixed(1)}px ${(oy.get() + PAD).toFixed(1)}px, ${palette})`;
    }
    const along = type === "vertical" ? `90deg` : `180deg`;
    const place = type === "vertical" ? `${flow}% 0 / 200% 100%` : `0 ${flow}% / 100% 200%`;
    return `${tints.get()}, linear-gradient(${along}, ${doubled}) ${place}`;
  });
  const rimFill = useTransform(
    () => `conic-gradient(from ${(t.get() * 55).toFixed(1)}deg at 50% 50%, ${palette})`,
  );
  const hairFill = useTransform(
    () => `linear-gradient(rgb(255 255 255 / 0.6), rgb(255 255 255 / 0.6)), ${rimFill.get()}`,
  );
  // Uneven rim: lumps of thickness that drift around the edge.
  const lumps = useTransform(
    () =>
      `conic-gradient(from ${(-t.get() * 25).toFixed(1)}deg at 50% 50%, ${a(0.35)}, #000 10%, ${a(0.5)} 24%, #000 41%, ${a(0.3)} 57%, #000 73%, ${a(0.55)} 86%, ${a(0.35)})`,
  );
  const rimMask = useTransform(
    () =>
      `${reached.get()}, ${lumps.get()}, linear-gradient(to right, #000, ${a(0.45)} ${RIM * 0.45}px, transparent ${RIM}px, transparent calc(100% - ${RIM}px), ${a(0.45)} calc(100% - ${RIM * 0.45}px), #000), linear-gradient(to bottom, #000, ${a(0.45)} ${RIM * 0.45}px, transparent ${RIM}px, transparent calc(100% - ${RIM}px), ${a(0.45)} calc(100% - ${RIM * 0.45}px), #000)`,
  );
  const hairMask = useTransform(
    () => `${reached.get()}, linear-gradient(#000, #000), linear-gradient(#000, #000)`,
  );
  const gatherFill = `radial-gradient(circle, rgb(255 255 255 / 0.9) 0%, ${colors[0] ?? DEFAULT_COLORS[0]} 22%, ${colors[2] ?? DEFAULT_COLORS[2]} 42%, transparent 70%)`;
  const transformOrigin = useTransform(() => `${ox.get()}px ${oy.get()}px`);
  const fadeIn = useTransform(fade, (value) => 1 - value);

  const distort = !reduce && distortion > 0 && map !== null && run !== null;

  // Drive the lens filter and the gathering dots from the same clock as the masks.
  useMotionValueEvent(t, "change", (time) => {
    if (distort) {
      const image = imageRef.current;
      const width = Math.max(1, (rx.get() * 2) / LENS_FRONT);
      const height = Math.max(1, (ry.get() * 2) / LENS_FRONT);
      if (image) {
        image.setAttribute("x", String(ox.get() - width / 2));
        image.setAttribute("y", String(oy.get() - height / 2));
        image.setAttribute("width", String(width));
        image.setAttribute("height", String(height));
      }
      const strength = energy.get() * distortion * 2;
      displaceRefs.current.forEach((node, index) => {
        node?.setAttribute("scale", String(strength * (0.72 + index * 0.28)));
      });
    }

    // Slide the ripple noise slowly, so the crest moves like water.
    const ripple = noiseRef.current;
    if (ripple) {
      ripple.setAttribute("x", String(-((time * 70) % NOISE_PERIOD)));
      ripple.setAttribute("y", String(-((time * 40) % NOISE_PERIOD)));
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const dpr = canvas.width / Math.max(1, canvas.offsetWidth);

    // Sparks thrown off the front: each leaves the crest where it is at its
    // birth, drifts a little further out and fades.
    for (const spark of sparksRef.current) {
      const age = time - spark.at;
      if (age <= 0 || age >= SPARK_LIFE_S) continue;
      const born = WAVE_EASE(clamp01((spark.at - GATHER_S) / travel.get())) * reach.get();
      const out = born + spark.drift * (1 - Math.exp(-age * 3));
      const x = ox.get() + Math.cos(spark.angle) * out * ax.get();
      const y = oy.get() + Math.sin(spark.angle) * out * ay.get();
      ctx.globalAlpha = Math.sin(Math.PI * (age / SPARK_LIFE_S)) * 0.9;
      ctx.fillStyle = spark.color;
      ctx.beginPath();
      ctx.arc(x * dpr, y * dpr, spark.size * dpr * (1 - (age / SPARK_LIFE_S) * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }

    if (time > GATHER_S + 0.1) return;
    for (const dot of dotsRef.current) {
      const span = GATHER_S - dot.delay;
      const k = clamp01((time - dot.delay) / span);
      if (k <= 0) continue;
      const eased = 1 - (1 - k) ** 3;
      const distance = dot.reach * (1 - eased);
      const x = ox.get() + Math.cos(dot.angle) * distance * ax.get();
      const y = oy.get() + Math.sin(dot.angle) * distance * ay.get();
      ctx.globalAlpha = Math.sin(Math.PI * k) * (1 - smooth(GATHER_S, GATHER_S + 0.1, time));
      ctx.fillStyle = dot.color;
      ctx.beginPath();
      ctx.arc(x * dpr, y * dpr, dot.size * dpr, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  useLayoutEffect(() => {
    if (!run) return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const width = stage.offsetWidth;
    const height = stage.offsetHeight;
    const zoom = rect.width > 0 ? width / rect.width : 1;

    let x = type === "horizontal" ? 0 : width / 2;
    let y = type === "vertical" ? height : height / 2;
    const source = sourceRef?.current;
    const press = pressRef.current;
    if (type !== "center" && source) {
      const box = source.getBoundingClientRect();
      x = (box.left + box.width / 2 - rect.left) * zoom;
      y = (box.top + box.height / 2 - rect.top) * zoom;
    } else if (type !== "center" && press && performance.now() - press.at < 1500) {
      x = (press.x - rect.left) * zoom;
      y = (press.y - rect.top) * zoom;
    }
    pressRef.current = null;

    const arcX = type === "vertical" ? ARC : 1;
    const arcY = type === "horizontal" ? ARC : 1;
    let far = 0;
    for (const [cx, cy] of [
      [0, 0],
      [width, 0],
      [0, height],
      [width, height],
    ]) {
      far = Math.max(far, Math.hypot((cx - x) / arcX, (cy - y) / arcY));
    }
    ox.set(x);
    oy.set(y);
    ax.set(arcX);
    ay.set(arcY);
    reach.set(far + OVERSHOOT);
    travel.set(duration);

    const palette = colorsRef.current.length > 0 ? colorsRef.current : DEFAULT_COLORS;
    dotsRef.current = Array.from({ length: DOTS }, (_, index) => ({
      angle: (index / DOTS) * Math.PI * 2 + Math.random() * 0.4,
      reach: 46 + Math.random() * 90,
      delay: Math.random() * GATHER_S * 0.45,
      size: 1 + Math.random() * 1,
      color: palette[index % palette.length],
    }));
    sparksRef.current = Array.from({ length: SPARKS }, (_, index) => ({
      at: GATHER_S + Math.random() * duration * 0.7,
      angle: Math.random() * Math.PI * 2,
      drift: 14 + Math.random() * 30,
      size: 0.7 + Math.random() * 1.1,
      color: index % 3 === 0 ? "#ffffff" : palette[index % palette.length],
    }));
    const canvas = canvasRef.current;
    if (canvas) {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }

    // Hand focus to the incoming screen when it was in the outgoing one.
    const incoming = layerRefs.current[run.target ? 1 : 0];
    const outgoing = layerRefs.current[run.target ? 0 : 1];
    if (outgoing?.contains(document.activeElement)) focusFirstIn(incoming);

    const finish = () => {
      setShown(run.target);
      setRun((current) => (current?.id === run.id ? null : current));
      completeRef.current?.(run.target);
    };

    if (reduce) {
      fade.set(1);
      const crossfade = animate(fade, 0, { duration: REDUCED_S, ease: "linear", onComplete: finish });
      return () => crossfade.stop();
    }

    t.set(0);
    const pull = animate(scale, PULL, {
      duration: GATHER_S,
      ease: EASE_OUT,
      onComplete: () => {
        animate(scale, 1, SPRING_PRESS);
      },
    });
    const clock = animate(t, GATHER_S + duration + LINGER_S, {
      duration: GATHER_S + duration + LINGER_S,
      ease: "linear",
      onComplete: finish,
    });
    return () => {
      pull.stop();
      clock.stop();
      scale.set(1);
    };
  }, [run, type, sourceRef, duration, reduce, ox, oy, ax, ay, reach, travel, t, fade, scale]);

  const layer = (index: 0 | 1, content: ReactNode) => {
    const isTarget = (index === 1) === target;
    const visible = isTarget || run !== null;
    const mask = run && !reduce ? (isTarget ? insideMask : outsideMask) : undefined;
    let opacity: MotionValue<number> | number = 1;
    if (run && reduce) opacity = isTarget ? fadeIn : fade;
    return (
      <motion.div
        ref={(node) => {
          layerRefs.current[index] = node;
        }}
        aria-hidden={isTarget ? undefined : true}
        inert={!isTarget}
        className={cn("[grid-area:1/1]", !visible && "invisible")}
        style={{ maskImage: mask, WebkitMaskImage: mask, opacity }}
      >
        {content}
      </motion.div>
    );
  };

  const wave = run !== null && !reduce;

  return (
    <motion.div
      className={cn("relative isolate overflow-hidden", className)}
      style={{ scale, transformOrigin }}
      onPointerDownCapture={(event) => {
        pressRef.current = { x: event.clientX, y: event.clientY, at: performance.now() };
        onPointerDownCapture?.(event);
      }}
      {...props}
    >
      <div
        ref={stageRef}
        className="grid"
        style={{ filter: distort ? `url(#${filterId})` : undefined }}
      >
        {layer(0, children)}
        {layer(1, revealedContent)}
      </div>

      {wave ? (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]">
          {/* Blur under the front, strongest at it and trailing far behind. */}
          <motion.div
            className="absolute inset-0"
            style={{
              backdropFilter: `blur(${BLUR}px)`,
              WebkitBackdropFilter: `blur(${BLUR}px)`,
              maskImage: blurMask,
              WebkitMaskImage: blurMask,
              opacity: bandOpacity,
            }}
          />
          {/* The colour, rippled by slow noise. Its own layer, so the ripple
              filter never becomes the backdrop root of the blur above. */}
          <div
            className="absolute"
            style={{
              inset: -PAD,
              filter: noise ? `url(#${filterId}-ripple)` : undefined,
            }}
          >
            {/* A soft lead ahead, a long tail behind. */}
            <motion.div
              className="absolute inset-0"
              style={{
                background: bandFill,
                maskImage: bandMask,
                WebkitMaskImage: bandMask,
                maskComposite: "intersect",
                opacity: bandOpacity,
              }}
            />
            {/* A bright core right at the front. */}
            <motion.div
              className="absolute inset-0 bg-white"
              style={{ maskImage: coreMask, WebkitMaskImage: coreMask, opacity: coreOpacity }}
            />
          </div>
          {/* The glow left on the edges, uneven and drifting, with a hairline. */}
          <motion.div
            className="absolute inset-0 rounded-[inherit]"
            style={{
              background: rimFill,
              maskImage: rimMask,
              maskComposite: "intersect, intersect, add",
              opacity: rimOpacity,
            }}
          />
          <motion.div
            className="absolute inset-0 rounded-[inherit] p-[1.5px]"
            style={{
              background: hairFill,
              maskImage: hairMask,
              maskClip: "border-box, content-box, border-box",
              maskComposite: "intersect, exclude",
              opacity: rimOpacity,
            }}
          />
          {/* Light gathering at the source before the wave leaves. */}
          <motion.div
            className="absolute size-28 -translate-x-1/2 -translate-y-1/2 rounded-full blur-[10px]"
            style={{ left: ox, top: oy, background: gatherFill, opacity: gatherOpacity, scale: gatherScale }}
          />
          <canvas ref={canvasRef} className="absolute inset-0 size-full" />
        </div>
      ) : null}

      {map ? (
        <svg aria-hidden="true" className="pointer-events-none absolute size-0" focusable="false">
          {noise ? (
            <filter
              id={`${filterId}-ripple`}
              x="0"
              y="0"
              width="100%"
              height="100%"
              colorInterpolationFilters="sRGB"
            >
              <feImage
                ref={noiseRef}
                href={noise}
                width={NOISE_SPAN}
                height={NOISE_SPAN}
                preserveAspectRatio="none"
                result="noise"
              />
              {/* Past the noise image, a still surface rather than a shift. */}
              <feFlood floodColor="rgb(128, 128, 128)" result="still" />
              <feComposite in="noise" in2="still" operator="over" result="ripple" />
              <feDisplacementMap
                in="SourceGraphic"
                in2="ripple"
                scale={RIPPLE * 2}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          ) : null}
          <filter
            id={filterId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodColor="rgb(128, 128, 128)" result="flat" />
            <feImage ref={imageRef} href={map} preserveAspectRatio="none" result="lens" />
            <feComposite in="lens" in2="flat" operator="over" result="map" />
            {(["r", "g", "b"] as const).map((channel, index) => (
              <feDisplacementMap
                key={channel}
                ref={(node) => {
                  displaceRefs.current[index] = node;
                }}
                in="SourceGraphic"
                in2="map"
                scale={0}
                xChannelSelector="R"
                yChannelSelector="G"
                result={`shift-${channel}`}
              />
            ))}
            <feColorMatrix
              in="shift-r"
              values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="only-r"
            />
            <feColorMatrix
              in="shift-g"
              values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
              result="only-g"
            />
            <feColorMatrix
              in="shift-b"
              values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
              result="only-b"
            />
            <feBlend in="only-r" in2="only-g" mode="screen" result="rg" />
            <feBlend in="rg" in2="only-b" mode="screen" />
          </filter>
        </svg>
      ) : null}
    </motion.div>
  );
}
