import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet, handWorld} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Bed, Chair, Porthole, ToothCup, WallClock} from '../components/props/home';
import {Dust} from '../components/props/sea';
import {Cookie, Crab, OpenBook, Teacup} from '../components/props/extra';
import {ArchMask} from '../components/transitions/Transitions';
import {clamp, ease, kf, prog, pulse, spr} from '../lib/anim';
import {roughPoly, roughRect} from '../lib/paper';
import {cue} from '../lib/timing';

const C = () => ({
  push: cue('pushSplit'),
  wake: cue('topWake'), tea: cue('topTea'), sit: cue('topSit'), read: cue('topRead'),
  drop: cue('dropDown'), bump: cue('chairBump'),
  climb: cue('climbUp'), zip: cue('zipClose'),
  arch: cue('archMask'), cookie: cue('cookieOffer'), peek: cue('crabPeek'), hide: cue('crabHide'), grow: cue('shellGrow1'),
  face: cue('faceClose'),
  wrap: cue('threadWrap'), snap: cue('threadSnap'), dive: cue('diveLantern'),
  end: cue('irisLantern'),
});

/* ── one half-height universe (room drawn in a 1920x540 band) ── */
const MiniRoom: React.FC<{frame: number; wall: string; strip: string; two?: boolean; bright: number}> = ({frame, wall, strip, two, bright}) => (
  <g style={{filter: `brightness(${bright})`}}>
    <rect x={-100} y={-40} width={2120} height={640} fill={wall} />
    {Array.from({length: 18}, (_, i) => (
      <P key={i} d={roughRect(-100 + i * 120, -40, 116, 640, 12000 + i + (two ? 50 : 0), 2, 1.4)} fill={i % 2 ? strip : wall} shadow={2} rim={false} />
    ))}
    <rect x={-100} y={505} width={2120} height={80} fill="#2A170D" />
    <Porthole x={1250} y={170} r={80} frame={frame} sea="#18284A" seed={two ? 12 : 11} />
    {/* clocks: one smooth in the top universe, two out of sync in the bottom one (left side) */}
    <WallClock x={300} y={150} r={56} hourA={frame * (two ? 3 : 0.5)} minA={frame * (two ? 11 : 6)} />
    {two ? <WallClock x={440} y={170} r={46} hourA={-frame * 4 + 40} minA={-frame * 9} /> : null}
    <Bed x={1560} y={505} />
    <Chair x={960} y={505} s={0.8} />
    <P d={roughRect(1080, 380, 200, 16, 12090, 3, 1)} fill="#6A4428" shadow={4} />
    <g transform={`translate(1160 380) rotate(${two ? Math.sin(frame / 3) * 18 : 0})`}>
      <ToothCup x={0} y={0} n={two ? 2 : 1} />
    </g>
  </g>
);

