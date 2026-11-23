import type {Expression} from '../../data/types';

/** numeric face rig; everything interpolates, symbols cross-fade */
export type Face = {
  browL: number; // inner-end lift (deg): + worried / surprised, - angry
  browR: number;
  browY: number; // vertical offset (px, - = higher)
  lid: number; // 0 open .. 1 closed (upper lid)
  squint: number; // 0..1 lower lid up (smiling eyes)
  pupil: number; // pupil scale 0.6..1.4
  lookX: number; // -1..1
  lookY: number;
  mouthW: number; // px
  mouthOpen: number; // 0..1
  mouthCurve: number; // -1 frown .. 1 smile
  mouthSkew: number; // -1..1 lopsided (smug)
  blush: number;
  sweat: number;
  tear: number;
  red: number; // face flush (strain)
  symbol: 'none' | 'question' | 'cloud' | 'anger' | 'heart' | 'sparkle';
};

const base: Face = {browL: 0, browR: 0, browY: 0, lid: 0.12, squint: 0, pupil: 1, lookX: 0, lookY: 0, mouthW: 18, mouthOpen: 0, mouthCurve: 0.15, mouthSkew: 0, blush: 0.15, sweat: 0, tear: 0, red: 0, symbol: 'none'};
const e = (o: Partial<Face>): Face => ({...base, ...o});

