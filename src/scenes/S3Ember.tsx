import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, GoldLine, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Cloud, Dust, Gull, Lighthouse, Rock, Stars, WaveBand} from '../components/props/sea';
import {DockPlanks, FishingRod, GlassCup, LonelyCloud, OpenBook, PhoneDown, PlantPot} from '../components/props/extra';
import {Chair} from '../components/props/home';
import {clamp, ease, kf, prog, spr} from '../lib/anim';
import {rng, roughPoly, roughRect} from '../lib/paper';
import {cue} from '../lib/timing';
import {QUIET} from '../data/beats';

const C = () => ({
  start: cue('goldTrace1'), pulse: cue('emberPulse'), track: cue('trackStart'), page: cue('pageTurn'), bob: cue('floatBob'),
  pat: cue('patCloud'), water: cue('waterPlant'), wide: cue('islandWide'), chest: cue('chestPush'), freeze: cue('freezeShell'), end: cue('mirrorFlip'),
});

const HB = {x: 960, y: 1000, s: 1.5};
const chestOf = (x: number, y: number, s: number) => [x, y - 166 * s] as [number, number];
const SPOTS = [600, 1160, 1720, 2280];

/** an outline that hugs the standing puppet (head circle + shoulders + legs), for the gold trace */
const outline = (x: number, y: number, s: number) => {
  const p = (dx: number, dy: number) => `${x + dx * s} ${y + dy * s}`;
  return `M ${p(-30, 6)} L ${p(-28, -110)} L ${p(-44, -200)} L ${p(-34, -212)} C ${p(-70, -260)} ${p(-60, -350)} ${p(0, -352)} C ${p(60, -350)} ${p(70, -260)} ${p(34, -212)} L ${p(44, -200)} L ${p(28, -110)} L ${p(30, 6)} Z`;
};

