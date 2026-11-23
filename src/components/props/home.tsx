import React from 'react';
import {Glaze, Glow, P} from '../Paper';
import {rng, roughCircle, roughEllipse, roughPoly, roughRect} from '../../lib/paper';

/** curved stone/brick wall of the lighthouse (paper bricks) */
export const BrickWall: React.FC<{x: number; y: number; w: number; h: number; base: string; brick: string; seed: number}> = ({x, y, w, h, base, brick, seed}) => {
  const r = rng(seed);
  const rows = Math.ceil(h / 46);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={base} />
      {Array.from({length: rows}, (_, j) =>
        Array.from({length: Math.ceil(w / 120) + 1}, (_, i) => {
          const bx = x + i * 120 - (j % 2) * 60 + (r() - 0.5) * 8;
          const by = y + j * 46 + 4;
          return <P key={`${i}-${j}`} d={roughRect(bx, by, 108 + r() * 8, 38, seed + j * 100 + i, 6, 1.6)} fill={brick} shadow={3} opacity={0.55 + r() * 0.35} rim={false} />;
        }),
      )}
    </g>
  );
};

export const Porthole: React.FC<{x: number; y: number; r: number; frame: number; storm?: number; flash?: number; sea?: string; seed?: number; children?: React.ReactNode}> = ({x, y, r, frame, storm = 0, flash = 0, sea = '#15233F', seed = 1, children}) => {
  const id = `ph${seed}`;
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={x} cy={y} r={r} />
        </clipPath>
      </defs>
      <circle cx={x} cy={y} r={r} fill={sea} />
      <g clipPath={`url(#${id})`}>
        <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill={flash > 0 ? `rgba(200,215,245,${flash * 0.8})` : 'transparent'} />
        {children}
        <path d={`M ${x - r} ${y + r * 0.35} q ${r * 0.25} ${-r * 0.12} ${r * 0.5} 0 t ${r * 0.5} 0 t ${r * 0.5} 0 t ${r * 0.5} 0 L ${x + r} ${y + r} L ${x - r} ${y + r} Z`} fill="#1E3358" transform={`translate(${Math.sin(frame / 12) * 10} 0)`} />
        {storm > 0
          ? Array.from({length: 14}, (_, i) => {
              const rx = x - r + ((i * 37 + frame * 9) % (2 * r));
              const ry = y - r + ((i * 53 + frame * 28) % (2 * r));
              return <line key={i} x1={rx} y1={ry} x2={rx - 5} y2={ry + 20} stroke="#A9BCE0" strokeWidth={2} opacity={0.6 * storm} />;
            })
          : null}
      </g>
      <circle cx={x} cy={y} r={r} fill="none" stroke="#8C6A3A" strokeWidth={r * 0.16} />
      <circle cx={x} cy={y} r={r * 1.08} fill="none" stroke="#5A4026" strokeWidth={r * 0.06} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} cx={x + Math.cos((a * Math.PI) / 180) * r * 1.0} cy={y + Math.sin((a * Math.PI) / 180) * r * 1.0} r={r * 0.04} fill="#D9B46A" />
      ))}
      <Glaze cx={x - r * 0.35} cy={y - r * 0.3} rx={r * 0.35} ry={r * 0.5} strength={0.5} />
    </g>
  );
};

