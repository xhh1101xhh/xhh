import React from 'react';
import type {Outfit} from '../../data/types';
import {Glaze, P} from '../Paper';
import {limbPts, roughCircle, roughEllipse, roughPoly, roughRect} from '../../lib/paper';
import type {Face} from './expressions';
import type {Pose} from './poses';

export type Look = 'hero' | 'friend' | 'kid' | 'mom';
export type FaceState = Face & {symbolAmt: number};

const HIP_Y = -120;
const TORSO_H = 92;
const HEAD_R = 62;
const UA = 52;
const FA = 48;
const TH = 62;
const SH = 58;

const LOOKS = {
  hero: {skin: '#F0CFA8', skinShade: '#D9AE88', hair: '#3A2416', cheek: '#E8707A'},
  friend: {skin: '#EBC09A', skinShade: '#D2A27C', hair: '#1E1820', cheek: '#E87A84'},
  kid: {skin: '#F3D4B0', skinShade: '#DDB590', hair: '#3A2416', cheek: '#EE7C84'},
  mom: {skin: '#2A1A22', skinShade: '#1E1218', hair: '#1A1016', cheek: '#000'},
};

type Wardrobe = {
  torso: string; torsoDetail?: string; sleeve: string; fore: string; cuff?: string; pants: string; shoe: string;
  collar?: string; hood?: string; coatTail?: string; hem?: string; scarf?: string; knit?: boolean; stripes?: string;
};
const WARDROBE: Record<Outfit, Wardrobe> = {
  raincoat: {torso: '#E2B23C', torsoDetail: '#C4952A', sleeve: '#E2B23C', fore: '#E2B23C', cuff: '#C4952A', pants: '#273249', shoe: '#2F4A3A', collar: '#2C3A5A', hood: '#D5A535', coatTail: '#E2B23C'},
  vest: {hem: '#E6DAC2', torso: '#6F7A45', torsoDetail: '#5C6638', sleeve: '#E6DAC2', fore: '#34466B', cuff: '#2A3958', pants: '#5A3B2A', shoe: '#8A5A3A', collar: '#E6DAC2', knit: true},
  cardigan: {hem: '#8C6A4A', torso: '#8C6A4A', torsoDetail: '#6F5238', sleeve: '#8C6A4A', fore: '#8C6A4A', pants: '#4A3A2E', shoe: '#6A4A32', collar: '#E6DAC2', knit: true},
  coat: {torso: '#6C6F7C', torsoDetail: '#565964', sleeve: '#6C6F7C', fore: '#6C6F7C', pants: '#2E2E38', shoe: '#22222A', collar: '#565964', coatTail: '#6C6F7C', scarf: '#3E4A66'},
  linen: {hem: '#E3D6BC', torso: '#E3D6BC', torsoDetail: '#CDBE9F', sleeve: '#E3D6BC', fore: '#F0CFA8', pants: '#5C4A36', shoe: '#7A5A3A', collar: '#E3D6BC', scarf: '#C9763E'},
  pajama: {torso: '#8FA9C9', sleeve: '#8FA9C9', fore: '#8FA9C9', pants: '#8FA9C9', shoe: '#F0CFA8', stripes: '#EDE4D3', collar: '#EDE4D3'},
  friend: {torso: '#2E7E78', torsoDetail: '#256A65', sleeve: '#2E7E78', fore: '#2E7E78', cuff: '#1F5A56', pants: '#2A2630', shoe: '#5A2A2A', collar: '#E8B04B', scarf: '#E8B04B', coatTail: '#2E7E78'},
  mom: {torso: '#2A1A22', sleeve: '#2A1A22', fore: '#2A1A22', pants: '#2A1A22', shoe: '#2A1A22'},
};

const limbD = (len: number, w0: number, w1: number, seed: number) => roughPoly(limbPts(len, w0, w1), seed, 1.2, 8);

