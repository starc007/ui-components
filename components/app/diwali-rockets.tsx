"use client";

import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Seasonal: each increment of `launches` fires a rocket from the bottom of the
// screen that trails sparks, then bursts into a Diwali firework. One canvas
// draws every rocket; it mounts on the first launch and unmounts once the sky
// is empty, so nothing sits over the page between clicks.

type Rocket = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  fuse: number;
  palette: readonly string[];
};

type Spark = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  size: number;
  color: string;
  drag: number;
  gravity: number;
  crackle: boolean;
};

type Flash = { x: number; y: number; age: number };

const GRAVITY = 620;
const FLIGHT = 1.05;
const FLASH_LIFE = 0.28;

const PALETTES = [
  ["#fef3c7", "#fbbf24", "#f59e0b"],
  ["#fed7aa", "#f97316", "#fde68a"],
  ["#fecdd3", "#f43f5e", "#fde68a"],
  ["#bbf7d0", "#22c55e", "#fde68a"],
] as const;

const rand = (min: number, max: number) => min + Math.random() * (max - min);
const pick = <T,>(items: readonly T[]) =>
  items[Math.floor(Math.random() * items.length)];

function createRocket(width: number, height: number): Rocket {
  const x = width * rand(0.2, 0.8);
  const y = height + 12;
  const targetX = width * rand(0.3, 0.7);
  const targetY = height * rand(0.16, 0.34);
  // Launch velocity that reaches the target after FLIGHT seconds under gravity.
  return {
    x,
    y,
    vx: (targetX - x) / FLIGHT,
    vy: (targetY - y - 0.5 * GRAVITY * FLIGHT * FLIGHT) / FLIGHT,
    age: 0,
    fuse: FLIGHT,
    palette: pick(PALETTES),
  };
}

function burst(rocket: Rocket, sparks: Spark[], flashes: Flash[]) {
  flashes.push({ x: rocket.x, y: rocket.y, age: 0 });
  const count = 140;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-0.05, 0.05);
    // Half the sparks form a crisp ring, the rest fill the sphere.
    const speed = i % 2 ? 360 * rand(0.92, 1) : 360 * Math.sqrt(Math.random());
    sparks.push({
      x: rocket.x,
      y: rocket.y,
      px: rocket.x,
      py: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: rand(1.1, 1.7),
      size: rand(1.4, 2.4),
      color: pick(rocket.palette),
      drag: 1.7,
      gravity: 160,
      crackle: Math.random() < 0.25,
    });
  }
}

function trail(rocket: Rocket, sparks: Spark[]) {
  for (let i = 0; i < 2; i++) {
    sparks.push({
      x: rocket.x,
      y: rocket.y,
      px: rocket.x,
      py: rocket.y,
      vx: -rocket.vx * 0.08 + rand(-30, 30),
      vy: -rocket.vy * 0.08 + rand(-10, 30),
      age: 0,
      life: rand(0.35, 0.65),
      size: rand(1, 1.8),
      color: pick(["#fde68a", "#fbbf24", "#fb923c"]),
      drag: 2.5,
      gravity: 240,
      crackle: false,
    });
  }
}

function drawRocket(ctx: CanvasRenderingContext2D, rocket: Rocket) {
  ctx.save();
  ctx.translate(rocket.x, rocket.y);
  ctx.rotate(Math.atan2(rocket.vy, rocket.vx) + Math.PI / 2);
  // Stick trailing below the body.
  ctx.strokeStyle = "#a16207";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(0, 6);
  ctx.lineTo(0, 26);
  ctx.stroke();
  // Body, gold band and nose cone.
  ctx.fillStyle = "#dc2626";
  ctx.fillRect(-3, -8, 6, 14);
  ctx.fillStyle = "#fbbf24";
  ctx.fillRect(-3, -2, 6, 2.5);
  ctx.beginPath();
  ctx.moveTo(-3, -8);
  ctx.lineTo(0, -14);
  ctx.lineTo(3, -8);
  ctx.closePath();
  ctx.fill();
  // Exhaust glow.
  const glow = ctx.createRadialGradient(0, 7, 0, 0, 7, 9);
  glow.addColorStop(0, "rgba(254, 243, 199, 0.95)");
  glow.addColorStop(1, "rgba(249, 115, 22, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(0, 7, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function DiwaliRockets({ launches }: { launches: number }) {
  const reduceMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sky = useRef({
    rockets: [] as Rocket[],
    sparks: [] as Spark[],
    flashes: [] as Flash[],
  });
  // A fresh id per launch restarts the loop even if a run that just emptied
  // the sky hasn't committed its `null` yet, so no launch can be stranded.
  const [mounted, setMounted] = useState(false);

  // The loop is owned by the canvas element rather than an effect: it starts
  // whenever the canvas attaches (or a launch arrives while it's attached and
  // idle) and stops when it detaches, so no re-render can strand a rocket.
  const stopLoop = useRef<(() => void) | null>(null);
  const startLoop = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (stopLoop.current || !canvas || !ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      // Clamp the step so a backgrounded tab doesn't fling sparks on return.
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      const { rockets, sparks, flashes } = sky.current;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.age += dt;
        rocket.vy += GRAVITY * dt;
        rocket.x += (rocket.vx + Math.sin(rocket.age * 24) * 18) * dt;
        rocket.y += rocket.vy * dt;
        trail(rocket, sparks);
        if (rocket.age >= rocket.fuse) {
          burst(rocket, sparks, flashes);
          rockets.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const flash = flashes[i];
        flash.age += dt;
        if (flash.age >= FLASH_LIFE) {
          flashes.splice(i, 1);
          continue;
        }
        const fade = 1 - flash.age / FLASH_LIFE;
        const radius = 30 + 60 * (1 - fade);
        const glow = ctx.createRadialGradient(
          flash.x,
          flash.y,
          0,
          flash.x,
          flash.y,
          radius,
        );
        glow.addColorStop(0, `rgba(254, 243, 199, ${0.7 * fade})`);
        glow.addColorStop(1, "rgba(251, 191, 36, 0)");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        spark.age += dt;
        if (spark.age >= spark.life) {
          sparks.splice(i, 1);
          continue;
        }
        const damping = Math.exp(-spark.drag * dt);
        spark.vx *= damping;
        spark.vy = spark.vy * damping + spark.gravity * dt;
        spark.px = spark.x;
        spark.py = spark.y;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;

        const progress = spark.age / spark.life;
        let alpha = 1 - progress * progress;
        if (spark.crackle && progress > 0.45) alpha *= Math.random() < 0.5 ? 1 : 0.15;
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = spark.color;
        ctx.lineWidth = spark.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(spark.px, spark.py);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      for (const rocket of rockets) drawRocket(ctx, rocket);

      if (rockets.length || sparks.length || flashes.length) {
        frame = requestAnimationFrame(tick);
      } else {
        stop();
        setMounted(false);
      }
    };
    frame = requestAnimationFrame(tick);

    const stop = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      stopLoop.current = null;
    };
    stopLoop.current = stop;
  }, []);

  const attachCanvas = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      canvasRef.current = canvas;
      if (canvas) startLoop();
      else stopLoop.current?.();
    },
    [startLoop],
  );

  useEffect(() => {
    if (launches === 0 || reduceMotion) return;
    sky.current.rockets.push(createRocket(window.innerWidth, window.innerHeight));
    setMounted(true);
    startLoop();
  }, [launches, reduceMotion, startLoop]);

  if (!mounted) return null;
  return createPortal(
    <canvas
      ref={attachCanvas}
      className="pointer-events-none fixed inset-0 z-[60] h-full w-full"
    />,
    document.body,
  );
}
