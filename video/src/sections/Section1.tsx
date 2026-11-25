import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, Ridge, GoldDust, Mop, Cloud, XipiSwirl, Tihong, Qiangjin} from '../lacquer/Materials';
import {Puppet, Crowd} from '../components/puppet/Puppet';
import {Lei, Hut, Fire, Grass, Disc, Platform, Banner, Pot, Rain, Balance, KnotRope, Tree} from '../components/Props';
import {XuanGui} from '../components/XuanGui';
import {SandTable} from '../components/SandTable';
import {PlaceTag} from '../components/Text';
import {cue, sStart, sEnd, sceneBase, sceneRange, screen} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeIn, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES} from '../data/beats';

const B = BEAT_FRAMES;

/** 1-1 洪水平原：碎圭化水，石胚沉底；鲧筑堤九层，浪头拍碎 */
export const S1_1: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(9), ram = cue(10, 'ram'), brk = cue(10, 'break'), t1 = sEnd(10);
  const cam = camAt(f, [[t0, {z: 1.15, x: 200, y: 0, focus: 1, dof: 3}], [ram, {z: 1.0, x: 0, focus: 0.9, dof: 3}], [brk, {z: 1.06, x: -120, focus: 0.9, dof: 3}], [t1 + 10, {z: 1.12, x: -180, y: -20, focus: 0.9, dof: 3}]]);
  const shat = prog(f, t0, t0 + 26, easeOut);
  const layers = Math.min(9, Math.max(0, Math.floor((f - ram) / (B / 2)) + 1));
  const broken = f >= brk;
  const bp = prog(f, brk, brk + 20, easeOut);
  const flash = (f === brk || f === t0 + 18) ? 1 : 0;
  const r = mulberry32(17);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-1')} light={[600, 160]} lightColor="#d8e8f0" lightAmt={0.16 + flash * 0.4} f={f} />
        <Cloud x={100} y={150} s={2} color="#1e3238" /><Cloud x={900} y={110} s={2.4} color="#1a2c32" /><Cloud x={1500} y={170} s={1.8} color="#1e3238" />
        {flash > 0 && <path d="M1300,0 L1260,140 L1300,150 L1220,330" stroke="#f0f6ff" strokeWidth={5} fill="none" />}
      </Layer>
      <Layer depth={0.3}>
        <Ridge seed={22} y={600} amp={110} color="#1f343a" gold={0.5} />
        <path d="M200,700 Q320,640 460,700 Z" fill="#203236" />
        <Crowd f={f} x={330} y={690} n={6} spacing={28} scale={0.32} color="#101c20" headTurn={1} />
      </Layer>
      <Layer depth={0.6}>
        {/* 被淹的村落：半截草屋、树梢露出水面 */}
        {[[260, 760, 0.7], [620, 790, 0.85], [1500, 770, 0.75], [1820, 800, 0.9]].map(([hx, hy, hs], i) => (
          <g key={i} transform={`translate(0,${osc(f, 50, i / 4) * 4})`}><Hut x={hx} y={hy} s={hs} f={f} /></g>
        ))}
        {[[440, 760], [1000, 770], [1300, 760]].map(([tx, ty], i) => <Tree key={i} x={tx} y={ty} s={0.9} f={f} color="#1f3a34" />)}
        <XipiSwirl f={f} x={-400} y={740} w={2800} h={460} colors={['#2a4e58', '#1e3c46', '#365e66', '#16303a']} seed={3} speed={1.6} />
        {/* 漂浮物：木料、陶罐 */}
        {[0, 1, 2, 3].map(i => <g key={'fl' + i} transform={`translate(${(i * 520 + f * (2 + i)) % 2400 - 200},${820 + i * 40 + osc(f, 30, i / 4) * 8}) rotate(${osc(f, 60, i / 3) * 12})`}><rect x={-40} y={-6} width={80} height={12} fill="#4a3220" stroke="url(#gold)" strokeWidth={1} /></g>)}
        {/* 黑石胚：碎片聚合后沉入水中 */}
        <XuanGui f={f} x={1120} y={lerp(520, 900, prog(f, t0 + 16, t0 + 50, easeIn))} h={220} rot={lerp(0, 40, shat)} id="g11" seed={6}
          st={{formed: 0, glow: 0.2, rim: 0.5}} opacity={(f < t0 + 14 ? 0 : 1) * (1 - prog(f, t0 + 50, t0 + 64))} />
      </Layer>
      <Layer depth={1}>
        {/* 土堤：每半拍加高一层 */}
        <g transform="translate(1180,860)">
          {Array.from({length: layers}).map((_, i) => {
            const fly = broken ? bp : 0;
            const rr = mulberry32(i + 5);
            return (
              <g key={i} transform={`translate(${fly * (rr() - 0.3) * 500},${-i * 22 - fly * (120 + rr() * 200) + fly * fly * 300}) rotate(${fly * (rr() - 0.5) * 90})`} opacity={1 - fly * 0.6}>
                {broken ? <Tihong d={`M${-180 + i * 8},0 L${180 - i * 8},0 L${170 - i * 8},-22 L${-170 + i * 8},-22 Z`} layers={3} color="#b5422e" />
                  : <path d={`M${-180 + i * 8},0 L${180 - i * 8},0 L${170 - i * 8},-22 L${-170 + i * 8},-22 Z`} fill={shade('#8a6a40', (i % 2) * 0.08)} stroke="url(#gold)" strokeWidth={1.4} />}
              </g>
            );
          })}
        </g>
        {f >= ram - 10 && (
          <Puppet f={f} x={900} y={720} scale={1.5} facing={1} outfit="worker" seed={41} exprs={[[ram, 'clench'], [brk, 'shock']]}
            poses={[[ram - 10, 'ram'], [ram, 'ramDown'], [ram + 8, 'ram'], [ram + 16, 'ramDown'], [ram + 24, 'ram'], [brk, {lean: -14, shR: 120, elR: 40, shL: 100, elL: 50, head: -10}]]} />
        )}
        {f >= ram - 10 && <Puppet f={f} x={1480} y={730} scale={1.3} facing={-1} outfit="guard" seed={42} exprs={[[0, 'clench'], [brk, 'fear']]}
          poses={[[ram - 6, 'ram'], [ram + 4, 'ramDown'], [ram + 12, 'ram'], [ram + 20, 'ramDown'], [brk, {lean: -16, shR: 140, shL: 120, head: -12}]]} />}
        {/* 浪头 */}
        {broken && (
          <g transform={`translate(${1500 - bp * 260},${980 - bp * 80}) scale(${0.6 + bp * 0.7})`}>
            <path d="M-420,200 C-380,-40 -140,-210 100,-180 C260,-160 320,-40 240,30 C200,-40 120,-60 60,-20 C0,20 20,120 120,200 Z" fill="#2e5a64" stroke="url(#gold)" strokeWidth={3} />
            <path d="M-300,200 C-260,0 -100,-140 80,-130 C180,-124 230,-60 200,-10" fill="none" stroke="#1e3e48" strokeWidth={18} opacity={0.6} />
            {[0, 1, 2, 3, 4].map(i => <path key={i} d={`M${100 + i * 30},${-180 + i * 30} q${20 + i * 5},-20 ${40},${0}`} stroke="#e8f6fa" strokeWidth={6} fill="none" strokeLinecap="round" />)}
            <path d="M240,30 C200,-40 120,-60 60,-20" stroke="#e8f6fa" strokeWidth={5} fill="none" />
          </g>
        )}
        {broken && Array.from({length: 16}).map((_, i) => { const t = bp; return <circle key={i} cx={1300 + Math.cos(i) * 300 * t} cy={760 - Math.sin(i * 1.7) * 200 * t + t * t * 260} r={10 * (1 - t) + 2} fill="#d8eef4" opacity={1 - t} />; })}
      </Layer>
      <Layer depth={1.4}>
        <XipiSwirl f={f + 40} x={-400} y={960} w={2800} h={240} colors={['#244852', '#1a3842', '#2e5660']} seed={9} speed={2.2} />
        <path d={`M-300,1200 L-300,${980 + osc(f, 40) * 20} Q200,${900 + osc(f, 36) * 30} 520,${990 + osc(f, 44, 0.3) * 20} Q700,1040 900,1200 Z`} fill="#1c3a44" stroke="#cfe8ef" strokeWidth={3} opacity={0.95} />
        <Rain f={f} n={90} opacity={0.4} slant={-0.25} />
      </Layer>
      {/* 碎圭：从上一屏玄圭位置迸散 */}
      <Layer depth={1} noBlur>
        {f < t0 + 30 && <XuanGui f={f} x={1390} y={540} h={880} id="g11s" st={{shatter: shat}} />}
        {f < t0 + 30 && Array.from({length: 40}).map((_, i) => { const t = shat; const a = r() * Math.PI * 2, d = 200 + r() * 700; return <ellipse key={i} cx={1390 + Math.cos(a) * d * t} cy={540 + Math.sin(a) * d * t + t * t * 400} rx={5} ry={9} fill="#bfe2ee" opacity={(1 - t) * 0.9} />; })}
      </Layer>
    </Stage>
  );
};

