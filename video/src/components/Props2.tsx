import React from 'react';
import {mulberry32, noise, osc, shade, clamp, lerp} from '../lib/anim';
import {Qiangjin} from '../lacquer/Materials';

/** 祭天土台：三层圆台 + 描金边 */
export const Altar: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#5a4a3a'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    {[0, 1, 2].map(i => (
      <g key={i} filter="url(#lqObj)">
        <ellipse cx={0} cy={-i * 70} rx={420 - i * 110} ry={70 - i * 16} fill={shade(color, -0.2 + i * 0.08)} />
        <rect x={-(420 - i * 110)} y={-i * 70 - 70} width={(420 - i * 110) * 2} height={70} fill={shade(color, i * 0.06)} />
        <ellipse cx={0} cy={-i * 70 - 70} rx={420 - i * 110} ry={70 - i * 16} fill={shade(color, 0.1 + i * 0.05)} stroke="url(#gold)" strokeWidth={2.5} />
      </g>
    ))}
  </g>
);

/** 夯土城垣与城门 */
export const CityGate: React.FC<{x: number; y: number; s?: number; color?: string; open?: number}> = ({x, y, s = 1, color = '#7a5a36', open = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M-1400,0 L-1400,-260 L-150,-260 L-150,0 Z M150,0 L150,-260 L1400,-260 L1400,0 Z" fill={color} filter="url(#lqObj)" />
    {Array.from({length: 7}).map((_, i) => <path key={i} d={`M-1400,${-i * 37} L-150,${-i * 37} M150,${-i * 37} L1400,${-i * 37}`} stroke={shade(color, -0.25)} strokeWidth={2} />)}
    <path d="M-150,-260 L150,-260" stroke="url(#gold)" strokeWidth={3} />
    <path d="M-1400,-260 L-150,-260 M150,-260 L1400,-260" stroke="url(#gold)" strokeWidth={2.5} />
    <rect x={-150} y={-260} width={300} height={260} fill="#100a06" />
    <rect x={-150} y={-260} width={150 * (1 - open)} height={260} fill="#4a301a" stroke="url(#gold)" strokeWidth={2} />
    <rect x={150 - 150 * (1 - open)} y={-260} width={150 * (1 - open)} height={260} fill="#4a301a" stroke="url(#gold)" strokeWidth={2} />
    <path d="M-190,-260 L0,-340 L190,-260 Z" fill={shade(color, -0.15)} stroke="url(#gold)" strokeWidth={2} />
  </g>
);

/** 席（编织纹草席） */
export const Mat: React.FC<{x: number; y: number; w?: number; h?: number; color?: string}> = ({x, y, w = 260, h = 70, color = '#8a7448'}) => (
  <g transform={`translate(${x},${y})`}>
    <path d={`M${-w / 2},0 L${w / 2},0 L${w / 2 - 30},${-h} L${-w / 2 + 30},${-h} Z`} fill={color} stroke="url(#gold)" strokeWidth={2} />
    {Array.from({length: 9}).map((_, i) => <path key={i} d={`M${-w / 2 + 10 + i * (w - 20) / 8},-2 L${-w / 2 + 34 + i * (w - 68) / 8},${-h + 2}`} stroke={shade(color, -0.25)} strokeWidth={1.6} />)}
  </g>
);

/** 草顶大屋内景：立柱 + 梁 + 窗光 */
export const HallInterior: React.FC<{f: number; color?: string; light?: number}> = ({f, color = '#3a3634', light = 0.5}) => (
  <g>
    <path d="M-300,-300 L2300,-300 L2300,860 L-300,860 Z" fill={shade(color, -0.1)} />
    <path d="M-300,860 L2300,860 L2300,1400 L-300,1400 Z" fill={shade(color, -0.3)} />
    <path d="M-300,860 L2300,860" stroke="url(#gold)" strokeWidth={2} opacity={0.6} />
    {[200, 700, 1220, 1720].map((px, i) => (
      <g key={i}><rect x={px - 26} y={-200} width={52} height={1060} fill="#2a1a10" filter="url(#lqObj)" /><path d={`M${px - 26},-200 L${px - 26},860`} stroke="url(#gold)" strokeWidth={1.6} opacity={0.6} /></g>
    ))}
    <path d="M-300,90 L2300,90" stroke="#24160c" strokeWidth={40} />
    <path d="M-300,70 L2300,70" stroke="url(#gold)" strokeWidth={2} opacity={0.6} />
    <rect x={880} y={260} width={180} height={300} fill="#f0d8a0" opacity={0.18 * light} />
    <path d={`M880,260 L1060,260 L${1300 + osc(f, 600) * 40},1100 L${600 + osc(f, 600) * 40},1100 Z`} fill="#fff0c8" opacity={0.08 * light} />
  </g>
);

/** 火把（立柱） */
export const Torch: React.FC<{x: number; y: number; s?: number; f: number; seed?: number}> = ({x, y, s = 1, f, seed = 0}) => {
  const w = noise(f / 5, seed) * 6;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={-120} rx={70} ry={80} fill="url(#fireGlow)" opacity={0.8} />
      <path d="M-5,0 L-6,-100 L6,-100 L5,0 Z" fill="#3a2414" />
      <path d={`M-12,-100 Q${-14 + w},-130 ${w},-${150 + noise(f / 4, seed + 1) * 12} Q${14 + w},-130 12,-100 Z`} fill="#f08a2a" />
      <path d={`M-6,-100 Q${-6 + w},-120 ${w * 0.6},-${132 + noise(f / 4, seed + 2) * 8} Q${6 + w},-120 6,-100 Z`} fill="#ffd36a" />
    </g>
  );
};

/** 烛台（战国） */
export const Candle: React.FC<{x: number; y: number; s?: number; f: number}> = ({x, y, s = 1, f}) => {
  const w = noise(f / 6, 9) * 4;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <ellipse cx={0} cy={-90} rx={160} ry={150} fill="url(#fireGlow)" opacity={0.7 + osc(f, 13) * 0.08} />
      <path d="M-40,0 L40,0 L24,-14 L-24,-14 Z M-6,-14 L-6,-60 L6,-60 L6,-14 Z" fill="#6a4a22" stroke="url(#gold)" strokeWidth={2} />
      <rect x={-9} y={-90} width={18} height={30} fill="#e8dcc0" />
      <path d={`M0,-90 Q${-8 + w},-104 ${w},-${122 + noise(f / 5, 3) * 6} Q${8 + w},-104 0,-90 Z`} fill="#ffcf70" />
    </g>
  );
};

