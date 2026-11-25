#!/usr/bin/env python3
"""
节拍分析：public/bgm/bgm.mp3 → src/data/beats.ts + src/data/beats.json + public/bgm/bgm_cut.wav

用法：
  python3 scripts/analyze_beats.py                       # 全曲
  python3 scripts/analyze_beats.py --end 52.5            # 截断到 52.5s（自动在乐句处淡出）
  python3 scripts/analyze_beats.py --loop-to 240         # 循环到 240s（按整小节拼接）

输出的 beats.ts 包含：BPM、每拍/每小节头帧号、段落起止帧、重拍(accents)、
爆点(drops)、突然安静(silences)、终止重音(finalHit)，以及 frameOf()/snapToBeat() 工具函数。
段落命名：自动检测；如需人工命名，写 public/bgm/sections.json：
  [{"name":"INT","startBar":1}, {"name":"A","startBar":9}, ...]
"""
import argparse, json, os, subprocess, sys
import numpy as np
import librosa

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FPS = 30

ap = argparse.ArgumentParser()
ap.add_argument("--src", default=os.path.join(ROOT, "public/bgm/bgm.mp3"))
ap.add_argument("--end", type=float, default=None, help="截断时长（秒）")
ap.add_argument("--loop-to", type=float, default=None, help="循环到该时长（秒）")
ap.add_argument("--fade-in", type=float, default=0.03)
ap.add_argument("--fade-out", type=float, default=1.6)
ap.add_argument("--fps", type=int, default=FPS)
args = ap.parse_args()
FPS = args.fps

y, sr = librosa.load(args.src, sr=22050, mono=True)
dur = len(y) / sr
hop = 512
oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
tempo, beat_frames = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop)
bpm = float(np.atleast_1d(tempo)[0])
beat_t = librosa.frames_to_time(beat_frames, sr=sr, hop_length=hop)
strength = oenv[beat_frames]

# ---- 强拍相位：哪一相位的起音强度最大，就是每小节第 1 拍 ----
phase = int(np.argmax([strength[p::4].mean() for p in range(4)]))
beat_t = beat_t[phase:]
strength = strength[phase:]
nb = len(beat_t)
nbars = nb // 4
beat_t = beat_t[: nbars * 4]
strength = strength[: nbars * 4]
nb = len(beat_t)

# ---- 小节能量 ----
rms = librosa.feature.rms(y=y, hop_length=hop)[0]
rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop)
S = np.abs(librosa.stft(y, hop_length=hop))
freqs = librosa.fft_frequencies(sr=sr)
low = S[freqs < 150].sum(0)

def seg_mean(arr, t0, t1):
    m = (rt >= t0) & (rt < t1)
    return float(arr[: len(rt)][m].mean()) if m.any() else 0.0

bar_start = [beat_t[i * 4] for i in range(nbars)]
bar_end = [beat_t[i * 4 + 4] if i * 4 + 4 < nb else dur for i in range(nbars)]
bar_rms = np.array([seg_mean(rms, a, b) for a, b in zip(bar_start, bar_end)])
bar_low = np.array([seg_mean(low, a, b) for a, b in zip(bar_start, bar_end)])
med = float(np.median(bar_rms))

# ---- 终止重音：最后 8 秒里最后一个能量尖峰，其后能量持续衰减 ----
y_end = y[int(max(0, dur - 8) * sr):]
r2 = librosa.feature.rms(y=y_end, frame_length=512, hop_length=128)[0]
t2 = librosa.frames_to_time(np.arange(len(r2)), sr=sr, hop_length=128) + max(0, dur - 8)
final_t = None
for i in range(len(r2) - 1, 20, -1):
    after = r2[i + 4: i + 40]
    if r2[i] > 1.4 * np.median(r2) and len(after) and after.mean() < 0.55 * r2[i]:
        # 回溯到尖峰起点
        j = i
        while j > 0 and r2[j - 1] >= 0.8 * r2[i]:
            j -= 1
        final_t = float(t2[j]); break
if final_t is None:
    final_t = float(beat_t[-1])

# 终止重音之后的拍属于余音，不计入小节（避免把衰减尾巴当节拍）
valid_bars = [i for i in range(nbars) if bar_start[i] < final_t - 0.3]
nbars_v = len(valid_bars)

# ---- 段落：人工覆盖优先，否则自动 ----
override = os.path.join(ROOT, "public/bgm/sections.json")
if os.path.exists(override):
    sec_def = json.load(open(override))
    starts = [s["startBar"] for s in sec_def]
    names = [s["name"] for s in sec_def]
    source = "override"
