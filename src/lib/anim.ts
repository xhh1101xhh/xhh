import {Easing, interpolate, spring} from 'remotion';

export const FPS = 30;
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = lerp;

export const ease = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  inQuad: (t: number) => t * t,
  outBack: Easing.bezier(0.34, 1.56, 0.64, 1),
  soft: Easing.bezier(0.45, 0.05, 0.55, 0.95),
};

/** 0..1 progress of frame between a and b with easing */
export const prog = (frame: number, a: number, b: number, e: (t: number) => number = ease.inOut) =>
  e(clamp((frame - a) / Math.max(1, b - a)));

/** piecewise keyframes [[frame, value], ...] with per-segment easing */
export const kf = (frame: number, keys: [number, number][], e: (t: number) => number = ease.inOut) => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, v0] = keys[i];
    const [f1, v1] = keys[i + 1];
    if (frame <= f1) return lerp(v0, v1, e(clamp((frame - f0) / Math.max(1, f1 - f0))));
  }
  return keys[keys.length - 1][1];
};

/** spring 0..1 starting at frame `at` */
export const spr = (frame: number, at: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  frame < at ? 0 : spring({frame: frame - at, fps: FPS, config: {damping: cfg.damping ?? 14, stiffness: cfg.stiffness ?? 120, mass: cfg.mass ?? 1}});

/** chain of spring transitions between values: steps [[frame, value], ...]; each step springs from the
 *  current (possibly mid-flight) value, so retargeting never jumps. */
export const springChain = (frame: number, steps: [number, number][], cfg?: Parameters<typeof spr>[2]) => {
  let v = steps[0][1];
  for (let i = 1; i < steps.length; i++) {
    const [at, target] = steps[i];
    if (frame < at) break;
    const start = valueAt(steps, i - 1, at, cfg);
    v = lerp(start, target, spr(frame, at, cfg));
  }
  return v;
};
const valueAt = (steps: [number, number][], idx: number, frame: number, cfg?: Parameters<typeof spr>[2]): number => {
  if (idx === 0) return steps[0][1];
  const [at, target] = steps[idx];
  const start = valueAt(steps, idx - 1, at, cfg);
  return lerp(start, target, spr(frame, at, cfg));
};

/** smooth value noise in [-1, 1] */
export const noise1 = (x: number, seed = 0) => {
  const h = (n: number) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u);
};

/** decaying shake offset after an impact frame */
export const shake = (frame: number, at: number, amp = 14, dur = 18, seed = 1) => {
  if (frame < at || frame > at + dur) return {x: 0, y: 0, r: 0};
  const k = 1 - (frame - at) / dur;
  const d = k * k;
  return {x: noise1((frame - at) * 0.9, seed) * amp * d, y: noise1((frame - at) * 0.9, seed + 7) * amp * d, r: noise1((frame - at) * 0.7, seed + 3) * 0.6 * d};
};

/** pulse 0..1 that peaks at `at` and decays (for beat accents) */
export const pulse = (frame: number, at: number, decay = 8) => (frame < at ? 0 : Math.exp(-(frame - at) / decay));

export const interp = (frame: number, inR: number[], outR: number[]) =>
  interpolate(frame, inR, outR, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
