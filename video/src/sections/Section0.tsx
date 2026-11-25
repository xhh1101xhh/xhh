import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, Ridge, GoldDust, Mop, Cloud, Qiangjin} from '../lacquer/Materials';
import {Puppet, Crowd} from '../components/puppet/Puppet';
import {Lei, ArmCloseup, Fire, Grass, Disc, Platform, Banner, Pot} from '../components/Props';
import {XuanGui} from '../components/XuanGui';
import {cue, sStart, sEnd, sceneBase} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES} from '../data/beats';

const B = BEAT_FRAMES;

/** 0-1 羽山脚下：舜的背影、半埋的断耒；禹拔耒走向坡顶 */
export const S0_1: React.FC<{f: number}> = ({f}) => {
  const pull = cue(2, 'pull'), walk = cue(2, 'walk'), cut = sStart(3);
  const cam = camAt(f, [[0, {z: 1.0, x: -40, y: 10, focus: 1, dof: 3}], [pull, {z: 1.08, x: -10, y: 0, focus: 1, dof: 3}], [cut, {z: 1.18, x: 80, y: -30, focus: 0.75, dof: 4}]]);
  const lifted = f >= pull;
  const wp = prog(f, walk, cut + 12, easeInOut);
  const yuX = lifted ? lerp(706, 1000, wp) : 706, yuY = lifted ? lerp(790, 690, wp) : 790, yuS = lerp(2.0, 1.25, wp);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('0-1')} light={[1350, 230]} lightColor="#c8d4e8" lightAmt={0.2} f={f} />
        <Disc x={1420} y={220} r={70} color="#d8d2c0" glow="#cfd8e8" />
        {Array.from({length: 14}).map((_, i) => { const r = mulberry32(i + 3); return <Mop key={i} cx={r() * 1900} cy={r() * 360} r={2 + r() * 2} f={f} seed={i} />; })}
        <Ridge seed={3} y={560} amp={160} color="#1d2228" gold={0.5} />
      </Layer>
      <Layer depth={0.3}>
        <Ridge seed={8} y={640} amp={220} color="#171a1e" gold={0.7} />
        {[0, 1, 2].map(i => <ellipse key={i} cx={(i * 700 + f * (1.2 + i * 0.4)) % 2600 - 300} cy={650 + i * 40} rx={520} ry={40} fill="#9aa4b4" opacity={0.08} />)}
        {[[300, 700], [520, 720], [1700, 690]].map(([tx, ty], i) => (
          <g key={'dt' + i} transform={`translate(${tx},${ty}) scale(${0.9 + i * 0.1})`}>
            <path d="M0,0 L-4,-120 M-3,-80 L-40,-120 M-2,-100 L30,-150 M-36,-116 L-50,-140" stroke="#0e1012" strokeWidth={8} strokeLinecap="round" fill="none" />
            <path d="M0,0 L-4,-120 M-3,-80 L-40,-120 M-2,-100 L30,-150" stroke="url(#gold)" strokeWidth={1.4} fill="none" opacity={0.5} />
          </g>
        ))}
        {[0, 1, 2, 3].map(i => { const x = (f * (3 + i) + i * 400) % 2300 - 200; const y = 300 + i * 40 + noise(f / 30 + i) * 20; const w = osc(f, 14, i / 4) * 10; return <path key={'cr' + i} d={`M${x - 16},${y + w} Q${x - 8},${y - 6} ${x},${y} Q${x + 8},${y - 6} ${x + 16},${y + w}`} stroke="#0a0a0c" strokeWidth={4} fill="none" />; })}
      </Layer>
      <Layer depth={0.6}>
        <path d="M700,1200 C900,760 1100,600 1300,590 C1500,580 1700,640 2100,700 L2100,1200 Z" fill="#1b1714" />
        <path d="M700,1200 C900,760 1100,600 1300,590 C1500,580 1700,640 2100,700" fill="none" stroke="url(#gold)" strokeWidth={2.5} />
        <Puppet f={f} x={1310} y={455} scale={1.35} facing={-1} view="back" outfit="chief" seed={11} wind={0.6 + noise(f / 40) * 0.4}
          poses={[[0, {shL: -4, elL: 10, shR: 6, elR: 12, head: -4}]]} />
      </Layer>
      <Layer depth={1}>
        <path d="M-200,1200 L-200,930 C300,900 700,950 1200,940 C1500,935 1800,960 2200,950 L2200,1200 Z" fill="#14100c" />
        <path d="M-200,930 C300,900 700,950 1200,940 C1500,935 1800,960 2200,950" fill="none" stroke="url(#gold)" strokeWidth={2} opacity={0.6} />
        {!lifted && <Lei x={520} y={900} rot={-14} s={1.4} broken mud={0.9} />}
        {f >= pull - 22 && (
          <Puppet f={f} x={yuX + (f < pull ? (1 - prog(f, pull - 22, pull - 6, easeOut)) * 500 : 0)} y={yuY} scale={yuS} facing={f < pull + 8 ? -1 : 1} view={f < pull + 8 ? 'front' : 'back'} outfit="commoner" seed={21}
            exprs={[[0, 'suppressed']]}
            walk={lifted && f > walk ? {phase: (f - walk) / 20, amt: 1 - prog(f, cut, cut + 10)} : undefined}
            poses={[[0, 'grabLow'], [pull, 'liftLei'], [pull + 10, 'holdLei']]}
            hold={lifted ? (wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><Lei x={0} y={70} s={0.62} broken /></g> : undefined} />
        )}
        {lifted && f < pull + 14 && Array.from({length: 8}).map((_, i) => { const t = (f - pull) / 14; return <circle key={i} cx={489 + Math.cos(i) * 80 * t} cy={800 - Math.sin(i * 0.7 + 0.5) * 90 * t + t * t * 120} r={7 * (1 - t)} fill="#2a1e14" />; })}
      </Layer>
      <Layer depth={1.4} blur={6}>
        <Grass f={f} x={-100} y={1100} w={600} h={160} color="#0c0a08" />
        <Grass f={f} x={1500} y={1100} w={600} h={140} color="#0c0a08" seed={9} />
        {[0, 1].map(i => <ellipse key={i} cx={(f * 2.4 + i * 900) % 2400 - 200} cy={960} rx={500} ry={60} fill="#aab2c0" opacity={0.07} />)}
      </Layer>
    </Stage>
  );
};

