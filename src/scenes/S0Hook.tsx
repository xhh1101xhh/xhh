import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet, handWorld} from '../components/character/Puppet';
import {PoseKey, useRig} from '../components/character/useCharacter';
import {Boat, Cloud, Dust, Gull, Lighthouse, Moon, Rain, Rock, Stars, WaveBand} from '../components/props/sea';
import {Bowl, BrickWall, Bulb, Chair, Ladder, Porthole, Stair, Table, ThoughtBubble, WallClock} from '../components/props/home';
import {clamp, ease, kf, noise1, prog, pulse, shake, spr} from '../lib/anim';
import {roughCircle, roughPoly, roughRect} from '../lib/paper';
import {cue} from '../lib/timing';
import {VerticalWhip} from '../components/transitions/VerticalWhip';

/* all timing comes from the subtitle file's action cues */
const C = () => ({
  boatEnter: cue('boatEnter'),
  descend: cue('camDescend'),
  push: cue('pushBalcony'),
  grab: cue('leverGrab'),
  down: cue('leverDown'),
  turn: cue('boatTurn'),
  take: cue('takeLantern'),
  match: cue('strikeMatch'),
  pushL: cue('pushLantern'),
  whip: cue('whipDown'),
  bowl: cue('bowlLand'),
  shutter: cue('shutterSlam'),
  climb: cue('climb'),
  jump: cue('jumpDown'),
  bubble: cue('bubbleShow'),
  pop: cue('bubblePop'),
  stop: cue('clockStop'),
  pullOut: cue('pullOut'),
  shrink: cue('flameShrink'),
  hold: cue('silenceHold'),
  slam: cue('slam1'),
  dive: cue('diveLayers'),
});

