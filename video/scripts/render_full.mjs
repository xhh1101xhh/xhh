// 分段渲染完整片：
//  1) 按小节头切段（段落起点），每段静音渲染 → out/segments/seg_XX.mp4
//  2) 依赖哈希：只重渲受影响的分段（改了某节的场景文件 / 该段字幕 / 共享引擎 / 拍点表）
//  3) 无损拼接视频（concat -c copy），按完整时间轴混好的音频单独合成，复测响度与真峰值
//  4) 核对：视频帧数 = 总帧数，音频时长 = 视频时长
// 用法：node scripts/render_full.mjs [--force] [--only 2,3]
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve('.');
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',').map(Number) : null;

const beats = JSON.parse(fs.readFileSync('src/data/beats.json', 'utf8'));
const subs = JSON.parse(fs.readFileSync('src/data/subtitles.json', 'utf8'));
const total = subs.meta.fullEndFrame;
// 分段边界：各段落起点（都是小节头）
const cuts = [0, ...beats.sections.slice(1).map(s => s.startFrame).filter(f => f < total), total];
const segs = cuts.slice(0, -1).map((a, i) => ({i, a, b: cuts[i + 1]}));

const sha = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 12);
const read = (p) => fs.readFileSync(p, 'utf8');
const walk = (d) => fs.readdirSync(d, {withFileTypes: true}).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const shared = walk('src').filter(p => !p.includes(`${path.sep}sections${path.sep}`) && !/(subtitles\.json|Cover\.tsx|Root\.tsx|scene_text\.txt)$/.test(p)).sort();
const sharedHash = sha(shared.map(read).join('\n') + read('remotion.config.ts'));
function segHash(s) {
  // 本段（含两侧转场余量）用到的场景 → 对应节文件 + 本段字幕
  const pad = 30;
  const scr = subs.screens.filter(x => x.endFrame > s.a - pad && x.startFrame < s.b + pad);
  const secFiles = [...new Set(scr.map(x => `src/sections/Section${x.scene.split('-')[0]}.tsx`))];
  if (secFiles.includes('src/sections/Section2.tsx')) secFiles.push('src/sections/Section1.tsx'); // 2-7 倒带复用 1-9
  return sha(sharedHash + secFiles.sort().map(read).join('\n') + JSON.stringify(scr) + JSON.stringify(subs.scenes) + s.a + '-' + s.b);
}

fs.mkdirSync('out/segments', {recursive: true});
const manPath = 'out/segments/manifest.json';
const man = fs.existsSync(manPath) ? JSON.parse(read(manPath)) : {};
const todo = segs.filter(s => {
  const h = segHash(s); s.h = h;
  const file = `out/segments/seg_${String(s.i).padStart(2, '0')}.mp4`; s.file = file;
  if (only) return only.includes(s.i);
  return force || man[s.i] !== h || !fs.existsSync(file);
});
console.log(`共 ${segs.length} 段：`, segs.map(s => `${s.i}[${s.a}-${s.b - 1}]`).join(' '));
console.log(`需要渲染：${todo.map(s => s.i).join(',') || '无（全部命中缓存）'}`);

if (todo.length) {
  const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
  const composition = await selectComposition({serveUrl, id: 'Full', browserExecutable: BROWSER});
  for (const s of todo) {
    const t = Date.now();
    await renderMedia({
      serveUrl, composition, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', muted: true, concurrency: 4,
      frameRange: [s.a, s.b - 1], outputLocation: s.file, browserExecutable: BROWSER, imageFormat: 'jpeg', jpegQuality: 92,
      chromiumOptions: {gl: 'swangle'},
      onProgress: ({progress}) => { if (Math.round(progress * 100) % 25 === 0) process.stdout.write(`  seg${s.i} ${Math.round(progress * 100)}%\r`); },
    });
    man[s.i] = s.h; fs.writeFileSync(manPath, JSON.stringify(man, null, 1));
    console.log(`\n段 ${s.i} 完成 ${(Date.now() - t) / 1000 | 0}s`);
  }
}

// 无损拼接
const list = segs.map(s => `file '${path.resolve(s.file)}'`).join('\n');
fs.writeFileSync('out/segments/list.txt', list);
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', 'out/segments/list.txt', '-c', 'copy', 'out/video_full.mp4']);
const nb = Number(execFileSync('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', 'out/video_full.mp4']).toString().replace(/,/g, '').trim());
// 合成音频（完整时间轴单独混好的 mix_full.wav）
const out = 'out/yu_xia_full.mp4';
execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', 'out/video_full.mp4', '-i', 'public/audio/mix_full.wav', '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '320k', '-movflags', '+faststart', out]);
const vdur = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', out]).toString().replace(/,/g, '').trim());
const adur = Number(execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=duration', '-of', 'csv=p=0', out]).toString().replace(/,/g, '').trim());
let loud = '';
try { execFileSync('ffmpeg', ['-hide_banner', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-'], {stdio: ['ignore', 'ignore', 'pipe']}); } catch (e) { loud = String(e.stderr || ''); }
const r = execFileSync('bash', ['-c', `ffmpeg -hide_banner -i ${out} -af ebur128=peak=true -f null - 2>&1 | grep -E "I:|Peak:" | tail -2`]).toString();
console.log(`视频帧数 ${nb} / 应为 ${total} ${nb === total ? '✓' : '✗'}`);
console.log(`视频时长 ${vdur.toFixed(3)}s  音频时长 ${adur.toFixed(3)}s  差 ${((adur - vdur) * 1000).toFixed(0)}ms`);
console.log(r.trim());
console.log('成片：', path.resolve(out));
