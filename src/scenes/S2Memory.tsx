import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Backdrop, Cam, LightWash, Stage} from '../components/Stage';
import {Glow, P} from '../components/Paper';
import {Lantern} from '../components/Lantern';
import {Puppet} from '../components/character/Puppet';
import {useRig} from '../components/character/useCharacter';
import {Dust} from '../components/props/sea';
import {Armchair, Blocks, MemWindow, OpenBook, PaperBoatToy, PortraitCard} from '../components/props/extra';
import {Rug} from '../components/props/home';
import {clamp, ease, kf, prog, spr} from '../lib/anim';
import {roughCircle, roughRect} from '../lib/paper';
import {cue, frameOf} from '../lib/timing';
import {QUIET} from '../data/beats';

const C = () => ({
  iris: cue('irisLantern'), card: cue('cardSlide'), asm: cue('roomAssemble'), play: cue('kidPlay'),
  door: cue('doorWipe'), wind: cue('windowBurst'), tip: cue('boatTip'), look: cue('kidLookBack'), page: cue('momPage'),
  flow: cue('lightFlow'), end: cue('goldTrace1'),
});

const KID = {x: 760, y: 930, s: 1.0};
const MOM = {x: 1460, y: 930};
export const kidChest = (s = KID.s) => [KID.x, KID.y - 166 * s] as [number, number];