/* ───────────────────────── Set A: the wide night sea ───────────────────────── */
const LH = {x: 1240, y: 700}; // lighthouse base
export const SeaWide: React.FC<{frame: number; cam: Cam; lampOn: number; beamAngle: number; boatX: number; boatFlip: number; surge?: number; windowGlow?: number; storm?: number}> = ({frame, cam, lampOn, beamAngle, boatX, boatFlip, surge = 0, windowGlow = 1, storm = 0}) => {
  const lift = -surge * 60;
  return (
    <Stage
      cam={cam}
      bg={<Backdrop top="#08101F" bottom="#1C2E52" />}
      layers={[
        {
          depth: 0.25,
          node: (
            <g>
              <rect x={-1500} y={-2200} width={5000} height={3200} fill="url(#skyA)" />
              <defs>
                <linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#070D1C" />
                  <stop offset="60%" stopColor="#0E1A33" />
                  <stop offset="100%" stopColor="#22365E" />
                </linearGradient>
              </defs>
              <Stars frame={frame} area={[-900, -1500, 3700, 1900]} n={140} />
              <Moon x={470} y={150} r={92} frame={frame} />
              <Cloud x={420 + frame * 0.25} y={250} w={340} seed={11} fill="#22325A" />
              <Cloud x={1500 - frame * 0.18} y={60} w={420} seed={12} fill="#1E2C50" />
              <Cloud x={900 + frame * 0.12} y={-260} w={380} seed={13} fill="#1A2748" />
              <Cloud x={200 - frame * 0.1} y={-520} w={300} seed={14} fill="#182444" />
            </g>
          ),
        },
        {
          depth: 0.55,
          node: (
            <g>
              <P d={roughPoly([[-600, 640], [-200, 560], [100, 600], [300, 640]], 21, 3)} fill="#1A2546" shadow={6} />
              <P d={roughPoly([[1600, 640], [1800, 575], [2100, 590], [2500, 640]], 22, 3)} fill="#18223F" shadow={6} />
              <WaveBand y={630} amp={6} wl={260} frame={frame} speed={0.05} fill="#1E3158" seed={31} />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <WaveBand y={680 + lift * 0.4} amp={10} wl={300} frame={frame} speed={0.07} fill="#223A66" seed={41} foam="#6E8CC0" />
              <Rock x={LH.x} y={720} w={420} h={110} seed={51} />
              <Lighthouse x={LH.x} y={LH.y} lampOn={lampOn} beamAngle={beamAngle} frame={frame} windowsLit={windowGlow} />
              <Boat x={boatX} y={735} s={0.55 * (boatFlip >= 0 ? 1 : 1)} frame={frame} tilt={0}>
                <g transform={`scale(${boatFlip} 1)`}>
                  <g transform="translate(-10 -36) scale(0.32)">
                    <path d="M 0 -380 Q 90 -440 170 -380 Z" fill="#C2443F" />
                    <line x1={85} y1={-410} x2={60} y2={-200} stroke="#3A2A20" strokeWidth={6} />
                    <circle cx={30} cy={-260} r={52} fill="#EBC09A" />
                    <path d="M -22 -250 Q -20 -320 30 -318 Q 80 -318 82 -250 L 70 -280 L -10 -280 Z" fill="#1E1820" />
                    <rect x={-20} y={-210} width={100} height={150} rx={20} fill="#2E7E78" />
                    <path d={`M 70 -190 L ${110 + Math.sin(frame / 5) * 20 * clamp(1 - (frame - 99) / 60)} -280`} stroke="#2E7E78" strokeWidth={22} strokeLinecap="round" />
                  </g>
                </g>
              </Boat>
              <WaveBand y={760 + lift} amp={14} wl={340} frame={frame} speed={0.09} fill="#29467A" seed={61} foam="#8CA8D8" />
            </g>
          ),
        },
        {
          depth: 1.35,
          blur: 1.5,
          node: (
            <g>
              <Rock x={180} y={1010} w={520} h={170} seed={71} fill="#121729" top="#1B2238" />
              <Gull x={120} y={845} frame={frame} sleeping seed={1} />
              <Gull x={230} y={858} s={0.9} frame={frame} sleeping seed={2} />
              <WaveBand y={950 + lift * 1.4} amp={22} wl={420} frame={frame} speed={0.12} fill="#2F5089" seed={81} foam="#A8C0E8" />
              {storm > 0 ? <Rain frame={frame} opacity={0.35 * storm} area={[-400, -600, 2800, 2000]} /> : null}
            </g>
          ),
        },
      ]}
    />
  );
};

