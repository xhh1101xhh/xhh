import React from 'react';
import {Composition} from 'remotion';
import {DURATION_FRAMES, FPS} from './data/beats';
import {Film} from './Film';
import {frameOf} from './lib/timing';

/** Preview = opening + section 1 (S0 + S1a), ends at the bar head where S1b begins. */
export const PREVIEW_END = frameOf('B1:9.1');

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Preview" component={Film} durationInFrames={PREVIEW_END} fps={FPS} width={1920} height={1080} defaultProps={{endFrame: PREVIEW_END}} />
    <Composition id="Full" component={Film} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} defaultProps={{}} />
  </>
);