export const S2Memory: React.FC<{frame: number}> = ({frame: f0}) => {
  const c = C();
  // the air-gap after the boat tips: everything holds still for a few frames (picture pause on the music's hole)
  const gap = QUIET.find((q) => q.kind === 'gap' && q.start > c.tip && q.start < c.look) ?? {start: c.tip + 9, end: c.tip + 12};
  // hold 4 frames, then catch up (slightly faster) so the next key action still lands exactly on its beat
  const hold = gap.start + 4;
  const frame =
    f0 <= gap.start || f0 >= c.look ? f0 : f0 <= hold ? gap.start : gap.start + ((f0 - hold) * (c.look - gap.start)) / Math.max(1, c.look - hold);
  // light-flow steps land on the detected stutter gaps of the riser
  const steps = QUIET.filter((q) => q.kind === 'gap' && q.start >= c.flow && q.start < c.end).map((q) => q.start).slice(-3);
  while (steps.length < 3) steps.push(c.flow + 20 + steps.length * 12);
  const assembleAt = [0, 1, 2, 3].map((i) => frameOf(`D:3.${i + 1}`));

  // ── kid
  const kid = useRig('kid', frame, {
    poses: [
      {at: 0, pose: 'kneelPlay'},
      {at: c.play, pose: {...base(), lean: 14, head: 16, uaL: 30, faL: -40, uaR: -70, faR: 20, thighK: 0.4, y: 50, thL: 40, shL: -110, thR: -30, shR: 100}, stiff: 90, damp: 10},
      {at: c.play + 30, pose: 'kneelPlay', stiff: 90, damp: 10},
      {at: c.wind, pose: {...base(), lean: -10, head: -6, uaL: 60, faL: -120, uaR: -60, faR: 120, thighK: 0.4, y: 46, thL: 40, shL: -110, thR: -30, shR: 100, squash: 0.95}, stiff: 260, damp: 12},
      {at: c.look, pose: 'lookBack', stiff: 160, damp: 13},
      {at: c.page + 12, pose: 'kneelPlay', stiff: 110, damp: 14},
      {at: c.flow, pose: {...base(), lean: 4, head: 20, uaL: 20, faL: -30, uaR: -40, faR: -110, thighK: 0.4, y: 50, thL: 40, shL: -110, thR: -30, shR: 100}, stiff: 100, damp: 14},
    ],
  });
  const mom = useRig('mom', frame, {poses: [{at: 0, pose: 'read'}, {at: c.page - 3, pose: {...base(), lean: 2, head: 10, uaL: 30, faL: -110, uaR: -60, faR: 70, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}, stiff: 200, damp: 13}, {at: c.page + 8, pose: 'read', stiff: 140, damp: 14}], outfit: 'mom', idle: 0.6});

  // ── camera: glow -> card -> room (kid) -> door wipe widens -> wind push -> look back -> chest
  const cam: Cam = {
    x: kf(frame, [[c.iris, 960], [c.asm, 960], [c.asm + 20, 860], [c.door - 6, 840], [c.door + 8, 1060], [c.wind - 10, 1000], [c.wind, 860], [c.look, 900], [c.look + 16, 1060], [c.flow - 4, 1040], [c.flow + 26, KID.x], [c.end, KID.x]], ease.inOut),
    y: kf(frame, [[c.iris, 540], [c.asm, 540], [c.asm + 20, 600], [c.door + 8, 560], [c.wind, 600], [c.look + 16, 560], [c.flow - 4, 560], [c.flow + 26, kidChest()[1]], [c.end, kidChest()[1]]], ease.inOut),
    zoom: kf(frame, [[c.iris, 1.0], [c.asm, 1.0], [c.asm + 20, 1.25], [c.door - 6, 1.32], [c.door + 8, 0.95], [c.wind - 10, 0.98], [c.wind, 1.18], [c.look, 1.12], [c.look + 16, 0.98], [c.flow - 4, 1.0], [c.flow + 26, 2.8], [c.end, 3.4]], ease.inOut),
  };
  const roomIn = prog(frame, c.asm - 10, c.asm + 6);
  const piece = (i: number, fromX: number, fromY: number) => {
    const t = frame < assembleAt[i] - 8 ? 0 : spr(frame, assembleAt[i] - 8, {damping: 12, stiffness: 170});
    return {t, tr: `translate(${(1 - t) * fromX} ${(1 - t) * fromY}) rotate(${(1 - t) * (i % 2 ? 25 : -20)})`};
  };
  const pRug = piece(0, -900, 300);
  const pWin = piece(1, -700, -600);
  const pToys = piece(2, 600, 500);
  const pWall = piece(3, 900, -400);
  const partition = frame < c.door - 10 ? 0 : prog(frame, c.door - 10, c.door, ease.inOut); // slides off to the left = the wipe
  const windOpen = frame < c.wind ? 0 : spr(frame, c.wind, {damping: 9, stiffness: 140});
  const boatRot = frame < c.tip ? Math.sin(frame / 10) * 4 : 160 * spr(frame, c.tip - 2, {damping: 10, stiffness: 220});
  const boatX = KID.x + 150 + (frame >= c.play && frame < c.wind ? Math.sin((frame - c.play) / 9) * 40 : 0) + (frame >= c.page + 12 ? 0 : 0);
  const righted = frame >= c.page + 12;
  const coolDim = frame >= c.wind && frame < c.look + 10 ? 0.35 * prog(frame, c.wind, c.wind + 8) * (1 - prog(frame, c.look, c.look + 10)) : 0;
  const flowT = prog(frame, c.flow, steps[0], ease.inOut);
  const ember = steps.filter((s) => frame >= s).length / 3;
  const emberPulse = steps.reduce((a, s) => a + (frame >= s ? Math.exp(-(frame - s) / 5) : 0), 0);
  const [cx, cy] = kidChest();
  const glowA = clamp(1 - prog(frame, c.iris + 30, c.asm, ease.inOut));
  const cardT = frame < c.card ? 0 : spr(frame, c.card, {damping: 13, stiffness: 120});
  const cardOut = prog(frame, c.asm - 6, c.asm + 10, ease.in);

  return (
    <AbsoluteFill>
      <Stage
        cam={cam}
        bg={<Backdrop top="#2E1420" bottom="#5A2A3A" />}
        layers={[
          {
            depth: 0.5,
            node: (
              <g>
                {/* inside the lantern: warm rings forming a lamp shape */}
                <g opacity={glowA}>
                  <Glow cx={960} cy={520} r={900} color="#E3A24F" opacity={0.7} id="s2core" />
                  {[0, 1, 2, 3, 4].map((i) => (
                    <path key={i} d={roughCircle(960, 520, 160 + i * 130, 13000 + i, 6, 22)} fill="none" stroke={i % 2 ? '#C97A5A' : '#E3A24F'} strokeWidth={14 - i * 2} opacity={0.5} transform={`rotate(${frame * (i % 2 ? 0.3 : -0.4)} 960 520)`} />
                  ))}
                </g>
                {/* the memory room walls (assemble in) */}
                <g opacity={roomIn}>
                  <rect x={-800} y={-500} width={3600} height={1400} fill="#4A2232" />
                  {Array.from({length: 18}, (_, i) =>
                    Array.from({length: 8}, (_, j) => <path key={`${i}-${j}`} d={`M ${-700 + i * 200} ${-400 + j * 160} l 14 14 l -14 14 l -14 -14 z`} fill="#5A2A3E" />),
                  )}
                  <rect x={-800} y={900} width={3600} height={600} fill="#2E1520" />
                </g>
                <g opacity={roomIn} transform={pWin.tr}>
                  <MemWindow x={380} y={420} frame={frame} open={windOpen} />
                </g>
                <g opacity={roomIn} transform={pWall.tr}>
                  {/* picture frame + shelf on the far wall */}
                  <P d={roughRect(980, 250, 180, 140, 13101, 4, 2)} fill="#6A3A2A" shadow={6} />
                  <rect x={996} y={266} width={148} height={108} fill="#7A4A5E" />
                  <circle cx={1070} cy={320} r={30} fill="#E8B04B" opacity={0.6} />
                </g>
              </g>
            ),
          },
          {
            depth: 1,
            node: (
              <g opacity={roomIn}>
                <g transform={pRug.tr}><Rug x={900} y={950} w={1100} /></g>
                {/* mom's corner: armchair, side table, the same lantern */}
                <Armchair x={MOM.x} y={950} s={0.9} />
                <P d={roughRect(1610, 800, 140, 16, 13201, 3, 1)} fill="#6A3A2A" shadow={5} />
                <P d={roughRect(1670, 816, 18, 134, 13202, 3, 1)} fill="#4A2416" shadow={4} />
                <g transform="translate(1680 800) scale(0.55)">
                  <Lantern frame={frame} id="momLantern" flame={1} glow={1.1} />
                </g>
                <Puppet {...mom} look="mom" frame={frame} uid="mom" x={MOM.x} y={MOM.y - 30} scale={1.15} propR={<g transform="translate(-10 -10)"><OpenBook x={0} y={0} s={0.55} page={frame >= c.page && frame < c.page + 10 ? (frame - c.page) / 10 : 0} /></g>} />
                {/* light pool from the lamp that reaches the kid */}
                <path d={`M 1680 760 L ${KID.x - 120} 960 L ${KID.x + 200} 980 Z`} fill="#FFC870" opacity={0.12 + 0.06 * Math.sin(frame / 20)} style={{mixBlendMode: 'screen'}} />
                <g transform={pToys.tr}>
                  <Blocks x={KID.x - 200} y={960} s={0.9} />
                  <g transform={`translate(${righted ? KID.x + 150 : boatX} 950) rotate(${righted ? 0 : boatRot})`}>
                    <PaperBoatToy x={0} y={0} s={0.9} />
                  </g>
                </g>
                <Puppet {...kid} look="kid" frame={frame} uid="kid" x={KID.x} y={KID.y} scale={KID.s} />
                {/* light ribbon flows from the lamp into the kid's chest, then the ember */}
                {frame >= c.flow ? (
                  <g>
                    <path d={`M 1680 690 Q ${(1680 + cx) / 2} ${cy - 240} ${cx} ${cy}`} fill="none" stroke="#FFD27A" strokeWidth={10} strokeLinecap="round" strokeDasharray={1800} strokeDashoffset={1800 * (1 - flowT)} opacity={0.85 * (1 - ember * 0.6)} style={{filter: 'blur(1px)'}} />
                    <Glow cx={cx} cy={cy} r={60 + ember * 140 + emberPulse * 40} color="#FFC870" opacity={0.3 + ember * 0.6} id="kidEmber" />
                    <g transform={`translate(${cx} ${cy + 14}) scale(${0.08 + ember * 0.1})`} opacity={ember}>
                      <Lantern frame={frame} id="emberLantern" flame={1.1} glow={0.4} />
                    </g>
                  </g>
                ) : null}
              </g>
            ),
          },
          {
            depth: 1.35,
            blur: 3,
            node: (
              <g>
                {/* the partition (paper sliding door) that wipes across to reveal mom */}
                {partition < 1 ? (
                  <g transform={`translate(${-partition * 1500} 0)`} opacity={roomIn}>
                    <P d={roughRect(1150, -300, 700, 1500, 13301, 6, 3)} fill="#6A3A2A" shadow={14} />
                    {Array.from({length: 4}, (_, i) => Array.from({length: 7}, (_, j) => <rect key={`${i}${j}`} x={1180 + i * 165} y={-260 + j * 200} width={150} height={180} fill="#8C5A44" opacity={0.85} />))}
                  </g>
                ) : null}
                <Dust frame={frame} n={20} color="#FFD9A0" seed={31} />
              </g>
            ),
          },
        ]}
      />
      {/* Winnicott card (left, icon only) */}
      {cardT > 0.01 && cardOut < 1 ? (
        <AbsoluteFill style={{transform: `translate(${(1 - cardT) * -700 - cardOut * 700}px, 0px)`}}>
          <svg width={1920} height={1080}>
            <PortraitCard x={430} y={470} s={1.15} rot={-4 + Math.sin(frame / 30) * 1.5} />
          </svg>
        </AbsoluteFill>
      ) : null}
      <LightWash x={1680} y={700} color="#E3A24F" strength={0.35} radius={1100} />
      <AbsoluteFill style={{background: '#1A1030', opacity: coolDim, mixBlendMode: 'multiply'}} />
    </AbsoluteFill>
  );
};

const base = () => ({x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1});
