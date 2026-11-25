import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, Ridge, GoldDust, Mop, Cloud, XipiSwirl} from '../lacquer/Materials';
import {Puppet, Crowd} from '../components/puppet/Puppet';
import {Hut, Fire, Grass, Disc, Banner, Pot, Tree} from '../components/Props';
import {Altar, CityGate, Mat, HallInterior, Torch, Footprint} from '../components/Props2';
import {XuanGui} from '../components/XuanGui';
import {cue, sStart, sEnd, sceneBase, castExpr, castExprs} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeIn, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES, isSilentAt} from '../data/beats';
import {S1_9} from './Section1';

const B = BEAT_FRAMES;

/** 2-1 祭天土台·黎明：舜领禹登台，禹捧玄圭 */
export const S2_1: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(24), t1 = sEnd(24);
  const cam = camAt(f, [[t0 - 10, {z: 1.0, y: 60, focus: 0.9, dof: 2}], [t1 + 10, {z: 1.08, y: -40, focus: 0.9, dof: 2}]]);
  const climb = prog(f, t0, t1, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.1}>
        <LacquerBackdrop base={sceneBase('2-1')} light={[1400, 200]} lightColor="#ffd8b0" lightAmt={0.3} f={f} />
        <Disc x={1420} y={300} r={60} color="#e8a070" glow="#ffcf9a" />
        {Array.from({length: 18}).map((_, i) => { const r = mulberry32(i + 70); return <g key={i} opacity={1 - climb * 0.7}><Mop cx={r() * 1920} cy={r() * 300} r={1.6 + r() * 2} f={f} seed={i} /></g>; })}
        <Cloud x={200} y={220} s={1.6} color="#2e3c44" /><Cloud x={1100} y={160} s={1.2} color="#2e3c44" />
        <Ridge seed={81} y={640} amp={120} color="#2c383e" gold={0.5} />
      </Layer>
      <Layer depth={0.35}>
        <Ridge seed={84} y={760} amp={80} color="#222c30" gold={0.6} />
        {[0, 1, 2, 3].map(i => { const x = (f * 2 + i * 480) % 2200 - 100; return <path key={i} d={`M${x},${260 + i * 30} q10,-8 20,0 q10,-8 20,0`} stroke="#141a1e" strokeWidth={3} fill="none" />; })}
      </Layer>
      <Layer depth={0.7}>
        <Altar x={960} y={980} s={0.95} color="#4e443a" />
        <Crowd f={f} x={960} y={1000} n={16} spacing={66} scale={0.42} color="#1c2428" />
        <Puppet f={f} x={lerp(880, 900, climb)} y={lerp(830, 690, climb)} scale={0.9} facing={1} outfit="chief" seed={11} exprs={castExpr(24, 'shun')} poses={[[0, 'staff']]} wind={0.4} />
        <Puppet f={f} x={lerp(1010, 1010, climb)} y={lerp(860, 712, climb)} scale={0.9} facing={-1} outfit="clean" seed={21} exprs={castExpr(24, 'yu')}
          poses={[[0, 'receive']]} hold={(wx, wy) => <g transform={`translate(${wx + 12},${wy - 20})`}><XuanGui f={f} x={0} y={0} h={70} id="g21" st={{glow: 0.8, rim: 1.2}} /></g>} />
      </Layer>
      <Layer depth={1.4} blur={8}>
        <Grass f={f} x={-100} y={1120} w={700} h={220} color="#10161a" seed={21} />
        <Grass f={f} x={1500} y={1120} w={600} h={200} color="#10161a" seed={22} />
      </Layer>
    </Stage>
  );
};

