import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, Ridge, GoldDust, Cloud, XipiSwirl, Cracks, crackPaths, Qiangjin} from '../lacquer/Materials';
import {Puppet, Crowd} from '../components/puppet/Puppet';
import {Hut, Fire, Grass, Pot, Tree, Rain, ArmCloseup, Disc} from '../components/Props';
import {Panel, Tent, StoneAxe, BambooScroll, Torch, Footprint, GuiChain} from '../components/Props2';
import {XuanGui} from '../components/XuanGui';
import {cue, sStart, sEnd, sceneBase, castExpr} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeIn, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES} from '../data/beats';

const B = BEAT_FRAMES;

/** 4-1 禹晚年居所：漆层老化，白发的禹把玄圭交到益手中；后景青年启盯着那块圭 */
export const S4_1: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(54), give = cue(55, 'give'), t1 = sEnd(55);
  const cam = camAt(f, [[t0 - 8, {z: 1.0, x: -80, focus: 1, dof: 3}], [give - 4, {z: 1.08, x: 0, focus: 1, dof: 3}], [give + 14, {z: 1.16, x: 120, y: 10, focus: 0.75, dof: 5}], [t1 + 6, {z: 1.2, x: 150, focus: 0.75, dof: 5}]]);
  const gp = springAt(f, give, {damping: 13, stiffness: 120});
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('4-1')} light={[1500, 380]} lightColor="#ffb07a" lightAmt={0.3} f={f} />
        {/* 窗格与夕照 */}
        <rect x={1360} y={220} width={300} height={260} fill="#ffb07a" opacity={0.16} />
        {[0, 1, 2, 3].map(i => <path key={i} d={`M${1360 + i * 100},220 L${1360 + i * 100},480`} stroke="#1a1020" strokeWidth={10} />)}
        <path d={`M1360,480 L1660,480 L${1500},1100 L${900},1100 Z`} fill="#ffb07a" opacity={0.06} />
        <Pot x={300} y={760} s={1.1} color="#24182a" /><Pot x={420} y={770} s={0.8} color="#2a1a2a" />
      </Layer>
      <Layer depth={0.55}>
        <path d="M-300,1300 L-300,880 L2300,880 L2300,1300 Z" fill="#1e1626" />
        <Puppet f={f} x={1480} y={760} scale={1.15} facing={-1} outfit="qi" seed={101} exprs={castExpr(55, 'qi')} poses={[[0, 'standTense']]} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={700} y={760} scale={1.55} facing={1} outfit="kingOld" seed={23} exprs={[...castExpr(54, 'yu'), ...castExpr(55, 'yu')]}
          poses={[[0, 'staff'], [t0 + 10, {lean: 10, shR: 70, elR: 20, head: 6}], [give + 10, 'staff']]}
          hold={f < give + 2 ? (wx, wy) => <g transform={`translate(${wx + 10},${wy - 10})`}><XuanGui f={f} x={0} y={0} h={110} rot={60} id="g41" st={{glow: 0.6, crack: 0.4}} /></g> : undefined} />
        <Puppet f={f} x={1060} y={770} scale={1.5} facing={-1} outfit="yi" seed={111} exprs={castExpr(55, 'yi')}
          poses={[[0, 'stand'], [give - 6, 'receive'], [give + 12, {shR: 60, elR: 70, shL: 50, elL: 70, head: 12}]]}
          hold={f >= give + 2 ? (wx, wy) => <g transform={`translate(${wx - 6},${wy - 14})`}><XuanGui f={f} x={0} y={0} h={110} rot={-20} id="g41b" st={{glow: 0.6 + gp * 0.3, crack: 0.4, rim: 1 + clamp(1 - (f - give) / 12)}} /></g> : undefined} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <XipiSwirl f={f} x={-300} y={-200} w={2600} h={300} colors={['#2a1f33', '#3a2a40']} seed={41} speed={0.4} opacity={0.35 * (1 - prog(f, t0, t0 + 30))} />
      </Layer>
    </Stage>
  );
};