export const WallClock: React.FC<{x: number; y: number; r: number; hourA: number; minA: number}> = ({x, y, r, hourA, minA}) => (
  <g>
    <P d={roughCircle(x, y, r, 9001, 1.6)} fill="#7A4E2C" shadow={6} />
    <P d={roughCircle(x, y, r * 0.84, 9002, 1.2)} fill="#EDE3CC" shadow={false} />
    {Array.from({length: 12}, (_, i) => {
      const a = (i / 12) * Math.PI * 2;
      return <circle key={i} cx={x + Math.sin(a) * r * 0.68} cy={y - Math.cos(a) * r * 0.68} r={i % 3 === 0 ? r * 0.06 : r * 0.035} fill="#3A2A20" />;
    })}
    <line x1={x} y1={y} x2={x + Math.sin((hourA * Math.PI) / 180) * r * 0.42} y2={y - Math.cos((hourA * Math.PI) / 180) * r * 0.42} stroke="#2A1E18" strokeWidth={r * 0.09} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin((minA * Math.PI) / 180) * r * 0.62} y2={y - Math.cos((minA * Math.PI) / 180) * r * 0.62} stroke="#9E3A2E" strokeWidth={r * 0.05} strokeLinecap="round" />
    <circle cx={x} cy={y} r={r * 0.07} fill="#2A1E18" />
    <Glaze cx={x - r * 0.3} cy={y - r * 0.3} rx={r * 0.3} ry={r * 0.45} strength={0.45} />
  </g>
);

export const Table: React.FC<{x: number; y: number; w: number; color?: string; seed?: number}> = ({x, y, w, color = '#6A4428', seed = 9100}) => (
  <g>
    <P d={roughRect(x - w / 2 + 16, y, 16, 120, seed + 1, 3, 1.2)} fill="#4E311C" shadow={5} />
    <P d={roughRect(x + w / 2 - 32, y, 16, 120, seed + 2, 3, 1.2)} fill="#4E311C" shadow={5} />
    <P d={roughRect(x - w / 2, y - 18, w, 22, seed, 5, 1.6)} fill={color} shadow={7} />
  </g>
);

export const Chair: React.FC<{x: number; y: number; s?: number; color?: string; seed?: number}> = ({x, y, s = 1, color = '#7A4E2C', seed = 9200}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <P d={roughRect(-40, -150, 12, 150, seed, 3, 1)} fill={color} shadow={4} />
    <P d={roughRect(28, -150, 12, 150, seed + 1, 3, 1)} fill={color} shadow={4} />
    <P d={roughRect(-40, -150, 80, 14, seed + 2, 4, 1)} fill={color} shadow={3} />
    <P d={roughRect(-40, -116, 80, 10, seed + 3, 3, 1)} fill={color} shadow={3} />
    <P d={roughRect(-46, -82, 92, 14, seed + 4, 4, 1.2)} fill={color} shadow={4} />
  </g>
);

export const Bowl: React.FC<{x: number; y: number; s?: number; steam?: number; frame: number}> = ({x, y, s = 1, steam = 1, frame}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {steam > 0
      ? [-10, 4, 18].map((sx, i) => (
          <path key={i} d={`M ${sx} -26 q 8 -14 0 -28 q -8 -14 0 -28`} fill="none" stroke="#F1E6D2" strokeWidth={3} strokeLinecap="round" opacity={steam * (0.3 + 0.25 * Math.sin(frame / 8 + i))} transform={`translate(${Math.sin(frame / 10 + i) * 4} 0)`} />
        ))
      : null}
    <P d={roughPoly([[-40, -22], [40, -22], [28, 6], [-28, 6]], 9301, 1.2)} fill="#E8E0CC" shadow={4} />
    <path d="M -34 -12 Q -17 -18 0 -12 T 34 -12" fill="none" stroke="#3F6FA8" strokeWidth={3} />
    <P d={roughEllipse(0, -22, 40, 7, 9302, 1)} fill="#E8C48A" shadow={false} />
    <line x1={10} y1={-24} x2={48} y2={-58} stroke="#5A3A22" strokeWidth={3} strokeLinecap="round" />
    <line x1={16} y1={-22} x2={54} y2={-54} stroke="#5A3A22" strokeWidth={3} strokeLinecap="round" />
    <Glaze cx={-20} cy={-8} rx={10} ry={8} strength={0.6} />
  </g>
);

