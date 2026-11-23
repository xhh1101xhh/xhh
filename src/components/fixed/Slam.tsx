import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ACCENT_HEX, Accent, IVORY} from '../../data/types';
import {clamp, ease, prog, spr} from '../../lib/anim';
import {roughRect} from '../../lib/paper';
import {RESOLVED} from '../../lib/timing';
import {SLAM_CELL, SLAM_SIZE, SLAM_Y, slamLayout} from '../../lib/slam';
import {FONT} from './FixedLayer';

const CELL = SLAM_CELL;
const FALL = 8; // frames of free fall; the landing frame IS the beat

/** 大字砸屏: chars fall from above with gravity, land exactly on the beat, squash + bounce, paper tile + shadow. */
export const Slam: React.FC = () => {
  const frame = useCurrentFrame();
  const s = RESOLVED.find((x) => x.display === 'slam' && frame >= x.from - FALL && frame < x.to);
  if (!s) return null;
  const {chars, xs} = slamLayout(s);
  const first = chars.length ? chars[0].land : s.from;
  const flash = frame >= first ? Math.exp(-(frame - first) / 4) : 0;
  const exit = prog(frame, s.to - 7, s.to, ease.in);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 830px 430px, rgba(255,226,170,0.55), rgba(255,226,170,0) 60%)', opacity: flash * 0.9, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 45% at 830px 430px, rgba(6,4,8,0.5), transparent 75%)', opacity: clamp((frame - first + 4) / 6) * (1 - exit)}} />
      <SlamBurst frame={frame} at={first} accent={chars.find((c) => c.accent)?.accent} exit={exit} />
      {chars.map((ch, idx) => {
        const t = frame - ch.land;
        if (t < -FALL) return null;
        const fallT = clamp((frame - (ch.land - FALL)) / FALL);
        const y = t < 0 ? -460 * (1 - ease.inQuad(fallT)) : -Math.sin(Math.min(t, 14) / 14 * Math.PI) * 26 * Math.exp(-t / 9);
        const land = t >= 0 ? spr(frame, ch.land, {damping: 7, stiffness: 260}) : 0;
        const sy = t < 0 ? 1.08 : 0.78 + 0.22 * land;
        const sx = t < 0 ? 0.94 : 1.16 - 0.16 * land;
        const rot = ((idx % 2 ? 1 : -1) * 4 + (idx % 3) - 1) * (t < 0 ? 2 : 1 - land * 0.6);
        const color = ch.accent ? ACCENT_HEX[ch.accent] : IVORY;
        const punct = /[，。、]/.test(ch.c);
        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              left: xs[idx] - CELL / 2,
              top: SLAM_Y - CELL / 2,
              width: CELL,
              height: CELL,
              transformOrigin: '50% 100%',
              transform: `translate(${exit * -40}px, ${y + exit * 30}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
              opacity: (1 - exit) * clamp(fallT * 3),
            }}
          >
            {!punct ? (
              <svg width={CELL} height={CELL} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
                <path d={roughRect(4, 6, CELL - 8, CELL - 8, 900 + idx * 7, 10, 3.5)} fill="rgba(4,3,6,0.45)" transform="translate(7 12)" />
                <path d={roughRect(4, 6, CELL - 8, CELL - 8, 900 + idx * 7, 10, 3.5)} fill="#3A2830" />
                <path d={roughRect(4, 6, CELL - 8, 18, 970 + idx * 7, 6, 2)} fill="rgba(255,236,210,0.08)" />
                <path d={roughRect(10, 12, CELL - 20, CELL - 20, 950 + idx * 7, 8, 2.5)} fill="none" stroke={ch.accent ? color : '#E8B04B'} strokeWidth={3} opacity={0.9} />
              </svg>
            ) : null}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: punct ? 'flex-end' : 'center',
                justifyContent: 'center',
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: SLAM_SIZE,
                lineHeight: 1,
                color,
                paddingBottom: punct ? 6 : 4,
                textShadow: `0 6px 0 rgba(0,0,0,0.55)${ch.accent ? `, 0 0 26px ${color}aa` : ''}`,
              }}
            >
              {ch.c}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** full-frame impact: torn paper rays + confetti flung out from behind the words on the first landing */
const SlamBurst: React.FC<{frame: number; at: number; accent?: Accent; exit: number}> = ({frame, at, accent, exit}) => {
  const t = frame - at;
  if (t < 0) return null;
  const k = 1 - Math.exp(-t / 5);
  const fade = Math.max(0, 1 - t / 40) * (1 - exit);
  const col = accent ? ACCENT_HEX[accent] : '#E8B04B';
  const rays = Array.from({length: 18}, (_, i) => i);
  return (
    <AbsoluteFill style={{opacity: fade}}>
      <svg width={1920} height={1080}>
        {rays.map((i) => {
          const a = (i / 18) * Math.PI * 2 + 0.17;
          const r0 = 200 + 60 * k;
          const r1 = r0 + 520 * k * (0.6 + 0.4 * ((i * 37) % 7) / 7);
          const w = 0.07;
          const pts = [[Math.cos(a - w) * r0, Math.sin(a - w) * r0 * 0.7], [Math.cos(a) * r1, Math.sin(a) * r1 * 0.7], [Math.cos(a + w) * r0, Math.sin(a + w) * r0 * 0.7]];
          return <path key={i} d={`M ${pts.map((p) => `${830 + p[0]} ${430 + p[1]}`).join(' L ')} Z`} fill={i % 3 === 0 ? col : 'rgba(243,235,221,0.55)'} opacity={0.55} />;
        })}
        {Array.from({length: 26}, (_, i) => {
          const a = (i / 26) * Math.PI * 2 + i;
          const d = 260 + 700 * k * (0.5 + ((i * 53) % 10) / 20);
          const x = 830 + Math.cos(a) * d;
          const y = 430 + Math.sin(a) * d * 0.62 + t * t * 0.25;
          return <rect key={i} x={x} y={y} width={14} height={9} fill={i % 2 ? col : '#F3EBDD'} transform={`rotate(${i * 40 + t * 12} ${x} ${y})`} opacity={0.8} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
