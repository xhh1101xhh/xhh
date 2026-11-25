import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const composition = await selectComposition({serveUrl, id: 'Cover', browserExecutable: BROWSER});
await renderStill({serveUrl, composition, frame: 0, output: 'out/cover_1080x1440.png', imageFormat: 'png', browserExecutable: BROWSER});
console.log('out/cover_1080x1440.png');
