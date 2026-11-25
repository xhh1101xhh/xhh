import React from 'react';
import {mulberry32, noise, osc, shade, clamp, lerp} from '../lib/anim';

/** 耒：双齿木掘土器，可断（broken） */
export const Lei: React.FC<{x: number; y: number; rot?: number; s?: number; broken?: boolean; mud?: number}> = ({x, y, rot = 0, s = 1, broken, mud = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} filter="url(#lqObj)">
    <path d={broken ? 'M-5,-120 L4,-118 L6,-30 L-6,-28 Z' : 'M-5,-200 L5,-200 L6,-30 L-6,-30 Z'} fill="#7a4e2a" stroke="url(#gold)" strokeWidth={2} />
    {broken && <path d="M-5,-120 l3,-10 l3,8 l3,-12 l2,14 Z" fill="#c8a070" />}
    <path d="M-22,-30 L22,-30 L22,-18 L-22,-18 Z" fill="#5e3a1c" stroke="url(#gold)" strokeWidth={2} />
    <path d="M-20,-18 L-14,40 L-8,40 L-10,-18 Z M10,-18 L8,40 L14,40 L20,-18 Z" fill="#6a4422" stroke="url(#gold)" strokeWidth={2} />
    <path d="M-12,-30 l0,-14 l24,0 l0,14" fill="none" stroke="#c8a060" strokeWidth={3} />
    {mud > 0 && <path d="M-26,10 q14,-10 26,0 q14,-10 26,4 l0,34 l-52,0z" fill="#3a2a1a" opacity={mud} />}
  </g>
);

/** 半地穴式茅屋：圆锥草顶 + 门洞（门缝光） */
export const Hut: React.FC<{x: number; y: number; s?: number; doorLight?: number; f?: number; curtain?: number}> = ({x, y, s = 1, doorLight = 0, f = 0, curtain = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <ellipse cx={0} cy={6} rx={190} ry={22} fill="#000" opacity={0.35} />
    <path d="M-170,0 L-150,-60 L150,-60 L170,0 Z" fill="#4a3624" stroke="url(#gold)" strokeWidth={2} />
    <path d="M-185,-50 L0,-260 L185,-50 Z" fill="#6a5430" stroke="url(#gold)" strokeWidth={2.5} filter="url(#lqObj)" />
    {Array.from({length: 14}).map((_, i) => <path key={i} d={`M${-180 + i * 26},-52 L${-6 + i * 1},-250`} stroke="#3e2f18" strokeWidth={2} opacity={0.6} />)}
    <path d="M-40,0 L-36,-92 Q0,-108 36,-92 L40,0 Z" fill="#120c08" />
    {doorLight > 0 && <path d="M-40,0 L-36,-92 Q0,-108 36,-92 L40,0 Z" fill="#ffb060" opacity={doorLight * 0.85} />}
    {doorLight > 0 && <ellipse cx={0} cy={-40} rx={80} ry={90} fill="url(#fireGlow)" opacity={doorLight} />}
    {/* 草帘 */}
    <path d={`M-36,-92 Q0,-108 36,-92 L${30 + curtain * 10},${-4 + Math.sin(f / 9) * 2} L${-30 + curtain * 6},-2 Z`} fill="#7a6438" opacity={0.92} />
    {Array.from({length: 8}).map((_, i) => <path key={i} d={`M${-30 + i * 8},-96 L${-28 + i * 8 + curtain * 8 + Math.sin(f / 9 + i) * 2},-4`} stroke="#4a3a1e" strokeWidth={1.4} />)}
    <path d={`M-4,-96 L${-2 + curtain * 6},-4`} stroke={doorLight > 0 ? '#ffd090' : 'transparent'} strokeWidth={3 * doorLight} opacity={0.9} />
  </g>
);

/** 夯土高台：分层夯土 + 台阶 + 描金边 */
export const Platform: React.FC<{x: number; y: number; w?: number; h?: number; color?: string}> = ({x, y, w = 900, h = 220, color = '#6a4a2e'}) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M${-w / 2},0 L${-w / 2 + 40},${-h} L${w / 2 - 40},${-h} L${w / 2},0 Z`} fill={color} filter="url(#lqObj)" />
    {Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-w / 2 + 40 * (1 - i / 6) + 4},${-h + (i + 1) * h / 6} L${w / 2 - 40 * (1 - i / 6) - 4},${-h + (i + 1) * h / 6}`} stroke={shade(color, -0.25)} strokeWidth={2} />)}
    <path d={`M${-w / 2 + 40},${-h} L${w / 2 - 40},${-h}`} stroke="url(#gold)" strokeWidth={3} />
    {Array.from({length: 5}).map((_, i) => <rect key={i} x={-60 + i * 4} y={-h + i * (h / 5)} width={120 - i * 8} height={h / 5} fill={shade(color, 0.08 - i * 0.03)} stroke="url(#gold)" strokeWidth={1} />)}
  </g>
);

