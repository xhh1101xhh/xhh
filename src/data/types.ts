/** Beat label: "SECTION:bar.beat" with optional "+0.5" beat offset (see src/data/beats.ts).
 *  Special labels: "START" (frame 0) and "END" (last frame of the BGM). */
export type BeatLabel = string;

export type Accent = 'gold' | 'blue' | 'red' | 'green';
export const ACCENT_HEX: Record<Accent, string> = {
  gold: '#E8B04B', // 金缮金：温柔、结论
  blue: '#6FA8DC', // 青花蓝：克制、冷、禁忌
  red: '#E2657A', // 胭脂红：欲望、冲突
  green: '#8FD1A8', // 釉绿：领悟、健康
};
export const IVORY = '#F3EBDD';

/** bottom = 底部字幕, slam = 大字砸屏, inscene = 画面内文字, blank = 留白 */
export type Display = 'bottom' | 'slam' | 'inscene' | 'blank';

export type Who = 'hero' | 'friend' | 'kid' | 'mom' | 'crab' | 'yarn' | 'stranger';
export type Outfit = 'raincoat' | 'vest' | 'pajama' | 'cardigan' | 'coat' | 'linen' | 'friend' | 'mom' | 'stranger';
export type Expression =
  | 'neutral' | 'alert' | 'determined' | 'relief' | 'smug' | 'hum' | 'busy' | 'proud' | 'wrinkle'
  | 'hollow' | 'puzzled' | 'surprised' | 'tidy' | 'stiffSmile' | 'wince' | 'shockO' | 'awkward'
  | 'strain' | 'happy' | 'curious' | 'scared' | 'calm' | 'longing' | 'annoyed' | 'cold' | 'sad'
  | 'resolute' | 'awe' | 'shy' | 'laugh' | 'gentle';

export type CastCue = {who: Who; at: BeatLabel; expression?: Expression; outfit?: Outfit; note?: string};
/** a named visual action; scene components look these up by id, so timing lives here, not in code */
export type ActionCue = {id: string; at: BeatLabel; note: string};
export type SfxCue = {at: BeatLabel; sfx: string; gain?: number; until?: BeatLabel; loop?: boolean; fade?: number};
export type SlamGroup = {text: string; at: BeatLabel};

export type Screen = {
  id: string;
  section: 'S0' | 'S1a' | 'S1b' | 'S2' | 'S3' | 'S4' | 'S5' | 'S6';
  scene: string; // set id + shot
  start: BeatLabel;
  end: BeatLabel;
  /** text with 【重点词】; "|" splits a later reveal (second part appears at revealAt) */
  text: string;
  accents?: Accent[];
  revealAt?: BeatLabel;
  display: Display;
  slam?: SlamGroup[];
  bg?: string; // base colour of the shot (hex)
  cast?: CastCue[];
  actions?: ActionCue[];
  sfx?: SfxCue[];
};