/** 4-2 守丧→荒野：丧庐火塘三熄三燃（三年）；益背起包袱走向箕山，回头一次 */
export const S4_2: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(56), walk = cue(57, 'walk'), look = cue(57, 'look'), t1 = sEnd(57);
  const cam = camAt(f, [[t0 - 6, {z: 1.08, x: -160, focus: 1, dof: 3}], [walk, {z: 1.0, x: 0, focus: 1, dof: 3}], [t1 + 6, {z: 0.92, x: 220, y: -20, focus: 0.8, dof: 3}]]);
  const yr = (f - t0) / ((walk - t0) / 3);
  const fireOn = f < walk ? Math.sin((yr % 1) * Math.PI) : 0.2;
  const wp = prog(f, walk, t1 + 6, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('4-2')} light={[1500, 260]} lightColor="#e0e8f0" lightAmt={0.16} f={f} />
        <Cloud x={200} y={200} s={2} color="#3a424c" /><Cloud x={1200} y={140} s={1.6} color="#3a424c" />
        <Ridge seed={171} y={560} amp={200} color="#343c46" gold={0.5} />
        {[0, 1, 2].map(i => { const x = (f * 2.5 + i * 600) % 2200 - 100; const w = osc(f, 16, i / 3) * 8; return <path key={i} d={`M${x - 18},${300 + i * 40 + w} Q${x - 9},${292 + i * 40} ${x},${300 + i * 40} Q${x + 9},${292 + i * 40} ${x + 18},${300 + i * 40 + w}`} stroke="#141820" strokeWidth={4} fill="none" />; })}
      </Layer>
      <Layer depth={0.5}>
        <path d="M-300,1300 L-300,820 C400,790 1300,830 2300,800 L2300,1300 Z" fill="#2a3038" />
        {[300, 1500, 1800].map((x, i) => <g key={i} transform={`translate(${x},820)`}><path d="M0,0 L-4,-140 M-3,-90 L-46,-130 M-2,-110 L36,-160" stroke="#14181e" strokeWidth={8} strokeLinecap="round" fill="none" /></g>)}
      </Layer>
      <Layer depth={1}>
        <Hut x={420} y={880} s={0.9} f={f} />
        <g transform="translate(700,880)">
          <ellipse cx={0} cy={6} rx={60} ry={14} fill="#1a1a1a" />
          {fireOn > 0.05 && <Fire x={0} y={0} s={0.8 * fireOn} f={f} seed={5} />}
          {fireOn <= 0.05 && <path d="M-10,0 q4,-30 10,-50 q6,20 2,50" stroke="#8a8a8a" strokeWidth={3} fill="none" opacity={0.5} />}
        </g>
        {Array.from({length: 12}).map((_, i) => { const px = 900 + i * 70; const at = walk + i * 5; return f >= at ? <Footprint key={i} x={px} y={930 + (i % 2) * 16} rot={90} s={1.1} color="#14181e" o={0.8} /> : null; })}
        <Puppet f={f} x={f < walk ? 820 : lerp(820, 1700, wp)} y={f < walk ? 820 : lerp(820, 760, wp)} scale={f < walk ? 1.45 : lerp(1.45, 1.0, wp)} facing={f >= look && f < look + 20 ? -1 : 1}
          outfit={f < walk ? 'mourning' : 'yi'} seed={111} exprs={[...castExpr(56, 'yi'), ...castExpr(57, 'yi')]}
          poses={f < walk ? [[0, 'kneel']] : [[walk, 'rise'], [walk + 8, 'stand']]} walk={f > walk + 8 ? {phase: (f - walk) / 18, amt: 1} : undefined}
          hold={f >= walk ? (wx, wy) => <ellipse cx={wx} cy={wy - 6} rx={18} ry={14} fill="#6a5a40" stroke="url(#gold)" strokeWidth={1.4} /> : undefined} />
      </Layer>
      <Layer depth={1.4} blur={7}>
        <Grass f={f} x={-200} y={1140} w={900} h={200} color="#161a20" seed={61} />
        {/* 换装遮挡：起身瞬间一阵风沙卷过 */}
        {f >= walk - 4 && f < walk + 10 && <ellipse cx={820} cy={760} rx={260} ry={200} fill="#c8ccd0" opacity={0.4 * (1 - Math.abs(f - walk - 3) / 7)} filter="url(#roughEdge)" />}
      </Layer>
    </Stage>
  );
};

