import {BAR_FRAMES, BEAT_FRAMES, DURATION_FRAMES, FPS, SECTIONS, SectionId, beatFrameAt} from '../data/beats';
import {REF_SECTION_BARS, SCREENS} from '../data/subtitles';
import type {ActionCue, Screen, SfxCue} from '../data/types';

export {FPS};

/** Resolve a beat label to a frame. Labels are section-relative, so a new BGM re-syncs automatically.
 *  When a section in the new BGM has a different bar count than the reference, the bar index is remapped
 *  proportionally (bar 9 of a 16-bar chorus becomes bar 5 of an 8-bar one). */
export const frameOf = (label: string): number => {
  if (label === 'START') return 0;
  if (label === 'END') return DURATION_FRAMES;
  const m = /^([A-Z0-9]+):(\d+)\.(\d)([+-][\d.]+)?$/.exec(label.trim());
  if (!m) throw new Error(`bad beat label: ${label}`);
  const id = m[1] as SectionId;
  const sec = SECTIONS[id];
  if (!sec) throw new Error(`unknown section ${id}`);
  const ref = REF_SECTION_BARS[id as keyof typeof REF_SECTION_BARS] ?? sec.bars;
  let bar = Number(m[2]) - 1;
  if (ref !== sec.bars) bar = Math.min(sec.bars - 1, Math.floor((bar * sec.bars) / ref));
  const idx = (sec.startBar + bar) * 4 + Number(m[3]) - 1 + (m[4] ? Number(m[4]) : 0);
  const i0 = Math.floor(idx);
  const a = beatFrameAt(i0);
  const b = beatFrameAt(i0 + 1);
  return Math.round(a + (b - a) * (idx - i0));
};

export type ResolvedScreen = Screen & {from: number; to: number; revealFrom?: number};
export const RESOLVED: ResolvedScreen[] = SCREENS.map((s) => ({
  ...s,
  from: frameOf(s.start),
  to: frameOf(s.end),
  revealFrom: s.revealAt ? frameOf(s.revealAt) : undefined,
}));

const ACTIONS = new Map<string, {cue: ActionCue; frame: number; screen: string}>();
for (const s of SCREENS) for (const a of s.actions ?? []) ACTIONS.set(a.id, {cue: a, frame: frameOf(a.at), screen: s.id});

/** frame of a named action cue from the subtitle file (throws if missing so typos surface). */
export const cue = (id: string): number => {
  const c = ACTIONS.get(id);
  if (!c) throw new Error(`missing action cue "${id}" in src/data/subtitles.ts`);
  return c.frame;
};
export const allCues = () => [...ACTIONS.values()];

export type ResolvedSfx = SfxCue & {from: number; to?: number; screen: string};
export const SFX: ResolvedSfx[] = SCREENS.flatMap((s) =>
  (s.sfx ?? []).map((x) => ({...x, from: frameOf(x.at), to: x.until ? frameOf(x.until) : undefined, screen: s.id})),
);

/** cast keyframes per character: [{frame, expression?, outfit?}] sorted */
export const castTrack = (who: string) =>
  SCREENS.flatMap((s) => (s.cast ?? []).filter((c) => c.who === who).map((c) => ({...c, frame: frameOf(c.at)}))).sort(
    (a, b) => a.frame - b.frame,
  );

export const screenAt = (frame: number) => RESOLVED.find((s) => frame >= s.from && frame < s.to);
export const sectionRange = (sec: Screen['section']) => {
  const list = RESOLVED.filter((s) => s.section === sec);
  return {from: Math.min(...list.map((s) => s.from)), to: Math.max(...list.map((s) => s.to))};
};

/** beat frames in [a, b) — handy for breathing / bounce on every beat */
export const beatsBetween = (a: number, b: number) => BEAT_FRAMES.filter((f) => f >= a && f < b);
export const barsBetween = (a: number, b: number) => BAR_FRAMES.filter((f) => f >= a && f < b);
