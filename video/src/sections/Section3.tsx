import React from 'react';
import {Stage, Layer, camAt} from '../components/Camera';
import {LacquerBackdrop, Ridge, GoldDust, Cloud, Qiangjin, Tihong, Cracks, crackPaths} from '../lacquer/Materials';
import {Puppet, Crowd} from '../components/puppet/Puppet';
import {Fire, Grass, Banner, Pot, Tree, Disc} from '../components/Props';
import {SealIcon, LacquerCard, Footprint, Candle, BambooScroll, JadeBi, Silk, Panel, Torch} from '../components/Props2';
import {XuanGui} from '../components/XuanGui';
import {cue, sStart, sEnd, sceneBase, castExpr} from '../lib/timeline';
import {prog, springAt, keys, clamp, lerp, osc, noise, easeOut, easeIn, easeInOut, mulberry32, shade} from '../lib/anim';
import {BEAT_FRAMES} from '../data/beats';

const B = BEAT_FRAMES;

/** 3-1 漆印流程图：三枚漆印依次盖下（让位/躲开/等诸侯），复制出舜那一代，描金箭头连成流程 */
export const S3_1: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(39), s1 = cue(39, 's1'), s2 = cue(39, 's2'), s3 = cue(39, 's3'), link = cue(40, 'link'), t1 = sEnd(40);
  const cam = camAt(f, [[t0, {z: 1.08, x: -60, focus: 1, dof: 2}], [link, {z: 1.0, x: 0, focus: 1, dof: 2}], [t1 + 8, {z: 0.96, x: 40, y: -20, focus: 1, dof: 2}]]);
  const stamp = (at: number) => { const p = springAt(f, at, {damping: 11, stiffness: 220}); return {s: f < at ? 0 : 2.2 - 1.2 * p, o: f < at ? 0 : clamp((f - at) / 2)}; };
  const row2 = prog(f, link, link + 18, easeOut);
  const kinds: ('hands' | 'walk' | 'torch')[] = ['hands', 'walk', 'torch'];
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('3-1')} light={[960, 300]} lightColor="#ffd8b0" lightAmt={0.22} f={f} />
        {/* 戗金回纹地 */}
        {Array.from({length: 12}).map((_, i) => <path key={i} d={`M${-100 + i * 180},80 l40,0 l0,40 l-20,0 l0,-20`} stroke="url(#gold)" strokeWidth={1.4} fill="none" opacity={0.35} />)}
        {Array.from({length: 12}).map((_, i) => <path key={'b' + i} d={`M${-100 + i * 180},1000 l40,0 l0,-40 l-20,0 l0,20`} stroke="url(#gold)" strokeWidth={1.4} fill="none" opacity={0.35} />)}
      </Layer>
      <Layer depth={0.6}>
        {/* 第二排：舜那一代（较小、较旧） */}
        <g opacity={row2} transform={`translate(0,${(1 - row2) * 40})`}>
          {kinds.map((k, i) => <SealIcon key={i} x={560 + i * 400} y={740} s={0.6} kind={k} rot={-4 + i * 3} />)}
          {[0, 1].map(i => <Qiangjin key={i} d={`M${640 + i * 400},740 L${880 + i * 400},740`} progress={row2} w={3} />)}
          {kinds.map((_, i) => <Qiangjin key={'v' + i} d={`M${560 + i * 400},530 L${560 + i * 400},690`} progress={prog(f, link + 6, link + 20)} w={2} />)}
        </g>
      </Layer>
      <Layer depth={1}>
        {[s1, s2, s3].map((at, i) => { const st = stamp(at); return <g key={i} opacity={st.o} transform={`translate(${560 + i * 400},430) scale(${st.s}) translate(${-560 - i * 400},-430)`}><SealIcon x={560 + i * 400} y={430} s={1.05} kind={kinds[i]} /></g>; })}
        {[0, 1].map(i => <Qiangjin key={i} d={`M${660 + i * 400},430 L${860 + i * 400},430 m-20,-14 l20,14 l-20,14`} progress={prog(f, link, link + 10)} w={4} glow />)}
        {/* 玄圭停在流程图上方，圭面浮出三枚小印 */}
        <XuanGui f={f} x={lerp(1900, 1450, prog(f, link - 6, link + 14, easeOut))} y={200} h={170} rot={90} id="g31" st={{glow: 0.6, rim: 1.2}} />
        {f >= link + 10 && [0, 1, 2].map(i => <rect key={i} x={1400 + i * 30} y={190} width={18} height={18} fill="#a8281e" stroke="url(#gold)" strokeWidth={1.4} opacity={prog(f, link + 10 + i * 4, link + 16 + i * 4)} />)}
      </Layer>
      <Layer depth={1.4} blur={5}>
        <GoldDust f={f} seed={39} n={36} size={3} opacity={0.6} burstAt={s1} burstX={560} burstY={430} />
      </Layer>
    </Stage>
  );
};

