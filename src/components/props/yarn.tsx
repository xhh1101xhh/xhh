import React from 'react';
import {P} from '../Paper';
import {roughCircle, roughEllipse, roughPoly} from '../../lib/paper';

export type YarnIcon = 'bubble' | 'hourglass' | 'bow' | 'cloud' | 'metronome';
const COLORS: Record<YarnIcon, string> = {bubble: '#C85A5A', hourglass: '#5A8C8A', bow: '#C9A040', cloud: '#7C6A9C', metronome: '#4E7AA0'};

/** 线团精: a ball of yarn with eyes and tiny legs, carrying an icon (the "cost" of a relationship) */
export const YarnSprite: React.FC<{icon: YarnIcon; x: number; y: number; s?: number; frame: number; squash?: number; seed: number}> = ({icon, x, y, s = 1, frame, squash = 1, seed}) => {
  const c = COLORS[icon];
  const step = Math.sin(frame / 3 + seed) * 14;
  return (
    <g transform={`translate(${x} ${y}) scale(${s / Math.sqrt(squash)} ${s * squash})`}>
      <line x1={-12} y1={0} x2={-12 - step * 0.3} y2={22} stroke="#2A1E18" strokeWidth={5} strokeLinecap="round" />
      <line x1={12} y1={0} x2={12 + step * 0.3} y2={22} stroke="#2A1E18" strokeWidth={5} strokeLinecap="round" />
      <P d={roughCircle(0, -30, 40, seed, 1.6, 10)} fill={c} shadow={5} />
      {[0, 1, 2, 3].map((i) => (
        <path key={i} d={`M ${-34 + i * 6} ${-48 + i * 10} Q 0 ${-70 + i * 18} ${34 - i * 4} ${-46 + i * 12}`} fill="none" stroke="rgba(255,240,220,0.35)" strokeWidth={3} />
      ))}
      <path d="M 30 -10 q 22 6 30 26" fill="none" stroke={c} strokeWidth={4} />
      <ellipse cx={-12} cy={-32} rx={6} ry={8} fill="#FBF6EC" />
      <ellipse cx={12} cy={-32} rx={6} ry={8} fill="#FBF6EC" />
      <circle cx={-11} cy={-30} r={3.5} fill="#1A1218" />
      <circle cx={13} cy={-30} r={3.5} fill="#1A1218" />
      <path d="M -6 -16 q 6 5 12 0" fill="none" stroke="#1A1218" strokeWidth={2.5} strokeLinecap="round" />
      {/* the icon it carries, held overhead */}
      <g transform={`translate(0 -92) rotate(${Math.sin(frame / 6 + seed) * 6})`}>
        <Icon icon={icon} frame={frame} />
      </g>
    </g>
  );
};

export const Icon: React.FC<{icon: YarnIcon; frame: number}> = ({icon, frame}) => {
  switch (icon) {
    case 'bubble':
      return (
        <g>
          <P d={roughPoly([[-30, -22], [30, -22], [30, 14], [-4, 14], [-16, 28], [-14, 14], [-30, 14]], 7101, 1.2)} fill="#F3EBDD" shadow={3} />
          {[-14, 0, 14].map((dx) => <circle key={dx} cx={dx} cy={-4} r={4} fill="#3A2A20" />)}
        </g>
      );
    case 'hourglass':
      return (
        <g>
          <rect x={-22} y={-30} width={44} height={6} fill="#8C6440" />
          <rect x={-22} y={24} width={44} height={6} fill="#8C6440" />
          <path d="M -16 -24 L 16 -24 L 2 0 L 16 24 L -16 24 L -2 0 Z" fill="rgba(220,235,245,0.5)" stroke="#F3EBDD" strokeWidth={2.5} />
          <path d={`M -10 ${24 - (frame % 30) / 3} L 10 ${24 - (frame % 30) / 3} L 14 24 L -14 24 Z`} fill="#E8B04B" />
        </g>
      );
    case 'bow':
      return (
        <g fill="#F3EBDD">
          <circle cx={-10} cy={-18} r={8} />
          <path d="M -14 -10 Q 0 -6 12 6 L 8 10 Q -4 2 -16 0 Z" />
          <path d="M 10 6 L 16 26 L 10 26 L 6 10 Z" />
          <path d="M -16 0 L -20 26 L -14 26 L -10 2 Z" />
        </g>
      );
    case 'cloud':
      return (
        <g>
          <P d={roughEllipse(0, -6, 30, 16, 7104, 1.2)} fill="#8F95AA" shadow={3} />
          {[-12, 0, 12].map((x) => <line key={x} x1={x} y1={14} x2={x - 4} y2={26} stroke="#8FB6DA" strokeWidth={3} strokeLinecap="round" />)}
        </g>
      );
    case 'metronome':
      return (
        <g>
          <P d={roughPoly([[-18, 26], [-8, -28], [8, -28], [18, 26]], 7105, 1)} fill="#8C6440" shadow={3} />
          <line x1={0} y1={18} x2={Math.sin(frame / 4) * 16} y2={-22} stroke="#F3EBDD" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
  }
};

/** brass balance scale. tilt deg (+ = right pan down). */
export const Scale: React.FC<{x: number; y: number; s?: number; tilt: number; left?: React.ReactNode; right?: React.ReactNode}> = ({x, y, s = 1, tilt, left, right}) => {
  const arm = 210;
  const a = (tilt * Math.PI) / 180;
  const lx = -Math.cos(a) * arm;
  const ly = -Math.sin(a) * arm;
  const rx = Math.cos(a) * arm;
  const ry = Math.sin(a) * arm;
  const pan = (px: number, py: number, child: React.ReactNode, seed: number) => (
    <g transform={`translate(${px} ${py})`}>
      <path d="M 0 0 L -70 150 M 0 0 L 70 150" stroke="#9C7330" strokeWidth={3} />
      <g transform="translate(0 150)">{child}</g>
      <P d={roughPoly([[-90, 150], [90, 150], [60, 178], [-60, 178]], seed, 1.4)} fill="#C79A44" shadow={6} />
      <path d="M -84 154 L 84 154" stroke="#F0CD82" strokeWidth={3} opacity={0.7} />
    </g>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <P d={roughPoly([[-80, 330], [80, 330], [50, 300], [-50, 300]], 7201, 1.4)} fill="#8C6430" shadow={8} />
      <P d={roughPoly([[-10, 300], [10, 300], [8, 0], [-8, 0]], 7202, 1)} fill="#B8893A" shadow={6} />
      {pan(lx, ly, left, 7203)}
      {pan(rx, ry, right, 7204)}
      <g transform={`rotate(${tilt})`}>
        <P d={roughPoly([[-arm - 10, -6], [arm + 10, -6], [arm + 10, 6], [-arm - 10, 6]], 7205, 1)} fill="#C79A44" shadow={5} />
      </g>
      <P d={roughCircle(0, 0, 18, 7206, 1)} fill="#E0B45A" shadow={4} />
      <P d={roughPoly([[-12, -40], [12, -40], [6, -14], [-6, -14]], 7207, 1)} fill="#B8893A" shadow={3} />
    </g>
  );
};
