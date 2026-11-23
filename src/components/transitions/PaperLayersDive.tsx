import React from 'react';
import {AbsoluteFill} from 'remotion';
import {clamp, ease, prog} from '../../lib/anim';
import {roughCircle, roughEllipse, roughRect} from '../../lib/paper';

/** 剪纸层层钻入: three paper layers (window frame, curtain, gauze), each with a hole, rush past the camera one
 *  after another; the incoming set emerges behind the last one. Centre of the dive = (cx, cy) on screen. */
export const PaperLayersDive: React.FC<{frame: number; at: number; outgoing: React.ReactNode; incoming: React.ReactNode; cx?: number; cy?: number}> = ({frame, at, outgoing, incoming, cx = 960, cy = 520}) => {
  const start = at - 18;
  const layers = [
    {t0: start, t1: start + 16, color: '#3A2416', hole: 'round', seed: 5101, trim: '#8C6A3A'},
    {t0: start + 7, t1: start + 24, color: '#7A2E2E', hole: 'curtain', seed: 5102, trim: '#B8893A'},
    {t0: start + 13, t1: at + 14, color: 'rgba(92,52,26,0.78)', hole: 'round', seed: 5103, trim: '#E8B04B'},
  ];
  const inT = prog(frame, at - 6, at + 14, ease.out);
  return (
    <AbsoluteFill>
      {frame < at + 2 ? <AbsoluteFill>{outgoing}</AbsoluteFill> : null}
      {frame >= at - 8 ? (
        <AbsoluteFill style={{opacity: clamp((frame - (at - 8)) / 8), transform: `scale(${1.35 - 0.35 * inT})`, transformOrigin: `${cx}px ${cy}px`}}>{incoming}</AbsoluteFill>
      ) : null}
      {layers.map((l, i) => {
        if (frame < l.t0 - 4 || frame > l.t1) return null;
        const t = prog(frame, l.t0, l.t1, ease.in);
        const s = 0.32 + t * t * 7;
        const appear = clamp((frame - (l.t0 - 4)) / 4);
        return (
          <AbsoluteFill key={i} style={{opacity: appear * (1 - prog(frame, l.t1 - 3, l.t1)), transform: `scale(${s}) rotate(${(1 - t) * (i % 2 ? -6 : 5)}deg)`, transformOrigin: `${cx}px ${cy}px`}}>
            <svg width={1920} height={1080} style={{overflow: 'visible'}}>
              <defs>
                <mask id={`dive${i}`}>
                  <rect x={-3000} y={-3000} width={8000} height={8000} fill="white" />
                  {l.hole === 'round' ? (
                    <path d={roughEllipse(cx, cy, 300, 330, l.seed, 5, 18)} fill="black" />
                  ) : (
                    <path d={`M ${cx - 360} ${cy - 360} Q ${cx - 60} ${cy - 100} ${cx - 240} ${cy + 380} L ${cx + 240} ${cy + 380} Q ${cx + 60} ${cy - 100} ${cx + 360} ${cy - 360} Z`} fill="black" />
                  )}
                </mask>
              </defs>
              <g mask={`url(#dive${i})`}>
                <rect x={-3000} y={-3000} width={8000} height={8000} fill={l.color} />
                {i === 1 ? Array.from({length: 18}, (_, k) => <rect key={k} x={cx - 1200 + k * 140} y={-600} width={8} height={2400} fill="rgba(0,0,0,0.18)" />) : null}
              </g>
              {l.hole === 'round' ? (
                <path d={roughEllipse(cx, cy, 300, 330, l.seed, 5, 18)} fill="none" stroke={l.trim} strokeWidth={14} />
              ) : (
                <path d={roughRect(cx - 420, cy - 420, 840, 40, l.seed + 1, 6, 3)} fill={l.trim} />
              )}
              {i === 0 ? <path d={roughCircle(cx, cy, 360, l.seed + 2, 6, 20)} fill="none" stroke="#1C120A" strokeWidth={30} opacity={0.6} /> : null}
            </svg>
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
