import React from 'react';
import {Glaze, Glow, GoldLine, P} from '../Paper';
import {noise1} from '../../lib/anim';
import {rng, roughCircle, roughEllipse, roughPoly, roughRect} from '../../lib/paper';

/* ---------------- porcelain teacup (blue-and-white) ---------------- */
export const Teacup: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughEllipse(0, 4, 120, 18, 11001, 2)} fill="#C9C1AE" shadow={6} />
    <path d="M 96 -70 q 46 0 40 36 q -6 30 -44 26" fill="none" stroke="#E9E3D6" strokeWidth={14} />
    <P d={roughPoly([[-100, -110], [100, -110], [80, -10], [50, 6], [-50, 6], [-80, -10]], 11002, 1.6)} fill="#ECE6D8" shadow={7} />
    <path d="M -92 -80 Q -60 -96 -30 -80 T 30 -80 T 92 -80" fill="none" stroke="#3F6FA8" strokeWidth={6} />
    <path d="M -76 -40 Q -50 -52 -24 -40 T 24 -40 T 76 -40" fill="none" stroke="#5A86BC" strokeWidth={4} />
    {[-50, 0, 50].map((cx) => <circle key={cx} cx={cx} cy={-60} r={6} fill="#3F6FA8" />)}
    <P d={roughEllipse(0, -110, 100, 16, 11003, 1.4)} fill="#7A4A2A" shadow={false} />
    <Glaze cx={-60} cy={-70} rx={18} ry={30} strength={0.85} />
  </g>
);

