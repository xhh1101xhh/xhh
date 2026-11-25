import React from 'react';
import {Composition} from 'remotion';
import {Film} from './Film';
import {Cover} from './Cover';
import {PREVIEW_END, FULL_END} from './lib/timeline';

export const Root: React.FC = () => (
  <>
    <Composition id="Preview" component={Film} durationInFrames={PREVIEW_END} fps={30} width={1920} height={1080}
      defaultProps={{end: PREVIEW_END, audio: 'audio/mix_preview.wav'}} />
    <Composition id="PreviewSilent" component={Film} durationInFrames={PREVIEW_END} fps={30} width={1920} height={1080}
      defaultProps={{end: PREVIEW_END}} />
    <Composition id="Full" component={Film} durationInFrames={FULL_END} fps={30} width={1920} height={1080}
      defaultProps={{end: FULL_END}} />
    <Composition id="Cover" component={Cover} durationInFrames={1} fps={30} width={1080} height={1440} />
  </>
);