/** 竹简卷：横向展开 progress，简面只有描金纹样不显字 */
export const BambooScroll: React.FC<{x: number; y: number; n?: number; open?: number; s?: number; color?: string; f?: number}> = ({x, y, n = 18, open = 1, s = 1, color = '#c8a868', f = 0}) => {
  const k = Math.max(1, Math.round(n * clamp(open)));
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      {Array.from({length: k}).map((_, i) => (
        <g key={i} transform={`translate(${i * 22},0)`}>
          <rect x={0} y={0} width={19} height={240} rx={3} fill={shade(color, (i % 3) * 0.04 - 0.04)} stroke="#6a4a22" strokeWidth={1} />
          {[0, 1, 2, 3, 4, 5, 6].map(j => <path key={j} d={`M5,${18 + j * 30} l9,0 m-6,8 l4,4`} stroke="#3a2412" strokeWidth={2} opacity={0.7} />)}
        </g>
      ))}
      <path d={`M0,40 L${k * 22},40 M0,200 L${k * 22},200`} stroke="#5a3a1a" strokeWidth={3} />
    </g>
  );
};

/** 印章图标：描金边朱漆方印，印面为图形 */
export const SealIcon: React.FC<{x: number; y: number; s?: number; kind: 'hands' | 'walk' | 'torch' | 'big'; scale?: number; rot?: number}> = ({x, y, s = 1, kind, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} filter="url(#lqObj)">
    <rect x={-80} y={-80} width={160} height={160} rx={10} fill="#a8281e" />
    <rect x={-68} y={-68} width={136} height={136} rx={6} fill="none" stroke="url(#gold)" strokeWidth={5} />
    {kind === 'hands' && <path d="M-40,20 Q-30,-30 0,-10 Q30,-30 40,20 M-30,22 L30,22 M0,-10 L0,-40 L-10,-50 L10,-50 Z" stroke="#f4d088" strokeWidth={7} fill="none" strokeLinecap="round" />}
    {kind === 'walk' && <g fill="#f4d088"><ellipse cx={-20} cy={20} rx={12} ry={20} /><ellipse cx={18} cy={-18} rx={12} ry={20} /><circle cx={-26} cy={-6} r={4} /><circle cx={12} cy={-44} r={4} /></g>}
    {kind === 'torch' && <g><path d="M-36,40 L-10,-10 M36,40 L10,-10 M0,40 L0,-14" stroke="#f4d088" strokeWidth={7} /><circle cx={0} cy={-26} r={14} fill="#f4d088" /></g>}
    {kind === 'big' && <path d="M-46,-46 L46,-46 L46,46 L-46,46 Z M-20,-20 L20,20 M20,-20 L-20,20" stroke="#f4d088" strokeWidth={8} fill="none" />}
  </g>
);

