import React from 'react';
import {roughCircle, roughEllipse, roughPoly, roughRect} from '../lib/paper';

/** One cut paper piece: drop shadow (offset copy) + body + faint rim highlight. */
export const P: React.FC<{
  d: string;
  fill: string;
  shadow?: number | false;
  shadowColor?: string;
  opacity?: number;
  rim?: boolean;
  stroke?: string;
  strokeWidth?: number;
  transform?: string;
  style?: React.CSSProperties;
}> = ({d, fill, shadow = 6, shadowColor = 'rgba(6,4,10,0.42)', opacity = 1, rim = true, stroke, strokeWidth = 2, transform, style}) => (
  <g opacity={opacity} transform={transform} style={style}>
    {shadow ? <path d={d} fill={shadowColor} transform={`translate(${shadow * 0.55} ${shadow})`} /> : null}
    <path d={d} fill={fill} stroke={stroke} strokeWidth={stroke ? strokeWidth : undefined} strokeLinejoin="round" />
    {rim ? <path d={d} fill="none" stroke="rgba(255,244,226,0.10)" strokeWidth={1.4} transform="translate(-0.8 -1)" /> : null}
  </g>
);

export const PRect: React.FC<{x: number; y: number; w: number; h: number; seed: number; fill: string; r?: number; amp?: number; shadow?: number | false; opacity?: number; rim?: boolean}> = ({x, y, w, h, seed, fill, r = 4, amp = 2, shadow, opacity, rim}) => (
  <P d={roughRect(x, y, w, h, seed, r, amp)} fill={fill} shadow={shadow} opacity={opacity} rim={rim} />
);
export const PCircle: React.FC<{cx: number; cy: number; r: number; seed: number; fill: string; amp?: number; shadow?: number | false; opacity?: number; rim?: boolean}> = ({cx, cy, r, seed, fill, amp = 2, shadow, opacity, rim}) => (
  <P d={roughCircle(cx, cy, r, seed, amp)} fill={fill} shadow={shadow} opacity={opacity} rim={rim} />
);
export const PEllipse: React.FC<{cx: number; cy: number; rx: number; ry: number; seed: number; fill: string; amp?: number; shadow?: number | false; opacity?: number}> = ({cx, cy, rx, ry, seed, fill, amp = 2, shadow, opacity}) => (
  <P d={roughEllipse(cx, cy, rx, ry, seed, amp)} fill={fill} shadow={shadow} opacity={opacity} />
);
export const PPoly: React.FC<{pts: [number, number][]; seed: number; fill: string; amp?: number; shadow?: number | false; opacity?: number; rim?: boolean}> = ({pts, seed, fill, amp = 2, shadow, opacity, rim}) => (
  <P d={roughPoly(pts, seed, amp)} fill={fill} shadow={shadow} opacity={opacity} rim={rim} />
);

/** glaze highlight for porcelain / glass: two soft arcs */
export const Glaze: React.FC<{cx: number; cy: number; rx: number; ry: number; rot?: number; strength?: number}> = ({cx, cy, rx, ry, rot = -30, strength = 1}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${rot})`} opacity={strength}>
    <path d={`M ${-rx * 0.7} ${-ry * 0.2} A ${rx} ${ry} 0 0 1 ${rx * 0.2} ${-ry * 0.85}`} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth={Math.max(2, rx * 0.12)} strokeLinecap="round" />
    <path d={`M ${rx * 0.35} ${-ry * 0.7} A ${rx} ${ry} 0 0 1 ${rx * 0.55} ${-ry * 0.5}`} fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth={Math.max(1.5, rx * 0.08)} strokeLinecap="round" />
    <circle cx={-rx * 0.45} cy={-ry * 0.55} r={Math.max(1.5, rx * 0.06)} fill="rgba(255,255,255,0.9)" />
  </g>
);

/** soft radial glow (light, not paper) */
export const Glow: React.FC<{cx: number; cy: number; r: number; color: string; opacity?: number; id: string}> = ({cx, cy, r, color, opacity = 1, id}) => (
  <g opacity={opacity}>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} stopOpacity={0.85} />
        <stop offset="35%" stopColor={color} stopOpacity={0.35} />
        <stop offset="100%" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} style={{mixBlendMode: 'screen'}} />
  </g>
);

/** gold kintsugi line, drawn on with dashoffset (t 0..1) */
export const GoldLine: React.FC<{d: string; t: number; width?: number; length?: number}> = ({d, t, width = 4, length = 3000}) => (
  <g>
    <path d={d} fill="none" stroke="rgba(232,176,75,0.35)" strokeWidth={width * 3.2} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - t)} style={{filter: 'blur(4px)'}} />
    <path d={d} fill="none" stroke="#E8B04B" strokeWidth={width} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - t)} />
    <path d={d} fill="none" stroke="#FFE7A8" strokeWidth={width * 0.35} strokeLinecap="round" strokeDasharray={length} strokeDashoffset={length * (1 - t)} />
  </g>
);