/* ───────────────────────── Set B: the balcony close-up ───────────────────────── */
const HERO_B = {x: 850, y: 905, s: 1.55};
const PIVOT = {x: 1030, y: 690};
const HOOK = {x: 640, y: 560};
const balconyPoses = (c: ReturnType<typeof C>) => ({
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.push, pose: 'standAlert', stiff: 170, damp: 13},
      {at: c.grab - 5, pose: 'leverGrab', stiff: 180, damp: 14},
      {at: c.down - 6, pose: 'leverWindup', stiff: 220, damp: 16},
      {at: c.down, pose: 'leverDown', stiff: 260, damp: 12},
      {at: c.down + 30, pose: 'exhale', stiff: 90, damp: 14},
      {at: c.turn + 4, pose: 'handsHips', stiff: 120, damp: 12},
      {at: c.take - 4, pose: 'reachHookL', stiff: 150, damp: 14},
      {at: c.take + 9, pose: 'holdLanternL', stiff: 130, damp: 13},
      {at: c.match - 4, pose: 'matchR', stiff: 200, damp: 14},
      {at: c.match + 10, pose: 'holdLanternL', stiff: 120, damp: 14},
      {at: c.pushL - 4, pose: 'raiseLanternL', stiff: 110, damp: 14},
    ] as PoseKey[],
});
/** world position of the carried lantern's glass (for the camera to lock onto) */
const lanternWorld = (frame: number, c: ReturnType<typeof C>): [number, number] => {
  const rig = useRig('hero', frame, balconyPoses(c));
  const h = handWorld(rig.pose, -1, HERO_B.x, HERO_B.y, HERO_B.s);
  return [h[0], h[1] + 236 * 0.62 - 128 * 0.62];
};
const BalconySet: React.FC<{frame: number; cam: Cam; c: ReturnType<typeof C>}> = ({frame, cam, c}) => {
  const rig = useRig('hero', frame, balconyPoses(c));
  const hand = handWorld(rig.pose, 1, HERO_B.x, HERO_B.y, HERO_B.s);
  const handL = handWorld(rig.pose, -1, HERO_B.x, HERO_B.y, HERO_B.s);
  // lever follows the hand between grab and release, otherwise rests
  const restUp = -8;
  const downA = 62;
  let leverA = restUp;
  let leverLen = 200;
  if (frame >= c.grab) {
    const held = frame < c.down + 24;
    const a = (Math.atan2(hand[0] - PIVOT.x, -(hand[1] - PIVOT.y)) * 180) / Math.PI;
    const dist = Math.hypot(hand[0] - PIVOT.x, hand[1] - PIVOT.y);
    // the lever eases into the hand over a few frames, then follows it exactly
    const grip = prog(frame, c.grab - 4, c.grab + 2, ease.out);
    leverA = held ? restUp + (clamp(a, -30, downA + 6) - restUp) * grip : downA;
    leverLen = held ? 200 + (clamp(dist, 150, 300) - 200) * grip : 200;
  }
  const lampOff = prog(frame, c.down, c.down + 9, ease.in);
  const lampOn = 1 - lampOff;
  const beamLen = 1 - lampOff;
  const flick = frame > c.down && frame < c.down + 12 ? 0.5 + 0.5 * Math.sin(frame * 3) : 1;
  const beamA = -14 + Math.sin(frame / 22) * 7;
  // lantern: hangs on the hook until taken, then rides the left hand
  const taken = frame >= c.take + 6;
  const lit = frame >= c.match + 4;
  const flame = lit ? spr(frame, c.match + 4, {damping: 9, stiffness: 160}) : 0;
  const lanternPos = taken ? handL : [HOOK.x, HOOK.y + 230 * 0.62];
  const boatT = prog(frame, c.turn, c.turn + 14, ease.inOut);
  const boatX = frame < c.turn ? 430 + frame * 0.6 : 430 + c.turn * 0.6 - (frame - c.turn) * 1.4;
  return (
    <Stage
      cam={cam}
      bg={<Backdrop top="#0B1430" bottom="#1E3058" />}
      layers={[
        {
          depth: 0.2,
          blur: 2.5,
          node: (
            <g>
              <rect x={-800} y={-800} width={3600} height={2600} fill="#0E1A36" />
              <Stars frame={frame} area={[-600, -600, 3000, 1100]} n={80} seed={4} />
              <Moon x={300} y={180} r={70} frame={frame} />
              <Cloud x={700 + frame * 0.2} y={240} w={300} seed={15} fill="#1E2C50" />
              <rect x={-800} y={640} width={3600} height={1200} fill="#1A2C52" />
              <WaveBand y={640} amp={5} wl={220} frame={frame} speed={0.05} fill="#22385F" seed={33} />
              <g transform={`translate(${boatX} 660)`}>
                <Glow cx={0} cy={-20} r={70} color="#FFB45A" opacity={0.7} id="farboat" />
                <g transform={`scale(${0.32 * (1 - 2 * boatT)} 0.32)`}>
                  <P d={roughPoly([[-120, -40], [120, -40], [80, 10], [-80, 10]], 8302, 2)} fill="#E9DFC9" shadow={4} />
                  <path d="M -20 -40 Q 20 -150 60 -40 Z" fill="#C2443F" />
                </g>
              </g>
            </g>
          ),
        },
        {
          depth: 0.7,
          node: (
            <g>
              {/* lamp room: big lens on the right */}
              <P d={roughRect(1150, -60, 520, 700, 3101, 6, 2)} fill="#2A2D44" shadow={10} />
              {[1210, 1330, 1450, 1570].map((x, i) => (
                <rect key={i} x={x} y={-40} width={10} height={660} fill="#1C1E2E" />
              ))}
              <g transform="translate(1410 290)">
                {beamLen > 0.01 ? (
                  <g transform={`rotate(${beamA})`} opacity={flick} style={{mixBlendMode: 'screen'}}>
                    <defs>
                      <linearGradient id="bbeam" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FFF0C2" stopOpacity={0.9} />
                        <stop offset="100%" stopColor="#FFE0A0" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <path d={`M 0 -120 L ${1400 * beamLen} -420 L ${1400 * beamLen} 420 L 0 120 Z`} fill="url(#bbeam)" />
                  </g>
                ) : null}
                <Glow cx={0} cy={0} r={420} color="#FFE2A0" opacity={lampOn * flick} id="lensglow" />
                <P d={roughCircle(0, 0, 170, 3102, 2)} fill={lampOn > 0.1 ? '#FFE8B0' : '#3A4870'} shadow={8} />
                {[140, 108, 76, 44].map((r, i) => (
                  <circle key={r} cx={0} cy={0} r={r} fill="none" stroke={lampOn > 0.1 ? '#E2B865' : '#2A3658'} strokeWidth={6} opacity={0.8 - i * 0.1} />
                ))}
                <circle cx={-40} cy={-50} r={26} fill="rgba(255,255,255,0.5)" />
              </g>
              {/* lever post */}
              <P d={roughRect(PIVOT.x - 14, PIVOT.y, 28, 230, 3103, 4, 1)} fill="#2E2A30" shadow={6} />
              <g transform={`translate(${PIVOT.x} ${PIVOT.y}) rotate(${leverA})`}>
                <P d={roughRect(-7, -leverLen, 14, leverLen, 3104, 4, 1)} fill="#5A5560" shadow={5} />
                <P d={roughCircle(0, -leverLen - 2, 15, 3105, 1)} fill="#C2443F" shadow={3} />
              </g>
              <circle cx={PIVOT.x} cy={PIVOT.y} r={12} fill="#8C8690" />
              {/* hook post (left) */}
              <P d={roughRect(HOOK.x - 10, HOOK.y - 20, 20, 400, 3106, 4, 1)} fill="#2E2A30" shadow={6} />
              <path d={`M ${HOOK.x} ${HOOK.y} q 30 0 30 26`} fill="none" stroke="#8C8690" strokeWidth={6} />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              {!taken ? (
                <g transform={`translate(${lanternPos[0]} ${lanternPos[1]}) scale(0.62)`}>
                  <Lantern frame={frame} id="balconyLanternHook" flame={flame} lit={lit} glow={0.9} swing={Math.sin(frame / 20) * 2} />
                </g>
              ) : null}
              <Puppet {...rig} look="hero" frame={frame} uid="heroB" x={HERO_B.x} y={HERO_B.y} scale={HERO_B.s} />
              {taken ? (
                <g transform={`translate(${lanternPos[0]} ${lanternPos[1] + 236 * 0.62}) scale(0.62)`}>
                  <Lantern frame={frame} id="balconyLantern" flame={flame} lit={lit} glow={0.9 + flame * 0.3} swing={Math.sin(frame / 9) * 4} />
                </g>
              ) : null}
              {frame >= c.match - 6 && frame < c.match + 14 ? (
                <g transform={`translate(${hand[0]} ${hand[1]})`}>
                  <line x1={0} y1={0} x2={10} y2={-34} stroke="#E6D3A8" strokeWidth={4} />
                  {frame >= c.match ? <Glow cx={10} cy={-38} r={46 * (1 - prog(frame, c.match + 6, c.match + 14))} color="#FFC060" id="matchglow" /> : null}
                  {frame >= c.match ? <path d="M 10 -50 q 8 10 0 16 q -8 -6 0 -16 Z" fill="#FFD27A" /> : null}
                </g>
              ) : null}
            </g>
          ),
        },
        {
          depth: 1.25,
          opacity: 1 - prog(frame, c.pushL - 4, c.pushL + 14, ease.inOut),
          node: (
            <g>
              {/* railing in front of the legs */}
              <P d={roughRect(-400, 770, 2800, 18, 3201, 4, 1.4)} fill="#23202A" shadow={8} />
              {Array.from({length: 26}, (_, i) => (
                <rect key={i} x={-380 + i * 110} y={786} width={10} height={300} fill="#23202A" />
              ))}
              <P d={roughRect(-400, 1000, 2800, 120, 3202, 4, 2)} fill="#1A1820" shadow={false} />
              <Dust frame={frame} n={18} color="#CFE0FF" area={[0, 0, 1920, 1000]} />
            </g>
          ),
        },
      ]}
    />
  );
};

