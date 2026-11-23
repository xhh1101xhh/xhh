import React from 'react';
import type {Outfit, Who} from '../../data/types';
import {Puppet, Look} from './Puppet';
import {ExprKey, PoseKey, useRig} from './useCharacter';

/** A cast member: pulls expression / outfit keys from the subtitle file, poses from the scene. */
export const Character: React.FC<{
  who: Who;
  frame: number;
  poses: PoseKey[];
  exprs?: ExprKey[];
  outfit?: Outfit;
  x: number;
  y: number;
  scale?: number;
  flip?: boolean;
  propR?: React.ReactNode;
  propL?: React.ReactNode;
  look?: Look;
  idle?: number;
  shadow?: boolean;
}> = ({who, frame, poses, exprs, outfit, x, y, scale = 1, flip, propR, propL, look, idle, shadow}) => {
  const rig = useRig(who, frame, {poses, exprs, outfit, idle});
  const lk: Look = look ?? (who === 'friend' ? 'friend' : who === 'kid' ? 'kid' : who === 'mom' ? 'mom' : 'hero');
  return (
    <Puppet
      {...rig}
      look={lk}
      frame={frame}
      uid={`${who}${Math.round(x)}`}
      x={x}
      y={y}
      scale={scale}
      flip={flip}
      propR={propR}
      propL={propL}
      shadow={shadow}
    />
  );
};
