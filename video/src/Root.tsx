import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {PREVIEW_END} from './lib/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Preview" component={Film} durationInFrames={PREVIEW_END} fps={30} width={1920} height={1080}
      defaultProps={{end: PREVIEW_END, audio: 'audio/mix_preview.wav'}} />
    <Composition id="PreviewSilent" component={Film} durationInFrames={PREVIEW_END} fps={30} width={1920} height={1080}
      defaultProps={{end: PREVIEW_END}} />
  </>
);
