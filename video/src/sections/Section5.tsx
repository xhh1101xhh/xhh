import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, GoldDust, Qiangjin, Mop, Cloud} from '../lacquer/Materials';
import {Puppet} from '../components/puppet/Puppet';
import {ArmCloseup, Fire, Pot, Banner, Platform} from '../components/Props';
import {GuiChain} from '../components/Props2';
import {XuanGui} from '../components/XuanGui';
import {cue, sStart, sEnd, sceneBase, castExpr} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeIn, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES, BEATS} from '../data/beats';

const B = BEAT_FRAMES;
const END = BEATS.finalHit.f;

/** 5-1 人环：众人手拉手围着篝火（天下为公）；手一只只松开，环收缩成一条竖直的父子链（天下为家） */
export const S5_1: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(69), rel = cue(70, 'release'), t1 = sEnd(70);
  const cam = camAt(f, [[t0 - 6, {z: 0.92, y: -40, focus: 1, dof: 2}], [rel, {z: 1.0, focus: 1, dof: 2}], [t1 + 6, {z: 1.12, y: 30, focus: 1, dof: 2}]]);
  const N = 14;
  const toLine = prog(f, rel + 6, t1, easeInOut);
  const pts = Array.from({length: N}).map((_, i) => {
    const a = (i / N) * Math.PI * 2 + (f - t0) * 0.004;
    const rx = 520, ry = 170;
    const ring = [960 + Math.cos(a) * rx, 700 + Math.sin(a) * ry];
    const line = [960, 260 + i * 46];
    return [lerp(ring[0], line[0], toLine), lerp(ring[1], line[1], toLine), Math.sin(a)] as [number, number, number];
  });
  const released = (i: number) => f >= rel + i * 2;
  const order = pts.map((p, i) => i).sort((a, b) => pts[a][2] - pts[b][2]);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('5-1')} light={[960, 300]} lightColor="#fff0c8" lightAmt={0.26} f={f} />
        <Cloud x={200} y={180} s={1.6} color="#5a4c36" /><Cloud x={1400} y={140} s={1.3} color="#5a4c36" />
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${i * 480 - 200},1080 Q${i * 480},${600} ${i * 480 + 240},1080`} stroke="url(#gold)" strokeWidth={1.2} fill="none" opacity={0.25} />)}
      </Layer>
      <Layer depth={0.7}>
        <ellipse cx={960} cy={720} rx={600} ry={200} fill="#3e3424" opacity={0.6 * (1 - toLine)} />
        <g opacity={1 - toLine}><Fire x={960} y={720} s={1.2} f={f} seed={69} /></g>
        {/* 牵手的连线（松开时逐条消失） */}
        {pts.map((p, i) => { const q = pts[(i + 1) % N]; return !released(i) ? <path key={i} d={`M${p[0]},${p[1] - 40} L${q[0]},${q[1] - 40}`} stroke="url(#gold)" strokeWidth={3} /> : null; })}
        {/* 竖直父子链 */}
        {toLine > 0.3 && <GuiChain x0={960} y0={250} x1={960} y1={900} n={14} grow={(toLine - 0.3) / 0.7 * 14} f={f} s={0.8} />}
      </Layer>
      <Layer depth={1}>
        {order.map(i => {
          const [x, y, d] = pts[i];
          const s = lerp(0.62 + (d + 1) * 0.12, 0.35, toLine);
          return <g key={i} opacity={1 - toLine * 0.85}><Puppet f={f} x={x} y={y - 40 * (1 - toLine)} scale={s} facing={x < 960 ? 1 : -1} outfit={['commoner', 'shunYoung', 'wife', 'guard', 'yi', 'clean'][i % 6]} seed={200 + i}
            exprs={[[0, 'calm'], [rel + i * 2, 'blank']]} poses={[[0, {shR: 60, elR: 10, shL: 55, elL: 10}], [rel + i * 2, 'stand']]} noFilter /></g>;
        })}
      </Layer>
      <Layer depth={1.4} blur={5}>
        <GoldDust f={f} seed={69} n={30} size={3} opacity={0.5} />
      </Layer>
    </Stage>
  );
};

/** 5-2 虚空·玄圭：父子链从两端收回、缩成一点，点里长出带金缝的玄圭，缓慢自转 */
export const S5_2: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(71), t1 = sEnd(71);
  const cam = camAt(f, [[t0 - 6, {z: 1.0, focus: 1, dof: 2}], [t1 + 6, {z: 1.1, focus: 1, dof: 2}]]);
  const g = prog(f, t0 - 4, t0 + 26, easeOut);
  const rotY = Math.cos(((f - t0) / (t1 - t0)) * Math.PI * 2);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('5-2')} light={[1080, 540]} lightColor="#ffd890" lightAmt={0.24} f={f} />
        {Array.from({length: 24}).map((_, i) => { const a = (i / 24) * Math.PI * 2; const r = lerp(900, 60, g); return <line key={i} x1={1080 + Math.cos(a) * r} y1={540 + Math.sin(a) * r} x2={1080 + Math.cos(a) * (r + 60)} y2={540 + Math.sin(a) * (r + 60)} stroke="url(#gold)" strokeWidth={2} opacity={0.5 * (1 - g)} />; })}
      </Layer>
      <Layer depth={1}>
        <GuiChain x0={1080} y0={lerp(120, 540, g)} x1={1080} y1={lerp(960, 540, g)} n={10} grow={10 * (1 - g)} f={f} s={0.7} />
        <g transform={`translate(1080,540) scale(${Math.max(0.05, Math.abs(rotY)) * g},${g})`}>
          <XuanGui f={f} x={0} y={0} h={560} id="g52" st={{glow: 0.9, crack: 1, repaired: 1, rim: 1.4, emblem: 1}} />
        </g>
      </Layer>
      <Layer depth={1.4} blur={5}>
        <GoldDust f={f} seed={71} n={40} size={3} opacity={0.6} />
      </Layer>
    </Stage>
  );
};

/** 门扇上一笔描成的漆画：耒、茅屋、天平、结绳、玄圭（跨中缝）、黑陶、竹简、牵手链 */
const PAINT: {d: string; side: 'L' | 'R'}[] = [
  {side: 'L', d: 'M120,980 C260,940 300,880 420,900 C560,920 640,860 760,880'},
  {side: 'L', d: 'M200,300 L200,520 M178,520 L222,520 L222,534 L178,534 Z M180,534 L186,590 M220,534 L214,590'},
  {side: 'L', d: 'M300,760 L420,620 L540,760 Z M400,760 L404,700 Q420,690 436,700 L440,760'},
  {side: 'L', d: 'M300,260 L300,140 M200,200 L400,180 M200,200 L170,280 L230,280 Z M400,180 L370,260 L430,260 Z'},
  {side: 'L', d: 'M120,860 C220,850 320,872 420,858 C520,846 620,866 760,856 M200,856 a10,10 0 1,0 20,0 M340,862 a10,10 0 1,0 20,0 M480,852 a10,10 0 1,0 20,0 M620,860 a10,10 0 1,0 20,0'},
  {side: 'L', d: 'M960,260 L1024,350 L1024,690 L960,690'.replace(/1024/g, '896').replace('L960,690', 'L960,690')},
  {side: 'R', d: 'M960,260 L1024,350 L1024,690 L960,690'},
  {side: 'R', d: 'M1320,700 L1380,700 L1374,716 Q1430,740 1416,790 Q1400,820 1350,822 Q1300,820 1284,790 Q1270,740 1326,716 Z'},
  {side: 'R', d: 'M1540,300 L1540,520 M1570,300 L1570,520 M1600,300 L1600,520 M1630,300 L1630,520 M1660,300 L1660,520 M1530,340 L1670,340 M1530,480 L1670,480'},
  {side: 'R', d: 'M1160,900 C1300,860 1440,940 1580,890 C1680,860 1760,900 1840,880 M1240,890 a24,16 0 1,0 48,0 a24,16 0 1,0 -48,0 M1420,906 a24,16 0 1,0 48,0 a24,16 0 1,0 -48,0 M1600,884 a24,16 0 1,0 48,0 a24,16 0 1,0 -48,0'},
  {side: 'R', d: 'M1100,980 C1300,940 1500,1000 1700,960 C1780,944 1840,960 1900,950'},
];

/** 5-3 首尾呼应：与开头 0-2 同一机位同一构图——残影重播禹的“推”；益的手抽走，启的手在同一位置“握住”；
 *  随后镜头急拉，两扇黑漆门合拢，金线把全片关键物件一笔描成漆画，玄圭两半在终止重音上合缝 */
export const S5_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(72), ghost = cue(72, 'ghost'), withdraw = cue(73, 'withdraw'), grip = cue(73, 'grip'), pull = cue(73, 'pull');
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: 0, focus: 1, dof: 5}], [grip, {z: 1.06, x: 10, focus: 1, dof: 5}], [pull, {z: 1.06, focus: 1, dof: 5}], [END, {z: 0.5, x: 0, y: -40, focus: 1, dof: 3}]]);
  const gp = prog(f, ghost, ghost + 12, easeInOut);
  const gPush = springAt(f, ghost + 6, {damping: 12, stiffness: 170});
  const wd = prog(f, withdraw, withdraw + 20, easeInOut);
  const gIn = springAt(f, withdraw + 4, {damping: 15, stiffness: 100});
  const gr = springAt(f, grip, {damping: 13, stiffness: 160});
  const bob = osc(f, 40) * 6 * (1 - gr);
  const close = prog(f, pull + 4, END, easeInOut);
  const draw = prog(f, pull, END, (t: number) => t);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <Stage cam={cam}>
        <Layer depth={0.2}>
          <LacquerBackdrop base={sceneBase('5-3')} light={[960, 120]} lightColor="#ffe6c0" lightAmt={0.32} f={f} />
          <path d="M760,-100 L1160,-100 L1500,1200 L420,1200 Z" fill="#ffe8c8" opacity={0.06} />
          {[300, 600, 1400, 1700].map((x, i) => <Fire key={i} x={x} y={330 + (i % 2) * 40} s={0.7} f={f} seed={i} logs={false} />)}
          <Platform x={960} y={1120} w={1700} h={330} color="#5a2a1c" />
        </Layer>
        <Layer depth={0.55}>
          <Banner x={180} y={760} h={420} f={f} color="#7a1f16" icon="bird" />
          <Banner x={1720} y={760} h={420} f={f} color="#7a1f16" icon="sun" />
          <Pot x={360} y={900} s={1.4} /><Pot x={1560} y={910} s={1.3} />
          {/* 急拉后露出：一条长链里的一环——每一环都是一只握圭的手 */}
          {f >= pull && Array.from({length: 8}).map((_, i) => {
            const t = (i + 1) / 9; const side = i % 2 ? 1 : -1;
            return <g key={i} opacity={close} transform={`translate(${960 + side * (520 + i * 260)},${700 - i * 30}) scale(${0.5 - t * 0.3})`}>
              <ArmCloseup x={0} y={0} ang={side > 0 ? 180 : 0} s={1} bend={-20} curl={0.9} thumb={-70} sleeve={['#b03a2c', '#7a5a3a', '#8a2a20', '#5a4a6a'][i % 4]} skin="#d0a07a" bracelet={i % 3 === 0} armLen={500} />
              <XuanGui f={f} x={side * 120} y={-40} h={300} rot={78} id={`g53c${i}`} st={{glow: 0.4, crack: 1, repaired: 1}} />
            </g>;
          })}
        </Layer>
        <Layer depth={1}>
          {/* 残影：重播开头的“递—推”（灰色半透明） */}
          {f >= ghost - 2 && f < withdraw + 6 && (
            <g opacity={0.45 * (1 - prog(f, withdraw - 6, withdraw + 6))} style={{filter: 'grayscale(1)'}}>
              <ArmCloseup x={780 - gPush * 70} y={800} ang={-8} s={1.05} bend={-14} curl={0.35} thumb={-60} sleeve="#a8332a" skin="#d8a77c" bracelet wrinkles />
              <ArmCloseup x={lerp(2300, 1560, gp) - gPush * 300} y={760} ang={180} s={1.1} bend={-80} curl={0.05} thumb={-130} sleeve="#6a5a3e" skin="#c99468" />
            </g>
          )}
          {/* 益的手：慢慢抽走 */}
          {f >= t0 && <ArmCloseup x={lerp(lerp(-300, 760, prog(f, t0, ghost)), -500, wd)} y={800} ang={-8} s={1.0} bend={-10} curl={0.3} thumb={-60} sleeve="#6e7a5e" skin="#d2a07a" />}
          <XuanGui f={f} x={1080} y={700 + bob} h={430} rot={78} id="g53" st={{glow: 0.6 + gr * 0.4, crack: 1, repaired: 1, rim: 1 + clamp(1 - Math.abs(f - grip) / 10) * 0.8}} />
          {/* 启的手：在开头“推”的同一位置，反方向握住 */}
          {f >= withdraw && <ArmCloseup x={lerp(2300, 1300, gIn)} y={740} ang={180} s={1.1} bend={lerp(-60, -20, gr)} curl={lerp(0.1, 0.95, gr)} thumb={lerp(-120, -70, gr)} sleeve="#b03a2c" skin="#dcac84" bracelet />}
        </Layer>
        <Layer depth={1.5} blur={10}>
          <GoldDust f={f} seed={73} n={30} size={4} opacity={0.7} burstAt={grip} burstX={1150} burstY={700} />
        </Layer>
      </Stage>
      {f >= pull && <LacquerDoors f={f} close={close} draw={draw} />}
    </div>
  );
};

/** 两扇黑漆门 + 一笔描成的漆画（门上），close=1 时合拢 */
export const LacquerDoors: React.FC<{f: number; close: number; draw: number; seam?: number}> = ({f, close, draw, seam = 0}) => {
  const seg = (i: number) => clamp(draw * PAINT.length - i);
  const door = (side: 'L' | 'R') => {
    const L = side === 'L';
    const dx = L ? -960 * (1 - close) : 960 * (1 - close);
    return (
      <g transform={`translate(${dx},0)`}>
        <rect x={L ? 0 : 960} y={0} width={960} height={1080} fill="url(#blackLq)" />
        <rect x={L ? 0 : 960} y={0} width={960} height={1080} fill="url(#brushPat)" opacity={Math.min(1, (0.14) * 4)} />
        <rect x={L ? 24 : 984} y={24} width={912} height={1032} fill="none" stroke="url(#gold)" strokeWidth={4} />
        <rect x={L ? 40 : 1000} y={40} width={880} height={1000} fill="none" stroke="url(#gold)" strokeWidth={1.4} opacity={0.6} />
        {PAINT.map((p, i) => p.side === side ? <Qiangjin key={i} d={p.d} progress={seg(i)} w={4} glow /> : null)}
        {/* 晚年的禹：沉静释然（绘在左门上） */}
        {L && draw > 0.35 && (
          <g opacity={prog(draw, 0.35, 0.6)} filter="url(#goldGlow)">
            <Puppet f={f} x={640} y={560} scale={1.15} facing={1} outfit="kingOld" seed={23} exprs={[[0, 'relief']]} poses={[[0, {shR: 10, elR: 30, shL: -6, elL: 20, head: 6}]]} noFilter />
          </g>
        )}
        {[0, 1, 2, 3, 4, 5].map(i => { const r = mulberry32(i + (L ? 1 : 9)); return <Mop key={i} cx={(L ? 80 : 1040) + r() * 820} cy={80 + r() * 140} r={4} f={f} seed={i} />; })}
      </g>
    );
  };
  return (
    <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
      <g filter="url(#lqShadow)">{door('L')}{door('R')}</g>
      {seam > 0 && <path d="M960,0 L960,1080" stroke="#fff2c0" strokeWidth={4 + seam * 10} opacity={seam} filter="url(#goldGlow)" />}
    </svg>
  );
};

/** 5-4 收束：门已合拢，漆画完成；中缝金光在终止重音上一亮，随后缓缓暗下；洒金落满画面 */
export const S5_4: React.FC<{f: number}> = ({f}) => {
  const seam = f >= END ? Math.exp(-(f - END) / 30) : 0;
  const settle = prog(f, END, END + 120, easeOut);
  return (
    <div style={{position: 'absolute', inset: 0, background: '#0b0a09'}}>
      <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + settle * 0.03})`}}>
        <LacquerDoors f={f} close={1} draw={1} seam={seam} />
      </div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <GoldDust f={f} seed={74} n={160} size={2.8} opacity={0.95} burstAt={END} burstX={960} burstY={480} />
        {/* 洒金：细金从上方飘落，越积越多 */}
        {Array.from({length: 120}).map((_, i) => {
          const r = mulberry32(i + 740); const st = END + r() * 60; const t = (f - st) / (90 + r() * 60);
          if (t <= 0) return null;
          const x = r() * 1920 + noise(f / 40 + i) * 30; const y = Math.min(1040 - r() * 120, -20 + t * 1100);
          return <rect key={i} x={x} y={y} width={3 + r() * 4} height={2 + r() * 3} fill={i % 4 ? '#e8c46a' : '#fff0c0'} opacity={0.85} transform={`rotate(${t * 300 + r() * 90} ${x} ${y})`} />;
        })}
      </svg>
    </div>
  );
};