/** 篝火 / 火把火焰：多层火舌摇曳 */
export const Fire: React.FC<{x: number; y: number; s?: number; f: number; seed?: number; logs?: boolean}> = ({x, y, s = 1, f, seed = 1, logs = true}) => {
  const tongue = (k: number, h: number, c: string) => {
    const w = noise(f / 6 + k, seed) * 10;
    return <path key={k + c} d={`M${-18 + k * 6},0 Q${-20 + w},${-h * 0.5} ${w * 0.6 + k * 2},${-h - noise(f / 5, seed + k) * 12} Q${18 + w},${-h * 0.45} ${18 - k * 4},0 Z`} fill={c} />;
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={-30} rx={130} ry={110} fill="url(#fireGlow)" opacity={0.75 + osc(f, 9) * 0.1} />
      {logs && <><path d="M-34,6 L30,-6 L34,2 L-30,14 Z" fill="#3a2414" /><path d="M-30,-6 L34,8 L30,14 L-34,0 Z" fill="#4a2c18" /></>}
      {tongue(0, 70, '#d8461e')}{tongue(1, 54, '#f08a2a')}{tongue(2, 36, '#ffd36a')}
      {[0, 1, 2].map(i => { const t = ((f * 1.6 + i * 23) % 60) / 60; return <circle key={i} cx={noise(f / 8 + i, 3) * 20} cy={-40 - t * 90} r={2.2 * (1 - t)} fill="#ffd08a" opacity={1 - t} />; })}
    </g>
  );
};

/** 雨：斜线雨幕 */
export const Rain: React.FC<{f: number; n?: number; seed?: number; opacity?: number; slant?: number; speed?: number; len?: number}> = ({f, n = 120, seed = 2, opacity = 0.45, slant = -0.3, speed = 38, len = 60}) => {
  const r = mulberry32(seed);
  return (
    <g opacity={opacity}>
      {Array.from({length: n}).map((_, i) => {
        const x0 = r() * 2400 - 200, y0 = r() * 1200, sp = speed * (0.7 + r() * 0.6);
        const y = ((y0 + f * sp) % 1300) - 100;
        const x = x0 + y * slant;
        return <line key={i} x1={x} y1={y} x2={x + len * slant} y2={y + len} stroke="#cfe0f0" strokeWidth={1.4} />;
      })}
    </g>
  );
};

/** 前景草丛 */
export const Grass: React.FC<{f: number; x: number; y: number; w: number; color?: string; seed?: number; h?: number}> = ({f, x, y, w, color = '#1a1510', seed = 5, h = 90}) => {
  const r = mulberry32(seed);
  const blades = [];
  for (let i = 0; i < w / 10; i++) {
    const bx = x + i * 10 + r() * 8, bh = h * (0.5 + r() * 0.7), sw = noise(f / 40 + i * 0.3, seed) * 14;
    blades.push(<path key={i} d={`M${bx - 3},${y} Q${bx + sw * 0.4},${y - bh * 0.6} ${bx + sw},${y - bh} Q${bx + sw * 0.4 + 2},${y - bh * 0.5} ${bx + 3},${y} Z`} fill={shade(color, r() * 0.15)} />);
  }
  return <g>{blades}</g>;
};

/** 天平（描金） */
export const Balance: React.FC<{x: number; y: number; tilt: number; s?: number; left?: React.ReactNode; right?: React.ReactNode}> = ({x, y, tilt, s = 1, left, right}) => {
  const a = (tilt * Math.PI) / 180;
  const L = 300;
  const lx = -Math.cos(a) * L, ly = -Math.sin(a) * L, rx = Math.cos(a) * L, ry = Math.sin(a) * L;
  const pan = (px: number, py: number, content: React.ReactNode, k: string) => (
    <g key={k} transform={`translate(${px},${py})`}>
      <path d="M0,0 L-80,180 M0,0 L80,180" stroke="url(#gold)" strokeWidth={2.5} />
      <path d="M-100,180 Q0,230 100,180 Z" fill="#1c1410" stroke="url(#gold)" strokeWidth={3} filter="url(#lqObj)" />
      <g transform="translate(0,170)">{content}</g>
    </g>
  );
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M0,-420 L0,0" stroke="url(#gold)" strokeWidth={5} />
      <circle cx={0} cy={0} r={14} fill="#1a120c" stroke="url(#gold)" strokeWidth={3} />
      <path d={`M${lx},${ly} L${rx},${ry}`} stroke="url(#gold)" strokeWidth={8} strokeLinecap="round" filter="url(#lqShadow)" />
      <path d={`M${lx},${ly} L${rx},${ry}`} stroke="#3a2412" strokeWidth={3} strokeLinecap="round" />
      {pan(lx, ly, left, 'l')}{pan(rx, ry, right, 'r')}
    </g>
  );
};

