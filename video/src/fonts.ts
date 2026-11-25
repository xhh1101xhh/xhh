import {continueRender, delayRender, staticFile} from 'remotion';
import {FONT_FILES} from './data/fonts.generated';

let started = false;
/** 按 unicode-range 加载思源黑体/宋体分片，加载完前阻塞渲染，避免回退字体 */
export function ensureFonts() {
  if (started || typeof document === 'undefined') return;
  started = true;
  const handle = delayRender('fonts');
  Promise.all(FONT_FILES.map(ff => {
    const face = new FontFace(ff.family, `url(${staticFile(ff.file)}) format('woff2')`, {weight: String(ff.weight), unicodeRange: ff.range});
    return face.load().then(l => { (document.fonts as any).add(l); });
  })).then(() => continueRender(handle)).catch(e => { console.error(e); continueRender(handle); });
}