export const S3Ember: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  const silence = QUIET.find((q) => q.kind === 'silence' && q.start >= c.chest && q.start < c.end) ?? {start: c.freeze, end: c.end - 4};

  // ───── shot A: balcony at dusk, match-cut from the kid's ember
  const heroA = useRig('hero', frame, {poses: [{at: 0, pose: {...base(), uaL: 40, faL: -120, uaR: -20, faR: 10, head: 6}}, {at: c.pulse, pose: {...base(), uaL: 40, faL: -120, uaR: -20, faR: 10, head: -4, lean: -3}, stiff: 140, damp: 10}]});
  const [ax, ay] = chestOf(HB.x, HB.y, HB.s);
  const pull = prog(frame, c.start, c.start + 40, ease.out);
  const camA: Cam = {x: ax * (1 - pull) + 960 * pull, y: ay * (1 - pull) + 560 * pull, zoom: 3.4 * (1 - pull) + 1.0 * pull};
  const trace = prog(frame, c.start + 2, c.start + 44, ease.inOut);
  const orb = prog(frame, c.start, c.start + 50, ease.out);
  const beat = frame >= c.pulse ? Math.exp(-(frame - c.pulse) / 6) : 0;
  const balcony = (
    <Stage
      cam={camA}
      bg={<Backdrop top="#0A1E1A" bottom="#1E4136" />}
      layers={[
        {
          depth: 0.3,
          node: (
            <g>
              <rect x={-1200} y={-900} width={4400} height={2600} fill="url(#duskA)" />
              <defs>
                <linearGradient id="duskA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0B2420" />
                  <stop offset="65%" stopColor="#1E4136" />
                  <stop offset="100%" stopColor="#7A6A3A" />
                </linearGradient>
              </defs>
              <Stars frame={frame} area={[-800, -800, 3600, 900]} n={50} seed={9} />
              <Cloud x={400 + frame * 0.1} y={200} w={360} seed={41} fill="#24483E" />
              <Cloud x={1500 - frame * 0.08} y={120} w={300} seed={42} fill="#20403A" />
              <rect x={-1200} y={660} width={4400} height={900} fill="#12302A" />
              <WaveBand y={660} amp={6} wl={260} frame={frame} speed={0.05} fill="#1A3E36" seed={35} />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <Puppet {...heroA} look="hero" frame={frame} uid="heroA3" x={HB.x} y={HB.y} scale={HB.s} />
              <Glow cx={ax} cy={ay} r={120 + beat * 120} color="#FFC870" opacity={0.75} id="adultEmber" />
              <g transform={`translate(${ax} ${ay + 16}) scale(${0.18 + beat * 0.06})`}>
                <Lantern frame={frame} id="adultEmberLantern" flame={1.1} glow={0.4} />
              </g>
              <GoldLine d={outline(HB.x, HB.y, HB.s)} t={trace} width={6} length={4200} />
              {/* the mother's presence lifts away as a small light */}
              {orb < 1 ? <Glow cx={ax + 260 + orb * 300} cy={ay - 120 - orb * 420} r={60} color="#FFE2A0" opacity={1 - orb} id="momOrb" /> : null}
            </g>
          ),
        },
        {
          depth: 1.25,
          node: (
            <g>
              <P d={roughRect(-400, 860, 2800, 18, 14001, 4, 1.4)} fill="#14201C" shadow={8} />
              {Array.from({length: 26}, (_, i) => <rect key={i} x={-380 + i * 110} y={876} width={10} height={300} fill="#14201C" />)}
              <Dust frame={frame} n={14} color="#FFE2A0" seed={41} />
            </g>
          ),
        },
      ]}
    />
  );

  // ───── shot B: one long tracking shot across the island (hero walks from spot to spot)
  const segs = [
    {at: c.track, spot: 0}, {at: c.track + 64, spot: 1}, {at: c.track + 128, spot: 2}, {at: c.track + 192, spot: 3},
  ];
  const heroXAt = (f: number) => kf(f, [[c.track - 30, SPOTS[0] - 200], [c.track, SPOTS[0]], [c.track + 42, SPOTS[0]], [c.track + 64, SPOTS[1]], [c.track + 106, SPOTS[1]], [c.track + 128, SPOTS[2]], [c.track + 170, SPOTS[2]], [c.track + 192, SPOTS[3]]], ease.inOut);
  const hx = heroXAt(frame);
  const heroB = useRig('hero', frame, {
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.track, pose: 'read', stiff: 140, damp: 14},
      {at: c.track + 40, pose: 'stand', stiff: 160, damp: 14},
      {at: c.track + 64, pose: 'fish', stiff: 150, damp: 14},
      {at: c.bob - 2, pose: {...base(), lean: -6, head: -6, uaR: -70, faR: -70, uaL: 30, faL: -70, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}, stiff: 240, damp: 12},
      {at: c.track + 104, pose: 'stand', stiff: 160, damp: 14},
      {at: c.track + 128, pose: 'sit', stiff: 150, damp: 14},
      {at: c.pat - 3, pose: 'pat', stiff: 220, damp: 12},
      {at: c.track + 168, pose: 'stand', stiff: 160, damp: 14},
      {at: c.track + 192, pose: 'water', stiff: 140, damp: 13},
    ],
    x: heroXAt,
  });
  const atSpot = (i: number) => frame >= segs[i].at - 4 && (i === 3 || frame < segs[i].at + 40);
  const camB: Cam = {x: kf(frame, [[c.track - 30, SPOTS[0] - 60], [c.wide - 10, SPOTS[3]], [c.wide + 20, 1440]], ease.inOut), y: kf(frame, [[c.track, 600], [c.wide - 10, 600], [c.wide + 20, 520]], ease.inOut), zoom: kf(frame, [[c.track, 1.2], [c.wide - 10, 1.2], [c.wide + 20, 0.62]], ease.inOut)};
  // chest push + desaturation at the end of the section
  const push = prog(frame, c.chest, c.chest + 26, ease.inOut);
  const [bx, by] = chestOf(hx, 1000, 1.25);
  if (push > 0) {
    camB.x = camB.x * (1 - push) + bx * push;
    camB.y = camB.y * (1 - push) + by * push;
    camB.zoom = camB.zoom * (1 - push) + 3.2 * push;
  }
  const desat = prog(frame, c.chest, silence.start, ease.inOut);
  const shellT = prog(frame, silence.start, silence.end, ease.out);
  const cupFill = 1;
  const r = rng(77);
  const grass = Array.from({length: 40}, () => ({x: -200 + r() * 3000, h: 20 + r() * 30}));
  const nightK = (x: number) => clamp((x - 600) / 1700);
  const cloudX = kf(frame, [[c.track + 128, SPOTS[2] + 400], [c.pat - 4, SPOTS[2] + 120]], ease.out);
  const island = (
    <Stage
      cam={camB}
      bg={<Backdrop top="#0A2624" bottom="#0E3B3F" />}
      layers={[
        {
          depth: 0.3,
          node: (
            <g>
              <rect x={-1500} y={-1200} width={6000} height={2800} fill="url(#duskB)" />
              <defs>
                <linearGradient id="duskB" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1E4A44" />
                  <stop offset="55%" stopColor="#12302A" />
                  <stop offset="100%" stopColor="#0A1E22" />
                </linearGradient>
              </defs>
              <Stars frame={frame} area={[400, -900, 3400, 1200]} n={110} seed={12} />
              <Cloud x={200} y={150} w={340} seed={51} fill="#24483E" />
              <Cloud x={1300} y={60} w={300} seed={52} fill="#1C3A36" />
              <rect x={-1500} y={640} width={6000} height={1200} fill="#0E2E2C" />
              <WaveBand y={640} amp={6} wl={260} frame={frame} speed={0.05} fill="#143A36" seed={36} x0={-1500} x1={4500} />
              <g transform="translate(2200 640) scale(0.4)">
                <Lighthouse x={0} y={0} lampOn={0} beamAngle={0} frame={frame} windowsLit={1} />
              </g>
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              {/* the island ground strip */}
              <P d={roughPoly([[-600, 1000], [-300, 930], [400, 905], [1000, 920], [1400, 900], [2000, 910], [2700, 930], [3200, 1000], [3200, 1400], [-600, 1400]], 14101, 4, 20)} fill="#1E3A2C" shadow={10} />
              {grass.map((g, i) => <path key={i} d={`M ${g.x} 930 q 4 ${-g.h} 10 ${-g.h * 1.2} M ${g.x + 8} 930 q 2 ${-g.h * 0.8} -6 ${-g.h}`} stroke="#3E6A4A" strokeWidth={4} fill="none" />)}
              {/* spot 1: rocks */}
              <Rock x={SPOTS[0] + 40} y={960} w={360} h={90} seed={14111} fill="#2A3A3A" top="#36504A" />
              {/* spot 2: dock with railing */}
              <DockPlanks x0={SPOTS[1] - 160} x1={SPOTS[1] + 420} y={930} seed={14120} />
              <P d={roughRect(SPOTS[1] + 220, 800, 10, 140, 14130, 3, 1)} fill="#3A2A1C" shadow={4} />
              <P d={roughRect(SPOTS[1] - 160, 820, 580, 10, 14131, 3, 1)} fill="#3A2A1C" shadow={4} />
              {atSpot(1) ? <FishingRod x={SPOTS[1] + 40} y={860} frame={frame} bob={frame >= c.bob ? Math.exp(-(frame - c.bob) / 8) * Math.sin((frame - c.bob) / 2) : 0} /> : null}
              {/* spot 3: bench under stars */}
              <Chair x={SPOTS[2]} y={960} s={0.9} />
              {frame >= c.track + 120 ? <LonelyCloud x={cloudX} y={760} s={0.8} frame={frame} patted={frame >= c.pat ? 1 : 0} /> : null}
              {/* spot 4: hut window with a plant and the phone face-down */}
              <P d={roughRect(SPOTS[3] + 60, 560, 420, 420, 14140, 6, 3)} fill="#3A2E24" shadow={10} />
              <P d={roughRect(SPOTS[3] + 120, 640, 200, 160, 14141, 6, 2)} fill="#F6C86A" shadow={4} />
              <Glow cx={SPOTS[3] + 220} cy={720} r={240} color="#FFC870" opacity={0.6} id="hutwin" />
              <P d={roughRect(SPOTS[3] + 100, 800, 260, 16, 14142, 3, 1)} fill="#5A3A22" shadow={4} />
              <PlantPot x={SPOTS[3] + 170} y={800} s={0.8} frame={frame} grow={frame >= c.water ? clamp((frame - c.water) / 20) : 0} />
              <PhoneDown x={SPOTS[3] + 290} y={800} />
              {frame >= c.water && frame < c.water + 30
                ? Array.from({length: 6}, (_, i) => <line key={i} x1={SPOTS[3] + 150 + i * 8} y1={770 + ((frame - c.water) * 6 + i * 9) % 40} x2={SPOTS[3] + 148 + i * 8} y2={780 + ((frame - c.water) * 6 + i * 9) % 40} stroke="#8FB6DA" strokeWidth={3} />)
                : null}
              {/* the hero: once, wherever he is now */}
              <Puppet
                {...heroB}
                look="hero"
                frame={frame}
                uid="heroB3"
                x={hx}
                y={1000}
                scale={1.25}
                propL={atSpot(1) ? undefined : <GlassCup x={0} y={10} s={0.7} fill={cupFill} frame={frame} id="cupHand" />}
                propR={atSpot(0) ? <g transform="translate(-20 0)"><OpenBook x={0} y={0} s={0.6} page={frame >= c.page && frame < c.page + 10 ? (frame - c.page) / 10 : 0} /></g> : atSpot(3) ? <g><P d={roughPoly([[-20, -10], [30, -10], [26, 20], [-16, 20]], 14150, 1)} fill="#4E7AA0" shadow={3} /><line x1={30} y1={-6} x2={60} y2={-22} stroke="#4E7AA0" strokeWidth={6} /></g> : undefined}
              />
              {atSpot(1) ? <GlassCup x={SPOTS[1] - 90} y={930} s={0.7} fill={cupFill} frame={frame} id="cupDock" /> : null}
              {/* chest X-ray at the freeze: a porcelain shell outline around the ember */}
              {push > 0 ? (
                <g>
                  <Glow cx={bx} cy={by} r={110} color="#FFC870" opacity={0.7} id="chestEmber" />
                  <g transform={`translate(${bx} ${by + 12}) scale(0.16)`}>
                    <Lantern frame={frame} id="chestEmberL" flame={1} glow={0.3} />
                  </g>
                  {shellT > 0 ? (
                    <path d={`M ${bx - 50} ${by + 30} L ${bx - 56} ${by - 10} L ${bx - 30} ${by - 52} L ${bx + 8} ${by - 66} L ${bx + 48} ${by - 50} L ${bx + 60} ${by - 6} L ${bx + 50} ${by + 30} Z`} fill="none" stroke="#6FA8DC" strokeWidth={4} strokeDasharray="10 7" opacity={shellT} />
                  ) : null}
                </g>
              ) : null}
            </g>
          ),
        },
        {
          depth: 1.35,
          blur: 2,
          node: (
            <g>
              <Gull x={300 + frame * 0.8} y={300} frame={frame} seed={3} />
              <Gull x={800 + frame * 0.6} y={240} s={0.7} frame={frame} seed={6} />
              <Dust frame={frame} n={20} color="#FFE2A0" seed={42} area={[0, 0, 3200, 1080]} />
            </g>
          ),
        },
      ]}
      style={{filter: desat > 0 ? `saturate(${1 - desat * 0.75}) brightness(${1 - desat * 0.15})` : undefined}}
    />
  );
  void nightK;

  if (frame < c.track - 30) return balcony;
  if (frame < c.track) {
    // camera pans right off the balcony onto the island path
    const t = prog(frame, c.track - 30, c.track, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${-t * 1920}px)`}}>{balcony}</AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${(1 - t) * 1920}px)`}}>{island}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      {island}
      <LightWash x={200} y={300} color="#C9B27A" strength={0.25 * (1 - desat)} radius={1200} />
    </AbsoluteFill>
  );
};

const base = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
export {spr};