/** 3-2a 推演：三张漆牌；老首领牌被戗金划掉；候选人自己走出牌面；第三张牌发光 */
export const S3_2a: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(41), c1 = cue(41, 'card1'), strike = cue(41, 'strike'), c2 = cue(42, 'card2'), leave = cue(42, 'leave'), glow = cue(42, 'glow'), t1 = sEnd(42);
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: -260, focus: 1, dof: 3}], [c2 - 2, {z: 1.04, x: -200, focus: 1, dof: 3}], [c2 + 10, {z: 1.04, x: 60, focus: 1, dof: 3}], [t1 + 6, {z: 1.1, x: 260, focus: 1, dof: 3}]]);
  const f1 = prog(f, c1, c1 + 10, easeInOut), f2 = prog(f, c2, c2 + 10, easeInOut);
  const lv = prog(f, leave, leave + 30, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('3-2a')} light={[960, 160]} lightColor="#e8ffe8" lightAmt={0.18} f={f} />
        <Cloud x={200} y={160} s={1.3} color="#24483e" /><Cloud x={1500} y={200} s={1.1} color="#24483e" />
      </Layer>
      <Layer depth={0.6}>
        {/* 漆案 */}
        <path d="M-200,820 L2120,820 L2200,1100 L-280,1100 Z" fill="#1c140e" filter="url(#lqObj)" />
        <path d="M-200,820 L2120,820" stroke="url(#gold)" strokeWidth={3} />
        <Pot x={120} y={810} s={1.1} /><Pot x={1820} y={810} s={1.0} />
      </Layer>
      <Layer depth={1}>
        <LacquerCard x={560} y={560} flip={f1}>
          <Puppet f={f} x={0} y={-30} scale={1.15} outfit="chief" seed={11} silhouette="#e2c27a" noFilter exprs={[[0, 'sad']]} />
          <Qiangjin d="M-120,-180 L120,180" progress={prog(f, strike, strike + 8, easeOut)} w={8} glow />
        </LacquerCard>
        <LacquerCard x={960} y={560} flip={f2}>
          <g opacity={1 - lv} transform={`translate(${lv * -260},0)`}>
            <Puppet f={f} x={0} y={-30} scale={1.15} outfit="clean" seed={21} silhouette="#e2c27a" noFilter walk={{phase: (f - leave) / 16, amt: f > leave ? 1 : 0}} />
          </g>
        </LacquerCard>
        <LacquerCard x={1360} y={560} flip={0} glow={prog(f, glow - 4, glow + 8) * (1 + osc(f, 12) * 0.3)} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={41} n={24} size={3} opacity={0.5} />
      </Layer>
    </Stage>
  );
};

