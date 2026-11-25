import React from 'react';
import {mulberry32, noise, osc, rgba, shade, clamp, lerp} from '../lib/anim';

/** 漆底：底色 + 光源晕染 + 刷痕纹理 + 暗角 + 边缘倒角暗线。放在背景层 svg 里 */
export const LacquerBackdrop: React.FC<{
  base: string; light?: [number, number]; lightColor?: string; lightAmt?: number; f: number; w?: number; h?: number; brush?: number;
}> = ({base, light = [960, 300], lightColor = '#fff0d0', lightAmt = 0.22, f, w = 1920, h = 1080, brush = 0.16}) => {
  const id = `bd${base.slice(1)}${Math.round(light[0])}`;
  return (
    <g>
      <defs>
        <radialGradient id={id + 'l'} cx={light[0] / w} cy={light[1] / h} r="0.75">
          <stop offset="0" stopColor={lightColor} stopOpacity={lightAmt} />
          <stop offset="0.55" stopColor={lightColor} stopOpacity={lightAmt * 0.25} />
          <stop offset="1" stopColor={lightColor} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id + 'v'} cx="0.5" cy="0.45" r="0.78">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.62" />
        </radialGradient>
        <linearGradient id={id + 'g'} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={shade(base, 0.08)} />
          <stop offset="0.6" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -0.35)} />
        </linearGradient>
      </defs>
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={`url(#${id}g)`} />
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={`url(#${id}l)`} />
      <rect x={-w} y={-h} width={w * 3} height={h * 3} filter="url(#lqBrush)" opacity={brush} style={{mixBlendMode: 'soft-light'}}
        transform={`translate(${osc(f, 400) * 6},0)`} />
      <rect x={-w} y={-h} width={w * 3} height={h * 3} fill={`url(#${id}v)`} />
    </g>
  );
};

