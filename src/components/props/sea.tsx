import React from 'react';
import {Glaze, Glow, P} from '../Paper';
import {noise1} from '../../lib/anim';
import {rng, roughCircle, roughEllipse, roughPoly, roughRect, wavePts} from '../../lib/paper';

export const Moon: React.FC<{x: number; y: number; r: number; frame: number}> = ({x, y, r, frame}) => (
  <g>
    <Glow cx={x} cy={y} r={r * 4.2} color="#C9D6F0" opacity={0.55 + 0.05 * Math.sin(frame / 40)} id="moonglow" />
    <P d={roughCircle(x, y, r, 7001, 2.5, 14)} fill="#EADFC2" shadow={8} />
    <P d={roughCircle(x - r * 0.3, y - r * 0.2, r * 0.18, 7002, 1.2)} fill="#D8CBA8" shadow={false} />
    <P d={roughCircle(x + r * 0.35, y + r * 0.25, r * 0.12, 7003, 1)} fill="#D8CBA8" shadow={false} />
    <P d={roughCircle(x + r * 0.1, y - r * 0.45, r * 0.09, 7004, 1)} fill="#D8CBA8" shadow={false} />
  </g>
);

export const Stars: React.FC<{frame: number; seed?: number; area?: [number, number, number, number]; n?: number}> = ({frame, seed = 1, area = [-200, -1200, 2300, 520], n = 90}) => {
  const r = rng(seed);
  const stars = Array.from({length: n}, () => ({x: area[0] + r() * area[2], y: area[1] + r() * area[3], s: 1 + r() * 2.4, p: r() * 6}));
  return (
    <g>
      {stars.map((s, i) => {
        const tw = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame / 14 + s.p));
        return i % 7 === 0 ? (
          <path key={i} d={`M ${s.x} ${s.y - s.s * 2.6} L ${s.x + s.s * 0.6} ${s.y} L ${s.x} ${s.y + s.s * 2.6} L ${s.x - s.s * 0.6} ${s.y} Z M ${s.x - s.s * 2.6} ${s.y} L ${s.x} ${s.y + s.s * 0.6} L ${s.x + s.s * 2.6} ${s.y} L ${s.x} ${s.y - s.s * 0.6} Z`} fill="#F3E6C0" opacity={tw} />
        ) : (
          <circle key={i} cx={s.x} cy={s.y} r={s.s * 0.8} fill="#E6E0CC" opacity={tw * 0.8} />
        );
      })}
    </g>
  );
};

export const Cloud: React.FC<{x: number; y: number; w: number; seed: number; fill?: string; opacity?: number}> = ({x, y, w, seed, fill = '#2A3A62', opacity = 1}) => {
  const r = rng(seed);
  const puffs = Array.from({length: 5}, (_, i) => ({cx: x - w / 2 + (w * (i + 0.5)) / 5 + (r() - 0.5) * 20, cy: y - r() * w * 0.12, rr: w * (0.14 + r() * 0.1)}));
  return (
    <g opacity={opacity}>
      {puffs.map((p, i) => (
        <P key={i} d={roughCircle(p.cx, p.cy, p.rr, seed * 10 + i, 2)} fill={fill} shadow={6} rim={false} />
      ))}
      <P d={roughRect(x - w / 2, y - w * 0.05, w, w * 0.14, seed * 10 + 9, w * 0.06, 2)} fill={fill} shadow={6} />
    </g>
  );
};

/** a band of paper waves; phase animates with frame */
export const WaveBand: React.FC<{y: number; amp: number; wl: number; frame: number; speed: number; fill: string; seed: number; x0?: number; x1?: number; bottom?: number; foam?: string}> = ({y, amp, wl, frame, speed, fill, seed, x0 = -800, x1 = 2800, bottom = 1700, foam}) => {
  const ph = frame * speed;
  const off = ((frame * speed * 18) % wl) - wl;
  const d = roughPoly(wavePts(x0 + off, x1 + off + wl, y, amp, wl, seed, bottom), seed, 1.5, 22);
  return (
    <g transform={`translate(0 ${Math.sin(ph * 0.6 + seed) * amp * 0.25})`}>
      <P d={d} fill={fill} shadow={7} />
      {foam
        ? Array.from({length: 9}, (_, i) => {
            const fx = x0 + off + i * wl * 0.92 + wl * 0.3;
            return <path key={i} d={`M ${fx} ${y - amp * 0.7} q ${wl * 0.08} ${-amp * 0.5} ${wl * 0.16} 0`} fill="none" stroke={foam} strokeWidth={3} strokeLinecap="round" opacity={0.55} />;
          })
        : null}
    </g>
  );
};