/** 3-2b 俯视·千万脚印：各部落不同纹样的脚印从四方涌来，汇成箭头指向中心 */
export const S3_2b: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(43), t1 = sEnd(43);
  const cam = camAt(f, [[t0 - 6, {z: 1.6, focus: 1, dof: 2}], [t1 + 6, {z: 0.95, r: 4, focus: 1, dof: 2}]]);
  const g = prog(f, t0, t1, easeOut);
  const cols = ['#e2b65c', '#8ccbe0', '#e4553f', '#72c7a4', '#f3ebdd', '#c8a0e0'];
  return (
    <Stage cam={cam}>
      <Layer depth={0.5}>
        <LacquerBackdrop base={sceneBase('3-2b')} light={[960, 540]} lightColor="#ffe0b0" lightAmt={0.3} f={f} />
        {Array.from({length: 22}).map((_, i) => { const r = mulberry32(i + 500); return <ellipse key={i} cx={r() * 1920} cy={r() * 1080} rx={80 + r() * 160} ry={50 + r() * 90} fill={shade('#6B4226', (r() - 0.5) * 0.3)} opacity={0.7} />; })}
        {/* 六路脚印 */}
        {cols.map((c, k) => {
          const a = (k / 6) * Math.PI * 2 + 0.3;
          return Array.from({length: 16}).map((_, i) => {
            const t = i / 16;
            const on = g * 1.2 > t;
            if (!on) return null;
            const dist = lerp(900, 120, t);
            const x = 960 + Math.cos(a) * dist + (i % 2 ? 10 : -10) * Math.sin(a), y = 540 + Math.sin(a) * dist * 0.62 - (i % 2 ? 10 : -10) * Math.cos(a);
            return <Footprint key={k * 100 + i} x={x} y={y} rot={(a * 180) / Math.PI - 90} s={1.4} color={c} o={0.9} />;
          });
        })}
        {/* 中心人物（俯视） */}
        <g transform="translate(960,540)">
          <circle r={70 + osc(f, 20) * 6} fill="none" stroke="url(#gold)" strokeWidth={3} opacity={0.7} />
          <ellipse rx={26} ry={34} fill="#7a6a4c" stroke="url(#gold)" strokeWidth={2} />
          <circle r={14} fill="#1a1410" />
        </g>
      </Layer>
      <Layer depth={1.4} blur={8}>
        {[0, 1, 2].map(i => <ellipse key={i} cx={(i * 900 + f * 7) % 2600 - 300} cy={200 + i * 340} rx={300} ry={80} fill="#f0e6d6" opacity={0.12} />)}
      </Layer>
    </Stage>
  );
};

/** 3-3 战国·书房（夜）：韩非伏案刻简；烛火一跳，墙上大影压小影 */
export const S3_3: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(44), jump = cue(45, 'jump'), t1 = sEnd(45);
  const cam = camAt(f, [[t0 - 8, {z: 1.0, x: -120, focus: 1, dof: 4}], [jump - 4, {z: 1.15, x: 80, y: -20, focus: 1, dof: 4}], [t1 + 8, {z: 1.4, x: 300, y: -60, focus: 0.8, dof: 6}]]);
  const jp = f >= jump ? Math.exp(-(f - jump) / 6) : 0;
  const push = prog(f, jump, jump + 30, easeOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.2}>
        <LacquerBackdrop base={sceneBase('3-3')} light={[1320, 520]} lightColor="#ffc070" lightAmt={0.32 + jp * 0.4} f={f} />
        {/* 墙上的影子：大影压小影 */}
        <g opacity={0.55}>
          <Puppet f={f} x={lerp(900, 980, push)} y={540} scale={2.4} facing={1} outfit="king" silhouette="#120810" noFilter poses={[[0, 'stand'], [jump, 'pushPalm']]} />
          <Puppet f={f} x={lerp(1220, 1320, push)} y={600} scale={1.9} facing={-1} outfit="chief" silhouette="#120810" noFilter poses={[[0, 'stand'], [jump, {lean: -14, head: -10}]]} />
        </g>
        {/* 书架上的竹简卷 */}
        {[0, 1, 2, 3].map(i => <rect key={i} x={120 + i * 60} y={180} width={46} height={200} rx={20} fill="#8a6a3a" stroke="url(#gold)" strokeWidth={1.5} />)}
      </Layer>
      <Layer depth={0.7}>
        <path d="M-300,1300 L-300,860 L2300,860 L2300,1300 Z" fill="#24101a" />
        <rect x={300} y={830} width={900} height={40} fill="#3a1a12" stroke="url(#gold)" strokeWidth={2} filter="url(#lqObj)" />
        <BambooScroll x={360} y={600} n={16} open={prog(f, t0 - 10, t0 + 14)} s={0.9} />
        <Candle x={1320} y={860} s={1.6} f={f + Math.round(jp * 30)} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={760} y={760} scale={1.55} facing={-1} outfit="scholar" seed={71} exprs={[...castExpr(44, 'hanfei'), ...castExpr(45, 'hanfei')]}
          poses={[[0, 'writing'], ...Array.from({length: 8}).map((_, i) => [t0 + i * 10, i % 2 ? {lean: 20, shR: 56, elR: 64} : 'writing'] as [number, any]), [jump, {lean: 8, head: -6, shR: 30, elR: 80}]]}
          hold={(wx, wy, ang) => <path d={`M${wx},${wy} L${wx + Math.sin((ang * Math.PI) / 180) * 30},${wy + Math.cos((ang * Math.PI) / 180) * 30}`} stroke="#c8b080" strokeWidth={3} />} />
      </Layer>
      <Layer depth={1.4} blur={8}>
        <path d={`M1320,700 Q${1300 + noise(f / 10) * 40},500 ${1340 + noise(f / 14) * 60},200`} stroke="#d8c8b8" strokeWidth={10} fill="none" opacity={0.12} />
      </Layer>
    </Stage>
  );
};