/** 1-2 羽山：舜指令，鲧被押往山深处，没入朱漆暮色（只表现治罪、放逐） */
export const S1_2: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(11), point = cue(11, 'point'), sink = cue(11, 'sink'), t1 = sEnd(11);
  const cam = camAt(f, [[t0 - 4, {z: 1.0, x: -60, y: 40, focus: 1, dof: 3}], [t1 + 10, {z: 1.1, x: 40, y: -10, focus: 1, dof: 3}]]);
  const led = prog(f, point, t1 + 10, easeInOut);
  const sinkP = prog(f, sink, sink + 22, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-2')} light={[1500, 380]} lightColor="#ff9a50" lightAmt={0.38} f={f} />
        <Disc x={1500} y={430} r={90} color="#d8582e" glow="#ff8a40" />
        <Ridge seed={31} y={620} amp={260} color="#3a1e12" gold={0.6} />
      </Layer>
      <Layer depth={0.35}>
        <Ridge seed={33} y={720} amp={300} color="#2a140c" gold={0.8} />
        {/* 朱漆暮色漫过 */}
        <rect x={-300} y={-300} width={2600} height={1700} fill="#9a2a18" opacity={sinkP * 0.25} />
      </Layer>
      <Layer depth={0.7}>
        <path d="M-300,1300 L-300,860 C300,820 900,880 1500,800 C1800,760 2000,780 2300,760 L2300,1300 Z" fill="#24120a" />
        <path d="M-300,860 C300,820 900,880 1500,800 C1800,760 2000,780 2300,760" stroke="url(#gold)" strokeWidth={2} fill="none" opacity={0.7} />
        {/* 鲧与押送者：向山深处走远、变小、没入暮色 */}
        <g opacity={1 - sinkP * 0.92}>
          <Puppet f={f} x={lerp(1050, 1420, led)} y={lerp(830, 760, led)} scale={lerp(1.2, 0.7, led)} facing={1} outfit="worker" seed={43}
            exprs={[[t0, 'sorrow']]} poses={[[0, 'bowLed']]} walk={{phase: (f - point) / 26, amt: f > point ? 0.6 : 0}}
            silhouette={sinkP > 0.4 ? '#5a160c' : undefined} />
          <Puppet f={f} x={lerp(930, 1300, led)} y={lerp(840, 765, led)} scale={lerp(1.25, 0.72, led)} facing={1} outfit="guard" seed={44}
            poses={[[0, {shR: 70, elR: 20}]]} walk={{phase: (f - point) / 26 + 0.3, amt: f > point ? 0.6 : 0}} silhouette={sinkP > 0.2 ? '#3a0e08' : undefined} />
        </g>
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={420} y={760} scale={1.7} facing={1} outfit="chiefMid" seed={12} exprs={[[t0, 'stern']]} wind={0.5}
          poses={[[0, 'stand'], [point - 6, {shR: 40, elR: 60, lean: -4}], [point, 'point']]} />
      </Layer>
      <Layer depth={1.4} blur={8}>
        <Grass f={f} x={-100} y={1120} w={900} h={200} color="#120806" seed={12} />
        <path d="M1500,1200 L1600,980 L1720,1010 L1800,940 L2000,1200 Z" fill="#100604" />
      </Layer>
    </Stage>
  );
};