/** 0-2 高台特写：舜递玄圭，禹立掌推回（首尾呼应构图①） */
export const S0_2: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(3), enter = cue(4, 'enter'), windup = cue(4, 'windup'), push = cue(4, 'push');
  const cam = camAt(f, [[t0, {z: 1.0, x: 0, focus: 1, dof: 5}], [push - 2, {z: 1.08, x: 10, focus: 1, dof: 5}], [push + 6, {z: 1.04, x: 0, focus: 1, dof: 5}], [sEnd(4) + 8, {z: 1.1, x: -20, y: -10, focus: 1, dof: 5}]]);
  const pushP = springAt(f, push, {damping: 12, stiffness: 170});
  const guiX = lerp(1080, 700, pushP), guiRot = 78 + pushP * -16;
  const offerIn = springAt(f, t0, {damping: 16, stiffness: 90});
  const palmIn = springAt(f, enter, {damping: 14, stiffness: 110});
  const wind = f >= windup ? springAt(f, windup, {damping: 12, stiffness: 160}) : 0;
  const palmX = lerp(2300, 1560, palmIn) + wind * 80 - pushP * 300;
  const shake = f >= push && f < push + 4 ? (f % 2 ? 6 : -6) : 0;
  return (
    <Stage cam={cam}>
      <Layer depth={0.2}>
        <LacquerBackdrop base={sceneBase('0-2')} light={[960, 120]} lightColor="#ffe6c0" lightAmt={0.32} f={f} />
        <path d="M760,-100 L1160,-100 L1500,1200 L420,1200 Z" fill="#ffe8c8" opacity={0.06} />
        {[300, 600, 1400, 1700].map((x, i) => <Fire key={i} x={x} y={330 + (i % 2) * 40} s={0.7} f={f} seed={i} logs={false} />)}
        <Platform x={960} y={1120} w={1700} h={330} color="#5a2a1c" />
      </Layer>
      <Layer depth={0.55}>
        <Banner x={180} y={760} h={420} f={f} color="#7a1f16" icon="bird" />
        <Banner x={1720} y={760} h={420} f={f} color="#7a1f16" icon="sun" />
        <Pot x={360} y={900} s={1.4} /><Pot x={1560} y={910} s={1.3} />
      </Layer>
      <Layer depth={1}>
        <g transform={`translate(0,${shake})`}>
          <ArmCloseup x={lerp(-300, 780, offerIn) - pushP * 70} y={800} ang={-8} s={1.05} bend={-14} curl={0.35} thumb={-60} sleeve="#a8332a" skin="#d8a77c" bracelet wrinkles />
          <XuanGui f={f} x={guiX} y={700} h={430} rot={guiRot} id="g02" st={{glow: 0.6, rim: 1 + clamp(1 - (f - t0) / 20) * 0.6}} />
          {f >= push && f < push + 10 && [0, 1, 2].map(i => <XuanGui key={i} f={f} x={guiX + (i + 1) * 46} y={700} h={430} rot={guiRot + (i + 1) * 3} id={`g02t${i}`} opacity={0.18 * (1 - (f - push) / 10)} st={{glow: 0}} />)}
          {f >= enter - 2 && <ArmCloseup x={palmX} y={760} ang={180} s={1.1} bend={-80} curl={0.05} thumb={-130} sleeve="#6a5a3e" skin="#c99468" />}
        </g>
      </Layer>
      <Layer depth={1.5} blur={10}>
        <GoldDust f={f} seed={4} n={30} size={4} opacity={0.7} />
      </Layer>
    </Stage>
  );
};