/** 3-4 迷雾·两个版本：左板“双手相让”，右板“一手相推”，交替清晰；玄圭生出发丝细的断纹 */
export const S3_4: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(46), crack = cue(46, 'crack'), t1 = sEnd(46);
  const cam = camAt(f, [[t0 - 8, {z: 1.08, focus: 1, dof: 3}], [t1 + 8, {z: 0.98, x: 20, focus: 1, dof: 3}]]);
  const alt = 0.5 + 0.5 * Math.sin((f - t0) / 14);
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('3-4')} light={[960, 400]} lightColor="#f0f0e8" lightAmt={0.22} f={f} />
      </Layer>
      <Layer depth={0.6}>
        <g style={{filter: `blur(${(1 - alt) * 6}px)`}}>
          <Panel x={560} y={500} w={560} h={520} o={0.55 + alt * 0.45} color="#3a3430">
            <Puppet f={f} x={-110} y={60} scale={1.25} facing={1} outfit="chief" seed={11} exprs={[[0, 'smile']]} poses={[[0, 'offer']]} />
            <Puppet f={f} x={120} y={60} scale={1.25} facing={-1} outfit="clean" seed={21} exprs={[[0, 'relief']]} poses={[[0, 'bowDeep']]} />
          </Panel>
        </g>
        <g style={{filter: `blur(${alt * 6}px)`}}>
          <Panel x={1360} y={500} w={560} h={520} o={0.55 + (1 - alt) * 0.45} color="#2a1c1a">
            <Puppet f={f} x={-110} y={60} scale={1.25} facing={1} outfit="king" seed={22} exprs={[[0, 'stern']]} poses={[[0, 'pushPalm']]} />
            <Puppet f={f} x={130} y={60} scale={1.25} facing={-1} outfit="chief" seed={12} exprs={[[0, 'fear']]} poses={[[0, {lean: -16, head: -12, shR: 40, elR: 60}]]} />
          </Panel>
        </g>
      </Layer>
      <Layer depth={1}>
        <XuanGui f={f} x={lerp(300, 1600, prog(f, t0 - 8, t1 + 8))} y={860} h={200} rot={90} id="g34" st={{glow: 0.5, crack: f >= crack ? prog(f, crack, crack + 12, easeOut) * 0.4 : 0}} />
      </Layer>
      <Layer depth={1.5}>
        {[0, 1, 2, 3, 4].map(i => <ellipse key={i} cx={(i * 500 + f * (3 + i)) % 2600 - 300} cy={300 + (i % 3) * 260} rx={520} ry={120} fill="#e8e6e0" opacity={0.18} filter="url(#roughEdge)" />)}
      </Layer>
    </Stage>
  );
};

