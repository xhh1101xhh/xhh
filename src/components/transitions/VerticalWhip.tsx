import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, ease, prog} from '../../lib/anim';
import {rng} from '../../lib/paper';

/** 快速竖摇: camera whips down. Outgoing races up and blurs, incoming arrives from below and settles with a
 *  small overshoot so the stop lands exactly on `at` (a beat). Paper speed streaks sell the motion. */
export const VerticalWhip: React.FC<{frame: number; at: number; outgoing: React.ReactNode; incoming: React.ReactNode; dur?: number}> = ({frame, at, outgoing, incoming, dur = 9}) => {
  const tOut = prog(frame, at - dur, at - 2, ease.in);
  const tIn = prog(frame, at - 4, at, ease.out);
  const settle = frame >= at ? Math.sin(clamp((frame - at) / 10) * Math.PI) * 26 * Math.exp(-(frame - at) / 6) : 0;
  const speed = frame >= at - dur && frame < at + 3 ? 1 - Math.abs(frame - (at - 3)) / (dur - 1) : 0;
  const r = rng(55);
  return (
    <AbsoluteFill>
      {frame < at ? (
        <AbsoluteFill style={{transform: `translateY(${-tOut * 1300}px)`, filter: tOut > 0.05 ? `blur(${tOut * 10}px)` : undefined}}>{outgoing}</AbsoluteFill>
      ) : null}
      {frame >= at - 4 ? (
        <AbsoluteFill style={{transform: `translateY(${(1 - tIn) * 1300 - settle}px)`, filter: tIn < 0.95 ? `blur(${(1 - tIn) * 10}px)` : undefined}}>{incoming}</AbsoluteFill>
      ) : null}
      {speed > 0 ? (
        <AbsoluteFill style={{opacity: clamp(speed)}}>
          <svg width={1920} height={1080}>
            {Array.from({length: 26}, (_, i) => {
              const x = r() * 1920;
              const w = 4 + r() * 18;
              const len = 300 + r() * 600;
              const y = ((r() * 1080 - frame * 160) % 1600) + 400;
              return <rect key={i} x={x} y={y - len} width={w} height={len} rx={w / 2} fill={i % 3 ? '#E9DFC9' : '#E8B04B'} opacity={0.25 + r() * 0.3} />;
            })}
          </svg>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
