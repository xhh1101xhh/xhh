/** 人物表情、服装、姿势预设 */

export type Expr = {
  browAng: number;   // 眉角：+ 外侧下垂（忧/惧），- 怒
  browY: number;     // 眉高：- 抬眉
  lid: number;       // 上眼皮遮盖 0 睁 ~ 1 闭
  lowLid: number;    // 下眼皮上推（笑眼/眯眼）
  pupil: number;     // 瞳孔大小
  lookX: number; lookY: number;
  mouth: number;     // 嘴角：+ 笑 - 撇
  open: number;      // 张嘴
  mw: number;        // 嘴宽
  blush: number; sweat: number; tear: number;
  vein: number;      // 怒筋符号
  shock: number;     // 头顶惊线符号
};
const E = (o: Partial<Expr>): Expr => ({browAng: 0, browY: 0, lid: 0.18, lowLid: 0, pupil: 1, lookX: 0, lookY: 0, mouth: 0, open: 0, mw: 1, blush: 0.15, sweat: 0, tear: 0, vein: 0, shock: 0, ...o});

export const EXPRESSIONS: Record<string, Expr> = {
  neutral: E({}),
  calm: E({lid: 0.28, mouth: 0.05}),
  tired: E({lid: 0.5, browAng: 3, mouth: -0.15, lookY: 1}),
  suppressed: E({lid: 0.35, browAng: -4, browY: 1, mouth: -0.35, mw: 0.8, lookY: 2}),
  clench: E({browAng: -10, browY: 2, lid: 0.25, mouth: -0.45, mw: 1.1, open: 0.12, vein: 1}),
  shock: E({browAng: 4, browY: -5, lid: 0, pupil: 0.65, open: 0.75, mw: 0.7, shock: 1}),
  anxious: E({browAng: 9, browY: -2, lid: 0.12, pupil: 0.85, mouth: -0.4, open: 0.1, sweat: 1, lookX: -2}),
  fear: E({browAng: 12, browY: -4, lid: 0, pupil: 0.6, mouth: -0.55, open: 0.35, mw: 0.8, sweat: 1, shock: 0.5}),
  struggle: E({browAng: 10, browY: -1, lid: 0.3, mouth: -0.5, mw: 0.85, lookX: 3}),
  teary: E({browAng: 12, browY: -2, lid: 0.35, mouth: -0.45, tear: 1, blush: 0.35}),
  bitter: E({browAng: 8, lid: 0.35, lowLid: 0.2, mouth: 0.25, mw: 1.15, lookY: -3}),
  smile: E({lid: 0.2, lowLid: 0.45, mouth: 0.75, open: 0.15, blush: 0.4}),
  relief: E({browAng: 5, lid: 0.45, lowLid: 0.25, mouth: 0.45, blush: 0.3}),
  focus: E({browAng: -6, browY: 1.5, lid: 0.3, mouth: -0.1, mw: 0.9}),
  stern: E({browAng: -9, browY: 2, lid: 0.32, mouth: -0.3, mw: 0.95}),
  curious: E({browAng: 2, browY: -3, lid: 0.08, pupil: 1.1, mouth: 0.1, open: 0.1, lookX: 2}),
  sorrow: E({browAng: 14, browY: -1, lid: 0.55, mouth: -0.5, lookY: 4}),
  thoughtful: E({browAng: 3, browY: -1, lid: 0.35, mouth: -0.05, lookX: 3, lookY: -2}),
  grim: E({browAng: -5, browY: 1, lid: 0.4, mouth: -0.35, sweat: 0.6}),
  guilty: E({browAng: 10, lid: 0.45, mouth: -0.3, lookY: 3, lookX: -2}),
  sad: E({browAng: 11, lid: 0.4, mouth: -0.35, lookX: 3}),
  worried: E({browAng: 12, browY: -2, lid: 0.15, mouth: -0.4, open: 0.08, lookX: 4}),
  cry: E({browAng: 14, browY: -3, lid: 0.85, mouth: -0.4, open: 0.9, mw: 1.0, tear: 1, blush: 0.6}),
  fear2: E({browAng: 12, browY: -4, lid: 0, pupil: 0.6, mouth: -0.55, open: 0.35}),
};