/** Face layer: brows, lids, pupils, mouth, blush, sweat / tears, head-top symbol. All parameters continuous. */
export const FaceLayer: React.FC<{f: FaceState; look: Look; uid: string; frame: number}> = ({f, look, uid, frame}) => {
  const L = LOOKS[look];
  if (look === 'mom') return null;
  const eyes = [-21, 21].map((ex, i) => {
    const clip = `${uid}-eye${i}`;
    const lidH = f.lid * 26;
    return (
      <g key={i} transform={`translate(${ex} -4)`}>
        <defs>
          <clipPath id={clip}>
            <ellipse cx={0} cy={0} rx={10.5} ry={12.5} />
          </clipPath>
        </defs>
        <ellipse cx={0} cy={0} rx={10.5} ry={12.5} fill="#FBF6EC" />
        <g clipPath={`url(#${clip})`}>
          <circle cx={f.lookX * 4} cy={f.lookY * 4 + 1} r={6.4 * f.pupil} fill="#2A1C18" />
          <circle cx={f.lookX * 4 - 2.4} cy={f.lookY * 4 - 2.4} r={2.1} fill="#FFFFFF" />
          <rect x={-14} y={-14} width={28} height={lidH} fill={L.skin} />
          <rect x={-14} y={14 - f.squint * 11} width={28} height={14} fill={L.skin} />
        </g>
        <path d={`M -11 ${-12.5 + lidH} Q 0 ${-14.5 + lidH} 11 ${-12.5 + lidH}`} fill="none" stroke="#2A1C18" strokeWidth={2.6} strokeLinecap="round" opacity={f.lid > 0.02 ? 1 : 0.0} />
      </g>
    );
  });
  const w = f.mouthW;
  const o = f.mouthOpen * 20;
  const c = f.mouthCurve * 9;
  const sk = f.mouthSkew * 5;
  const mouth =
    o > 1.2 ? (
      <g transform="translate(0 27)">
        <path d={`M ${-w / 2} ${-sk} Q 0 ${-c * 0.6 - 2} ${w / 2} ${sk} Q ${w * 0.3} ${o + c * 0.4} 0 ${o + c * 0.5} Q ${-w * 0.3} ${o + c * 0.4} ${-w / 2} ${-sk} Z`} fill="#6B2A2A" stroke="#3A1818" strokeWidth={2} strokeLinejoin="round" />
        <ellipse cx={0} cy={o * 0.62 + c * 0.3} rx={w * 0.22} ry={Math.max(1, o * 0.22)} fill="#D36A6A" />
      </g>
    ) : (
      <path d={`M ${-w / 2} ${27 - sk} Q 0 ${27 + c} ${w / 2} ${27 + sk}`} fill="none" stroke="#3A1818" strokeWidth={3.2} strokeLinecap="round" />
    );
  const sweatY = ((frame % 40) / 40) * 10;
  return (
    <g>
      {f.red > 0.01 ? <circle cx={0} cy={6} r={HEAD_R - 6} fill="#E05050" opacity={0.22 * f.red} /> : null}
      <ellipse cx={-35} cy={14} rx={11} ry={6} fill={L.cheek} opacity={0.55 * f.blush} />
      <ellipse cx={35} cy={14} rx={11} ry={6} fill={L.cheek} opacity={0.55 * f.blush} />
      {eyes}
      {[-1, 1].map((s) => (
        <rect
          key={s}
          x={-11}
          y={-3.2}
          width={22}
          height={6.4}
          rx={3.2}
          fill={LOOKS[look].hair}
          transform={`translate(${s * 21} ${-24 + f.browY}) rotate(${s < 0 ? -f.browL : f.browR})`}
        />
      ))}
      <ellipse cx={0} cy={11} rx={4} ry={3} fill={L.skinShade} />
      {mouth}
      {f.sweat > 0.02 ? (
        <g transform={`translate(54 ${-30 + sweatY * f.sweat}) scale(${f.sweat})`}>
          <path d="M 0 -12 Q 9 2 0 8 Q -9 2 0 -12 Z" fill="#9FD0F0" stroke="#5E9CC8" strokeWidth={1.5} />
          <circle cx={-2.5} cy={1} r={1.8} fill="#fff" />
        </g>
      ) : null}
      {f.tear > 0.02 ? (
        <g opacity={f.tear}>
          <path d="M -26 8 Q -30 22 -27 34" fill="none" stroke="#BFE3FA" strokeWidth={3} strokeLinecap="round" opacity={0.8} />
          <path d={`M -27 ${30 + (frame % 30) / 3} q 5 7 0 10 q -5 -3 0 -10 Z`} fill="#BFE3FA" />
        </g>
      ) : null}
      <Symbol kind={f.symbol} amt={f.symbolAmt} frame={frame} />
    </g>
  );
};

