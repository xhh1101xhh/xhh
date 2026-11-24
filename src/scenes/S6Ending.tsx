import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, GoldLine, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet, handWorld} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Boat, Cloud, Dust, Lighthouse, Moon, Rock, Stars, WaveBand} from '../components/props/sea';
import {Crab, DockPlanks, GlassCup} from '../components/props/extra';
import {Chair} from '../components/props/home';
import {GoldIrisClose} from '../components/transitions/Transitions';
import {ease, kf, noise1, prog, spr} from '../lib/anim';
import {roughRect} from '../lib/paper';
import {cue} from '../lib/timing';
import {DURATION_FRAMES} from '../data/beats';

const C = () => ({
  cut: cue('lightCut'), row: cue('friendRowHome'), goldDone: cue('chairGoldDone'), flower: cue('crabFlower'),
  refl: cue('reflectionTilt'), walk: cue('walkToEnd'), wide: cue('echoWide'), lift: cue('liftLantern'), iris: cue('goldIris'), glint: cue('finalGlint'),
});

const NightSky: React.FC<{frame: number; beam: number}> = ({frame, beam}) => (
  <g>
    <rect x={-1600} y={-1400} width={5200} height={3000} fill="url(#nightG)" />
    <defs>
      <linearGradient id="nightG" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0C0A0E" />
        <stop offset="70%" stopColor="#1E1612" />
        <stop offset="100%" stopColor="#2A1E14" />
      </linearGradient>
    </defs>
    <Stars frame={frame} area={[-1200, -1200, 4400, 1800]} n={130} seed={17} />
    {/* the lighthouse's gold beam sweeping the sky */}
    <g transform={`translate(1700 420) rotate(${200 + Math.sin(frame / 30) * 20})`} style={{mixBlendMode: 'screen'}} opacity={beam}>
      <path d="M 0 -20 L 2200 -260 L 2200 260 L 0 20 Z" fill="#E8B04B" opacity={0.28} />
    </g>
    <rect x={-1600} y={680} width={5200} height={1200} fill="#16120E" />
    <WaveBand y={680} amp={5} wl={240} frame={frame} speed={0.04} fill="#221A12" seed={39} x0={-1600} x1={3600} foam="#8A6A3A" />
  </g>
);

