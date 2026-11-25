import React from 'react';
import {SCREENS, Screen, EMPH_COLORS, META, sceneBase} from '../lib/timeline';
import {clamp, springAt, prog, hexToRgb, osc, easeOut} from '../lib/anim';
import {GoldDust} from '../lacquer/Materials';

export const CREAM = '#F3EBDD';
const SANS = '"Noto Sans SC", sans-serif';
const SERIF = '"Noto Serif SC", serif';

function isReddish(hex: string) {
  const [r, g, b] = hexToRgb(hex).map(v => v / 255);
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  if (mx - mn < 0.12) return false;
  let h = 0;
  if (mx === r) h = ((g - b) / (mx - mn)) % 6; else if (mx === g) h = (b - r) / (mx - mn) + 2; else h = (r - g) / (mx - mn) + 4;
  h *= 60; if (h < 0) h += 360;
  return h < 22 || h > 340;
}
/** 强调色：朱色底上不用朱砂红，改描金 */
export function emphColor(name: string, sceneId: string) {
  if (name === 'zhu' && isReddish(sceneBase(sceneId))) return EMPH_COLORS.gold;
  return EMPH_COLORS[name] ?? EMPH_COLORS.gold;
}

function segments(s: Screen) {
  type Seg = {t: string; c?: string};
  let segs: Seg[] = [{t: s.text}];
  for (const e of s.emphasis) {
    const out: Seg[] = [];
    let done = false;
    for (const g of segs) {
      if (done || g.c || !g.t.includes(e.word)) { out.push(g); continue; }
      const i = g.t.indexOf(e.word);
      if (i > 0) out.push({t: g.t.slice(0, i)});
      out.push({t: e.word, c: emphColor(e.color, s.scene)});
      if (i + e.word.length < g.t.length) out.push({t: g.t.slice(i + e.word.length)});
      done = true;
    }
    segs = out;
  }
  return segs;
}

const outline = '0 0 2px #0b0806, 0 0 4px #0b0806, 2px 2px 0 #0b0806, -2px 2px 0 #0b0806, 2px -2px 0 #0b0806, -2px -2px 0 #0b0806, 0 4px 14px rgba(0,0,0,0.7)';

/** 底部字幕：≥64px、离底 80px、宽 ≤1100px、按语义一行；砸屏时隐藏 */
export const BottomSubtitle: React.FC<{f: number; s: Screen}> = ({f, s}) => {
  const segs = segments(s);
  const n = s.text.length;
  const inP = prog(f, s.startFrame, s.startFrame + 4, easeOut);
  const outP = prog(f, s.endFrame - 3, s.endFrame);
  const op = inP * (1 - outP);
  const size = 64;
  const spacing = n > 14 ? -1.5 : n > 12 ? 0 : 1.5;
  return (
    <div style={{position: 'absolute', left: 960 - 550, width: 1100, bottom: 80, textAlign: 'center', opacity: op,
      transform: `translateY(${(1 - inP) * 14}px)`, fontFamily: SANS, fontWeight: 700, fontSize: size, lineHeight: 1.25,
      color: CREAM, letterSpacing: spacing, textShadow: outline, whiteSpace: 'nowrap'}}>
      {segs.map((g, i) => g.c ? (
        <span key={i} style={{color: g.c, display: 'inline-block', transform: `scale(${1 + 0.08 * springAt(f, s.startFrame + 2, {damping: 10, stiffness: 160})})`,
          margin: '0 4px', textShadow: `${outline}, 0 0 18px ${g.c}88`}}>{g.t}</span>
      ) : <span key={i}>{g.t}</span>)}
    </div>
  );
};