/** 结绳记事：一根横绳，按 knots 帧逐个打结 */
export const KnotRope: React.FC<{f: number; x: number; y: number; w: number; knots: number[]}> = ({f, x, y, w, knots}) => {
  let d = `M${x},${y}`;
  for (let xx = 0; xx <= w; xx += 20) d += ` L${x + xx},${y + Math.sin(xx / 60 + f / 20) * 6}`;
  return (
    <g>
      <path d={d} stroke="#3a2614" strokeWidth={12} fill="none" />
      <path d={d} stroke="#b08850" strokeWidth={7} fill="none" strokeDasharray="8 6" />
      {knots.map((k, i) => {
        if (f < k) return null;
        const p = clamp((f - k) / 5);
        const kx = x + 40 + (i / 12) * (w - 80);
        return (
          <g key={i} transform={`translate(${kx},${y + Math.sin((kx - x) / 60 + f / 20) * 6}) scale(${0.4 + 0.6 * p + (1 - p) * 0.8})`}>
            <circle r={13} fill="#7a5530" stroke="url(#gold)" strokeWidth={2.4} />
            <path d="M-8,-6 Q0,6 8,-6 M-8,6 Q0,-6 8,6" stroke="#3a2412" strokeWidth={2} fill="none" />
          </g>
        );
      })}
    </g>
  );
};

/** 黑陶罐（龙山蛋壳黑陶） */
export const Pot: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#16120f'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#lqObj)">
    <path d="M-26,-90 L26,-90 L22,-76 Q60,-50 46,-10 Q36,8 0,10 Q-36,8 -46,-10 Q-60,-50 -22,-76 Z" fill={color} stroke="url(#gold)" strokeWidth={2} />
    <path d="M-44,-40 Q0,-30 44,-40" stroke="url(#gold)" strokeWidth={1.4} fill="none" opacity={0.7} />
  </g>
);

/** 带羽饰的旗杆（图腾为图标，非文字） */
export const Banner: React.FC<{x: number; y: number; h?: number; f: number; color?: string; icon?: 'bird' | 'fish' | 'sun'}> = ({x, y, h = 300, f, color = '#a8332a', icon = 'bird'}) => {
  const w = noise(f / 25, x) * 16;
  return (
    <g transform={`translate(${x},${y})`}>
      <path d={`M0,0 L0,${-h}`} stroke="#3a2614" strokeWidth={6} />
      <path d={`M0,${-h} Q${50 + w},${-h + 20} ${100 + w * 1.5},${-h + 10 + w * 0.5} L${96 + w},${-h + 90 + w * 0.4} Q${48 + w * 0.5},${-h + 100} 0,${-h + 86} Z`} fill={color} stroke="url(#gold)" strokeWidth={2} />
      {icon === 'bird' && <path d={`M${30 + w * 0.5},${-h + 50} q14,-16 30,-4 q-10,2 -12,10 q-8,-4 -18,-6z`} fill="#e8c470" />}
      {icon === 'sun' && <circle cx={50 + w * 0.5} cy={-h + 48} r={14} fill="none" stroke="#e8c470" strokeWidth={3} />}
      {icon === 'fish' && <path d={`M${30 + w * 0.5},${-h + 48} q16,-12 30,0 q-14,12 -30,0 l-8,-8 l0,16z`} fill="#e8c470" />}
    </g>
  );
};

/** 特写手臂与手：前臂 + 手掌 + 四指两节 + 拇指，整组描金外轮廓（关节不断线），袖口描金
 *  ang：前臂方向（0 = 指向 +x）；bend：手指相对掌的弯折角（负值向上翘，推掌用 -75）；curl：指节卷曲 0~1 */
