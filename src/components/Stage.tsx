import React from 'react';
import {AbsoluteFill} from 'remotion';

export type Cam = {x: number; y: number; zoom: number; rot?: number};
export type Layer = {depth: number; node: React.ReactNode; blur?: number; opacity?: number; key?: string};

/** One continuous camera over a layered paper set. World units = 1920x1080 frame at zoom 1 (cam 960,540).
 *  depth < 1 = background (moves/zooms less), depth > 1 = foreground (moves/zooms more) -> parallax + depth. */
export const Stage: React.FC<{cam: Cam; layers: Layer[]; bg?: React.ReactNode; style?: React.CSSProperties}> = ({cam, layers, bg, style}) => (
  <AbsoluteFill style={{overflow: 'hidden', ...style}}>
    {bg}
    {layers.map((l, i) => {
      const d = l.depth;
      const s = Math.pow(cam.zoom, d);
      const cx = 960 + (cam.x - 960) * d;
      const cy = 540 + (cam.y - 540) * d;
      return (
        <AbsoluteFill
          key={l.key ?? i}
          style={{
            transformOrigin: '0 0',
            transform: `translate(960px,540px) rotate(${(cam.rot ?? 0) * Math.min(1.2, d)}deg) scale(${s}) translate(${-cx}px,${-cy}px)`,
            filter: l.blur ? `blur(${l.blur}px)` : undefined,
            opacity: l.opacity ?? 1,
          }}
        >
          <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
            {l.node}
          </svg>
        </AbsoluteFill>
      );
    })}
  </AbsoluteFill>
);

/** full-frame gradient backdrop (screen space) */
export const Backdrop: React.FC<{top: string; bottom: string; angle?: number}> = ({top, bottom, angle = 180}) => (
  <AbsoluteFill style={{background: `linear-gradient(${angle}deg, ${top}, ${bottom})`}} />
);

/** directional ambient light wash (screen space, additive) */
export const LightWash: React.FC<{x: number; y: number; color: string; strength?: number; radius?: number}> = ({x, y, color, strength = 0.35, radius = 900}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(circle ${radius}px at ${x}px ${y}px, ${color}, transparent 70%)`,
      mixBlendMode: 'screen',
      opacity: strength,
      pointerEvents: 'none',
    }}
  />
);
