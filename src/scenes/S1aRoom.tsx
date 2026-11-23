import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {BellIcon, Bed, Bookshelf, Chair, Door, HangingPlant, Kite, Mug, Porthole, Rug, Table, ToothCup} from '../components/props/home';
import {Dust} from '../components/props/sea';
import {Scale, YarnSprite, YarnIcon} from '../components/props/yarn';
import {clamp, ease, kf, prog, pulse, shake, spr} from '../lib/anim';
import {roughPoly, roughRect} from '../lib/paper';
import {cue} from '../lib/timing';

const C = () => ({
  dive: cue('diveLayers'),
  gust: cue('gust'),
  pan: cue('panDoor'),
  bell: cue('bellRing'),
  door: cue('doorOpen'),
  yarn: cue('yarnRoll'),
  rise: cue('scaleRise'),
  s1: cue('sprite1'), s2: cue('sprite2'), s3: cue('sprite3'), s4: cue('sprite4'),
  push: cue('pushScale'),
  j1: cue('jump1'), j2: cue('jump2'), j3: cue('jump3'), j4: cue('jump4'), j5: cue('jump5'),
  slam: cue('scaleSlam'),
  cold: cue('lanternCold'),
  back: cue('pullBackRoom'),
  squeeze: cue('squeeze'),
  b1: cue('book1'), b2: cue('book2'), b3: cue('book3'),
});

const SCALE = {x: 470, y: 430, s: 1.08};
const PAN_R = (tilt: number) => {
  const a = (tilt * Math.PI) / 180;
  return {x: SCALE.x + Math.cos(a) * 210 * SCALE.s, y: SCALE.y + (Math.sin(a) * 210 + 150) * SCALE.s};
};