/** 漆牌（可翻面）：flip 0 正面 → 1 背面 */
export const LacquerCard: React.FC<{x: number; y: number; flip: number; w?: number; h?: number; children?: React.ReactNode; back?: string; glow?: number}> = ({x, y, flip, w = 300, h = 440, children, back = '#1c1410', glow = 0}) => {
  const sx = Math.cos(flip * Math.PI);
  const front = sx < 0;
  return (
    <g transform={`translate(${x},${y}) scale(${Math.max(0.02, Math.abs(sx))},1)`}>
      {glow > 0 && <rect x={-w / 2 - 20} y={-h / 2 - 20} width={w + 40} height={h + 40} rx={20} fill="#ffd890" opacity={glow * 0.3} />}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={front ? '#2a1e16' : back} filter="url(#lqObj)" />
      <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={8} fill="none" stroke="url(#gold)" strokeWidth={3} />
      {!front && <path d={`M0,${-h / 4} l40,40 l-40,40 l-40,-40 Z`} fill="none" stroke="url(#gold)" strokeWidth={3} />}
      {front && <g transform="scale(-1,1)">{children}</g>}
    </g>
  );
};

/** 脚印（某部落纹样） */
export const Footprint: React.FC<{x: number; y: number; rot: number; s?: number; color?: string; o?: number}> = ({x, y, rot, s = 1, color = '#e2b65c', o = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o}>
    <ellipse cx={0} cy={0} rx={9} ry={15} fill={color} />
    {[-7, -2, 3, 7].map((dx, i) => <circle key={i} cx={dx} cy={-19 + Math.abs(dx) * 0.3} r={2.6} fill={color} />)}
  </g>
);

/** 玉璧 / 帛 图标 */
export const JadeBi: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#lqShadow)">
    <circle r={30} fill="#6fbfa0" stroke="url(#gold)" strokeWidth={2.5} />
    <circle r={10} fill="#1a1410" />
    <circle r={20} fill="none" stroke="#9fe0c4" strokeWidth={2} opacity={0.6} />
  </g>
);
export const Silk: React.FC<{x: number; y: number; s?: number; color?: string; f?: number}> = ({x, y, s = 1, color = '#d8c6a0', f = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d={`M-34,-14 Q0,${-24 + osc(f, 30) * 4} 34,-14 L34,14 Q0,${4 + osc(f, 30) * 4} -34,14 Z`} fill={color} stroke="url(#gold)" strokeWidth={2} />
    <path d="M-34,0 Q0,-10 34,0" stroke={shade(color, -0.25)} strokeWidth={1.5} fill="none" />
  </g>
);

/** 帐篷（启的营地） */
export const Tent: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#6a4a2a'}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} filter="url(#lqObj)">
    <path d="M-150,0 L0,-200 L150,0 Z" fill={color} />
    <path d="M-150,0 L0,-200 L150,0" stroke="url(#gold)" strokeWidth={2.5} fill="none" />
    <path d="M-30,0 L0,-90 L30,0 Z" fill="#140c06" />
    <path d="M0,-200 L0,-240 M0,-232 l22,8 l-22,8" stroke="#e8c470" strokeWidth={3} fill="#a8332a" />
  </g>
);

/** 石钺 */
export const StoneAxe: React.FC<{x: number; y: number; rot?: number; s?: number}> = ({x, y, rot = 0, s = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} filter="url(#lqObj)">
    <path d="M-4,-160 L4,-160 L5,40 L-5,40 Z" fill="#5a3a1e" />
    <path d="M-6,-170 Q-60,-180 -64,-130 Q-60,-90 -6,-100 Z" fill="#6c7a74" stroke="url(#gold)" strokeWidth={2} />
    <circle cx={-26} cy={-136} r={8} fill="#1a1410" />
  </g>
);

/** 漆板（带描金框的半透明画板） */
export const Panel: React.FC<{x: number; y: number; w: number; h: number; o?: number; children?: React.ReactNode; color?: string}> = ({x, y, w, h, o = 1, children, color = '#2a1a14'}) => (
  <g transform={`translate(${x},${y})`} opacity={o}>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={12} fill={color} opacity={0.85} filter="url(#lqObj)" />
    <g>{children}</g>
    <rect x={-w / 2 + 10} y={-h / 2 + 10} width={w - 20} height={h - 20} rx={8} fill="none" stroke="url(#gold)" strokeWidth={4} />
  </g>
);

/** 链环（小圭环相扣） */
export const GuiChain: React.FC<{x0: number; y0: number; x1: number; y1: number; n: number; grow: number; f: number; s?: number}> = ({x0, y0, x1, y1, n, grow, f, s = 1}) => {
  const k = Math.min(n, Math.max(0, grow));
  return (
    <g>
      {Array.from({length: Math.ceil(k)}).map((_, i) => {
        const t = n <= 1 ? 0 : i / (n - 1);
        const x = lerp(x0, x1, t), y = lerp(y0, y1, t);
        const sc = s * lerp(1, 0.35, t) * clamp(k - i);
        return (
          <g key={i} transform={`translate(${x},${y}) scale(${sc})`}>
            <ellipse rx={34} ry={22} fill="none" stroke="url(#gold)" strokeWidth={8} />
            <path d="M0,-14 L8,-4 L8,12 L-8,12 L-8,-4 Z" fill="#141210" stroke="url(#gold)" strokeWidth={2} />
          </g>
        );
      })}
    </g>
  );
};
