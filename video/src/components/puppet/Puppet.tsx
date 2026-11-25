import React from 'react';
import {EXPRESSIONS, OUTFITS, POSES, Expr, Outfit, Pose} from './presets';
import {springKeys, mulberry32, noise, osc, clamp, shade, lerp} from '../../lib/anim';

type V = [number, number];
const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1]];
const mul = (a: V, k: number): V => [a[0] * k, a[1] * k];
const rad = (d: number) => (d * Math.PI) / 180;
/** 角度 0 = 竖直向下，正值偏向 +x（面朝方向） */
const dir = (deg: number): V => [Math.sin(rad(deg)), Math.cos(rad(deg))];
const up = (deg: number): V => [Math.sin(rad(deg)), -Math.cos(rad(deg))];
const rt = (deg: number): V => [Math.cos(rad(deg)), Math.sin(rad(deg))];
const f1 = (n: number) => n.toFixed(1);
const circ = (c: V, r: number) => `M${f1(c[0] - r)},${f1(c[1])} a${f1(r)},${f1(r)} 0 1,0 ${f1(2 * r)},0 a${f1(r)},${f1(r)} 0 1,0 ${f1(-2 * r)},0`;
/** 关节胶囊：两端圆 + 切线四边形，关节处与相邻段重叠，配合整组描边保证不断线 */
function capsule(a: V, b: V, ra: number, rb: number): string {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const L = Math.hypot(dx, dy) || 1;
  const n: V = [-dy / L, dx / L];
  const p1 = add(a, mul(n, ra)), p2 = add(b, mul(n, rb)), p3 = add(b, mul(n, -rb)), p4 = add(a, mul(n, -ra));
  return `M${f1(p1[0])},${f1(p1[1])} L${f1(p2[0])},${f1(p2[1])} L${f1(p3[0])},${f1(p3[1])} L${f1(p4[0])},${f1(p4[1])} Z ${circ(a, ra)} ${circ(b, rb)}`;
}
const poly = (pts: V[]) => 'M' + pts.map(p => `${f1(p[0])},${f1(p[1])}`).join(' L') + ' Z';
function hull(pts: V[]): V[] {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: V, a: V, b: V) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo: V[] = [], hi: V[] = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
/** 平滑闭合曲线（Catmull-Rom → 贝塞尔） */
function smooth(pts: V[]): string {
  const n = pts.length;
  let d = `M${f1(pts[0][0])},${f1(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: V = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: V = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f1(c1[0])},${f1(c1[1])} ${f1(c2[0])},${f1(c2[1])} ${f1(p2[0])},${f1(p2[1])}`;
  }
  return d + 'Z';
}

export type PoseKey = [number, Partial<Pose> | string];
export type ExprKey = [number, string];

function resolvePose(p: Partial<Pose> | string): Pose {
  return typeof p === 'string' ? POSES[p] : {...POSES.stand, ...p};
}

/** 眨眼：种子决定的随机间隔 2–5 秒，每次约 7 帧 */
function blinkAt(f: number, seed: number): number {
  const r = mulberry32(seed * 7 + 3);
  let t = 20 + r() * 60;
  while (t < f + 10) {
    const d = f - t;
    if (d >= 0 && d < 7) return d < 3 ? d / 3 : d < 4 ? 1 : 1 - (d - 4) / 3;
    t += 60 + r() * 90;
  }
  return 0;
}

export type PuppetProps = {
  f: number; x: number; y: number; scale?: number; facing?: 1 | -1;
  outfit?: string | Outfit; poses?: PoseKey[]; exprs?: ExprKey[]; seed?: number;
  view?: 'front' | 'back'; walk?: {phase: number; amt: number}; wind?: number; opacity?: number;
  silhouette?: string; // 剪影模式：整体单色
  noFilter?: boolean; tatterExtra?: number;
  /** 手持道具：在近侧手腕处渲染，ang 为前臂角度（0=向下） */
  hold?: (wx: number, wy: number, ang: number) => React.ReactNode;
  holdL?: (wx: number, wy: number, ang: number) => React.ReactNode;
};

