#!/usr/bin/env python3
"""
把字幕文件里的拍点标签解析成帧号，回填到 src/data/subtitles.json：
  每屏 startFrame / endFrame、slam.f、cueFrames、expr 帧、sfx 帧
并检查阅读速度（每秒 ≤ readCharsPerSec 字），按 meta.previewEnd 剪出预览用 BGM。
换 BGM 后：python3 scripts/analyze_beats.py && python3 scripts/sync_timeline.py
"""
import json, os, re, subprocess, sys, math

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
B = json.load(open(os.path.join(ROOT, "src/data/beats.json")))
SUBP = os.path.join(ROOT, "src/data/subtitles.json")
D = json.load(open(SUBP))
FPS = B["fps"]
BEATF = 60 / B["bpm"] * FPS
by = {b["label"]: b["f"] for b in B["beats"]}
by["OUT:END"] = B["finalHit"]["f"]
SRC_END = int(round(B["sourceDuration"] * FPS))

def F(label):
    if label == "TAIL":
        return SRC_END
    m = re.match(r"^([^+\-]+?)([+\-][0-9.]+)?$", label.strip())
    base = m.group(1)
    if base.startswith("#"):
        bar, beat = map(int, base[1:].split("."))
        f = B["beats"][(bar - 1) * 4 + beat - 1]["f"]
    else:
        if base not in by:
            raise SystemExit(f"拍点标签不存在: {label}（换 BGM 后段落名或小节数变了？请改 public/bgm/sections.json 或字幕标签）")
        f = by[base]
    return int(round(f + (float(m.group(2)) * BEATF if m.group(2) else 0)))

def snap16(f):
    # 吸附到最近的十六分音符
    b0 = B["beats"][0]["f"]
    q = BEATF / 4
    return int(round(b0 + round((f - b0) / q) * q))

def nchar(s):
    return len(re.sub(r"[，。：；？！、…—《》“”（）·\s]", "", s))

warn = []
for s in D["screens"]:
    s["startFrame"] = F(s["start"])
    s["endFrame"] = F(s["end"])
    dur = (s["endFrame"] - s["startFrame"]) / FPS
    n = nchar(s["text"])
    if n / dur > D["meta"]["readCharsPerSec"] + 1e-6:
        warn.append(f"屏 {s['id']} 读不完：{n} 字 / {dur:.2f}s")
    vis = re.sub(r"[\s]", "", s["text"])
    if len(vis) > 16:
        warn.append(f"屏 {s['id']} 超过 16 字")
    if "slam" in s:
        s["slam"]["f"] = F(s["slam"]["at"])
        if not (s["startFrame"] <= s["slam"]["f"] < s["endFrame"]):
            warn.append(f"屏 {s['id']} 砸屏时刻不在本屏内")
    cf = {k: F(v) for k, v in s.get("cues", {}).items()}
    if "knotsFrom" in cf:
        a, b = cf["knotsFrom"], cf["knotsTo"]
        cf["knots"] = [snap16(a + (b - a) * i / 12) for i in range(13)]
    s["cueFrames"] = cf
    for c in s.get("cast", []):
        c["exprFrames"] = [[F(l), e] for l, e in c.get("expr", [])]
    sx = []
    for x in s.get("sfx", []):
        if x["at"] == "KNOTS":
            for k in cf.get("knots", []):
                sx.append({**x, "f": k})
        else:
            sx.append({**x, "f": F(x["at"])})
    s["sfxFrames"] = sx

pe = D["meta"].get("previewEnd")
if pe:
    D["meta"]["previewEndFrame"] = F(pe)
    end_s = D["meta"]["previewEndFrame"] / FPS
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", os.path.join(ROOT, "public/bgm/bgm.mp3"),
                    "-t", f"{end_s:.3f}", "-af", f"afade=t=in:st=0:d=0.03,afade=t=out:st={end_s - 1.5:.3f}:d=1.5",
                    "-ar", "48000", "-ac", "2", os.path.join(ROOT, "public/bgm/bgm_preview.wav")], check=True)
D["meta"]["fullEndFrame"] = SRC_END
json.dump(D, open(SUBP, "w"), ensure_ascii=False, indent=1)
print(f"synced {len(D['screens'])} screens; previewEnd={D['meta'].get('previewEndFrame')}f; full={SRC_END}f")
for w in warn:
    print("WARN", w)
