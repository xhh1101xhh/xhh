import SUB from '../data/subtitles.json';
import {BEATS} from '../data/beats';

export type Emph = {word: string; color: 'gold' | 'luodian' | 'zhu' | 'shilv'};
export type Screen = {
  id: number; section: number; scene: string; start: string; end: string;
  startFrame: number; endFrame: number; text: string; emphasis: Emph[];
  display: 'bottom' | 'slam' | 'inscene' | 'blank';
  slam?: {pre: string; key: string; post: string; at: string; f: number};
  cueFrames: Record<string, any>;
  cast?: {who: string; outfit: string; view?: string; exprFrames: [number, string][]}[];
  sfxFrames: {f: number; sound: string; gain: number; dur?: number; duck?: boolean}[];
};
export const META = SUB.meta as any;
export const SCREENS = SUB.screens as unknown as Screen[];
export const SCENES = SUB.scenes as Record<string, {base: string | null; transitionId: string | null; desc: string}>;
export const PREVIEW_END: number = META.previewEndFrame;
export const FULL_END: number = META.fullEndFrame;

export const screen = (id: number) => SCREENS[id - 1];
/** 某屏的动作拍点帧 */
export const cue = (id: number, key: string): number => {
  const v = screen(id).cueFrames[key];
  if (v === undefined) throw new Error(`cue ${id}.${key} missing`);
  return v as number;
};
export const sStart = (id: number) => screen(id).startFrame;
export const sEnd = (id: number) => screen(id).endFrame;

/** 场景起止帧：场景第一屏开始 → 下一场景第一屏开始 */
export function sceneRange(sceneId: string, endCap = FULL_END): [number, number] {
  const idx = SCREENS.findIndex(s => s.scene === sceneId);
  if (idx < 0) throw new Error('scene ' + sceneId);
  const start = idx === 0 ? 0 : SCREENS[idx].startFrame;
  let j = idx;
  while (j < SCREENS.length && SCREENS[j].scene === sceneId) j++;
  const end = j < SCREENS.length ? SCREENS[j].startFrame : endCap;
  return [start, end];
}
export const sceneBase = (sceneId: string) => SCENES[sceneId]?.base ?? '#141210';
export const EMPH_COLORS: Record<string, string> = META.colors;
export {BEATS};

/** 某屏某角色的表情时间线（来自字幕文件 cast.expr），供场景直接使用 */
export const castExpr = (id: number, who: string): [number, string][] =>
  (screen(id).cast ?? []).find(c => c.who === who)?.exprFrames ?? [];
/** 多屏合并表情时间线 */
export const castExprs = (ids: number[], who: string): [number, string][] => ids.flatMap(i => castExpr(i, who));
