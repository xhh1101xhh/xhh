import '@fontsource/noto-sans-sc/500.css';
import '@fontsource/noto-sans-sc/700.css';
import '@fontsource/noto-sans-sc/900.css';
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {SCREENS, THEME, WATERMARK} from './data/subtitles';
import {PaperFinish, ThemeTag, Watermark} from './components/fixed/FixedLayer';
import {Subtitles} from './components/fixed/Subtitles';
import {Slam} from './components/fixed/Slam';
import {PaperLayersDive} from './components/transitions/PaperLayersDive';
import {Soundtrack} from './audio/Soundtrack';
import {S0Hook} from './scenes/S0Hook';
import {S1aRoom} from './scenes/S1aRoom';
import {cue} from './lib/timing';

const ALL_TEXT = Array.from(new Set((SCREENS.map((s) => s.text).join('') + THEME + WATERMARK + '0123456789').replace(/[【】|]/g, ''))).join('');

/** wait until every glyph we use is loaded at every weight (fontsource splits CJK into unicode-range subsets) */
const useFonts = () => {
  const [handle] = useState(() => delayRender('fonts'));
  useEffect(() => {
    Promise.all([500, 700, 900].map((w) => document.fonts.load(`${w} 64px "Noto Sans SC"`, ALL_TEXT)))
      .then(() => document.fonts.ready)
      .then(() => continueRender(handle))
      .catch(() => continueRender(handle));
  }, [handle]);
};

/** the camera world (moves) */
const World: React.FC = () => {
  const frame = useCurrentFrame();
  const dive = cue('diveLayers');
  return (
    <PaperLayersDive
      frame={frame}
      at={dive}
      cx={960}
      cy={500}
      outgoing={frame < dive + 4 ? <S0Hook frame={frame} /> : null}
      incoming={frame >= dive - 10 ? <S1aRoom frame={frame} /> : null}
    />
  );
};

/** fixed layers sit outside the camera and never scale with it */
export const Film: React.FC<{endFrame?: number}> = ({endFrame}) => {
  useFonts();
  return (
    <AbsoluteFill style={{background: '#0E1A33'}}>
      <World />
      <PaperFinish />
      <Subtitles />
      <Slam />
      <ThemeTag />
      <Watermark />
      <Soundtrack endFrame={endFrame} />
    </AbsoluteFill>
  );
};
