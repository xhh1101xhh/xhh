import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Boat, Cloud, Dust, Rock, WaveBand} from '../components/props/sea';
import {Crab, DarkArrow, Dome, DockPlanks, GlassCup, OpenBook, Thermometer, Thermos} from '../components/props/extra';
import {Chair} from '../components/props/home';
import {WhipPan} from '../components/transitions/Transitions';
import {clamp, ease, kf, prog, spr} from '../lib/anim';
import {roughRect} from '../lib/paper';
import {cue} from '../lib/timing';

const C = () => ({
  flip: cue('mirrorFlip'), split: cue('mirrorSplit'), spin: cue('heroSpin'),
  thermo: cue('thermoShow'), approach: cue('boatApproach'), soup: cue('soupOffer'), rope: cue('ropeToss'),
  whip: cue('whipPan'), bump: cue('boatBump'), retreat: cue('retreatShell'),
  dome: cue('domeGrow'), arrows: cue('arrows'), warm: cue('warmBounce'),
  crack: cue('lanternCrack'), notice: cue('emberNotice'), up: cue('lookUp'), end: cue('paperTear'),
});

const FogSky: React.FC<{frame: number; top?: string; bottom?: string}> = ({frame, top = '#1A1228', bottom = '#3A3350'}) => (
  <g>
    <rect x={-1600} y={-1200} width={5200} height={2800} fill="url(#fogsky)" />
    <defs>
      <linearGradient id="fogsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={top} />
        <stop offset="100%" stopColor={bottom} />
      </linearGradient>
    </defs>
    <Cloud x={300 + frame * 0.3} y={160} w={420} seed={61} fill="#3A3354" opacity={0.8} />
    <Cloud x={1500 - frame * 0.25} y={90} w={380} seed={62} fill="#342E4C" opacity={0.8} />
    <rect x={-1600} y={660} width={5200} height={1200} fill="#241E36" />
    <WaveBand y={660} amp={5} wl={240} frame={frame} speed={0.04} fill="#2C2642" seed={37} x0={-1600} x1={3600} />
  </g>
);

/** fog banks drifting in front (screen space-ish) */
const Fog: React.FC<{frame: number; k?: number}> = ({frame, k = 1}) => (
  <g opacity={0.35 * k}>
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((frame * (0.8 + i * 0.4) + i * 700) % 2800) - 400} cy={700 + i * 120} rx={700} ry={90} fill="#7C86A8" style={{filter: 'blur(30px)'}} />
    ))}
  </g>
);

