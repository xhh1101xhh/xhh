import React, {createContext, useContext} from 'react';
import {keys, noise, easeInOut} from '../lib/anim';

export type Cam = {x: number; y: number; z: number; r: number; focus: number; dof: number};
export const CAM0: Cam = {x: 0, y: 0, z: 1, r: 0, focus: 1, dof: 0};

/** 相机关键帧：[帧, 局部相机]，各分量独立缓动；再叠加手持般的微漂移，保证画面一直在动 */
export function camAt(f: number, ks: [number, Partial<Cam>][], drift = 1, ease = easeInOut): Cam {
  const full = ks.map(([fr, c]) => [fr, {...CAM0, ...c}] as [number, Cam]);
  const pick = (k: keyof Cam) => keys(f, full.map(([fr, c]) => [fr, c[k]] as [number, number]), ease);
  return {
    x: pick('x') + noise(f / 70, 1) * 6 * drift,
    y: pick('y') + noise(f / 80, 2) * 4 * drift,
    z: pick('z') * (1 + noise(f / 120, 3) * 0.004 * drift),
    r: pick('r') + noise(f / 140, 4) * 0.15 * drift,
    focus: pick('focus'),
    dof: pick('dof'),
  };
}

const CamCtx = createContext<Cam>(CAM0);

/** 一个场景舞台：内部按 Layer 深度做视差 */
export const Stage: React.FC<{cam: Cam; children: React.ReactNode; style?: React.CSSProperties}> = ({cam, children, style}) => (
  <CamCtx.Provider value={cam}>
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', ...style}}>{children}</div>
  </CamCtx.Provider>
);

/**
 * 视差层。depth: 0.15 远景 … 1 主体 … 1.5 前景。
 * 景深：|depth - cam.focus| × cam.dof 像素模糊。
 */
export const Layer: React.FC<{depth: number; children: React.ReactNode; blur?: number; opacity?: number; style?: React.CSSProperties; noBlur?: boolean}> =
  ({depth, children, blur = 0, opacity = 1, style, noBlur}) => {
  const c = useContext(CamCtx);
  const s = 1 + (c.z - 1) * depth;
  const b = noBlur ? 0 : Math.abs(depth - c.focus) * c.dof + blur;
  return (
    <div style={{position: 'absolute', inset: 0, opacity,
      transform: `translate(960px,540px) rotate(${c.r * Math.min(1, depth)}deg) scale(${s}) translate(${-960 - c.x * depth}px,${-540 - c.y * depth}px)`,
      transformOrigin: '0 0', filter: b > 0.3 ? `blur(${b.toFixed(1)}px)` : undefined, ...style}}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{overflow: 'visible', position: 'absolute', left: 0, top: 0}}>
        {children}
      </svg>
    </div>
  );
};

/** HTML 层（不包 svg），用于需要 CSS 的元素 */
export const HtmlLayer: React.FC<{depth: number; children: React.ReactNode}> = ({depth, children}) => {
  const c = useContext(CamCtx);
  const s = 1 + (c.z - 1) * depth;
  return (
    <div style={{position: 'absolute', inset: 0,
      transform: `translate(960px,540px) rotate(${c.r * Math.min(1, depth)}deg) scale(${s}) translate(${-960 - c.x * depth}px,${-540 - c.y * depth}px)`, transformOrigin: '0 0'}}>
      {children}
    </div>
  );
};

export const useCam = () => useContext(CamCtx);
