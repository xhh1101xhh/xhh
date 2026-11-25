import React from 'react';
import {mulberry32, lerp, clamp, osc} from '../lib/anim';
import {Qiangjin, crackPaths, Cracks} from '../lacquer/Materials';

type V = [number, number];
const N = 28;
/** 圭的轮廓采样点（上尖下方），局部坐标，高 h */
function guiPts(h: number): V[] {
  const w = h * 0.3;
  const top: V = [0, -h / 2], sh = -h / 2 + w * 0.62;
  const corners: V[] = [top, [w / 2, sh], [w / 2, h / 2 - 6], [w / 2 - 6, h / 2], [-w / 2 + 6, h / 2], [-w / 2, h / 2 - 6], [-w / 2, sh]];
  // 沿多边形周长均匀采样 N 点
  const segs = corners.map((c, i) => [c, corners[(i + 1) % corners.length]] as [V, V]);
  const lens = segs.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lens.reduce((s, l) => s + l, 0);
  const pts: V[] = [];
  for (let i = 0; i < N; i++) {
    let d = (i / N) * total, k = 0;
    while (d > lens[k]) { d -= lens[k]; k++; }
    const [a, b] = segs[k]; const t = d / lens[k];
    pts.push([lerp(a[0], b[0], t), lerp(a[1], b[1], t)]);
  }
  return pts;
}
/** 未打磨的黑石胚：与圭点一一对应的不规则轮廓 */
function stonePts(h: number, seed: number): V[] {
  const r = mulberry32(seed);
  return Array.from({length: N}).map((_, i) => {
    const a = (i / N) * Math.PI * 2 - Math.PI / 2;
    const rad = h * 0.26 * (0.78 + r() * 0.4);
    return [Math.cos(a) * rad * 1.15, Math.sin(a) * rad * 0.9 + h * 0.05] as V;
  });
}
const toPath = (p: V[]) => 'M' + p.map(q => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' L') + 'Z';

/** 夏后纹：双龙环纹（图标化，非文字） */
function emblemPaths(h: number): string[] {
  const r = h * 0.1, cy = h * 0.08;
  return [
    `M${-r},${cy} a${r},${r} 0 1,1 ${2 * r},0 a${r},${r} 0 1,1 ${-2 * r},0`,
    `M${-r * 0.6},${cy - r * 0.7} c${r * 0.5},${-r * 0.5} ${r * 1.1},${r * 0.2} ${r * 0.6},${r * 0.7} c${-r * 0.4},${r * 0.4} ${-r * 0.2},${r * 0.9} ${r * 0.3},${r * 0.8}`,
    `M${r * 0.6},${cy + r * 0.7} c${-r * 0.5},${r * 0.5} ${-r * 1.1},${-r * 0.2} ${-r * 0.6},${-r * 0.7} c${r * 0.4},${-r * 0.4} ${r * 0.2},${-r * 0.9} ${-r * 0.3},${-r * 0.8}`,
    `M${-r * 1.5},${cy} l${-r * 0.5},0 M${r * 1.5},${cy} l${r * 0.5},0 M0,${cy - r * 1.5} l0,${-r * 0.5} M0,${cy + r * 1.5} l0,${r * 0.5}`,
  ];
}

export type GuiState = {
  formed?: number;     // 0 石胚 → 1 圭
  emblem?: number;     // 夏后纹刻出进度
  crack?: number;      // 断纹进度
  repaired?: number;   // 描金修补
  shatter?: number;    // 碎裂飞散进度
  glow?: number;       // 外发光
  rim?: number;        // 描金边亮度
  ghost?: boolean;
};

