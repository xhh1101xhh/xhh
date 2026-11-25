import React from 'react';
import {clamp, prog, easeInOut, easeOut, easeIn, lerp, mulberry32} from '../lib/anim';

/** 每种转场在切点 T 前后各占多少帧 */
export const TRANS_WIN: Record<string, [number, number]> = {
  lacquerDrip: [0, 22], punchCut: [10, 12], sheenWipe: [8, 12], rackFocus: [10, 14], diveThrough: [12, 12],
  shatterToWater: [2, 16], tihongPeel: [4, 16], whipPan: [7, 10], inkBloom: [10, 14], ropeSweep: [4, 14],
  rainWipe: [4, 14], lightSlit: [6, 16], craneUp: [10, 14], guiMatch: [8, 10],
};

type TS = {outer?: React.CSSProperties; inner?: React.CSSProperties};
const full: React.CSSProperties = {position: 'absolute', inset: 0};

/** 出场景样式 */
export function outStyle(tr: string, f: number, T: number, opt: any = {}): React.CSSProperties {
  const [pre, post] = TRANS_WIN[tr] ?? [0, 0];
  const a = prog(f, T - pre, T + post, easeInOut);
  switch (tr) {
    case 'punchCut': {
      const p = prog(f, T - pre, T, easeIn);
      const [cx, cy] = opt.focus ?? [960, 540];
      return {transform: `scale(${1 + p * 0.9})`, transformOrigin: `${cx}px ${cy}px`, filter: `blur(${p * 6}px)`, opacity: f >= T ? 0 : 1};
    }
    case 'rackFocus': return {filter: `blur(${a * 26}px)`, opacity: 1 - prog(f, T - 2, T + post)};
    case 'diveThrough': {
      const p = prog(f, T - pre, T + 4, easeIn);
      const [cx, cy] = opt.focus ?? [960, 540];
      return {transform: `scale(${1 + p * 5})`, transformOrigin: `${cx}px ${cy}px`, opacity: 1 - prog(f, T - 3, T + 4)};
    }
    case 'whipPan': {
      const p = prog(f, T - pre, T + 2, easeIn);
      return {transform: `translateX(${-p * 1500}px)`, filter: p > 0.05 ? 'url(#dirBlurX)' : undefined, opacity: f > T + 2 ? 0 : 1};
    }
    case 'craneUp': {
      const p = prog(f, T - pre, T + post, easeInOut);
      return {transform: `translateY(${p * 1000}px) scale(${1 - p * 0.25})`, transformOrigin: '960px 1080px', opacity: 1 - prog(f, T, T + post)};
    }
    case 'guiMatch': return {opacity: 1 - prog(f, T - 2, T + post)};
    case 'shatterToWater': return {opacity: f >= T ? 0 : 1};
    default: return {opacity: f >= T + post ? 0 : 1};
  }
}