/** 2-2 南方·苍梧之野（夜）：十七粒螺钿星点亮；舜拄杖远行，散成金粉 */
export const S2_2: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(25), stars = cue(25, 'stars'), fade = cue(25, 'fade'), t1 = sEnd(25);
  const cam = camAt(f, [[t0 - 8, {z: 1.04, x: -220, focus: 0.7, dof: 2}], [t1 + 10, {z: 1.0, x: 200, focus: 0.7, dof: 2}]]);
  const lit = Math.floor((f - stars) / (B * 0.3));
  const fp = prog(f, fade, fade + 40, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.1}>
        <LacquerBackdrop base={sceneBase('2-2')} light={[900, 220]} lightColor="#c8d4ff" lightAmt={0.16} f={f} />
        {Array.from({length: 17}).map((_, i) => { const on = i < lit; const x = 120 + (i % 6) * 70 + (i > 11 ? 30 : 0), y = 230 + Math.floor(i / 6) * 60; return on ? <Mop key={i} cx={x} cy={y} r={5} f={f} seed={i} /> : <circle key={i} cx={x} cy={y} r={2} fill="#2a3450" />; })}
        <Disc x={1500} y={240} r={46} color="#d8d8c8" glow="#c8d4ff" />
      </Layer>
      <Layer depth={0.3}>
        <Ridge seed={201} y={640} amp={260} color="#182238" gold={0.6} />
        <Ridge seed={204} y={720} amp={220} color="#121a2e" gold={0.8} />
        {[0, 1, 2, 3, 4, 5].map(i => <g key={i}><path d={`M${-100 + i * 420},880 C${-20 + i * 420},700 ${40 + i * 420},${520 - (i % 3) * 50} ${110 + i * 420},${500 - (i % 3) * 50} C${180 + i * 420},${520 - (i % 3) * 50} ${240 + i * 420},700 ${320 + i * 420},880 Z`} fill={shade('#162036', (i % 3) * 0.06)} /><path d={`M${-100 + i * 420},880 C${-20 + i * 420},700 ${40 + i * 420},${520 - (i % 3) * 50} ${110 + i * 420},${500 - (i % 3) * 50} C${180 + i * 420},${520 - (i % 3) * 50} ${240 + i * 420},700 ${320 + i * 420},880`} fill="none" stroke="url(#gold)" strokeWidth={2} /><path d={`M${60 + i * 420},640 q30,-20 60,0 M${80 + i * 420},700 q24,-16 48,0`} stroke="url(#gold)" strokeWidth={1.2} fill="none" opacity={0.6} /></g>)}
        <Cloud x={300} y={560} s={1.4} color="#1a2440" opacity={0.9} /><Cloud x={1300} y={600} s={1.2} color="#1a2440" opacity={0.9} />
        {[0, 1].map(i => <ellipse key={i} cx={(f * 1.5 + i * 1100) % 2600 - 300} cy={760 + i * 40} rx={600} ry={40} fill="#8c96b4" opacity={0.08} />)}
      </Layer>
      <Layer depth={0.65}>
        <path d="M-400,1300 L-400,880 C200,840 900,900 1500,860 C1900,840 2200,860 2400,850 L2400,1300 Z" fill="#0e1424" />
        <path d="M-400,880 C200,840 900,900 1500,860 C1900,840 2200,860 2400,850" stroke="url(#gold)" strokeWidth={2} fill="none" opacity={0.7} />
        <g opacity={1 - fp}>
          <Puppet f={f} x={lerp(700, 1150, prog(f, t0, t1))} y={790} scale={0.85} facing={1} outfit="chief" seed={11} exprs={castExpr(25, 'shun')} poses={[[0, 'staff']]}
            walk={{phase: (f - t0) / 24, amt: 0.6}} wind={0.5}
            hold={(wx, wy) => <path d={`M${wx},${wy} L${wx + 6},${wy + 110}`} stroke="#6a4a26" strokeWidth={4} />} />
        </g>
        {f >= fade && <GoldDust f={f} seed={25} n={80} burstAt={fade} burstX={lerp(700, 1150, prog(f, t0, t1))} burstY={720} size={2.6} opacity={0.9} />}
      </Layer>
      <Layer depth={1.4} blur={7}>
        <Tree x={120} y={1150} s={2.2} f={f} color="#0a0f1a" />
        {Array.from({length: 7}).map((_, i) => <path key={i} d={`M${1500 + i * 60},1200 Q${1510 + i * 60 + noise(f / 40, i) * 20},900 ${1490 + i * 60 + noise(f / 30, i) * 40},${620 + (i % 3) * 60}`} stroke="#0a0f1a" strokeWidth={10} fill="none" />)}
        <Grass f={f} x={1300} y={1130} w={800} h={200} color="#080c16" seed={8} />
      </Layer>
    </Stage>
  );
};