/** 3-5 涂山（禹为王后）：雾散山出；山道上各路首领举着图腾旗上山 */
export const S3_5: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(47), climb = cue(48, 'climb'), t1 = sEnd(48);
  const cam = camAt(f, [[t0 - 8, {z: 1.0, y: -60, focus: 0.7, dof: 2}], [climb, {z: 1.0, y: -30, focus: 0.7, dof: 2}], [t1 + 8, {z: 1.12, y: 120, x: 60, focus: 0.9, dof: 3}]]);
  const icons: ('bird' | 'fish' | 'sun')[] = ['bird', 'fish', 'sun'];
  return (
    <Stage cam={cam}>
      <Layer depth={0.1}>
        <LacquerBackdrop base={sceneBase('3-5')} light={[1400, 260]} lightColor="#ffb070" lightAmt={0.3} f={f} />
        <Disc x={1460} y={280} r={70} color="#d8703a" glow="#ffa860" />
      </Layer>
      <Layer depth={0.35}>
        <Ridge seed={141} y={700} amp={160} color="#3e2616" gold={0.5} />
      </Layer>
      <Layer depth={0.7}>
        <path d="M200,1300 L760,360 L860,330 L1500,1300 Z" fill="#2e1a0e" />
        <path d="M200,1300 L760,360 L860,330 L1500,1300" stroke="url(#gold)" strokeWidth={2.5} fill="none" />
        {/* 盘山道 */}
        <path d="M1300,1200 C1000,1100 700,1000 1000,860 C1200,760 900,640 820,420" stroke="#4a2c18" strokeWidth={26} fill="none" />
        {Array.from({length: 12}).map((_, i) => {
          const t = clamp(((f - climb) / 160 + i / 12) % 1);
          const pts = [[1300, 1200], [1000, 1080], [800, 990], [1000, 860], [1120, 760], [900, 620], [820, 440]];
          const k = t * (pts.length - 1), j = Math.min(pts.length - 2, Math.floor(k)), u = k - j;
          const x = lerp(pts[j][0], pts[j + 1][0], u), y = lerp(pts[j][1], pts[j + 1][1], u);
          return f >= climb - 20 ? <g key={i}><Banner x={x + 20} y={y} h={90} f={f} color={['#a8332a', '#2e6a5a', '#8a6a2a'][i % 3]} icon={icons[i % 3]} /><circle cx={x} cy={y - 10} r={10} fill="#1a0e06" /><path d={`M${x - 8},${y} L${x},${y - 30} L${x + 8},${y}Z`} fill="#1a0e06" /></g> : null;
        })}
        <Puppet f={f} x={810} y={250} scale={1.0} facing={1} outfit="king" seed={22} exprs={castExpr(47, 'yu')} poses={[[0, 'stand']]} wind={0.6}
          hold={(wx, wy) => <g transform={`translate(${wx + 6},${wy - 18})`}><XuanGui f={f} x={0} y={0} h={64} id="g35" st={{glow: 0.9, rim: 1.3}} /></g>} />
      </Layer>
      <Layer depth={1.5}>
        {/* 雾向两侧散开 */}
        <ellipse cx={lerp(700, -400, prog(f, t0 - 8, t0 + 30))} cy={600} rx={900} ry={400} fill="#d8ccc0" opacity={0.35 * (1 - prog(f, t0, t0 + 40))} filter="url(#roughEdge)" />
        <ellipse cx={lerp(1300, 2400, prog(f, t0 - 8, t0 + 30))} cy={560} rx={900} ry={400} fill="#d8ccc0" opacity={0.35 * (1 - prog(f, t0, t0 + 40))} filter="url(#roughEdge)" />
      </Layer>
    </Stage>
  );
};