else:
    # 以 4 小节乐句网格找候选，再在 ±1 小节内用“能量+低频”的突变量精修边界
    def jump(b):  # 第 b 小节（1 起）相对前一小节的突变量
        if b < 2 or b > nbars_v: return 0.0
        r = abs(np.log((bar_rms[b-1] + 1e-6) / (bar_rms[b-2] + 1e-6)))
        l = abs(np.log((bar_low[b-1] + 1e-6) / (bar_low[b-2] + 1e-6)))
        return r + 0.5 * l
    cands = [1]
    for g in range(5, nbars_v - 2, 4):
        prev = bar_rms[max(0, g - 5): g - 1].mean(); nxt = bar_rms[g - 1: g + 3].mean()
        if nxt > prev * 1.3 or nxt < prev * 0.75:
            b = max([g - 1, g, g + 1], key=jump)
            if b - cands[-1] >= 4: cands.append(b)
    starts = cands
    names = []
    hi_count = 0
    for k, s in enumerate(starts):
        e = starts[k + 1] - 1 if k + 1 < len(starts) else nbars_v
        lvl = bar_rms[s - 1: e].mean()
        if k == 0:
            names.append("INT")
        elif k == len(starts) - 1 and lvl < med * 1.05:
            names.append("OUT")
        elif lvl < med * 0.7:
            names.append("BRK")
        elif names and names[-1] == "BRK" and lvl < med * 0.95:
            names.append("BLD")
        else:
            hi_count += 1
            names.append("A" if hi_count == 1 else f"DRP{hi_count - 1}")
    seen = {}
    for k, n in enumerate(names):  # 同名段落加序号，保证标签唯一
        if n in seen: seen[n] += 1; names[k] = f"{n}{seen[n]}"
        else: seen[n] = 1
    source = "auto"

sections = []
for k, (n, s) in enumerate(zip(names, starts)):
    e = (starts[k + 1] - 1) if k + 1 < len(starts) else nbars
    sections.append({"name": n, "startBar": s, "endBar": e})

def f_of(t):
    return int(round(t * FPS))

def sec_of_bar(b):
    for s in sections:
        if s["startBar"] <= b <= s["endBar"]:
            return s
    return sections[-1]

beats = []
for i in range(nb):
    b = i // 4 + 1; k = i % 4 + 1
    s = sec_of_bar(b)
    beats.append({
        "i": i, "t": round(float(beat_t[i]), 4), "f": f_of(beat_t[i]),
        "bar": b, "beat": k, "label": f"{s['name']}:{b - s['startBar'] + 1:02d}.{k}",
        "strength": round(float(strength[i]), 2),
    })

# 重拍：起音强度前 30% 且为 1/3 拍；爆点：高能段落首拍 + 前一拍静音后的强拍
st = np.array([b["strength"] for b in beats])
thr = np.percentile(st, 70)
accents = [b["f"] for b in beats if b["strength"] >= thr and b["beat"] in (1, 3) and b["t"] < final_t]
silences = []
for b in beats:
    if b["t"] >= final_t:
        break
    local = np.median(st[max(0, b["i"] - 8): b["i"] + 8])
    if b["strength"] < 0.12 * local:
        silences.append({"f": b["f"], "label": b["label"]})
drops = []
for s in sections[1:]:
    i0 = (s["startBar"] - 1) * 4
    if i0 < nb and bar_rms[s["startBar"] - 1] >= med * 0.95:
        drops.append({"f": beats[i0]["f"], "label": beats[i0]["label"], "section": s["name"]})
# 终止重音
drops.append({"f": f_of(final_t), "label": "OUT:END", "section": "END"})

sections_out = []
for s in sections:
    i0 = (s["startBar"] - 1) * 4
    i1 = min(s["endBar"] * 4, nb)
    sections_out.append({
        "name": s["name"], "startBar": s["startBar"], "endBar": s["endBar"],
        "startFrame": beats[i0]["f"],
        "endFrame": beats[i1]["f"] if i1 < nb else f_of(dur),
    })

# ---- 截断 / 循环，输出处理后的 BGM ----
out_wav = os.path.join(ROOT, "public/bgm/bgm_cut.wav")
end = args.end
af = [f"afade=t=in:st=0:d={args.fade_in}"]
if args.loop_to:
    # 以最后一个完整高能段落为循环体（整小节），ffmpeg concat
    body = [s for s in sections_out if s["name"] not in ("INT", "OUT")][-1]
    t0, t1 = body["startFrame"] / FPS, body["endFrame"] / FPS
    reps = int(np.ceil((args.loop_to - t0) / (t1 - t0)))
    filt = f"[0:a]atrim=0:{t1},asetpts=N/SR/TB[a0];" + "".join(
        f"[0:a]atrim={t0}:{t1},asetpts=N/SR/TB[l{r}];" for r in range(reps))
    filt += "[a0]" + "".join(f"[l{r}]" for r in range(reps)) + f"concat=n={reps + 1}:v=0:a=1,atrim=0:{args.loop_to}[o]"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", args.src, "-filter_complex", filt, "-map", "[o]",
                    "-ar", "48000", "-ac", "2", out_wav], check=True)
    end_used = args.loop_to
elif end:
    af.append(f"afade=t=out:st={max(0, end - args.fade_out)}:d={args.fade_out}")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", args.src, "-t", str(end), "-af", ",".join(af),
                    "-ar", "48000", "-ac", "2", out_wav], check=True)
    end_used = end