/** red/white lighthouse on a rock. Origin = base of the tower on the rock. lampOn 0..1, beamAngle deg. */
export const Lighthouse: React.FC<{x: number; y: number; s?: number; lampOn: number; beamAngle: number; frame: number; beamColor?: string; windowsLit?: number}> = ({x, y, s = 1, lampOn, beamAngle, frame, beamColor = '#FFE6A8', windowsLit = 1}) => {
  const towerH = 360;
  const stripes = [0, 1, 2, 3];
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* beam: drawn behind the lamp head */}
      {lampOn > 0.01 ? (
        <g transform={`translate(0 ${-towerH - 52}) rotate(${beamAngle})`} opacity={lampOn} style={{mixBlendMode: 'screen'}}>
          <defs>
            <linearGradient id="beamgrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={beamColor} stopOpacity={0.75} />
              <stop offset="100%" stopColor={beamColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <path d={`M 0 -14 L ${1700 * lampOn} -170 L ${1700 * lampOn} 170 L 0 14 Z`} fill="url(#beamgrad)" />
          <path d={`M 0 -14 L ${-1300 * lampOn} -120 L ${-1300 * lampOn} 120 L 0 14 Z`} fill="url(#beamgrad)" opacity={0.35} />
        </g>
      ) : null}
      <P d={roughPoly([[-62, 0], [-44, -towerH], [44, -towerH], [62, 0]], 8101, 2)} fill="#E8DCC6" shadow={10} />
      {stripes.map((i) => {
        const y0 = -i * 90 - 30;
        const y1 = y0 - 45;
        const w0 = 62 - (18 * -y0) / towerH;
        const w1 = 62 - (18 * -y1) / towerH;
        return <P key={i} d={roughPoly([[-w0, y0], [-w1, y1], [w1, y1], [w0, y0]], 8110 + i, 1.4)} fill="#B9473C" shadow={false} />;
      })}
      {[-110, -200, -290].map((wy, i) => (
        <g key={wy}>
          <P d={roughRect(-10, wy, 20, 28, 8120 + i, 9, 1)} fill={windowsLit > 0.5 ? '#F6C86A' : '#2A2F48'} shadow={2} />
          {windowsLit > 0.5 ? <Glow cx={0} cy={wy + 14} r={40} color="#FFC870" opacity={0.6 * windowsLit} id={`lhw${i}`} /> : null}
        </g>
      ))}
      <P d={roughRect(-58, -towerH - 12, 116, 14, 8130, 3, 1.4)} fill="#2E2A30" shadow={4} />
      {/* railing */}
      {Array.from({length: 9}, (_, i) => (
        <rect key={i} x={-56 + i * 14} y={-towerH - 34} width={3} height={24} fill="#2E2A30" />
      ))}
      <rect x={-58} y={-towerH - 36} width={116} height={4} fill="#2E2A30" />
      {/* lamp room */}
      <P d={roughRect(-36, -towerH - 86, 72, 72, 8131, 4, 1.2)} fill={lampOn > 0.05 ? '#FFE9B0' : '#3A4466'} shadow={4} />
      {lampOn > 0.05 ? <Glow cx={0} cy={-towerH - 52} r={150} color="#FFE2A0" opacity={lampOn} id="lamphead" /> : null}
      {[-20, 0, 20].map((lx) => (
        <rect key={lx} x={lx - 1.5} y={-towerH - 86} width={3} height={72} fill="#2E2A30" />
      ))}
      <P d={roughPoly([[-48, -towerH - 86], [0, -towerH - 140], [48, -towerH - 86]], 8132, 1.5)} fill="#8E2F2A" shadow={5} />
      <circle cx={0} cy={-towerH - 146} r={7} fill="#2E2A30" />
      <Glaze cx={-20} cy={-towerH - 60} rx={10} ry={22} strength={0.5 * (1 - lampOn) + 0.2} />
    </g>
  );
};

export const Rock: React.FC<{x: number; y: number; w: number; h: number; seed: number; fill?: string; top?: string}> = ({x, y, w, h, seed, fill = '#1C2236', top = '#2A3350'}) => {
  const r = rng(seed);
  const pts: [number, number][] = [[x - w / 2, y]];
  for (let i = 1; i < 7; i++) pts.push([x - w / 2 + (w * i) / 7, y - h * (0.55 + r() * 0.45) * Math.sin((Math.PI * i) / 7)]);
  pts.push([x + w / 2, y]);
  return (
    <g>
      <P d={roughPoly(pts, seed, 3, 16)} fill={fill} shadow={9} />
      <P d={roughPoly(pts.slice(1, 6).map(([px, py]) => [px, py + 4]).concat([[x + w * 0.1, y - h * 0.4], [x - w * 0.25, y - h * 0.35]]) as [number, number][], seed + 1, 2)} fill={top} shadow={false} opacity={0.7} />
    </g>
  );
};