export const Ladder: React.FC<{x: number; y: number; h: number}> = ({x, y, h}) => (
  <g>
    <P d={roughRect(x - 40, y - h, 10, h, 9401, 3, 1)} fill="#7A5232" shadow={5} />
    <P d={roughRect(x + 30, y - h, 10, h, 9402, 3, 1)} fill="#7A5232" shadow={5} />
    {Array.from({length: Math.floor(h / 48)}, (_, i) => (
      <P key={i} d={roughRect(x - 36, y - 30 - i * 48, 72, 8, 9410 + i, 2, 1)} fill="#8C6440" shadow={3} />
    ))}
  </g>
);

export const Bulb: React.FC<{x: number; y: number; on: number; frame: number; id: string}> = ({x, y, on, frame, id}) => (
  <g>
    <line x1={x} y1={y - 200} x2={x} y2={y - 26} stroke="#1E1A20" strokeWidth={3} />
    <P d={roughRect(x - 10, y - 30, 20, 14, 9501, 2, 1)} fill="#4A4040" shadow={2} />
    {on > 0 ? <Glow cx={x} cy={y} r={220} color="#FFD58A" opacity={on * (0.85 + 0.15 * Math.sin(frame / 3))} id={id} /> : null}
    <P d={roughCircle(x, y, 16, 9502, 1)} fill={on > 0.5 ? '#FFF0C0' : '#8A8270'} shadow={3} />
  </g>
);

export const Stair: React.FC<{x: number; y: number; steps: number; color?: string}> = ({x, y, steps, color = '#3A2E4A'}) => (
  <g>
    {Array.from({length: steps}, (_, i) => (
      <P key={i} d={roughRect(x + i * 46, y - i * 34, 120, 22, 9600 + i, 3, 1.4)} fill={color} shadow={5} />
    ))}
    <path d={`M ${x + 10} ${y - 90} L ${x + steps * 46 + 60} ${y - steps * 34 - 90}`} stroke="#1E1824" strokeWidth={7} strokeLinecap="round" />
    {Array.from({length: steps}, (_, i) => (
      <line key={i} x1={x + 40 + i * 46} y1={y - i * 34 - 6} x2={x + 40 + i * 46} y2={y - i * 34 - 94} stroke="#1E1824" strokeWidth={3} />
    ))}
  </g>
);

