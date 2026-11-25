import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame} from 'remotion';
import {LacquerDefs} from './lacquer/Defs';
import {HighlightBand} from './lacquer/Materials';
import {Subtitles, FixedOverlay, PlaceTag} from './components/Text';
import {outStyle, inStyle, TransOverlay, TRANS_WIN} from './components/Transitions';
import {SCENES, SCREENS, sceneRange, PREVIEW_END} from './lib/timeline';
import {S0_1, S0_2, S0_3, S0_4, S0_5} from './sections/Section0';
import {S1_1, S1_2, S1_3, S1_4, S1_5, S1_6, S1_7, S1_8, S1_9, S1_TAGS} from './sections/Section1';
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
      <S1_TAGS f={f} />
      <Subtitles f={f} scenes={SCENE_LIST.map(x => x.id)} />
      <FixedOverlay f={f} />
      {audio && <Audio src={staticFile(audio)} />}
    </AbsoluteFill>
  );
};