/** 漆面高光带：一道柔和斜向光带缓慢滑过。屏幕空间，自动避开字幕区（下方 300px 渐隐） */
export const HighlightBand: React.FC<{f: number; period?: number; amt?: number; angle?: number; phase?: number}> = ({f, period = 240, amt = 0.1, angle = -18, phase = 0}) => {
  const p = (((f / period) + phase) % 1 + 1) % 1;
  const x = lerp(-700, 2600, p);
  return (
    <div style={{position: 'absolute', inset: 0, pointerEvents: 'none', mixBlendMode: 'screen',
      WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 76%)', maskImage: 'linear-gradient(to bottom, #000 0%, #000 62%, transparent 76%)'}}>
      <div style={{position: 'absolute', top: -400, left: x, width: 360, height: 1900, transform: `rotate(${angle}deg)`,
        background: `linear-gradient(90deg, transparent, rgba(255,240,210,${amt}) 45%, rgba(255,250,235,${amt * 1.6}) 50%, rgba(255,240,210,${amt}) 55%, transparent)`}} />
    </div>
  );
};

/** 金粉：缓慢飘动、闪烁的金色颗粒 */
export const GoldDust: React.FC<{f: number; seed?: number; n?: number; x?: number; y?: number; w?: number; h?: number; size?: number; drift?: number; opacity?: number; burstAt?: number; burstX?: number; burstY?: number}> =
  ({f, seed = 1, n = 40, x = 0, y = 0, w = 1920, h = 1080, size = 2.4, drift = 0.25, opacity = 0.8, burstAt, burstX = 960, burstY = 540}) => {
  const r = mulberry32(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const px = r(), py = r(), ph = r(), sz = 0.5 + r() * 1.2, sp = 0.3 + r();
    let cx = x + ((px * w + f * drift * sp * 3 + noise(f / 90 + i, seed) * 30) % w + w) % w;
    let cy = y + ((py * h - f * drift * sp + noise(f / 70 + i * 3, seed + 1) * 20) % h + h) % h;
    let a = opacity * (0.35 + 0.65 * (0.5 + 0.5 * osc(f, 50 + ph * 70, ph)));
    if (burstAt !== undefined && f >= burstAt) {
      const t = (f - burstAt) / 30;
      if (t < 1.6) {
        const ang = ph * Math.PI * 2, dist = (180 + sz * 260) * (1 - Math.exp(-t * 3));
        cx = burstX + Math.cos(ang) * dist; cy = burstY + Math.sin(ang) * dist + t * t * 60;
        a = opacity * clamp(1.6 - t);
      }
    }
    pts.push(<circle key={i} cx={cx} cy={cy} r={size * sz} fill={i % 5 === 0 ? '#fff4c8' : '#e8c46a'} opacity={a} />);
  }
  return <g style={{mixBlendMode: 'screen'}}>{pts}</g>;
};

/** 描金描边路径：底下一道暗线（漆层厚度），上面金线 */
export const GoldStroke: React.FC<{d: string; w?: number; opacity?: number; dash?: number}> = ({d, w = 3, opacity = 1, dash}) => (
  <g opacity={opacity} fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} stroke="#1a0f08" strokeWidth={w + 2.2} opacity={0.6} />
    <path d={d} stroke="url(#gold)" strokeWidth={w} pathLength={dash !== undefined ? 1 : undefined}
      strokeDasharray={dash !== undefined ? `${dash} 1` : undefined} />
  </g>
);

/** 戗金：细刻金线按 progress 逐渐刻出 */
export const Qiangjin: React.FC<{d: string; progress: number; w?: number; glow?: boolean}> = ({d, progress, w = 2, glow}) => (
  <g filter={glow ? 'url(#goldGlow)' : undefined}>
    <path d={d} fill="none" stroke="#0a0604" strokeWidth={w + 1.6} pathLength={1} strokeDasharray={`${clamp(progress)} 1`} strokeLinecap="round" opacity={0.7} />
    <path d={d} fill="none" stroke="url(#gold)" strokeWidth={w} pathLength={1} strokeDasharray={`${clamp(progress)} 1`} strokeLinecap="round" />
  </g>
);

/** 剔红：同一形状层层错位叠出雕漆厚度 */
export const Tihong: React.FC<{d: string; layers?: number; dx?: number; dy?: number; color?: string}> = ({d, layers = 5, dx = 1.6, dy = 2.2, color = '#b5322a'}) => (
  <g>
    {Array.from({length: layers}).map((_, i) => (
      <path key={i} d={d} transform={`translate(${(layers - i) * dx},${(layers - i) * dy})`}
        fill={shade(color, -0.12 * (layers - i))} />
    ))}
    <path d={d} fill={color} stroke="#f0c070" strokeWidth={1} strokeOpacity={0.5} />
  </g>
);

/** 螺钿：彩虹偏光小片，随帧变色 */
export const Mop: React.FC<{cx: number; cy: number; r: number; f: number; seed?: number; shape?: 'dot' | 'shard'}> = ({cx, cy, r, f, seed = 0, shape = 'dot'}) => {
  const hue = (f * 1.5 + seed * 47) % 360;
  const fill = `hsl(${hue},70%,80%)`;
  return shape === 'dot' ? (
    <g>
      <circle cx={cx} cy={cy} r={r * 1.9} fill={fill} opacity={0.18} />
      <circle cx={cx} cy={cy} r={r} fill="url(#mop)" style={{filter: `hue-rotate(${hue}deg)`}} />
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.35} fill="#fff" opacity={0.8} />
    </g>
  ) : (
    <path d={`M${cx},${cy - r} L${cx + r * 0.7},${cy} L${cx},${cy + r} L${cx - r * 0.6},${cy + r * 0.1}Z`} fill="url(#mop)" style={{filter: `hue-rotate(${hue}deg)`}} opacity={0.9} />
  );
};

/** 断纹：从 (x,y) 起的分叉裂纹，progress 0..1 生长；repaired 时描金 */
export function crackPaths(seed: number, x: number, y: number, len: number, angle: number, depth = 3): string[] {
  const r = mulberry32(seed);
  const out: string[] = [];
  const grow = (sx: number, sy: number, a: number, l: number, d: number) => {
    let px = sx, py = sy;
    let path = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
    const segs = 6;
    for (let i = 0; i < segs; i++) {
      a += (r() - 0.5) * 0.9;
      px += Math.cos(a) * l / segs; py += Math.sin(a) * l / segs;
      path += ` L${px.toFixed(1)},${py.toFixed(1)}`;
      if (d > 0 && r() < 0.28) grow(px, py, a + (r() > 0.5 ? 0.8 : -0.8), l * 0.45, d - 1);
    }
    out.push(path);
  };
  grow(x, y, angle, len, depth);
  return out;
}
export const Cracks: React.FC<{paths: string[]; progress: number; repaired?: number; w?: number}> = ({paths, progress, repaired = 0, w = 2.2}) => (
  <g strokeLinecap="round" strokeLinejoin="round" fill="none">
    {paths.map((d, i) => {
      const p = clamp(progress * paths.length - i * 0.6);
      return (
        <g key={i}>
          <path d={d} stroke="#050302" strokeWidth={w * (i === 0 ? 1.6 : 1)} pathLength={1} strokeDasharray={`${p} 1`} />
          <path d={d} stroke="#fff3d0" strokeWidth={0.8} pathLength={1} strokeDasharray={`${p} 1`} opacity={0.35 * (1 - repaired)} transform="translate(-1,-1)" />
          {repaired > 0 && <path d={d} stroke="url(#gold)" strokeWidth={w * 1.4} pathLength={1} strokeDasharray={`${p * repaired} 1`} filter="url(#goldGlow)" />}
        </g>
      );
    })}
  </g>
);