/** thought bubble (left side) with a second person tangled in yarn */
export const ThoughtBubble: React.FC<{x: number; y: number; s: number; pop: number; frame: number}> = ({x, y, s, pop, frame}) => {
  if (s <= 0.01) return null;
  const burst = pop > 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * (1 + pop * 0.25)})`} opacity={1 - pop}>
      <P d={roughEllipse(0, 0, 170, 120, 9701, 3, 14)} fill="#EADFCB" shadow={8} />
      {[[150, 120, 22], [190, 160, 13], [215, 190, 8]].map(([cx, cy, r], i) => (
        <P key={i} d={roughCircle(cx, cy, r, 9702 + i, 1)} fill="#EADFCB" shadow={4} />
      ))}
      {/* a tiny second person */}
      <g transform="translate(-10 70) scale(0.42)">
        <P d={roughCircle(0, -230, 58, 9710, 1.5)} fill="#B9A58C" shadow={3} />
        <P d={roughPoly([[-40, -170], [40, -170], [50, 0], [-50, 0]], 9711, 1.5)} fill="#8E7E6A" shadow={3} />
      </g>
      {/* yarn tangles all over it */}
      {Array.from({length: 7}, (_, i) => {
        const a = (i / 7) * Math.PI * 2 + frame / 30;
        return <ellipse key={i} cx={-10 + Math.cos(a) * 40} cy={-10 + Math.sin(a) * 34} rx={70} ry={26} fill="none" stroke={['#C85A5A', '#5A8C8A', '#C9A040'][i % 3]} strokeWidth={4} transform={`rotate(${i * 26} -10 -10)`} opacity={0.85} />;
      })}
      {burst
        ? Array.from({length: 10}, (_, i) => {
            const a = (i / 10) * Math.PI * 2;
            return <line key={i} x1={Math.cos(a) * 180} y1={Math.sin(a) * 130} x2={Math.cos(a) * (180 + 90 * pop)} y2={Math.sin(a) * (130 + 70 * pop)} stroke="#F3EBDD" strokeWidth={6} strokeLinecap="round" />;
          })
        : null}
    </g>
  );
};

/* ---------------------------------------------------------- the round room (S1a) */
export const Bed: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <P d={roughRect(x - 150, y - 90, 26, 90, 9801, 3, 1)} fill="#5A3A22" shadow={5} />
    <P d={roughRect(x + 124, y - 60, 26, 60, 9802, 3, 1)} fill="#5A3A22" shadow={5} />
    <P d={roughRect(x - 150, y - 60, 300, 40, 9803, 6, 1.6)} fill="#6E4A2C" shadow={7} />
    <P d={roughRect(x - 140, y - 92, 280, 40, 9804, 14, 1.6)} fill="#C9B79A" shadow={5} />
    <P d={roughRect(x - 40, y - 98, 172, 50, 9805, 18, 1.8)} fill="#7C5B8C" shadow={5} />
    <P d={roughRect(x - 132, y - 112, 80, 32, 9806, 14, 1.4)} fill="#EDE2CC" shadow={4} />
  </g>
);

export const Bookshelf: React.FC<{x: number; y: number; frame: number; tilt?: number; squash?: number; booksOut?: number[]}> = ({x, y, frame, tilt = 0, squash = 1, booksOut = []}) => {
  const r = rng(98);
  const colors = ['#9E3A2E', '#3F6FA8', '#C9A040', '#4E7A5A', '#7C5B8C', '#C46A3A'];
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${1 / squash} ${squash})`}>
      <P d={roughRect(-90, -300, 180, 300, 9901, 4, 1.6)} fill="#4E311C" shadow={8} />
      {[0, 1, 2].map((row) => (
        <g key={row}>
          <rect x={-80} y={-292 + row * 96} width={160} height={84} fill="#2E1C10" />
          {Array.from({length: 7}, (_, i) => {
            const id = row * 7 + i;
            const out = booksOut.includes(id);
            const h = 56 + r() * 26;
            return out ? null : <P key={i} d={roughRect(-76 + i * 22, -292 + row * 96 + 84 - h, 18, h, 9910 + id, 2, 0.8)} fill={colors[id % colors.length]} shadow={2} rim={false} />;
          })}
          <rect x={-86} y={-208 + row * 96} width={172} height={8} fill="#6A4428" />
        </g>
      ))}
    </g>
  );
};

export const Door: React.FC<{x: number; y: number; open: number}> = ({x, y, open}) => (
  <g>
    <P d={roughRect(x - 90, y - 300, 180, 300, 9951, 6, 1.6)} fill="#1C120C" shadow={false} />
    <rect x={x - 86} y={y - 296} width={172} height={296} fill="#2B3456" opacity={open} />
    <g transform={`translate(${x - 90} ${y}) scale(${1 - open * 0.82} 1)`}>
      <P d={roughRect(0, -300, 180, 300, 9952, 6, 1.6)} fill="#6A3E22" shadow={6} />
      <P d={roughRect(20, -280, 140, 120, 9953, 4, 1.2)} fill="#5A331C" shadow={2} />
      <P d={roughRect(20, -140, 140, 120, 9954, 4, 1.2)} fill="#5A331C" shadow={2} />
      <circle cx={150} cy={-150} r={9} fill="#D9B46A" />
    </g>
  </g>
);