/** 4-3 三层剧本：三块半透明漆板依次推入（尧→舜、舜→禹、禹→益）；第三块板火把掉头，玄圭裂成两半 */
export const S4_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(58), p = ['p1', 'p2', 'p3'].map(k => cue(58, k)), turn = cue(59, 'turn'), t1 = sEnd(59);
  const cam = camAt(f, [[t0 - 6, {z: 0.9, focus: 1, dof: 2}], [turn - 4, {z: 1.0, focus: 1, dof: 2}], [turn + 4, {z: 1.08, focus: 1, dof: 2}], [t1 + 6, {z: 1.14, y: 20, focus: 1, dof: 2}]], 1.2);
  const split = prog(f, turn, turn + 30, easeOut);
  const panel = (i: number) => {
    const a = springAt(f, p[i], {damping: 14, stiffness: 130});
    const z = lerp(0.4, 1, a) * (1 - (2 - i) * 0.12);
    const torchDir = i === 2 && f >= turn ? -1 : 1;
    const tf = (f - p[i]) / 50;
    return (
      <g key={i} transform={`translate(${960 + (i - 1) * 40},${520 + (i - 1) * 30}) scale(${z})`} opacity={f < p[i] ? 0 : 0.55 + 0.45 * (i === 2 ? 1 : 0.4)}>
        <Panel x={0} y={0} w={1300} h={620} o={1} color={['#3a1e16', '#46241a', '#52281c'][i]}>
          <Puppet f={f} x={-380} y={60} scale={1.2} facing={-1} outfit="clean" seed={21} silhouette="#1a0c08" noFilter walk={{phase: (f - p[i]) / 20, amt: 0.6}} />
          {Array.from({length: 10}).map((_, k) => { const t = ((tf + k / 10) % 1); const x = torchDir > 0 ? lerp(560, -200, t) : lerp(-200, 560, t); return <g key={k}><circle cx={x} cy={150 + Math.sin(t * 8) * 20} r={18} fill="url(#fireGlow)" /><circle cx={x} cy={150 + Math.sin(t * 8) * 20} r={4} fill="#ffe0a0" /></g>; })}
          <Puppet f={f} x={i === 2 ? 420 : 0} y={60} scale={1.2} facing={1} outfit={i === 2 ? 'qi' : 'chief'} seed={12} silhouette="#1a0c08" noFilter />
        </Panel>
      </g>
    );
  };
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('4-3')} light={[960, 300]} lightColor="#ffb08a" lightAmt={0.26} f={f} />
      </Layer>
      <Layer depth={0.7}>{[0, 1, 2].map(panel)}</Layer>
      <Layer depth={1}>
        {f < turn && <XuanGui f={f} x={960} y={200} h={200} rot={90} id="g43" st={{glow: 0.5, crack: 0.4 + prog(f, p[2], turn) * 0.5}} />}
        {f >= turn && (
          <g>
            <g transform={`translate(${-split * 380},${split * 60}) rotate(${-split * 14} 960 200)`}><g clipPath="url(#halfL43)"><XuanGui f={f} x={960} y={200} h={200} rot={90} id="g43a" st={{glow: 0.4, crack: 1}} /></g></g>
            <g transform={`translate(${split * 380},${split * 60}) rotate(${split * 14} 960 200)`}><g clipPath="url(#halfR43)"><XuanGui f={f} x={960} y={200} h={200} rot={90} id="g43b" st={{glow: 0.4, crack: 1}} /></g></g>
            <defs>
              <clipPath id="halfL43"><path d="M0,0 L960,0 L940,120 L980,200 L950,280 L960,1080 L0,1080 Z" /></clipPath>
              <clipPath id="halfR43"><path d="M1920,0 L960,0 L940,120 L980,200 L950,280 L960,1080 L1920,1080 Z" /></clipPath>
            </defs>
          </g>
        )}
      </Layer>
      <Layer depth={1.4} blur={5}>
        <GoldDust f={f} seed={58} n={40} size={3} opacity={0.6} burstAt={turn} burstX={960} burstY={200} />
      </Layer>
    </Stage>
  );
};