/** 1-3 部落高台·清晨：甩镜跟舜转身，人群分开，禹接过新耒 */
export const S1_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(12), hand = cue(12, 'handout'), part = cue(13, 'part'), t1 = sEnd(13);
  const cam = camAt(f, [[t0, {z: 1.0, x: -260, focus: 1, dof: 3}], [part - 4, {z: 1.0, x: 80, focus: 1, dof: 3}], [t1, {z: 1.32, x: 140, y: 90, focus: 1, dof: 5}]]);
  const partP = prog(f, part - 6, part + 14, easeOut);
  const recv = f >= part;
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-3')} light={[1500, 250]} lightColor="#ffe0b0" lightAmt={0.3} f={f} />
        <Disc x={1520} y={260} r={80} color="#c8402a" glow="#ffb070" />
        <Ridge seed={51} y={600} amp={90} color="#47524e" gold={0.5} />
        {/* 远处干栏草屋群 */}
        {[0, 1, 2, 3, 4].map(i => <g key={i} transform={`translate(${200 + i * 380},${600}) scale(0.5)`}><Hut x={0} y={0} f={f} /></g>)}
      </Layer>
      <Layer depth={0.45}>
        <Platform x={360} y={820} w={760} h={240} color="#5a4a3a" />
        <Banner x={60} y={600} h={300} f={f} color="#7a2a20" icon="bird" />
        <Banner x={660} y={600} h={300} f={f} color="#7a2a20" icon="fish" />
      </Layer>
      <Layer depth={0.75}>
        <Puppet f={f} x={380} y={500} scale={1.25} facing={1} outfit="chiefMid" seed={12} exprs={[[t0, 'calm']]} wind={0.4}
          poses={[[t0, {lean: -10, head: -20, shR: -10}], [t0 + 6, 'stand'], [hand - 4, {shR: 50, elR: 40}], [hand, 'offerLow']]}
          hold={(wx, wy, ang) => f < part ? <g transform={`translate(${wx},${wy}) rotate(${ang - 90})`}><Lei x={0} y={40} s={0.55} /></g> : null} />
        <Crowd f={f} x={1150} y={880} n={11} spacing={70} scale={0.95} color="#2c3230" headTurn={f > hand ? -1 : 0} rows={2} part={partP} />
      </Layer>
      <Layer depth={1}>
        {f >= part - 8 && (
          <Puppet f={f} x={1130} y={720} scale={1.55} facing={-1} outfit="commoner" seed={21} exprs={[[part, 'shock'], [part + 2 * B, 'suppressed']]}
            poses={[[0, 'standTense'], [part, 'receive'], [part + 14, {shR: 150, elR: 150, head: 10}]]}
            hold={recv ? (wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><Lei x={0} y={70} s={0.6} /></g> : undefined}
            opacity={prog(f, part - 8, part)} />
        )}
      </Layer>
      <Layer depth={1.5} blur={9}>
        <Crowd f={f} x={1000} y={1200} n={9} spacing={170} scale={1.8} color="#1a1e1c" seed={9} part={partP * 1.4} />
      </Layer>
    </Stage>
  );
};