/** 2-3 都城·丧庐：禹跪守，树三度枯荣（三年），庐外人群越聚越多 */
export const S2_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(26), cyc = cue(26, 'cycle'), t1 = sEnd(26);
  const cam = camAt(f, [[t0 - 8, {z: 1.0, x: -40, focus: 1, dof: 3}], [t1 + 10, {z: 1.12, x: 60, y: 20, focus: 1, dof: 3}]]);
  const yr = clamp((f - cyc) / ((t1 - cyc) / 3), 0, 2.999);
  const ph = yr % 1;
  const leaf = ph < 0.35 ? '#4a6a3a' : ph < 0.7 ? '#a8822e' : '#6a4a2a';
  const leafO = ph < 0.8 ? 1 : 1 - (ph - 0.8) / 0.2 * 0.8;
  const crowdN = 4 + Math.floor(yr * 4);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('2-3')} light={[700, 200]} lightColor="#e8e0d0" lightAmt={0.16} f={f} />
        <Cloud x={300} y={200} s={1.8} color="#4a4238" opacity={0.8} /><Cloud x={1300} y={160} s={1.4} color="#4a4238" opacity={0.8} />
        <Ridge seed={91} y={620} amp={70} color="#463e34" gold={0.4} />
      </Layer>
      <Layer depth={0.45}>
        <g transform="translate(1250,800)">
          <path d="M-8,0 L-6,-260 L6,-260 L8,0 Z" fill="#2a1a10" />
          {[[-80, -260, 90], [70, -280, 80], [0, -350, 100]].map(([cx, cy, r], i) => <g key={i} opacity={leafO}><circle cx={cx + noise(f / 40, i) * 6} cy={cy} r={r} fill={shade(leaf, i * 0.06)} /><circle cx={cx + noise(f / 40, i) * 6} cy={cy} r={r} fill="none" stroke="url(#gold)" strokeWidth={1.6} opacity={0.6} /></g>)}
        </g>
        <path d="M-300,1300 L-300,800 L2300,800 L2300,1300 Z" fill="#3e362c" />
        <Crowd f={f} x={1500} y={860} n={crowdN} spacing={60} scale={0.62} color="#2c2620" headTurn={-1} rows={2} />
      </Layer>
      <Layer depth={1}>
        <Hut x={600} y={860} s={1.0} f={f} />
        <Puppet f={f} x={820} y={810} scale={1.5} facing={1} outfit="mourning" seed={21} exprs={castExpr(26, 'yu')} poses={[[0, 'kneel']]} />
      </Layer>
      <Layer depth={1.4} blur={4}>
        {Array.from({length: 14}).map((_, i) => { const r = mulberry32(i + 300); const t = ((f * (0.6 + r()) + r() * 400) % 400) / 400; return <ellipse key={i} cx={r() * 2000 + t * 300} cy={-50 + t * 1200} rx={10} ry={5} fill={leaf} transform={`rotate(${t * 720} ${r() * 2000 + t * 300} ${-50 + t * 1200})`} opacity={0.8} />; })}
      </Layer>
    </Stage>
  );
};

