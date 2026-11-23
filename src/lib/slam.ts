import type {Accent} from '../data/types';
import {parseRuns} from './text';
import {ResolvedScreen, frameOf} from './timing';

export const SLAM_SIZE = 116;
export const SLAM_CELL = 128;
/** slam text is centred left of frame centre so it never enters the x > 1536 no-text zone */
export const SLAM_CENTER_X = 830;
export const SLAM_Y = 430;

export type SlamChar = {c: string; accent?: Accent; land: number; i: number};

export const slamLayout = (screen: ResolvedScreen) => {
  const chars: SlamChar[] = [];
  let k = 0;
  let ai = 0;
  for (const g of screen.slam ?? []) {
    const {runs} = parseRuns(g.text, (screen.accents ?? []).slice(ai));
    ai += runs.filter((r) => r.accent).length;
    for (const r of runs) for (const c of r.text) chars.push({c, accent: r.accent, land: frameOf(g.at), i: k++});
  }
  const widths = chars.map((c) => (/[，。、]/.test(c.c) ? SLAM_CELL * 0.55 : SLAM_CELL));
  const total = widths.reduce((a, b) => a + b, 0);
  let x = SLAM_CENTER_X - total / 2;
  const xs = widths.map((w) => {
    const cx = x + w / 2;
    x += w;
    return cx;
  });
  return {chars, xs, left: SLAM_CENTER_X - total / 2, right: SLAM_CENTER_X + total / 2};
};