/* ---------------- 寄居蟹壳壳: porcelain shell (blue-and-white), hide 0 out .. 1 retracted ---------------- */
export const Crab: React.FC<{x: number; y: number; s?: number; frame: number; hide?: number; shell?: number; gold?: number; flower?: number; crack?: number}> = ({x, y, s = 1, frame, hide = 0, shell = 1, gold = 0, flower = 0, crack = 0}) => {
  const out = 1 - hide;
  const look = Math.sin(frame / 14) * 4;
  const crackD = 'M -20 -150 L -6 -120 L -18 -96 L 0 -70 L -8 -44';
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* legs + claws peek out from the opening (left) */}
      <g opacity={out} transform={`translate(${-60 * hide} 0)`}>
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M -40 ${-20 - i * 12} q -30 ${10 + i * 4} -44 ${30 + i * 6}`} fill="none" stroke="#D2604A" strokeWidth={8} strokeLinecap="round" transform={`rotate(${Math.sin(frame / 5 + i) * 6 * out} -40 ${-20 - i * 12})`} />
        ))}
        <P d={roughEllipse(-96, -70, 26, 18, 11101, 1.2)} fill="#E0705A" shadow={3} />
        <path d="M -110 -80 l -14 -10 M -110 -62 l -16 4" stroke="#B84A3A" strokeWidth={6} strokeLinecap="round" />
        <line x1={-56} y1={-70} x2={-64} y2={-112 + look} stroke="#D2604A" strokeWidth={5} />
        <line x1={-40} y1={-70} x2={-42} y2={-116 - look} stroke="#D2604A" strokeWidth={5} />
        <circle cx={-64} cy={-118 + look} r={10} fill="#FBF6EC" />
        <circle cx={-42} cy={-122 - look} r={10} fill="#FBF6EC" />
        <circle cx={-62} cy={-117 + look} r={5} fill="#1A1218" />
        <circle cx={-40} cy={-121 - look} r={5} fill="#1A1218" />
      </g>
      {/* the shell */}
      <g transform={`scale(${shell})`} style={{transformOrigin: '0px 0px'}}>
        <P d={roughPoly([[-60, 0], [-70, -60], [-40, -130], [10, -170], [60, -150], [86, -90], [80, -20], [50, 4]], 11102, 2)} fill="#ECE6D8" shadow={8} />
        <path d="M -40 -110 Q 0 -150 50 -120 Q 70 -80 40 -50 Q 0 -30 -20 -60 Q -30 -90 10 -100" fill="none" stroke="#3F6FA8" strokeWidth={7} strokeLinecap="round" />
        {[[-30, -30], [40, -24], [60, -110], [-50, -80]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill="#3F6FA8" />)}
        <P d={roughEllipse(-52, -40, 18, 34, 11103, 1.2)} fill="#2A1E26" shadow={false} />
        <Glaze cx={-10} cy={-120} rx={24} ry={36} strength={0.9} />
        {crack > 0 ? <path d={crackD} fill="none" stroke="#2A3658" strokeWidth={4} strokeDasharray={200} strokeDashoffset={200 * (1 - crack)} strokeLinecap="round" /> : null}
        {gold > 0 ? <GoldLine d={crackD} t={gold} width={5} length={200} /> : null}
        {flower > 0 ? (
          <g transform={`translate(-52 -70) scale(${flower})`}>
            <path d="M 0 0 q -4 -20 2 -40" stroke="#4E7A5A" strokeWidth={4} fill="none" />
            {[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx={2} cy={-48} rx={6} ry={12} fill="#E2657A" transform={`rotate(${a} 2 -40)`} />)}
            <circle cx={2} cy={-40} r={5} fill="#E8B04B" />
          </g>
        ) : null}
      </g>
    </g>
  );
};

export const Cookie: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughCircle(0, 0, 28, 11201, 1.5)} fill="#C98A4A" shadow={4} />
    {[[-8, -6], [10, 4], [-2, 12], [8, -12]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={3.5} fill="#5A3A22" />)}
  </g>
);

/* ---------------- distance–irritation thermometer (left side, icons only) ---------------- */
export const Thermometer: React.FC<{x: number; y: number; level: number; s?: number; boil?: number}> = ({x, y, level, s = 1, boil = 0}) => {
  const h = 360;
  const col = h * Math.max(0.05, Math.min(1, level));
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <P d={roughRect(-34, -h - 30, 68, h + 40, 11301, 30, 1.6)} fill="rgba(210,228,240,0.18)" shadow={6} />
      <rect x={-12} y={-col} width={24} height={col} rx={10} fill="#E2657A" />
      <P d={roughCircle(0, 30, 40, 11302, 1.4)} fill="#E2657A" shadow={5} />
      {Array.from({length: 7}, (_, i) => <line key={i} x1={20} x2={34} y1={-30 - i * 48} y2={-30 - i * 48} stroke="#F3EBDD" strokeWidth={3} opacity={0.7} />)}
      <Glaze cx={-14} cy={-h / 2} rx={8} ry={h / 3} rot={0} strength={0.7} />
      {/* boat icon = "someone approaching" */}
      <g transform="translate(-90 20)">
        <path d="M -30 -10 L 30 -10 L 20 8 L -20 8 Z" fill="#E9DFC9" />
        <path d="M 0 -10 L 0 -40 L 20 -14 Z" fill="#C2443F" />
        <path d="M 40 -4 L 66 -4 M 58 -12 L 66 -4 L 58 4" stroke="#F3EBDD" strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
      {boil > 0
        ? Array.from({length: 8}, (_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 30} y1={-h - 40 + Math.sin(a) * 30} x2={Math.cos(a) * (30 + 70 * boil)} y2={-h - 40 + Math.sin(a) * (30 + 70 * boil)} stroke="#E2657A" strokeWidth={6} strokeLinecap="round" opacity={1 - boil * 0.6} />;
          })
        : null}
    </g>
  );
};

/* ---------------- porcelain dome over the island ---------------- */
export const Dome: React.FC<{cx: number; cy: number; r: number; t: number; crack?: number; opacity?: number}> = ({cx, cy, r, t, crack = 0, opacity = 1}) => {
  if (t <= 0.01) return null;
  const rr = r * t;
  return (
    <g opacity={opacity}>
      <path d={`M ${cx - rr} ${cy} A ${rr} ${rr * 0.86} 0 0 1 ${cx + rr} ${cy} Z`} fill="rgba(236,230,216,0.86)" />
      {[0.3, 0.55, 0.8].map((k, i) => (
        <path key={i} d={`M ${cx - rr * k * 1.1} ${cy - rr * 0.86 * Math.sqrt(1 - k * k * 0.9) * 0.9} q ${rr * 0.2} ${-rr * 0.08} ${rr * 0.4} 0 t ${rr * 0.4} 0 t ${rr * 0.4} 0 t ${rr * 0.4} 0`} fill="none" stroke="#3F6FA8" strokeWidth={Math.max(3, rr * 0.012)} opacity={0.8} />
      ))}
      {Array.from({length: 10}, (_, i) => {
        const a = Math.PI + (Math.PI * (i + 0.5)) / 10;
        return <circle key={i} cx={cx + Math.cos(a) * rr * 0.72} cy={cy + Math.sin(a) * rr * 0.62} r={Math.max(4, rr * 0.022)} fill="#3F6FA8" />;
      })}
      <path d={`M ${cx - rr} ${cy} A ${rr} ${rr * 0.86} 0 0 1 ${cx + rr} ${cy}`} fill="none" stroke="#C9C1AE" strokeWidth={Math.max(4, rr * 0.02)} />
      <Glaze cx={cx - rr * 0.45} cy={cy - rr * 0.55} rx={rr * 0.18} ry={rr * 0.32} rot={-35} strength={0.8} />
      {crack > 0 ? <path d={`M ${cx} ${cy - rr * 0.86} L ${cx - 20} ${cy - rr * 0.6} L ${cx + 14} ${cy - rr * 0.4} L ${cx - 10} ${cy - rr * 0.15} L ${cx + 6} ${cy}`} fill="none" stroke="#FFE7A8" strokeWidth={6} strokeDasharray={1200} strokeDashoffset={1200 * (1 - crack)} /> : null}
    </g>
  );
};

/* ---------------- Winnicott card: old paper, silhouette (round glasses + bow tie), no text ---------------- */
export const PortraitCard: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <P d={roughRect(-150, -190, 300, 380, 11401, 8, 3)} fill="#6E5440" shadow={10} />
    <P d={roughRect(-130, -170, 260, 340, 11402, 6, 2)} fill="#8A6C50" shadow={false} />
    <ellipse cx={0} cy={-30} rx={86} ry={100} fill="#3A2A22" />
    <P d={roughCircle(0, -50, 52, 11403, 1.5)} fill="#2A1E18" shadow={false} />
    <path d="M -60 70 Q 0 20 60 70 L 80 150 L -80 150 Z" fill="#2A1E18" />
    <circle cx={-20} cy={-52} r={14} fill="none" stroke="#E8B04B" strokeWidth={4} />
    <circle cx={20} cy={-52} r={14} fill="none" stroke="#E8B04B" strokeWidth={4} />
    <line x1={-6} y1={-52} x2={6} y2={-52} stroke="#E8B04B" strokeWidth={3} />
    <path d="M -22 22 L 0 32 L -22 42 Z M 22 22 L 0 32 L 22 42 Z" fill="#E2657A" />
    <path d="M -110 -150 L -60 -150 M -110 150 L -60 150" stroke="#E8B04B" strokeWidth={3} opacity={0.6} />
  </g>
);

export const PaperBoatToy: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string}> = ({x, y, s = 1, rot = 0, color = '#E9DFC9'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <P d={roughPoly([[-60, -20], [60, -20], [40, 10], [-40, 10]], 11501, 1.2)} fill={color} shadow={4} />
    <P d={roughPoly([[-20, -20], [0, -60], [24, -20]], 11502, 1)} fill="#D6CAB1" shadow={3} />
  </g>
);

export const Blocks: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughRect(-60, -40, 40, 40, 11511, 3, 1)} fill="#C2443F" shadow={4} />
    <P d={roughRect(-16, -40, 40, 40, 11512, 3, 1)} fill="#3F6FA8" shadow={4} />
    <P d={roughRect(-38, -80, 40, 40, 11513, 3, 1)} fill="#C9A040" shadow={4} />
    <P d={roughPoly([[30, 0], [70, 0], [50, -36]], 11514, 1)} fill="#4E7A5A" shadow={4} />
  </g>
);

export const Armchair: React.FC<{x: number; y: number; s?: number; color?: string}> = ({x, y, s = 1, color = '#7A3A3A'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughRect(-110, -250, 220, 200, 11521, 40, 2)} fill={color} shadow={8} />
    <P d={roughRect(-140, -150, 60, 130, 11522, 20, 2)} fill={color} shadow={6} />
    <P d={roughRect(80, -150, 60, 130, 11523, 20, 2)} fill={color} shadow={6} />
    <P d={roughRect(-100, -110, 200, 70, 11524, 16, 2)} fill="#8C4A44" shadow={5} />
    <rect x={-120} y={-30} width={14} height={30} fill="#3A2416" />
    <rect x={106} y={-30} width={14} height={30} fill="#3A2416" />
  </g>
);

/* window with curtains; open 0..1 blows it open */
export const MemWindow: React.FC<{x: number; y: number; frame: number; open: number}> = ({x, y, frame, open}) => (
  <g>
    <P d={roughRect(x - 150, y - 170, 300, 340, 11531, 6, 2)} fill="#5A3A2A" shadow={8} />
    <rect x={x - 130} y={y - 150} width={260} height={300} fill="#4A3A5E" />
    <circle cx={x + 50} cy={y - 70} r={26} fill="#E8D8A8" opacity={0.8} />
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${x + sd * 130} ${y - 150}) skewX(${sd * open * -14 + Math.sin(frame / 3) * open * 6})`}>
        <P d={roughPoly([[0, 0], [-sd * (90 - open * 60), 0], [-sd * (110 - open * 70), 310], [0, 310]], 11532 + sd, 1.6)} fill="#9E4A52" shadow={5} />
      </g>
    ))}
    <rect x={x - 4} y={y - 150} width={8} height={300} fill="#5A3A2A" transform={`rotate(${open * -50} ${x} ${y - 150})`} opacity={1 - open * 0.5} />
  </g>
);