/** 0-3 天下：玄圭升作黑月，篝火一圈圈点亮 */
export const S0_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(5), t1 = sEnd(5);
  const cam = camAt(f, [[t0 - 8, {z: 1.15, y: 120, focus: 0.6, dof: 2}], [t1 + 10, {z: 1.0, y: -40, focus: 0.6, dof: 2}]]);
  const ring = Math.floor((f - cue(5, 'rings')) / B);
  const moonP = prog(f, t0 - 8, t0 + 30, easeOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.1}>
        <LacquerBackdrop base={sceneBase('0-3')} light={[960, 180]} lightColor="#cfe0ff" lightAmt={0.18} f={f} />
        {Array.from({length: 30}).map((_, i) => { const r = mulberry32(i + 40); return <Mop key={i} cx={r() * 1920} cy={r() * 400} r={1.5 + r() * 2.5} f={f} seed={i} />; })}
        <Cloud x={200} y={260} s={1.2} color="#16282a" /><Cloud x={1500} y={300} s={1} color="#16282a" />
      </Layer>
      <Layer depth={0.25}>
        <g transform={`translate(960,${lerp(560, 250, moonP)}) scale(${lerp(0.5, 1.4, moonP)})`}>
          <circle r={150} fill="#e8d9a8" opacity={0.12} />
          <XuanGui f={f} x={0} y={0} h={240} rot={0} id="g03" st={{glow: 0.9, rim: 1.4}} />
        </g>
      </Layer>
      <Layer depth={0.5}>
        <Ridge seed={14} y={640} amp={120} color="#132426" gold={0.6} />
        <path d="M-300,1300 L-300,700 C400,660 1400,660 2300,700 L2300,1300 Z" fill="#102022" />
        {/* 大地上的河：金线 */}
        <path d="M-200,820 C300,760 700,900 1100,820 C1400,760 1700,860 2200,800" stroke="url(#gold)" strokeWidth={3} fill="none" opacity={0.7} />
        {/* 篝火环：每拍点亮一圈（螺钿光点） */}
        {[0, 1, 2, 3].map(k => Array.from({length: 10 + k * 6}).map((_, i) => {
          const a = (i / (10 + k * 6)) * Math.PI * 2;
          const cx = 960 + Math.cos(a) * (160 + k * 190), cy = 840 + Math.sin(a) * (50 + k * 52);
          const on = ring >= k ? clamp((f - cue(5, 'rings') - k * B) / 6) : 0;
          return on > 0 ? <g key={k * 100 + i}><circle cx={cx} cy={cy} r={34 * on} fill="url(#fireGlow)" /><Fire x={cx} y={cy} s={0.22 * on} f={f} seed={i + k} logs={false} /><Mop cx={cx} cy={cy + 6} r={3.5 * on} f={f} seed={i + k} /></g> : null;
        }))}
      </Layer>
      <Layer depth={1.3} blur={3}>
        <path d="M-300,1300 L-300,980 C0,940 300,960 600,1000 L700,1300 Z" fill="#081214" />
        <Crowd f={f} x={260} y={1000} n={5} spacing={70} scale={0.9} color="#0a1416" headTurn={-1} />
      </Layer>
    </Stage>
  );
};

