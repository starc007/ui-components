export type OrbFrame = {
  activity: number;
  colors: readonly [string, string, string];
  speed: number;
  animated: boolean;
};

const VERTEX = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// A sphere normal provides the lighting and rim. Slowly advected noise bends
// the pigment and a broad specular ribbon; screen-space grain stays stationary.
const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_activity;
uniform vec3 u_base;
uniform vec3 u_light;
uniform vec3 u_dark;

float hash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                 mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                 mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p) {
  return noise(p) * 0.57 + noise(p * 2.03 + 7.2) * 0.28 + noise(p * 4.07 + 3.1) * 0.15;
}
void main() {
  vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
  p /= 0.94;
  float r2 = dot(p, p);
  float aa = 3.0 / min(u_resolution.x, u_resolution.y);
  float alpha = 1.0 - smoothstep(1.0 - aa, 1.0, r2);
  if (alpha <= 0.0) { gl_FragColor = vec4(0.0); return; }
  vec3 normal = vec3(p, sqrt(max(0.0, 1.0 - r2)));
  float t = u_time * 0.22;
  vec3 flow = vec3(normal.xy * 1.9, normal.z * 1.5 + t);
  float pigment = fbm(flow + vec3(sin(t * 0.8), cos(t * 0.6), 0.0));
  float shadow = smoothstep(0.15, 0.70, -normal.x * 0.65 + normal.y * 0.55 + (pigment - 0.5) * 0.45);
  vec3 color = mix(u_base, u_dark, shadow * 0.94);
  color = mix(color, u_light, smoothstep(0.38, 0.83, pigment) * 0.28);
  float diffuse = max(0.0, dot(normal, normalize(vec3(-0.4, 0.65, 1.0))));
  color *= 0.57 + 0.49 * diffuse;
  float ribbon = normal.x * 0.65 + normal.y * 0.47 + sin(normal.y * 2.0 + t) * 0.22 + (pigment - 0.5) * 0.45;
  float shine = exp(-pow((ribbon + 0.10) * 7.0, 2.0)) * pow(normal.z, 0.5);
  color = mix(color, mix(u_light, vec3(1.0), 0.7), shine * (0.85 + u_activity * 0.10));
  float rim = pow(1.0 - normal.z, 3.0);
  color = mix(color, u_light, rim * (0.36 + 0.25 * max(0.0, -normal.x)));
  float grain = hash(vec3(gl_FragCoord.xy, 1.0)) - 0.5;
  color += grain * 0.055;
  gl_FragColor = vec4(clamp(color, 0.0, 1.0), alpha);
}
`;

function rgb(hex: string) {
  const short = /^#([\da-f])([\da-f])([\da-f])$/i.exec(hex);
  const normalized = short
    ? `#${short[1]}${short[1]}${short[2]}${short[2]}${short[3]}${short[3]}`
    : hex;
  if (!/^#[\da-f]{6}$/i.test(normalized))
    throw new Error("VoiceOrb colors must be #RGB or #RRGGBB hex colors.");
  const value = Number.parseInt(normalized.slice(1), 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ] as const;
}

/** Owns only GPU resources and draw scheduling; it never opens an audio source. */
export function createOrbRenderer(
  canvas: HTMLCanvasElement,
  read: () => OrbFrame,
  onError: (error: Error) => void,
) {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: false,
    powerPreference: "low-power",
  });
  if (!gl) throw new Error("WebGL is unavailable in this browser.");
  let disposed = false;
  let frame = 0;
  let elapsed = 0;
  let previous = 0;
  let visible = true;
  let lost = false;
  let failed = false;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;
  let shaders: WebGLShader[] = [];
  let uniforms: Record<string, WebGLUniformLocation | null> = {};
  let palette: OrbFrame["colors"] | null = null;
  let size = { width: canvas.clientWidth, height: canvas.clientHeight };

  const destroy = () => {
    if (buffer) gl.deleteBuffer(buffer);
    if (program) gl.deleteProgram(program);
    for (const shader of shaders) gl.deleteShader(shader);
    buffer = null;
    program = null;
    shaders = [];
  };
  const initialize = () => {
    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not allocate an orb shader.");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(
          gl.getShaderInfoLog(shader) || "Could not compile the orb shader.",
        );
      return shader;
    };
    const vertex = compile(gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl.FRAGMENT_SHADER, FRAGMENT);
    program = gl.createProgram();
    if (!program) throw new Error("Could not allocate the orb program.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(
        gl.getProgramInfoLog(program) || "Could not link the orb program.",
      );
    // biome-ignore lint/correctness/useHookAtTopLevel: WebGL's useProgram is a GPU API, not a React hook.
    gl.useProgram(program);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("Could not allocate the orb buffer.");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const attribute = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    uniforms = Object.fromEntries(
      [
        "u_resolution",
        "u_time",
        "u_activity",
        "u_base",
        "u_light",
        "u_dark",
      ].map((name) => [
        name,
        gl.getUniformLocation(program as WebGLProgram, name),
      ]),
    );
    palette = null;
  };

  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
  };
  const draw = (now: number) => {
    frame = 0;
    if (disposed || lost || !visible || document.hidden) {
      previous = 0;
      return;
    }
    try {
      const state = read();
      if (state.animated && previous)
        elapsed +=
          Math.min(0.05, (now - previous) / 1000) *
          state.speed *
          (1 + state.activity * 0.6);
      previous = state.animated ? now : 0;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(size.width * dpr));
      const height = Math.max(1, Math.round(size.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, width, height);
      gl.uniform2f(uniforms.u_resolution ?? null, width, height);
      gl.uniform1f(uniforms.u_time ?? null, elapsed);
      gl.uniform1f(uniforms.u_activity ?? null, state.activity);
      if (
        !palette ||
        palette.some((color, index) => color !== state.colors[index])
      ) {
        const colors = state.colors.map(rgb);
        gl.uniform3fv(uniforms.u_base ?? null, colors[0]);
        gl.uniform3fv(uniforms.u_light ?? null, colors[1]);
        gl.uniform3fv(uniforms.u_dark ?? null, colors[2]);
        palette = state.colors;
      }
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (state.animated) frame = requestAnimationFrame(draw);
    } catch (error) {
      failed = true;
      pause();
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  };
  const requestDraw = () => {
    if (!disposed && !lost && !failed && visible && !document.hidden && !frame)
      frame = requestAnimationFrame(draw);
  };
  const visibility = () => {
    if (document.hidden) pause();
    else requestDraw();
  };
  const contextLost = (event: Event) => {
    event.preventDefault();
    lost = true;
    pause();
  };
  const contextRestored = () => {
    try {
      destroy();
      initialize();
      lost = false;
      requestDraw();
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  };
  try {
    initialize();
  } catch (error) {
    destroy();
    throw error;
  }
  const resize = new ResizeObserver(([entry]) => {
    if (entry)
      size = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
    requestDraw();
  });
  resize.observe(canvas);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) requestDraw();
    else pause();
  });
  intersection.observe(canvas);
  canvas.addEventListener("webglcontextlost", contextLost);
  canvas.addEventListener("webglcontextrestored", contextRestored);
  document.addEventListener("visibilitychange", visibility);
  requestDraw();
  return {
    requestDraw,
    dispose: () => {
      disposed = true;
      pause();
      resize.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("webglcontextlost", contextLost);
      canvas.removeEventListener("webglcontextrestored", contextRestored);
      document.removeEventListener("visibilitychange", visibility);
      destroy();
    },
  };
}