export const Puppet: React.FC<PuppetProps> = (pr) => {
  const {f, x, y, scale = 1, facing = 1, seed = 1, view = 'front', walk, wind = 0, opacity = 1, silhouette, noFilter} = pr;
  const O: Outfit = typeof pr.outfit === 'object' ? pr.outfit : OUTFITS[pr.outfit ?? 'commoner'];
  const poseKs = (pr.poses ?? [[0, 'stand']]).map(([fr, p]) => [fr, resolvePose(p)] as [number, Pose]);
  let P = springKeys(f, poseKs, {damping: 15, stiffness: 110});
  let S = springKeys(f, poseKs, {damping: 8, stiffness: 55}, 4); // 次级：头发、袍袖、衣角慢半拍
  if (walk && walk.amt > 0) {
    const ph = walk.phase * Math.PI * 2, A = 24 * walk.amt;
    const w = (p: Pose, lagPh = 0): Pose => ({...p,
      hipL: p.hipL + A * Math.sin(ph - lagPh), hipR: p.hipR - A * Math.sin(ph - lagPh),
      knL: p.knL + Math.max(0, -Math.sin(ph - lagPh)) * 34 * walk.amt, knR: p.knR + Math.max(0, Math.sin(ph - lagPh)) * 34 * walk.amt,
      shL: p.shL - A * 0.7 * Math.sin(ph - lagPh), shR: p.shR + A * 0.7 * Math.sin(ph - lagPh),
      bob: p.bob - Math.abs(Math.cos(ph - lagPh)) * 4 * walk.amt, lean: p.lean + 4 * walk.amt});
    P = w(P); S = w(S, 0.6);
  }
  const exprKs = (pr.exprs && pr.exprs.length ? pr.exprs : [[0, 'neutral']] as ExprKey[]).map(([fr, n]) => [fr, EXPRESSIONS[n] ?? EXPRESSIONS.neutral] as [number, Expr]);
  const X = springKeys(f, exprKs, {damping: 16, stiffness: 90});
  const blink = blinkAt(f, seed);

  // 呼吸与重心晃动
  const br = osc(f, 105 + (seed % 7) * 6);
  const sway = noise(f / 95, seed) * 1.6;
  const pel: V = [sway, P.bob + br * 0.6];
  const T = P.lean;
  const torsoLen = 70 * (1 + br * 0.012);
  const neck = add(pel, mul(up(T), torsoLen));
  const shY = -br * 1.1;
  const shoulderL = add(add(neck, mul(rt(T), -12)), [0, 5 + shY]);
  const shoulderR = add(add(neck, mul(rt(T), 13)), [0, 5 + shY]);
  const elbowL = add(shoulderL, mul(dir(T + P.shL), 36));
  const wristL = add(elbowL, mul(dir(T + P.shL + P.elL), 33));
  const elbowR = add(shoulderR, mul(dir(T + P.shR), 36));
  const wristR = add(elbowR, mul(dir(T + P.shR + P.elR), 33));
  const hipL = add(pel, mul(rt(0), -8)), hipR = add(pel, mul(rt(0), 9));
  const kneeL = add(hipL, mul(dir(P.hipL), 44)), kneeR = add(hipR, mul(dir(P.hipR), 44));
  const ankL = add(kneeL, mul(dir(P.hipL - P.knL), 42)), ankR = add(kneeR, mul(dir(P.hipR - P.knR), 42));
  const headAng = T + P.head;
  const HS = 1.24; // 头部放大，便于看清表情
  const headC = add(add(neck, mul(up(T + P.head * 0.4), 7)), mul(up(headAng), 21 * HS));
  /** 头部局部坐标 → 人偶坐标（随头部转动、缩放） */
  const hp = (lx: number, ly: number): V => {
    const c = Math.cos(rad(headAng)), sn = Math.sin(rad(headAng));
    return [headC[0] + (lx * c - ly * sn) * HS, headC[1] + (lx * sn + ly * c) * HS];
  };
  const ell = (cx: number, cy: number, rx: number, ry: number): V[] => Array.from({length: 20}).map((_, i) => hp(cx + Math.cos((i / 20) * Math.PI * 2) * rx, cy + Math.sin((i / 20) * Math.PI * 2) * ry));
  const sHead = T + S.head; // 次级头角度（冠羽/发带）

  const skin = silhouette ?? O.skin;
  const C = (c: string) => silhouette ?? c;

  // ---- 分组几何 ----
  const sleeveDrape = (sh: V, el: V, wr: V, aPrim: number, aSec: number, near: boolean) => {
    const lagSw = clamp((aSec - aPrim) * 0.5, -30, 30) + wind * 10;
    const hang = O.sleeve === 'wide' ? 30 : 0;
    const g: V = [lagSw * 0.6, hang];
    return O.sleeve === 'wide'
      ? smooth([add(sh, [0, -6]), add(el, [near ? 6 : -6, -4]), add(wr, [4, -5]), add(wr, add(g, [6, 6])), add(el, add(mul(g, 0.8), [-4, 8])), add(sh, [-8, 12])])
      : '';
  };
  const armPath = (sh: V, el: V, wr: V) => capsule(sh, el, 7.5, 6.2) + ' ' + capsule(el, wr, 6.2, 5) + ' ' + circ(add(wr, mul(dir(0), 3)), 6.5);
  const legPath = (hp: V, kn: V, an: V, fwd: number) => capsule(hp, kn, 9, 7) + ' ' + capsule(kn, an, 7, 5.2) + ' ' + capsule(an, add(an, [fwd * 13, 3]), 5, 4.2);

  const tunicPts: V[] = [
    add(neck, mul(rt(T), -9)), add(neck, mul(rt(T), 9)),
    add(add(neck, mul(rt(T), 21)), mul(up(T), -5)), add(add(pel, mul(rt(T), 22)), mul(up(T), -12)),
    add(add(pel, mul(rt(T), -21)), mul(up(T), -12)), add(add(neck, mul(rt(T), -20)), mul(up(T), -5)),
  ];
  const len = O.robeLen;
  const skirtPts = hull([
    add(pel, [-19, -6]), add(pel, [19, -6]),
    add(kneeL, [-11, 4]), add(kneeL, [9, 4]), add(kneeR, [-9, 4]), add(kneeR, [11, 4]),
    add(kneeL, mul(dir(P.hipL - P.knL), 42 * Math.max(0, len - 0.55) * 2)),
    add(kneeR, mul(dir(P.hipR - P.knR), 42 * Math.max(0, len - 0.55) * 2)),
  ]);
  // 衣角跟随：下摆点按次级姿势偏移
  const hemLag = clamp((S.hipR - P.hipR) * 0.4 + (S.lean - P.lean) * 0.6 + wind * 6, -14, 14);
  const skirt = skirtPts.map(p => (p[1] > pel[1] + 30 ? add(p, [hemLag * ((p[1] - pel[1]) / 90), 0]) : p)) as V[];

  const outlineW = clamp(6 / scale, 0.8, 9); // 屏幕上约 3px 的描金边，远近一致
  const gold = silhouette ? silhouette : 'url(#gold)';
  const group = (paths: {d: string; fill: string}[], extra?: React.ReactNode) => (
    <g>
      {paths.map((p, i) => <path key={'o' + i} d={p.d} fill={gold} stroke={gold} strokeWidth={outlineW} strokeLinejoin="round" />)}
      {paths.map((p, i) => <path key={'f' + i} d={p.d} fill={p.fill} />)}
      {extra}
    </g>
  );

  const farArm = group([
    ...(O.sleeve === 'wide' ? [{d: sleeveDrape(shoulderL, elbowL, wristL, T + P.shL + P.elL, T + S.shL + S.elL, false), fill: C(shade(O.tunic, -0.25))}] : []),
    {d: armPath(shoulderL, elbowL, wristL), fill: C(shade(O.tunic, -0.18))},
    {d: circ(add(wristL, mul(dir(T + P.shL + P.elL), 7)), 6), fill: C(shade(skin, -0.15))},
  ]);
  const legs = group([
    {d: legPath(hipL, kneeL, ankL, 1), fill: C(shade(skin, -0.2))},
    {d: legPath(hipR, kneeR, ankR, 1), fill: C(skin)},
  ]);

  // 头发：背面全覆盖；正面=脑后发团（头后）+ 头顶发盖（不遮脸）
  const hairBackPts = view === 'back' ? ell(0, -1, 20.5, 23.5) : ell(-7, -5, 18, 21);
  const hairCap = smooth([hp(-20.5, 0), hp(-20, -13), hp(-11, -22.5), hp(2, -24.5), hp(14, -21), hp(20.5, -11), hp(20, -5), hp(12, -12.5), hp(3, -13.5), hp(-6, -11), hp(-14, -6)]);
  const bun = hp(-4, -27);
  const bodyPaths: {d: string; fill: string}[] = [
    {d: smooth(skirt), fill: C(O.skirt)},
    {d: poly(tunicPts), fill: C(O.tunic)},
    {d: capsule(neck, add(neck, mul(up(T + P.head * 0.4), 9)), 6.5, 6), fill: C(skin)},
    {d: smooth(hairBackPts), fill: C(O.hair)},
  ];
  if (O.hairStyle !== 'loose') bodyPaths.push({d: circ(bun, 9 * HS), fill: C(O.hair)});
  if (view !== 'back') {
    bodyPaths.push({d: smooth(ell(0, 0, 19, 22)), fill: C(skin)});
    bodyPaths.push({d: circ(hp(-17, 2), 4.2), fill: C(shade(O.skin, -0.08))}); // 耳
    bodyPaths.push({d: hairCap, fill: C(O.hair)});
  }
  if (O.hairStyle === 'loose' && view !== 'back') bodyPaths.push({d: smooth([hp(-19, -8), hp(-24, 10), hp(-20, 22), hp(-12, 12), hp(-12, -4)]), fill: C(O.hair)});
  if (O.cape) bodyPaths.push({d: smooth([add(shoulderL, [-8, -6]), add(neck, [0, -8]), add(shoulderR, [8, -6]), add(add(pel, mul(rt(T), 26)), [hemLag * 0.3, -4]), add(add(pel, mul(rt(T), 0)), [hemLag * 0.3, 2]), add(add(pel, mul(rt(T), -26)), [hemLag * 0.3, -4])]), fill: C('#6b5a2c')});

  const bodyDetails = silhouette ? null : (
    <g>
      {/* 交领右衽 */}
      <path d={`M${f1(add(neck, mul(rt(T), -8))[0])},${f1(add(neck, mul(rt(T), -8))[1])} L${f1(add(pel, add(mul(rt(T), 10), mul(up(T), 14)))[0])},${f1(add(pel, add(mul(rt(T), 10), mul(up(T), 14)))[1])}`} stroke={O.trim} strokeWidth={3.2} fill="none" />
      <path d={`M${f1(add(neck, mul(rt(T), 8))[0])},${f1(add(neck, mul(rt(T), 8))[1])} L${f1(add(neck, add(mul(rt(T), -2), mul(up(T), -26)))[0])},${f1(add(neck, add(mul(rt(T), -2), mul(up(T), -26)))[1])}`} stroke={O.trim} strokeWidth={3.2} fill="none" />
      {/* 腰带 */}
      <path d={capsule(add(pel, add(mul(rt(T), -21), mul(up(T), 14))), add(pel, add(mul(rt(T), 22), mul(up(T), 14))), 3.6, 3.6)} fill={O.belt} />
      {/* 下裳褶线 */}
      {[-10, 0, 10].map(k => <path key={k} d={`M${f1(pel[0] + k)},${f1(pel[1] + 4)} L${f1(pel[0] + k * 1.3 + hemLag * 0.5)},${f1(pel[1] + 30 + 50 * len)}`} stroke={shade(O.skirt, -0.3)} strokeWidth={1.4} opacity={0.6} />)}
      {/* 首领衣纹：戗金回纹 */}
      {O.crown && <path d={`M${f1(tunicPts[3][0] - 6)},${f1(tunicPts[3][1] - 6)} l-8,0 l0,-6 l5,0 M${f1(tunicPts[4][0] + 6)},${f1(tunicPts[4][1] - 6)} l8,0 l0,-6 l-5,0`} stroke="url(#gold)" strokeWidth={1.6} fill="none" />}
      {O.pendant && <path d={`M${f1(neck[0] - 8)},${f1(neck[1] + 20)} q8,9 16,0`} stroke="#6fbfa0" strokeWidth={4} fill="none" strokeLinecap="round" />}
      {/* 破损补丁 */}
      {(O.tatter ?? 0) + (pr.tatterExtra ?? 0) > 0 && [0, 1, 2, 3].slice(0, Math.round(((O.tatter ?? 0) + (pr.tatterExtra ?? 0)) * 4)).map(i => (
        <rect key={i} x={pel[0] - 14 + i * 9} y={pel[1] - 40 + (i % 2) * 22} width={7} height={8} fill={shade(O.tunic, -0.32)} transform={`rotate(${i * 17 - 10} ${pel[0]} ${pel[1]})`} />
      ))}
      {O.cape && [-18, -9, 0, 9, 18].map(k => <path key={k} d={`M${f1(neck[0] + k * 0.5)},${f1(neck[1])} L${f1(pel[0] + k * 1.2 + hemLag * 0.3)},${f1(pel[1] - 2)}`} stroke="#3e3216" strokeWidth={1.2} opacity={0.7} />)}
      {O.hairStyle === 'bunPin' && <path d={`M${f1(bun[0] - 14)},${f1(bun[1] + 2)} L${f1(bun[0] + 14)},${f1(bun[1] - 3)}`} stroke="#efe2c0" strokeWidth={2.4} strokeLinecap="round" />}
    </g>
  );

  // 羽冠：随次级头角度摆动
  const crown = O.crown === 'feather' && !silhouette ? (
    <g transform={`rotate(${(sHead - headAng) * 0.8} ${bun[0]} ${bun[1]})`}>
      {[-34, -17, 0, 17, 34].map((a, i) => {
        const tip = add(bun, mul(up(headAng + a), 34 + (i === 2 ? 8 : 0)));
        return <path key={i} d={capsule(bun, tip, 2, 5)} fill={i % 2 ? '#e8d6a8' : '#c94a32'} stroke="url(#gold)" strokeWidth={1.2} />;
      })}
    </g>
  ) : null;

  // 发带：两条随次级姿势与风飘动的带子
  const ribbon = (O.hairStyle !== 'loose' && !O.crown && !silhouette) ? (() => {
    const base = add(bun, mul(rt(headAng), -6));
    const sw = (sHead - headAng) * 1.4 + wind * 18 + noise(f / 30, seed) * 5;
    const p1 = add(base, [-14 - sw * 0.4, 10]), p2 = add(base, [-24 - sw, 26 + Math.abs(sw) * 0.2]);
    return <path d={`M${f1(base[0])},${f1(base[1])} Q${f1(p1[0])},${f1(p1[1])} ${f1(p2[0])},${f1(p2[1])}`} stroke="#b8392b" strokeWidth={3.4} fill="none" strokeLinecap="round" />;
  })() : null;

  const nearArm = group([
    ...(O.sleeve === 'wide' ? [{d: sleeveDrape(shoulderR, elbowR, wristR, T + P.shR + P.elR, T + S.shR + S.elR, true), fill: C(O.tunic)}] : []),
    {d: armPath(shoulderR, elbowR, wristR), fill: C(shade(O.tunic, 0.02))},
    {d: circ(add(wristR, mul(dir(T + P.shR + P.elR), 7)), 6.5), fill: C(skin)},
  ], O.bracelet && !silhouette ? <circle cx={wristR[0]} cy={wristR[1]} r={6} fill="none" stroke="#7fd0b0" strokeWidth={3} /> : null);

  // 面部（独立分层）
  const face = view === 'front' && !silhouette ? (() => {
    const lid = clamp(Math.max(X.lid, blink));
    const fx = 4; // 3/4 侧向偏移
    const eye = (ex: number, near: boolean) => {
      const rx = near ? 4.6 : 3.9, ry = 3.4;
      const open = clamp(1 - lid - X.lowLid * 0.5, 0.04, 1);
      const cy = -2 + (lid - X.lowLid * 0.5) * ry * 0.5;
      const eyR = ry * open;
      return (
        <g key={ex}>
          <ellipse cx={ex} cy={cy} rx={rx} ry={eyR} fill="#f5ecd8" />
          <circle cx={ex + X.lookX * 0.4 + 0.6} cy={cy + X.lookY * 0.25} r={Math.min(2.4 * X.pupil, eyR + 0.2)} fill="#140c08" />
          {eyR > 1.4 && <circle cx={ex + X.lookX * 0.4 - 0.2} cy={cy - 0.9} r={0.7} fill="#fff" />}
          <path d={`M${ex - rx - 0.6},${cy - eyR * 0.2} Q${ex},${cy - eyR - 1.4} ${ex + rx + 0.6},${cy - eyR * 0.2}`} stroke="#1a0f08" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          {X.tear > 0.05 && <path d={`M${ex + 1},${cy + eyR + 1} q-1.6,4 0,6 q1.6,-2 0,-6`} fill="#cfefff" opacity={X.tear} />}
        </g>
      );
    };
    const brow = (bx: number, near: boolean) => {
      const sgn = near ? 1 : -1; // 外侧方向
      const a = X.browAng * sgn;
      return <path key={'b' + bx} d={`M${bx - 4.5},${-9.5 + X.browY - (near ? a : -a) * 0.12} L${bx + 4.5},${-9.5 + X.browY + (near ? a : -a) * 0.12}`} stroke="#1a120c" strokeWidth={2.4} strokeLinecap="round" transform={`rotate(${a * 0.6} ${bx} ${-9.5 + X.browY})`} />;
    };
    const mw = 6 * X.mw;
    const mc = X.mouth;
    return (
      <g transform={`translate(${headC[0]},${headC[1]}) rotate(${headAng}) scale(${HS})`}>
        <ellipse cx={-6 + fx} cy={5} rx={4.5} ry={2.6} fill="#e86a5a" opacity={X.blush * 0.6} />
        <ellipse cx={10 + fx} cy={5} rx={4} ry={2.4} fill="#e86a5a" opacity={X.blush * 0.6} />
        {eye(-6 + fx, false)}{eye(8 + fx, true)}
        {brow(-6 + fx, false)}{brow(8 + fx, true)}
        <path d={`M${2 + fx},1 q1.6,3 -0.4,4.2`} stroke={shade(O.skin, -0.35)} strokeWidth={1.3} fill="none" />
        {X.open > 0.05 && <ellipse cx={2 + fx} cy={10.5 + X.open * 1.5} rx={mw * 0.62} ry={X.open * 3.8} fill="#4a1410" />}
        <path d={`M${2 + fx - mw},${10 - mc * 1.6} Q${2 + fx},${10 + mc * 5} ${2 + fx + mw},${10 - mc * 1.6}`} stroke="#5a1c14" strokeWidth={1.8} fill="none" strokeLinecap="round" />
        {X.sweat > 0.05 && <path d="M18,-12 q-3,5 0,8 q3,-3 0,-8" fill="#d8f0ff" stroke="#8ab8d8" strokeWidth={0.6} opacity={X.sweat} />}
        {X.vein > 0.05 && <g opacity={X.vein} stroke="#d83a2a" strokeWidth={1.6} fill="none" transform="translate(13,-17)"><path d="M-3,-1 q1.5,-2 3,0 M1,-3 q2,1.5 0,3 M3,1 q-1.5,2 -3,0 M-1,3 q-2,-1.5 0,-3" /></g>}
        {X.shock > 0.05 && <g opacity={X.shock} stroke="#f3ebdd" strokeWidth={2} strokeLinecap="round"><path d="M-10,-34 l-3,-7 M0,-37 l0,-8 M10,-34 l3,-7" /></g>}
      </g>
    );
  })() : null;

  const backFirst = view === 'back';
  return (
    <g transform={`translate(${x},${y}) scale(${scale * facing},${scale})`} opacity={opacity} filter={noFilter || silhouette ? undefined : 'url(#lqSoft)'}>
      {pr.holdL && backFirst && null}
      {backFirst ? nearArm : farArm}
      {legs}
      {group(bodyPaths, bodyDetails)}
      {ribbon}
      {crown}
      {face}
      {backFirst ? farArm : nearArm}
      {pr.hold && pr.hold(wristR[0], wristR[1], T + P.shR + P.elR)}
      {pr.holdL && pr.holdL(wristL[0], wristL[1], T + P.shL + P.elL)}
    </g>
  );
};

