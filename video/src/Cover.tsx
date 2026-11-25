import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LacquerDefs} from './lacquer/Defs';
import {LacquerBackdrop, GoldDust, Cloud, Qiangjin} from './lacquer/Materials';
import {Puppet} from './components/puppet/Puppet';
import {XuanGui} from './components/XuanGui';
import {ensureFonts} from './fonts';
import {EMPH_COLORS} from './lib/timeline';

/** 3:4 封面 1080×1440：钩子大标题 + 朱漆小牌 + 贯穿物件关键状态（金缮玄圭） + 表情冲突的人物 */
export const Cover: React.FC = () => {
  ensureFonts();
  const f = 40;
  const gold = EMPH_COLORS.gold, ld = EMPH_COLORS.luodian;
  const titleStyle: React.CSSProperties = {fontFamily: '"Noto Serif SC", serif', fontWeight: 900, fontSize: 104, lineHeight: 1.18, color: '#F3EBDD',
    WebkitTextStroke: '2.5px #3a1c08', textShadow: '0 0 0 #000, 6px 9px 0 #1a0a04, 10px 16px 20px rgba(0,0,0,0.55), 0 0 2px #e8c470', letterSpacing: 4, whiteSpace: 'nowrap'};
  const em = (t: string, c: string) => <span style={{color: c, textShadow: `0 0 0 #000, 6px 9px 0 #1a0a04, 10px 16px 20px rgba(0,0,0,0.55), 0 0 24px ${c}88`}}>{t}</span>;
  return (
    <AbsoluteFill style={{background: '#2a0c08'}}>
      <LacquerDefs />
      <svg width={1080} height={1440} viewBox="0 0 1080 1440" style={{position: 'absolute', inset: 0}}>
        <LacquerBackdrop base="#6E1E18" light={[540, 760]} lightColor="#ffd8a0" lightAmt={0.36} f={f} w={1080} h={1440} brush={0.2} />
        <Cloud x={40} y={1180} s={1.6} color="#4a120c" /><Cloud x={760} y={1230} s={1.4} color="#4a120c" />
        {/* 背景光芒：描金放射线 */}
        {Array.from({length: 28}).map((_, i) => { const a = (i / 28) * Math.PI * 2; return <line key={i} x1={540 + Math.cos(a) * 240} y1={820 + Math.sin(a) * 240} x2={540 + Math.cos(a) * 900} y2={820 + Math.sin(a) * 900} stroke="url(#gold)" strokeWidth={2} opacity={0.22} />; })}
        <circle cx={540} cy={820} r={300} fill="#ffd890" opacity={0.12} />
        {/* 人物：舜（递圭，沉着）／禹（立掌推回，决然）／启（伸手欲握，得意）／益（惊惧） */}
        <Puppet f={f} x={195} y={830} scale={1.95} facing={1} outfit="chief" seed={11} exprs={[[0, 'stern']]} poses={[[0, 'offer']]} wind={0.4} />
        <Puppet f={f} x={250} y={1235} scale={2.1} facing={1} outfit="commoner" seed={21} exprs={[[0, 'determined']]} poses={[[0, 'pushPalm']]} />
        <Puppet f={f} x={880} y={1235} scale={2.1} facing={-1} outfit="qi" seed={101} exprs={[[0, 'smug']]} poses={[[0, {lean: 10, shR: 80, elR: 10}]]} />
        <Puppet f={f} x={905} y={700} scale={1.6} facing={-1} outfit="yi" seed={111} exprs={[[0, 'fear']]} poses={[[0, {lean: -14, head: -10, shR: 110, elR: 40, shL: 90, elL: 50}]]} />
        {/* 贯穿物件：金缮修补后的玄圭（断纹描金 + 夏后纹） */}
        <XuanGui f={f} x={540} y={830} h={560} rot={0} id="cover" st={{glow: 1, crack: 1, repaired: 1, rim: 1.5, emblem: 1}} />
        <GoldDust f={f} seed={5} n={140} w={1080} h={1440} size={3} opacity={0.95} />
        {/* 漆面高光带 */}
        <rect x={-200} y={-200} width={160} height={2000} fill="#fff4dc" opacity={0.08} transform="rotate(-18) translate(700,0)" />
      </svg>
      {/* 标题：钩子句，两行 */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', ...titleStyle}}>
        <div>他爹被这个人{em('治了罪', gold)}</div>
        <div>他却{em('接了他的班', ld)}</div>
      </div>
      {/* 朱漆小牌：朝代 · 事件关键词 */}
      <div style={{position: 'absolute', left: '50%', top: 372, transform: 'translateX(-50%)', padding: '12px 40px', background: 'linear-gradient(#b8382a,#7a1e14)',
        border: '4px solid #e2b65c', borderRadius: 8, boxShadow: '6px 9px 0 rgba(0,0,0,0.55), inset 0 0 0 2px #5a140c', fontFamily: '"Noto Serif SC", serif', fontWeight: 900,
        fontSize: 46, color: '#f6dc94', letterSpacing: 6, textShadow: '2px 3px 0 #3a0c06', whiteSpace: 'nowrap'}}>夏 · 从禅让到家天下</div>
    </AbsoluteFill>
  );
};
