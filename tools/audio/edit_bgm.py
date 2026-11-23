"""Shorten the BGM by removing whole 8-bar blocks at bar heads, with harmony-matched seams.

Each cut jumps from bar head `src` to bar head `dst` where the music right before `src`
is (harmonically) the same as the music right before `dst`, so the listener hears the
original transition into `dst`. Seams are snapped to the local transient and crossfaded.
"""
import sys, json
import numpy as np
import librosa, soundfile as sf

src_path, ana_path, out_wav, out_json = sys.argv[1:5]
CUTS = [(48, 56), (64, 72)]  # (bar index to leave at, bar index to land on)
XF_MS = 12
FPS = 30

ana = json.load(open(ana_path))
bars = np.array(ana['bars'])
y, sr = librosa.load(src_path, sr=48000, mono=False)  # keep stereo, full rate
mono = y.mean(axis=0)
hop = 64
oenv = librosa.onset.onset_strength(y=mono, sr=sr, hop_length=hop)

def snap(t, w=0.035):
    f0 = int((t - w) * sr / hop); f1 = int((t + w) * sr / hop)
    k = f0 + int(np.argmax(oenv[f0:f1]))
    return k * hop / sr

# harmonic check: chroma of the 2 bars before src vs 2 bars before dst, and 1 bar after each
ch = librosa.feature.chroma_cqt(y=mono[::4], sr=sr // 4, hop_length=512)
def chroma_seg(a, b):
    fa = int(a * (sr // 4) / 512); fb = int(b * (sr // 4) / 512)
    v = ch[:, fa:fb]
    n = 8  # 8 sub-windows to keep order
    parts = np.array_split(v, n, axis=1)
    m = np.array([p.mean(axis=1) for p in parts])
    return m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-9)
def sim(a, b):
    return float((a * b).sum(axis=1).mean())

report = []
pieces = []
cursor = 0.0
xf = int(XF_MS / 1000 * sr)
seams_new = []
removed = 0.0
for s_bar, d_bar in CUTS:
    ts = snap(bars[s_bar]); td = snap(bars[d_bar])
    before = sim(chroma_seg(bars[s_bar - 2], bars[s_bar]), chroma_seg(bars[d_bar - 2], bars[d_bar]))
    after_orig = sim(chroma_seg(bars[d_bar], bars[d_bar + 1]), chroma_seg(bars[s_bar], bars[s_bar + 1]))
    # cut slightly before the transient so the landing hit stays intact
    pre = 0.008
    pieces.append((cursor, ts - pre))
    seams_new.append(ts - pre - removed)
    removed += (td - ts)
    cursor = td - pre
    report.append(dict(leave_bar=s_bar, land_bar=d_bar, leave_t=round(ts, 4), land_t=round(td, 4),
                       removed_s=round(td - ts, 4), harmony_sim_before=round(before, 3),
                       harmony_sim_after_vs_skipped=round(after_orig, 3)))
pieces.append((cursor, y.shape[1] / sr))

out = None
for a, b in pieces:
    seg = y[:, int(a * sr):int(b * sr)].copy()
    if out is None:
        out = seg
    else:
        fade = np.linspace(0, 1, xf)
        # equal-power crossfade of XF_MS ms
        tail = out[:, -xf:] * np.cos(fade * np.pi / 2) + seg[:, :xf] * np.sin(fade * np.pi / 2)
        out = np.concatenate([out[:, :-xf], tail, seg[:, xf:]], axis=1)
sf.write(out_wav, out.T, sr)
json.dump(dict(cuts=report, seams_in_new_timeline=[round(s, 4) for s in seams_new],
               new_duration=round(out.shape[1] / sr, 4), crossfade_ms=XF_MS), open(out_json, 'w'), indent=1)
print(json.dumps(report, indent=1)); print('new duration', out.shape[1] / sr, 'seams', seams_new)