else:
    # 全曲：终止重音后的余音保留，到文件末尾前 0.6s 开始轻淡出，避免截断噪声
    af.append(f"afade=t=out:st={dur - 0.6}:d=0.6")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", args.src, "-af", ",".join(af),
                    "-ar", "48000", "-ac", "2", out_wav], check=True)
    end_used = dur

data = {
    "fps": FPS, "bpm": round(bpm, 2), "beatSec": round(60 / bpm, 4), "meter": 4,
    "sourceDuration": round(dur, 3), "usedDuration": round(end_used, 3),
    "durationFrames": f_of(end_used), "sectionSource": source,
    "finalHit": {"t": round(final_t, 3), "f": f_of(final_t), "label": "OUT:END"},
    "sections": sections_out,
    "bars": [{"bar": b["bar"], "f": b["f"], "label": b["label"]} for b in beats if b["beat"] == 1],
    "beats": beats, "accents": accents, "drops": drops, "silences": silences,
}
json.dump(data, open(os.path.join(ROOT, "src/data/beats.json"), "w"), ensure_ascii=False, indent=1)

ts = f"""// 自动生成：python3 scripts/analyze_beats.py   ——请勿手改
// 源文件 {os.path.basename(args.src)}  BPM {bpm:.2f}  段落来源 {source}
export type Beat = {{i:number;t:number;f:number;bar:number;beat:number;label:string;strength:number}};
export type Section = {{name:string;startBar:number;endBar:number;startFrame:number;endFrame:number}};
export const BEATS = {json.dumps(data, ensure_ascii=False)} as const;
export const FPS = BEATS.fps;
export const BPM = BEATS.bpm;
export const BEAT_FRAMES = (60 / BEATS.bpm) * BEATS.fps;
export const BAR_FRAMES = BEAT_FRAMES * BEATS.meter;
const byLabel = new Map<string, number>();
for (const b of BEATS.beats) byLabel.set(b.label, b.f);
byLabel.set('OUT:END', BEATS.finalHit.f);

/** 拍点标签 → 帧号。支持 "A:03.1"、"#11.1"（绝对小节）、"A:03.1+2"（再往后 2 拍）、"A:03.1+0.5"（半拍） */
export function frameOf(label: string): number {{
  const m = /^([^+\\-]+?)([+\\-][0-9.]+)?$/.exec(label.trim());
  if (!m) throw new Error('bad beat label ' + label);
  const base = m[1];
  let f: number | undefined;
  if (base.startsWith('#')) {{
    const [bar, beat] = base.slice(1).split('.').map(Number);
    f = BEATS.beats[(bar - 1) * 4 + (beat - 1)]?.f;
  }} else f = byLabel.get(base);
  if (f === undefined) throw new Error('beat label not found: ' + label);
  return Math.round(f + (m[2] ? parseFloat(m[2]) * BEAT_FRAMES : 0));
}}

/** 把任意帧吸附到拍点。mode: nearest | next | prev；onlyDownbeat: 只吸附小节头；onlyAccent: 只吸附重拍 */
export function snapToBeat(frame: number, opts: {{mode?: 'nearest'|'next'|'prev'; onlyDownbeat?: boolean; onlyAccent?: boolean}} = {{}}): number {{
  const {{mode = 'nearest', onlyDownbeat = false, onlyAccent = false}} = opts;
  const acc = new Set<number>(BEATS.accents as readonly number[]);
  const list = BEATS.beats.filter(b => (!onlyDownbeat || b.beat === 1) && (!onlyAccent || acc.has(b.f))).map(b => b.f);
  let best = list[0];
  for (const f of list) {{
    if (mode === 'next' && f >= frame) return f;
    if (mode === 'prev' && f <= frame) best = f;
    if (mode === 'nearest' && Math.abs(f - frame) < Math.abs(best - frame)) best = f;
  }}
  return best;
}}

/** 当前帧所在拍的相位 0..1（用于弱拍呼吸动画） */
export function beatPhase(frame: number): number {{
  const p = (frame - BEATS.beats[0].f) / BEAT_FRAMES;
  return ((p % 1) + 1) % 1;
}}

/** 当前帧是否处于“突然安静”的拍内 */
export function isSilentAt(frame: number): boolean {{
  return BEATS.silences.some(s => frame >= s.f && frame < s.f + BEAT_FRAMES);
}}

export function sectionAt(frame: number) {{
  return BEATS.sections.find(s => frame >= s.startFrame && frame < s.endFrame) ?? BEATS.sections[BEATS.sections.length - 1];
}}
"""
open(os.path.join(ROOT, "src/data/beats.ts"), "w").write(ts)

print(f"BPM {bpm:.2f}  beats {nb}  bars {nbars}  phase {phase}  final hit {final_t:.3f}s  sections({source}):")
for s in sections_out:
    print(f"  {s['name']:5s} bars {s['startBar']:2d}-{s['endBar']:2d}  frames {s['startFrame']}-{s['endFrame']}  ({s['startFrame']/FPS:.2f}s)")
print("drops", [(d['label'], d['f']) for d in drops])
print("silences", [s['label'] for s in silences])
print("accents", len(accents), " used duration", end_used)
