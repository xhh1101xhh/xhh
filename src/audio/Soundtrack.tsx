import React from 'react';
import {Audio, Sequence, staticFile} from 'remotion';
import {BGM_FILE} from '../data/beats';
import {RESOLVED, SFX, frameOf} from '../lib/timing';

const SLAM_LANDS = RESOLVED.filter((s) => s.display === 'slam' && s.slam?.length).map((s) => frameOf(s.slam![0].at));

/** BGM gain at a frame: gentle fade-in, dip under each slam so its impact reads, recover after; optional end fade. */
export const bgmGain = (f: number, endFrame?: number) => {
  let g = Math.min(1, (f + 1) / 8);
  for (const L of SLAM_LANDS) {
    if (f >= L - 4 && f < L + 40) {
      const a = f < L ? (f - (L - 4)) / 4 : Math.max(0, 1 - (f - L - 6) / 34);
      g *= 1 - 0.38 * Math.max(0, Math.min(1, a));
    }
  }
  if (endFrame !== undefined) g *= Math.max(0, Math.min(1, (endFrame - f) / 24));
  return g * 0.92;
};

/** BGM + every code-synthesised SFX, placed from the subtitle file's sfx cues. */
export const Soundtrack: React.FC<{endFrame?: number}> = ({endFrame}) => (
  <>
    <Audio src={staticFile(BGM_FILE)} volume={(f) => bgmGain(f, endFrame)} />
    {SFX.filter((s) => endFrame === undefined || s.from < endFrame).map((s, i) => {
      const dur = s.loop && s.to ? s.to - s.from : 150;
      const fade = s.fade ?? 0;
      return (
        <Sequence key={i} from={s.from} durationInFrames={Math.max(1, dur)} layout="none">
          <Audio
            src={staticFile(`sfx/${s.sfx}.wav`)}
            loop={s.loop}
            volume={(f) => {
              const g = s.gain ?? 0.6;
              if (!fade) return g;
              const fin = Math.min(1, (f + 1) / fade);
              const fout = s.to ? Math.min(1, (dur - f) / fade) : 1;
              return g * Math.max(0, Math.min(fin, fout));
            }}
          />
        </Sequence>
      );
    })}
  </>
);
