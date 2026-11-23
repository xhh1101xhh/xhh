import React from 'react';
import {Glaze, GoldLine, P} from './Paper';
import {noise1} from '../lib/anim';
import {roughEllipse, roughPoly, roughRect} from '../lib/paper';

const mixHex = (a: string, b: string, t: number) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) * (1 - t) + ((pb >> sh) & 255) * t);
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
};

/** 贯穿物件：瓷座玻璃提灯. Origin = bottom centre, ~230 units tall at scale 1.
 *  flame: size 0..1.3, cold: 0 warm -> 1 cold blue, glow: halo strength, crack / gold: 0..1 draw-on. */
export const Lantern: React.FC<{
  frame: number;
  id: string;
  flame?: number;
  cold?: number;
  glow?: number;
  crack?: number;
  gold?: number;
  lit?: boolean;
  swing?: number;
}> = ({frame, id, flame = 1, cold = 0, glow = 1, crack = 0, gold = 0, lit = true, swing = 0}) => {
  const fl = lit ? flame : 0;
  const wob = noise1(frame * 0.35, 3) * 0.12;
  const core = mixHex('#FFF4C8', '#E8F6FF', cold);
  const mid = mixHex('#FFB347', '#7FB6FF', cold);
  const outer = mixHex('#FF6E2A', '#3B6FD8', cold);
  const halo = mixHex('#FFB45A', '#6FA8DC', cold);
  const crackD = 'M -30 -150 L -18 -132 L -24 -118 L -8 -104 L -14 -88 L 2 -76';
  return (
    <g transform={`rotate(${swing} 0 -228)`}>
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0%" stopColor={halo} stopOpacity={0.75} />
          <stop offset="30%" stopColor={halo} stopOpacity={0.3} />
          <stop offset="100%" stopColor={halo} stopOpacity={0} />
        </radialGradient>
        <linearGradient id={`${id}-flame`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor={outer} />
          <stop offset="45%" stopColor={mid} />
          <stop offset="100%" stopColor={core} />
        </linearGradient>
      </defs>
      {fl > 0 ? <circle cx={0} cy={-118} r={300 * glow * (0.85 + fl * 0.25) * (1 + wob * 0.3)} fill={`url(#${id}-halo)`} style={{mixBlendMode: 'screen'}} /> : null}
      {/* handle ring + cap */}
      <circle cx={0} cy={-236} r={18} fill="none" stroke="#9C7330" strokeWidth={6} />
      <P d={roughPoly([[-34, -196], [-22, -216], [22, -216], [34, -196]], 501, 1.2)} fill="#B8893A" shadow={4} />
      <P d={roughRect(-40, -200, 80, 10, 502, 4, 1)} fill="#A07428" shadow={3} />
      {/* glass chimney */}
      <path d="M -36 -190 C -60 -160 -58 -96 -34 -66 L 34 -66 C 58 -96 60 -160 36 -190 Z" fill={`rgba(210,232,246,${0.16 + fl * 0.1})`} stroke="rgba(255,255,255,0.55)" strokeWidth={3} />
      {/* flame */}
      {fl > 0 ? (
        <g transform={`translate(0 -84) scale(${fl * (1 + wob)} ${fl * (1 - wob * 0.6)}) skewX(${noise1(frame * 0.2, 9) * 8})`}>
          <path d="M 0 -64 C 14 -40 22 -22 18 -8 C 14 4 -14 4 -18 -8 C -22 -22 -14 -40 0 -64 Z" fill={`url(#${id}-flame)`} />
          <path d="M 0 -40 C 7 -26 10 -16 8 -8 C 5 -2 -5 -2 -8 -8 C -10 -16 -7 -26 0 -40 Z" fill={core} opacity={0.9} />
        </g>
      ) : null}
      <rect x={-3} y={-84} width={6} height={18} fill="#3A2A20" />
      <Glaze cx={-26} cy={-140} rx={20} ry={40} rot={8} strength={0.9} />
      {crack > 0 ? (
        <path d={crackD} fill="none" stroke="#6FA8DC" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={200} strokeDashoffset={200 * (1 - crack)} />
      ) : null}
      {gold > 0 ? <GoldLine d={crackD} t={gold} width={4} length={200} /> : null}
      {/* brass collar */}
      <P d={roughRect(-44, -72, 88, 12, 503, 5, 1)} fill="#B8893A" shadow={3} />
      {/* porcelain base with blue-and-white band */}
      <P d={roughPoly([[-46, -62], [46, -62], [62, -24], [54, 0], [-54, 0], [-62, -24]], 504, 1.4)} fill="#ECE6D8" shadow={6} />
      <path d="M -56 -32 Q -42 -42 -28 -32 T 0 -32 T 28 -32 T 56 -32" fill="none" stroke="#3F6FA8" strokeWidth={5} strokeLinecap="round" />
      <path d="M -50 -16 Q -36 -24 -22 -16 T 6 -16 T 34 -16 T 52 -16" fill="none" stroke="#5A86BC" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
      {[-30, 0, 30].map((x) => (
        <circle key={x} cx={x} cy={-47} r={4} fill="#3F6FA8" />
      ))}
      <Glaze cx={-32} cy={-36} rx={14} ry={18} rot={-10} strength={0.8} />
      <P d={roughEllipse(0, -2, 56, 6, 505, 1)} fill="#C9C1AE" shadow={false} rim={false} />
    </g>
  );
};
