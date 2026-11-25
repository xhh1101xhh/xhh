import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {LacquerDefs} from './lacquer/Defs';
import {HighlightBand} from './lacquer/Materials';
import {Subtitles, FixedOverlay, PlaceTag} from './components/Text';
import {outStyle, inStyle, TransOverlay, TRANS_WIN} from './components/Transitions';
import {SCENES, SCREENS, sceneRange, PREVIEW_END, FULL_END} from './lib/timeline';
import {S0_1, S0_2, S0_3, S0_4, S0_5} from './sections/Section0';
import {S1_1, S1_2, S1_3, S1_4, S1_5, S1_6, S1_7, S1_8, S1_9} from './sections/Section1';
import {S2_1, S2_2, S2_3, S2_4, S2_5, S2_6, S2_7, S2_8, S2_9} from './sections/Section2';
import {S3_1, S3_2a, S3_2b, S3_3, S3_4, S3_5, S3_6, S3_6b, S3_7, S3_8} from './sections/Section3';
import {S4_1, S4_2, S4_3, S4_4, S4_5, S4_6a, S4_6b, S4_7} from './sections/Section4';
import {S5_1, S5_2, S5_3, S5_4} from './sections/Section5';
import {SceneTags} from './components/SceneTags';
import {ensureFonts} from './fonts';

type SceneDef = {id: string; C: React.FC<{f: number}>; opt?: any};
/** 场景注册表：顺序即时间顺序；opt 给转场用（聚焦点、光缝位置等） */
export const SCENE_LIST: SceneDef[] = [
  {id: '0-1', C: S0_1, opt: {focus: [1310, 400], drip: [960, 560]}},
  {id: '0-2', C: S0_2, opt: {focus: [1250, 470]}},
  {id: '0-3', C: S0_3},
  {id: '0-4', C: S0_4},
  {id: '0-5', C: S0_5, opt: {focus: [620, 300]}},
  {id: '1-1', C: S1_1},
  {id: '1-2', C: S1_2},
  {id: '1-3', C: S1_3},
  {id: '1-4', C: S1_4},
  {id: '1-5', C: S1_5},
  {id: '1-6', C: S1_6},
  {id: '1-7', C: S1_7, opt: {slitX: 1180}},
  {id: '1-8', C: S1_8},
  {id: '1-9', C: S1_9},
  {id: '2-1', C: S2_1}, {id: '2-2', C: S2_2}, {id: '2-3', C: S2_3}, {id: '2-4', C: S2_4}, {id: '2-5', C: S2_5},
  {id: '2-6', C: S2_6}, {id: '2-7', C: S2_7}, {id: '2-8', C: S2_8}, {id: '2-9', C: S2_9},
  {id: '3-1', C: S3_1}, {id: '3-2a', C: S3_2a}, {id: '3-2b', C: S3_2b}, {id: '3-3', C: S3_3}, {id: '3-4', C: S3_4},
  {id: '3-5', C: S3_5}, {id: '3-6', C: S3_6}, {id: '3-6b', C: S3_6b}, {id: '3-7', C: S3_7}, {id: '3-8', C: S3_8},
  {id: '4-1', C: S4_1}, {id: '4-2', C: S4_2}, {id: '4-3', C: S4_3}, {id: '4-4', C: S4_4}, {id: '4-5', C: S4_5},
  {id: '4-6a', C: S4_6a}, {id: '4-6b', C: S4_6b}, {id: '4-7', C: S4_7},
  {id: '5-1', C: S5_1}, {id: '5-2', C: S5_2}, {id: '5-3', C: S5_3}, {id: '5-4', C: S5_4},
];

/** 砸屏时的镜头震动 */
function shakeAt(f: number) {
  for (const s of SCREENS) {
    if (s.slam && f >= s.slam.f && f < s.slam.f + 9) {
      const k = 1 - (f - s.slam.f) / 9;
      return [Math.sin(f * 2.7) * 10 * k, Math.cos(f * 3.1) * 7 * k];
    }
  }
  return [0, 0];
}

export const Film: React.FC<{end?: number; audio?: string}> = ({end = PREVIEW_END, audio}) => {
  ensureFonts();
  const f = useCurrentFrame();
  const items: React.ReactNode[] = [];
  SCENE_LIST.forEach((sd, i) => {
    const next = SCENE_LIST[i + 1];
    const [a, b0] = sceneRange(sd.id, end);
    const b = next ? b0 : end;
    const tr = SCENES[sd.id]?.transitionId ?? 'punchCut';
    const [pre] = TRANS_WIN[tr] ?? [0, 0];
    const ntr = next ? (SCENES[next.id]?.transitionId ?? 'punchCut') : null;
    const npost = ntr ? (TRANS_WIN[ntr] ?? [0, 0])[1] : 0;
    if (f < a - pre || f >= b + npost) return;
    const st: React.CSSProperties = {};
    if (i > 0 && f < a + (TRANS_WIN[tr]?.[1] ?? 0)) Object.assign(st, inStyle(tr, f, a, sd.opt));
    if (next && f >= b - (TRANS_WIN[ntr!]?.[0] ?? 0)) Object.assign(st, outStyle(ntr!, f, b, sd.opt));
    if (i === 0) Object.assign(st, inStyle('lacquerDrip', f, 3, {focus: sd.opt?.drip}));
    items.push(<div key={sd.id} style={{position: 'absolute', inset: 0, ...st}}><sd.C f={f} /></div>);
  });
  const overlays = SCENE_LIST.map((sd, i) => {
    if (i === 0) return <TransOverlay key="o0" tr="lacquerDrip" f={f} T={3} opt={{focus: sd.opt?.drip}} />;
    const [a] = sceneRange(sd.id, end);
    const tr = SCENES[sd.id]?.transitionId ?? 'punchCut';
    return <TransOverlay key={'o' + sd.id} tr={tr} f={f} T={a} opt={{...SCENE_LIST[i - 1].opt, ...sd.opt}} />;
  });
  const [sx, sy] = shakeAt(f);
  return (
    <AbsoluteFill style={{background: '#0b0908'}}>
      <LacquerDefs />
      <AbsoluteFill style={{transform: `translate(${sx}px,${sy}px) scale(1.02)`}}>
        {items}
      </AbsoluteFill>
      {overlays}
      <HighlightBand f={f} period={260} amt={0.07} />
      <SceneTags f={f} />
      <Subtitles f={f} scenes={SCENE_LIST.map(x => x.id)} />
      <FixedOverlay f={f} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