/** 群众（小剪影人群）：轻量版 */
export const Crowd: React.FC<{f: number; x: number; y: number; n: number; spacing?: number; scale?: number; color?: string; seed?: number; headTurn?: number; rows?: number; part?: number}> =
  ({f, x, y, n, spacing = 40, scale = 0.5, color = '#2a1d16', seed = 3, headTurn = 0, rows = 1, part = 0}) => {
  const r = mulberry32(seed);
  const out = [];
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < n; i++) {
      const jitter = r();
      const cx0 = x + (i - n / 2) * spacing + jitter * 12 + row * spacing * 0.5;
      const side = cx0 < x ? -1 : 1;
      const cx = cx0 + side * part * (160 - Math.abs(cx0 - x) * 0.25 > 0 ? 160 - Math.abs(cx0 - x) * 0.25 : 0);
      const cy = y + row * 26 * scale * 2;
      const s = scale * (0.9 + jitter * 0.2) * (1 - row * 0.12);
      const bob = osc(f, 40 + jitter * 30, jitter) * 1.5;
      const hd = headTurn * (8 + jitter * 6);
      out.push(
        <g key={row * 100 + i} transform={`translate(${cx},${cy + bob}) scale(${s})`}>
          <path d="M-20,0 L-16,-70 Q0,-80 16,-70 L20,0 Z" fill={shade(color, row * 0.06)} />
          <ellipse cx={hd * 0.4} cy={-92} rx={14} ry={16} fill={shade(color, row * 0.06 + 0.05)} transform={`rotate(${hd} 0 -80)`} />
          <circle cx={hd * 0.4 - 2} cy={-108} r={7} fill={shade(color, -0.1)} />
          <path d="M-20,0 L-16,-70 Q0,-80 16,-70 L20,0 Z" fill="none" stroke="url(#gold)" strokeWidth={1.4 / s * 0.5} opacity={0.5} />
        </g>,
      );
    }
  }
  return <g>{out}</g>;
};
