import {spring, interpolate, Easing} from 'remotion';
import {FPS} from '../data/beats';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = Easing.bezier(0.45, 0, 0.2, 1);
export const easeOut = Easing.bezier(0.16, 1, 0.3, 1);
export const easeIn = Easing.bezier(0.6, 0, 0.9, 0.4);

/** 0→1 缓动进度 */
export const prog = (f: number, a: number, b: number, ease: (t: number) => number = easeInOut) =>
  ease(clamp((f - a) / Math.max(1, b - a)));

/** remotion spring，起点为 start 帧 */
export const springAt = (f: number, start: number, cfg: {damping?: number; stiffness?: number; mass?: number} = {}) =>
  f < start ? 0 : spring({frame: f - start, fps: FPS, config: {damping: cfg.damping ?? 14, stiffness: cfg.stiffness ?? 120, mass: cfg.mass ?? 1}});

/** 数值关键帧插值（缓动） */
export function keys(f: number, ks: [number, number][], ease: (t: number) => number = easeInOut): number {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      const [fa, va] = ks[i - 1], [fb, vb] = ks[i];
      return lerp(va, vb, ease(clamp((f - fa) / Math.max(1, fb - fa))));
    }
  }
  return ks[ks.length - 1][1];
}

export type Num = Record<string, number>;
/** 对象关键帧：每个关键帧以 spring 从上一状态过渡（有过冲/跟随），lag 为整体延迟帧数 */
export function springKeys<T extends Num>(f: number, ks: [number, T][], cfg: {damping?: number; stiffness?: number; mass?: number} = {}, lag = 0): T {
  const t = f - lag;
  let cur = {...ks[0][1]} as T;
  for (let i = 1; i < ks.length; i++) {
    const [fi, target] = ks[i];
    if (t < fi) break;
    const p = springAt(t, fi, cfg);
    const next = {...cur} as Num;
    for (const k of Object.keys(target)) next[k] = lerp(cur[k] ?? target[k], target[k], p);
    cur = next as T;
  }
  return cur;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (n: number, s: number) => {
  const x = Math.sin(n * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** 平滑一维噪声 -1..1 */
export function noise(x: number, seed = 0) {
  const i = Math.floor(x), fr = x - i;
  const u = fr * fr * (3 - 2 * fr);
  return lerp(hash(i, seed), hash(i + 1, seed), u) * 2 - 1;
}
export const osc = (f: number, periodFrames: number, phase = 0) => Math.sin(((f / periodFrames) + phase) * Math.PI * 2);

export function hexToRgb(h: string) {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
export function shade(h: string, k: number) {
  // k>0 提亮，k<0 压暗
  const [r, g, b] = hexToRgb(h);
  const f = (c: number) => Math.round(k >= 0 ? c + (255 - c) * k : c * (1 + k));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
export function rgba(h: string, a: number) {
  const [r, g, b] = hexToRgb(h);
  return `rgba(${r},${g},${b},${a})`;
}
export {interpolate};