export const XuanGui: React.FC<{f: number; x: number; y: number; h: number; rot?: number; id: string; st?: GuiState; seed?: number; opacity?: number}> =
  ({f, x, y, h, rot = 0, id, st = {}, seed = 4, opacity = 1}) => {
  const {formed = 1, emblem = 0, crack = 0, repaired = 0, shatter = 0, glow = 0.3, rim = 1} = st;
  const G = guiPts(h), S = stonePts(h, seed);
  const pts = G.map((g, i) => [lerp(S[i][0], g[0], formed), lerp(S[i][1], g[1], formed)] as V);
  const d = toPath(pts);
  const inner = toPath(G.map(([a, b]) => [a * 0.82, b * 0.88 + 4] as V));
  const sheenX = ((f * 2.2) % (h * 1.6)) - h * 0.8;
  const cracks = crackPaths(seed + 9, 0, -h * 0.42, h * 0.95, Math.PI / 2, 3);

  if (shatter > 0) {
    const r = mulberry32(seed + 1);
    const shards = [];
    for (let i = 0; i < N; i += 2) {
      const a = pts[i], b = pts[(i + 1) % N], c = pts[(i + 2) % N];
      const cx = (a[0] + b[0] + c[0]) / 3, cy = (a[1] + b[1] + c[1]) / 3;
      const ang = Math.atan2(cy, cx) + (r() - 0.5) * 0.6;
      const dist = shatter * (h * 0.9 + r() * h * 0.8);
      const fall = shatter * shatter * h * 0.9;
      const tx = Math.cos(ang) * dist, ty = Math.sin(ang) * dist + fall;
      const spin = (r() - 0.5) * 300 * shatter;
      const drop = clamp((shatter - 0.35) / 0.4);
      shards.push(
        <g key={i} transform={`translate(${tx},${ty}) rotate(${spin} ${cx} ${cy})`}>
          <path d={`M0,0 L${a[0]},${a[1]} L${b[0]},${b[1]} L${c[0]},${c[1]}Z`} fill="url(#blackLq)" stroke="url(#gold)" strokeWidth={2} opacity={1 - drop} />
          <ellipse cx={cx} cy={cy} rx={10 * drop} ry={14 * drop} fill="#9fd0e0" opacity={drop * (1 - clamp((shatter - 0.8) / 0.2)) * 0.85} />
        </g>,
      );
    }
    return <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>{shards}</g>;
  }

  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity}>
      <defs>
        <clipPath id={`gc-${id}`}><path d={d} /></clipPath>
        <radialGradient id={`gg-${id}`}>
          <stop offset="0" stopColor="#ffe3a0" stopOpacity={0.55 * glow} />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow > 0 && <ellipse cx={0} cy={0} rx={h * 0.55} ry={h * 0.75} fill={`url(#gg-${id})`} />}
      <g filter="url(#lqObj)">
        <path d={d} fill="url(#blackLq)" />
      </g>
      <g clipPath={`url(#gc-${id})`}>
        {/* 刷痕纹理与磨显层 */}
        <rect x={-h} y={-h} width={h * 2} height={h * 2} filter="url(#lqBrush)" opacity={0.18} style={{mixBlendMode: 'soft-light'}} />
        {/* 漆面高光带 */}
        <rect x={sheenX - h * 0.08} y={-h} width={h * 0.16} height={h * 2} fill="#fff6e0" opacity={0.16 * formed} transform={`rotate(20)`} />
        <rect x={sheenX - h * 0.02} y={-h} width={h * 0.04} height={h * 2} fill="#fff" opacity={0.2 * formed} transform={`rotate(20)`} />
        {formed > 0.6 && (
          <g opacity={(formed - 0.6) / 0.4}>
            <path d={inner} fill="none" stroke="url(#gold)" strokeWidth={Math.max(1.2, h * 0.006)} opacity={0.75} />
            {emblem > 0 && emblemPaths(h).map((p, i) => <Qiangjin key={i} d={p} progress={emblem * 4 - i} w={Math.max(1.5, h * 0.008)} glow />)}
          </g>
        )}
        {crack > 0 && <Cracks paths={cracks} progress={crack} repaired={repaired} w={Math.max(1.6, h * 0.008)} />}
      </g>
      <path d={d} fill="none" stroke="url(#gold)" strokeWidth={Math.max(2, h * 0.012)} opacity={(0.35 + 0.65 * formed) * rim} strokeLinejoin="round" />
      {rim > 1 && <path d={d} fill="none" stroke="#fff2c0" strokeWidth={Math.max(2, h * 0.01)} opacity={clamp(rim - 1)} filter="url(#goldGlow)" />}
    </g>
  );
};