export const ArmCloseup: React.FC<{x: number; y: number; ang: number; s?: number; bend?: number; curl?: number; sleeve: string; skin: string; bracelet?: boolean; wrinkles?: boolean; armLen?: number; thumb?: number}> =
  ({x, y, ang, s = 1, bend = 0, curl = 0.15, sleeve, skin, bracelet, wrinkles, armLen = 760, thumb = -40}) => {
  type V = [number, number];
  const r = (d: number) => (d * Math.PI) / 180;
  const cap = (a: V, b: V, ra: number, rb: number) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, n: V = [-dy / L, dx / L];
    const c = (p: V, rr: number) => `M${p[0] - rr},${p[1]} a${rr},${rr} 0 1,0 ${2 * rr},0 a${rr},${rr} 0 1,0 ${-2 * rr},0`;
    return `M${a[0] + n[0] * ra},${a[1] + n[1] * ra} L${b[0] + n[0] * rb},${b[1] + n[1] * rb} L${b[0] - n[0] * rb},${b[1] - n[1] * rb} L${a[0] - n[0] * ra},${a[1] - n[1] * ra}Z ${c(a, ra)} ${c(b, rb)}`;
  };
  const pt = (o: V, deg: number, len: number): V => [o[0] + Math.cos(r(deg)) * len, o[1] + Math.sin(r(deg)) * len];
  // 手掌：腕 (0,0) → 指根 (95, 0)
  const palm = 'M0,-34 Q50,-46 96,-34 Q112,0 96,34 Q50,46 0,34 Q-10,0 0,-34Z';
  const fingers: string[] = [];
  [-27, -9, 9, 26].forEach((fy, i) => {
    const base: V = [94, fy * 0.95];
    const l1 = [34, 38, 36, 28][i], l2 = [26, 30, 28, 22][i];
    const a1 = bend + (fy * 0.15);
    const k1 = pt(base, a1, l1);
    const k2 = pt(k1, a1 + curl * 70, l2);
    fingers.push(cap(base, k1, 10.5 - i * 0.6, 9.2 - i * 0.5) + ' ' + cap(k1, k2, 9.2 - i * 0.5, 7.6 - i * 0.5));
  });
  const tb: V = [26, -30];
  const t1 = pt(tb, thumb + bend * 0.3, 40), t2 = pt(t1, thumb + bend * 0.3 + 20, 30);
  fingers.push(cap(tb, t1, 13, 11) + ' ' + cap(t1, t2, 11, 9));
  const fore = cap([-armLen, 0], [6, 0], 56, 38);
  const parts = [fore, palm, ...fingers];
  return (
    <g transform={`translate(${x},${y}) rotate(${ang}) scale(${s})`} filter="url(#lqSoft)">
      {parts.map((d, i) => <path key={'o' + i} d={d} fill="url(#gold)" stroke="url(#gold)" strokeWidth={6 / s} strokeLinejoin="round" />)}
      {parts.map((d, i) => <path key={'f' + i} d={d} fill={i === 0 ? shade(skin, -0.06) : skin} />)}
      {wrinkles && <path d="M30,-14 q18,5 36,0 M24,10 q20,5 40,0 M-60,-20 q14,4 28,0" stroke={shade(skin, -0.32)} strokeWidth={2.6} fill="none" opacity={0.75} />}
      <path d={`M${-armLen - 40},-82 L-120,-70 Q-90,0 -120,70 L${-armLen - 40},82 Z`} fill={sleeve} stroke="url(#gold)" strokeWidth={4 / s} />
      <path d="M-150,-74 Q-118,0 -150,74" stroke="url(#gold)" strokeWidth={12} fill="none" />
      <path d="M-178,-76 Q-146,0 -178,76" stroke={shade(sleeve, -0.32)} strokeWidth={5} fill="none" />
      {bracelet && <ellipse cx={-36} cy={0} rx={14} ry={46} fill="none" stroke="#7fd0b0" strokeWidth={10} />}
    </g>
  );
};

/** 月/日：漆圆 */
export const Disc: React.FC<{x: number; y: number; r: number; color: string; glow?: string}> = ({x, y, r, color, glow}) => (
  <g>
    {glow && <circle cx={x} cy={y} r={r * 2.2} fill={glow} opacity={0.25} />}
    <circle cx={x} cy={y} r={r} fill={color} filter="url(#lqObj)" />
    <circle cx={x} cy={y} r={r} fill="none" stroke="url(#gold)" strokeWidth={3} />
  </g>
);

/** 远处树（漆绘团状树冠） */
export const Tree: React.FC<{x: number; y: number; s?: number; f: number; color?: string}> = ({x, y, s = 1, f, color = '#2a3a2a'}) => {
  const sw = noise(f / 50, x) * 4;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <path d="M-6,0 L-4,-110 L4,-110 L6,0 Z" fill="#2a1a10" />
      {[[-30, -120, 50], [26, -130, 46], [0, -170, 56]].map(([cx, cy, r], i) => (
        <g key={i}><circle cx={cx + sw} cy={cy} r={r} fill={shade(color, i * 0.06)} /><circle cx={cx + sw} cy={cy} r={r} fill="none" stroke="url(#gold)" strokeWidth={1.6} opacity={0.6} /></g>
      ))}
    </g>
  );
};