/** 1-4 小剧场·心里账：描金天平，左盘禾苗几乎不动，右盘砸进断耒+羽山 */
export const S1_4: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(14), sprout = cue(14, 'sprout'), drop = cue(15, 'drop'), t1 = sEnd(15);
  const cam = camAt(f, [[t0, {z: 1.1, x: 0, y: -40, r: -1.5, focus: 1, dof: 3}], [drop - 2, {z: 1.0, x: -30, y: 0, r: 0, focus: 1, dof: 3}], [t1, {z: 1.12, x: 140, y: 60, r: 2, focus: 1, dof: 3}]]);
  const leftDrop = springAt(f, sprout, {damping: 9, stiffness: 120});
  const rightDrop = springAt(f, drop, {damping: 7, stiffness: 160});
  const tilt = -3 * leftDrop + 24 * rightDrop + osc(f, 70) * 0.8;
  const shadowP = prog(f, drop + 4, t1, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('1-4')} light={[960, 60]} lightColor="#ffe8c0" lightAmt={0.26} f={f} />
        <path d="M800,-100 L1120,-100 L1460,1200 L460,1200 Z" fill="#fff0d0" opacity={0.05} />
        <Cloud x={160} y={240} s={1.4} color="#1e1814" opacity={0.7} /><Cloud x={1500} y={200} s={1.2} color="#1e1814" opacity={0.7} />
      </Layer>
      <Layer depth={0.7}>
        <Balance x={960} y={330} tilt={tilt} s={1.2}
          left={<g transform={`translate(0,${-40 + (1 - leftDrop) * -300})`} opacity={clamp(leftDrop * 3)}><path d="M0,0 L0,-50 M0,-30 q-20,-10 -26,-30 q20,4 26,24 M0,-40 q18,-12 24,-32 q-18,6 -24,26" stroke="#7fd09a" strokeWidth={5} fill="none" /></g>}
          right={<g transform={`translate(0,${-36 + (1 - rightDrop) * -400})`} opacity={f >= drop - 3 ? 1 : 0}><Lei x={-10} y={0} rot={70} s={0.5} broken /><path d="M10,-6 L40,-60 L58,-34 L72,-70 L96,-6 Z" fill="#3a1e12" stroke="url(#gold)" strokeWidth={2} /></g>} />
      </Layer>
      <Layer depth={1}>
        {/* 禹的影子被拉长成跪姿剪影 */}
        <g opacity={shadowP} transform={`translate(${900 + 330},1000) scale(2.3,${lerp(0.5, 1, shadowP) * 2.0})`}>
          <Puppet f={f} x={0} y={-90} scale={1} outfit="worker" poses={[[0, 'kneel']]} silhouette="#050302" noFilter />
        </g>
        <Puppet f={f} x={900} y={760} scale={2.3} facing={1} outfit="commoner" seed={21}
          exprs={[[t0, 'bitter'], [drop, 'anxious'], [drop + 2 * B, 'fear']]}
          poses={[[0, 'sitCross'], [drop, 'hugKnees']]} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={14} n={34} size={3} opacity={0.6} burstAt={drop} burstX={1240} burstY={620} />
      </Layer>
    </Stage>
  );
};