/** 2-4 都城外黄土路 → 城门内：禹出城留下脚印；镜头穿过城门，空席上的玄圭正对商均 */
export const S2_4: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(27), walk = cue(27, 'walk'), gate = cue(27, 'gate'), s2 = sStart(28), touch = cue(28, 'touch'), t1 = sEnd(28);
  const quiet = isSilentAt(f) ? 0.2 : 1;
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: -380, focus: 1, dof: 3}], [s2 - 4, {z: 1.0, x: -200, focus: 1, dof: 3}], [s2 + 22, {z: 1.12, x: 860, y: -20, focus: 1, dof: 4}], [t1 + 8, {z: 1.18, x: 880, y: -10, focus: 1, dof: 4}]], quiet);
  const wp = prog(f, walk, s2 + 10, easeInOut);
  const yuX = lerp(560, -140, wp);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('2-4')} light={[400, 240]} lightColor="#ffe0a8" lightAmt={0.28} f={f} />
        <Ridge seed={101} y={600} amp={90} color="#6a5232" gold={0.5} />
        <Cloud x={200} y={180} s={1.4} color="#6e5634" />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-1200,1300 L-1200,820 L3400,820 L3400,1300 Z" fill="#5e4628" />
        <CityGate x={700} y={830} s={0.9} color="#7a5a36" open={1} />
        {/* 城内：草顶大屋正立面、席与玄圭、商均 */}
        <g transform="translate(1900,830)">
          <rect x={-420} y={-300} width={840} height={300} fill="#5a3e22" filter="url(#lqObj)" />
          <path d="M-480,-300 L0,-520 L480,-300 Z" fill="#6a5430" stroke="url(#gold)" strokeWidth={2.5} />
          {[-300, -100, 100, 300].map(x => <rect key={x} x={x - 14} y={-300} width={28} height={300} fill="#2a1a10" />)}
          <rect x={-90} y={-220} width={180} height={220} fill="#140c06" />
        </g>
        <Banner x={1380} y={830} h={300} f={f} color="#7a2a20" icon="sun" />
        <Mat x={1700} y={900} w={300} h={80} />
      </Layer>
      <Layer depth={1}>
        {/* 脚印：一路留在城外 */}
        {Array.from({length: 14}).map((_, i) => { const px = 600 - i * 55; const at = walk + i * 4; return f >= at ? <Footprint key={i} x={px} y={930 + (i % 2) * 18} rot={-90} s={1.2} color="#3a2814" o={0.85} /> : null; })}
        <Puppet f={f} x={yuX} y={790} scale={1.25} facing={-1} outfit="clean" seed={21} exprs={castExpr(27, 'yu')} poses={[[0, 'stand']]} walk={{phase: (f - walk) / 18, amt: f > walk ? 1 : 0}}
          hold={(wx, wy) => <g transform={`translate(${wx},${wy})`}><ellipse cx={0} cy={-6} rx={18} ry={14} fill="#8a6a40" stroke="url(#gold)" strokeWidth={1.4} /></g>} />
        <XuanGui f={f} x={1700} y={852} h={90} rot={90} id="g24" st={{glow: 0.6, rim: 1 + clamp(1 - Math.abs(f - touch) / 10) * 0.5}} />
        <Puppet f={f} x={1900} y={770} scale={1.3} facing={-1} outfit="prince" seed={61} exprs={castExpr(28, 'shangjun')}
          poses={[[0, 'stand'], [touch - 6, {lean: 14, shR: 50, elR: 30}], [touch, {lean: 18, shR: 64, elR: 18}], [touch + 12, 'stand']]} />
      </Layer>
      <Layer depth={1.45} blur={8}>
        <Grass f={f} x={-300} y={1150} w={800} h={180} color="#3a2814" seed={31} />
      </Layer>
    </Stage>
  );
};