/** 4-4 启的营地：帐篷与篝火；各部落首领排队进营；启的表情：意外→得意→收敛 */
export const S4_4: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(60), kneel = cue(60, 'kneel'), smirk = cue(61, 'smirk'), s2 = sStart(61), t1 = sEnd(61);
  const cam = camAt(f, [[t0 - 6, {z: 0.95, x: -100, focus: 0.8, dof: 3}], [s2, {z: 1.05, x: 60, focus: 1, dof: 4}], [s2 + 14, {z: 2.2, x: 330, y: -10, focus: 1, dof: 7}], [t1 + 6, {z: 2.3, x: 340, y: -6, focus: 1, dof: 7}]]);
  const kn = prog(f, kneel, kneel + 14, easeOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('4-4')} light={[1100, 600]} lightColor="#ffb050" lightAmt={0.36} f={f} />
        <Ridge seed={181} y={560} amp={90} color="#4a2a0a" gold={0.5} />
      </Layer>
      <Layer depth={0.45}>
        <path d="M-300,1300 L-300,700 L2300,700 L2300,1300 Z" fill="#3e2408" />
        {[200, 520, 1500, 1820].map((x, i) => <Tent key={i} x={x} y={760 + (i % 2) * 20} s={0.9} color={['#6a4a2a', '#5a3a1e', '#6a4022', '#5e4024'][i]} />)}
        {[380, 1660].map((x, i) => <Fire key={i} x={x} y={820} s={0.9} f={f} seed={i + 12} />)}
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={1290} y={680} scale={1.45} facing={-1} outfit="qi" seed={101} exprs={[...castExpr(60, 'qi'), ...castExpr(61, 'qi')]} poses={[[0, 'stand'], [smirk, {head: -6, lean: -3}]]} />
        {[0, 1, 2, 3, 4].map(i => (
          <Puppet key={i} f={f} x={lerp(300, 1080, i / 4) - (1 - kn) * 60} y={860 + (i % 2) * 20} scale={1.1} facing={1} outfit={['chiefMid', 'guard', 'danzhu', 'yi', 'guard'][i]} seed={120 + i}
            exprs={[[0, 'respect']]} poses={[[0, 'stand'], [kneel + i * 3, 'kneel']]} walk={f < kneel ? {phase: (f - t0) / 20 + i * 0.2, amt: 0.8} : undefined} />
        ))}
      </Layer>
      <Layer depth={1.45} blur={7}>
        <Torch x={60} y={1200} s={2.4} f={f} seed={9} />
        <GoldDust f={f} seed={60} n={30} size={3} opacity={0.5} />
      </Layer>
    </Stage>
  );
};