/** 入场景样式（clip/变换） */
export function inStyle(tr: string, f: number, T: number, opt: any = {}): React.CSSProperties {
  const [pre, post] = TRANS_WIN[tr] ?? [0, 0];
  switch (tr) {
    case 'lacquerDrip': {
      const p = prog(f, T, T + post, easeOut);
      const [cx, cy] = opt.focus ?? [960, 560];
      return {clipPath: `circle(${p * 1300 + 4}px at ${cx}px ${cy}px)`};
    }
    case 'punchCut': {
      const p = prog(f, T, T + post, easeOut);
      return {transform: `scale(${1.12 - 0.12 * p})`, opacity: f >= T ? 1 : 0};
    }
    case 'sheenWipe': {
      const p = prog(f, T - pre, T + post, easeInOut);
      return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`};
    }
    case 'rackFocus': {
      const p = prog(f, T - pre, T + post, easeInOut);
      return {filter: `blur(${(1 - p) * 26}px)`, opacity: prog(f, T - pre, T + 4)};
    }
    case 'diveThrough': {
      const p = prog(f, T - 4, T + post, easeOut);
      return {transform: `scale(${0.6 + 0.4 * p})`, opacity: prog(f, T - 4, T + 3)};
    }
    case 'shatterToWater': return {opacity: f >= T ? 1 : 0};
    case 'tihongPeel': {
      const p = prog(f, T - pre, T + post, easeInOut);
      return {clipPath: `polygon(${zigzag(p).join(',')})`};
    }
    case 'whipPan': {
      const p = prog(f, T - 1, T + post, easeOut);
      return {transform: `translateX(${(1 - p) * 1400}px)`, filter: p < 0.85 ? 'url(#dirBlurX)' : undefined, opacity: f >= T - 1 ? 1 : 0};
    }
    case 'inkBloom': return {opacity: prog(f, T, T + post)};
    case 'ropeSweep': {
      const p = prog(f, T - pre, T + post, easeInOut);
      return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`};
    }
    case 'rainWipe': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const x = lerp(2400, -600, p);
      return {clipPath: `polygon(${x}px 0, 2400px 0, 2400px 1080px, ${x - 600}px 1080px)`};
    }
    case 'lightSlit': {
      const p = prog(f, T - 2, T + post, easeInOut);
      const cx = opt.slitX ?? 960;
      const w = lerp(6, 2100, p);
      return {clipPath: `inset(0 ${Math.max(0, 1920 - (cx + w / 2))}px 0 ${Math.max(0, cx - w / 2)}px)`, opacity: f >= T - 2 ? 1 : 0};
    }
    case 'craneUp': {
      const p = prog(f, T - 4, T + post, easeOut);
      return {transform: `translateY(${(1 - p) * -900}px) scale(${1.3 - 0.3 * p})`, transformOrigin: '960px 0px', opacity: prog(f, T - 4, T + 2)};
    }
    case 'guiMatch': return {opacity: prog(f, T - pre, T + 2)};
    default: return {};
  }
}

function zigzag(p: number): string[] {
  // 剔红剥层：沿对角线推进的锯齿形边界（左上已揭开）
  const k = lerp(-900, 3200, p);
  const pts: string[] = ['0px 0px'];
  const steps = 7;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = k - t * 1080 * 1.1 + (i % 2 ? 60 : -40);
    const y = t * 1080;
    pts.push(`${Math.max(-50, x)}px ${y}px`);
  }
  pts.push('0px 1080px');
  // 闭合到上边
  return [`0px 0px`, `${Math.max(0, k)}px 0px`, ...pts.slice(1)];
}