/** 祥云（描金勾边的漆云） */
export const Cloud: React.FC<{x: number; y: number; s?: number; color?: string; opacity?: number}> = ({x, y, s = 1, color = '#2a2420', opacity = 1}) => {
  const d = 'M0,0 c10,-28 46,-30 58,-8 c8,-22 46,-22 52,4 c22,-6 36,14 24,30 l-150,0 c-14,-6 -10,-24 16,-26z';
  return (
    <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity}>
      <path d={d} fill={color} />
      <path d={d} fill="none" stroke="url(#gold)" strokeWidth={2.2 / s} />
      <path d="M30,8 q14,-14 28,0 M84,10 q12,-12 24,0" fill="none" stroke="url(#gold)" strokeWidth={1.6 / s} />
    </g>
  );
};

/** 山脊（层层远山，顶部描金线） */
export function ridgePath(seed: number, y: number, amp: number, w = 3000, x0 = -540, step = 60): string {
  const r = mulberry32(seed);
  let d = `M${x0},1300 L${x0},${y}`;
  let h = 0;
  for (let x = x0; x <= x0 + w; x += step) {
    h += (r() - 0.5) * amp * 0.6; h *= 0.85;
    const peak = Math.sin(x / 260 + seed) * amp * 0.5 + Math.sin(x / 97 + seed * 2) * amp * 0.18;
    d += ` L${x},${(y - Math.abs(peak + h)).toFixed(1)}`;
  }
  d += ` L${x0 + w},1300 Z`;
  return d;
}
export const Ridge: React.FC<{seed: number; y: number; amp: number; color: string; gold?: number; mist?: string}> = ({seed, y, amp, color, gold = 0.8, mist}) => {
  const d = ridgePath(seed, y, amp);
  const top = d.replace(/^M[^L]+L/, 'M').replace(/ L[-0-9.]+,1300 Z$/, '');
  return (
    <g>
      <path d={d} fill={color} />
      {mist && <path d={d} fill={mist} transform="translate(0,30)" opacity={0.5} />}
      <path d={top} fill="none" stroke="url(#gold)" strokeWidth={2} opacity={gold} />
    </g>
  );
};

/** 犀皮漆旋纹：多层彩漆的磨显流纹，用于洪水、老化、转场 */
export const XipiSwirl: React.FC<{f: number; x: number; y: number; w: number; h: number; colors: string[]; seed?: number; speed?: number; opacity?: number}> =
  ({f, x, y, w, h, colors, seed = 1, speed = 1, opacity = 1}) => {
  const r = mulberry32(seed);
  const rows = 9;
  const out = [];
  for (let i = 0; i < rows; i++) {
    const yy = y + (i / rows) * h;
    const ph = r() * 10, amp = 14 + r() * 26, wl = 160 + r() * 220;
    let d = `M${x},${yy}`;
    for (let xx = x; xx <= x + w; xx += 40) {
      const v = Math.sin((xx / wl) + ph + f * 0.03 * speed) * amp + Math.sin(xx / (wl * 0.37) - f * 0.02 * speed + ph) * amp * 0.4;
      d += ` L${xx},${(yy + v).toFixed(1)}`;
    }
    d += ` L${x + w},${y + h + 200} L${x},${y + h + 200}Z`;
    out.push(<path key={i} d={d} fill={colors[i % colors.length]} opacity={opacity} />);
    out.push(<path key={'s' + i} d={d.split(' L' + (x + w) + ',' + (y + h + 200))[0]} fill="none" stroke={i % 3 === 0 ? 'url(#gold)' : rgba('#000000', 0.3)} strokeWidth={i % 3 === 0 ? 1.6 : 1} opacity={opacity} />);
  }
  return <g>{out}</g>;
};