/** 4-5 算账·两只黑陶罐：两轮石子落进“功劳”罐；第三轮全倒进“血缘”罐，玄圭裂缝被描金填满 */
export const S4_5: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(62), r1 = cue(62, 'r1'), r2 = cue(62, 'r2'), pour = cue(63, 'pour'), mend = cue(63, 'mend'), t1 = sEnd(63);
  const cam = camAt(f, [[t0 - 6, {z: 1.06, x: -200, focus: 1, dof: 3}], [pour - 4, {z: 1.0, x: -60, focus: 1, dof: 3}], [t1 + 6, {z: 1.08, x: 200, focus: 1, dof: 3}]]);
  const drops = (at: number, toX: number, n: number, seed: number) => {
    const r = mulberry32(seed);
    return Array.from({length: n}).map((_, i) => {
      const st = at + r() * 6; const t = clamp((f - st) / 14);
      if (f < st || t >= 1) return null;
      return <ellipse key={seed * 100 + i} cx={toX + (r() - 0.5) * 60} cy={lerp(330, 640, t * t)} rx={9} ry={7} fill={['#d8d0c0', '#a8a090', '#8a8270'][i % 3]} stroke="#3a3428" strokeWidth={1} />;
    });
  };
  const leftFill = Math.min(2, (f >= r1 ? 1 : 0) + (f >= r2 ? 1 : 0));
  const rightFill = prog(f, pour, pour + 20);
  const mendP = prog(f, mend, mend + 24, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('4-5')} light={[700, 300]} lightColor="#d8f0f0" lightAmt={0.2} f={f} />
        <Cloud x={160} y={140} s={1.4} color="#1a2a30" /><Cloud x={1500} y={180} s={1.2} color="#1a2a30" />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,860 L2300,860 L2300,1300 Z" fill="#14222a" />
        <path d="M-300,860 L2300,860" stroke="url(#gold)" strokeWidth={2} opacity={0.6} />
      </Layer>
      <Layer depth={1}>
        {/* 左罐：耒臿图标（功劳）；右罐：血脉纹（血缘） */}
        <g transform="translate(640,860)"><Pot x={0} y={0} s={2.6} /><g transform="translate(0,-110) scale(0.5)"><path d="M-5,-60 L5,-60 L6,30 L-6,30 Z M-22,30 L22,30 L22,42 L-22,42 Z M-20,42 L-14,90 L-8,90 L-10,42 Z M10,42 L8,90 L14,90 L20,42 Z" fill="#e2b65c" /></g>
          <ellipse cx={0} cy={-232} rx={56} ry={10} fill="#a8a090" opacity={leftFill * 0.5} /></g>
        <g transform="translate(1300,860)"><Pot x={0} y={0} s={2.6} /><g transform="translate(0,-110)"><path d="M-30,0 a14,14 0 1,1 28,0 a14,14 0 1,1 28,0 a14,14 0 1,1 28,0" fill="none" stroke="#e4553f" strokeWidth={5} transform="translate(-14,0)" /></g>
          <ellipse cx={0} cy={-232} rx={56} ry={10} fill="#a8a090" opacity={rightFill} /></g>
        {drops(r1, 640, 8, 1)}{drops(r2, 640, 8, 2)}{drops(pour, 1300, 26, 3)}
        {rightFill > 0.8 && Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={1240 + i * 24} cy={630 + Math.sin(i) * 6} rx={9} ry={7} fill="#a8a090" stroke="#3a3428" strokeWidth={1} />)}
        {/* 投石的手（只见手） */}
        <ArmCloseup x={f < pour ? 640 : 1300} y={lerp(250, 280, osc(f, 20) * 0.5 + 0.5)} ang={90} s={0.45} bend={30} curl={f >= r1 && f < r1 + 8 ? 0.1 : 0.7} sleeve="#5a4a3a" skin="#c99468" armLen={500} />
        {/* 裂成两半的玄圭落到右罐口，裂缝被描金一点点填满 */}
        {f >= mend - 10 && <XuanGui f={f} x={1300} y={lerp(300, 520, prog(f, mend - 10, mend, easeIn))} h={200} rot={90} id="g45" st={{glow: 0.5 + mendP * 0.5, crack: 1, repaired: mendP, rim: 1 + mendP * 0.4}} />}
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={62} n={30} size={3} opacity={0.5 + mendP * 0.4} />
      </Layer>
    </Stage>
  );
};