/** 1-5 治水工地·风雨年月：结绳记年 13 结，禹挖渠，衣服越来越破 */
export const S1_5: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(16), t1 = sEnd(16);
  const knots: number[] = screen(16).cueFrames.knots;
  const done = knots.filter(k => f >= k).length;
  const cam = camAt(f, [[t0, {z: 1.08, x: -60, focus: 1, dof: 3}], [t1, {z: 1.0, x: 60, y: -10, focus: 1, dof: 3}]]);
  const season = done / 13;
  const tint = ['#5a6e3a', '#7a6a2a', '#6a4a2a', '#4a5a6a'][Math.floor(season * 4) % 4];
  const dig = Math.floor((f - t0) / 10) % 2;
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-5')} light={[900, 200]} lightColor="#e8dcc0" lightAmt={0.18} f={f} />
        <rect x={-300} y={-300} width={2600} height={900} fill={tint} opacity={0.18} />
        <Ridge seed={61} y={560} amp={100} color="#4a3e2c" gold={0.5} />
        <Crowd f={f} x={1300} y={640} n={10} spacing={46} scale={0.4} color="#2a2216" />
      </Layer>
      <Layer depth={0.5}>
        <path d="M-300,1300 L-300,760 C400,730 1200,780 2300,740 L2300,1300 Z" fill="#3e3222" />
        <path d="M-200,880 C400,840 1100,900 2200,860" stroke="#5a7a86" strokeWidth={40} fill="none" opacity={0.7} />
        <path d="M-200,880 C400,840 1100,900 2200,860" stroke="url(#gold)" strokeWidth={2} fill="none" opacity={0.6} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={1150} y={720} scale={1.7} facing={-1} outfit="worker" seed={21} tatterExtra={season * 0.6}
          exprs={[[t0, 'grim']]} poses={[[0, dig ? 'digUp' : 'digDown'], ...Array.from({length: 12}).map((_, i) => [t0 + i * 10, i % 2 ? 'digDown' : 'digUp'] as [number, string])]}
          hold={(wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><Lei x={0} y={80} s={0.6} /></g>} />
        {[0, 1, 2].map(i => { const t = ((f - t0 + i * 7) % 20) / 20; return <circle key={i} cx={980 - t * 80 + i * 20} cy={880 - Math.sin(t * Math.PI) * 60} r={6} fill="#3a2a1a" opacity={1 - t} />; })}
      </Layer>
      <Layer depth={1.25} noBlur>
        <g transform="translate(60,250) scale(1.6)"><KnotRope f={f} x={0} y={0} w={760} knots={knots} /></g>
      </Layer>
      <Layer depth={1.5} blur={4}>
        <Rain f={f} n={110} opacity={0.45} slant={-0.2} speed={44} />
      </Layer>
    </Stage>
  );
};