/* glass cup full of warm light ("一个人的时候不空") */
export const GlassCup: React.FC<{x: number; y: number; s?: number; fill?: number; frame: number; id: string}> = ({x, y, s = 1, fill = 1, frame, id}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Glow cx={0} cy={-34} r={110} color="#FFC870" opacity={0.65 * fill} id={id} />
    <path d={`M -26 ${-70 + 70 * (1 - fill)} L 26 ${-70 + 70 * (1 - fill)} L 20 0 L -20 0 Z`} fill="#FFC870" opacity={0.85} />
    <path d={`M -26 ${-70 + 70 * (1 - fill)} Q 0 ${-74 + 70 * (1 - fill) + Math.sin(frame / 6) * 2} 26 ${-70 + 70 * (1 - fill)}`} fill="none" stroke="#FFF0C8" strokeWidth={3} />
    <path d="M -30 -78 L 30 -78 L 22 2 L -22 2 Z" fill="rgba(220,236,246,0.18)" stroke="rgba(255,255,255,0.7)" strokeWidth={3} />
    <Glaze cx={-14} cy={-40} rx={6} ry={22} rot={4} strength={0.8} />
  </g>
);

/* the little grey loneliness cloud (a creature, not a symbol) */
export const LonelyCloud: React.FC<{x: number; y: number; s?: number; frame: number; patted?: number}> = ({x, y, s = 1, frame, patted = 0}) => (
  <g transform={`translate(${x} ${y + Math.sin(frame / 12) * 6}) scale(${s * (1 - 0.12 * patted)} ${s * (1 + 0.08 * patted)})`}>
    <P d={roughEllipse(0, 0, 70, 40, 11601, 2)} fill="#6A6F84" shadow={6} />
    <P d={roughCircle(-30, -24, 28, 11602, 1.6)} fill="#6A6F84" shadow={false} />
    <P d={roughCircle(22, -30, 32, 11603, 1.6)} fill="#6A6F84" shadow={false} />
    <ellipse cx={-14} cy={-2} rx={5} ry={patted > 0.5 ? 2 : 6} fill="#1A1218" />
    <ellipse cx={14} cy={-2} rx={5} ry={patted > 0.5 ? 2 : 6} fill="#1A1218" />
    <path d={patted > 0.5 ? 'M -8 12 q 8 6 16 0' : 'M -8 14 q 8 -4 16 0'} fill="none" stroke="#1A1218" strokeWidth={3} strokeLinecap="round" />
    {patted < 0.5 ? [-30, 0, 30].map((dx) => <line key={dx} x1={dx} y1={44} x2={dx - 6} y2={62 + (frame % 10)} stroke="#8FB6DA" strokeWidth={3} strokeLinecap="round" opacity={0.6} />) : null}
  </g>
);

