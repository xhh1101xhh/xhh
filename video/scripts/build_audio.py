#!/usr/bin/env python3
"""
代码合成音效 + 混音：
  读 src/data/subtitles.json 里每屏的 sfxFrames（由 sync_timeline.py 从拍点标签解析成帧），
  用 numpy 合成钟/磬/鼓/木鱼/玉鸣/风雨/金粉铃音等（不使用任何音频素材），
  按 BGM 调性给有音高的音效定音，砸屏时 BGM 轻压（ducking），
  最后两遍 loudnorm 到 -14 LUFS / -1 dBTP。
  python3 scripts/build_audio.py --preview   → public/audio/mix_preview.wav
  python3 scripts/build_audio.py             → public/audio/mix_full.wav
"""
import argparse, json, os, subprocess, re
import numpy as np
import soundfile as sf
from scipy import signal
import librosa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 48000
ap = argparse.ArgumentParser(); ap.add_argument("--preview", action="store_true"); args = ap.parse_args()
D = json.load(open(os.path.join(ROOT, "src/data/subtitles.json")))
FPS = D["meta"]["fps"]
bgm_path = os.path.join(ROOT, "public/bgm/bgm_preview.wav" if args.preview else "public/bgm/bgm_cut.wav")
end_frame = D["meta"]["previewEndFrame"] if args.preview else D["meta"]["fullEndFrame"]
rng = np.random.default_rng(7)

# ---------- 调性：音效定音用 ----------
yk, srk = librosa.load(os.path.join(ROOT, "public/bgm/bgm.mp3"), sr=22050, duration=90)
chroma = librosa.feature.chroma_cqt(y=yk, sr=srk).mean(1)
maj = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
mnr = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])
scores = [(np.corrcoef(chroma, np.roll(maj, k))[0, 1], k, "maj") for k in range(12)] + [(np.corrcoef(chroma, np.roll(mnr, k))[0, 1], k, "min") for k in range(12)]
_, tonic, mode = max(scores)
penta = [0, 3, 5, 7, 10] if mode == "min" else [0, 2, 4, 7, 9]
def note(deg, octave=5):
    semis = penta[deg % 5] + 12 * (deg // 5)
    midi = 12 * (octave + 1) + tonic + semis
    return 440 * 2 ** ((midi - 69) / 12)
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
print(f"BGM 调性 {NAMES[tonic]} {mode}，五声音阶定音")

# ---------- 合成工具 ----------
def t_(d): return np.arange(int(d * SR)) / SR
def env_exp(d, tau): return np.exp(-t_(d) / tau)
def adsr(d, a=0.01, r=0.1):
    n = int(d * SR); e = np.ones(n)
    na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def noise(d): return rng.standard_normal(int(d * SR))
def bp(x, lo, hi, order=2): return signal.sosfilt(signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos"), x)
def lp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, "lowpass", fs=SR, output="sos"), x)
def hp(x, f, order=2): return signal.sosfilt(signal.butter(order, f, "highpass", fs=SR, output="sos"), x)
def sine(freq, d, phase=0):
    if np.isscalar(freq): return np.sin(2 * np.pi * freq * t_(d) + phase)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR + phase)
def mixa(*xs):
    n = max(len(x) for x in xs); return sum(np.pad(x, (0, n - len(x))) for x in xs)
def norm(x): m = np.max(np.abs(x)) + 1e-9; return x / m
def pad(x, d): n = int(d * SR); return np.pad(x, (0, max(0, n - len(x))))[:n] if len(x) < n else x
_ir = None
def reverb(x, mix=0.25, dec=1.2):
    global _ir
    if _ir is None:
        n = int(1.6 * SR); tt = np.arange(n) / SR
        _ir = rng.standard_normal(n) * np.exp(-tt / 0.45); _ir = lp(_ir, 6000); _ir[:int(0.012 * SR)] = 0; _ir /= np.sqrt(np.sum(_ir ** 2))
    wet = signal.fftconvolve(x, _ir[: int(dec * SR)])[: len(x) + int(dec * SR)]
    dry = np.pad(x, (0, len(wet) - len(x)))
    return dry * (1 - mix) + wet * mix * 1.5

def drum(f0=70, d=0.9, click=0.3):
    fr = f0 * (1 + 1.4 * np.exp(-t_(d) / 0.03))
    body = sine(fr, d) * env_exp(d, 0.22)
    skin = bp(noise(d), 200, 2000) * env_exp(d, 0.03) * click
    return norm(body + skin)