const Symbol: React.FC<{kind: Face['symbol']; amt: number; frame: number}> = ({kind, amt, frame}) => {
  if (kind === 'none' || amt < 0.02) return null;
  const bob = Math.sin(frame / 7) * 3;
  const s = amt;
  const tr = `translate(${kind === 'anger' ? 46 : 0} ${-HEAD_R - 52 + bob}) scale(${s}) rotate(${(1 - s) * -20})`;
  if (kind === 'question')
    return (
      <g transform={tr}>
        <path d="M -12 -14 Q -12 -32 4 -32 Q 20 -32 20 -17 Q 20 -6 7 -1 Q 1 2 1 10" fill="none" stroke="#1A1218" strokeWidth={13} strokeLinecap="round" opacity={0.5} transform="translate(3 4)" />
        <path d="M -12 -14 Q -12 -32 4 -32 Q 20 -32 20 -17 Q 20 -6 7 -1 Q 1 2 1 10" fill="none" stroke="#F3EBDD" strokeWidth={10} strokeLinecap="round" />
        <circle cx={1} cy={24} r={6.5} fill="#F3EBDD" />
      </g>
    );
  if (kind === 'anger')
    return (
      <g transform={tr} stroke="#E2657A" strokeWidth={6} strokeLinecap="round" fill="none">
        <path d="M -14 -4 Q -6 -6 -4 -14" />
        <path d="M 4 -14 Q 6 -6 14 -4" />
        <path d="M 14 4 Q 6 6 4 14" />
        <path d="M -4 14 Q -6 6 -14 4" />
      </g>
    );
  if (kind === 'cloud')
    return (
      <g transform={tr}>
        <P d={roughEllipse(0, 0, 30, 16, 77, 2)} fill="#5A5F72" />
        {[-14, 0, 14].map((x) => (
          <line key={x} x1={x} y1={18} x2={x - 4} y2={32} stroke="#8FB6DA" strokeWidth={3} strokeLinecap="round" />
        ))}
      </g>
    );
  if (kind === 'heart')
    return (
      <g transform={tr}>
        <path d="M 0 12 C -22 -2 -14 -22 0 -10 C 14 -22 22 -2 0 12 Z" fill="#E2657A" />
      </g>
    );
  return (
    <g transform={tr} fill="#E8B04B">
      {[[-22, 0, 9], [10, -12, 7], [18, 10, 5]].map(([x, y, r], i) => (
        <path key={i} d={`M ${x} ${y - r} L ${x + r * 0.3} ${y - r * 0.3} L ${x + r} ${y} L ${x + r * 0.3} ${y + r * 0.3} L ${x} ${y + r} L ${x - r * 0.3} ${y + r * 0.3} L ${x - r} ${y} L ${x - r * 0.3} ${y - r * 0.3} Z`} />
      ))}
    </g>
  );
};

/** hair: back mass + fringe tufts; the fringe group lags behind the head (hairSwing) */
const Hair: React.FC<{look: Look; swing: number; layer: 'back' | 'front'}> = ({look, swing, layer}) => {
  const c = LOOKS[look].hair;
  if (look === 'friend') {
    if (layer === 'back') return <P d={roughPoly([[-70, -10], [-66, -60], [-30, -84], [30, -84], [66, -60], [70, -10], [64, 30], [36, 34], [-36, 34], [-64, 30]], 301, 1.6, 10)} fill={c} shadow={4} />;
    return (
      <g transform={`rotate(${swing * 0.6} 0 -60)`}>
        <P d={roughPoly([[-64, -18], [-58, -62], [-20, -80], [26, -78], [62, -56], [64, -20], [40, -36], [12, -30], [-16, -40], [-40, -30]], 302, 1.4, 9)} fill={c} shadow={3} />
      </g>
    );
  }
  if (look === 'mom') return <P d={roughPoly([[-58, 30], [-64, -30], [-40, -76], [10, -84], [52, -64], [62, -10], [56, 40]], 401, 1.6)} fill={c} shadow={false} />;
  if (layer === 'back') return <P d={roughPoly([[-66, 4], [-64, -46], [-30, -74], [30, -74], [64, -46], [66, 4], [52, -14], [-52, -14]], 201, 1.4, 10)} fill={c} shadow={4} />;
  const tufts: [number, number][] = [[-65, -6], [-63, -44], [-45, -66], [-20, -76], [6, -80], [32, -73], [54, -57], [65, -26], [63, -6], [52, -30], [44, -38], [34, -32], [24, -44], [10, -36], [-4, -47], [-18, -37], [-30, -46], [-42, -36], [-52, -44], [-58, -26]];
  return (
    <g transform={`rotate(${swing} 0 -70)`}>
      <P d={roughPoly(tufts, 202, 1.6, 9)} fill={c} shadow={3} />
      <path d="M 8 -78 Q 20 -96 12 -108" fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" transform={`rotate(${swing * 1.8} 8 -78)`} />
    </g>
  );
};