/** 4-6a 另一种说法·益的住所（夜）：火把围上来；启带持石钺的人冲进来 */
export const S4_6a: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(64), rush = cue(65, 'rush'), t1 = sEnd(65);
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: 80, focus: 1, dof: 3}], [rush, {z: 1.04, x: 0, focus: 1, dof: 3}], [t1 + 6, {z: 1.18, x: -80, y: 20, focus: 1, dof: 3}]], f >= rush ? 3 : 1);
  const ring = prog(f, t0, rush, easeInOut);
  const rp = prog(f, rush, rush + 24, easeOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('4-6a')} light={[400, 500]} lightColor="#ff8a40" lightAmt={0.3 + rp * 0.2} f={f} />
        <Disc x={1500} y={200} r={50} color="#c8ccd8" glow="#a8b8d8" />
        <Ridge seed={191} y={620} amp={100} color="#120c0a" gold={0.4} />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,820 L2300,820 L2300,1300 Z" fill="#0e0806" />
        <Hut x={1150} y={860} s={1.1} f={f} doorLight={0.3} />
        {/* 火把从四周围上来 */}
        {Array.from({length: 9}).map((_, i) => { const a = (i / 9) * Math.PI - Math.PI; const r = lerp(1100, 520, ring); return <Torch key={i} x={1150 + Math.cos(a) * r * 1.2} y={900 + Math.sin(a) * r * 0.08 + (i % 2) * 30} s={0.9} f={f} seed={i} />; })}
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={1230} y={770} scale={1.1} facing={-1} outfit="yi" seed={111} exprs={[...castExpr(64, 'yi'), ...castExpr(65, 'yi')]} poses={[[0, 'peek'], [rush, {lean: -20, head: -14, shR: 120, shL: 110}]]} />
        {f >= rush - 4 && [0, 1, 2].map(i => (
          <Puppet key={i} f={f} x={lerp(-200 - i * 140, 620 - i * 160, rp)} y={800 + i * 14} scale={i === 0 ? 1.45 : 1.25} facing={1} outfit={i === 0 ? 'qi' : 'guard'} seed={101 + i * 7}
            exprs={i === 0 ? castExpr(65, 'qi') : [[0, 'clench']]} walk={{phase: (f - rush) / 10 + i * 0.3, amt: 1.2 * (1 - rp * 0.6)}} poses={[[0, 'axe']]}
            hold={(wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><StoneAxe x={0} y={40} s={0.55} /></g>} />
        ))}
      </Layer>
      <Layer depth={1.4} blur={6}>
        <Grass f={f} x={-200} y={1140} w={1000} h={200} color="#080404" seed={71} />
      </Layer>
    </Stage>
  );
};