def wood(freq=800, d=0.25, q=0.02):
    x = bp(noise(d), freq * 0.85, freq * 1.15, 2) * env_exp(d, q) + sine(freq, d) * env_exp(d, q * 1.5) * 0.6
    return norm(x)
def chime(f0, ratios, d=2.0, taus=None, amps=None):
    taus = taus or [d * 0.5 / (1 + i * 0.6) for i in range(len(ratios))]
    amps = amps or [1 / (1 + i * 0.7) for i in range(len(ratios))]
    x = sum(a * sine(f0 * r, d) * env_exp(d, tau) for r, tau, a in zip(ratios, taus, amps))
    x[: int(0.002 * SR)] *= np.linspace(0, 1, int(0.002 * SR))
    return norm(x)
def whoosh(d=0.45, lo=300, hi=3000):
    n = noise(d); out = np.zeros_like(n); seg = 2048
    for i in range(0, len(n), seg):
        p = i / len(n); fc = hi * (1 - p) + lo * p
        out[i:i + seg] = bp(n[i:i + seg], max(80, fc * 0.6), min(SR / 2 - 100, fc * 1.4))
    e = np.sin(np.pi * np.clip(t_(d) / d, 0, 1)) ** 1.5
    return norm(out * e)
def crackle(d, rate=30):
    x = lp(noise(d), 800) * 0.15
    for _ in range(int(rate * d)):
        i = rng.integers(0, len(x) - 400); x[i:i + 300] += bp(noise(300 / SR), 2000, 7000) * np.exp(-np.arange(300) / 40) * rng.uniform(0.3, 1)
    return norm(x)
def babble(d):
    x = np.zeros(int(d * SR))
    for k in range(8):
        n = bp(noise(d), 250 + k * 90, 900 + k * 120)
        mod = 0.5 + 0.5 * np.sin(2 * np.pi * rng.uniform(2, 5) * t_(d) + k)
        x += n * mod
    return norm(x * adsr(d, 0.2, 0.4))

