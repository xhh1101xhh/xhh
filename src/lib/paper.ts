/** Paper-cut geometry: rough (torn) edges with a FIXED seed per shape, so edges never jitter between frames. */

export const rng = (seed: number) => {
  let a = (seed * 2654435761) >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const cache = new Map<string, string>();
type Pt = [number, number];

/** closed polygon -> torn-edge path. amp = edge roughness in px, step = segment length. */
export const roughPoly = (pts: Pt[], seed: number, amp = 2.2, step = 12, closed = true): string => {
  const key = `${seed}|${amp}|${step}|${closed}|${pts.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(';')}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const r = rng(seed);
  const out: Pt[] = [];
  const n = pts.length;
  const segs = closed ? n : n - 1;
  let drift = 0;
  for (let i = 0; i < segs; i++) {
    const [x0, y0] = pts[i];
    const [x1, y1] = pts[(i + 1) % n];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const k = Math.max(1, Math.round(len / step));
    const nx = -(y1 - y0) / (len || 1);
    const ny = (x1 - x0) / (len || 1);
    for (let j = 0; j < k; j++) {
      const t = j / k;
      drift = drift * 0.55 + (r() * 2 - 1) * amp;
      const jitter = j === 0 ? drift * 0.4 : drift;
      out.push([x0 + (x1 - x0) * t + nx * jitter, y0 + (y1 - y0) * t + ny * jitter]);
    }
  }
  if (!closed) out.push(pts[n - 1]);
  const d = 'M' + out.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('L') + (closed ? 'Z' : '');
  cache.set(key, d);
  return d;
};

export const ellipsePts = (cx: number, cy: number, rx: number, ry: number, n = 36, a0 = 0, a1 = Math.PI * 2): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return pts;
};
export const roughEllipse = (cx: number, cy: number, rx: number, ry: number, seed: number, amp = 2, step = 12) =>
  roughPoly(ellipsePts(cx, cy, rx, ry, Math.max(14, Math.round((Math.PI * (rx + ry)) / 10))), seed, amp, step);
export const roughCircle = (cx: number, cy: number, r: number, seed: number, amp = 2, step = 12) => roughEllipse(cx, cy, r, r, seed, amp, step);

export const roundRectPts = (x: number, y: number, w: number, h: number, rad: number): Pt[] => {
  const r = Math.min(rad, w / 2, h / 2);
  const pts: Pt[] = [];
  const arc = (cx: number, cy: number, a0: number) => {
    for (let i = 0; i <= 5; i++) {
      const a = a0 + (Math.PI / 2) * (i / 5);
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  };
  arc(x + w - r, y + r, -Math.PI / 2);
  arc(x + w - r, y + h - r, 0);
  arc(x + r, y + h - r, Math.PI / 2);
  arc(x + r, y + r, Math.PI);
  return pts;
};
export const roughRect = (x: number, y: number, w: number, h: number, seed: number, rad = 4, amp = 2, step = 14) =>
  roughPoly(roundRectPts(x, y, w, h, rad), seed, amp, step);

/** a capsule (limb) from (0,0) down to (0,len) with half-width w0 at top, w1 at bottom */
export const limbPts = (len: number, w0: number, w1: number): Pt[] => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 6; i++) {
    const a = Math.PI + (Math.PI * i) / 6;
    pts.push([Math.cos(a) * w0, Math.sin(a) * w0 * 0.9]);
  }
  for (let i = 0; i <= 6; i++) {
    const a = (Math.PI * i) / 6;
    pts.push([Math.cos(a) * w1, len + Math.sin(a) * w1 * 0.9]);
  }
  return pts;
};

/** wave strip: top edge is a sine-ish curve, closed down to y=bottom */
export const wavePts = (x0: number, x1: number, y: number, amp: number, wl: number, phase: number, bottom: number): Pt[] => {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1; x += wl / 8) pts.push([x, y + Math.sin((x / wl) * Math.PI * 2 + phase) * amp]);
  pts.push([x1, bottom], [x0, bottom]);
  return pts;
};
