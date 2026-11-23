import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {IVORY} from '../../data/types';
import {THEME, WATERMARK} from '../../data/subtitles';

export const FONT = "'Noto Sans SC', 'Source Han Sans SC', sans-serif";

/** paper grain + vignette over everything (fixed, never moves with the camera) */
export const PaperFinish: React.FC = () => (
  <>
    <AbsoluteFill style={{mixBlendMode: 'soft-light', opacity: 0.55, pointerEvents: 'none'}}>
      <Img src={staticFile('textures/grain.png')} style={{width: 1920, height: 1080}} />
    </AbsoluteFill>
    <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.18, pointerEvents: 'none'}}>
      <Img src={staticFile('textures/grain.png')} style={{width: 1920, height: 1080}} />
    </AbsoluteFill>
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse 75% 70% at 50% 46%, transparent 55%, rgba(4,3,8,0.55) 100%)',
        pointerEvents: 'none',
      }}
    />
  </>
);

export const ThemeTag: React.FC = () => (
  <div style={{position: 'absolute', left: 58, top: 42, fontFamily: FONT, fontWeight: 700, fontSize: 28, color: IVORY, opacity: 0.7, letterSpacing: 4, textShadow: '0 2px 6px rgba(0,0,0,0.6)'}}>
    {THEME}
  </div>
);

export const Watermark: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      right: 56,
      top: 44,
      fontFamily: FONT,
      fontWeight: 500,
      fontSize: 22,
      lineHeight: 1,
      color: IVORY,
      opacity: 0.35,
      padding: '6px 10px',
      border: `1px solid ${IVORY}`,
      letterSpacing: 2,
    }}
  >
    {WATERMARK}
  </div>
);