/** 3-6 涂山·会盟场：首领依次献上玉璧、帛匹；队伍排到天边 */
export const S3_6: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(49), offer = cue(49, 'offer'), t1 = sEnd(49);
  const cam = camAt(f, [[t0 - 6, {z: 1.3, y: 40, focus: 1, dof: 3}], [t1 + 6, {z: 1.0, y: -20, focus: 0.8, dof: 3}]]);
  return (
    <Stage cam={cam}>
      <Layer depth={0.1}>
        <LacquerBackdrop base={sceneBase('3-6')} light={[960, 200]} lightColor="#ffd08a" lightAmt={0.32} f={f} />
        <Ridge seed={151} y={520} amp={60} color="#6a3a14" gold={0.5} />
      </Layer>
      <Layer depth={0.4}>
        <path d="M-300,1300 L-300,540 L2300,540 L2300,1300 Z" fill="#5a3010" />
        {/* 队伍排到天边：越远越小 */}
        {[0, 1, 2, 3, 4, 5].map(r => <Crowd key={r} f={f} x={960} y={600 + r * 50} n={24 - r * 2} spacing={70 - r * 6} scale={0.18 + r * 0.06} color={shade('#2a1608', r * 0.04)} seed={r + 40} />)}
      </Layer>
      <Layer depth={1}>
        {/* 台上的禹 */}
        <rect x={860} y={760} width={200} height={60} fill="#3a1e0a" stroke="url(#gold)" strokeWidth={2} filter="url(#lqObj)" />
        <Puppet f={f} x={960} y={660} scale={1.0} facing={1} outfit="king" seed={22} exprs={[[0, 'stern']]} poses={[[0, 'stand']]} />
        {/* 献礼的首领与玉帛 */}
        {[0, 1, 2, 3].map(i => {
          const side = i % 2 ? 1 : -1; const at = offer + i * 6;
          const p = prog(f, at, at + 20, easeOut);
          const x = 960 + side * (260 + Math.floor(i / 2) * 200);
          return (
            <g key={i}>
              <Puppet f={f} x={x} y={880} scale={1.1} facing={side > 0 ? -1 : 1} outfit={['chiefMid', 'guard', 'danzhu', 'yi'][i]} seed={80 + i} exprs={[[0, 'respect']]} poses={[[0, 'stand'], [at, 'offerLow']]} />
              {i % 2 ? <JadeBi x={lerp(x - side * 40, 960 + side * 70, p)} y={lerp(800, 790, p)} s={0.9} /> : <Silk x={lerp(x - side * 40, 960 + side * 70, p)} y={lerp(800, 790, p)} s={1} f={f} />}
            </g>
          );
        })}
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={49} n={40} size={3} opacity={0.6} />
        <Banner x={60} y={1150} h={500} f={f} color="#8a3020" icon="bird" />
      </Layer>
    </Stage>
  );
};

/** 3-6b 会稽山门（传说）：漆板翻出另一座山；防风氏气喘吁吁跑上山门 */
export const S3_6b: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(50), run = cue(50, 'run'), t1 = sEnd(50);
  const cam = camAt(f, [[t0 - 6, {z: 1.0, x: 120, focus: 1, dof: 3}], [t1 + 6, {z: 1.12, x: -60, focus: 1, dof: 3}]], 1.6);
  const rp = prog(f, run, t1 + 8, easeInOut);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('3-6b')} light={[600, 200]} lightColor="#d0e0d0" lightAmt={0.16} f={f} />
        <Cloud x={300} y={160} s={2} color="#1e3428" /><Cloud x={1300} y={220} s={1.6} color="#1e3428" />
        <Ridge seed={161} y={600} amp={180} color="#1c3024" gold={0.5} />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,820 C400,760 1200,800 2300,700 L2300,1300 Z" fill="#16261c" />
        {/* 石砌山门：两根立石 + 横石 */}
        <g transform="translate(1250,820)" filter="url(#lqObj)">
          <rect x={-200} y={-380} width={60} height={380} fill="#3e4a40" /><rect x={140} y={-380} width={60} height={380} fill="#3e4a40" />
          <rect x={-240} y={-420} width={480} height={50} fill="#4a564a" stroke="url(#gold)" strokeWidth={2} />
        </g>
        <Crowd f={f} x={1600} y={830} n={7} spacing={50} scale={0.55} color="#0e1a12" headTurn={-1} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={lerp(100, 900, rp)} y={lerp(800, 730, rp)} scale={1.75} facing={1} outfit="fangfeng" seed={91} exprs={castExpr(50, 'fangfeng')}
          walk={{phase: (f - run) / 11, amt: 1.3}} poses={[[0, {lean: 16}]]} />
      </Layer>
      <Layer depth={1.5} blur={8}>
        <Grass f={f} x={-200} y={1140} w={900} h={230} color="#0a140e" seed={51} />
      </Layer>
    </Stage>
  );
};