/** 1-6 夜·禹家门外：走过茅屋、停步；手抬到草帘前又放下 */
export const S1_6: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(17), stop = cue(17, 'stop'), raise = cue(18, 'raise'), lower = cue(18, 'lower'), t1 = sEnd(18);
  const push = sStart(18);
  const cam = camAt(f, [[t0, {z: 1.0, x: 120, focus: 1, dof: 3}], [stop, {z: 1.04, x: 0, focus: 1, dof: 3}], [push, {z: 1.05, x: 0, focus: 1, dof: 3}], [push + 14, {z: 1.75, x: 120, y: 60, focus: 1, dof: 7}], [t1, {z: 1.85, x: 140, y: 70, focus: 1, dof: 7}]]);
  const walkP = prog(f, t0 - 6, stop, easeOut);
  const x = lerp(1700, 1180, walkP);
  const rack = f >= push ? Math.floor((f - push) / 12) % 2 : 0;
  return (
    <Stage cam={{...cam, focus: f >= push ? (rack ? 1 : 0.8) : cam.focus}}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-6')} light={[700, 520]} lightColor="#ffb060" lightAmt={0.14} f={f} />
        <Ridge seed={71} y={560} amp={120} color="#121a2c" gold={0.4} />
        <Cloud x={300} y={160} s={1.6} color="#1a2236" />
      </Layer>
      <Layer depth={0.5}>
        <Tree x={240} y={700} s={1.3} f={f} color="#162030" />
        <path d="M-300,1300 L-300,760 C400,740 1200,770 2300,750 L2300,1300 Z" fill="#0e1424" />
      </Layer>
      <Layer depth={0.8}>
        <Hut x={820} y={790} s={1.15} doorLight={0.9} f={f} curtain={f > raise && f < lower ? 0.3 : 0} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={x} y={640} scale={1.6} facing={-1} outfit="strawcape" seed={21}
          exprs={[[t0, 'tired'], [stop, 'struggle'], [lower, 'teary']]}
          walk={{phase: (f - t0) / 18, amt: 1 - prog(f, stop - 6, stop + 2)}}
          poses={[[0, 'stand'], [stop, {head: -18, lean: -2}], [raise - 4, {shR: 30, elR: 50, head: -14}], [raise, {...{lean: 2, shR: 72, elR: 38, head: -12}}], [lower, 'lowerHand']]} />
      </Layer>
      <Layer depth={1.4}>
        <Rain f={f} n={130} opacity={0.5} slant={-0.35} speed={46} />
      </Layer>
    </Stage>
  );
};

/** 1-7 回忆·屋内火塘：新婚的禹起身背耒出门；襁褓里的启啼哭，门外背影远去 */
export const S1_7: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(19), days = cue(19, 'days'), rise = cue(19, 'rise'), cry = cue(20, 'cry'), pb = cue(20, 'pullback'), t1 = sEnd(20);
  const cam = camAt(f, [[t0, {z: 1.08, x: 40, focus: 1, dof: 4}], [cry, {z: 1.12, x: -60, focus: 1, dof: 4}], [t1, {z: 0.95, x: 60, y: -20, focus: 1, dof: 4}]]);
  const leave = prog(f, rise + 10, cry - 4, easeInOut);
  const inside = f < cry - 4;
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('1-7')} light={[700, 640]} lightColor="#ffb060" lightAmt={0.42 + osc(f, 11) * 0.04} f={f} />
        {/* 草泥墙 + 门洞（门外雨夜） */}
        <path d="M-300,-300 L2300,-300 L2300,980 L-300,980 Z" fill="#4a2814" opacity={0.6} />
        {Array.from({length: 20}).map((_, i) => <path key={i} d={`M${-200 + i * 120},-200 L${-260 + i * 120},1000`} stroke="#2e180a" strokeWidth={3} opacity={0.4} />)}
        <path d="M1100,820 L1110,420 Q1180,380 1250,420 L1260,820 Z" fill="#101626" />
        <g style={{}}>
          <Rain f={f} n={20} opacity={0.5} />
        </g>
        {!inside && <Puppet f={f} x={1180} y={lerp(700, 640, prog(f, cry, t1))} scale={lerp(0.5, 0.3, prog(f, cry, t1))} facing={1} outfit="commoner" view="back" seed={21}
          walk={{phase: (f - cry) / 18, amt: 1}} silhouette="#05070c" />}
        <path d={`M1110,420 Q1180,380 1250,420 L${1252 + noise(f / 8) * 10},820 L1106,820 Z`} fill="#6a5430" opacity={0.25} />
        <Pot x={300} y={520} s={0.9} /><Pot x={1500} y={540} s={1.1} color="#2a1a10" />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,900 L2300,900 L2300,1300 Z" fill="#2a160a" />
        <Fire x={760} y={930} s={1.4} f={f} seed={3} />
        {/* 日纹：几枚描金小日轮匆匆亮灭（表示没过几天） */}
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={480} y={800} scale={1.5} facing={1} outfit="wife" seed={51}
          exprs={[[t0, 'sad'], [cry, 'worried']]} poses={[[0, 'holdBaby']]}
          hold={f >= cry - 10 ? (wx, wy) => (
            <g transform={`translate(${wx - 30},${wy - 10})`}>
              <ellipse cx={0} cy={0} rx={28} ry={18} fill="#c8b48a" stroke="url(#gold)" strokeWidth={2} />
              <circle cx={22} cy={-6} r={12} fill="#e8b890" stroke="url(#gold)" strokeWidth={1.5} />
              <ellipse cx={26} cy={-2} rx={3} ry={2 + Math.abs(osc(f, 12)) * 3} fill="#5a1410" />
              <path d="M18,-10 l3,2 M26,-10 l3,2" stroke="#1a0e08" strokeWidth={1.4} />
            </g>
          ) : undefined} />
        {inside && f >= t0 - 6 && (
          <Puppet f={f} x={lerp(900, 1180, leave)} y={lerp(820, 740, leave)} scale={lerp(1.55, 1.0, leave)} facing={1} outfit="commoner" seed={21}
            exprs={[[t0, 'guilty']]} poses={[[0, 'rise'], [rise, 'stand'], [rise + 8, 'holdLei']]}
            walk={{phase: (f - rise) / 18, amt: f > rise + 8 ? 1 : 0}}
            hold={f > rise + 6 ? (wx, wy, ang) => <g transform={`translate(${wx},${wy}) rotate(${ang - 180})`}><Lei x={0} y={70} s={0.6} /></g> : undefined} />
        )}
      </Layer>
      <Layer depth={1.4} blur={7}>
        <Pot x={1700} y={1100} s={2.2} color="#1c0e06" />
        {[0, 1, 2, 3, 4, 5].map(i => { const t = ((f * 1.3 + i * 17) % 50) / 50; return <circle key={i} cx={760 + noise(f / 10 + i) * 80} cy={900 - t * 500} r={3 * (1 - t)} fill="#ffcf80" opacity={1 - t} />; })}
      </Layer>
    </Stage>
  );
};

