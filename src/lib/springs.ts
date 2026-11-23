/** Closed-form damped spring 0 -> 1 (mass 1), evaluated at t frames. Cheaper than remotion's spring() for
 *  the many per-frame evaluations a character rig needs, and identical in spirit (can overshoot). */
export const spring = (tFrames: number, stiffness = 140, damping = 15) => {
  if (tFrames <= 0) return 0;
  const t = tFrames / 30;
  const w0 = Math.sqrt(stiffness);
  const zeta = damping / (2 * w0);
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
};
export const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));
