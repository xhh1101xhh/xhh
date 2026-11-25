// 用法：node scripts/stills.mjs 20 100 160 ...   → out/stills/f00020.jpg
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
import fs from 'node:fs';
const frames = process.argv.slice(2).map(Number);
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const comp = await selectComposition({serveUrl, id: process.env.COMP || 'Full', browserExecutable: BROWSER});
fs.mkdirSync('out/stills', {recursive: true});
for (const frame of frames) {
  const t = Date.now();
  await renderStill({serveUrl, composition: comp, frame, output: `out/stills/f${String(frame).padStart(5, '0')}.jpg`, imageFormat: 'jpeg', jpegQuality: 85, browserExecutable: BROWSER, scale: Number(process.env.SCALE || 0.5)});
  console.log('frame', frame, Date.now() - t, 'ms');
}