export const EXPRESSIONS: Record<Expression, Face> = {
  neutral: base,
  alert: e({browL: 14, browR: 14, browY: -7, lid: 0, pupil: 0.62, lookX: 0.7, mouthW: 10, mouthOpen: 0.15, mouthCurve: -0.1, sweat: 1}),
  determined: e({browL: -14, browR: -14, browY: 2, lid: 0.25, pupil: 0.85, lookX: -0.4, mouthW: 16, mouthCurve: -0.35, sweat: 0.4}),
  relief: e({browL: 8, browR: 8, browY: -2, lid: 0.55, pupil: 1, lookY: 0.2, mouthW: 12, mouthOpen: 0.45, mouthCurve: 0.1, blush: 0.25}),
  smug: e({browL: -4, browR: 14, browY: -2, lid: 0.35, pupil: 1, lookX: 0.5, mouthW: 22, mouthCurve: 0.65, mouthSkew: 0.7, blush: 0.3}),
  hum: e({browL: 6, browR: 6, lid: 0.82, squint: 0.4, mouthW: 9, mouthOpen: 0.35, mouthCurve: 0.3, blush: 0.35}),
  busy: e({browL: -4, browR: -4, lid: 0.2, pupil: 0.9, lookX: -0.5, lookY: 0.5, mouthW: 14, mouthOpen: 0.2, mouthCurve: 0.2}),
  proud: e({browL: -6, browR: 16, browY: -4, lid: 0.3, mouthW: 26, mouthCurve: 0.8, mouthSkew: 0.4, blush: 0.35}),
  wrinkle: e({browL: -10, browR: -10, browY: 3, lid: 0.45, squint: 0.4, pupil: 0.9, lookX: -0.8, mouthW: 16, mouthCurve: -0.55, mouthSkew: -0.4}),
  hollow: e({browL: 6, browR: 6, browY: 1, lid: 0.38, pupil: 0.8, lookX: 0.55, lookY: 0.1, mouthW: 12, mouthCurve: -0.05, blush: 0.05}),
  puzzled: e({browL: 14, browR: -6, browY: -2, lid: 0.15, pupil: 0.95, lookX: 0.4, lookY: -0.5, mouthW: 12, mouthOpen: 0.08, mouthCurve: -0.2, mouthSkew: -0.5, symbol: 'question'}),
  surprised: e({browL: 16, browR: 16, browY: -8, lid: 0, pupil: 0.7, mouthW: 14, mouthOpen: 0.75, mouthCurve: 0}),
  tidy: e({browL: 2, browR: 2, lid: 0.3, lookY: 0.6, lookX: 0.3, mouthW: 14, mouthCurve: 0.25}),
  stiffSmile: e({browL: 14, browR: 12, browY: -6, lid: 0.05, pupil: 0.7, lookX: -0.6, mouthW: 28, mouthOpen: 0.1, mouthCurve: 0.45, sweat: 1}),
  wince: e({browL: 10, browR: -8, browY: 1, lid: 0.55, squint: 0.3, pupil: 0.85, lookX: -0.7, mouthW: 24, mouthOpen: 0.15, mouthCurve: -0.5, mouthSkew: 0.5, sweat: 0.6}),
  shockO: e({browL: 18, browR: 18, browY: -9, lid: 0, pupil: 0.55, lookX: 0.8, lookY: -0.4, mouthW: 14, mouthOpen: 1, mouthCurve: 0, sweat: 0.8}),
  awkward: e({browL: 12, browR: 6, browY: -3, lid: 0.25, pupil: 0.85, lookX: -0.5, lookY: 0.3, mouthW: 18, mouthOpen: 0.05, mouthCurve: 0.1, mouthSkew: -0.6, sweat: 0.7, blush: 0.4}),
  strain: e({browL: -16, browR: -16, browY: 3, lid: 0.7, squint: 0.6, pupil: 0.8, mouthW: 30, mouthOpen: 0.35, mouthCurve: -0.6, sweat: 1, red: 1}),
  happy: e({browL: 6, browR: 6, browY: -3, lid: 0.25, squint: 0.5, mouthW: 24, mouthOpen: 0.4, mouthCurve: 0.9, blush: 0.5}),
  curious: e({browL: 10, browR: 4, browY: -4, lid: 0.05, pupil: 1.25, lookX: -0.3, lookY: 0.4, mouthW: 10, mouthOpen: 0.2, mouthCurve: 0.2}),
  scared: e({browL: 20, browR: 20, browY: -6, lid: 0, pupil: 0.55, mouthW: 18, mouthOpen: 0.5, mouthCurve: -0.6, sweat: 0.8}),
  calm: e({browL: 4, browR: 4, lid: 0.55, squint: 0.3, mouthW: 16, mouthCurve: 0.45, blush: 0.3}),
  longing: e({browL: 12, browR: 12, browY: -2, lid: 0.3, pupil: 1.35, lookX: 0.8, mouthW: 12, mouthCurve: 0.05, blush: 0.75}),
  annoyed: e({browL: -14, browR: -10, browY: 3, lid: 0.45, pupil: 0.9, lookX: 0.6, mouthW: 18, mouthCurve: -0.5, symbol: 'anger'}),
  cold: e({browL: -4, browR: -4, lid: 0.5, pupil: 0.8, lookX: 0.5, mouthW: 14, mouthCurve: -0.15, blush: 0}),
  sad: e({browL: 18, browR: 18, browY: 0, lid: 0.45, pupil: 1.1, lookY: 0.6, mouthW: 16, mouthCurve: -0.6, tear: 1, blush: 0.2}),
  resolute: e({browL: -10, browR: -10, lid: 0.15, pupil: 1.1, lookY: -0.3, mouthW: 18, mouthCurve: 0.05}),
  awe: e({browL: 14, browR: 14, browY: -6, lid: 0, pupil: 1.3, lookY: -0.6, mouthW: 16, mouthOpen: 0.7, mouthCurve: 0.3, symbol: 'sparkle'}),
  shy: e({browL: 10, browR: 10, lid: 0.45, pupil: 1.1, lookX: -0.6, lookY: 0.4, mouthW: 14, mouthCurve: 0.45, mouthSkew: 0.3, blush: 1}),
  laugh: e({browL: 8, browR: 8, browY: -4, lid: 0.9, squint: 1, mouthW: 32, mouthOpen: 0.9, mouthCurve: 1, blush: 0.6}),
  gentle: e({browL: 6, browR: 6, lid: 0.4, squint: 0.35, mouthW: 18, mouthCurve: 0.55, blush: 0.35}),
};

const NUM_KEYS = Object.keys(base).filter((k) => k !== 'symbol') as (keyof Omit<Face, 'symbol'>)[];
export const blendFace = (a: Face, b: Face, t: number): Face & {symbolA: Face['symbol']; symbolB: Face['symbol']; symbolT: number} => {
  const out = {...a} as Face;
  for (const k of NUM_KEYS) (out[k] as number) = (a[k] as number) + ((b[k] as number) - (a[k] as number)) * t;
  return {...out, symbol: t > 0.5 ? b.symbol : a.symbol, symbolA: a.symbol, symbolB: b.symbol, symbolT: t};
};