export const S6Ending: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // ── shot A: night dock, two chairs
  const hero = useRig('hero', frame, {poses: [{at: 0, pose: 'sit'}, {at: c.row, pose: {...base(), uaR: -150, faR: -30, uaL: 24, faL: -60, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}, stiff: 150, damp: 12}, {at: c.row + 30, pose: 'sit', stiff: 120, damp: 14}, {at: c.goldDone, pose: {...base(), lean: 4, head: 14, uaL: 24, faL: -60, uaR: -24, faR: 60, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}, stiff: 110, damp: 14}]});
  const goldT = prog(frame, c.cut, c.goldDone, ease.inOut);
  const flower = frame < c.flower ? 0 : spr(frame, c.flower, {damping: 9, stiffness: 140});
  const boatX = kf(frame, [[c.cut, 1500], [c.refl, 2100]], ease.in);
  const friendRow = useRig('friend', frame, {poses: [{at: 0, pose: 'wave'}], seed: 13});
  const chairOutline = 'M 1080 990 L 1080 840 L 1160 840 L 1160 990 M 1074 908 L 1166 908';
  const camA: Cam = {x: kf(frame, [[c.cut, 1000], [c.goldDone, 960], [c.goldDone + 12, 900]]), y: kf(frame, [[c.cut, 620], [c.goldDone + 12, 700]]), zoom: kf(frame, [[c.cut, 1.0], [c.goldDone, 1.05], [c.goldDone + 12, 1.35]], ease.inOut)};
  const shotA = (
    <Stage
      cam={camA}
      bg={<Backdrop top="#0C0A0E" bottom="#2A1E14" />}
      layers={[
        {depth: 0.3, node: <NightSky frame={frame} beam={1} />},
        {
          depth: 0.6,
          node: (
            <Boat x={boatX} y={720} s={0.5} frame={frame}>
              <g transform="translate(-20 -40) scale(0.6)">
                <Puppet {...friendRow} look="friend" frame={frame} uid="friendRow" x={0} y={0} scale={1} shadow={false} />
              </g>
            </Boat>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <DockPlanks x0={150} x1={1700} y={990} seed={17100} />
              <P d={roughRect(500, 700, 16, 300, 17101, 3, 1)} fill="#2A1E16" shadow={5} />
              <path d="M 508 720 q 30 0 30 26" fill="none" stroke="#8C8690" strokeWidth={6} />
              <g transform="translate(538 900) scale(0.5)">
                <Lantern frame={frame} id="nightLantern" flame={1} crack={1} gold={1} glow={1.1} />
              </g>
              <Chair x={860} y={990} s={0.9} />
              <Chair x={1120} y={990} s={0.9} />
              <GoldLine d={chairOutline} t={goldT} width={5} length={900} />
              <Puppet {...hero} look="hero" frame={frame} uid="heroNight" x={860} y={990} scale={1.2} />
              <GlassCup x={720} y={990} s={0.7} frame={frame} id="nightCup" />
              <g transform="translate(1400 990)">
                <Crab x={0} y={0} s={0.6} frame={frame} hide={0.3} crack={1} gold={1} flower={flower} />
              </g>
              <WaveBand y={1070} amp={12} wl={320} frame={frame} speed={0.08} fill="#2A2016" seed={46} foam="#8A6A3A" />
            </g>
          ),
        },
        {depth: 1.3, blur: 2, node: <Dust frame={frame} n={18} color="#E8B04B" seed={61} />},
      ]}
    />
  );

  // ── shot B: the sea reflection — both of them, each keeping their own colour
  const refl = (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #1A140E, #0E0B0A)'}}>
      <svg width={1920} height={1080}>
        <g transform={`translate(0 ${-prog(frame, c.refl, c.refl + 20, ease.out) * 60})`}>
          {/* reflection: flipped, rippled, warm */}
          <g transform="translate(0 260) scale(1 -1) translate(0 -1060)" opacity={0.85}>
            {Array.from({length: 9}, (_, i) => (
              <g key={i} transform={`translate(${noise1(frame * 0.08 + i, i) * 8} 0)`} clipPath={`url(#band${i})`}>
                <defs>
                  <clipPath id={`band${i}`}>
                    <rect x={0} y={420 + i * 70} width={1920} height={70} />
                  </clipPath>
                </defs>
                <Chair x={860} y={990} s={0.9} />
                <Chair x={1120} y={990} s={0.9} />
                <Puppet {...useRig('hero', frame, {poses: [{at: 0, pose: 'sit'}]})} look="hero" frame={frame} uid={`hr${i}`} x={860} y={990} scale={1.2} shadow={false} />
                <Puppet {...useRig('friend', frame, {poses: [{at: 0, pose: 'sit'}], seed: 13})} look="friend" frame={frame} uid={`fr${i}`} x={1120} y={990} scale={1.2} shadow={false} />
              </g>
            ))}
          </g>
          <rect x={0} y={0} width={1920} height={1080} fill="url(#reflTint)" style={{mixBlendMode: 'multiply'}} />
          <defs>
            <linearGradient id="reflTint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C89A5A" />
              <stop offset="100%" stopColor="#5A4030" />
            </linearGradient>
          </defs>
          {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-100 + ((i * 173 + frame * 2) % 2100)} ${200 + i * 60} q 40 -6 80 0`} stroke="#E8B04B" strokeWidth={3} fill="none" opacity={0.35} />)}
        </g>
      </svg>
    </AbsoluteFill>
  );

  // ── shot C: walking to the end of the dock with the lantern
  const walkX = (f: number) => kf(f, [[c.walk, 860], [c.wide - 4, 1460]], ease.inOut);
  const heroW = useRig('hero', frame, {poses: [{at: 0, pose: 'holdLanternL'}], x: walkX});
  const hW = handWorld(heroW.pose, -1, walkX(frame), 990, 1.2);
  const shotC = (
    <Stage
      cam={{x: walkX(frame) - 60, y: 640, zoom: 1.15}}
      bg={<Backdrop top="#0C0A0E" bottom="#2A1E14" />}
      layers={[
        {depth: 0.3, node: <NightSky frame={frame} beam={1} />},
        {
          depth: 1,
          node: (
            <g>
              <DockPlanks x0={150} x1={1800} y={990} seed={17100} />
              <Chair x={860} y={990} s={0.9} />
              <Chair x={1120} y={990} s={0.9} />
              <Puppet {...heroW} look="hero" frame={frame} uid="heroWalk" x={walkX(frame)} y={990} scale={1.2} />
              <g transform={`translate(${hW[0]} ${hW[1] + 236 * 0.5}) scale(0.5)`}>
                <Lantern frame={frame} id="walkLantern" flame={1} crack={1} gold={1} glow={1.1} swing={Math.sin(frame / 7) * 6} />
              </g>
              <WaveBand y={1070} amp={12} wl={320} frame={frame} speed={0.08} fill="#2A2016" seed={46} foam="#8A6A3A" />
            </g>
          ),
        },
      ]}
    />
  );

  // ── shot D/E: the opening composition again — but the light stays on, and he is the one who waves
  const heroD = useRig('hero', frame, {poses: [{at: 0, pose: 'holdLanternL'}, {at: c.lift - 4, pose: {...base(), uaL: 150, faL: -20, uaR: -14, faR: 8, head: -8}, stiff: 150, damp: 11}]});
  const DOCK = {x: 470, y: 760, s: 0.38};
  const hD = handWorld(heroD.pose, -1, DOCK.x, DOCK.y, DOCK.s);
  const lanternScreen = [hD[0], hD[1] + 236 * 0.2 - 120 * 0.2] as [number, number];
  const boatEndX = kf(frame, [[c.wide, 1900], [DURATION_FRAMES, 1250]], ease.out);
  const wide = (
    <Stage
      cam={{x: 960, y: 560, zoom: kf(frame, [[c.wide, 1.12], [c.iris, 1.0]], ease.out)}}
      bg={<Backdrop top="#08101F" bottom="#1C2E52" />}
      layers={[
        {
          depth: 0.25,
          node: (
            <g>
              <rect x={-1500} y={-2200} width={5000} height={3200} fill="url(#skyEnd)" />
              <defs>
                <linearGradient id="skyEnd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#070D1C" />
                  <stop offset="60%" stopColor="#101A30" />
                  <stop offset="100%" stopColor="#22365E" />
                </linearGradient>
              </defs>
              <Stars frame={frame} area={[-900, -1500, 3700, 1900]} n={140} />
              <Moon x={470} y={150} r={92} frame={frame} />
              <Cloud x={1500 - frame * 0.1} y={60} w={420} seed={12} fill="#1E2C50" />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <WaveBand y={680} amp={10} wl={300} frame={frame} speed={0.07} fill="#223A66" seed={41} foam="#6E8CC0" />
              <Rock x={1240} y={720} w={420} h={110} seed={51} />
              <Lighthouse x={1240} y={700} lampOn={1} beamAngle={-20 + Math.sin(frame / 18) * 18} frame={frame} beamColor="#FFD27A" />
              <DockPlanks x0={160} x1={560} y={765} seed={17200} />
              <Puppet {...heroD} look="hero" frame={frame} uid="heroEnd" x={DOCK.x} y={DOCK.y} scale={DOCK.s} />
              <g transform={`translate(${hD[0]} ${hD[1] + 236 * 0.2}) scale(0.2)`}>
                <Lantern frame={frame} id="endLantern" flame={1.1} crack={1} gold={1} glow={1.6} />
              </g>
              <Boat x={boatEndX} y={735} s={0.55} frame={frame} />
              <WaveBand y={760} amp={14} wl={340} frame={frame} speed={0.09} fill="#29467A" seed={61} foam="#8CA8D8" />
            </g>
          ),
        },
      ]}
    />
  );

  // ── assemble
  if (frame < c.refl - 8) return <AbsoluteFill>{shotA}<LightWash x={540} y={880} color="#E8B04B" strength={0.3} radius={700} /></AbsoluteFill>;
  if (frame < c.refl + 4) {
    // tilt down from the dock to its reflection
    const t = prog(frame, c.refl - 8, c.refl + 4, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `translateY(${-t * 1080}px)`}}>{shotA}</AbsoluteFill>
        <AbsoluteFill style={{transform: `translateY(${(1 - t) * 1080}px)`}}>{refl}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.walk - 8) return refl;
  if (frame < c.walk + 4) {
    const t = prog(frame, c.walk - 8, c.walk + 4, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `translateY(${t * 1080}px)`}}>{refl}</AbsoluteFill>
        <AbsoluteFill style={{transform: `translateY(${-(1 - t) * 1080}px)`}}>{shotC}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.wide - 10) return shotC;
  if (frame < c.wide + 6) {
    // crane up and out to the wide
    const t = prog(frame, c.wide - 10, c.wide + 6, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 - t * 0.5}) translateY(${t * 200}px)`}}>{shotC}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{wide}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.iris) return <AbsoluteFill>{wide}<LightWash x={380} y={120} color="#9DB4D9" strength={0.22} radius={1100} /></AbsoluteFill>;
  // 金光虹膜收: close onto the lantern he is holding up; the last glint is the BGM's final note
  return <GoldIrisClose frame={frame} from={c.iris} to={c.glint - 6} glint={c.glint} cx={lanternScreen[0] * 1.0 + (960 - 960)} cy={lanternScreen[1]}>{wide}</GoldIrisClose>;
};

const base = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
export {Glow};
