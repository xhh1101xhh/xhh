/** Skeleton pose. Angles in degrees. Limbs hang down at 0; positive rotates the limb toward screen-left
 *  (SVG clockwise). Forearm / shin angles are relative to their parent. */
export type Pose = {
  x: number; // root offset (px)
  y: number; // root offset (px, - = up)
  lean: number; // torso rotation around the hip
  head: number; // head tilt relative to torso
  uaL: number; faL: number; uaR: number; faR: number;
  thL: number; shL: number; thR: number; shR: number;
  thighK: number; // thigh length factor (foreshortening when seated)
  squash: number; // body scaleY (anticipation / landing)
};

const P0: Pose = {x: 0, y: 0, lean: 0, head: 0, uaL: 12, faL: -8, uaR: -12, faR: 8, thL: 4, shL: -2, thR: -4, shR: 2, thighK: 1, squash: 1};
const p = (o: Partial<Pose>): Pose => ({...P0, ...o});

export const POSES = {
  stand: P0,
  standAlert: p({lean: -3, head: -4, uaL: 18, faL: -20, uaR: -22, faR: 20, y: -2}),
  leverGrab: p({lean: -4, head: -10, uaR: -128, faR: -8, uaL: 20, faL: -24, y: -2}),
  reachHookL: p({lean: 6, head: 8, uaL: 120, faL: -10, uaR: -14, faR: 10}),
  holdLanternL: p({lean: 2, head: 10, uaL: 40, faL: -100, uaR: -20, faR: 12}),
  raiseLanternL: p({lean: 2, head: 6, uaL: 70, faL: -150, uaR: -16, faR: 10}),
  lungeL: p({lean: -12, head: 10, uaL: 150, faL: 10, uaR: -40, faR: -20, x: -40, thL: 30, shL: -40, thR: -20, shR: 20, y: 8}),
  crossArms: p({lean: -2, head: -4, uaL: 22, faL: -118, uaR: -22, faR: 118}),
  read: p({lean: 4, head: 14, uaL: 30, faL: -110, uaR: -30, faR: 110, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  sitLookUp: p({lean: -4, head: -12, uaL: 24, faL: -60, uaR: -24, faR: 60, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  hugKnees: p({lean: 14, head: 16, uaL: 40, faL: -100, uaR: -40, faR: 100, thighK: 0.3, y: 70, thL: 30, shL: -150, thR: -30, shR: 150, squash: 0.94}),
  pushUp: p({lean: -6, head: -16, uaL: 165, faL: -10, uaR: -165, faR: 10, y: -4}),
  carry: p({lean: 6, head: 4, uaL: 150, faL: -60, uaR: -150, faR: 60, squash: 0.97}),
  openArms: p({lean: -4, head: -8, uaL: 110, faL: -20, uaR: -110, faR: 20}),
  kneelPlay: p({lean: 10, head: 14, uaL: 40, faL: -50, uaR: -50, faR: 40, thighK: 0.4, y: 50, thL: 40, shL: -110, thR: -30, shR: 100}),
  lookBack: p({lean: -8, head: -18, uaL: 30, faL: -40, uaR: -40, faR: 30, thighK: 0.4, y: 50, thL: 40, shL: -110, thR: -30, shR: 100}),
  water: p({lean: 8, head: 10, uaR: -70, faR: -50, uaL: 20, faL: -30}),
  fish: p({lean: 4, head: 6, uaR: -50, faR: -60, uaL: 30, faL: -70, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  pat: p({lean: 6, head: 10, uaR: -80, faR: -30, uaL: 24, faL: -60, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  matchR: p({lean: 4, head: 12, uaL: 40, faL: -100, uaR: -20, faR: -120}),
  leverWindup: p({lean: -6, head: -6, uaR: -150, faR: -20, uaL: 22, faL: -30, squash: 0.94, y: 6, thL: 10, shL: -14, thR: -6, shR: 10}),
  leverDown: p({lean: 8, head: 6, uaR: -60, faR: -40, uaL: 18, faL: -20, squash: 1.02, y: 0}),
  exhale: p({lean: 4, head: 6, uaL: 6, faL: -4, uaR: -6, faR: 4, y: 3, squash: 0.98}),
  handsHips: p({lean: -2, head: -5, uaL: 58, faL: -120, uaR: -58, faR: 120}),
  reachHook: p({lean: -4, head: -10, uaR: -160, faR: 10, uaL: 15, faL: -10}),
  holdLantern: p({lean: 0, head: 8, uaR: -40, faR: -95, uaL: 30, faL: -80}),
  strikeMatch: p({lean: 2, head: 10, uaR: -38, faR: -100, uaL: 50, faL: -110}),
  eat: p({lean: 6, head: 8, uaR: -10, faR: -165, uaL: 34, faL: -80, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  slamShutter: p({lean: -10, head: -8, uaR: -120, faR: -30, uaL: 30, faL: -40, x: 8}),
  climb: p({lean: -2, head: -14, uaR: -170, faR: 0, uaL: -150, faL: 10, thL: 30, shL: -60, thR: -4, shR: 4, y: -40}),
  air: p({lean: -4, head: -8, uaR: -100, faR: 30, uaL: 100, faL: -30, thL: 20, shL: -40, thR: -24, shR: 44, y: -70, squash: 1.04}),
  land: p({lean: 8, head: 8, uaR: -50, faR: -30, uaL: 50, faL: 30, thL: 30, shL: -60, thR: -30, shR: 60, y: 26, squash: 0.88}),
  poke: p({lean: -6, head: -8, uaL: 95, faL: -25, uaR: -14, faR: 20}),
  sit: p({lean: 2, head: 4, uaL: 24, faL: -60, uaR: -24, faR: 60, thighK: 0.35, y: 40, thL: 16, shL: -16, thR: -16, shR: 16}),
  sitSlump: p({lean: 6, head: 12, uaL: 16, faL: -40, uaR: -16, faR: 40, thighK: 0.35, y: 44, thL: 18, shL: -18, thR: -18, shR: 18, squash: 0.96}),
  catchHat: p({lean: -6, head: -16, uaL: 160, faL: -20, uaR: -160, faR: 20, y: -6}),
  tidy: p({lean: 2, head: 10, uaL: 30, faL: -100, uaR: -30, faR: 100}),
  stiff: p({lean: -4, head: -2, uaL: 6, faL: 0, uaR: -6, faR: 0, squash: 1.02}),
  stepBack: p({lean: -10, head: -6, uaL: 30, faL: -60, uaR: -60, faR: -40, x: -40, thL: 14, shL: -4, thR: -16, shR: 6}),
  wince: p({lean: -4, head: -8, uaL: 40, faL: -110, uaR: -40, faR: 110, squash: 0.98}),
  lunge: p({lean: 14, head: -12, uaR: -150, faR: -10, uaL: 40, faL: -20, x: 70, thL: 30, shL: -20, thR: -30, shR: 40, y: 8}),
  scratchHead: p({lean: 2, head: 10, uaR: -165, faR: -60, uaL: 14, faL: -6}),
  pushBack: p({lean: -12, head: -8, uaL: 80, faL: -40, uaR: -80, faR: 40, thL: 24, shL: -12, thR: -24, shR: 12, squash: 0.95, y: 8}),
  wave: p({lean: -2, head: -6, uaR: -150, faR: -30, uaL: 14, faL: -8}),
  holdUmbrella: p({uaR: -40, faR: -100, uaL: 14, faL: -10}),
  lookAround: p({lean: 2, head: 14, uaL: 20, faL: -30, uaR: -20, faR: 30}),
};
export type PoseName = keyof typeof POSES;

const KEYS = Object.keys(P0) as (keyof Pose)[];
export const blendPose = (a: Pose, b: Pose, t: number): Pose => {
  const o = {...a};
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * t;
  return o;
};
export const addPose = (a: Pose, d: Partial<Pose>): Pose => {
  const o = {...a};
  for (const k of Object.keys(d) as (keyof Pose)[]) o[k] = a[k] + (d[k] ?? 0);
  return o;
};
