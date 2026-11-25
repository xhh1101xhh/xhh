#!/usr/bin/env python3
"""逐个核对音效与当时 BGM 的电平（用混音前的分轨），并检查成片静音段/爆音"""
import json, os, sys, numpy as np, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
fx, sr = sf.read(os.path.join(ROOT, 'out/stem_fx.wav')); bg, _ = sf.read(os.path.join(ROOT, 'out/stem_bgm.wav'))
mix, _ = sf.read(os.path.join(ROOT, sys.argv[1] if len(sys.argv) > 1 else 'public/audio/mix_full.wav'))
D = json.load(open(os.path.join(ROOT, 'src/data/subtitles.json')))
BED = {'wind', 'rain', 'flood', 'fire', 'murmur', 'cheer', 'birds', 'drone', 'goldShower', 'steps', 'stepsFast', 'carve', 'windChime', 'shout', 'release', 'riser', 'waterFlow'}
def db(x): return 20 * np.log10(np.sqrt(np.mean(x ** 2)) + 1e-9)
low = []
for s in D['screens']:
    for c in s['sfxFrames']:
        i = int(c['f'] / 30 * sr); w = slice(i, i + int(0.3 * sr))
        r = db(fx[w]) - db(bg[w])
        need = -10 if c['sound'] in BED else (6 if c['sound'] in ('slam', 'finale') else -3)
        if r < need: low.append((s['id'], c['sound'], round(r, 1), need))
print('cues', sum(len(s['sfxFrames']) for s in D['screens']), ' 低于目标的:', len(low))
for l in low: print('  屏%d %-12s fx-bgm %+.1f dB (目标≥%+d)' % l)
# 静音段 / 爆音
m = np.abs(mix).max(1) if mix.ndim > 1 else np.abs(mix)
win = int(0.25 * sr); rms = np.array([np.sqrt(np.mean(m[k:k + win] ** 2)) for k in range(0, len(m) - win, win)])
sil = [k * 0.25 for k, v in enumerate(rms) if 20 * np.log10(v + 1e-9) < -45]
print('静音(<-45dBFS, 0.25s窗):', sil[:20], '...' if len(sil) > 20 else '')
print('采样峰值 dBFS:', round(20 * np.log10(m.max() + 1e-9), 2), ' 削波样本数:', int((m >= 0.999).sum()))
