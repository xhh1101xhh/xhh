import {ACCENT_HEX, Accent} from '../data/types';

export type Run = {text: string; accent?: Accent};

/** "他做的【关灯】。" + accents -> runs; strips the "|" reveal marker (returns its char index). */
export const parseRuns = (text: string, accents: Accent[] = []): {runs: Run[]; revealIndex: number} => {
  const runs: Run[] = [];
  let k = 0;
  let plain = '';
  let revealIndex = -1;
  const re = /【([^】]*)】|\||([^【|]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m[0] === '|') {
      revealIndex = plain.length;
      continue;
    }
    if (m[1] !== undefined) {
      runs.push({text: m[1], accent: accents[k++] ?? 'gold'});
      plain += m[1];
    } else {
      runs.push({text: m[2]});
      plain += m[2];
    }
  }
  return {runs, revealIndex};
};

export const plainText = (text: string) => text.replace(/[【】|]/g, '');
export const countChars = (text: string) => plainText(text).replace(/[\s，。、？！：；——…,.\-「」]/g, '').length;
export const accentHex = (a?: Accent) => (a ? ACCENT_HEX[a] : undefined);

const BREAK_AFTER = '，。；：？！、—';
/** CJK width estimate: every glyph ~1em (punctuation in CJK fonts is full-width too) */
export const textWidth = (s: string, fontSize: number, letterSpacing = 0) => s.length * (fontSize + letterSpacing);

/** Split into at most 2 lines at a semantic break (after punctuation), never leaving a single-char line.
 *  Returns lines and a letter-spacing tweak (negative) when a slightly long single line can be tightened to fit. */
export const layoutLines = (text: string, fontSize: number, maxWidth: number) => {
  const s = plainText(text);
  const w = textWidth(s, fontSize);
  if (w <= maxWidth) return {lines: [s], letterSpacing: 0};
  // try tightening up to -6% first
  const tight = (maxWidth / s.length - fontSize);
  if (tight >= -fontSize * 0.06) return {lines: [s], letterSpacing: tight};
  let best = -1;
  let bestScore = Infinity;
  for (let i = 2; i < s.length - 2; i++) {
    if (!BREAK_AFTER.includes(s[i - 1])) continue;
    const a = s.slice(0, i);
    const b = s.slice(i);
    if (b.replace(/[，。；：？！、—]/g, '').length < 2 || a.length < 2) continue;
    const score = Math.abs(a.length - b.length);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best < 0) best = Math.ceil(s.length / 2);
  return {lines: [s.slice(0, best), s.slice(best)], letterSpacing: 0};
};

export const hasOrphan = (lines: string[]) => lines.some((l) => l.replace(/[，。；：？！、—\s]/g, '').length <= 1);
