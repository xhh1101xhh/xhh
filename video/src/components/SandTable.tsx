import React from 'react';
import {mulberry32, noise, clamp, lerp, shade} from '../lib/anim';
import {Qiangjin} from '../lacquer/Materials';

/** 沙盘/地图：俯视地形 + 河道 + 堤坝 + 描金支渠。场景内文字一律不放（地名用左侧 PlaceTag） */
export const SandTable: React.FC<{
  f: number; land?: string; water?: string; dam?: number; flood?: number; channels?: number; flow?: number; figures?: 'dam' | 'dig' | null;
}> = ({f, land = '#3c4a2e', water = '#2d5a68', dam = 0, flood = 0, channels = 0, flow = 0, figures = null}) => {
  const r = mulberry32(21);
  // 主河道：左上到右侧入海
  const river = 'M-200,260 C200,300 420,420 700,470 C980,520 1200,500 1500,560 C1700,600 1900,640 2200,620';
  const sea = 'M1700,-100 L2300,-100 L2300,1300 L1820,1300 C1760,1000 1880,700 1760,500 C1700,300 1760,100 1700,-100 Z';
  const chans = [
    'M760,480 C860,600 980,700 1180,760 C1400,820 1600,800 1790,760',
    'M820,470 C900,360 1060,300 1260,300 C1460,300 1640,330 1760,300',
    'M980,510 C1100,620 1300,640 1500,700 C1640,740 1720,700 1800,690',
    'M1080,505 C1200,420 1380,400 1560,430 C1660,450 1720,430 1780,420',
    'M640,450 C720,640 900,820 1180,900 C1440,960 1640,930 1820,900',
  ];
  return (
    <g>
      <rect x={-300} y={-300} width={2600} height={1700} fill={land} />
      {/* 地块：漆层色斑 */}
      {Array.from({length: 26}).map((_, i) => (
        <ellipse key={i} cx={r() * 2000} cy={r() * 1100} rx={60 + r() * 160} ry={40 + r() * 100} fill={shade(land, (r() - 0.5) * 0.25)} opacity={0.8} />
      ))}
      {/* 田垄 */}
      {Array.from({length: 18}).map((_, i) => <path key={'t' + i} d={`M${100 + i * 90},${720 + (i % 3) * 30} l70,-20`} stroke={shade(land, 0.15)} strokeWidth={3} opacity={0.5} />)}
      <path d={sea} fill={shade(water, -0.1)} />
      <path d={sea} fill="none" stroke="url(#gold)" strokeWidth={3} />
      {/* 洪水：堤坝上游水面扩张 */}
      {flood > 0 && <ellipse cx={420} cy={380} rx={lerp(120, 520, flood)} ry={lerp(60, 300, flood)} fill={water} opacity={0.85} />}
      {flood > 0 && [0, 1, 2].map(i => <ellipse key={i} cx={420} cy={380} rx={lerp(120, 520, flood) - i * 40} ry={lerp(60, 300, flood) - i * 26} fill="none" stroke="#9fd0dc" strokeWidth={2} opacity={0.4} />)}
      <path d={river} fill="none" stroke={shade(water, -0.25)} strokeWidth={70} strokeLinecap="round" />
      <path d={river} fill="none" stroke={water} strokeWidth={56} strokeLinecap="round" />
      <path d={river} fill="none" stroke="#a8d8e0" strokeWidth={3} strokeDasharray="24 30" strokeDashoffset={-f * 3 * (0.3 + flow)} opacity={0.6} />
      {/* 支渠（描金走线） */}
      {chans.map((d, i) => {
        const p = clamp(channels - i);
        if (p <= 0) return null;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke={water} strokeWidth={18} pathLength={1} strokeDasharray={`${p} 1`} strokeLinecap="round" />
            <Qiangjin d={d} progress={p} w={3} glow />
            <path d={d} fill="none" stroke="#cfeef4" strokeWidth={2} strokeDasharray="10 26" strokeDashoffset={-f * 4} opacity={0.6 * p} />
          </g>
        );
      })}
      {/* 土堤 */}
      {dam > 0 && (
        <g opacity={clamp(dam)} transform={`translate(700,470) rotate(-60)`}>
          <rect x={-150} y={-20} width={300} height={40} fill="#8a6a40" stroke="url(#gold)" strokeWidth={2.5} filter="url(#lqObj)" />
          {Array.from({length: 6}).map((_, i) => <path key={i} d={`M${-150 + i * 50},-20 l0,40`} stroke="#5a4428" strokeWidth={2} />)}
        </g>
      )}
      {/* 小人剪影 */}
      {figures && Array.from({length: 14}).map((_, i) => {
        const along = (i / 14);
        const px = figures === 'dam' ? 600 + Math.cos(-1.05) * (along * 300 - 150) : lerp(780, 1600, along);
        const py = figures === 'dam' ? 470 + Math.sin(-1.05) * (along * 300 - 150) - 30 : lerp(500, 700, along) + Math.sin(i) * 60;
        const bob = noise(f / 10 + i, 4) * 3;
        return <g key={'p' + i} transform={`translate(${px},${py + bob})`}><circle r={6} fill="#1a120c" /><circle cy={-8} r={4} fill="#1a120c" /></g>;
      })}
      {/* 外圈漆框 */}
      <rect x={-300} y={-300} width={2600} height={1700} fill="none" stroke="#000" strokeWidth={0} />
    </g>
  );
};