export const PhoneDown: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <P d={roughRect(x - 40, y - 12, 80, 14, 11611, 5, 1)} fill="#1E1A22" shadow={3} />
  </g>
);

export const PlantPot: React.FC<{x: number; y: number; s?: number; frame: number; grow?: number}> = ({x, y, s = 1, frame, grow = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-30, -10, 10, 30].map((dx, i) => (
      <P key={i} d={roughEllipse(dx, -70 - Math.abs(dx) * 0.4 - grow * 14, 12, 30 + grow * 8, 11621 + i, 1)} fill={i % 2 ? '#4E7A5A' : '#3E6A4A'} shadow={3} transform={`rotate(${dx * 0.8 + Math.sin(frame / 20 + i) * 3} ${dx} -40)`} />
    ))}
    <P d={roughPoly([[-44, -40], [44, -40], [32, 0], [-32, 0]], 11625, 1.2)} fill="#B8603A" shadow={5} />
  </g>
);

export const Thermos: React.FC<{x: number; y: number; s?: number; steam?: number; frame: number}> = ({x, y, s = 1, steam = 1, frame}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => <path key={i} d={`M ${-6 + i * 12} -70 q 8 -14 0 -28 q -8 -14 0 -28`} fill="none" stroke="#F1E6D2" strokeWidth={3} opacity={steam * (0.4 + 0.2 * Math.sin(frame / 7 + i))} />)}
    <P d={roughRect(-22, -64, 44, 64, 11631, 8, 1)} fill="#C2443F" shadow={4} />
    <P d={roughRect(-16, -76, 32, 14, 11632, 4, 1)} fill="#8C2E2E" shadow={2} />
  </g>
);

