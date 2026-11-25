import React from 'react';
import {clamp, prog, easeInOut, easeOut, easeIn, lerp, mulberry32, springAt, osc} from '../lib/anim';

/** 每种转场在切点 T 前后各占多少帧 */
export const TRANS_WIN: Record<string, [number, number]> = {
  lacquerDrip: [0, 22], punchCut: [10, 12], sheenWipe: [8, 12], rackFocus: [10, 14], diveThrough: [12, 12],
  shatterToWater: [2, 16], tihongPeel: [4, 16], whipPan: [7, 10], inkBloom: [10, 14], ropeSweep: [4, 14],
  rainWipe: [4, 14], lightSlit: [6, 16], craneUp: [10, 14], guiMatch: [8, 10],
  mopGather: [8, 14], makieDust: [8, 14], leafWipe: [6, 14], dollyPan: [10, 12], sunDial: [6, 14], lightStream: [8, 12],
  rewind: [2, 6], splitOpen: [4, 12], boxFold: [8, 10], sealStamp: [6, 12], cardFlip: [7, 9], diveCard: [8, 12],
  scrollOpen: [4, 14], smokeFog: [10, 12], fogPart: [4, 16], rushIn: [8, 10], panelFlip: [7, 9], zhuSplash: [3, 12],
  snapOut: [6, 12], xipiAge: [10, 14], followBack: [10, 12], layerPush: [6, 14], crackOpen: [4, 14], goldSweep: [6, 14],
  axeSlash: [3, 12], slipsScatter: [4, 14], shardsReform: [8, 12], goldLeaf: [10, 12], chainGather: [10, 10], doorsClose: [0, 0],
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
    case 'mopGather': return {opacity: 1 - prog(f, T - pre, T + 4), filter: `brightness(${1 + prog(f, T - pre, T) * 0.4})`};
    case 'makieDust': { const p = prog(f, T - pre, T + post); return {WebkitMaskImage: `linear-gradient(90deg, transparent ${p * 120 - 20}%, #000 ${p * 120 + 10}%)`, maskImage: `linear-gradient(90deg, transparent ${p * 120 - 20}%, #000 ${p * 120 + 10}%)`}; }
    case 'dollyPan': { const p = prog(f, T - pre, T + post, easeInOut); return {transform: `translateX(${-p * 1920}px)`}; }
    case 'lightStream': return {filter: `brightness(${1 - prog(f, T - pre, T) * 0.6})`, opacity: 1 - prog(f, T, T + post)};
    case 'rewind': return {opacity: f >= T ? 0 : 1};
    case 'boxFold': { const p = prog(f, T - pre, T, easeIn); return {transform: `perspective(1600px) rotateY(${p * 90}deg)`, transformOrigin: '0px 540px', filter: `brightness(${1 - p * 0.6})`, opacity: f >= T ? 0 : 1}; }
    case 'cardFlip': { const p = prog(f, T - pre, T, easeIn); return {transform: `perspective(1800px) rotateY(${p * 90}deg)`, transformOrigin: '960px 540px', opacity: f >= T ? 0 : 1}; }
    case 'diveCard': { const p = prog(f, T - pre, T + 4, easeIn); return {transform: `scale(${1 + p * 3})`, transformOrigin: '1360px 560px', opacity: 1 - prog(f, T - 2, T + 4)}; }
    case 'smokeFog': return {filter: `blur(${prog(f, T - pre, T + post) * 18}px)`, opacity: 1 - prog(f, T - 2, T + post)};
    case 'rushIn': { const p = prog(f, T - pre, T, easeIn); return {transform: `scale(${1 + p * 1.2})`, filter: `blur(${p * 10}px)`, opacity: f >= T + 2 ? 0 : 1}; }
    case 'panelFlip': { const p = prog(f, T - pre, T, easeIn); return {transform: `perspective(1800px) rotateX(${-p * 90}deg)`, transformOrigin: '960px 540px', opacity: f >= T ? 0 : 1}; }
    case 'snapOut': { const p = prog(f, T - pre, T + post, easeIn); return {transform: `scale(${1 - p * 0.75})`, opacity: 1 - prog(f, T, T + post)}; }
    case 'xipiAge': return {opacity: 1 - prog(f, T - 2, T + post), filter: `sepia(${prog(f, T - pre, T)})`};
    case 'followBack': { const p = prog(f, T - pre, T + post, easeIn); return {transform: `scale(${1 + p * 0.6}) translateX(${-p * 200}px)`, opacity: 1 - prog(f, T - 2, T + post)}; }
    case 'layerPush': return {filter: `brightness(${1 - prog(f, T - pre, T + post) * 0.6})`, opacity: 1 - prog(f, T + 2, T + post)};
    case 'shardsReform': return {opacity: 1 - prog(f, T - pre, T)};
    case 'goldLeaf': return {opacity: f >= T ? 0 : 1};
    case 'chainGather': { const p = prog(f, T - pre, T + post, easeIn); return {transform: `scale(${1 - p * 0.95})`, transformOrigin: '960px 540px', opacity: 1 - prog(f, T, T + post)}; }
    case 'sealStamp': return {opacity: f >= T ? 0 : 1};
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
    case 'mopGather': { const p = prog(f, T - 2, T + post, easeOut); return {opacity: prog(f, T - 2, T + 6), transform: `scale(${1.06 - 0.06 * p})`}; }
    case 'makieDust': return {};
    case 'leafWipe': { const p = prog(f, T - pre, T + post, easeInOut); return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}; }
    case 'dollyPan': { const p = prog(f, T - pre, T + post, easeInOut); return {transform: `translateX(${(1 - p) * 1920}px)`}; }
    case 'sunDial': { const p = prog(f, T - pre, T + post, easeInOut); const a = p * 360; return {WebkitMaskImage: `conic-gradient(from 0deg at 50% 60%, #000 ${a}deg, transparent ${a + 1}deg)`, maskImage: `conic-gradient(from 0deg at 50% 60%, #000 ${a}deg, transparent ${a + 1}deg)`}; }
    case 'lightStream': { const p = prog(f, T - 2, T + post, easeOut); return {clipPath: `circle(${p * 1300 + 2}px at 960px 760px)`}; }
    case 'rewind': return {opacity: f >= T ? 1 : 0};
    case 'splitOpen': { const p = prog(f, T - pre, T + post, easeInOut); const w = p * 960; return {clipPath: `inset(0 ${960 - w}px 0 ${960 - w}px)`}; }
    case 'boxFold': { const p = prog(f, T, T + post, easeOut); return {transform: `perspective(1600px) rotateY(${(1 - p) * -90}deg)`, transformOrigin: '1920px 540px', opacity: f >= T ? 1 : 0}; }
    case 'sealStamp': return {opacity: f >= T ? 1 : 0};
    case 'cardFlip': { const p = prog(f, T, T + post, easeOut); return {transform: `perspective(1800px) rotateY(${(1 - p) * -90}deg)`, transformOrigin: '960px 540px', opacity: f >= T ? 1 : 0}; }
    case 'diveCard': { const p = prog(f, T - 4, T + post, easeOut); return {clipPath: `inset(${(1 - p) * 320}px ${(1 - p) * 410}px ${(1 - p) * 300}px ${(1 - p) * 1210}px round ${(1 - p) * 20}px)`, opacity: f >= T - 4 ? 1 : 0}; }
    case 'scrollOpen': { const p = prog(f, T - pre, T + post, easeInOut); return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}; }
    case 'smokeFog': return {filter: `blur(${(1 - prog(f, T - 2, T + post)) * 16}px)`, opacity: prog(f, T - 4, T + post)};
    case 'fogPart': return {opacity: prog(f, T - pre, T + 2)};
    case 'rushIn': { const p = prog(f, T, T + post, easeOut); return {transform: `scale(${1.4 - 0.4 * p})`, opacity: f >= T ? 1 : 0}; }
    case 'panelFlip': { const p = prog(f, T, T + post, easeOut); return {transform: `perspective(1800px) rotateX(${(1 - p) * 90}deg)`, transformOrigin: '960px 540px', opacity: f >= T ? 1 : 0}; }
    case 'zhuSplash': { const p = prog(f, T - pre, T + post, easeOut); const x = lerp(2400, -900, p); return {clipPath: `polygon(${x}px 0, 2400px 0, 2400px 1080px, ${x + 700}px 1080px)`}; }
    case 'snapOut': { const p = prog(f, T - 2, T + post, easeOut); return {transform: `scale(${2 - p})`, opacity: prog(f, T - 2, T + 4)}; }
    case 'xipiAge': return {opacity: prog(f, T - 2, T + post)};
    case 'followBack': { const p = prog(f, T - 2, T + post, easeOut); return {transform: `translateX(${(1 - p) * 420}px)`, opacity: prog(f, T - 2, T + 6)}; }
    case 'layerPush': { const p = springAt(f, T - pre, {damping: 15, stiffness: 120}); return {transform: `scale(${0.45 + 0.55 * p})`, opacity: f >= T - pre ? 1 : 0, boxShadow: '0 0 0 6px #d9b062'}; }
    case 'crackOpen': { const p = prog(f, T - pre, T + post, easeInOut); const w = p * 1100; const pts = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => [960 + (i % 2 ? 40 : -30), t * 1080]); return {clipPath: `polygon(${pts.map(([x, y]) => `${x - w}px ${y}px`).join(',')},${pts.reverse().map(([x, y]) => `${x + w}px ${y}px`).join(',')})`}; }
    case 'goldSweep': { const p = prog(f, T - pre, T + post, easeInOut); return {clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}; }
    case 'axeSlash': { const p = prog(f, T, T + post, easeOut); const w = p * 1500 + (f >= T ? 4 : 0); return {clipPath: `polygon(${1400 - w}px 0, ${1400 + w}px 0, ${520 + w}px 1080px, ${520 - w}px 1080px)`}; }
    case 'slipsScatter': { const p = prog(f, T - pre, T + post); const n = 12, out: string[] = ['0px 0px']; for (let i = 0; i < n; i++) { const x0 = i * 160, h = clamp(p * 1.3 - i * 0.025) * 1080; out.push(`${x0}px 0px`, `${x0}px ${h}px`, `${x0 + 160}px ${h}px`, `${x0 + 160}px 0px`); } return {clipPath: `polygon(${out.join(',')})`}; }
    case 'shardsReform': return {opacity: prog(f, T - 2, T + post)};
    case 'goldLeaf': { const p = prog(f, T, T + post, easeInOut); return {clipPath: `circle(${p * 1300 + 4}px at 960px 540px)`, opacity: f >= T ? 1 : 0}; }
    case 'chainGather': return {opacity: prog(f, T - 2, T + post)};
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
    case 'mopGather': {
      const p = prog(f, T - pre, T + post, easeInOut); const r = mulberry32(31);
      return <svg width={1920} height={1080} style={full}>{Array.from({length: 70}).map((_, i) => { const sx = r() * 1920, sy = r() * 1080, tx = 960 + (r() - 0.5) * 300, ty = 540 + (r() - 0.5) * 200; const k = p < 0.5 ? p * 2 : 1 - (p - 0.5) * 2; return <path key={i} d={`M0,-12 L8,0 L0,12 L-7,2Z`} transform={`translate(${lerp(sx, tx, k)},${lerp(sy, ty, k)}) rotate(${f * 6 + i * 20})`} fill="url(#mop)" style={{filter: `hue-rotate(${(i * 40 + f * 3) % 360}deg)`}} opacity={0.9 * Math.sin(p * Math.PI)} />; })}</svg>;
    }
    case 'makieDust': {
      const p = prog(f, T - pre, T + post); const r = mulberry32(41);
      return <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}>{Array.from({length: 120}).map((_, i) => { const y = r() * 1080; const x = (p * 1.2 - 0.1) * 1920 + (r() - 0.5) * 300 + p * r() * 300; return <circle key={i} cx={x} cy={y - p * r() * 120} r={1.5 + r() * 2.5} fill={i % 3 ? '#e8c46a' : '#fff0c0'} opacity={Math.sin(p * Math.PI)} />; })}</svg>;
    }
    case 'leafWipe': {
      const p = prog(f, T - pre, T + post, easeInOut); const r = mulberry32(51); const x = p * 1920;
      return <svg width={1920} height={1080} style={full}>{Array.from({length: 26}).map((_, i) => { const y = r() * 1080; const xx = x + (r() - 0.5) * 160; return <ellipse key={i} cx={xx} cy={y + osc(f, 20, i / 26) * 20} rx={18} ry={8} fill={['#a8822e', '#6a4a2a', '#8a6a2a'][i % 3]} transform={`rotate(${f * 8 + i * 30} ${xx} ${y})`} opacity={Math.sin(p * Math.PI)} />; })}</svg>;
    }
    case 'sunDial': {
      const p = prog(f, T - pre, T + post, easeInOut); const a = (p * 360 - 90) * Math.PI / 180;
      return <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}><line x1={960} y1={648} x2={960 + Math.cos(a) * 1400} y2={648 + Math.sin(a) * 1400} stroke="#fff0c8" strokeWidth={14} opacity={0.6 * Math.sin(p * Math.PI)} /></svg>;
    }
    case 'lightStream': {
      const p = prog(f, T - pre, T + post); const r = mulberry32(61);
      return <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}>{Array.from({length: 60}).map((_, i) => { const sx = r() * 1920, sy = r() * 1080; const k = easeIn(p); return <circle key={i} cx={lerp(sx, 960, k)} cy={lerp(sy, 760, k)} r={4} fill="#ffcf80" opacity={Math.sin(p * Math.PI)} />; })}</svg>;
    }
    case 'rewind': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <div style={{...full, background: '#d8c8a0', opacity: a * 0.4, mixBlendMode: 'screen'}} />;
    }
    case 'splitOpen': {
      const p = prog(f, T - pre, T + post, easeInOut); const w = p * 960;
      return <svg width={1920} height={1080} style={full}><path d={`M${960 - w},0 L${960 - w},1080 M${960 + w},0 L${960 + w},1080`} stroke="url(#gold)" strokeWidth={6} /></svg>;
    }
    case 'boxFold': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <svg width={1920} height={1080} style={full}><rect x={0} y={0} width={1920} height={1080} fill="none" stroke="url(#gold)" strokeWidth={14 * a} /></svg>;
    }
    case 'sealStamp': {
      const p = springAt(f, T - pre, {damping: 12, stiffness: 200}); const lift = prog(f, T + 2, T + post, easeIn);
      if (f < T - pre) return null;
      return <svg width={1920} height={1080} style={full}><g transform={`translate(960,540) scale(${(3 - 2 * p) * (1 + lift * 0.6)})`} opacity={1 - lift}><rect x={-900} y={-520} width={1800} height={1040} rx={40} fill="#a8281e" /><rect x={-840} y={-470} width={1680} height={940} rx={24} fill="none" stroke="url(#gold)" strokeWidth={14} /><path d="M-200,-200 L200,200 M200,-200 L-200,200" stroke="#f4d088" strokeWidth={30} /></g></svg>;
    }
    case 'diveCard': {
      const p = prog(f, T - pre, T + post); const a = Math.sin(p * Math.PI);
      return <div style={{...full, background: `radial-gradient(circle at 1360px 560px, rgba(255,216,144,${0.4 * a}), transparent 50%)`}} />;
    }
    case 'scrollOpen': {
      const p = prog(f, T - pre, T + post, easeInOut); const x = p * 1920;
      return <svg width={1920} height={1080} style={full}>{p < 1 && <g><rect x={x - 40} y={-20} width={40} height={1120} rx={18} fill="#8a6a3a" stroke="url(#gold)" strokeWidth={3} />{Array.from({length: 6}).map((_, i) => <rect key={i} x={x - 120 - i * 22} y={0} width={19} height={1080} fill="#c8a868" opacity={0.5 - i * 0.07} />)}</g>}</svg>;
    }
    case 'smokeFog': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <svg width={1920} height={1080} style={full}>{[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={300 + i * 340} cy={540 + osc(f, 40, i / 5) * 80} rx={600} ry={300} fill="#d8d4cc" opacity={a * 0.5} filter="url(#roughEdge)" />)}</svg>;
    }
    case 'fogPart': {
      const p = prog(f, T - pre, T + post, easeOut);
      return <svg width={1920} height={1080} style={full}><rect x={-960 * p} y={0} width={980} height={1080} fill="#cfc6bc" opacity={0.9 * (1 - p)} filter="url(#roughEdge)" /><rect x={940 + 960 * p} y={0} width={980} height={1080} fill="#cfc6bc" opacity={0.9 * (1 - p)} filter="url(#roughEdge)" /></svg>;
    }
    case 'rushIn': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}>{Array.from({length: 40}).map((_, i) => { const ang = (i / 40) * Math.PI * 2; return <line key={i} x1={960 + Math.cos(ang) * 200} y1={540 + Math.sin(ang) * 200} x2={960 + Math.cos(ang) * 1200} y2={540 + Math.sin(ang) * 1200} stroke="#ffe6b0" strokeWidth={3} opacity={a * 0.5} />; })}</svg>;
    }
    case 'zhuSplash': {
      const p = prog(f, T - pre, T + post, easeOut); const x = lerp(2400, -900, p);
      return <svg width={1920} height={1080} style={full}><path d={`M${x - 80},0 Q${x + 60},300 ${x + 300},540 Q${x + 500},800 ${x + 620},1080 L${x + 780},1080 Q${x + 600},700 ${x + 380},500 Q${x + 160},260 ${x + 80},0 Z`} fill="#b8281c" opacity={p < 1 ? 0.95 : 0} /></svg>;
    }
    case 'xipiAge': {
      const a = 1 - Math.abs(prog(f, T - pre, T + post) * 2 - 1);
      return <svg width={1920} height={1080} style={full}><g opacity={a * 0.8}>{Array.from({length: 8}).map((_, i) => <path key={i} d={`M-100,${i * 150 + osc(f, 30, i / 8) * 40} C500,${i * 150 - 80} 1300,${i * 150 + 80} 2020,${i * 150}`} stroke={['#3a2a40', '#6a4a30', '#2a1f33', '#8a6a3a'][i % 4]} strokeWidth={70} fill="none" />)}</g></svg>;
    }
    case 'layerPush': {
      const a = 1 - prog(f, T, T + post);
      return f >= T - pre ? <svg width={1920} height={1080} style={full}><rect x={10} y={10} width={1900} height={1060} rx={16} fill="none" stroke="url(#gold)" strokeWidth={10} opacity={a} /></svg> : null;
    }
    case 'crackOpen': {
      const p = prog(f, T - pre, T + post, easeInOut); const w = p * 1100;
      const pts = [0, 0.2, 0.4, 0.6, 0.8, 1].map((t, i) => [960 + (i % 2 ? 40 : -30), t * 1080]);
      return <svg width={1920} height={1080} style={full}><polyline points={pts.map(([x, y]) => `${x - w},${y}`).join(' ')} stroke="url(#gold)" strokeWidth={6} fill="none" /><polyline points={pts.map(([x, y]) => `${x + w},${y}`).join(' ')} stroke="url(#gold)" strokeWidth={6} fill="none" /></svg>;
    }
    case 'goldSweep': {
      const p = prog(f, T - pre, T + post, easeInOut); const x = p * 1920; const r = mulberry32(71);
      return <svg width={1920} height={1080} style={{...full, mixBlendMode: 'screen'}}><rect x={x - 60} y={0} width={80} height={1080} fill="#ffe0a0" opacity={0.35 * Math.sin(p * Math.PI)} />{Array.from({length: 80}).map((_, i) => <circle key={i} cx={x + (r() - 0.7) * 200} cy={r() * 1080} r={1.5 + r() * 2.5} fill="#f0d080" opacity={Math.sin(p * Math.PI)} />)}</svg>;
    }
    case 'axeSlash': {
      const a = f >= T - pre && f < T + 6 ? 1 - Math.max(0, f - T) / 6 : 0;
      return <svg width={1920} height={1080} style={full}><line x1={1400} y1={-20} x2={520} y2={1100} stroke="#fff6e0" strokeWidth={10 * a + 1} opacity={a} /></svg>;
    }
    case 'slipsScatter': {
      const p = prog(f, T - pre, T + post);
      return <svg width={1920} height={1080} style={full}>{Array.from({length: 12}).map((_, i) => { const dl = [0, 5, 2, 9, 4, 11, 1, 7, 3, 10, 6, 8][i] * 0.03; const h = clamp(p * 1.4 - dl) * 1080; return h > 0 && h < 1080 ? <rect key={i} x={i * 160 + 2} y={h - 30} width={156} height={30} fill="#c8a868" stroke="#6a4a22" strokeWidth={2} /> : null; })}</svg>;
    }
    case 'shardsReform': {
      const p = prog(f, T - pre, T + post, easeOut); const r = mulberry32(81);
      return <svg width={1920} height={1080} style={full}>{Array.from({length: 36}).map((_, i) => { const sx = r() * 1920, sy = r() * 1080, tx = 760 + (r() - 0.5) * 200, ty = 480 + (r() - 0.5) * 300; return <path key={i} d="M0,-26 L22,4 L-4,24 L-20,-2Z" transform={`translate(${lerp(sx, tx, p)},${lerp(sy, ty, p)}) rotate(${(1 - p) * 400 + i * 30})`} fill="url(#blackLq)" stroke="url(#gold)" strokeWidth={2} opacity={1 - prog(f, T + post - 4, T + post)} />; })}</svg>;
    }
    case 'goldLeaf': {
      const g = prog(f, T - pre, T, easeOut); const out = prog(f, T, T + post, easeIn);
      return <svg width={1920} height={1080} style={full}><g transform={`translate(960,540) scale(${g * 1.3})`} opacity={1 - out}><rect x={-760} y={-430} width={1520} height={860} fill="url(#gold)" /><rect x={-760} y={-430} width={1520} height={860} fill="url(#brushPat)" opacity={1} /></g></svg>;
    }
    case 'chainGather': {
      const p = prog(f, T - pre, T + post, easeIn);
      return <svg width={1920} height={1080} style={full}><circle cx={960} cy={540} r={lerp(900, 10, p)} fill="none" stroke="url(#gold)" strokeWidth={6} opacity={Math.sin(p * Math.PI)} /></svg>;
    }
    case 'dollyPan': case 'cardFlip': case 'panelFlip': case 'snapOut': case 'followBack':
      return null;
    default: return null;
  }
};
