import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ACCENT_HEX, IVORY} from '../../data/types';
import {clamp, ease, prog, spr} from '../../lib/anim';
import {layoutLines, parseRuns} from '../../lib/text';
import {RESOLVED} from '../../lib/timing';
import {FONT} from './FixedLayer';

export const SUB_FONT_SIZE = 64;
export const SUB_MAX_WIDTH = 1100;
export const SUB_BOTTOM = 80;

/** Bottom subtitles: centered, 80px from the bottom, <= 1100px wide, max 2 lines, ivory with accent words.
 *  Reads every screen with display "bottom" from the subtitle file. */
export const Subtitles: React.FC = () => {
  const frame = useCurrentFrame();
  const s = RESOLVED.find((x) => x.display === 'bottom' && frame >= x.from && frame < x.to);
  const band = RESOLVED.some((x) => x.display === 'bottom' && frame >= x.from - 6 && frame < x.to + 6);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {/* soft dark band under the subtitle area for contrast on any background */}
      <AbsoluteFill
        style={{
          top: 760,
          background: 'linear-gradient(180deg, rgba(8,5,10,0) 0%, rgba(8,5,10,0.42) 45%, rgba(8,5,10,0.62) 100%)',
          opacity: band ? 1 : 0,
        }}
      />
      {s ? <SubtitleScreen key={s.id} screen={s} frame={frame} /> : null}
    </AbsoluteFill>
  );
};

const SubtitleScreen: React.FC<{screen: (typeof RESOLVED)[number]; frame: number}> = ({screen, frame}) => {
  const {runs, revealIndex} = parseRuns(screen.text, screen.accents);
  const {lines, letterSpacing} = layoutLines(screen.text, SUB_FONT_SIZE, SUB_MAX_WIDTH);
  const inT = screen.from === 0 ? 1 : prog(frame, screen.from, screen.from + 6, ease.out);
  const outT = prog(frame, screen.to - 5, screen.to, ease.in);
  const opacity = inT * (1 - outT);
  const y = (1 - inT) * 18;
  // build per-char list with accent info, then split into lines
  const chars: {c: string; accent?: keyof typeof ACCENT_HEX; idx: number}[] = [];
  let idx = 0;
  for (const r of runs) for (const c of r.text) chars.push({c, accent: r.accent, idx: idx++});
  let cursor = 0;
  const lineChars = lines.map((l) => {
    const seg = chars.slice(cursor, cursor + l.length);
    cursor += l.length;
    return seg;
  });
  return (
    <div
      style={{
        position: 'absolute',
        left: 960 - SUB_MAX_WIDTH / 2,
        width: SUB_MAX_WIDTH,
        bottom: SUB_BOTTOM,
        textAlign: 'center',
        fontFamily: FONT,
        fontWeight: 700,
        fontSize: SUB_FONT_SIZE,
        lineHeight: 1.25,
        letterSpacing,
        color: IVORY,
        opacity,
        transform: `translateY(${y}px)`,
      }}
    >
      {lineChars.map((lc, li) => (
        <div key={li} style={{whiteSpace: 'nowrap'}}>
          {lc.map(({c, accent, idx: ci}) => {
            const revealed = revealIndex < 0 || ci < revealIndex || screen.revealFrom === undefined || frame >= screen.revealFrom;
            if (!revealed) return <span key={ci} style={{opacity: 0}}>{c}</span>;
            const pop = revealIndex >= 0 && ci >= revealIndex && screen.revealFrom !== undefined ? spr(frame, screen.revealFrom, {damping: 9, stiffness: 220}) : 1;
            const accentPulse = accent ? 1 + 0.06 * clamp(spr(frame, screen.from + 2, {damping: 10, stiffness: 160})) : 1;
            const color = accent ? ACCENT_HEX[accent] : IVORY;
            return (
              <span
                key={ci}
                style={{
                  display: 'inline-block',
                  color,
                  transform: `scale(${(accent ? accentPulse : 1) * (0.6 + 0.4 * pop)})`,
                  WebkitTextStroke: '7px rgba(14,9,14,0.85)',
                  paintOrder: 'stroke fill',
                  textShadow: accent
                    ? `0 0 18px ${color}88, 0 4px 0 rgba(0,0,0,0.55), 0 8px 18px rgba(0,0,0,0.5)`
                    : '0 4px 0 rgba(0,0,0,0.5), 0 8px 18px rgba(0,0,0,0.45)',
                }}
              >
                {c}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};