/** 3-7 会稽山顶：禹抬手下令；朱漆泼过，防风氏剪影倒下（不见血） */
export const S3_7: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(51), kill = cue(51, 'kill'), t1 = sEnd(51);
  const cam = camAt(f, [[t0, {z: 1.1, focus: 1, dof: 3}], [t1 + 6, {z: 1.0, x: -30, focus: 1, dof: 3}]], 1.4);
  const fall = prog(f, kill + 4, kill + 26, easeIn);
  const strobe = f >= kill && f < kill + 6 && (f - kill) % 3 === 0;
  return (
    <Stage cam={cam}>
      <Layer depth={0.15}>
        <LacquerBackdrop base={sceneBase('3-7')} light={[1300, 500]} lightColor="#ff4a2a" lightAmt={0.42} f={f} />
        <Disc x={1300} y={480} r={180} color="#8a1a10" glow="#ff3a1a" />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,860 L2300,860 L2300,1300 Z" fill="#0c0606" />
        <path d="M-300,860 L2300,860" stroke="url(#gold)" strokeWidth={2} opacity={0.6} />
      </Layer>
      <Layer depth={1}>
        <Puppet f={f} x={620} y={700} scale={1.8} facing={1} outfit="king" seed={22} exprs={castExpr(51, 'yu')} poses={[[0, 'stand'], [kill - 6, {shR: 100, elR: 60}], [kill, 'raiseHand']]} />
        <g transform={`rotate(${fall * 80} 1320 860)`} opacity={1 - fall * 0.3}>
          <Puppet f={f} x={1320} y={700} scale={1.9} facing={-1} outfit="fangfeng" seed={91} silhouette={f >= kill ? '#2a0806' : undefined} noFilter={f >= kill}
            exprs={castExpr(51, 'fangfeng')} poses={[[0, 'stand'], [kill, {lean: -20, head: -20, shR: 120, shL: 110}]]} />
        </g>
        {f >= kill && <g opacity={strobe ? 0.4 : 1}><Tihong d={`M2100,${-100} C1600,${200} 1200,${500} ${lerp(1900, 300, prog(f, kill, kill + 6, easeOut))},${lerp(200, 1100, prog(f, kill, kill + 6))} L2100,1200 Z`} layers={4} color="#b8281c" /></g>}
      </Layer>
    </Stage>
  );
};

/** 3-8 抽象·圭影：玄圭越变越大，影子盖住跪伏的首领群像；加花四拍描金边各亮一圈 */
export const S3_8: React.FC<{f: number}> = ({f}) => {
  const t0 = sStart(52), t1 = sEnd(53);
  const rs = ['r1', 'r2', 'r3', 'r4'].map(k => cue(53, k));
  const cam = camAt(f, [[t0, {z: 1.6, y: -200, focus: 1, dof: 3}], [t0 + 14, {z: 1.0, y: 0, focus: 1, dof: 3}], [t1 + 8, {z: 0.94, y: 20, focus: 1, dof: 3}]]);
  const grow = prog(f, t0, t1, easeInOut);
  const h = lerp(380, 1250, grow);
  const flash = rs.reduce((m, r) => (f >= r && f < r + 8 ? Math.max(m, 1 - (f - r) / 8) : m), 0);
  return (
    <Stage cam={cam}>
      <Layer depth={0.12}>
        <LacquerBackdrop base={sceneBase('3-8')} light={[960, 80]} lightColor="#d8e8ff" lightAmt={0.22} f={f} />
      </Layer>
      <Layer depth={0.6}>
        <path d="M-300,1300 L-300,860 L2300,860 L2300,1300 Z" fill="#1c2226" />
        {/* 圭影：随圭变大，越拖越长 */}
        <path d={`M960,860 L${960 - h * 0.22},1300 L${960 + h * 0.22},1300 Z`} fill="#000" opacity={0.5} transform={`scale(1,${0.6 + grow})`} style={{transformOrigin: '960px 860px'}} />
        <Crowd f={f} x={960} y={960} n={14} spacing={110} scale={0.85} color="#0e1214" kneel={1} rows={2} seed={53} />
      </Layer>
      <Layer depth={1}>
        <XuanGui f={f} x={960} y={860 - h * 0.48} h={h} id="g38" st={{glow: 0.4 + flash * 0.6, rim: 1 + flash, emblem: 1, crack: 0.4}} />
      </Layer>
      <Layer depth={1.4} blur={6}>
        <GoldDust f={f} seed={53} n={40} size={3} opacity={0.4 + flash * 0.5} />
      </Layer>
    </Stage>
  );
};