export const S1bUniverses: React.FC<{frame: number}> = ({frame}) => {
  const c = C();
  // ── shot A: split universes (one hero, he moves between them)
  const heroXAt = (f: number) =>
    kf(f, [[c.push, 1350], [c.wake + 6, 1350], [c.tea - 2, 1120], [c.sit - 6, 1120], [c.sit, 960], [c.drop, 960], [c.drop + 12, 720], [c.bump - 14, 720], [c.bump, 905], [c.bump + 10, 820], [c.climb, 820], [c.climb + 14, 960], [c.zip, 960]], ease.inOut);
  const heroYAt = (f: number) => {
    if (f < c.drop) return 505;
    if (f < c.drop + 12) return 505 + (1045 - 505) * ease.inQuad(prog(f, c.drop, c.drop + 12, (t) => t));
    if (f < c.climb) return 1045;
    if (f < c.climb + 14) {
      const t = prog(f, c.climb, c.climb + 14, (u) => u);
      return 1045 + (505 - 1045) * t - Math.sin(t * Math.PI) * 160;
    }
    return 505;
  };
  const hero = useRig('hero', frame, {
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.wake - 4, pose: 'catchHat', stiff: 160, damp: 12},
      {at: c.tea - 4, pose: 'holdLantern', stiff: 150, damp: 13},
      {at: c.sit - 3, pose: 'sit', stiff: 180, damp: 14},
      {at: c.read, pose: 'read', stiff: 140, damp: 14},
      {at: c.drop - 2, pose: 'air', stiff: 240, damp: 13},
      {at: c.drop + 12, pose: 'land', stiff: 300, damp: 11},
      {at: c.drop + 20, pose: 'stiff', stiff: 150, damp: 13},
      {at: c.bump - 6, pose: 'lunge', stiff: 220, damp: 12},
      {at: c.bump, pose: 'stepBack', stiff: 300, damp: 10},
      {at: c.climb - 3, pose: 'leverWindup', stiff: 240, damp: 14},
      {at: c.climb + 3, pose: 'climb', stiff: 220, damp: 13},
      {at: c.climb + 14, pose: 'land', stiff: 300, damp: 11},
      {at: c.climb + 22, pose: 'handsHips', stiff: 140, damp: 13},
    ],
    x: heroXAt,
  });
  const friendXAt = (f: number) => kf(f, [[0, 1250], [c.bump - 14, 1250], [c.bump, 1010], [c.bump + 10, 1100]], ease.inOut);
  const friend = useRig('friend', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.bump - 6, pose: 'lunge'}, {at: c.bump, pose: 'stepBack', stiff: 300, damp: 10}, {at: c.bump + 14, pose: 'stand'}], x: friendXAt, seed: 13});
  const heroInBottom = frame >= c.drop + 6 && frame < c.climb + 8;
  const topBright = heroInBottom ? 0.6 : 1.12;
  const botBright = frame < c.drop ? 0.55 : heroInBottom ? 1.12 : 0.6;
  const fold = prog(frame, c.zip, c.zip + 18, ease.inOut);
  const zipX = kf(frame, [[c.zip - 6, -40], [c.zip + 14, 1960]], ease.inOut);
  const shiftTop = fold * 270;
  const bumpStars = frame >= c.bump && frame < c.bump + 18;

  const split = (
    <AbsoluteFill style={{background: '#22140C'}}>
      {/* top universe */}
      <AbsoluteFill style={{clipPath: 'inset(0 0 540px 0)', transform: `translateY(${shiftTop}px)`}}>
        <svg width={1920} height={540} viewBox="0 0 1920 540" style={{position: 'absolute', top: 0}}>
          <MiniRoom frame={frame} wall="#4E2E18" strip="#5A361E" bright={topBright} />
          {frame >= c.tea - 2 && frame < c.drop ? null : null}
          {frame >= c.read && frame < c.drop ? <g transform="translate(960 410)"><OpenBook x={0} y={0} s={0.7} page={prog(frame, c.read, c.read + 10)} /></g> : null}
        </svg>
      </AbsoluteFill>
      {/* bottom universe (two of everything) folds away at the zip */}
      <AbsoluteFill style={{clipPath: 'inset(540px 0 0 0)', transform: `scaleY(${1 - fold})`, transformOrigin: '50% 540px', opacity: 1 - fold * 0.3}}>
        <svg width={1920} height={540} viewBox="0 0 1920 540" style={{position: 'absolute', top: 540}}>
          <MiniRoom frame={frame} wall="#7A3E1C" strip="#884622" two bright={botBright} />
        </svg>
      </AbsoluteFill>
      {/* divider: torn paper strip with a gold stitch, zipped shut */}
      <svg width={1920} height={1080} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        <g transform={`translate(0 ${shiftTop * 0.5})`}>
          <P d={roughRect(-40, 528, 2000, 26, 12101, 4, 3)} fill="#1C120A" shadow={6} />
          <line x1={0} y1={541} x2={Math.max(0, zipX)} y2={541} stroke="#E8B04B" strokeWidth={4} strokeDasharray="14 10" />
          {frame >= c.zip - 6 && frame < c.zip + 16 ? <P d={roughRect(zipX - 20, 524, 40, 34, 12102, 6, 1)} fill="#E8B04B" shadow={4} /> : null}
        </g>
        {/* friend lives in the bottom universe */}
        {fold < 0.9 ? (
          <g style={{filter: `brightness(${botBright})`}} transform={`translate(0 ${540 * fold}) scale(1 ${1 - fold})`}>
            <Puppet {...friend} look="friend" frame={frame} uid="friendS" x={friendXAt(frame)} y={1045} scale={0.86} />
          </g>
        ) : null}
        {/* the one hero */}
        <g style={{filter: `brightness(${heroInBottom ? 1 : topBright})`}} transform={`translate(0 ${heroInBottom ? 0 : shiftTop})`}>
          <Puppet {...hero} look="hero" frame={frame} uid="heroS" x={heroXAt(frame)} y={heroYAt(frame)} scale={0.86}
            propR={frame >= c.tea - 2 && frame < c.sit ? <g><rect x={-14} y={-26} width={28} height={26} rx={5} fill="#C46A3A" /><path d="M 14 -18 q 10 0 8 10" stroke="#C46A3A" strokeWidth={4} fill="none" /></g> : undefined} />
        </g>
        {bumpStars
          ? [0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + frame / 3;
              return <path key={i} d="M 0 -10 L 3 -3 L 10 0 L 3 3 L 0 10 L -3 3 L -10 0 L -3 -3 Z" fill="#E8B04B" transform={`translate(${960 + Math.cos(a) * 60} ${800 + Math.sin(a) * 26})`} />;
            })
          : null}
      </svg>
      <LightWash x={1700} y={900} color="#D98A3E" strength={0.25} />
    </AbsoluteFill>
  );

  // ── shot B: table close-up — the crab in the teacup
  const peekT = frame < c.peek ? 1 : frame < c.hide ? 1 - spr(frame, c.peek, {damping: 11, stiffness: 160}) : spr(frame, c.hide, {damping: 12, stiffness: 260});
  const shell = 0.9 + (frame >= c.grow ? 0.35 * spr(frame, c.grow, {damping: 8, stiffness: 200}) : 0);
  const handX = kf(frame, [[c.arch, -400], [c.cookie, -400], [c.cookie + 14, 470], [c.hide, 470], [c.hide + 8, 380]], ease.out);
  const camB: Cam = {x: kf(frame, [[c.arch, 980], [c.face, 900]]), y: kf(frame, [[c.arch, 560], [c.face, 600]]), zoom: kf(frame, [[c.arch, 1.0], [c.hide, 1.08], [c.hide + 4, 1.16], [c.face, 1.2]], ease.out)};
  const bgHero = useRig('hero', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.hide, pose: 'crossArms', stiff: 220, damp: 13}]});
  const table = (
    <Stage
      cam={camB}
      bg={<Backdrop top="#3E1A10" bottom="#5A2618" />}
      layers={[
        {
          depth: 0.4,
          blur: 7,
          node: (
            <g>
              <rect x={-400} y={-300} width={2700} height={1500} fill="#4A2214" />
              {Array.from({length: 20}, (_, i) => <rect key={i} x={-400 + i * 140} y={-300} width={60} height={1500} fill="#56281A" />)}
              <Glow cx={1500} cy={300} r={420} color="#D98A3E" opacity={0.5} id="tableglow" />
              <Puppet {...bgHero} look="hero" frame={frame} uid="heroBg" x={1480} y={1000} scale={1.5} />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <P d={roughRect(-300, 780, 2500, 400, 12201, 6, 3)} fill="#7A4A2A" shadow={10} />
              <path d="M -300 800 L 2200 800" stroke="#9C6A42" strokeWidth={6} />
              {/* cup back rim, crab, cup front */}
              <g transform="translate(900 780)">
                <g transform="scale(1.7)">
                  <ellipse cx={0} cy={-110} rx={100} ry={16} fill="#5A3420" />
                </g>
                <g transform={`translate(0 ${-250 + peekT * 210})`}>
                  <Crab x={30} y={0} s={1.25} frame={frame} hide={peekT} shell={shell} />
                </g>
                <g transform="scale(1.7)">
                  <Teacup x={0} y={0} />
                </g>
              </g>
              {/* friend's hand with a cookie, from the left */}
              <g transform={`translate(${handX} 640)`}>
                <P d={roughRect(-900, -40, 900, 80, 12202, 30, 2)} fill="#2E7E78" shadow={6} />
                <P d={roughRect(-30, -50, 60, 100, 12203, 26, 1.5)} fill="#EBC09A" shadow={5} />
                <Cookie x={40} y={-10} s={1.3} />
              </g>
            </g>
          ),
        },
        {depth: 1.4, blur: 3, node: <Dust frame={frame} n={16} color="#FFD9A0" seed={21} />},
      ]}
    />
  );

  // ── shot C: hero face close-up (longing)
  const heroF = useRig('hero', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.face + 10, pose: {...poseShift(), head: 8}}]});
  const camC: Cam = {x: kf(frame, [[c.face, 960], [c.wrap, 900]]), y: 400, zoom: kf(frame, [[c.face, 1.0], [c.wrap, 1.12]], ease.out)};
  const face = (
    <Stage
      cam={camC}
      bg={<Backdrop top="#5A2A14" bottom="#7A3E1C" />}
      layers={[
        {depth: 0.4, blur: 8, node: <g><rect x={-200} y={-200} width={2400} height={1500} fill="#6A3418" /><Glow cx={1600} cy={300} r={500} color="#FFB45A" opacity={0.5} id="faceglow" /><P d={roughRect(1650, 300, 400, 900, 12301, 60, 3)} fill="#2E7E78" shadow={false} /></g>},
        {depth: 1, node: <Puppet {...heroF} look="hero" frame={frame} uid="heroF" x={900} y={1500} scale={3.4} />},
      ]}
    />
  );

  // ── shot D: room mid — the thread snaps, then the camera dives into the cold lantern
  const heroD = useRig('hero', frame, {
    poses: [
      {at: 0, pose: 'stand'},
      {at: c.wrap, pose: 'stiff', stiff: 160, damp: 13},
      {at: c.snap - 4, pose: 'leverWindup', stiff: 240, damp: 14},
      {at: c.snap, pose: 'crossArms', stiff: 280, damp: 11},
    ],
  });
  const friendDX = (f: number) => kf(f, [[c.face, 1380], [c.wrap, 1380], [c.wrap + 12, 1260]], ease.inOut);
  const friendD = useRig('friend', frame, {poses: [{at: 0, pose: 'stand'}, {at: c.wrap, pose: 'reachHook', stiff: 140, damp: 13}, {at: c.snap + 2, pose: 'stepBack', stiff: 200, damp: 12}], x: friendDX, seed: 13});
  const turn = frame < c.snap ? 1 : Math.cos(Math.PI * clamp(spr(frame, c.snap + 2, {damping: 14, stiffness: 160})));
  const hHand = handWorld(heroD.pose, 1, 760, 980, 1.25);
  const fHand = handWorld(friendD.pose, 1, friendDX(frame), 980, 1.2);
  const snapT = frame < c.snap ? 0 : prog(frame, c.snap, c.snap + 8, ease.out);
  const midX = (hHand[0] + fHand[0]) / 2;
  const midY = Math.max(hHand[1], fHand[1]) + 60;
  const diveT = prog(frame, c.dive - 4, c.end, ease.in);
  const lanternW: [number, number] = [960, 790 - 128 * 0.55];
  const camD: Cam = {
    x: kf(frame, [[c.wrap - 16, 980], [c.snap, 960]]) * (1 - diveT) + lanternW[0] * diveT,
    y: kf(frame, [[c.wrap - 16, 600], [c.snap, 600]]) * (1 - diveT) + (lanternW[1] - 20) * diveT,
    zoom: kf(frame, [[c.wrap - 16, 1.0], [c.snap, 1.06]]) * (1 - diveT) + 6 * diveT,
  };
  const mid = (
    <Stage
      cam={camD}
      bg={<Backdrop top="#5A2A14" bottom="#7A3E1C" />}
      layers={[
        {
          depth: 0.6,
          node: (
            <g>
              <rect x={-600} y={-500} width={3200} height={1400} fill="#6A3418" />
              {Array.from({length: 26}, (_, i) => <P key={i} d={roughRect(-600 + i * 130, -500, 126, 1400, 12400 + i, 2, 1.4)} fill={i % 2 ? '#743A1C' : '#6A3418'} shadow={2} rim={false} />)}
              <rect x={-600} y={900} width={3200} height={500} fill="#3A1E0E" />
              <Porthole x={1500} y={300} r={100} frame={frame} sea="#18284A" seed={13} />
            </g>
          ),
        },
        {
          depth: 1,
          node: (
            <g>
              <P d={roughRect(820, 790, 280, 22, 12450, 5, 1.6)} fill="#6A4428" shadow={7} />
              <P d={roughRect(840, 810, 16, 170, 12451, 3, 1)} fill="#4E311C" shadow={4} />
              <P d={roughRect(1066, 810, 16, 170, 12452, 3, 1)} fill="#4E311C" shadow={4} />
              <g transform="translate(960 790) scale(0.55)">
                <Lantern frame={frame} id="s1bLantern" flame={0.6} cold={1} glow={0.75} />
              </g>
              <Puppet {...friendD} look="friend" frame={frame} uid="friendD" x={friendDX(frame)} y={980} scale={1.2} />
              <g transform={`translate(760 0) scale(${turn} 1) translate(-760 0)`}>
                <Puppet {...heroD} look="hero" frame={frame} uid="heroD" x={760} y={980} scale={1.25} />
              </g>
              {/* the yarn leash between the two hands; snaps and recoils */}
              {frame >= c.wrap + 8 ? (
                snapT <= 0 ? (
                  <path d={`M ${hHand[0]} ${hHand[1]} Q ${midX} ${midY} ${fHand[0]} ${fHand[1]}`} fill="none" stroke="#C85A5A" strokeWidth={5} />
                ) : (
                  <g opacity={1 - snapT}>
                    <path d={`M ${hHand[0]} ${hHand[1]} q ${30 + snapT * 60} ${40} ${20 + snapT * 80} ${80 + snapT * 60}`} fill="none" stroke="#C85A5A" strokeWidth={5} />
                    <path d={`M ${fHand[0]} ${fHand[1]} q ${-30 - snapT * 60} ${40} ${-20 - snapT * 80} ${80 + snapT * 60}`} fill="none" stroke="#C85A5A" strokeWidth={5} />
                  </g>
                )
              ) : null}
            </g>
          ),
        },
      ]}
    />
  );

  // ── assemble along time (shot changes are camera moves / a designed transition, never a hard page flip)
  if (frame < c.arch) return split;
  if (frame < c.arch + 20) return <ArchMask frame={frame} at={c.arch + 14} outgoing={split} incoming={table} />;
  if (frame < c.face - 6) return table;
  if (frame < c.face) {
    // push in on the background hero: the table blurs away as we rack focus to his face
    const t = prog(frame, c.face - 6, c.face, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{transform: `scale(${1 + t * 0.6})`, transformOrigin: '1480px 500px', filter: `blur(${t * 10}px)`, opacity: 1 - t}}>{table}</AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{face}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  if (frame < c.wrap - 16) return face;
  if (frame < c.wrap - 8) {
    // pull back out of the face into the room
    const t = prog(frame, c.wrap - 16, c.wrap - 8, ease.inOut);
    return (
      <AbsoluteFill>
        <AbsoluteFill style={{opacity: t}}>{mid}</AbsoluteFill>
        <AbsoluteFill style={{opacity: 1 - t, transform: `scale(${1 - t * 0.4})`, transformOrigin: '760px 420px'}}>{face}</AbsoluteFill>
      </AbsoluteFill>
    );
  }
  return mid;
};

const poseShift = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
export {pulse, roughPoly};