export type Outfit = {
  skin: string; tunic: string; tunicDark: string; trim: string; skirt: string; skirtDark: string; belt: string;
  sleeve: 'narrow' | 'wide'; hair: string; hairStyle: 'bun' | 'loose' | 'bunPin';
  crown?: 'feather' | null; bracelet?: boolean; pendant?: boolean; cape?: boolean; tatter?: number;
  robeLen: number; // 下裳长度 0.6 及膝 ~ 1 及踝
  barefoot?: boolean; label: string;
};
/** 龙山时代（传说中尧舜禹时期）服饰推想：葛麻交领右衽短衣 + 下裳，骨笄束发；首领朱色麻衣、羽冠、玉镯 */
export const OUTFITS: Record<string, Outfit> = {
  commoner: {label: '龙山·葛麻短衣下裳', skin: '#d9a679', tunic: '#8d7b5c', tunicDark: '#5e4f38', trim: '#c8a65a', skirt: '#6b5a40', skirtDark: '#4a3c2a', belt: '#3a2a1c', sleeve: 'narrow', hair: '#1a1410', hairStyle: 'bunPin', robeLen: 0.62, barefoot: true},
  worker: {label: '龙山·破旧葛衣', skin: '#c99468', tunic: '#7a6a4c', tunicDark: '#4f432f', trim: '#a88a48', skirt: '#5c4c36', skirtDark: '#3e3224', belt: '#2e2218', sleeve: 'narrow', hair: '#1a1410', hairStyle: 'loose', robeLen: 0.6, barefoot: true, tatter: 0.6},
  strawcape: {label: '龙山·草编披肩', skin: '#c99468', tunic: '#6f6046', tunicDark: '#463b2a', trim: '#a88a48', skirt: '#54452f', skirtDark: '#382d1f', belt: '#2e2218', sleeve: 'narrow', hair: '#1a1410', hairStyle: 'loose', robeLen: 0.6, barefoot: true, cape: true, tatter: 0.4},
  clean: {label: '龙山·整洁葛衣', skin: '#d5a175', tunic: '#a08a5e', tunicDark: '#6c5a3a', trim: '#e0bd6a', skirt: '#7a6646', skirtDark: '#54452f', belt: '#5a2a1c', sleeve: 'narrow', hair: '#16110d', hairStyle: 'bunPin', robeLen: 0.7, barefoot: false},
  chief: {label: '龙山·首领朱麻衣羽冠', skin: '#d8a77c', tunic: '#a8332a', tunicDark: '#6e1d16', trim: '#e6c06a', skirt: '#7c2a20', skirtDark: '#511a13', belt: '#e0b860', sleeve: 'wide', hair: '#d8d0c4', hairStyle: 'bunPin', crown: 'feather', bracelet: true, pendant: true, robeLen: 0.95, barefoot: false},
  chiefMid: {label: '龙山·首领朱麻衣羽冠', skin: '#d8a77c', tunic: '#a8332a', tunicDark: '#6e1d16', trim: '#e6c06a', skirt: '#7c2a20', skirtDark: '#511a13', belt: '#e0b860', sleeve: 'wide', hair: '#2a221c', hairStyle: 'bunPin', crown: 'feather', bracelet: true, pendant: true, robeLen: 0.95, barefoot: false},
  wife: {label: '龙山·葛麻长衣', skin: '#e0b088', tunic: '#7d6a8a', tunicDark: '#544660', trim: '#d2b06a', skirt: '#6a5878', skirtDark: '#463a52', belt: '#c89a50', sleeve: 'narrow', hair: '#1a1410', hairStyle: 'bunPin', robeLen: 1, barefoot: false},
  guard: {label: '龙山·短衣束发', skin: '#c48f62', tunic: '#5a4a3a', tunicDark: '#3a2f24', trim: '#8a7040', skirt: '#4a3c2e', skirtDark: '#30271d', belt: '#22180f', sleeve: 'narrow', hair: '#140f0b', hairStyle: 'bun', robeLen: 0.55, barefoot: true},
};

