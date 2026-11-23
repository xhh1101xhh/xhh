import sys, json
import numpy as np
import librosa
import scipy.signal as sig

path = sys.argv[1]
out = sys.argv[2]
FPS = 30
y, sr = librosa.load(path, sr=22050, mono=True)
dur = len(y) / sr
hop = 256

# ---- beats
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, units='frames', tightness=100)
tempo = float(np.atleast_1d(tempo)[0])
bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
# tempogram global estimate for sanity
tg = librosa.feature.tempo(onset_envelope=oenv, sr=sr, hop_length=hop, aggregate=None)
ibi = np.diff(bt)

# ---- low-frequency (kick) energy per beat -> downbeat phase
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
low = S[(freqs >= 30) & (freqs <= 150)].sum(axis=0)
low_on = np.maximum(0, np.diff(low, prepend=low[0]))
def val_at(arr, t, w=0.05):
    f0 = librosa.time_to_frames(max(0, t - w), sr=sr, hop_length=hop)
    f1 = librosa.time_to_frames(t + w, sr=sr, hop_length=hop) + 1
    return float(arr[f0:f1].max()) if f1 > f0 else 0.0
low_b = np.array([val_at(low_on, t) for t in bt])
# chroma change per beat (harmonic changes favour downbeats)
chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
cb = librosa.util.sync(chroma, beats, aggregate=np.median)
cchange = np.r_[0, np.linalg.norm(np.diff(cb, axis=1), axis=0)][:len(bt)]
scores = []
for ph in range(4):
    idx = np.arange(ph, len(bt), 4)
    s = low_b[idx].mean() / (low_b.mean() + 1e-9) + cchange[idx[idx < len(cchange)]].mean() / (cchange.mean() + 1e-9)
    scores.append(float(s))
# low-band kick energy alone is ambiguous here (kick accents on 2/4 in the groove), so combine it with
# section-boundary evidence: real bar heads carry the biggest bar-to-bar energy jumps and strongest onsets
rms_f = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
db_f = librosa.amplitude_to_db(rms_f, ref=np.max)
def seg_db(a, b):
    return db_f[librosa.time_to_frames(a, sr=sr, hop_length=hop):librosa.time_to_frames(b, sr=sr, hop_length=hop)].mean()
jump_scores, onset_scores = [], []
for ph in range(4):
    heads = bt[ph::4]
    j = [abs(seg_db(heads[i], heads[i + 1]) - seg_db(heads[i - 1], heads[i])) for i in range(1, len(heads) - 1)]
    jump_scores.append(float(np.sort(j)[::-1][:8].sum()))
    onset_scores.append(float(np.mean([val_at(oenv, t, 0.03) for t in heads])))
js = np.array(jump_scores) / max(jump_scores); os_ = np.array(onset_scores) / max(onset_scores)
combo = 2 * js + os_ + 0.5 * np.array(scores) / max(scores)
scores = [round(float(x), 3) for x in combo]
phase = int(np.argmax(combo))
bars = bt[phase::4]

# ---- RMS energy curve (per second and per bar)
rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
rms_db = librosa.amplitude_to_db(rms, ref=np.max)
per_sec = []
for s in range(int(np.ceil(dur))):
    m = (rt >= s) & (rt < s + 1)
    per_sec.append(round(float(rms_db[m].mean()), 1) if m.any() else None)
bar_bounds = list(bars) + [dur]
bar_energy = []
bar_low = []
bar_bright = []
cent = librosa.feature.spectral_centroid(S=S, sr=sr)[0]
for i in range(len(bars)):
    m = (rt >= bar_bounds[i]) & (rt < bar_bounds[i + 1])
    bar_energy.append(float(rms_db[m].mean()))
    bar_low.append(float(np.log1p(low[m].mean())))
    bar_bright.append(float(cent[m].mean()))

# ---- bar-level harmonic similarity (chroma + mfcc) for section labelling
mf = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)
bf = librosa.time_to_frames(np.array(bar_bounds), sr=sr, hop_length=hop)
feat = []
for i in range(len(bars)):
    a, b = bf[i], max(bf[i] + 1, bf[i + 1])
    c = chroma[:, a:b].mean(axis=1); c = c / (np.linalg.norm(c) + 1e-9)
    m_ = mf[1:, a:b].mean(axis=1); m_ = m_ / (np.linalg.norm(m_) + 1e-9)
    feat.append(np.r_[c, 0.6 * m_])
feat = np.array(feat)
# chroma-only per bar sequence (beat-sync, keep within-bar order) for harmony matching
chroma_bar_seq = []
for i in range(len(bars)):
    idx = np.arange(phase + 4 * i, min(phase + 4 * i + 4, cb.shape[1]))
    chroma_bar_seq.append(cb[:, idx].T.flatten() if len(idx) == 4 else None)
# self-similarity
fn = feat / np.linalg.norm(feat, axis=1, keepdims=True)
SSM = fn @ fn.T

# novelty (checkerboard) for boundaries
def novelty(SSM, k=4):
    n = len(SSM); K = np.ones((2 * k, 2 * k)); K[:k, k:] = -1; K[k:, :k] = -1
    g = np.outer(sig.windows.gaussian(2 * k, k / 2), sig.windows.gaussian(2 * k, k / 2)); K *= g
    P = np.pad(SSM, k, mode='edge'); nov = np.zeros(n)
    for i in range(n):
        nov[i] = (P[i:i + 2 * k, i:i + 2 * k] * K).sum()
    return nov
nov = novelty(SSM, 4)

# onsets peaks / fills: onset strength per beat, flag strong
ob = np.array([val_at(oenv, t, 0.04) for t in bt])
# big hits: top onsets coinciding with energy jump
hits = []
for i, t in enumerate(bt):
    if ob[i] > np.percentile(ob, 97):
        hits.append(round(float(t), 3))
# sudden quiet: energy drop > 8dB within 1 s
quiet = []
sm = np.convolve(rms_db, np.ones(20) / 20, mode='same')
step = int(0.5 * sr / hop)
for i in range(step, len(sm) - step, step // 2):
    if sm[i - step] - sm[i + step] > 9:
        quiet.append(round(float(rt[i]), 2))

res = dict(
    duration=dur, tempo=tempo, tempogram_median=float(np.median(tg)),
    ibi_mean=float(ibi.mean()), ibi_std=float(ibi.std()),
    first_beat=float(bt[0]), downbeat_phase=phase, phase_scores=scores,
    beats=[round(float(t), 4) for t in bt],
    beat_frames=[int(round(t * FPS)) for t in bt],
    bars=[round(float(t), 4) for t in bars],
    bar_frames=[int(round(t * FPS)) for t in bars],
    bar_energy=[round(e, 1) for e in bar_energy],
    bar_low=[round(e, 2) for e in bar_low],
    bar_bright=[round(e) for e in bar_bright],
    novelty=[round(float(x), 3) for x in nov],
    per_sec_db=per_sec, hits=hits, quiet=quiet,
    beat_onset=[round(float(x), 2) for x in ob],
)
json.dump(res, open(out, 'w'))
np.save(out.replace('.json', '_ssm.npy'), SSM)
np.save(out.replace('.json', '_chromabeat.npy'), cb)
print('dur', round(dur, 2), 'tempo', round(tempo, 2), 'tg', round(float(np.median(tg)), 2))
print('ibi', round(ibi.mean(), 4), '+-', round(ibi.std(), 4), 'first beat', round(bt[0], 3), 'phase', phase, [round(s, 2) for s in scores])
print('nbeats', len(bt), 'nbars', len(bars))