/** 2-5 都城·空殿：商均端坐等待，窗影一日扫过；殿门被风吹开，门外空无一人 */
export const S2_5: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(29), door = cue(30, 'door'), t1 = sEnd(30);
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: 60, focus: 1, dof: 3}], [door - 2, {z: 1.04, x: 40, focus: 1, dof: 3}], [door + 12, {z: 1.3, x: -420, y: 0, focus: 0.9, dof: 4}], [t1 + 8, {z: 1.36, x: -460, focus: 0.9, dof: 4}]]);
  const day = prog(f, t0, door, easeInOut);
  const op = springAt(f, door, {damping: 10, stiffness: 140});
  return (
    <Stage cam={cam}>
      <Layer depth={0.3}>
        <LacquerBackdrop base={sceneBase('2-5')} light={[lerp(300, 1600, day), 300]} lightColor="#f0e0c0" lightAmt={0.2} f={f} />
        <HallInterior f={f} color={sceneBase('2-5')} light={0.8} />
        {/* 殿门（左）：被风吹开，门外落叶打旋、空无一人 */}
        <g transform="translate(300,860)">
          <rect x={-120} y={-420} width={240} height={420} fill="#9a8a6a" opacity={0.25 + op * 0.4} />
          {f >= door && Array.from({length: 10}).map((_, i) => { const t = ((f - door) * 0.05 + i * 0.1) % 1; return <ellipse key={i} cx={Math.cos(t * 9 + i) * 80 * t} cy={-200 - Math.sin(t * 7 + i) * 120} rx={8} ry={4} fill="#a8822e" opacity={1 - t} />; })}
          <rect x={-120} y={-420} width={120} height={420} fill="#4a301a" stroke="url(#gold)" strokeWidth={2} transform={`skewY(${-op * 18}) scale(${1 - op * 0.75},1)`} />
          <rect x={0} y={-420} width={120} height={420} fill="#4a301a" stroke="url(#gold)" strokeWidth={2} transform={`translate(${120},0) scale(${-(1 - op * 0.75)},1) translate(-120,0)`} />
        </g>
        {/* 窗影随时间扫过地面 */}
        <path d={`M${lerp(1700, 500, day)},860 L${lerp(1900, 700, day)},860 L${lerp(1500, 300, day)},1100 L${lerp(1300, 100, day)},1100 Z`} fill="#fff0c8" opacity={0.12} />
      </Layer>
      <Layer depth={1}>
        <Mat x={1150} y={960} w={320} h={80} color="#7a6640" />
        <XuanGui f={f} x={1150} y={915} h={90} rot={90} id="g25" st={{glow: 0.3, rim: 0.9}} />
        {/* 玄圭上落了一层细尘 */}
        <GoldDust f={f} seed={29} n={14} x={1100} y={890} w={100} h={30} size={1.4} drift={0.02} opacity={0.5 * day} />
        <Puppet f={f} x={1150} y={820} scale={1.35} facing={-1} outfit="prince" seed={61} exprs={castExprs([29, 30], 'shangjun')}
          poses={[[0, 'sitCross'], [door, 'stand'], [door + 10, {head: -12, lean: -6}]]} />
      </Layer>
      <Layer depth={1.5} blur={9}>
        <rect x={1700} y={-200} width={120} height={1400} fill="#120c08" />
        <GoldDust f={f} seed={30} n={20} size={3} opacity={0.4} />
      </Layer>
    </Stage>
  );
};