/** 砸屏大字：关键词落在拍点上，带厚漆投影、描金边、金粉迸散 */
export const SlamText: React.FC<{f: number; s: Screen}> = ({f, s}) => {
  const sl = s.slam!;
  const keyCol = emphColor(s.emphasis.find(e => e.word.includes(sl.key) || sl.key.includes(e.word))?.color ?? 'gold', s.scene);
  const inP = prog(f, s.startFrame, s.startFrame + 5, easeOut);
  const outP = prog(f, s.endFrame - 4, s.endFrame);
  const sp = springAt(f, sl.f, {damping: 11, stiffness: 210, mass: 0.8});
  const hit = f >= sl.f;
  const keySize = Math.min(250, Math.floor(980 / Math.max(1, sl.key.length)));
  const keyScale = hit ? 2.4 - 1.4 * sp : 2.4;
  const keyOp = hit ? clamp((f - sl.f) / 2) : 0;
  const cx = 900;
  const topY = (sl as any).pos === 'top' ? 90 : 300;
  const lacquerText: React.CSSProperties = {
    fontFamily: SERIF, fontWeight: 900, fontSize: keySize, lineHeight: 1, color: keyCol,
    WebkitTextStroke: `3px #2a1608`,
    textShadow: `0 0 0 #000, 6px 10px 0 #120a05, 10px 16px 18px rgba(0,0,0,0.6), 0 0 26px ${keyCol}66`,
  };
  const smallStyle: React.CSSProperties = {fontFamily: SERIF, fontWeight: 700, fontSize: 70, color: CREAM, textShadow: outline, letterSpacing: 2};
  const pre = sl.pre, post = sl.post;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - outP, transform: `scale(${1 - outP * 0.05})`, transformOrigin: `${cx}px 500px`}}>
      <div style={{position: 'absolute', left: cx - 560, width: 1120, top: topY, textAlign: 'center', opacity: inP, ...smallStyle, whiteSpace: 'nowrap'}}>{pre}</div>
      <div style={{position: 'absolute', left: cx - 560, width: 1120, top: topY + 100, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <span style={{display: 'inline-block', transform: `scale(${keyScale}) rotate(${hit ? (1 - sp) * -4 : 0}deg)`, opacity: keyOp, ...lacquerText}}>{sl.key}</span>
        {post && <span style={{...smallStyle, opacity: hit ? clamp((f - sl.f - 6) / 4) : 0, marginLeft: 10, verticalAlign: 'bottom'}}>{post}</span>}
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        {hit && f - sl.f < 50 && <GoldDust f={f} seed={s.id * 13} n={70} burstAt={sl.f} burstX={cx} burstY={topY + 100 + keySize / 2} size={3.2} opacity={1} />}
        {hit && f - sl.f < 10 && <circle cx={cx} cy={topY + 100 + keySize / 2} r={60 + (f - sl.f) * 70} fill="none" stroke={keyCol} strokeWidth={10 - (f - sl.f)} opacity={0.5 * (1 - (f - sl.f) / 10)} />}
      </svg>
    </div>
  );
};

/** 字幕总层：按当前帧找屏；砸屏时底部字幕隐藏，避免同一句出现两遍 */
export const Subtitles: React.FC<{f: number; scenes?: string[]}> = ({f, scenes}) => {
  const s = SCREENS.find(x => (!scenes || scenes.includes(x.scene)) && f >= x.startFrame && f < x.endFrame);
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 340, pointerEvents: 'none',
        background: 'linear-gradient(to bottom, rgba(8,6,5,0) 0%, rgba(8,6,5,0.55) 45%, rgba(8,6,5,0.78) 100%)'}} />
      {s && s.display === 'bottom' && <BottomSubtitle f={f} s={s} />}
      {s && s.display === 'slam' && <SlamText f={f} s={s} />}
    </>
  );
};

/** 固定层：左上主题、右上水印（不随镜头） */
export const FixedOverlay: React.FC<{f: number}> = ({f}) => {
  const wy = 46 + osc(f, 240) * 12;
  return (
    <>
      <div style={{position: 'absolute', left: 48, top: 38, fontFamily: SANS, fontWeight: 500, fontSize: 28, color: CREAM, opacity: 0.7, letterSpacing: 3, textShadow: '0 1px 4px rgba(0,0,0,0.6)'}}>{META.topic}</div>
      <div style={{position: 'absolute', right: 56, top: wy, fontFamily: SANS, fontWeight: 500, fontSize: 22, color: CREAM, opacity: 0.35, border: `1px solid ${CREAM}`, padding: '4px 10px', lineHeight: 1.1, letterSpacing: 2}}>{META.watermark}</div>
    </>
  );
};

/** 画面内文字（地名牌/印章）：只放在画面左侧 x<700，描金方印 + 竖排字 */
export const PlaceTag: React.FC<{f: number; text: string; at: number; x?: number; y?: number; kind?: 'place' | 'seal'}> = ({f, text, at, x = 70, y = 150, kind = 'place'}) => {
  const p = springAt(f, at, {damping: 14, stiffness: 140});
  if (p <= 0.001) return null;
  const isSeal = kind === 'seal';
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: clamp(p * 1.4), transform: `translateY(${(1 - p) * -20}px) scale(${0.9 + 0.1 * p})`, transformOrigin: 'top left'}}>
      <div style={{border: `2px solid ${isSeal ? '#e2553f' : '#d9b062'}`, padding: '10px 8px', background: isSeal ? 'rgba(120,20,14,0.55)' : 'rgba(18,12,8,0.55)', boxShadow: '4px 6px 0 rgba(0,0,0,0.5)', borderRadius: 3,
        fontFamily: SERIF, fontWeight: 900, fontSize: 34, color: isSeal ? '#f4d0b0' : '#e8c477', writingMode: 'vertical-rl', letterSpacing: 6, textShadow: '1px 2px 0 #120a05'}}>{text}</div>
    </div>
  );
};