/** 4-6b 出土竹简：竹简从左落下铺开；简上一滴朱漆流下，滴在玄圭的金缝上 */
export const S4_6b: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(66), drip = cue(66, 'drip'), t1 = sEnd(66);
  const cam = camAt(f, [[t0 - 6, {z: 1.1, x: -120, focus: 1, dof: 3}], [t1 + 6, {z: 1.2, x: 120, y: 30, focus: 1, dof: 4}]]);
  const dp = prog(f, drip - 20, drip, easeIn);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('4-6b')} light={[900, 200]} lightColor="#e8f0e0" lightAmt={0.2} f={f} />
      </Layer>
      <Layer depth={1}>
        {Array.from({length: 22}).map((_, i) => {
          const at = t0 + i * 1.5; const t = prog(f, at, at + 14, easeOut);
          const r = mulberry32(i + 7);
          return <g key={i} transform={`translate(${120 + i * 34 + (1 - t) * 60},${lerp(-300, 380 + r() * 30, t)}) rotate(${(1 - t) * (r() - 0.5) * 60 + (r() - 0.5) * 6})`}><BambooScroll x={0} y={0} n={1} s={1.3} /></g>;
        })}
        {/* 朱漆滴 */}
        <path d={`M680,420 L680,${lerp(420, 760, dp)}`} stroke="#b8281c" strokeWidth={6} />
        {f < drip && <ellipse cx={680} cy={lerp(420, 760, dp)} rx={8} ry={12} fill="#c8301e" />}
        <XuanGui f={f} x={1180} y={680} h={320} rot={90} id="g46" st={{glow: 0.5, crack: 1, repaired: 1, rim: 1}} />
        {f >= drip && <g><ellipse cx={1180} cy={680} rx={lerp(4, 40, prog(f, drip, drip + 10))} ry={lerp(4, 14, prog(f, drip, drip + 10))} fill="#b8281c" opacity={0.8} />
          <path d="M1180,680 C1150,700 1120,740 1100,800" stroke="#b8281c" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${prog(f, drip, drip + 30)} 1`} /></g>}
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={66} n={20} size={2.4} opacity={0.4} />
      </Layer>
    </Stage>
  );
};

/** 4-7 金缮重组：玄圭碎片在空中拼回原形，描金裂纹完整亮起；金缝延伸成父子相传的链 */
export const S4_7: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(67), chain = cue(68, 'chain'), t1 = sEnd(68);
  const cam = camAt(f, [[t0 - 6, {z: 1.15, focus: 1, dof: 2}], [chain, {z: 1.0, focus: 1, dof: 2}], [t1 + 6, {z: 0.86, x: 120, y: -40, focus: 1, dof: 2}]]);
  const re = prog(f, t0 - 4, t0 + 24, easeInOut);
  const grow = f >= chain ? (f - chain) / B + 1 : 0;
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('4-7')} light={[760, 480]} lightColor="#ffd890" lightAmt={0.24} f={f} />
        {Array.from({length: 16}).map((_, i) => { const r = mulberry32(i + 900); return <path key={i} d={`M${r() * 1920},${r() * 1080} l${(r() - 0.5) * 120},${(r() - 0.5) * 120}`} stroke="url(#gold)" strokeWidth={1.2} opacity={0.3} />; })}
        {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2 + f * 0.002; return <line key={'r' + i} x1={760 + Math.cos(a) * 300} y1={480 + Math.sin(a) * 300} x2={760 + Math.cos(a) * 1100} y2={480 + Math.sin(a) * 1100} stroke="url(#gold)" strokeWidth={2} opacity={0.18} />; })}
        <Cloud x={1300} y={820} s={1.6} color="#14202c" /><Cloud x={160} y={860} s={1.4} color="#14202c" />
      </Layer>
      <Layer depth={1}>
        {re < 1 ? <XuanGui f={f} x={760} y={480} h={460} id="g47s" st={{shatter: 1 - re}} />
          : <XuanGui f={f} x={760} y={480} h={460} id="g47" st={{glow: 0.8, crack: 1, repaired: 1, rim: 1.4, emblem: 1}} />}
        <GuiChain x0={900} y0={520} x1={1500} y1={260} n={6} grow={grow} f={f} s={1.4} />
        {f >= chain && <path d={`M840,500 Q${1000},${560} ${lerp(900, 1500, clamp(grow / 6))},${lerp(520, 260, clamp(grow / 6))}`} stroke="url(#gold)" strokeWidth={4} fill="none" filter="url(#goldGlow)" />}
      </Layer>
      <Layer depth={1.4} blur={5}>
        <GoldDust f={f} seed={67} n={50} size={3} opacity={0.6} />
        {Array.from({length: 10}).map((_, i) => { const r = mulberry32(i + 950); const x = (r() * 2000 + f * (1 + r())) % 2100 - 100; const y = r() * 1080 + osc(f, 60, r()) * 30; return <path key={i} d="M0,-14 L12,2 L-2,12 L-10,-2Z" transform={`translate(${x},${y}) rotate(${f * 2 + i * 40}) scale(${1 + r()})`} fill="url(#blackLq)" stroke="url(#gold)" strokeWidth={1.4} />; })}
      </Layer>
    </Stage>
  );
};