export const S4Shell: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // ── hero rig for the dock shots (coat after the spin)
  const heroXAt = (f: number) => kf(f, [[c.thermo, 900], [c.retreat - 6, 900], [c.retreat + 6, 820]], ease.inOut);
  const hero = useRig('hero', frame, {
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.spin + 8, pose: 'crossArms', stiff: 140, damp: 13},
      {at: c.soup, pose: {...base(), lean: -8, head: -6, uaL: 22, faL: -118, uaR: -60, faR: -40}, stiff: 220, damp: 12},
      {at: c.soup + 16, pose: 'crossArms', stiff: 140, damp: 13},
      {at: c.rope, pose: {...base(), lean: -6, head: 8, uaL: 22, faL: -118, uaR: -30, faR: 20}, stiff: 200, damp: 12},
      {at: c.bump, pose: 'stepBack', stiff: 260, damp: 11},
      {at: c.retreat, pose: 'hugKnees', stiff: 200, damp: 13},
    ],
    x: heroXAt,
  });
  const spinK = Math.abs(Math.cos(Math.PI * prog(frame, c.spin - 8, c.spin + 8, ease.inOut)));
  const thermoLvl = 0.12 + (frame >= c.soup ? 0.25 * spr(frame, c.soup, {damping: 9, stiffness: 220}) : 0) + (frame >= c.rope ? 0.25 * spr(frame, c.rope, {damping: 9, stiffness: 220}) : 0) + (frame >= c.retreat ? 0.4 * spr(frame, c.retreat, {damping: 10, stiffness: 200}) : 0);
  const thermoIn = frame < c.thermo ? 0 : spr(frame, c.thermo, {damping: 12, stiffness: 150});
  const boil = frame >= c.retreat ? prog(frame, c.retreat, c.retreat + 16, ease.out) : 0;
  const shellS = 0.9 + (frame >= c.soup ? 0.45 * spr(frame, c.soup + 2, {damping: 8, stiffness: 200}) : 0) + (frame >= c.rope ? 0.45 * spr(frame, c.rope + 2, {damping: 8, stiffness: 200}) : 0) + (frame >= c.retreat ? 1.0 * spr(frame, c.retreat, {damping: 9, stiffness: 160}) : 0);
  const boatXAt = (f: number) => kf(f, [[c.approach - 10, 2300], [c.soup - 8, 1340], [c.bump - 6, 1340], [c.bump, 1250], [c.bump + 8, 1300]], ease.out);
  const friend = useRig('friend', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.soup - 6, pose: 'reachHook', stiff: 160, damp: 13}, {at: c.rope - 4, pose: {...base(), uaR: -150, faR: -40, lean: -6}, stiff: 240, damp: 12}, {at: c.rope + 10, pose: 'stand', stiff: 140, damp: 13}], seed: 13});
  const heroHidden = prog(frame, c.retreat + 4, c.retreat + 14);

  // ── shot A (slam) + shot B (mirror split)
  const xray = (
    <Stage
      cam={{x: 1100, y: 560, zoom: kf(frame, [[c.flip, 1.15], [c.split, 1.25]])}}
      bg={<Backdrop top="#140E22" bottom="#1E1530" />}
      layers={[
        {depth: 0.4, node: <FogSky frame={frame} top="#140E22" bottom="#2A2040" />},
        {
          depth: 1,
          node: (
            <g>
              <Puppet {...useRig('hero', frame, {poses: [{at: 0, pose: 'stand'}], outfit: 'cardigan'})} look="hero" frame={frame} uid="heroX" x={1350} y={1000} scale={1.4} />
              {/* X-ray: the ember inside a porcelain shell */}
              <g transform={`translate(1350 ${1000 - 166 * 1.4})`}>
                <Glow cx={0} cy={0} r={140} color="#FFC870" opacity={0.5} id="xrayEmber" />
                <g transform="translate(36 70) scale(0.55)">
                  <Crab x={0} y={0} frame={frame} hide={1} shell={1 + 0.06 * Math.sin(frame / 6)} />
                </g>
              </g>
            </g>
          ),
        },
        {depth: 1.3, node: <Fog frame={frame} />},
      ]}
    />
  );
  const mirrorT = prog(frame, c.split - 8, c.split + 6, ease.inOut);
  const strangerSide = (
    <Stage
      cam={{x: 960, y: 600, zoom: 1.0}}
      bg={<Backdrop top="#241E36" bottom="#2E2842" />}
      layers={[
        {depth: 0.4, node: <FogSky frame={frame} top="#241E36" bottom="#3A3456" />},
        {
          depth: 1,
          node: (
            <g>
              <Chair x={480} y={1000} />
              <Puppet {...useRig('stranger', frame, {poses: [{at: 0, pose: 'read'}], outfit: 'stranger', seed: 21})} look="stranger" frame={frame} uid="stranger" x={480} y={1000} scale={1.25} propR={<OpenBook x={-20} y={0} s={0.6} />} />
              <Glow cx={480} cy={1000 - 166 * 1.25 + 40} r={150} color="#FFC870" opacity={0.6} id="strangerEmber" />
            </g>
          ),
        },
      ]}
    />
  );
  const heroSide = (
    <Stage
      cam={{x: 960, y: 600, zoom: 1.0}}
      bg={<Backdrop top="#140E22" bottom="#1E1530" />}
      layers={[
        {depth: 0.4, node: <FogSky frame={frame} />},
        {
          depth: 1,
          node: (
            <g>
              <g transform={`translate(1440 0) scale(${Math.max(0.04, spinK)} 1) translate(-1440 0)`}>
                <Puppet {...hero} look="hero" frame={frame} uid="heroM" x={1440} y={1000} scale={1.25} />
              </g>
              <g transform={`translate(${1440 + 30} ${1000 - 166 * 1.25 + 60}) scale(0.5)`}>
                <Crab x={0} y={0} frame={frame} hide={1} />
              </g>
            </g>
          ),
        },
      ]}
    />
  );
  const mirror = (
    <AbsoluteFill>
      <AbsoluteFill style={{clipPath: 'inset(0 0 0 960px)'}}>{heroSide}</AbsoluteFill>
      <AbsoluteFill style={{clipPath: 'inset(0 960px 0 0)', transform: `scaleX(${mirrorT})`, transformOrigin: '960px 50%'}}>{strangerSide}</AbsoluteFill>
      <AbsoluteFill>
        <svg width={1920} height={1080}>
          <P d={roughRect(950, -20, 20, 1120, 15001, 4, 2)} fill="#C9C3D8" shadow={6} />
        </svg>
      </AbsoluteFill>
    </AbsoluteFill>
  );

  // ── shots C/D/E: the dock in fog (one world, camera moves; whip at c.whip)
  const camDock = (f: number): Cam => ({
    x: kf(f, [[c.thermo, 1150], [c.soup - 6, 1150], [c.soup + 6, 1100], [c.whip, 1100], [c.whip + 1, 1060], [c.retreat + 20, 1000]], ease.inOut),
    y: kf(f, [[c.thermo, 600], [c.soup + 6, 620], [c.whip + 1, 640], [c.retreat + 20, 600]], ease.inOut),
    zoom: kf(f, [[c.thermo, 0.95], [c.soup - 6, 0.95], [c.soup + 6, 1.2], [c.whip, 1.22], [c.whip + 1, 1.45], [c.retreat, 1.45], [c.retreat + 20, 1.1]], ease.inOut),
  });
  const dockWorld = (cam: Cam) => (
    <Stage
      cam={cam}
      bg={<Backdrop top="#1E1832" bottom="#3A3350" />}
      layers={[
        {depth: 0.35, node: <FogSky frame={frame} />},
        {
          depth: 1,
          node: (
            <g>
              <DockPlanks x0={300} x1={1180} y={1000} seed={15100} />
              <Rock x={420} y={1040} w={420} h={120} seed={15110} fill="#1E1A2C" top="#2A2440" />
              {/* the shell behind the hero grows each time someone comes close */}
              <g transform={`translate(${heroXAt(frame) - 60} 1000)`}>
                <Crab x={0} y={0} s={shellS} frame={frame} hide={1} />
              </g>
              <g opacity={1 - heroHidden} transform={`translate(${heroHidden * -40} ${heroHidden * 20})`}>
                <Puppet {...hero} look="hero" frame={frame} uid="heroDock" x={heroXAt(frame)} y={1000} scale={1.2} />
              </g>
              <Boat x={boatXAt(frame)} y={1010} s={1.1} frame={frame} tilt={frame >= c.bump && frame < c.bump + 14 ? -6 * Math.exp(-(frame - c.bump) / 5) : 0}>
                <g transform="translate(-20 -40) scale(0.6)">
                  <Puppet {...friend} look="friend" frame={frame} uid="friendBoat" x={0} y={0} scale={1} shadow={false}
                    propR={frame >= c.soup - 6 && frame < c.rope ? <Thermos x={0} y={0} s={1.2} frame={frame} /> : undefined} />
                </g>
              </Boat>
              {frame >= c.rope && frame < c.rope + 30 ? (
                <path d={`M ${boatXAt(frame) - 60} 900 Q ${(boatXAt(frame) + heroXAt(frame)) / 2} ${780 + prog(frame, c.rope, c.rope + 20) * 260} ${heroXAt(frame) + 40 + prog(frame, c.rope + 10, c.rope + 26) * 80} ${880 + prog(frame, c.rope + 10, c.rope + 26) * 220}`} fill="none" stroke="#C9A060" strokeWidth={6} />
              ) : null}
            </g>
          ),
        },
        {depth: 1.3, node: <Fog frame={frame} />},
      ]}
    />
  );
  const thermoLayer = (
    <AbsoluteFill style={{transform: `translateX(${(1 - thermoIn) * -360}px)`}}>
      <svg width={1920} height={1080}>
        <Thermometer x={190} y={760} level={thermoLvl} s={1.0} boil={boil} />
      </svg>
    </AbsoluteFill>
  );

  // ── shots F/G: the dome over the island, seen from outside
  const domeT = frame < c.dome ? 0 : spr(frame, c.dome, {damping: 14, stiffness: 90});
  const arrowAt = [c.arrows, c.arrows + 16, c.arrows + 32];
  const camDome: Cam = {x: kf(frame, [[c.dome, 960], [c.warm - 6, 960], [c.warm + 10, 1160]], ease.inOut), y: kf(frame, [[c.dome, 540], [c.warm + 10, 600]], ease.inOut), zoom: kf(frame, [[c.dome - 10, 1.3], [c.dome + 20, 0.9], [c.warm - 6, 0.92], [c.warm + 10, 1.25]], ease.inOut)};
  const beamT = prog(frame, c.warm, c.warm + 30, ease.inOut);
  const domeWorld = (
    <Stage
      cam={camDome}
      bg={<Backdrop top="#0E0A18" bottom="#160F24" />}
      layers={[
        {depth: 0.3, node: <FogSky frame={frame} top="#0E0A18" bottom="#1E1630" />},
        {
          depth: 1,
          node: (
            <g>
              <Rock x={960} y={760} w={700} h={140} seed={15201} fill="#1A1626" top="#26203A" />
              <Dome cx={960} cy={760} r={520} t={domeT} />
              {arrowAt.map((a, i) => {
                if (frame < a - 12) return null;
                const t = prog(frame, a - 12, a, (u) => u);
                const back = frame >= a ? prog(frame, a, a + 14, ease.out) : 0;
                const sx = i % 2 ? 1 : -1;
                const tx = 960 + sx * (1500 - 1060 * t) + sx * back * 300;
                const ty = 300 + i * 90 - back * 160;
                return <DarkArrow key={i} x={tx} y={ty} rot={sx > 0 ? 180 + back * 120 : back * -120} s={1.4} opacity={1 - back} />;
              })}
              {/* friend's warm light slides off the dome */}
              <Boat x={1640} y={790} s={0.9} frame={frame}>
                <g transform="translate(-20 -40) scale(0.5)">
                  <Puppet {...friend} look="friend" frame={frame} uid="friendDome" x={0} y={0} scale={1} shadow={false} />
                </g>
              </Boat>
              {frame >= c.warm ? (
                <g style={{mixBlendMode: 'screen'}} opacity={0.8}>
                  <path d={`M 1720 700 L ${1720 - 360 * Math.min(1, beamT * 2)} ${700 - 60 * Math.min(1, beamT * 2)}`} stroke="#FFC870" strokeWidth={34} strokeLinecap="round" opacity={0.5} />
                  {beamT > 0.5 ? <path d={`M 1360 640 L ${1360 + 200 * (beamT - 0.5) * 2} ${640 - 380 * (beamT - 0.5) * 2}`} stroke="#FFC870" strokeWidth={26} strokeLinecap="round" opacity={0.5 * (1.4 - beamT)} /> : null}
                </g>
              ) : null}
            </g>
          ),
        },
      ]}
    />
  );

  // ── shot H: inside the dome
  const heroIn = useRig('hero', frame, {poses: [{at: 0, pose: 'hugKnees'}, {at: c.notice, pose: {...base(), lean: 10, head: 22, uaL: 40, faL: -100, uaR: -40, faR: 100, thighK: 0.3, y: 70, thL: 30, shL: -150, thR: -30, shR: 150, squash: 0.96}, stiff: 120, damp: 14}, {at: c.up, pose: 'sitLookUp', stiff: 160, damp: 12}]});
  const crackT = prog(frame, c.crack, c.crack + 8, ease.out);
  const emberT = frame < c.notice ? 0.15 : 0.15 + 0.85 * spr(frame, c.notice, {damping: 12, stiffness: 120});
  const [ex, ey] = [900, 1000 - 166 * 1.3 + 70];
  const inside = (
    <Stage
      cam={{x: kf(frame, [[c.crack - 16, 1000], [c.up, 920]]), y: kf(frame, [[c.crack - 16, 700], [c.up, 680]]), zoom: kf(frame, [[c.crack - 16, 1.0], [c.up, 1.3]], ease.inOut)}}
      bg={<Backdrop top="#08060E" bottom="#120C1C" />}
      layers={[
        {
          depth: 0.5,
          node: (
            <g>
              <path d="M -400 1000 A 1400 1100 0 0 1 2400 1000 Z" fill="#1A1428" />
              {Array.from({length: 12}, (_, i) => <path key={i} d={`M ${-200 + i * 220} 980 Q ${-100 + i * 220} 400 ${960} -100`} fill="none" stroke="#2A2440" strokeWidth={4} opacity={0.6} />)}
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <rect x={-400} y={1000} width={2800} height={400} fill="#0E0A16" />
              <g transform="translate(1180 1000) scale(0.75)">
                <Lantern frame={frame} id="domeLantern" flame={0.35} cold={0.8} glow={0.5} crack={crackT} />
              </g>
              <Puppet {...heroIn} look="hero" frame={frame} uid="heroIn" x={900} y={1000} scale={1.3} />
              <Glow cx={ex} cy={ey} r={60 + emberT * 180} color="#FFC870" opacity={emberT} id="insideEmber" />
            </g>
          ),
        },
      ]}
    />
  );

  // ── assemble along time
  if (frame < c.split - 8) return xray;
  if (frame < c.thermo - 10) return mirror;
  if (frame < c.thermo) {
    const t = prog(frame, c.thermo - 10, c.thermo, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{dockWorld(camDock(frame))}</AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 + t * 0.3})`}}>{mirror}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.whip - 8) return <AbsoluteFill>{dockWorld(camDock(frame))}{thermoLayer}</AbsoluteFill>;
  if (frame < c.whip + 6)
    return (
      <AbsoluteFill>
        <WhipPan frame={frame} at={c.whip} outgoing={dockWorld(camDock(Math.min(frame, c.whip - 1)))} incoming={dockWorld({...camDock(frame), x: camDock(frame).x - 120})} />
        {thermoLayer}
      </AbsoluteFill>
    );
  if (frame < c.dome - 10) return <AbsoluteFill>{dockWorld({...camDock(frame), x: camDock(frame).x - 120})}{thermoLayer}</AbsoluteFill>;
  if (frame < c.dome + 4) {
    const t = prog(frame, c.dome - 10, c.dome + 4, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 - t * 0.35})`}}>{dockWorld({...camDock(frame), x: camDock(frame).x - 120})}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{domeWorld}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.crack - 16) return <AbsoluteFill>{domeWorld}<LightWash x={1700} y={700} color="#FFC870" strength={frame >= c.warm ? 0.2 : 0} radius={600} /></AbsoluteFill>;
  if (frame < c.crack - 6) {
    const t = prog(frame, c.crack - 16, c.crack - 6, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 + t * 0.8})`, transformOrigin: '960px 640px'}}>{domeWorld}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{inside}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return inside;
};

const base = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
export {GlassCup, clamp};
