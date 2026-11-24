import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, GoldLine, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet, handWorld} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Boat, Cloud, Dust, Gull, Lighthouse, Rock, WaveBand} from '../components/props/sea';
import {BigEye, Crab, DockPlanks, FleetLight, GlassCup, OpenBook, PlantPot} from '../components/props/extra';
import {Chair} from '../components/props/home';
import {FlashCut} from '../components/transitions/Transitions';
import {clamp, ease, kf, prog, spr} from '../lib/anim';
import {rng, roughCircle, roughPoly, roughRect} from '../lib/paper';
import {cue, frameOf} from '../lib/timing';

const C = () => ({
  tear: cue('paperTear'), lever: cue('leverUp'), sweep: cue('goldSweep'), fleet: cue('fleetLights'),
  split: cue('splitDock'), close: cue('splitClose'), lift: cue('liftPart'), slip: cue('slip'), lean: cue('lean'),
  flash: cue('flashCut'), carry: cue('chairCarry'), down: cue('chairDown'), sit: cue('friendSit'), peek: cue('crabPeek2'),
  eye: cue('eyePush'), end: cue('lightCut'),
});

const DawnSky: React.FC<{frame: number; warm?: number}> = ({frame, warm = 1}) => (
  <g>
    <rect x={-1600} y={-1400} width={5200} height={3000} fill="url(#dawn)" />
    <defs>
      <linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#2A1C3A" />
        <stop offset="55%" stopColor="#6E3A1E" />
        <stop offset="80%" stopColor="#B8642A" />
        <stop offset="100%" stopColor="#E89A4A" />
      </linearGradient>
    </defs>
    <Glow cx={960} cy={660} r={700} color="#F2B36A" opacity={0.6 * warm} id="sunrise" />
    <P d={roughCircle(960, 690, 90, 16001, 2)} fill="#F2B36A" shadow={false} opacity={0.9} />
    <Cloud x={400 + frame * 0.2} y={260} w={380} seed={71} fill="#7A3E2A" />
    <Cloud x={1500 - frame * 0.15} y={180} w={340} seed={72} fill="#6A3424" />
    <rect x={-1600} y={680} width={5200} height={1200} fill="#5A2E22" />
    <WaveBand y={680} amp={6} wl={260} frame={frame} speed={0.05} fill="#7A3E26" seed={38} x0={-1600} x1={3600} foam="#E8A060" />
  </g>
);