/** 2-6 阳城·夜：火把长龙从四面八方涌向小屋；禹出门，玄圭飞入手中 */
export const S2_6: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(31), stream = cue(31, 'stream'), door = cue(32, 'door'), catchF = cue(32, 'catch'), t1 = sEnd(32);
  const cam = camAt(f, [[t0 - 8, {z: 0.88, y: -80, focus: 0.8, dof: 2}], [door, {z: 1.0, y: 0, focus: 0.9, dof: 3}], [t1 + 8, {z: 1.22, x: 40, y: 60, focus: 1, dof: 4}]]);
  const flow = (f - stream) / 60;
  const paths = [
    'M-300,300 C200,500 600,700 960,760', 'M2200,260 C1700,480 1300,700 960,760', 'M-300,1000 C300,900 700,820 960,760',
    'M2200,1000 C1600,920 1200,820 960,760', 'M960,-100 C900,200 1000,500 960,760',
  ];
  const caught = springAt(f, catchF, {damping: 12, stiffness: 120});
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('2-6')} light={[960, 700]} lightColor="#ffb060" lightAmt={0.3} f={f} />
        <Ridge seed={111} y={420} amp={80} color="#5a1a12" gold={0.5} />
      </Layer>
      <Layer depth={0.5}>
        <path d="M-400,1400 L-400,480 L2400,480 L2400,1400 Z" fill="#4a120c" />
        {paths.map((d, i) => <path key={i} d={d} stroke="#2a0a06" strokeWidth={40} fill="none" opacity={0.6} />)}
        {/* 火把光点沿路流动（手算位置） */}
        <TorchStream f={f} paths={paths} start={stream} />
        <Hut x={960} y={790} s={0.8} f={f} doorLight={f >= door ? 1 : 0.4} />
      </Layer>
      <Layer depth={1}>
        {f >= door - 4 && (
          <Puppet f={f} x={960} y={lerp(760, 820, prog(f, door, door + 16))} scale={lerp(0.9, 1.3, prog(f, door, door + 16))} facing={1} outfit="clean" seed={21}
            exprs={castExpr(32, 'yu')} poses={[[0, 'stand'], [catchF - 6, {shR: 50, elR: 50}], [catchF, 'receive']]} opacity={prog(f, door - 4, door + 2)}
            hold={f >= catchF ? (wx, wy) => <g transform={`translate(${wx + 8},${wy - 16})`}><XuanGui f={f} x={0} y={0} h={80} id="g26h" st={{glow: 1, rim: 1.5, emblem: 1}} /></g> : undefined} />
        )}
        {f < catchF && f >= door && <XuanGui f={f} x={lerp(1800, 990, prog(f, door, catchF, easeIn))} y={lerp(200, 640, prog(f, door, catchF, easeIn))} h={90} rot={lerp(-40, 0, prog(f, door, catchF))} id="g26" st={{glow: 0.8}} />}
        <Crowd f={f} x={760} y={980} n={5} spacing={80} scale={0.9} color="#2a0c08" kneel={prog(f, catchF, catchF + 10)} />
        <Crowd f={f} x={1180} y={980} n={5} spacing={80} scale={0.9} color="#2a0c08" kneel={prog(f, catchF, catchF + 10)} seed={7} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={31} n={40} size={3} opacity={0.6} burstAt={catchF} burstX={980} burstY={600} />
        <Torch x={120} y={1150} s={2} f={f} seed={3} /><Torch x={1800} y={1150} s={2} f={f} seed={4} />
      </Layer>
    </Stage>
  );
};

/** 火把长龙：沿贝塞尔路径流动的光点 */
const TorchStream: React.FC<{f: number; paths: string[]; start: number}> = ({f, paths, start}) => {
  if (f < start) return null;
  const pts = (d: string) => d.match(/-?[0-9.]+/g)!.map(Number);
  const bez = (p: number[], t: number) => {
    const [x0, y0, x1, y1, x2, y2, x3, y3] = p; const u = 1 - t;
    return [u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3];
  };
  const out: React.ReactNode[] = [];
  paths.forEach((d, i) => {
    const p = pts(d);
    for (let k = 0; k < 14; k++) {
      const t = (((f - start) / 70 + k / 14 + i * 0.05) % 1);
      const [x, y] = bez(p, t);
      out.push(<g key={i * 30 + k}><circle cx={x} cy={y} r={18} fill="url(#fireGlow)" /><circle cx={x} cy={y} r={4} fill="#ffe0a0" /></g>);
    }
  });
  return <g>{out}</g>;
};

