import React from 'react';
import {PlaceTag} from './Text';
import {sceneRange, sStart, cue} from '../lib/timeline';
import {BEAT_FRAMES} from '../data/beats';

const B = BEAT_FRAMES;
/** 画面内文字统一放在左侧（x<700）：地名牌、人物印、演绎/出处印。只在对应场景内出现 */
const TAGS: {scene: string; text: string; at: () => number; kind?: 'place' | 'seal'; y?: number}[] = [
  {scene: '0-4', text: '禹', at: () => sStart(6) + 4, kind: 'seal'},
  {scene: '1-1', text: '大河', at: () => sStart(9) + 10},
  {scene: '1-2', text: '羽山', at: () => sStart(11) + 6},
  {scene: '1-4', text: '演绎', at: () => sStart(14) + 4, kind: 'seal'},
  {scene: '2-2', text: '苍梧', at: () => sStart(25) + 8},
  {scene: '2-4', text: '阳城', at: () => sStart(27) + 8},
  {scene: '2-8', text: '阳城', at: () => sStart(35) + 6},
  {scene: '2-8', text: '南河', at: () => sStart(35) + 10, y: 330},
  {scene: '3-2a', text: '推演', at: () => sStart(41) + 4, kind: 'seal'},
  {scene: '3-3', text: '韩非子', at: () => sStart(44) + 8, kind: 'seal'},
  {scene: '3-5', text: '涂山', at: () => sStart(47) + 12},
  {scene: '3-6b', text: '会稽', at: () => sStart(50) + 6},
  {scene: '4-2', text: '箕山', at: () => cue(57, 'walk') + 6},
  {scene: '4-6a', text: '战国策', at: () => cue(65, 'rush') - 6, kind: 'seal'},
  {scene: '4-6b', text: '竹书纪年', at: () => sStart(66) + 8, kind: 'seal'},
  {scene: '5-1', text: '礼记', at: () => sStart(69) + 8, kind: 'seal'},
];

export const SceneTags: React.FC<{f: number}> = ({f}) => (
  <>
    {TAGS.map((t, i) => {
      const [a, b] = sceneRange(t.scene);
      return f >= a && f < b ? <PlaceTag key={i} f={f} text={t.text} at={t.at()} kind={t.kind} y={t.y} /> : null;
    })}
    {(() => {
      const [a, b] = sceneRange('1-7');
      if (f < a || f >= b) return null;
      return [0, 1, 2].map(i => {
        const at = cue(19, 'days') + i * B;
        const on = f >= at && f < at + B * 1.2;
        return on ? <div key={i} style={{position: 'absolute', left: 90 + i * 80, top: 160, width: 56, height: 56, borderRadius: 28, border: '3px solid #e2b65c', background: 'radial-gradient(#ffd27a, #b8742a)', boxShadow: '0 0 18px #ffb84a', opacity: 1 - (f - at) / (B * 1.2)}} /> : null;
      });
    })()}
  </>
);
