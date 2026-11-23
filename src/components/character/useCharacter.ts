import type {Expression, Outfit, Who} from '../../data/types';
import {clamp, spring} from '../../lib/springs';
import {castTrack} from '../../lib/timing';
import {rng} from '../../lib/paper';
import {EXPRESSIONS, Face, blendFace} from './expressions';
import {POSES, Pose, PoseName, blendPose} from './poses';
import type {FaceState} from './Puppet';

export type PoseKey = {at: number; pose: PoseName | Pose; stiff?: number; damp?: number};
export type ExprKey = {at: number; expr: Expression};

const sp = (t: number, stiff = 140, damp = 15) => (t <= 0 ? 0 : spring(t, stiff, damp));

/** chained spring interpolation: each key springs from wherever the previous motion was (no jumps). */
function chain<T>(frame: number, keys: {at: number; v: T; stiff?: number; damp?: number}[], blend: (a: T, b: T, t: number) => T): T {
  if (!keys.length) throw new Error('no keys');
  let start = keys[0].v;
  let target = keys[0].v;
  let segAt = keys[0].at;
  let st = keys[0].stiff;
  let dp = keys[0].damp;
  for (let i = 1; i < keys.length; i++) {
    if (frame < keys[i].at) break;
    start = blend(start, target, sp(keys[i].at - segAt, st, dp));
    target = keys[i].v;
    segAt = keys[i].at;
    st = keys[i].stiff;
    dp = keys[i].damp;
  }
  return blend(start, target, sp(frame - segAt, st, dp));
}

const poseOf = (p: PoseName | Pose): Pose => (typeof p === 'string' ? POSES[p] : p);

export const poseAt = (frame: number, keys: PoseKey[]) =>
  chain(frame, keys.map((k) => ({at: k.at, v: poseOf(k.pose), stiff: k.stiff, damp: k.damp})), blendPose);

/** blink schedule: random 2-5 s intervals (fixed seed per character), 7-frame blink */
const blinkLid = (frame: number, seed: number) => {
  const r = rng(seed);
  let t = Math.floor(r() * 50);
  while (t < frame + 10) {
    const d = frame - t;
    if (d >= 0 && d < 7) return d < 3 ? d / 3 : 1 - (d - 3) / 4;
    t += 60 + Math.floor(r() * 90);
  }
  return 0;
};

/** Resolve a character's full rig at `frame`: pose (springs + anticipation authored as keys), face (expression
 *  keys from the subtitle file plus optional scene overrides), outfit, secondary motion and breathing. */
export const useRig = (
  who: Who,
  frame: number,
  opts: {poses: PoseKey[]; exprs?: ExprKey[]; outfit?: Outfit; seed?: number; idle?: number},
) => {
  const track = castTrack(who);
  const exprKeys: {at: number; v: Face}[] = [
    ...track.filter((c) => c.expression).map((c) => ({at: c.frame, v: EXPRESSIONS[c.expression!]})),
    ...(opts.exprs ?? []).map((e) => ({at: e.at, v: EXPRESSIONS[e.expr]})),
  ].sort((a, b) => a.at - b.at);
  if (!exprKeys.length) exprKeys.push({at: 0, v: EXPRESSIONS.neutral});
  const faceBlend = (a: Face, b: Face, t: number) => blendFace(a, b, t) as Face;
  // track symbol cross-fade separately
  let face = chain(frame, exprKeys.map((k) => ({...k, stiff: 110, damp: 16})), faceBlend);
  const active = [...exprKeys].reverse().find((k) => k.at <= frame);
  const prevIdx = active ? exprKeys.indexOf(active) - 1 : -1;
  const prev = prevIdx >= 0 ? exprKeys[prevIdx].v : undefined;
  const tSym = active ? clamp(sp(frame - active.at, 110, 16)) : 1;
  let symbol: Face['symbol'] = active?.v.symbol ?? 'none';
  let symbolAmt = symbol !== 'none' ? (prev?.symbol === symbol ? 1 : tSym) : 0;
  if (symbol === 'none' && prev && prev.symbol !== 'none') {
    symbol = prev.symbol;
    symbolAmt = 1 - tSym;
  }
  const seed = opts.seed ?? (who === 'hero' ? 7 : 13);
  const blink = blinkLid(frame, seed);
  face = {...face, lid: Math.max(face.lid, blink)};
  const outfit: Outfit =
    opts.outfit ?? ([...track].reverse().find((c) => c.outfit && c.frame <= frame)?.outfit ?? track.find((c) => c.outfit)?.outfit ?? 'raincoat');
  const idle = opts.idle ?? 1;
  const pose = poseAt(frame, opts.poses);
  const p4 = poseAt(frame - 4, opts.poses);
  const p8 = poseAt(frame - 8, opts.poses);
  // secondary motion: hair / coat lag behind the body (difference between now and a few frames ago)
  const hairSwing = clamp(
    (pose.head - p4.head) * 1.1 + (pose.lean - p4.lean) * 1.4 - (pose.x - p4.x) * 0.45 + (pose.y - p8.y) * 0.25 + Math.sin(frame / 23 + seed) * 1.8 * idle,
    -28,
    28,
  );
  const coatSwing = clamp(-(pose.x - p8.x) * 0.5 + (pose.lean - p8.lean) * 0.8 + (pose.y - p8.y) * 0.3 + Math.sin(frame / 31 + seed) * 1.2 * idle, -24, 24);
  const breathe = 1 + 0.013 * Math.sin((frame / 78) * Math.PI * 2 + seed) * idle;
  const sway = Math.sin((frame / 150) * Math.PI * 2 + seed) * 2.2 * idle;
  const headBob = Math.sin((frame / 110) * Math.PI * 2 + seed * 2) * 1.6 * idle;
  return {
    pose: {...pose, x: pose.x + sway, head: pose.head + headBob},
    face: {...face, symbol, symbolAmt} as FaceState,
    outfit,
    hairSwing,
    coatSwing,
    breathe,
  };
};