/** 转场覆盖层（光带、墨团、绳索、雨线、光缝、剔红边） */
export const TransOverlay: React.FC<{tr: string; f: number; T: number; opt?: any}> = ({tr, f, T, opt = {}}) => {
  const [pre, post] = TRANS_WIN[tr] ?? [0, 0];
  if (f < T - pre - 1 || f > T + post + 1) return null;
  switch (tr) {
    case 'lacquerDrip': {
      const fall = prog(f, T - 3, T, easeIn);
      const p = prog(f, T, T + post, easeOut);
      const [cx, cy] = opt.focus ?? [960, 560];
      return (
        <svg width={1920} height={1080} style={full}>
          {f < T && <ellipse cx={cx} cy={lerp(-40, cy, fall)} rx={10} ry={18} fill="#b8322a" />}
          {f >= T && <circle cx={cx} cy={cy} r={p * 1300 + 4} fill="none" stroke="#b8322a" strokeWidth={lerp(40, 2, p)} opacity={1 - p} filter="url(#roughEdge)" />}
        </svg>
      );
    }
    case 'punchCut': {
      const fl = f >= T && f < T + 3 ? 1 - (f - T) / 3 : 0;
      return <div style={{...full, background: '#fff2d0', opacity: fl * 0.55, mixBlendMode: 'screen'}} />;
    }
    case 'sheenWipe': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const x = p * 1920;
      return <div style={{...full, background: `linear-gradient(90deg, transparent ${x - 180}px, rgba(255,240,205,0.85) ${x - 10}px, #fff8e6 ${x}px, rgba(255,240,205,0.5) ${x + 40}px, transparent ${x + 160}px)`, mixBlendMode: 'screen'}} />;
    }
    case 'rackFocus': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      const r = mulberry32(7);
      return (
        <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}>
          {Array.from({length: 9}).map((_, i) => <circle key={i} cx={200 + r() * 1300} cy={150 + r() * 700} r={40 + r() * 90} fill="#ffd9a0" opacity={a * 0.18} />)}
        </svg>
      );
    }
    case 'shatterToWater': {
      const fl = f >= T && f < T + 4 ? 1 - (f - T) / 4 : 0;
      return <div style={{...full, background: '#e8f4ff', opacity: fl * 0.7, mixBlendMode: 'screen'}} />;
    }
    case 'tihongPeel': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const pts = zigzag(p).slice(2, -1).map(s => s.replace(/px/g, '').split(' ').map(Number));
      const line = pts.map(([x, y]) => `${x},${y}`).join(' ');
      return (
        <svg width={1920} height={1080} style={full}>
          {[0, 1, 2, 3].map(i => <polyline key={i} points={pts.map(([x, y]) => `${x + 10 + i * 9},${y}`).join(' ')} fill="none" stroke={['#e0463a', '#b02a20', '#7e1a12', '#3e0c08'][i]} strokeWidth={10} />)}
          <polyline points={line} fill="none" stroke="url(#gold)" strokeWidth={3} />
        </svg>
      );
    }
    case 'inkBloom': {
      const g = prog(f, T - pre, T + 2, easeOut);
      const fade = 1 - prog(f, T + 2, T + post);
      return (
        <svg width={1920} height={1080} style={full}>
          <circle cx={960} cy={540} r={g * 1250} fill="#0a0807" opacity={fade} filter="url(#inkEdge)" />
        </svg>
      );
    }
    case 'ropeSweep': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const x = p * 1920;
      let d = `M${x},-40`;
      for (let y = 0; y <= 1120; y += 40) d += ` L${x + Math.sin(y / 70 + f * 0.4) * 22},${y}`;
      return (
        <svg width={1920} height={1080} style={full}>
          <path d={d} stroke="#3a2614" strokeWidth={26} fill="none" />
          <path d={d} stroke="#a8844c" strokeWidth={18} fill="none" strokeDasharray="10 8" />
          <path d={d} stroke="url(#gold)" strokeWidth={3} fill="none" transform="translate(-9,0)" />
        </svg>
      );
    }
    case 'rainWipe': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const x = lerp(2400, -600, p);
      const r = mulberry32(f);
      return (
        <svg width={1920} height={1080} style={full}>
          {Array.from({length: 60}).map((_, i) => {
            const t = r(); const yy = r() * 1080; const xx = x - t * 600 + (yy / 1080) * -600 + 600 * (1 - yy / 1080) - 300 + r() * 120;
            return <line key={i} x1={xx} y1={yy} x2={xx - 26} y2={yy + 70} stroke="#cfe4ff" strokeWidth={2} opacity={0.5} />;
          })}
        </svg>
      );
    }
    case 'lightSlit': {
      const p = prog(f, T - pre, T + post, easeInOut);
      const cx = opt.slitX ?? 960, w = lerp(4, 2100, prog(f, T - 2, T + post, easeInOut));
      const a = f < T ? prog(f, T - pre, T) : 1 - prog(f, T, T + post);
      return <div style={{...full, background: `linear-gradient(90deg, transparent ${cx - w / 2 - 70}px, rgba(255,200,120,${0.9 * a}) ${cx - w / 2}px, transparent ${cx - w / 2 + 50}px, transparent ${cx + w / 2 - 50}px, rgba(255,200,120,${0.9 * a}) ${cx + w / 2}px, transparent ${cx + w / 2 + 70}px)`, mixBlendMode: 'screen', opacity: p < 1 ? 1 : 0}} />;
    }
    case 'craneUp': {
      const p = prog(f, T - pre, T + post);
      const a = 1 - Math.abs(p * 2 - 1);
      return (
        <svg width={1920} height={1080} style={full}>
          {[0, 1, 2, 3].map(i => <ellipse key={i} cx={300 + i * 450} cy={lerp(1200, -200, p) + i * 60} rx={420} ry={110} fill="#e8e2d4" opacity={a * 0.35} filter="url(#roughEdge)" />)}
        </svg>
      );
    }
    case 'whipPan': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <div style={{...full, background: `linear-gradient(90deg, transparent, rgba(255,235,200,${0.18 * a}), transparent)`}} />;
    }
    default: return null;
  }
};