/* ───────────────────────── Set C: inside the tower (time-lapse montage) ───────────────────────── */
const InteriorSet: React.FC<{frame: number; cam: Cam; c: ReturnType<typeof C>}> = ({frame, cam, c}) => {
  const walkTo = (a: number, b: number) => prog(frame, a, b, ease.inOut);
  // hero x: chair -> shutter -> ladder -> chair
  const hx = kf(frame, [
    [c.whip, 1060],
    [c.shutter - 16, 1060],
    [c.shutter - 4, 1340],
    [c.climb - 6, 1340],
    [c.climb, 1215],
    [c.stop - 18, 1215],
    [c.stop - 2, 1060],
  ], ease.inOut);
  const rig = useRig('hero', frame, {
    poses: [
      {at: 0, pose: 'eat'},
      {at: c.bowl - 3, pose: 'sit', stiff: 200, damp: 14},
      {at: c.bowl + 6, pose: 'eat', stiff: 160, damp: 13},
      {at: c.shutter - 16, pose: 'stand', stiff: 200, damp: 15},
      {at: c.shutter - 5, pose: 'leverWindup', stiff: 220, damp: 15},
      {at: c.shutter, pose: 'slamShutter', stiff: 260, damp: 12},
      {at: c.climb - 6, pose: 'stand', stiff: 200, damp: 15},
      {at: c.climb, pose: 'climb', stiff: 220, damp: 14},
      {at: c.jump - 2, pose: 'air', stiff: 260, damp: 14},
      {at: c.jump + 6, pose: 'land', stiff: 300, damp: 11},
      {at: c.jump + 14, pose: 'handsHips', stiff: 140, damp: 12},
      {at: c.bubble + 8, pose: 'handsHips'},
      {at: c.pop - 5, pose: 'poke', stiff: 240, damp: 13},
      {at: c.pop + 8, pose: 'handsHips', stiff: 120, damp: 14},
      {at: c.stop - 18, pose: 'stand', stiff: 150, damp: 15},
      {at: c.stop - 2, pose: 'sitSlump', stiff: 110, damp: 15},
    ],
  });
  const lapse = frame < c.stop ? (frame - c.whip) * 22 : (c.stop - c.whip) * 22 + spr(frame, c.stop, {damping: 8}) * 6;
  const shutterA = frame < c.shutter ? 95 : 95 - 95 * spr(frame, c.shutter - 2, {damping: 11, stiffness: 300});
  const flash = frame % 47 < 3 && frame < c.stop ? 1 : 0;
  const bulbOn = frame >= c.climb + 8 ? 1 : frame >= c.climb ? (frame % 4 < 2 ? 1 : 0.2) : 0.15;
  const flame = frame < c.shrink ? 1 : 1 - 0.75 * prog(frame, c.shrink, c.shrink + 20, ease.out);
  const bubbleS = frame < c.bubble ? 0 : spr(frame, c.bubble, {damping: 11, stiffness: 160});
  const popT = prog(frame, c.pop, c.pop + 7, ease.out);
  const bowlDrop = frame < c.bowl ? -200 * (1 - ease.inQuad(prog(frame, c.bowl - 8, c.bowl, (t) => t))) : 0;
  const slow = frame >= c.stop ? 0.25 : 1; // everything slows down near the quiet
  void slow;
  void walkTo;
  return (
    <Stage
      cam={cam}
      bg={<Backdrop top="#141838" bottom="#1F2550" />}
      layers={[
        {
          depth: 0.6,
          node: (
            <g>
              <BrickWall x={-600} y={-500} w={3200} h={1500} base="#1A1F45" brick="#262C5C" seed={4000} />
              <Porthole x={1500} y={360} r={150} frame={frame} storm={frame < c.stop ? 1 : 0.3} flash={flash} seed={2} />
              {/* two wooden shutter leaves swing shut over the porthole */}
              {shutterA < 94
                ? [-1, 1].map((sd) => (
                    <g key={sd} transform={`translate(${1500 + sd * 165} 360) scale(${(1 - shutterA / 95) * -sd} 1)`}>
                      <P d={roughRect(0, -170, 165, 340, 4101 + sd, 10, 2)} fill="#6A4428" shadow={8} />
                      {[-110, -40, 30, 100].map((yy) => <path key={yy} d={`M 14 ${yy} L 150 ${yy + 14}`} stroke="#4E311C" strokeWidth={8} />)}
                    </g>
                  ))
                : null}
              {/* set dressing: boat picture, jar shelf, oilskin on a peg */}
              <P d={roughRect(560, 150, 200, 150, 4110, 4, 2)} fill="#6A4428" shadow={6} />
              <rect x={576} y={166} width={168} height={118} fill="#22365E" />
              <path d="M 600 250 L 720 250 L 700 270 L 620 270 Z" fill="#E9DFC9" />
              <path d="M 660 250 L 660 190 L 700 245 Z" fill="#C2443F" />
              <P d={roughRect(840, 330, 220, 14, 4111, 3, 1)} fill="#6A4428" shadow={4} />
              {[870, 920, 970, 1020].map((jx, i) => (
                <g key={jx}>
                  <P d={roughRect(jx - 18, 330 - 50 - i * 6, 36, 50 + i * 6, 4120 + i, 8, 1)} fill={['#4E7A5A', '#C9A040', '#8FB7C9', '#9E3A2E'][i]} shadow={3} />
                </g>
              ))}
              <WallClock x={300} y={250} r={78} hourA={lapse / 12} minA={lapse} />
              <Stair x={-120} y={980} steps={6} color="#2A2F5C" />
              <Bulb x={1215} y={250} on={bulbOn} frame={frame} id="tbulb" />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <Ladder x={1215} y={1000} h={560} />
              <Table x={880} y={810} w={300} />
              <Bowl x={840} y={792 + bowlDrop} frame={frame} steam={frame > c.bowl ? 1 : 0} />
              <g transform="translate(960 794) scale(0.5)">
                <Lantern frame={frame} id="tableLantern" flame={flame} glow={0.8 + 0.2 * (1 - (frame >= c.shrink ? 1 : 0))} />
              </g>
              <Chair x={1060} y={1000} />
              <Puppet {...rig} look="hero" frame={frame} uid="heroC" x={hx} y={1000} scale={1.25} />
              <ThoughtBubble x={470} y={430} s={bubbleS} pop={popT} frame={frame} />
            </g>
          ),
        },
        {
          depth: 1.3,
          blur: 2,
          node: (
            <g>
              <path d={`M -100 -50 Q 120 160 40 420`} fill="none" stroke="#0E1028" strokeWidth={14} />
              <P d={roughCircle(60, 430, 40, 4201, 2)} fill="#14163A" shadow={4} />
              <P d={roughRect(1700, 820, 400, 320, 4202, 8, 3)} fill="#0E1028" shadow={false} />
              {/* coiled rope in the foreground */}
              {[0, 1, 2, 3].map((k) => <ellipse key={k} cx={300} cy={1060 - k * 16} rx={150 - k * 14} ry={34 - k * 3} fill="none" stroke="#5A4630" strokeWidth={14} />)}
            </g>
          ),
        },
      ]}
    />
  );
};