def make(name, dur=None):
    if name == "drip":
        return norm(mixa(norm(sine(np.linspace(1400, 500, int(0.07 * SR)), 0.07) * env_exp(0.07, 0.03)) * 0.5, drum(110, 0.6, 0.6) * 0.9))
    if name == "wind":
        d = dur or 3; n = bp(noise(d), 200, 1200); m = 0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t_(d)); return norm(n * m * adsr(d, 0.6, 1.0))
    if name == "mudPull":
        return norm(pad(drum(60, 0.5, 0.2), 0.5) + lp(noise(0.5), 600) * env_exp(0.5, 0.08) * 0.8)
    if name == "steps":
        d = dur or 1.0; x = np.zeros(int(d * SR))
        for k in range(int(d / 0.33)):
            i = int(k * 0.33 * SR); s = lp(noise(0.12), 500) * env_exp(0.12, 0.03); x[i:i + len(s)] += s[: len(x) - i]
        return norm(x)
    if name == "jade":
        return chime(note(2, 6), [1, 2.76, 5.4, 8.93], 1.6)
    if name == "slam":
        d = 1.5
        body = drum(82, d, 0.6)
        thump = bp(noise(d), 120, 700) * env_exp(d, 0.09) * 1.2
        clack = mixa(wood(1250, 0.14, 0.016), wood(2500, 0.1, 0.01) * 0.6)
        gong = chime(note(0, 4), [1, 1.48, 2.1, 2.83, 3.6], 1.5, amps=[1, 0.7, 0.5, 0.35, 0.25]) * 0.45
        x = mixa(body * 1.0, thump, clack * 0.55, gong * 1.3, lp(noise(d), 110) * env_exp(d, 0.3) * 0.5)
        x[: int(0.004 * SR)] *= np.linspace(0, 1, int(0.004 * SR))
        x = np.tanh(norm(reverb(x, 0.2, 1.0)) * 2.2)  # 软削波：降低瞬态峰值、提高平均响度，避免被限幅器压扁
        return norm(x)
    if name == "sleeve":
        return whoosh(0.28, 400, 2500)
    if name == "whoosh":
        return whoosh(0.45, 300, 3500)
    if name == "fire":
        d = dur or 2; return norm(crackle(d) * adsr(d, 0.3, 0.6))
    if name == "breath":
        d = 0.9; return norm(bp(noise(d), 300, 1800) * np.sin(np.pi * t_(d) / d) ** 2)
    if name == "thunder":
        d = 2.6; x = lp(noise(d), 180, 4) * (env_exp(d, 0.9) * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 1.3 * t_(d)))))
        return norm(x)
    if name == "goldDraw":
        d = 0.9; x = hp(noise(d), 5000) * 0.15 * np.sin(np.pi * t_(d) / d)
        for _ in range(26):
            i = rng.integers(0, int(0.75 * SR)); f0 = note(int(rng.integers(5, 12)), 6); p = sine(f0, 0.15) * env_exp(0.15, 0.04)
            x[i:i + len(p)] += p * rng.uniform(0.2, 0.6)
        return norm(x)
    if name == "crackTick":
        return norm(pad(wood(2600, 0.08, 0.006), 0.5) + pad(chime(note(4, 6), [1, 2.3], 0.5), 0.5) * 0.4)
    if name == "shatter":
        d = 1.6; x = lp(noise(d), 9000) * env_exp(d, 0.08) * 0.6 + pad(drum(55, 0.8, 0.4), d) * 0.8
        for k in range(10):
            i = rng.integers(0, int(0.4 * SR)); p = chime(note(int(rng.integers(5, 13)), 6), [1, 2.7], 0.6); x[i:i + len(p)] += p * rng.uniform(0.15, 0.4)
        return norm(reverb(x, 0.3))
    if name == "flood":
        d = dur or 4; x = lp(noise(d), 700, 3) * (0.7 + 0.3 * np.sin(2 * np.pi * 0.5 * t_(d))); return norm(x * adsr(d, 0.4, 1.2))
    if name == "ram":
        return norm(pad(drum(65, 0.4, 0.5), 0.4) + lp(noise(0.4), 400) * env_exp(0.4, 0.05) * 0.6)
    if name == "damBreak":
        d = 1.8; return norm(lp(noise(d), 2500) * env_exp(d, 0.35) + pad(drum(45, 1.0, 0.6), d) * 0.9)
    if name == "peel":
        d = 0.6; return norm(crackle(d, 90) * np.linspace(0.3, 1, int(d * SR)) * adsr(d, 0.05, 0.15))
    if name == "murmur":
        return babble(dur or 1.5)
    if name == "drum":
        return norm(reverb(drum(62, 1.0, 0.4), 0.2))
    if name == "inkBloom":
        d = 1.0; return norm(lp(noise(d), 300) * np.sin(np.pi * t_(d) / d) + sine(note(0, 3), d) * np.sin(np.pi * t_(d) / d) * 0.4)
    if name == "bell":
        return chime(note(3, 6), [1, 2.4, 4.1, 5.9], 1.6)
    if name == "bigThud":
        return norm(pad(drum(40, 1.0, 0.8), 1.0) + pad(wood(300, 0.3, 0.05), 1.0) * 0.4)
    if name == "ropeWhip":
        return norm(mixa(whoosh(0.3, 600, 4000), np.concatenate([np.zeros(int(0.25 * SR)), wood(3000, 0.05, 0.004) * 0.5])))
    if name == "rain":
        d = dur or 4; x = hp(noise(d), 2500) * 0.4
        for _ in range(int(60 * d)):
            i = rng.integers(0, len(x) - 500); x[i:i + 400] += bp(noise(400 / SR), 3000, 8000) * np.exp(-np.arange(400) / 60) * rng.uniform(0.2, 0.8)
        return norm(x * adsr(d, 0.5, 0.8))
    if name == "knot":
        return wood(note(int(rng.integers(0, 5)), 5) * 1.0, 0.12, 0.012)
    if name == "rainSwish":
        return norm(whoosh(0.5, 1500, 6000) + hp(noise(0.5), 3000) * 0.3 * np.sin(np.pi * t_(0.5) / 0.5))
    if name == "heartbeat":
        x = np.zeros(int(0.7 * SR)); a = pad(drum(55, 0.25, 0.1), 0.25); x[: len(a)] += a; i = int(0.22 * SR); x[i:i + len(a)] += a * 0.7; return norm(x)
    if name == "tick":
        return wood(note(3, 5), 0.18, 0.02)
    if name == "qing":
        return chime(note(0, 5), [1, 2.03, 3.21, 4.62], 2.4)
    if name == "waterPress":
        d = 1.2; return norm(lp(noise(d), 250, 3) * adsr(d, 0.2, 0.6) + sine(note(0, 2), d) * adsr(d, 0.2, 0.6) * 0.3)
    if name == "waterFlow":
        d = dur or 2; x = bp(noise(d), 400, 3000) * (0.6 + 0.4 * np.sin(2 * np.pi * 3 * t_(d))); return norm(x * adsr(d, 0.3, 0.6))
    if name == "cheer":
        return babble(dur or 2.5)
    raise ValueError(name)

