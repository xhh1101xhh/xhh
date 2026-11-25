#!/usr/bin/env python3
"""
成片自检：python3 scripts/check_frames.py out/yu_xia_full.mp4
 1) 每 2 秒抽一帧 → out/check/ + 拼图 out/check_sheet_*.jpg（人工逐张看）
 2) 静止检测：5fps 低分辨率逐帧差，找“画面静止 > 2.5 秒”的段
 3) 单薄检测：边缘密度过低（只剩点和线）的帧
 4) 固定层：左上主题、右上水印每帧都在、位置不动
 5) 右侧禁字区 x>1536（水印区除外）可疑文字像素
 6) 字幕带背景亮度
 7) 卡点：所有屏开始、砸屏、动作拍点与拍点表的偏差
 8) 阅读时长 / 单行宽度 / 互动引流词 / 绝对化表述
 9) 响度、真峰值、静音段
"""
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out/yu_xia_full.mp4")
outd = os.path.join(ROOT, "out/check"); os.makedirs(outd, exist_ok=True)
for f in os.listdir(outd): os.remove(os.path.join(outd, f))
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", mp4, "-vf", "fps=0.5", os.path.join(outd, "t%03d.jpg")], check=True)
files = sorted(os.listdir(outd))
D = json.load(open(os.path.join(ROOT, "src/data/subtitles.json")))
B = json.load(open(os.path.join(ROOT, "src/data/beats.json")))
END = int(subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", mp4], capture_output=True, text=True).stdout.strip())
rep = []

from PIL import ImageDraw
for k in range(0, len(files), 12):
    ims = [Image.open(os.path.join(outd, f)).resize((480, 270)) for f in files[k:k + 12]]
    sheet = Image.new("RGB", (1440, 270 * ((len(ims) + 2) // 3)))
    for i, (im, fn) in enumerate(zip(ims, files[k:k + 12])):
        t = (int(fn[1:4]) - 1) * 2 + 1
        ImageDraw.Draw(im).text((6, 252), f"{t // 60:02d}:{t % 60:02d}", fill=(255, 255, 0))
        sheet.paste(im, ((i % 3) * 480, (i // 3) * 270))
    sheet.save(os.path.join(ROOT, f"out/check_sheet_{k // 12 + 1}.jpg"), quality=85)

# 2) 静止检测
raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", mp4, "-vf", "fps=5,scale=320:180,format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, 180, 320).astype(np.int16)
diff = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))
still = diff < 0.35
runs, start = [], None
for i, s in enumerate(list(still) + [False]):
    if s and start is None: start = i
    if not s and start is not None:
        if (i - start) / 5 > 2.5: runs.append((start / 5, i / 5))
        start = None
rep.append(f"[静止>2.5s] {len(runs)} 段 " + " ".join(f"{a:.1f}-{b:.1f}s" for a, b in runs))

# 3/4/5/6) 逐帧检查
for i, fn in enumerate(files):
    t = i * 2 + 1
    im = Image.open(os.path.join(outd, fn)).convert("RGB")
    a = np.asarray(im).astype(float) / 255
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    gx = np.abs(np.diff(lum, axis=1))[:-1, :]; gy = np.abs(np.diff(lum, axis=0))[:, :-1]
    edge = ((gx + gy) > 0.08)[100:820, :].mean()
    if edge < 0.012: rep.append(f"[单薄] {t}s 边缘密度 {edge * 100:.2f}%")
    tl = lum[30:80, 40:420]; tr = lum[25:125, 1700:1890]
    if (tl > 0.55).mean() < 0.01: rep.append(f"[左上主题缺失?] {t}s")
    if (tr > 0.32).mean() < 0.004: rep.append(f"[右上水印缺失?] {t}s")
    band = lum[860:1040, 410:1510]
    if np.percentile(band, 50) > 0.42: rep.append(f"[字幕区偏亮] {t}s")
    rz = a[150:, 1536:, :]; mx, mn = rz.max(-1), rz.min(-1)
    cream = (mx > 0.88) & ((mx - mn) / (mx + 1e-6) < 0.18)
    if cream.mean() > 0.004: rep.append(f"[右侧禁字区可疑亮像素] {t}s 占比 {cream.mean() * 100:.2f}%（请人工确认）")

# 7) 卡点
beatf = sorted(b["f"] for b in B["beats"]) + [B["finalHit"]["f"]]
def near(f): return f - min(beatf, key=lambda b: abs(b - f))
dev = []
for s in D["screens"]:
    if s["startFrame"] >= END: continue
    dev.append((f"屏{s['id']}开始", s["startFrame"], near(s["startFrame"])))
    if "slam" in s: dev.append((f"屏{s['id']}砸屏", s["slam"]["f"], near(s["slam"]["f"])))
    for k, v in s["cueFrames"].items():
        if isinstance(v, int): dev.append((f"屏{s['id']}动作:{k}", v, near(v)))
bad = [d for d in dev if abs(d[2]) > 1]
rep.append(f"[卡点] 核对 {len(dev)} 个时间点（屏开始/砸屏/动作），偏差>1帧：{len(bad)}")
for d in bad: rep.append(f"    {d[0]} 帧{d[1]} 偏差{d[2]:+d}（半拍/十六分音符设计）")

# 8) 文案
BAN = ["评论", "点赞", "关注", "转发", "下期", "你怎么看", "留言", "收藏", "一键三连"]
ABS = ["绝对", "一定是", "毫无疑问", "唯一", "史上最", "100%", "必然"]
for s in D["screens"]:
    n = len(re.sub(r"[，。：；？！、…—《》“”（）·\s]", "", s["text"]))
    dur = (s["endFrame"] - s["startFrame"]) / 30
    if n / dur > 5.0: rep.append(f"[读不完] 屏{s['id']} {n}字/{dur:.2f}s")
    if len(s["text"]) * 64 > 1100: rep.append(f"[超宽] 屏{s['id']}")
    for w in BAN:
        if w in s["text"]: rep.append(f"[引流词] 屏{s['id']} 含“{w}”")
    for w in ABS:
        if w in s["text"]: rep.append(f"[绝对化] 屏{s['id']} 含“{w}”")

# 9) 音频
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
I = re.findall(r"I:\s+(-?[0-9.]+) LUFS", r.stderr); TP = re.findall(r"Peak:\s+(-?[0-9.]+) dBFS", r.stderr)
s2 = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp4, "-af", "silencedetect=n=-45dB:d=0.3", "-f", "null", "-"], capture_output=True, text=True).stderr
sil = re.findall(r"silence_start: ([0-9.]+)", s2)
rep.append(f"[音频] 响度 {I[-1] if I else '?'} LUFS，真峰值 {TP[-1] if TP else '?'} dBTP，静音段(<-45dB,≥0.3s) {len(sil)} 处 {sil[:5]}")
rep.append(f"[帧数] {END}")
print(f"抽帧 {len(files)} 张 → out/check/，拼图 out/check_sheet_*.jpg")
print("\n".join(rep))
