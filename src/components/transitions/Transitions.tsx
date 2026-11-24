import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, ease, prog} from '../../lib/anim';
import {rng} from '../../lib/paper';

type TP = {frame: number; at: number; outgoing: React.ReactNode; incoming: React.ReactNode};

/** 横推: outgoing slides out left, incoming arrives from the right; lands on `at` with a paper edge shadow */
export const HorizontalPush: React.FC<TP & {dur?: number}> = ({frame, at, outgoing, incoming, dur = 12}) => {
  const t = prog(frame, at - dur, at, ease.inOut);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${-t * 1920}px)`, filter: t > 0.05 && t < 0.95 ? 'blur(3px)' : undefined}}>{outgoing}</AbsoluteFill>
      <AbsoluteFill style={{transform: `translateX(${(1 - t) * 1920}px)`, boxShadow: '-40px 0 60px rgba(0,0,0,0.6)'}}>{incoming}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 钻进圆形物件（虹膜开）: incoming is revealed by an expanding circle (with a warm rim) from (cx, cy) */
export const IrisOpen: React.FC<TP & {cx: number; cy: number; dur?: number; rim?: string}> = ({frame, at, outgoing, incoming, cx, cy, dur = 16, rim = '#FFC870'}) => {
  const t = prog(frame, at - 2, at + dur, ease.inOut);
  const r = 4 + t * 1300;
  return (
    <AbsoluteFill>
      {t < 1 ? <AbsoluteFill>{outgoing}</AbsoluteFill> : null}
      <AbsoluteFill style={{clipPath: `circle(${r}px at ${cx}px ${cy}px)`}}>{incoming}</AbsoluteFill>
      {t > 0 && t < 1 ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1920} height={1080}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={rim} strokeWidth={14} opacity={0.8 * (1 - t)} />
            <circle cx={cx} cy={cy} r={r + 18} fill="none" stroke={rim} strokeWidth={4} opacity={0.5 * (1 - t)} />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** 拱形遮罩: incoming is revealed through a growing arch-window shape */
export const ArchMask: React.FC<TP & {cx?: number; dur?: number}> = ({frame, at, outgoing, incoming, cx = 960, dur = 14}) => {
  const t = prog(frame, at - dur, at, ease.inOut);
  const w = 60 + t * 1500;
  const h = 120 + t * 1400;
  const base = 540 + h / 2;
  const pts: string[] = [];
  pts.push(`${cx - w / 2}px ${base}px`);
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + (Math.PI * i) / 16;
    pts.push(`${cx + Math.cos(a) * (w / 2)}px ${base - h + w / 2 + Math.sin(a) * (w / 2)}px`);
  }
  pts.push(`${cx + w / 2}px ${base}px`);
  return (
    <AbsoluteFill>
      {t < 1 ? <AbsoluteFill>{outgoing}</AbsoluteFill> : null}
      <AbsoluteFill style={{clipPath: t >= 1 ? undefined : `polygon(${pts.join(',')})`}}>{incoming}</AbsoluteFill>
    </AbsoluteFill>
  );
};

/** 镜面翻转: the picture flips over a horizontal axis like a mirror turned around */
export const MirrorFlip: React.FC<TP & {dur?: number}> = ({frame, at, outgoing, incoming, dur = 10}) => {
  const t1 = prog(frame, at - dur, at - dur / 2, ease.in);
  const t2 = prog(frame, at - dur / 2, at, ease.out);
  const showOut = frame < at - dur / 2;
  return (
    <AbsoluteFill style={{perspective: 1600, background: '#0A0812'}}>
      {showOut ? (
        <AbsoluteFill style={{transform: `rotateX(${t1 * 90}deg)`, filter: `brightness(${1 - t1 * 0.5})`}}>{outgoing}</AbsoluteFill>
      ) : (
        <AbsoluteFill style={{transform: `rotateX(${-90 + t2 * 90}deg)`, filter: `brightness(${0.5 + t2 * 0.5})`}}>{incoming}</AbsoluteFill>
      )}
      {frame > at - dur && frame < at + 2 ? (
        <AbsoluteFill style={{background: 'linear-gradient(180deg, transparent 45%, rgba(200,220,255,0.35) 50%, transparent 55%)', mixBlendMode: 'screen'}} />
      ) : null}
    </AbsoluteFill>
  );
};

/** 甩镜: fast horizontal whip with speed streaks, lands on `at` */
export const WhipPan: React.FC<TP & {dur?: number}> = ({frame, at, outgoing, incoming, dur = 8}) => {
  const tOut = prog(frame, at - dur, at - 2, ease.in);
  const tIn = prog(frame, at - 3, at, ease.out);
  const settle = frame >= at ? Math.sin(clamp((frame - at) / 10) * Math.PI) * 30 * Math.exp(-(frame - at) / 6) : 0;
  const streak = frame >= at - dur && frame < at + 3 ? 1 - Math.abs(frame - (at - 3)) / dur : 0;
  const r = rng(77);
  return (
    <AbsoluteFill>
      {frame < at ? <AbsoluteFill style={{transform: `translateX(${-tOut * 1700}px)`, filter: tOut > 0.05 ? `blur(${tOut * 12}px)` : undefined}}>{outgoing}</AbsoluteFill> : null}
      {frame >= at - 3 ? <AbsoluteFill style={{transform: `translateX(${(1 - tIn) * 1700 + settle}px)`, filter: tIn < 0.95 ? `blur(${(1 - tIn) * 12}px)` : undefined}}>{incoming}</AbsoluteFill> : null}
      {streak > 0 ? (
        <AbsoluteFill style={{opacity: clamp(streak)}}>
          <svg width={1920} height={1080}>
            {Array.from({length: 22}, (_, i) => {
              const y = r() * 1080;
              const h = 4 + r() * 14;
              const len = 300 + r() * 700;
              const x = ((r() * 1920 + frame * 200) % 2400) - 400;
              return <rect key={i} x={x} y={y} width={len} height={h} rx={h / 2} fill={i % 3 ? '#C9C3D8' : '#E8B04B'} opacity={0.25 + r() * 0.25} />;
            })}
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** 纸张撕裂: the outgoing sheet tears down a jagged line and the halves are flung apart, revealing incoming */
export const PaperTear: React.FC<TP & {dur?: number}> = ({frame, at, outgoing, incoming, dur = 16}) => {
  const t = prog(frame, at - 2, at + dur, ease.out);
  const r = rng(321);
  const jag: [number, number][] = [];
  for (let i = 0; i <= 18; i++) jag.push([960 + (r() - 0.5) * 120 + (i % 2 ? 26 : -26), (i / 18) * 1080]);
  const left = `polygon(0px 0px, ${jag.map(([x, y]) => `${x}px ${y}px`).join(',')}, 0px 1080px)`;
  const right = `polygon(1920px 0px, ${jag.map(([x, y]) => `${x}px ${y}px`).join(',')}, 1920px 1080px)`;
  const edge = jag.map(([x, y]) => `${x},${y}`).join(' ');
  return (
    <AbsoluteFill>
      <AbsoluteFill>{incoming}</AbsoluteFill>
      {t < 1 ? (
        <>
          <AbsoluteFill style={{clipPath: left, transform: `translateX(${-t * 1100}px) rotate(${-t * 8}deg)`, transformOrigin: '0 50%', filter: 'drop-shadow(12px 0 16px rgba(0,0,0,0.6))'}}>
            {outgoing}
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              <polyline points={edge} fill="none" stroke="#EADFCB" strokeWidth={8} opacity={0.9} />
            </svg>
          </AbsoluteFill>
          <AbsoluteFill style={{clipPath: right, transform: `translateX(${t * 1100}px) rotate(${t * 8}deg)`, transformOrigin: '100% 50%', filter: 'drop-shadow(-12px 0 16px rgba(0,0,0,0.6))'}}>
            {outgoing}
            <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
              <polyline points={edge} fill="none" stroke="#EADFCB" strokeWidth={8} opacity={0.9} />
            </svg>
          </AbsoluteFill>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

/** 光点闪光: a point of warm light swells and pops (warm gold-white, never a flat white field) */
export const FlashCut: React.FC<TP & {cx?: number; cy?: number}> = ({frame, at, outgoing, incoming, cx = 960, cy = 480}) => {
  const up = prog(frame, at - 6, at, ease.in);
  const down = prog(frame, at, at + 8, ease.out);
  const k = frame < at ? up : 1 - down;
  return (
    <AbsoluteFill>
      {frame < at ? <AbsoluteFill>{outgoing}</AbsoluteFill> : <AbsoluteFill>{incoming}</AbsoluteFill>}
      <AbsoluteFill style={{background: `radial-gradient(circle ${60 + k * 1400}px at ${cx}px ${cy}px, rgba(255,232,180,${0.95 * k}), rgba(232,176,75,${0.55 * k}) 45%, rgba(232,176,75,0) 75%)`, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** 斜向光切: a golden band sweeps diagonally; incoming appears behind the band */
export const DiagonalLightCut: React.FC<TP & {dur?: number}> = ({frame, at, outgoing, incoming, dur = 12}) => {
  const t = prog(frame, at - dur, at + 4, ease.inOut);
  const pos = -900 + t * 3700; // band centre along x at y=0, slanted
  const slant = 700;
  const clip = `polygon(0px 0px, ${pos}px 0px, ${pos - slant}px 1080px, 0px 1080px)`;
  return (
    <AbsoluteFill>
      <AbsoluteFill>{outgoing}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: clip}}>{incoming}</AbsoluteFill>
      {t > 0 && t < 1 ? (
        <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width={1920} height={1080}>
            <defs>
              <linearGradient id="lcut" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#E8B04B" stopOpacity={0} />
                <stop offset="50%" stopColor="#FFE2A0" stopOpacity={0.85} />
                <stop offset="100%" stopColor="#E8B04B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <polygon points={`${pos - 120},0 ${pos + 120},0 ${pos + 120 - slant},1080 ${pos - 120 - slant},1080`} fill="url(#lcut)" style={{mixBlendMode: 'screen'}} />
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

/** 金光虹膜收 (ending): a circle closes onto (cx, cy); outside becomes warm gold paper; final glint at `glint` */
export const GoldIrisClose: React.FC<{frame: number; from: number; to: number; glint: number; cx: number; cy: number; children: React.ReactNode}> = ({frame, from, to, glint, cx, cy, children}) => {
  const t = prog(frame, from, to, ease.inOut);
  const r = 1400 * (1 - t) + 26 * t;
  const g = frame >= glint ? Math.exp(-(frame - glint) / 3) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #9C6A2C, #5A3816 70%, #2E1C0C)'}} />
      <AbsoluteFill style={{clipPath: `circle(${r}px at ${cx}px ${cy}px)`}}>{children}</AbsoluteFill>
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <svg width={1920} height={1080}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E8B04B" strokeWidth={10} opacity={t > 0 ? 0.9 : 0} />
          <circle cx={cx} cy={cy} r={r + 20} fill="none" stroke="#FFE2A0" strokeWidth={3} opacity={t > 0 ? 0.6 : 0} />
          {g > 0.01
            ? [0, 45, 90, 135].map((a) => (
                <rect key={a} x={cx - 4} y={cy - 160 * g - 40} width={8} height={320 * g + 80} rx={4} fill="#FFF0C8" opacity={g} transform={`rotate(${a} ${cx} ${cy})`} />
              ))
            : null}
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