/** 2-7 时间倒带：上一场景泛黄、出现老化断纹并倒放；加速倒回到青年舜 */
export const S2_7: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(33), fast = cue(34, 'fast'), stop = cue(34, 'stop'), t1 = sEnd(34);
  const catchF = cue(32, 'catch');
  // 倒放映射：先慢倒 S2_6，再快倒 S1_9，最后停在青年舜
  let inner: React.ReactNode;
  if (f < fast) inner = <S2_6 f={catchF + 8 - (f - t0) * 1.5} />;
  else if (f < stop - 4) inner = <S1_9 f={sStart(23) + 60 - (f - fast) * 5} />;
  else inner = <YoungShun f={f} />;
  const jitter = f < stop ? noise(f * 0.9, 3) * 6 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, filter: `sepia(0.85) saturate(0.7) contrast(1.05) brightness(${f < stop ? 0.9 : 1})`, transform: `translateX(${jitter}px)`}}>
      {inner}
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        {f < stop && Array.from({length: 6}).map((_, i) => { const y = ((f * 37 + i * 190) % 1080); return <rect key={i} x={0} y={y} width={1920} height={3} fill="#fff4d8" opacity={0.18} />; })}
        <rect x={0} y={0} width={1920} height={1080} fill={sceneBase('2-7')} opacity={0.22} style={{mixBlendMode: 'multiply'}} />
        {/* 漆面老化断纹 */}
        {[0, 1, 2].map(i => <path key={i} d={`M${300 + i * 600},0 L${280 + i * 600},300 L${330 + i * 600},520 L${300 + i * 600},1080`} stroke="#2a1a0a" strokeWidth={2} opacity={0.4} fill="none" />)}
      </svg>
    </div>
  );
};

/** 倒带终点：尧时代的高台，青年舜 */
const YoungShun: React.FC<{f: number}> = ({f}) => {
  const cam = camAt(f, [[0, {z: 1.05, focus: 1, dof: 3}]], 0.6);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base="#4a3a26" light={[960, 200]} lightColor="#ffe0a0" lightAmt={0.25} f={f} />
        <Ridge seed={121} y={620} amp={90} color="#3a2c1a" gold={0.5} />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,840 L2300,840 L2300,1300 Z" fill="#3a2a18" />
        <Banner x={500} y={840} h={360} f={f} color="#6a3a1a" icon="sun" />
        <Banner x={1400} y={840} h={360} f={f} color="#6a3a1a" icon="bird" />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={960} y={720} scale={1.6} facing={1} outfit="shunYoung" seed={11} exprs={castExpr(34, 'shun')} poses={[[0, 'stand']]} />
      </Layer>
    </Stage>
  );
};

/** 2-8 南河之南·分屏：左禹出城，右青年舜过河；两边各有一块玄圭正对空席 */
export const S2_8: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(35), gui = cue(36, 'gui'), t1 = sEnd(36);
  const cam = camAt(f, [[t0, {z: 1.0, focus: 1, dof: 2}], [t1, {z: 1.06, y: 10, focus: 1, dof: 2}]]);
  const wp = prog(f, t0, sStart(36), easeInOut);
  const s2 = f >= sStart(36);
  const half = (side: 'L' | 'R') => {
    const L = side === 'L';
    return (
      <Stage cam={cam}>
        <Layer depth={0.15}>
          <LacquerBackdrop base={L ? '#8A6A3A' : '#5B6B4A'} light={[480, 200]} lightColor="#ffe8c0" lightAmt={0.22} f={f} w={960} />
          <Ridge seed={L ? 131 : 133} y={560} amp={80} color={L ? '#6a5030' : '#3e4c34'} gold={0.5} />
        </Layer>
        <Layer depth={0.6}>
          <path d="M-300,1300 L-300,800 L1300,800 L1300,1300 Z" fill={L ? '#5a4226' : '#34422c'} />
          {!L && <XipiSwirl f={f} x={-200} y={830} w={1400} h={120} colors={['#3e6a70', '#2e5a60', '#4a7a7a']} seed={4} speed={0.8} />}
          {L && <CityGate x={760} y={810} s={0.45} color="#7a5a36" />}
          {s2 && <Mat x={480} y={960} w={260} h={70} />}
        </Layer>
        <Layer depth={1}>
          {!s2 && <Puppet f={f} x={lerp(L ? 600 : 360, L ? 260 : 700, wp)} y={780} scale={1.2} facing={L ? -1 : 1} outfit={L ? 'clean' : 'shunYoung'} seed={L ? 21 : 11}
            exprs={castExpr(35, L ? 'yu' : 'shun')} walk={{phase: (f - t0) / 18, amt: 1}} poses={[[0, 'stand']]} />}
          {s2 && <XuanGui f={f} x={480} y={918} h={80} rot={90} id={`g28${side}`} st={{glow: 0.6, rim: 1 + clamp(1 - Math.abs(f - gui) / 10)}} />}
          {s2 && <Puppet f={f} x={L ? 740 : 220} y={790} scale={1.25} facing={L ? -1 : 1} outfit={L ? 'prince' : 'danzhu'} seed={L ? 61 : 62}
            exprs={castExpr(36, L ? 'shangjun' : 'danzhu')} poses={[[0, 'stand']]} />}
        </Layer>
      </Stage>
    );
  };
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080, overflow: 'hidden'}}><div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080}}>{half('L')}</div></div>
      <div style={{position: 'absolute', left: 960, top: 0, width: 960, height: 1080, overflow: 'hidden'}}><div style={{position: 'absolute', left: 0, top: 0, width: 960, height: 1080}}>{half('R')}</div></div>
      <svg width={1920} height={1080} style={{position: 'absolute', inset: 0}}>
        <path d="M960,0 L960,1080" stroke="url(#gold)" strokeWidth={6} />
        <path d="M960,0 L960,1080" stroke="#1a0f08" strokeWidth={2} />
      </svg>
    </div>
  );
};