export const OpenBook: React.FC<{x: number; y: number; s?: number; page?: number}> = ({x, y, s = 1, page = 0}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughPoly([[-60, -10], [0, 0], [60, -10], [60, 30], [0, 40], [-60, 30]], 11641, 1)} fill="#8C4A3A" shadow={4} />
    <P d={roughPoly([[-56, -14], [0, -4], [0, 34], [-56, 24]], 11642, 1)} fill="#E6DAC2" shadow={false} />
    <P d={roughPoly([[56, -14], [0, -4], [0, 34], [56, 24]], 11643, 1)} fill="#DCCFB4" shadow={false} />
    {page > 0 && page < 1 ? <path d={`M 0 -4 Q ${56 - 112 * page} ${-30 * Math.sin(page * Math.PI)} ${56 - 112 * page} ${-14 + 38 * 0}`} fill="none" stroke="#E6DAC2" strokeWidth={4} /> : null}
  </g>
);

export const DarkArrow: React.FC<{x: number; y: number; rot: number; s?: number; opacity?: number}> = ({x, y, rot, s = 1, opacity = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <line x1={-60} y1={0} x2={30} y2={0} stroke="#2A2236" strokeWidth={8} strokeLinecap="round" />
    <path d="M 30 -14 L 56 0 L 30 14 Z" fill="#2A2236" />
    <path d="M -60 0 l -14 -12 M -60 0 l -14 12" stroke="#2A2236" strokeWidth={6} strokeLinecap="round" />
  </g>
);

/* a far fishing boat light on the horizon (pops on with t) */
export const FleetLight: React.FC<{x: number; y: number; t: number; seed: number; frame: number}> = ({x, y, t, seed, frame}) => {
  if (t <= 0) return null;
  const tw = 0.8 + 0.2 * Math.sin(frame / 9 + seed);
  return (
    <g transform={`translate(${x} ${y + Math.sin(frame / 13 + seed) * 2}) scale(${0.4 + 0.6 * Math.min(1, t * 1.3)})`}>
      <Glow cx={0} cy={-18} r={60} color="#FFC870" opacity={t * tw} id={`fleet${seed % 3}`} />
      <path d="M -26 -6 L 26 -6 L 18 6 L -18 6 Z" fill="#2A2030" />
      <circle cx={0} cy={-18} r={6} fill="#FFE2A0" opacity={t} />
    </g>
  );
};

/* big glazed eye (the friend's), with a reflection slot */
export const BigEye: React.FC<{cx: number; cy: number; r: number; children?: React.ReactNode; blink?: number}> = ({cx, cy, r, children, blink = 0}) => (
  <g>
    <defs>
      <clipPath id="bigeyeclip">
        <ellipse cx={cx} cy={cy} rx={r * 1.5} ry={r * (1 - blink)} />
      </clipPath>
    </defs>
    <ellipse cx={cx} cy={cy} rx={r * 1.5} ry={r} fill="#F3EBDD" />
    <g clipPath="url(#bigeyeclip)">
      <circle cx={cx} cy={cy} r={r * 0.8} fill="#3A2A1E" />
      <circle cx={cx} cy={cy} r={r * 0.62} fill="#1A1210" />
      <g>{children}</g>
      <Glaze cx={cx - r * 0.35} cy={cy - r * 0.3} rx={r * 0.25} ry={r * 0.35} strength={0.9} />
    </g>
    <path d={`M ${cx - r * 1.55} ${cy} Q ${cx} ${cy - r * 1.35} ${cx + r * 1.55} ${cy}`} fill="none" stroke="#2A1C18" strokeWidth={r * 0.08} strokeLinecap="round" />
  </g>
);

export const FishingRod: React.FC<{x: number; y: number; frame: number; bob: number}> = ({x, y, frame, bob}) => (
  <g>
    <path d={`M ${x} ${y} Q ${x + 160} ${y - 200} ${x + 280} ${y - 160}`} fill="none" stroke="#5A3A22" strokeWidth={6} />
    <line x1={x + 280} y1={y - 160} x2={x + 300} y2={y + 120 + bob * 16} stroke="#E6DAC2" strokeWidth={2} />
    <circle cx={x + 300} cy={y + 120 + bob * 16 + Math.sin(frame / 8) * 2} r={10} fill="#E2657A" />
  </g>
);

export const DockPlanks: React.FC<{x0: number; x1: number; y: number; seed: number}> = ({x0, x1, y, seed}) => {
  const r = rng(seed);
  const n = Math.ceil((x1 - x0) / 90);
  return (
    <g>
      {Array.from({length: n}, (_, i) => (
        <rect key={`p${i}`} x={x0 + i * 90 + 30} y={y + 20} width={16} height={220} fill="#2A1E16" />
      ))}
      {Array.from({length: n}, (_, i) => (
        <P key={i} d={roughRect(x0 + i * 90, y - 8 + (r() - 0.5) * 3, 86, 26, seed + i, 3, 1.2)} fill={i % 2 ? '#6A4428' : '#5E3C22'} shadow={4} rim={false} />
      ))}
    </g>
  );
};

/** helper: little noise wobble */
export const wob = (frame: number, seed: number, amp: number) => noise1(frame * 0.05, seed) * amp;