/** 1-8 河道俯拍（沙盘）：鲧堵→堤裂；禹疏→金线支渠；河底石胚被水流磨成圭形 */
export const S1_8: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(21), rise = cue(21, 'rise'), dis = cue(22, 'dissolve'), ch = cue(22, 'channels'), t1 = sEnd(22);
  const cam = camAt(f, [[t0, {z: 1.2, x: -200, y: -60, r: -6, focus: 1, dof: 2}], [dis, {z: 1.0, x: 0, y: 0, r: -2, focus: 1, dof: 2}], [t1, {z: 1.06, x: 120, y: 20, r: 3, focus: 1, dof: 2}]]);
  const flood = f < dis ? prog(f, t0, dis, easeOut) : 1 - prog(f, dis, ch + 2 * B);
  const damA = f < dis ? 1 : 1 - prog(f, dis, dis + 10);
  const chans = f >= ch ? (f - ch) / B + 0.4 : 0;
  const formed = prog(f, ch, t1 + 6, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.5}>
        <SandTable f={f} land="#2c3a24" water="#2a5a66" dam={damA} flood={flood} channels={chans} flow={formed} figures={f < dis ? 'dam' : 'dig'} />
      </Layer>
      <Layer depth={0.8}>
        {/* 河底石胚：水流冲刷，推光一层层亮起，磨出圭形——贯穿物件长大成形 */}
        <g transform="translate(1180,600)">
          <ellipse cx={0} cy={0} rx={250} ry={300} fill="#1e4a56" opacity={0.6} />
          {[0, 1, 2].map(i => <ellipse key={i} cx={0} cy={0} rx={240 - i * 30 + osc(f, 30, i / 3) * 10} ry={290 - i * 36} fill="none" stroke="#a8dce6" strokeWidth={2} opacity={0.35} />)}
          <XuanGui f={f} x={0} y={0} h={lerp(300, 440, formed)} rot={lerp(-20, 0, formed)} id="g18" seed={6} st={{formed, glow: 0.3 + formed * 0.6, rim: 0.5 + formed}} />
          {f >= ch && Array.from({length: 5}).map((_, i) => { const t = ((f - ch) * 0.04 + i * 0.2) % 1; return <path key={i} d={`M${-200 + t * 400},${-260} q30,260 0,520`} stroke="#e6f6ff" strokeWidth={3} fill="none" opacity={0.25 * Math.sin(t * Math.PI)} />; })}
        </g>
      </Layer>
      <Layer depth={1.6} blur={10}>
        {[0, 1, 2].map(i => <ellipse key={i} cx={(i * 800 - f * 6) % 2600 + 300} cy={200 + i * 300} rx={360} ry={90} fill="#e8e4da" opacity={0.18} />)}
        {[0, 1, 2].map(i => { const x = (f * 5 + i * 300) % 2200 - 100; return <path key={'b' + i} d={`M${x},${300 + i * 60} q12,-10 24,0 q12,-10 24,0`} stroke="#1a1410" strokeWidth={4} fill="none" />; })}
      </Layer>
    </Stage>
  );
};