/** 2-9 双时空叠映：两路火把同向流动；两枚圭的描金轮廓滑动叠合，严丝合缝 */
export const S2_9: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(37), lock = cue(38, 'lock'), t1 = sEnd(38);
  const cam = camAt(f, [[t0 - 6, {z: 0.95, focus: 1, dof: 2}], [t1 + 6, {z: 1.15, focus: 1, dof: 2}]]);
  const m = prog(f, sStart(38), lock, easeInOut);
  const flash = f >= lock && f < lock + 8 ? 1 - (f - lock) / 8 : 0;
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('2-9')} light={[960, 500]} lightColor="#ffcf80" lightAmt={0.42 + flash * 0.3} f={f} />
        {Array.from({length: 10}).map((_, i) => <path key={i} d={`M${i * 220 - 100},1080 C${i * 220},700 ${i * 220 + 200},500 ${i * 220 + 120},0`} stroke="url(#gold)" strokeWidth={1.4} fill="none" opacity={0.25} />)}
        <Cloud x={200} y={200} s={1.6} color="#2a2214" /><Cloud x={1400} y={160} s={1.4} color="#2a2214" />
      </Layer>
      <Layer depth={0.5}>
        {/* 两层火光长龙：一层流向禹，一层流向舜（半透明叠印） */}
        {[0, 1].map(k => (
          <g key={k} opacity={0.75} transform={`translate(0,${k * 60 - 30})`}>
            {Array.from({length: 24}).map((_, i) => { const t = ((f - t0) / 60 + i / 24) % 1; const x = lerp(-100, 1650 + k * 120, t); const y = 760 + Math.sin(t * 6 + k) * 40; return <g key={i}><circle cx={x} cy={y} r={20} fill="url(#fireGlow)" /><circle cx={x} cy={y} r={4} fill="#ffe0a0" /></g>; })}
            <Puppet f={f} x={1640 + k * 120} y={640 + k * 60} scale={1.2} facing={-1} outfit={k ? 'shunYoung' : 'clean'} seed={21 - k * 10} />
          </g>
        ))}
      </Layer>
      <Layer depth={1}>
        <g opacity={f >= sStart(38) - 6 ? 1 : 0}>
          <XuanGui f={f} x={lerp(640, 960, m)} y={500} h={360} id="g29a" st={{glow: 0.5, rim: 1 + flash}} opacity={0.85} />
          <XuanGui f={f} x={lerp(1280, 960, m)} y={500} h={360} id="g29b" st={{glow: 0.5, rim: 1 + flash}} opacity={0.6} />
        </g>
        {flash > 0 && <circle cx={960} cy={500} r={200 + (1 - flash) * 400} fill="none" stroke="#ffe6a0" strokeWidth={8 * flash} opacity={flash} />}
      </Layer>
    </Stage>
  );
};