/** 0-4 禹的面部大特写：焦点拉移；安静拍里只剩呼吸 */
export const S0_4: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(6), pb = cue(7, 'pullback'), turn = cue(7, 'turn'), t1 = sEnd(7);
  const cam = camAt(f, [[t0, {z: 1.0, x: 0, focus: 1, dof: 6}], [pb, {z: 1.02, x: 6, focus: 1, dof: 6}], [t1, {z: 0.86, x: -40, y: 30, focus: 1, dof: 6}]]);
  const s = keys(f, [[t0, 5.6], [pb, 5.4], [t1, 3.2]]);
  const turnP = prog(f, turn, t1 + 10, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('0-4')} light={[1500, 300]} lightColor="#ffcf90" lightAmt={0.28} f={f} />
        {/* 远景工地：火把、渠道 */}
        {[200, 520, 840].map((x, i) => <Fire key={i} x={x} y={620 + i * 20} s={0.5} f={f} seed={i + 7} logs={false} />)}
        <Crowd f={f} x={520} y={760} n={9} spacing={60} scale={0.45} color="#2a160c" />
        {/* 黑月残留光斑（下一屏穿越入口） */}
        <circle cx={620} cy={300} r={120} fill="#e8d9a8" opacity={0.18} />
        <circle cx={620} cy={300} r={60} fill="#141210" opacity={0.6} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={lerp(1180, 1240, turnP) + turnP * 300} y={keys(f, [[t0, 470], [pb, 470], [t1, 430]]) + 118 * s} scale={s} facing={turnP > 0.5 ? 1 : -1} outfit="worker" seed={31}
          exprs={[[t0, 'calm'], [cue(6, 'freeze') + 16, 'tired'], [pb, 'thoughtful']]}
          poses={[[0, {head: -6, shR: 10, elR: 20}], [pb, {head: -2, shR: 25, elR: 125}], [turn, {head: 8, lean: -6, shR: 25, elR: 125}]]}
          hold={f >= pb ? (wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><Lei x={0} y={70} s={0.6} broken /></g> : undefined}
          opacity={1 - prog(f, t1 - 4, t1 + 8)} />
      </Layer>
      <Layer depth={1.6} blur={14}>
        <Grass f={f} x={1300} y={1150} w={700} h={260} color="#1c0e06" />
      </Layer>
    </Stage>
  );
};

/** 0-5 玄圭微距：戗金刻出夏后纹；安静拍迸出第一道细裂 */
export const S0_5: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(8), em = cue(8, 'emblem'), crack = cue(8, 'crack'), t1 = sEnd(8);
  const cam = camAt(f, [[t0 - 10, {z: 0.9, focus: 1, dof: 2}], [t1, {z: 1.12, x: 20, focus: 1, dof: 2}]]);
  const rot = keys(f, [[t0 - 10, -8], [t1, 4]]);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('0-5')} light={[1150, 400]} lightColor="#ffd890" lightAmt={0.3} f={f} />
        {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${-200 + i * 480},1200 Q${100 + i * 480},${600 + i * 30} ${300 + i * 460},-100`} stroke="url(#gold)" strokeWidth={1.2} fill="none" opacity={0.18} />)}
      </Layer>
      <Layer depth={0.5}>
        <GoldDust f={f} seed={8} n={60} size={2.6} opacity={0.7} />
      </Layer>
      <Layer depth={1}>
        <XuanGui f={f} x={1390} y={540} h={880} rot={rot} id="g05"
          st={{emblem: prog(f, em + 2, em + 3 * B), crack: f >= crack ? prog(f, crack, crack + 14, easeOut) * 0.35 : 0, glow: 0.6, rim: 1.2}} />
      </Layer>
    </Stage>
  );
};