/** 1-9 高台·治水功成：玄圭出水，舜授圭给禹，描金线亮一周 */
export const S1_9: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(23), hand = cue(23, 'handoff'), t1 = sEnd(23);
  const [, endF] = sceneRange('1-9');
  const cam = camAt(f, [[t0 - 8, {z: 1.15, x: 60, y: -40, focus: 1, dof: 4}], [hand, {z: 1.05, x: 0, y: 0, focus: 1, dof: 4}], [t1 + 50, {z: 0.92, x: -40, y: 30, focus: 1, dof: 4}]]);
  const rise = prog(f, t0 - 8, hand - 4, easeOut);
  const given = springAt(f, hand, {damping: 13, stiffness: 120});
  const guiX = lerp(lerp(960, 900, rise), 1020, given), guiY = lerp(lerp(900, 470, rise), 500, given);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('1-9')} light={[960, 100]} lightColor="#ffe0a0" lightAmt={0.36} f={f} />
        <path d="M760,-100 L1160,-100 L1500,1200 L420,1200 Z" fill="#ffe8c0" opacity={0.07} />
        <Crowd f={f} x={960} y={760} n={22} spacing={70} scale={0.5} color="#3a120c" headTurn={0} rows={2} />
        {[200, 460, 1460, 1720].map((x, i) => <Fire key={i} x={x} y={640} s={0.55} f={f} seed={i + 30} logs={false} />)}
      </Layer>
      <Layer depth={0.5}>
        <Platform x={960} y={1060} w={1500} h={260} color="#5a2018" />
        <Banner x={240} y={820} h={420} f={f} color="#6e1a12" icon="sun" />
        <Banner x={1680} y={820} h={420} f={f} color="#6e1a12" icon="bird" />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={760} y={640} scale={1.6} facing={1} outfit="chiefMid" seed={12} exprs={[[t0, 'smile']]} wind={0.3}
          poses={[[0, 'stand'], [t0, 'offer'], [hand + 6, 'stand']]} />
        <Puppet f={f} x={1260} y={660} scale={1.6} facing={-1} outfit="clean" seed={21} exprs={[[t0, 'tired'], [hand, 'relief']]}
          poses={[[0, 'standTense'], [hand - 4, 'receive'], [hand + 10, {shR: 60, elR: 60, shL: 50, elL: 60, head: 14, lean: 6}]]} />
        <XuanGui f={f} x={guiX} y={guiY} h={250} rot={lerp(0, -8, given)} id="g19" st={{glow: 0.7, rim: 1 + clamp(1 - Math.abs(f - hand) / 12) * 0.9}} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={19} n={50} size={3.4} opacity={0.8} burstAt={hand} burstX={1020} burstY={500} />
      </Layer>
    </Stage>
  );
};

/** 画面内文字：只在左侧（地名牌、人物印、演绎印） */
export const S1_TAGS: React.FC<{f: number}> = ({f}) => {
  const vis = (id: string) => { const [a, b] = sceneRange(id); return f >= a && f < b; };
  return (
    <>
      {vis('0-4') && <PlaceTag f={f} text="禹" at={sStart(6) + 4} kind="seal" />}
      {vis('1-1') && <PlaceTag f={f} text="大河" at={sStart(9) + 10} />}
      {vis('1-2') && <PlaceTag f={f} text="羽山" at={sStart(11) + 6} />}
      {vis('1-4') && <PlaceTag f={f} text="演绎" at={sStart(14) + 4} kind="seal" />}
      {vis('1-7') && [0, 1, 2].map(i => {
        const at = cue(19, 'days') + i * B;
        const on = f >= at && f < at + B * 1.2;
        return on ? <div key={i} style={{position: 'absolute', left: 90 + i * 80, top: 160, width: 56, height: 56, borderRadius: 28, border: '3px solid #e2b65c', background: 'radial-gradient(#ffd27a, #b8742a)', boxShadow: '0 0 18px #ffb84a', opacity: 1 - (f - at) / (B * 1.2)}} /> : null;
      })}
    </>
  );
};