export const S1aRoom: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // ── camera: one continuous move through the room, accents on the beats
  const sh = shake(frame, c.slam, 12, 14, 9);
  const cam: Cam = {
    x: kf(frame, [[c.dive, 960], [c.pan - 2, 980], [c.pan + 14, 640], [c.rise, 640], [c.rise + 14, 720], [c.push, 720], [c.push + 10, 540], [c.j4, 560], [c.j4 + 12, 760], [c.slam, 770], [c.slam + 10, 820], [c.back, 820], [c.back + 16, 960], [c.squeeze, 960], [c.squeeze + 10, 1180]], ease.inOut) + sh.x,
    y: kf(frame, [[c.dive, 540], [c.pan + 14, 600], [c.rise + 14, 560], [c.push + 10, 560], [c.j4 + 12, 600], [c.slam + 10, 640], [c.back + 16, 540], [c.squeeze + 10, 600]], ease.inOut) + sh.y,
    zoom: kf(frame, [[c.dive, 1.0], [c.pan - 2, 1.02], [c.pan + 14, 1.18], [c.rise, 1.18], [c.rise + 14, 1.05], [c.push, 1.05], [c.push + 10, 1.45], [c.j4, 1.45], [c.j4 + 12, 1.2], [c.slam, 1.2], [c.slam + 8, 1.36], [c.back, 1.32], [c.back + 16, 0.96], [c.squeeze, 0.96], [c.squeeze + 10, 1.12]], ease.inOut),
    rot: sh.r,
  };
  // punch in on the lantern as it turns cold (the through-object takes the frame), then release
  const punch = prog(frame, c.cold - 1, c.cold + 8, ease.out) * (1 - prog(frame, c.back - 2, c.back + 14, ease.inOut));
  cam.x = cam.x + (860 - cam.x) * punch;
  cam.y = cam.y + (700 - cam.y) * punch;
  cam.zoom = cam.zoom + (2.3 - cam.zoom) * punch;
  // breathing push on every downbeat (weak-beat breath)
  cam.zoom *= 1 + 0.008 * Math.sin((frame / 64) * Math.PI * 2);

  // ── hero
  const heroXAt = (f: number) => kf(f, [[c.dive, 820], [c.rise, 820], [c.rise + 8, 1060], [c.back, 1060], [c.back + 14, 1000], [c.squeeze - 4, 1290], [c.squeeze + 8, 1440]], ease.inOut);
  const heroX = heroXAt(frame);
  const hero = useRig('hero', frame, {
    x: heroXAt,
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.gust - 2, pose: 'catchHat', stiff: 200, damp: 12},
      {at: c.gust + 16, pose: 'tidy', stiff: 120, damp: 13},
      {at: c.door - 2, pose: 'stiff', stiff: 200, damp: 12},
      {at: c.rise, pose: 'stepBack', stiff: 180, damp: 13},
      {at: c.push, pose: 'wince', stiff: 160, damp: 13},
      {at: c.slam - 5, pose: 'lungeL', stiff: 260, damp: 12},
      {at: c.back, pose: 'scratchHead', stiff: 140, damp: 13},
      {at: c.squeeze - 6, pose: 'stand', stiff: 200, damp: 14},
      {at: c.squeeze + 4, pose: 'pushBack', stiff: 200, damp: 11},
    ],
  });
  // ── friend
  const friendXAt = (f: number) => kf(f, [[c.door, 300], [c.door + 34, 1320], [c.back, 1320], [c.back + 20, 1260], [c.squeeze - 8, 1260], [c.squeeze + 10, 900]], ease.inOut);
  const friendX = friendXAt(frame);
  const friend = useRig('friend', frame, {
    x: friendXAt,
    poses: [
      {at: 0, pose: 'holdUmbrella'},
      {at: c.door + 4, pose: 'wave', stiff: 160, damp: 11},
      {at: c.door + 30, pose: 'stand', stiff: 120, damp: 13},
      {at: c.back, pose: 'lookAround', stiff: 120, damp: 13},
    ],
    seed: 13,
  });
  const friendIn = frame >= c.door;

  // ── raincoat blown off by the gust (covers the outfit switch)
  const coatT = prog(frame, c.gust, c.gust + 26, ease.out);
  const coat = frame >= c.gust - 1 && frame < c.gust + 30;

  // ── scale + sprites
  const rise = frame < c.rise ? 0 : spr(frame, c.rise, {damping: 12, stiffness: 140});
  const jumps = [c.j1, c.j2, c.j3, c.j4, c.j5];
  const onPan = jumps.filter((j) => frame >= j).length;
  const tiltSteps: [number, number][] = [[0, -8], ...jumps.map((j, i) => [j, -8 + (i + 1) * 4.5] as [number, number])];
  let tilt = -8;
  for (let i = 1; i < tiltSteps.length; i++) if (frame >= tiltSteps[i][0]) tilt = tiltSteps[i - 1][1] + (tiltSteps[i][1] - tiltSteps[i - 1][1]) * spr(frame, tiltSteps[i][0], {damping: 9, stiffness: 220});
  if (frame >= c.slam) tilt = tilt + (28 - tilt) * spr(frame, c.slam - 1, {damping: 10, stiffness: 320});
  const icons: YarnIcon[] = ['bubble', 'hourglass', 'bow', 'cloud', 'metronome'];
  const arrive = [c.s1, c.s2, c.s3, c.s4, c.s4 + 8];
  const pan = PAN_R(tilt);
  const sprites = icons.map((icon, i) => {
    const enter = c.yarn + i * 5;
    if (frame < enter) return null;
    const floorX = 600 + i * 56;
    const doorX = 330;
    let x = kf(frame, [[enter, doorX], [arrive[i], floorX]], ease.out);
    let y = 930 - Math.abs(Math.sin((frame - enter) / 3)) * 18 * (frame < arrive[i] ? 1 : 0);
    let sq = frame >= arrive[i] ? 1 - 0.25 * pulse(frame, arrive[i], 4) : 1;
    const j = jumps[i];
    if (frame >= j - 12) {
      const t = prog(frame, j - 12, j, (u) => u);
      const tx = pan.x - 76 + i * 38;
      const ty = pan.y + 8;
      x = floorX + (tx - floorX) * t;
      y = 930 + (ty - 930) * t - Math.sin(t * Math.PI) * 180;
      if (frame >= j) {
        x = tx;
        y = ty;
        sq = 1 - 0.3 * pulse(frame, j, 4);
      }
    }
    return <YarnSprite key={icon} icon={icon} x={x} y={y} s={0.72} frame={frame} squash={sq} seed={600 + i} />;
  });
  // kite: sits on the left pan, launched out of the porthole at the slam
  const kiteT = prog(frame, c.slam, c.slam + 26, ease.out);
  const leftPan = (() => {
    const a = (tilt * Math.PI) / 180;
    return {x: SCALE.x - Math.cos(a) * 210 * SCALE.s, y: SCALE.y + (-Math.sin(a) * 210 + 150) * SCALE.s};
  })();
  const kiteX = frame < c.slam ? leftPan.x : leftPan.x + (1180 - leftPan.x) * kiteT;
  const kiteY = frame < c.slam ? leftPan.y - 46 : leftPan.y - 46 + (330 - leftPan.y + 46) * kiteT - Math.sin(kiteT * Math.PI) * 260;
  const kiteS = frame < c.slam ? 0.9 : 0.9 * (1 - kiteT * 0.8);
  const coldT = frame < c.cold ? 0 : spr(frame, c.cold, {damping: 14, stiffness: 120});
  const bellT = (frame - c.bell) / 30;
  const doorOpen = frame < c.door ? 0 : spr(frame, c.door, {damping: 13, stiffness: 140});
  // squeeze: furniture pushed, shelf squashed, books fall
  const sq = frame < c.squeeze ? 0 : spr(frame, c.squeeze + 2, {damping: 9, stiffness: 160});
  const books = [c.b1, c.b2, c.b3];

  return (
    <AbsoluteFill>
      <Stage
        cam={cam}
        bg={<Backdrop top="#2A170D" bottom="#4A2C18" />}
        layers={[
          {
            depth: 0.6,
            node: (
              <g>
                <rect x={-800} y={-600} width={3600} height={1500} fill="#3A2214" />
                {Array.from({length: 30}, (_, i) => (
                  <P key={i} d={roughRect(-800 + i * 120, -600, 116, 1500, 6100 + i, 2, 1.6)} fill={i % 2 ? '#40261A' : '#3A2214'} shadow={3} rim={false} />
                ))}
                <rect x={-800} y={880} width={3600} height={500} fill="#2A170D" />
                <Porthole x={1180} y={330} r={112} frame={frame} sea="#18284A" seed={3} />
                <Glow cx={1180} cy={330} r={260} color="#6F8FC0" opacity={0.25} id="roomwin" />
                <P d={roughRect(1240, 560, 150, 14, 6201, 3, 1)} fill="#6A4428" shadow={4} />
                <ToothCup x={1300} y={560} n={1} />
                <Door x={300} y={900} open={doorOpen} />
                <BellIcon x={300} y={540} ring={frame >= c.bell ? bellT : 9} />
                {/* hook with the blown raincoat landing on it */}
                <path d="M 470 560 q 20 0 20 18" stroke="#8C8690" strokeWidth={5} fill="none" />
              </g>
            ),
          },
          {
            depth: 1,
            node: (
              <g>
                <Rug x={940} y={960} w={900} />
                <g transform={`translate(${-sq * 60} 0)`}>
                  <Bed x={1250 + sq * 30} y={930} />
                </g>
                <Bookshelf x={1640} y={930} frame={frame} tilt={sq * 4} squash={1 - sq * 0.08} booksOut={books.map((b, i) => (frame >= b - 6 ? 3 + i * 5 : -1))} />
                {books.map((b, i) => {
                  if (frame < b - 6) return null;
                  const t = prog(frame, b - 6, b, ease.inQuad);
                  const x = 1580 + i * 40 - t * 30;
                  const y = 700 + i * 30 + t * (220 - i * 30);
                  return <P key={i} d={roughRect(-10, -34, 20, 68, 6300 + i, 2, 1)} fill={['#9E3A2E', '#3F6FA8', '#C9A040'][i]} transform={`translate(${x} ${y}) rotate(${t * (60 + i * 30)})`} shadow={3} />;
                })}
                <g transform={`translate(${-sq * 70} 0)`}>
                  <Table x={900} y={820} w={260} />
                  <g transform="translate(860 802) scale(0.5)">
                    <Lantern frame={frame} id="roomLantern" flame={1 - coldT * 0.45} cold={coldT} glow={0.9 - coldT * 0.3} />
                  </g>
                  <Mug x={980} y={802} />
                  <Chair x={1080 - sq * 20} y={960} />
                </g>
                {/* scale rises from the floor on the left half */}
                <g transform={`translate(0 ${(1 - rise) * 520})`} opacity={clamp(rise * 3)}>
                  <Scale x={SCALE.x} y={SCALE.y} s={SCALE.s} tilt={tilt} />
                  {frame < c.slam + 30 ? <Kite x={kiteX} y={kiteY} s={kiteS} rot={tilt * 0.4 + kiteT * 200} frame={frame} /> : null}
                </g>
                {friendIn ? <Puppet {...friend} look="friend" frame={frame} uid="friendR" x={friendX} y={935} scale={1.06} propR={frame < c.door + 6 ? <Umbrella /> : undefined} /> : null}
                <Puppet {...hero} look="hero" frame={frame} uid="heroR" x={heroX} y={960} scale={1.16} />
                {sprites}
                {coat ? (
                  <g transform={`translate(${heroX - coatT * 420} ${760 - coatT * 300 + coatT * coatT * 120}) rotate(${-coatT * 260}) scale(${1 - coatT * 0.3})`} opacity={1 - prog(frame, c.gust + 20, c.gust + 30)}>
                    <P d={roughPoly([[-50, -60], [50, -60], [64, 70], [-64, 70]], 6401, 2)} fill="#E2B23C" shadow={6} />
                    <P d={roughPoly([[-50, -60], [-90, 10], [-70, 20], [-40, -30]], 6402, 1.5)} fill="#D5A535" shadow={4} />
                    <P d={roughPoly([[50, -60], [90, 10], [70, 20], [40, -30]], 6403, 1.5)} fill="#D5A535" shadow={4} />
                  </g>
                ) : null}
              </g>
            ),
          },
          {
            depth: 1.35,
            blur: 2.5,
            node: (
              <g>
                <HangingPlant x={110} y={330} frame={frame} />
                <P d={roughPoly([[1700, 1100], [1780, 860], [2000, 860], [2100, 1100]], 6501, 3)} fill="#1E120A" shadow={false} />
                <Dust frame={frame} n={22} color="#FFD9A0" seed={8} />
              </g>
            ),
          },
        ]}
      />
      <LightWash x={1700} y={1000} color="#D98A3E" strength={0.38} radius={1300} />
      <LightWash x={1180} y={330} color="#6F8FC0" strength={0.12} radius={500} />
      {onPan >= 0 ? null : null}
    </AbsoluteFill>
  );
};

const Umbrella: React.FC = () => (
  <g transform="rotate(-10)">
    <line x1={0} y1={0} x2={0} y2={-150} stroke="#3A2A20" strokeWidth={5} />
    <path d="M -90 -140 Q 0 -230 90 -140 Q 60 -150 45 -130 Q 22 -150 0 -132 Q -22 -150 -45 -130 Q -60 -150 -90 -140 Z" fill="#C2443F" />
  </g>
);