# 各类音效相对电平（关键句砸屏最响）
LEVEL = {"slam": 1.35, "shatter": 1.3, "damBreak": 0.75, "drum": 0.6, "bigThud": 0.65, "jade": 0.75, "bell": 0.7, "qing": 0.7,
         "wind": 0.18, "rain": 0.2, "flood": 0.32, "fire": 0.22, "murmur": 0.16, "cheer": 0.2, "thunder": 0.38, "knot": 0.55,
         "tick": 0.35, "heartbeat": 0.5, "breath": 0.3, "goldDraw": 0.32, "steps": 0.25, "mudPull": 0.5, "drip": 0.95}

bgm, sr0 = sf.read(bgm_path, always_2d=True)
assert sr0 == SR
N = int(end_frame / FPS * SR)
bgm = np.pad(bgm, ((0, max(0, N - len(bgm))), (0, 0)))[:N]
fx = np.zeros((N, 2))
duck = np.ones(N)
cues = []
for s in D["screens"]:
    if s["startFrame"] >= end_frame: continue
    for c in s.get("sfxFrames", []):
        cues.append(c)
for c in cues:
    t0 = c["f"] / FPS
    if t0 >= N / SR: continue
    x = make(c["sound"], c.get("dur"))
    lvl = LEVEL.get(c["sound"], 0.45) * c.get("gain", 1)
    x = x * lvl
    i = int(t0 * SR); j = min(N, i + len(x))
    pan = 0.5 + 0.12 * np.sin(c["f"])  # 轻微声像
    fx[i:j, 0] += x[: j - i] * (1 - pan) * 1.5
    fx[i:j, 1] += x[: j - i] * pan * 1.5
    if c.get("duck"):
        a, b = max(0, i - int(0.03 * SR)), min(N, i + int(0.35 * SR))
        g = 10 ** ((-9 if c['sound'] in ('slam', 'shatter') else -6) / 20)
        duck[a:b] = np.minimum(duck[a:b], g)
        rel = min(N, b + int(0.45 * SR))
        duck[b:rel] = np.minimum(duck[b:rel], np.linspace(g, 1, rel - b))
# 平滑 ducking 包络
duck = signal.sosfiltfilt(signal.butter(1, 12, "lowpass", fs=SR, output="sos"), duck)
mix = bgm * duck[:, None] * 0.62 + fx
pre = os.path.join(ROOT, "public/audio/_premix.wav")
os.makedirs(os.path.dirname(pre), exist_ok=True)
sf.write(pre, mix, SR, subtype="FLOAT")
if os.environ.get("STEMS"):
    sf.write(os.path.join(ROOT, "out/stem_fx.wav"), fx, SR, subtype="FLOAT"); sf.write(os.path.join(ROOT, "out/stem_bgm.wav"), bgm * duck[:, None] * 0.62, SR, subtype="FLOAT")
out = os.path.join(ROOT, "public/audio/mix_preview.wav" if args.preview else "public/audio/mix_full.wav")

def measure(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
    return float(re.findall(r"I:\s+(-?[0-9.]+) LUFS", r.stderr)[-1]), float(re.findall(r"Peak:\s+(-?[0-9.]+) dBFS", r.stderr)[-1])

# 增益对齐到 -14 LUFS → 4 倍过采样真峰值限幅（-2 dBFS，留余量给 AAC）→ 复测微调
I0, _ = measure(pre)
gain = -14 - I0 + 0.4
for _ in range(3):
    af = f"volume={gain:.2f}dB,aresample=192000,alimiter=limit=0.79:attack=0.6:release=60:level=false,aresample=48000"
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", pre, "-af", af, "-c:a", "pcm_s16le", out], check=True)
    I, TP = measure(out)
    if abs(I + 14) <= 0.25: break
    gain += -14 - I
print(f"{len(cues)} 个音效；输出 {os.path.relpath(out, ROOT)}  响度 {I} LUFS  真峰值 {TP} dBTP")
os.remove(pre)
