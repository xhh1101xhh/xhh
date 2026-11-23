/**
 * Static QC for timing and text (run: npm run qc [-- --until B1:9.1]).
 *  - every screen: frames, duration, reading speed (<= ~5 chars/s), line layout, orphan lines, x-extent
 *  - no subtitle / slam text inside the x > 1536 no-text zone
 *  - every action / cast / sfx cue and every slam landing sits on a detected beat (deviation in frames)
 * Writes out/qc_report.md
 */
import fs from 'node:fs';
import {BAR_FRAMES, BEAT_FRAMES, BPM, DURATION_FRAMES, SECTIONS, SECTION_ORDER} from '../src/data/beats';
import {SCREENS} from '../src/data/subtitles';
import {RESOLVED, frameOf} from '../src/lib/timing';
import {countChars, layoutLines, hasOrphan, plainText, textWidth} from '../src/lib/text';
import {slamLayout} from '../src/lib/slam';

const SUB_FONT = 64;
const SUB_MAX = 1100;
const NO_TEXT_X = 1536;
const untilArg = process.argv.indexOf('--until');
const until = untilArg > 0 ? frameOf(process.argv[untilArg + 1]) : DURATION_FRAMES;

const nearestBeat = (f: number) => BEAT_FRAMES.reduce((b, x) => (Math.abs(x - f) < Math.abs(b - f) ? x : b), BEAT_FRAMES[0]);
const lines: string[] = [];
const problems: string[] = [];
const log = (s = '') => lines.push(s);

log(`# QC report`);
log(`BPM ${BPM} · ${BEAT_FRAMES.length} beats · ${BAR_FRAMES.length} bars · ${DURATION_FRAMES} frames · checked frames 0–${until}`);
log('');
log('## Sections');
for (const id of SECTION_ORDER) log(`- ${id} ${SECTIONS[id].name}: f${SECTIONS[id].start}–${SECTIONS[id].end} (bar ${SECTIONS[id].startBar}+${SECTIONS[id].bars})`);
log('');
log('## Screens');
log('| id | 显示 | 帧 | 秒 | 字 | 字/秒 | 行 | 左–右 x | 问题 |');
log('|---|---|---|---|---|---|---|---|---|');
let totalChars = 0;
for (const s of RESOLVED) {
  if (s.from >= until) continue;
  const n = countChars(s.text);
  totalChars += n;
  const dur = (s.to - s.from) / 30;
  const issues: string[] = [];
  let layout = '';
  let xr = '';
  if (s.display === 'bottom') {
    const readFrom = s.revealFrom ? s.from : s.from;
    const rate = n / ((s.to - readFrom) / 30);
    if (rate > 5.3) issues.push(`读速 ${rate.toFixed(1)} 字/秒 过快`);
    const {lines: ls, letterSpacing} = layoutLines(s.text, SUB_FONT, SUB_MAX);
    layout = ls.join(' / ') + (letterSpacing ? ` (字距 ${letterSpacing.toFixed(1)})` : '');
    if (ls.length > 2) issues.push('超过两行');
    if (ls.length > 1 && hasOrphan(ls)) issues.push('单字孤行');
    const w = Math.max(...ls.map((l) => textWidth(l, SUB_FONT, letterSpacing)));
    const left = 960 - w / 2;
    const right = 960 + w / 2;
    xr = `${left.toFixed(0)}–${right.toFixed(0)}`;
    if (right > NO_TEXT_X) issues.push('进入右侧禁字区');
    if (s.revealFrom) {
      const after = plainText(s.text).split('').length;
      void after;
    }
  } else if (s.display === 'slam') {
    const L = slamLayout(s);
    xr = `${L.left.toFixed(0)}–${L.right.toFixed(0)}`;
    if (L.right > NO_TEXT_X) issues.push('砸屏进入右侧禁字区');
    for (const g of s.slam ?? []) {
      const f = frameOf(g.at);
      const d = f - nearestBeat(f);
      if (d !== 0) issues.push(`砸屏落点偏拍 ${d} 帧`);
    }
    layout = (s.slam ?? []).map((g) => `${plainText(g.text)}@f${frameOf(g.at)}`).join(' ');
  }
  if (issues.length) problems.push(`screen ${s.id}: ${issues.join('；')}`);
  log(`| ${s.id} | ${s.display} | ${s.from}–${s.to} | ${dur.toFixed(2)} | ${n} | ${s.display === 'bottom' ? (n / dur).toFixed(1) : '-'} | ${layout} | ${xr} | ${issues.join('；') || 'OK'} |`);
}
log('');
log(`总字数（不含标点，已检查范围内）：${totalChars}`);
log('');
log('## Cue ↔ beat alignment (action / cast / sfx)');
log('| 屏 | 类型 | id / 名称 | 标签 | 帧 | 最近拍点 | 偏差 |');
log('|---|---|---|---|---|---|---|');
let maxDev = 0;
for (const s of SCREENS) {
  const rows: [string, string, string][] = [
    ...(s.actions ?? []).map((a) => ['action', a.id, a.at] as [string, string, string]),
    ...(s.cast ?? []).map((c) => ['cast', `${c.who}:${c.expression ?? c.outfit ?? ''}`, c.at] as [string, string, string]),
    ...(s.sfx ?? []).map((x) => ['sfx', x.sfx, x.at] as [string, string, string]),
  ];
  for (const [kind, id, at] of rows) {
    const f = frameOf(at);
    if (f >= until) continue;
    const nb = at === 'START' ? 0 : nearestBeat(f);
    const dev = at === 'START' ? 0 : f - nb;
    if (/\+/.test(at)) continue; // deliberate off-beat offsets
    maxDev = Math.max(maxDev, Math.abs(dev));
    if (Math.abs(dev) > 1) problems.push(`cue ${id} @${at}: 偏拍 ${dev} 帧`);
    log(`| ${s.id} | ${kind} | ${id} | ${at} | ${f} | ${nb} | ${dev} |`);
  }
}
log('');
log(`最大偏差：${maxDev} 帧`);
log('');
log('## Problems');
log(problems.length ? problems.map((p) => `- ${p}`).join('\n') : '- none');
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/qc_report.md', lines.join('\n') + '\n');
console.log(lines.slice(0, 6).join('\n'));
console.log(`screens checked, total chars ${totalChars}, max cue deviation ${maxDev} frames`);
console.log(problems.length ? 'PROBLEMS:\n' + problems.join('\n') : 'no problems');
