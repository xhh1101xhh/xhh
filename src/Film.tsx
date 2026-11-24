import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {SCREENS, THEME, WATERMARK} from './data/subtitles';
import {PaperFinish, ThemeTag, Watermark} from './components/fixed/FixedLayer';
import {Subtitles} from './components/fixed/Subtitles';
import {Slam} from './components/fixed/Slam';
import {PaperLayersDive} from './components/transitions/PaperLayersDive';
import {DiagonalLightCut, HorizontalPush, IrisOpen, MirrorFlip, PaperTear} from './components/transitions/Transitions';
import {S1bUniverses} from './scenes/S1bUniverses';
import {S2Memory} from './scenes/S2Memory';
import {S3Ember} from './scenes/S3Ember';
import {S4Shell} from './scenes/S4Shell';
import {S5Open} from './scenes/S5Open';
import {S6Ending} from './scenes/S6Ending';
import {Soundtrack} from './audio/Soundtrack';
import {S0Hook} from './scenes/S0Hook';
import {S1aRoom} from './scenes/S1aRoom';
import {cue} from './lib/timing';

const ALL_TEXT = Array.from(new Set((SCREENS.map((s) => s.text).join('') + THEME + WATERMARK + '0123456789').replace(/[【】|]/g, ''))).join('');

/** wait until every glyph we use is loaded at every weight (fontsource splits CJK into unicode-range subsets) */
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([500, 700, 900].map((w) => document.fonts.load(`${w} 64px "Noto Sans SC"`, ALL_TEXT)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/** the camera world: sections joined by designed transitions (no hard page flips) */
type Sec = {id: string; render: (f: number) => React.ReactNode};
const sections = (): Sec[] => [
  {id: 'S0', render: (f) => <S0Hook frame={f} />},
  {id: 'S1a', render: (f) => <S1aRoom frame={f} />},
  {id: 'S1b', render: (f) => <S1bUniverses frame={f} />},
  {id: 'S2', render: (f) => <S2Memory frame={f} />},
  {id: 'S3', render: (f) => <S3Ember frame={f} />},
  {id: 'S4', render: (f) => <S4Shell frame={f} />},
  {id: 'S5', render: (f) => <S5Open frame={f} />},
  {id: 'S6', render: (f) => <S6Ending frame={f} />},
];
/** boundary transitions between section i and i+1: window [w0, w1) and the renderer */
const boundaries = () => [
  {at: cue('diveLayers'), w0: cue('diveLayers') - 20, w1: cue('diveLayers') + 16, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <PaperLayersDive frame={f} at={at} cx={960} cy={500} outgoing={a} incoming={b} />},
  {at: cue('pushSplit'), w0: cue('pushSplit') - 12, w1: cue('pushSplit') + 1, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <HorizontalPush frame={f} at={at} outgoing={a} incoming={b} />},
  {at: cue('irisLantern'), w0: cue('irisLantern') - 2, w1: cue('irisLantern') + 17, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <IrisOpen frame={f} at={at} cx={960} cy={500} outgoing={a} incoming={b} />},
  {at: cue('goldTrace1'), w0: cue('goldTrace1') - 6, w1: cue('goldTrace1') + 8, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <ShapeMatch frame={f} at={at} outgoing={a} incoming={b} />},
  {at: cue('mirrorFlip'), w0: cue('mirrorFlip') - 10, w1: cue('mirrorFlip') + 1, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <MirrorFlip frame={f} at={at} outgoing={a} incoming={b} />},
  {at: cue('paperTear'), w0: cue('paperTear') - 2, w1: cue('paperTear') + 18, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <PaperTear frame={f} at={at} outgoing={a} incoming={b} />},
  {at: cue('lightCut'), w0: cue('lightCut') - 12, w1: cue('lightCut') + 5, run: (f: number, a: React.ReactNode, b: React.ReactNode, at: number) => <DiagonalLightCut frame={f} at={at} outgoing={a} incoming={b} />},
];

const World: React.FC = () => {
  const frame = useCurrentFrame();
  const secs = sections();
  const bs = boundaries();
  const tr = bs.findIndex((b) => frame >= b.w0 && frame < b.w1);
  if (tr >= 0) return <>{bs[tr].run(frame, secs[tr].render(frame), secs[tr + 1].render(frame), bs[tr].at)}</>;
  const idx = bs.filter((b) => frame >= b.at).length;
  return <>{secs[idx].render(frame)}</>;
};

/** 形状匹配: the child's ember and the adult's ember share the screen centre; a gold flash bridges the cut */
const ShapeMatch: React.FC<{frame: number; at: number; outgoing: React.ReactNode; incoming: React.ReactNode}> = ({frame, at, outgoing, incoming}) => {
  const t = Math.max(0, Math.min(1, (frame - (at - 6)) / 10));
  const flash = Math.exp(-Math.abs(frame - at) / 3);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 1 - t}}>{outgoing}</AbsoluteFill>
      <AbsoluteFill style={{opacity: t}}>{incoming}</AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle 420px at 960px 540px, rgba(255,226,160,0.9), rgba(232,176,75,0) 70%)', opacity: flash, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/** fixed layers sit outside the camera and never scale with it */
export const Film: React.FC<{endFrame?: number}> = ({endFrame}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: '#0E1A33'}}>
      <World />
      <PaperFinish />
      <Subtitles />
      <Slam />
      <ThemeTag />
      <Watermark />
      <Soundtrack endFrame={endFrame} />
    </AbsoluteFill>
  );
};