/* ───────────────────────── the section: one continuous camera ───────────────────────── */
export const S0Hook: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // A: sea wide — descend from the moon, then push to the balcony
  const camA1: Cam = {
    x: kf(frame, [[0, 760], [c.descend, 760], [c.push - 4, 960], [c.push + 22, 1235]], ease.inOut),
    y: kf(frame, [[0, -420], [c.descend, -420], [c.push - 4, 560], [c.push + 22, 330]], ease.inOut),
    zoom: kf(frame, [[0, 1.0], [c.push - 4, 1.0], [c.push + 22, 3.2]], ease.in),
  };
  // A again for the pull-out + slam + dive
  const sh = shake(frame, c.slam, 22, 22, 3);
  const camA2: Cam = {
    x: kf(frame, [[c.pullOut + 20, 1236], [c.slam, 1180], [c.dive - 20, 1150], [c.dive + 20, 1240]], ease.inOut) + sh.x,
    y: kf(frame, [[c.pullOut + 20, 515], [c.slam, 470], [c.dive - 20, 480], [c.dive + 20, 470]], ease.inOut) + sh.y,
    zoom: kf(frame, [[c.pullOut + 20, 4.2], [c.slam - 2, 1.05], [c.slam + 50, 0.96], [c.dive - 20, 1.0], [c.dive + 20, 6.5]], (t) => (t < 1 ? ease.out(t) : t)),
    rot: sh.r,
  };
  const surge = pulse(frame, c.slam, 14);
  const beamAngle = -20 + Math.sin(frame / 18) * 18;
  const lampA = frame < c.down ? 1 : 0;
  const boatX = frame < c.turn ? 1900 - frame * 2.6 : 1900 - c.turn * 2.6 + (frame - c.turn) * 1.6;
  const boatFlip = frame < c.turn ? 1 : 1 - 2 * prog(frame, c.turn, c.turn + 14);

  // B: balcony camera
  const camB: Cam = {
    x: kf(frame, [[c.push, 1000], [c.push + 30, 960], [c.grab, 930], [c.down, 940], [c.turn, 900], [c.take, 820], [c.pushL, 760]], ease.inOut),
    y: kf(frame, [[c.push, 560], [c.push + 30, 560], [c.down, 560], [c.take, 600], [c.pushL, 640]], ease.inOut),
    zoom: kf(frame, [[c.push, 0.72], [c.push + 30, 1.0], [c.grab, 1.05], [c.down - 2, 1.1], [c.down + 4, 1.04], [c.turn, 1.0], [c.take, 1.15], [c.pushL, 1.3]], ease.inOut),
  };
  // lock onto the lantern during the final push: the through-object grows until it fills the frame
  if (frame > c.pushL - 6) {
    const t = prog(frame, c.pushL - 6, c.whip - 6, ease.inOut);
    const [lx, ly] = lanternWorld(frame, c);
    camB.x = camB.x * (1 - t) + lx * t;
    camB.y = camB.y * (1 - t) + ly * t;
    camB.zoom = camB.zoom * (1 - t) + 4.4 * t;
  }
  // C: interior camera (lands from the whip, follows the action, then pulls out)
  const camC: Cam = {
    x: kf(frame, [[c.whip, 930], [c.bowl + 20, 960], [c.shutter - 10, 1150], [c.climb, 1220], [c.bubble, 860], [c.pop + 10, 900], [c.stop, 960], [c.pullOut + 40, 1000]], ease.inOut),
    y: kf(frame, [[c.whip, 680], [c.bowl + 20, 640], [c.shutter, 560], [c.climb, 520], [c.bubble, 560], [c.stop, 600], [c.pullOut + 40, 600]], ease.inOut),
    zoom: kf(frame, [[c.whip, 1.45], [c.bowl + 20, 1.25], [c.shutter, 1.15], [c.climb, 1.2], [c.bubble, 1.2], [c.pop, 1.28], [c.stop, 1.05], [c.pullOut + 36, 0.55]], ease.inOut),
  };

  const showA1 = frame < c.push + 26;
  const balconyIn = prog(frame, c.push + 6, c.push + 22, ease.inOut);
  const showB = frame >= c.push + 6 && frame < c.whip + 12;
  const showC = frame >= c.whip - 10 && frame < c.pullOut + 46;
  const pullMix = prog(frame, c.pullOut + 26, c.pullOut + 46, ease.inOut);
  const showA2 = frame >= c.pullOut + 26;
  const darkAfterLever = prog(frame, c.down, c.down + 9) * 0.3;
  const quietDim = frame >= c.hold ? 0.18 * prog(frame, c.shrink, c.hold + 4) : prog(frame, c.shrink, c.hold, ease.inOut) * 0.18;

  return (
    <AbsoluteFill>
      {showA1 ? <SeaWide frame={frame} cam={camA1} lampOn={lampA} beamAngle={beamAngle} boatX={boatX} boatFlip={boatFlip} /> : null}
      {showB || showC ? (
        <VerticalWhip
          frame={frame}
          at={c.whip}
          outgoing={showB ? <AbsoluteFill style={{opacity: balconyIn}}><BalconySet frame={frame} cam={camB} c={c} /><AbsoluteFill style={{background: '#050814', opacity: darkAfterLever}} /></AbsoluteFill> : null}
          incoming={showC ? <AbsoluteFill style={{opacity: 1 - pullMix}}><InteriorSet frame={frame} cam={camC} c={c} /></AbsoluteFill> : null}
        />
      ) : null}
      {/* window frame closing in during the pull-out (reads as backing out of the tower window) */}
      {frame >= c.pullOut && frame < c.pullOut + 48 ? <WindowIris frame={frame} a={c.pullOut + 8} b={c.pullOut + 44} /> : null}
      {showA2 ? (
        <AbsoluteFill style={{opacity: pullMix}}>
          <SeaWide frame={frame} cam={camA2} lampOn={0} beamAngle={0} boatX={-400} boatFlip={-1} surge={surge} windowGlow={1} storm={0.4} />
        </AbsoluteFill>
      ) : null}
      <LightWash x={380} y={120} color="#9DB4D9" strength={0.25} radius={1100} />
      <AbsoluteFill style={{background: '#04060E', opacity: quietDim, pointerEvents: 'none'}} />
    </AbsoluteFill>
  );
};

/** a dark round window frame that closes in from the edges (pull-out through the tower window) */
const WindowIris: React.FC<{frame: number; a: number; b: number}> = ({frame, a, b}) => {
  const t = prog(frame, a, b, ease.inOut);
  const r = 1400 - t * 1050;
  const out = prog(frame, b - 8, b + 4);
  return (
    <AbsoluteFill style={{opacity: 1 - out}}>
      <svg width={1920} height={1080}>
        <defs>
          <mask id="wiris">
            <rect width={1920} height={1080} fill="white" />
            <path d={roughCircle(960, 560, r, 4301, 6, 20)} fill="black" />
          </mask>
        </defs>
        <rect width={1920} height={1080} fill="#151A36" mask="url(#wiris)" />
        <path d={roughCircle(960, 560, r, 4301, 6, 20)} fill="none" stroke="#6A4428" strokeWidth={36} />
        <path d={roughCircle(960, 560, r + 22, 4302, 4, 20)} fill="none" stroke="#3A2A1C" strokeWidth={10} />
      </svg>
    </AbsoluteFill>
  );
};

export {noise1};