export const BellIcon: React.FC<{x: number; y: number; ring: number}> = ({x, y, ring}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.sin(ring * 30) * 22 * Math.exp(-ring * 3)})`}>
    <P d={roughPoly([[-26, 10], [-20, -18], [-8, -30], [8, -30], [20, -18], [26, 10]], 9961, 1.2)} fill="#D9B46A" shadow={4} />
    <circle cx={0} cy={16} r={7} fill="#B8893A" />
    {ring < 1.2
      ? [-1, 1].map((sd) => (
          <g key={sd} opacity={Math.exp(-ring * 2)} stroke="#F3EBDD" strokeWidth={4} fill="none" strokeLinecap="round">
            <path d={`M ${sd * 38} -18 q ${sd * 10} 12 0 26`} />
            <path d={`M ${sd * 52} -26 q ${sd * 14} 20 0 42`} />
          </g>
        ))
      : null}
  </g>
);

export const Kite: React.FC<{x: number; y: number; s?: number; rot?: number; frame: number}> = ({x, y, s = 1, rot = 0, frame}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d={`M 0 40 q 12 30 -6 56 q -14 22 6 46`} fill="none" stroke="#E8B04B" strokeWidth={3} transform={`rotate(${Math.sin(frame / 6) * 8} 0 40)`} />
    <P d={roughPoly([[0, -50], [34, 0], [0, 42], [-34, 0]], 9971, 1.2)} fill="#E2657A" shadow={5} />
    <path d="M 0 -50 L 0 42 M -34 0 L 34 0" stroke="#8C2E3E" strokeWidth={2.5} />
  </g>
);

/** cup with a toothbrush (one of everything) */
export const ToothCup: React.FC<{x: number; y: number; n?: number}> = ({x, y, n = 1}) => (
  <g>
    {Array.from({length: n}, (_, i) => (
      <g key={i} transform={`translate(${x + (i - (n - 1) / 2) * 10} ${y - 30}) rotate(${(i - (n - 1) / 2) * 16})`}>
        <rect x={-3} y={-50} width={6} height={52} rx={3} fill={i ? '#E2657A' : '#6FA8DC'} />
        <rect x={-5} y={-62} width={10} height={14} rx={3} fill="#F3EBDD" />
      </g>
    ))}
    <P d={roughPoly([[-22, -40], [22, -40], [18, 0], [-18, 0]], 9981, 1)} fill="#8FB7C9" shadow={3} />
    <Glaze cx={-10} cy={-22} rx={6} ry={12} strength={0.6} />
  </g>
);

export const Mug: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <circle cx={x + 26} cy={y - 22} r={13} fill="none" stroke="#C46A3A" strokeWidth={7} />
    <P d={roughRect(x - 22, y - 48, 44, 48, 9991, 6, 1)} fill="#C46A3A" shadow={4} />
    <Glaze cx={x - 10} cy={y - 30} rx={6} ry={12} strength={0.5} />
  </g>
);

export const Rug: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    <P d={roughEllipse(x, y, w / 2, w * 0.09, 9995, 3, 16)} fill="#7A2E2E" shadow={4} />
    <P d={roughEllipse(x, y, w * 0.4, w * 0.065, 9996, 2, 14)} fill="#A0503A" shadow={false} />
    <ellipse cx={x} cy={y} rx={w * 0.28} ry={w * 0.04} fill="none" stroke="#E8B04B" strokeWidth={3} strokeDasharray="10 8" opacity={0.7} />
  </g>
);

export const HangingPlant: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g transform={`rotate(${Math.sin(frame / 40) * 3} ${x} ${y - 200})`}>
    <line x1={x} y1={y - 260} x2={x} y2={y - 40} stroke="#2A1E18" strokeWidth={3} />
    <P d={roughPoly([[x - 40, y - 50], [x + 40, y - 50], [x + 28, y], [x - 28, y]], 9997, 1.2)} fill="#B8603A" shadow={5} />
    {[-50, -24, 0, 24, 50].map((dx, i) => (
      <P key={i} d={roughEllipse(x + dx, y + 20 + Math.abs(dx) * 0.8, 14, 34, 9998 + i, 1.2)} fill={i % 2 ? '#4E7A5A' : '#3E6A4A'} shadow={3} />
    ))}
  </g>
);