export type Pose = {
  lean: number; head: number;
  shL: number; elL: number; shR: number; elR: number; // L=远侧, R=近侧
  hipL: number; knL: number; hipR: number; knR: number;
  bob: number; // 骨盆上下
};
const P = (o: Partial<Pose>): Pose => ({lean: 0, head: 0, shL: -8, elL: 6, shR: 8, elR: 8, hipL: -3, knL: 0, hipR: 3, knR: 0, bob: 0, ...o});
export const POSES: Record<string, Pose> = {
  stand: P({}),
  standTense: P({shL: -4, elL: 20, shR: 4, elR: 22, head: 6}),
  offer: P({lean: 6, shL: 70, elL: 15, shR: 78, elR: 10, head: 4}),
  offerLow: P({lean: 10, shL: 50, elL: 20, shR: 58, elR: 18, head: 10}),
  receive: P({lean: 4, shL: 55, elL: 35, shR: 62, elR: 30, head: 12}),
  point: P({lean: 4, shR: 105, elR: 5, shL: -12, elL: 10, head: -4}),
  raiseHand: P({shR: 150, elR: 20, head: -6}),
  pushPalm: P({lean: 8, shR: 90, elR: 2, shL: -15, elL: 25}),
  windup: P({lean: -6, shR: 40, elR: 95, shL: -10, elL: 20}),
  holdLei: P({shR: 25, elR: 125, shL: -10, elL: 12, head: 3}),
  grabLow: P({lean: 30, shR: 30, elR: 10, shL: 15, elL: 10, hipR: 25, knR: 40, hipL: -10, knL: 10, bob: 14}),
  liftLei: P({lean: 6, shR: 70, elR: 60, shL: 20, elL: 30, head: -4}),
  digUp: P({lean: -8, shR: 120, elR: 40, shL: 110, elL: 50, hipR: 10, knR: 15, hipL: -8}),
  digDown: P({lean: 28, shR: 40, elR: 10, shL: 30, elL: 15, hipR: 20, knR: 30, hipL: -12, knL: 12, bob: 10}),
  ram: P({lean: 10, shR: 150, elR: 10, shL: 145, elL: 15, hipR: 8, knR: 10}),
  ramDown: P({lean: 22, shR: 70, elR: 10, shL: 65, elL: 10, hipR: 15, knR: 25, bob: 8}),
  kneel: P({lean: 12, head: 18, shL: 10, elL: 30, shR: 14, elR: 34, hipL: 80, knL: 95, hipR: 85, knR: 100, bob: 46}),
  bowLed: P({lean: 18, head: 22, shL: -20, elL: 40, shR: -24, elR: 44, hipL: -6, knL: 4, hipR: 10, knR: 12}),
  sitCross: P({lean: 0, head: -10, shL: 20, elL: 60, shR: 22, elR: 64, hipL: 70, knL: 140, hipR: 78, knR: 145, bob: 62}),
  hugKnees: P({lean: 14, head: 16, shL: 40, elL: 80, shR: 44, elR: 84, hipL: 95, knL: 150, hipR: 100, knR: 155, bob: 64}),
  reachCurtain: P({lean: 4, shR: 70, elR: 40, shL: -8, elL: 10, head: 2}),
  lowerHand: P({lean: 2, shR: 15, elR: 25, shL: -8, elL: 10, head: 14}),
  rise: P({lean: 10, shR: 20, elR: 30, shL: 10, elL: 20, hipR: 30, knR: 50, hipL: 20, knL: 40, bob: 20}),
  holdBaby: P({lean: 6, head: 14, shL: 40, elL: 95, shR: 45, elR: 100, hipL: 80, knL: 95, hipR: 85, knR: 100, bob: 44}),
  command: P({shR: 125, elR: 15, shL: -10, elL: 12, head: -5}),
  turnAway: P({lean: -4, head: -15}),
  cheer: P({shR: 160, elR: 10, shL: 150, elL: 15, head: -10}),
};