export type PuppetProps = {
  pose: Pose;
  face: FaceState;
  outfit: Outfit;
  look: Look;
  hairSwing: number;
  coatSwing: number;
  breathe: number;
  frame: number;
  uid: string;
  propR?: React.ReactNode; // drawn in the right hand
  propL?: React.ReactNode;
  scale?: number;
  x?: number;
  y?: number;
  flip?: boolean;
  shadow?: boolean;
};

/** Vector paper-cut puppet, ~1:3 head-to-body, layered skeleton (head, torso, upper/fore arms, thighs/shins).
 *  Arms are drawn in front of the head. Origin = between the feet. */
export const Puppet: React.FC<PuppetProps> = (pr) => {
  const {pose: p, face, outfit, look, hairSwing, coatSwing, breathe, frame, uid, scale = 1, x = 0, y = 0, flip} = pr;
  const W = WARDROBE[outfit];
  const L = LOOKS[look];
  const thLen = TH * p.thighK;
  const leg = (side: -1 | 1) => {
    const th = side < 0 ? p.thL : p.thR;
    const sh = side < 0 ? p.shL : p.shR;
    return (
      <g key={side} transform={`translate(${side * 17} ${HIP_Y}) rotate(${th})`}>
        <P d={limbD(thLen + 6, 17, 15, 11 + side)} fill={W.pants} shadow={4} />
        <g transform={`translate(0 ${thLen}) rotate(${sh})`}>
          <P d={limbD(SH, 15, 12, 21 + side)} fill={W.pants} shadow={4} />
          {W.stripes ? <path d={`M -13 18 L 13 18 M -12 36 L 12 36`} stroke={W.stripes} strokeWidth={4} opacity={0.8} /> : null}
          <P d={roughEllipse(side * 6, SH + 4, 21, 11, 31 + side, 1.2)} fill={W.shoe} shadow={3} />
        </g>
      </g>
    );
  };
  const arm = (side: -1 | 1) => {
    const ua = side < 0 ? p.uaL : p.uaR;
    const fa = side < 0 ? p.faL : p.faR;
    const prop = side < 0 ? pr.propL : pr.propR;
    return (
      <g key={side} transform={`translate(${side * 36} ${-TORSO_H + 10}) rotate(${ua})`}>
        <P d={limbD(UA, 14, 12.5, 41 + side)} fill={W.sleeve} shadow={4} />
        <g transform={`translate(0 ${UA}) rotate(${fa})`}>
          <P d={limbD(FA, 12.5, 11, 51 + side)} fill={W.fore} shadow={4} />
          {W.cuff ? <P d={roughRect(-12, FA - 12, 24, 9, 61 + side, 3, 1)} fill={W.cuff} shadow={false} /> : null}
          {W.stripes ? <path d={`M -12 18 L 12 18 M -11 34 L 11 34`} stroke={W.stripes} strokeWidth={4} opacity={0.8} /> : null}
          <P d={roughCircle(0, FA + 6, 11, 71 + side, 1)} fill={L.skin} shadow={3} />
          {prop ? <g transform={`translate(0 ${FA + 6}) rotate(${-(ua + fa) - (p.lean ?? 0)})`}>{prop}</g> : null}
        </g>
      </g>
    );
  };
  const torsoPts: [number, number][] = [[-34, 0], [-40, -TORSO_H + 14], [-30, -TORSO_H], [30, -TORSO_H], [40, -TORSO_H + 14], [34, 0]];
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -1 : 1) * scale} ${scale})`}>
      {pr.shadow !== false ? <ellipse cx={p.x} cy={4} rx={58 - Math.min(30, -p.y * 0.3)} ry={10} fill="rgba(0,0,0,0.28)" /> : null}
      <g transform={`translate(${p.x} ${p.y})`}>
        {leg(-1)}
        {leg(1)}
        <g transform={`translate(0 ${HIP_Y}) rotate(${p.lean}) scale(1 ${p.squash * breathe})`}>
          {/* coat tail lags behind body motion */}
          {W.coatTail ? (
            <g transform={`rotate(${coatSwing} 0 -10)`}>
              <P d={roughPoly([[-38, -14], [38, -14], [46, 30], [-46, 30]], 81, 1.6)} fill={W.coatTail} shadow={5} />
              <path d="M 0 -12 L 0 28" stroke={W.torsoDetail} strokeWidth={3} />
            </g>
          ) : null}
          {W.hem ? (
            <g transform={`rotate(${coatSwing * 0.9} 0 -6)`}>
              <P d={roughPoly([[-36, -8], [36, -8], [40, 14], [10, 10], [-4, 18], [-40, 12]], 82, 1.4)} fill={W.hem} shadow={4} />
            </g>
          ) : null}
          <P d={roughPoly(torsoPts, 91, 1.6, 10)} fill={W.torso} shadow={5} />
          {W.knit
            ? [-20, -6, 8, 22].map((kx) => <path key={kx} d={`M ${kx} -8 L ${kx} ${-TORSO_H + 12}`} stroke={W.torsoDetail} strokeWidth={2.4} strokeDasharray="5 4" opacity={0.7} />)
            : null}
          {W.stripes ? [-70, -50, -30, -10].map((sy) => <path key={sy} d={`M -38 ${sy} L 38 ${sy}`} stroke={W.stripes} strokeWidth={5} opacity={0.8} />) : null}
          {outfit === 'raincoat' ? (
            <>
              <path d={`M 0 -4 L 0 ${-TORSO_H + 6}`} stroke={W.torsoDetail} strokeWidth={3} />
              {[-24, -48, -72].map((by) => <rect key={by} x={4} y={by} width={9} height={5} rx={2} fill="#7A5A1E" />)}
            </>
          ) : null}
          {W.collar ? <P d={roughPoly([[-20, -TORSO_H + 2], [0, -TORSO_H + 22], [20, -TORSO_H + 2], [10, -TORSO_H - 4], [-10, -TORSO_H - 4]], 93, 1)} fill={W.collar} shadow={2} /> : null}
          {/* head */}
          <g transform={`translate(0 ${-TORSO_H - 8}) rotate(${p.head})`}>
            {W.hood ? <P d={roughEllipse(0, -58, 70, 58, 95, 2)} fill={W.hood} shadow={4} /> : null}
            <g transform="translate(0 -62)"><Hair look={look} swing={hairSwing * 0.4} layer="back" /></g>
            <P d={roughCircle(0, -62, HEAD_R, look === 'friend' ? 103 : 101, 1.6, 10)} fill={L.skin} shadow={5} />
            {look !== 'mom' ? <P d={roughEllipse(-HEAD_R + 2, -58, 8, 12, 104, 1)} fill={L.skin} shadow={2} /> : null}
            {look !== 'mom' ? <P d={roughEllipse(HEAD_R - 2, -58, 8, 12, 105, 1)} fill={L.skin} shadow={2} /> : null}
            <g transform="translate(0 -62)">
              <FaceLayer f={face} look={look} uid={uid} frame={frame} />
            </g>
            <g transform="translate(0 -62)"><Hair look={look} swing={hairSwing} layer="front" /></g>
          </g>
          {W.scarf ? (
            <g>
              <P d={roughRect(-36, -TORSO_H - 10, 72, 20, 97, 8, 1.4)} fill={W.scarf} shadow={3} />
              <g transform={`rotate(${coatSwing * 1.4} 22 ${-TORSO_H + 4})`}>
                <P d={roughRect(14, -TORSO_H + 2, 16, 46, 98, 5, 1.2)} fill={W.scarf} shadow={3} />
              </g>
            </g>
          ) : null}
          {arm(-1)}
          {arm(1)}
        </g>
      </g>
    </g>
  );
};

export {Glaze};

/** forward kinematics: world position of a hand (matches the Puppet transform chain) */
export const handWorld = (p: Pose, side: -1 | 1, x: number, y: number, s: number): [number, number] => {
  const rot = (v: [number, number], deg: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
  };
  const ua = side < 0 ? p.uaL : p.uaR;
  const fa = side < 0 ? p.faL : p.faR;
  let v: [number, number] = [0, FA + 6];
  v = rot(v, fa);
  v = [v[0], v[1] + UA];
  v = rot(v, ua);
  v = [v[0] + side * 36, v[1] + (-TORSO_H + 10)];
  v = [v[0], v[1] * p.squash];
  v = rot(v, p.lean);
  v = [v[0] + p.x, v[1] + HIP_Y + p.y];
  return [x + v[0] * s, y + v[1] * s];
};