/** paper boat with a warm lantern; optional passenger node */
export const Boat: React.FC<{x: number; y: number; s?: number; frame: number; tilt?: number; children?: React.ReactNode; lampGlow?: number}> = ({x, y, s = 1, frame, tilt = 0, children, lampGlow = 1}) => {
  const bob = Math.sin(frame / 11) * 4;
  const rock = Math.sin(frame / 15) * 3 + tilt;
  return (
    <g transform={`translate(${x} ${y + bob}) rotate(${rock}) scale(${s})`}>
      {children}
      <rect x={58} y={-120} width={4} height={90} fill="#3A2A20" />
      <path d="M 60 -120 q 18 4 22 22" fill="none" stroke="#3A2A20" strokeWidth={3} />
      <Glow cx={82} cy={-86} r={90} color="#FFB45A" opacity={0.8 * lampGlow} id="boatlamp" />
      <P d={roughRect(74, -100, 16, 22, 8301, 4, 1)} fill="#FFD27A" shadow={2} />
      <P d={roughPoly([[-120, -40], [120, -40], [80, 10], [-80, 10]], 8302, 2)} fill="#E9DFC9" shadow={8} />
      <P d={roughPoly([[-120, -40], [-60, -40], [-80, 10]], 8303, 1.4)} fill="#D6CAB1" shadow={false} />
      <path d="M -100 -26 L 100 -26" stroke="#C8BB9E" strokeWidth={2} />
    </g>
  );
};

export const Gull: React.FC<{x: number; y: number; s?: number; frame: number; sleeping?: boolean; seed?: number}> = ({x, y, s = 1, frame, sleeping, seed = 0}) => {
  if (sleeping)
    return (
      <g transform={`translate(${x} ${y + Math.sin(frame / 25 + seed) * 1.5}) scale(${s})`}>
        <P d={roughEllipse(0, 0, 22, 13, 8400 + seed, 1)} fill="#D9D4C8" shadow={3} />
        <P d={roughCircle(16, -8, 9, 8410 + seed, 1)} fill="#E6E1D6" shadow={2} />
        <path d="M 13 -8 q 3 2 6 0" stroke="#2A2A30" strokeWidth={1.6} fill="none" />
        <path d="M 24 -6 l 8 2 l -8 2 z" fill="#E0A23C" />
        <path d="M -22 0 l -12 -4 l 4 8 z" fill="#8C8A86" />
      </g>
    );
  const flap = Math.sin(frame / 4 + seed) * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={`M -30 ${-flap * 0.5} Q -14 -10 0 0 Q 14 -10 30 ${-flap * 0.5}`} fill="none" stroke="#E6E1D6" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};

/** rain streaks (screen-ish) */
export const Rain: React.FC<{frame: number; n?: number; area?: [number, number, number, number]; color?: string; speed?: number; opacity?: number}> = ({frame, n = 70, area = [0, -100, 1920, 1300], color = '#9FB4D8', speed = 38, opacity = 0.5}) => {
  const r = rng(77);
  return (
    <g opacity={opacity}>
      {Array.from({length: n}, (_, i) => {
        const x = area[0] + r() * area[2];
        const y0 = r() * area[3];
        const len = 18 + r() * 26;
        const y = area[1] + ((y0 + frame * speed) % area[3]);
        return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + len} stroke={color} strokeWidth={2} strokeLinecap="round" />;
      })}
    </g>
  );
};

/** floating light dust */
export const Dust: React.FC<{frame: number; n?: number; color?: string; seed?: number; area?: [number, number, number, number]}> = ({frame, n = 26, color = '#FFE2A8', seed = 5, area = [0, 0, 1920, 1080]}) => {
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const bx = area[0] + r() * area[2];
        const by = area[1] + r() * area[3];
        const sz = 1.5 + r() * 3;
        const ph = r() * 10;
        return <circle key={i} cx={bx + noise1(frame * 0.02 + ph, i) * 40} cy={by - ((frame * (0.3 + r() * 0.5)) % 200) + noise1(frame * 0.015 + ph, i + 50) * 30} r={sz} fill={color} opacity={0.25 + 0.35 * (0.5 + 0.5 * Math.sin(frame / 12 + ph))} />;
      })}
    </g>
  );
};