export const S5Open: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // ── shot A: the tear — dawn balcony, kintsugi, lever up, beam bursts
  const heroA = useRig('hero', frame, {
    poses: [{at: 0, pose: 'pushUp'}, {at: c.tear + 10, pose: 'leverGrab', stiff: 170, damp: 13}, {at: c.lever - 5, pose: 'leverDown', stiff: 220, damp: 14}, {at: c.lever, pose: 'leverGrab', stiff: 300, damp: 10}, {at: c.lever + 14, pose: 'openArms', stiff: 120, damp: 12}],
  });
  const gold = prog(frame, c.tear, c.tear + 20, ease.inOut);
  const beam = prog(frame, c.lever, c.lever + 10, ease.out);
  const shards = rng(91);
  const shardList = Array.from({length: 16}, () => ({x: 200 + shards() * 1500, y: -100 - shards() * 300, r: shards() * 360, s: 30 + shards() * 60, v: 8 + shards() * 10}));
  const camA: Cam = {x: kf(frame, [[c.tear, 960], [c.lever, 1000], [c.sweep, 1060]]), y: kf(frame, [[c.tear, 580], [c.sweep, 560]]), zoom: kf(frame, [[c.tear, 1.1], [c.lever, 1.05], [c.lever + 6, 0.98], [c.sweep, 1.0]], ease.out)};
  const hA = handWorld(heroA.pose, 1, 860, 960, 1.45);
  const leverA = frame < c.tear + 10 ? 62 : frame < c.lever ? clamp((Math.atan2(hA[0] - 1030, -(hA[1] - 690)) * 180) / Math.PI, -30, 70) : -8 + 70 * Math.exp(-(frame - c.lever) / 2);
  const shotA = (
    <Stage
      cam={camA}
      bg={<Backdrop top="#2A1C3A" bottom="#8A4A22" />}
      layers={[
        {depth: 0.3, node: <DawnSky frame={frame} warm={0.6 + beam * 0.4} />},
        {
          depth: 0.7,
          node: (
            <g>
              <P d={roughRect(1150, -60, 520, 700, 16101, 6, 2)} fill="#4A2A2A" shadow={10} />
              <g transform="translate(1410 290)">
                {beam > 0 ? (
                  <g transform="rotate(-14)" style={{mixBlendMode: 'screen'}}>
                    <path d={`M 0 -120 L ${1500 * beam} -460 L ${1500 * beam} 460 L 0 120 Z`} fill="#FFE2A0" opacity={0.65} />
                  </g>
                ) : null}
                <Glow cx={0} cy={0} r={480} color="#FFE2A0" opacity={beam} id="lensDawn" />
                <P d={roughCircle(0, 0, 170, 16102, 2)} fill={beam > 0.1 ? '#FFE8B0' : '#5A4A6A'} shadow={8} />
                {[140, 108, 76, 44].map((r) => <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={beam > 0.1 ? '#E2B865' : '#4A3A5A'} strokeWidth={6} opacity={0.8} />)}
              </g>
              <P d={roughRect(1016, 690, 28, 230, 16103, 4, 1)} fill="#2E2A30" shadow={6} />
              <g transform={`translate(1030 690) rotate(${leverA})`}>
                <P d={roughRect(-7, -200, 14, 200, 16104, 4, 1)} fill="#5A5560" shadow={5} />
                <P d={roughCircle(0, -202, 15, 16105, 1)} fill="#C2443F" shadow={3} />
              </g>
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <Puppet {...heroA} look="hero" frame={frame} uid="heroDawn" x={860} y={960} scale={1.45} />
              <g transform="translate(560 960) scale(0.62)">
                <Lantern frame={frame} id="dawnLantern" flame={0.5 + gold * 0.6} cold={1 - gold} crack={1} gold={gold} glow={0.6 + gold * 0.6} />
              </g>
              <g transform="translate(400 960)">
                <Crab x={0} y={0} s={0.7} frame={frame} hide={1 - gold * 0.6} crack={1} gold={gold} />
              </g>
              {/* dome shards falling away */}
              {shardList.map((p, i) => {
                const t = frame - c.tear;
                if (t < 0 || t > 50) return null;
                return <P key={i} d={roughPoly([[0, -p.s], [p.s * 0.8, 0], [0, p.s * 0.6], [-p.s * 0.7, 0]], 16200 + i, 2)} fill={i % 3 ? '#ECE6D8' : '#3F6FA8'} shadow={4} transform={`translate(${p.x} ${p.y + t * p.v + t * t * 0.3}) rotate(${p.r + t * 8})`} opacity={1 - t / 50} />;
              })}
            </g>
          ),
        },
        {depth: 1.25, node: <g><P d={roughRect(-400, 860, 2800, 18, 16301, 4, 1.4)} fill="#3A1E18" shadow={8} />{Array.from({length: 26}, (_, i) => <rect key={i} x={-380 + i * 110} y={876} width={10} height={300} fill="#3A1E18" />)}</g>},
      ]}
    />
  );

  // ── shot B: lighthouse wide, fleet lights on every beat, gold sweep covers the costume change
  const batches = [0, 1, 2, 3].map((i) => frameOf(`C:2.${i + 1}`));
  const fr = rng(55);
  const fleet = Array.from({length: 24}, (_, i) => ({x: -200 + fr() * 2300, y: 690 + fr() * 30, b: i % 4, seed: i}));
  const sweepT = prog(frame, c.sweep - 4, c.sweep + 10, ease.inOut);
  const shotB = (
    <Stage
      cam={{x: kf(frame, [[c.sweep, 1100], [c.split, 960]]), y: 520, zoom: kf(frame, [[c.sweep, 1.15], [c.split, 0.92]], ease.out)}}
      bg={<Backdrop top="#2A1C3A" bottom="#6E3A1E" />}
      layers={[
        {depth: 0.3, node: <DawnSky frame={frame} />},
        {
          depth: 0.6,
          node: (
            <g>
              {fleet.map((p, i) => <FleetLight key={i} x={p.x} y={p.y} t={frame < batches[p.b] ? 0 : spr(frame, batches[p.b], {damping: 10, stiffness: 160})} seed={p.seed} frame={frame} />)}
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <WaveBand y={760} amp={10} wl={300} frame={frame} speed={0.07} fill="#6A3424" seed={42} foam="#F2B36A" />
              <Rock x={1240} y={780} w={460} h={120} seed={16401} fill="#3A2028" top="#4A2A30" />
              <Lighthouse x={1240} y={760} lampOn={1} beamAngle={-24 + Math.sin(frame / 16) * 22} frame={frame} beamColor="#FFE2A0" />
              {[0, 1, 2, 3, 4, 5].map((i) => <Gull key={i} x={1100 + i * 60 + (frame - c.sweep) * (2 + i * 0.4)} y={500 - i * 30 - (frame - c.sweep) * (1 + i * 0.2)} s={0.8} frame={frame} seed={i} />)}
              <WaveBand y={860} amp={16} wl={360} frame={frame} speed={0.1} fill="#7A3E26" seed={43} foam="#F2B36A" />
            </g>
          ),
        },
      ]}
    />
  );
  const sweepOverlay = sweepT > 0 && sweepT < 1 ? (
    <AbsoluteFill style={{background: `linear-gradient(100deg, transparent ${sweepT * 120 - 30}%, rgba(255,226,160,0.75) ${sweepT * 120 - 10}%, transparent ${sweepT * 120 + 10}%)`, mixBlendMode: 'screen'}} />
  ) : null;

  // ── shot C: split — top: alone on the dock reading; bottom: the friend's boat docking; then they close together
  const closeT = prog(frame, c.close - 10, c.close, ease.inOut);
  const heroC = useRig('hero', frame, {poses: [{at: 0, pose: 'read'}, {at: c.close - 6, pose: 'wave', stiff: 180, damp: 12}]});
  const boatCX = kf(frame, [[c.split, 2200], [c.close - 8, 1300]], ease.out);
  const dockBg = (cam: Cam, withBoat: boolean, withHero: boolean, boatX: number) => (
    <Stage
      cam={cam}
      bg={<Backdrop top="#5A3020" bottom="#7A4A2A" />}
      layers={[
        {depth: 0.3, node: <DawnSky frame={frame} />},
        {
          depth: 1,
          node: (
            <g>
              <DockPlanks x0={200} x1={1100} y={980} seed={16500} />
              {withHero ? (
                <g>
                  <Chair x={700} y={980} s={0.9} />
                  <Puppet {...heroC} look="hero" frame={frame} uid="heroDock5" x={700} y={980} scale={1.2} propR={frame < c.close - 6 ? <OpenBook x={-20} y={0} s={0.6} /> : undefined} />
                </g>
              ) : null}
              {withBoat ? (
                <Boat x={boatX} y={1000} s={1.0} frame={frame}>
                  <g transform="translate(-20 -40) scale(0.6)">
                    <Puppet {...useRig('friend', frame, {poses: [{at: 0, pose: 'wave'}], seed: 13})} look="friend" frame={frame} uid="friendDock5" x={0} y={0} scale={1} shadow={false} />
                  </g>
                </Boat>
              ) : null}
              <WaveBand y={1060} amp={14} wl={340} frame={frame} speed={0.1} fill="#7A3E26" seed={44} foam="#F2B36A" />
            </g>
          ),
        },
      ]}
    />
  );
  const split = (
    <AbsoluteFill style={{background: '#3A2014'}}>
      {/* bottom: the boat docking (no hero here, so he never appears twice) */}
      <AbsoluteFill style={{clipPath: 'inset(540px 0 0 0)', opacity: Math.max(0, 1 - closeT * 3)}}>{dockBg({x: 1300, y: 343, zoom: 0.7}, true, false, boatCX)}</AbsoluteFill>
      {/* top: alone on the dock; at the close the top frame opens down over the whole screen */}
      <AbsoluteFill style={{clipPath: `inset(0 0 ${540 - closeT * 540}px 0)`}}>{dockBg({x: 760 + closeT * 200, y: 1080 - closeT * 440, zoom: 0.7 + closeT * 0.25}, closeT > 0.34, true, 1300)}</AbsoluteFill>
      {closeT < 1 ? <AbsoluteFill><svg width={1920} height={1080}><P d={roughRect(-40, 528 + closeT * 540, 2000, 24, 16601, 4, 3)} fill="#2A140C" shadow={6} /></svg></AbsoluteFill> : null}
    </AbsoluteFill>
  );
  const merged = dockBg({x: kf(frame, [[c.close, 960], [c.lift - 1, 1000]]), y: 640, zoom: 0.95}, true, true, 1300);

  // ── shot D: carrying the heavy lamp part; it slips; the friend catches the other end
  const heroD = useRig('hero', frame, {poses: [{at: 0, pose: 'carry'}, {at: c.slip - 2, pose: {...base(), lean: 14, head: 10, uaL: 120, faL: -40, uaR: -170, faR: 40, squash: 0.92}, stiff: 260, damp: 11}, {at: c.lean, pose: {...base(), lean: 8, head: 14, uaL: 150, faL: -60, uaR: -150, faR: 60}, stiff: 140, damp: 13}]});
  const friendDX = (f: number) => kf(f, [[c.lift, 1700], [c.slip, 1700], [c.slip + 8, 1230]], ease.out);
  const friendD = useRig('friend', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.slip, pose: 'carry', stiff: 220, damp: 12}], x: friendDX, seed: 13});
  const partTilt = frame < c.slip ? -4 : frame < c.slip + 8 ? -4 + 30 * Math.sin(prog(frame, c.slip, c.slip + 8) * Math.PI / 2) : 26 - 26 * spr(frame, c.slip + 8, {damping: 10, stiffness: 160});
  const shotD = (
    <Stage
      cam={{x: kf(frame, [[c.lift, 960], [c.slip, 1000], [c.lean, 1040]]), y: 560, zoom: kf(frame, [[c.lift, 1.0], [c.slip + 2, 1.08], [c.lean, 1.12]], ease.out)}}
      bg={<Backdrop top="#4A2A1A" bottom="#7A4A2A" />}
      layers={[
        {depth: 0.35, node: <DawnSky frame={frame} />},
        {
          depth: 1,
          node: (
            <g>
              <P d={roughPoly([[300, 1080], [380, -200], [700, -200], [780, 1080]], 16701, 3)} fill="#E8DCC6" shadow={10} />
              {[0, 1, 2].map((i) => <P key={i} d={roughRect(330 + i * 6, 700 - i * 300, 420 - i * 14, 90, 16702 + i, 2, 2)} fill="#B9473C" shadow={false} />)}
              <rect x={-200} y={990} width={2400} height={200} fill="#3A2418" />
              <Puppet {...heroD} look="hero" frame={frame} uid="heroCarry" x={900} y={990} scale={1.35} />
              {frame >= c.slip ? <Puppet {...friendD} look="friend" frame={frame} uid="friendCarry" x={friendDX(frame)} y={990} scale={1.3} /> : null}
              {/* the heavy lens part between their hands */}
              <g transform={`translate(1040 ${990 - 340 * 1.35 + 30}) rotate(${partTilt})`}>
                <P d={roughCircle(0, 0, 110, 16710, 2)} fill="#E2B865" shadow={8} />
                {[80, 52, 26].map((r) => <circle key={r} cx={0} cy={0} r={r} fill="none" stroke="#B8893A" strokeWidth={6} />)}
              </g>
            </g>
          ),
        },
      ]}
    />
  );

  // ── shot E/F/G: his own world on the dock; the second chair arrives; the friend sits
  const chairXAt = (f: number) => kf(f, [[c.carry - 10, 1900], [c.down - 4, 1180]], ease.out);
  const heroEX = (f: number) => kf(f, [[c.flash, 700], [c.carry - 6, 700], [c.carry + 6, 1500], [c.down - 4, 1180], [c.down + 10, 900], [c.sit - 8, 700]], ease.inOut);
  const heroE = useRig('hero', frame, {
    poses: [{at: 0, pose: 'handsHips'}, {at: c.carry, pose: 'carry', stiff: 180, damp: 13}, {at: c.down - 2, pose: 'land', stiff: 300, damp: 11}, {at: c.down + 10, pose: 'tidy', stiff: 140, damp: 13}, {at: c.sit, pose: 'sit', stiff: 150, damp: 14}],
    x: heroEX,
  });
  const chairDown = frame >= c.down;
  const chairGold = prog(frame, c.down, c.down + 26, ease.inOut);
  const friendEX = (f: number) => kf(f, [[c.sit - 12, 1900], [c.sit + 8, 1180]], ease.out);
  const friendE = useRig('friend', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.sit + 8, pose: 'sit', stiff: 160, damp: 14}], x: friendEX, seed: 13});
  const peek = frame < c.peek ? 1 : 1 - spr(frame, c.peek, {damping: 11, stiffness: 160});
  const chairOutline = (x: number, y: number) => `M ${x - 40} ${y} L ${x - 40} ${y - 150} L ${x + 40} ${y - 150} L ${x + 40} ${y} M ${x - 46} ${y - 82} L ${x + 46} ${y - 82}`;
  const camE: Cam = {
    x: kf(frame, [[c.flash, 960], [c.carry, 980], [c.down, 1040], [c.sit, 1000]]),
    y: kf(frame, [[c.flash, 560], [c.down, 600], [c.sit, 620]]),
    zoom: kf(frame, [[c.flash, 0.95], [c.carry, 1.0], [c.down - 1, 1.05], [c.down + 3, 1.12], [c.sit, 1.15], [c.eye, 1.2]], ease.out),
  };
  const dockWorld = (
    <Stage
      cam={camE}
      bg={<Backdrop top="#6A3E22" bottom="#9A6A34" />}
      layers={[
        {depth: 0.3, node: <DawnSky frame={frame} />},
        {
          depth: 1,
          node: (
            <g>
              <DockPlanks x0={150} x1={1700} y={990} seed={16800} />
              {/* his world: books, the kintsugi lantern, a plant, the crab */}
              {[0, 1, 2].map((i) => <P key={i} d={roughRect(260, 960 - i * 26, 110 - i * 8, 24, 16810 + i, 3, 1)} fill={['#9E3A2E', '#3F6FA8', '#C9A040'][i]} shadow={3} />)}
              <g transform="translate(450 990) scale(0.55)">
                <Lantern frame={frame} id="dockLantern" flame={1} crack={1} gold={1} glow={0.9} />
              </g>
              <PlantPot x={1500} y={990} s={0.8} frame={frame} />
              <g transform="translate(1600 990)">
                <Crab x={0} y={0} s={0.6} frame={frame} hide={peek} crack={1} gold={1} />
              </g>
              <Chair x={700} y={990} s={0.9} />
              {/* the second chair: carried in, set down, traced in gold */}
              {frame >= c.carry - 10 ? (
                chairDown ? (
                  <g>
                    <Chair x={1180} y={990} s={0.9} />
                    <GoldLine d={chairOutline(1180, 990)} t={chairGold} width={5} length={900} />
                  </g>
                ) : (
                  <g transform={`translate(${chairXAt(frame)} 640) rotate(-8)`}>
                    <Chair x={0} y={0} s={0.9} />
                  </g>
                )
              ) : null}
              {frame >= c.sit - 12 ? <Puppet {...friendE} look="friend" frame={frame} uid="friendSit" x={friendEX(frame)} y={990} scale={1.2} /> : null}
              <Puppet {...heroE} look="hero" frame={frame} uid="heroWorld" x={heroEX(frame)} y={990} scale={1.2} />
              <WaveBand y={1070} amp={12} wl={320} frame={frame} speed={0.1} fill="#7A3E26" seed={45} foam="#F2B36A" />
            </g>
          ),
        },
        {depth: 1.3, blur: 2, node: <Dust frame={frame} n={20} color="#FFE2A0" seed={51} />},
      ]}
    />
  );
  const talk = frame >= c.sit + 6 && frame < c.eye ? (
    <AbsoluteFill>
      <svg width={1920} height={1080}>
        {[0, 1, 2].map((i) => {
          const k = ((frame - c.sit) / 8 + i) % 3;
          return <path key={i} d={`M ${420 + i * 34} ${330 - k * 10} q 12 -14 24 0 q 12 14 24 0`} fill="none" stroke="#F3EBDD" strokeWidth={5} strokeLinecap="round" opacity={0.7 - k * 0.2} />;
        })}
      </svg>
    </AbsoluteFill>
  ) : null;

  // ── shot H: into the friend's eye — his laugh, reflected
  const eyeT = prog(frame, c.eye, c.eye + 30, ease.inOut);
  const heroR = useRig('hero', frame, {poses: [{at: 0, pose: 'openArms'}]});
  const eyeShot = (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, #A06A34, #6A3E1E 70%)'}}>
      <svg width={1920} height={1080}>
        <g transform={`translate(960 500) scale(${1 + eyeT * 0.25}) translate(-960 -500)`}>
          <P d={roughCircle(960, 520, 520, 16901, 4, 20)} fill="#EBC09A" shadow={false} />
          <BigEye cx={960} cy={500} r={250}>
            <g transform="translate(960 560)" opacity={0.85}>
              <Puppet {...heroR} look="hero" frame={frame} uid="heroReflect" x={0} y={0} scale={0.42} shadow={false} />
            </g>
          </BigEye>
          <path d="M 640 300 Q 960 180 1280 300" fill="none" stroke="#1E1820" strokeWidth={26} strokeLinecap="round" />
        </g>
      </svg>
    </AbsoluteFill>
  );

  // ── assemble
  if (frame < c.sweep - 10) return shotA;
  if (frame < c.sweep + 6) {
    const t = prog(frame, c.sweep - 10, c.sweep + 6, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 - t * 0.3})`}}>{shotA}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{shotB}</AbsoluteFill>
        {sweepOverlay}
      </AbsoluteFill>
    );
  }
  if (frame < c.split - 8) return <AbsoluteFill>{shotB}{sweepOverlay}</AbsoluteFill>;
  if (frame < c.split + 4) {
    const t = prog(frame, c.split - 8, c.split + 4, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t}}>{shotB}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{split}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.close) return split;
  if (frame < c.lift - 8) return merged;
  if (frame < c.lift) {
    const t = prog(frame, c.lift - 8, c.lift, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `translateX(${-t * 400}px)`}}>{merged}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t, transform: `translateX(${(1 - t) * 400}px)`}}>{shotD}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.flash - 6) return shotD;
  if (frame < c.flash + 8) return <FlashCut frame={frame} at={c.flash} cx={1040} cy={420} outgoing={shotD} incoming={dockWorld} />;
  if (frame < c.eye - 8) return <AbsoluteFill>{dockWorld}{talk}</AbsoluteFill>;
  if (frame < c.eye + 4) {
    const t = prog(frame, c.eye - 8, c.eye + 4, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 + t * 2})`, transformOrigin: '1180px 640px'}}>{dockWorld}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{eyeShot}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return eyeShot;
};

const base = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
export {GlassCup, LightWash};
