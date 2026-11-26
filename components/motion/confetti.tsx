/**
 * Confetti for success moments, called like a toast: `confetti()` from any
 * event handler, no provider, hook or element to mount.
 *
 * A burst draws on one shared canvas laid over the page. The canvas exists only
 * while pieces are in the air and is removed when the last one has fallen, so
 * nothing stays fixed over the viewport between bursts. Overlapping bursts
 * share it. With reduced motion, nothing is drawn.
 */

export interface ConfettiOptions {
  /** Where the burst starts: an element (from its centre) or a point in viewport px. Default: the centre of the viewport */
  origin?: Element | { x: number; y: number };
  /** How many pieces to throw. Default: 80 */
  count?: number;
  /** Piece colours, any CSS colour. Default: the theme's primary colour plus 5 warm and cool accents */
  colors?: string[];
  /** Direction of the throw in degrees: 90 is straight up, 0 is right. Default: 90 */
  angle?: number;
  /** How wide the throw fans out around `angle`, in degrees. Default: 70 */
  spread?: number;
  /** Launch speed multiplier: 0.5 is a small pop, 1.5 a big one. Default: 1 */
  power?: number;
}

type Piece = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  flip: number;
  flipSpeed: number;
  sway: number;
  swaySpeed: number;
  swayWidth: number;
  width: number;
  height: number;
  round: boolean;
  color: string;
  born: number;
  life: number;
};

const ACCENTS = ["#f97316", "#facc15", "#22c55e", "#38bdf8", "#f43f5e"];
// Paper physics, tuned per frame at 60 fps and scaled by real frame time so
// every screen plays the same. Strong air drag turns the launch into a quick
// pop that slows at once; with gravity it also caps the fall at a gentle
// terminal speed (GRAVITY × DRAG / (1 − DRAG), about 3.4 px a frame), so
// pieces drift down instead of dropping like stones.
const GRAVITY = 0.22;
const DRAG = 0.94;
// Launch speed in px a frame, before `power`.
const SPEED_MIN = 11;
const SPEED_RANGE = 9;
// Pieces leave over this many ms, not in one frame, so the burst blooms
// instead of starting as one dense dot.
const STAGGER_MS = 70;
const FADE_MS = 600;

let canvas: HTMLCanvasElement | null = null;
let context: CanvasRenderingContext2D | null = null;
let pieces: Piece[] = [];
let frame = 0;
let last = 0;
const settled: Array<() => void> = [];

function themeColors() {
  const primary = getComputedStyle(document.documentElement).getPropertyValue("--primary").trim();
  return primary ? [primary, ...ACCENTS] : ACCENTS;
}

function resolveOrigin(origin: ConfettiOptions["origin"]) {
  if (!origin) return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  if ("getBoundingClientRect" in origin) {
    const box = origin.getBoundingClientRect();
    return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  }
  return origin;
}

function mountCanvas() {
  if (canvas) return;
  canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "250",
  });
  document.body.appendChild(canvas);
  context = canvas.getContext("2d");
  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  if (!canvas || !context) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function unmountCanvas() {
  window.removeEventListener("resize", resize);
  canvas?.remove();
  canvas = null;
  context = null;
  for (const resolve of settled.splice(0)) resolve();
}

function tick(now: number) {
  const ctx = context;
  if (!ctx) return;
  // A frame's timestamp can be a little older than the moment the burst was
  // fired; never step backwards, and never leap after a stall.
  const step = Math.min(Math.max(0, (now - last) / (1000 / 60)), 3);
  last = Math.max(last, now);
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  pieces = pieces.filter((piece) => {
    const age = now - piece.born;
    // Not launched yet: keep it, draw nothing.
    if (age < 0) return true;
    if (age > piece.life || piece.y > window.innerHeight + 40) return false;
    const drag = DRAG ** step;
    piece.vx *= drag;
    piece.vy = piece.vy * drag + GRAVITY * step;
    // Paper sways side to side as it falls.
    piece.sway += piece.swaySpeed * step;
    piece.x += (piece.vx + Math.sin(piece.sway) * piece.swayWidth) * step;
    piece.y += piece.vy * step;
    piece.rotation += piece.spin * step;
    piece.flip += piece.flipSpeed * step;

    const fade = Math.min(1, (piece.life - age) / FADE_MS);
    ctx.save();
    ctx.globalAlpha = Math.max(0, fade);
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    // Turning about one axis: the piece narrows to an edge and back, which
    // reads as paper tumbling.
    ctx.scale(1, Math.cos(piece.flip));
    ctx.fillStyle = piece.color;
    if (piece.round) {
      ctx.beginPath();
      ctx.arc(0, 0, piece.width / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height);
    }
    ctx.restore();
    return true;
  });

  if (pieces.length) {
    frame = requestAnimationFrame(tick);
  } else {
    frame = 0;
    unmountCanvas();
  }
}

/**
 * Throws a burst of confetti and resolves when the last piece has gone.
 * Does nothing on the server or with reduced motion.
 */
export function confetti(options: ConfettiOptions = {}): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();

  const {
    origin,
    count = 80,
    colors = themeColors(),
    angle = 90,
    spread = 70,
    power = 1,
  } = options;
  const start = resolveOrigin(origin);
  const now = performance.now();

  mountCanvas();
  for (let index = 0; index < count; index++) {
    const direction = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
    const speed = (SPEED_MIN + Math.random() * SPEED_RANGE) * power;
    const width = 5 + Math.random() * 5;
    pieces.push({
      // A few px of scatter, so pieces do not all leave from one pixel.
      x: start.x + (Math.random() - 0.5) * 8,
      y: start.y + (Math.random() - 0.5) * 8,
      vx: Math.cos(direction) * speed,
      vy: -Math.sin(direction) * speed,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.24,
      flip: Math.random() * Math.PI,
      flipSpeed: 0.06 + Math.random() * 0.1,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.05 + Math.random() * 0.06,
      swayWidth: 0.4 + Math.random() * 0.7,
      width,
      height: width * (1.4 + Math.random() * 0.6),
      round: Math.random() < 0.25,
      color: colors[index % colors.length],
      born: now + Math.random() * STAGGER_MS,
      life: 2400 + Math.random() * 1000,
    });
  }

  const done = new Promise<void>((resolve) => settled.push(resolve));
  if (!frame) {
    last = now;
    frame = requestAnimationFrame(tick);
  }
  return done;
}
