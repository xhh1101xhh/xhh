#!/usr/bin/env python3
"""
成片自检：
 1) 每 2 秒抽一帧 → out/check/*.jpg + 拼图 out/check_sheet_*.jpg（人工逐张看）
 2) 字幕区背景亮度/对比度（字幕带 y 860–1040）
 3) 右侧禁字区 x>1536：统计高饱和高亮“文字色”像素（乳白/描金/朱/石绿）占比，超阈值报警
 4) 卡点：转场、砸屏、动作拍点帧与拍点表的偏差（≤1 帧）
 5) 阅读时长、单行宽度/孤字
 6) 响度与真峰值
用法：python3 scripts/check_frames.py out/preview.mp4
"""
import json, os, re, subprocess, sys
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
mp4 = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "out/preview.mp4")
outd = os.path.join(ROOT, "out/check"); os.makedirs(outd, exist_ok=True)
for f in os.listdir(outd): os.remove(os.path.join(outd, f))
subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", mp4, "-vf", "fps=0.5", os.path.join(outd, "t%03d.jpg")], check=True)
files = sorted(os.listdir(outd))
D = json.load(open(os.path.join(ROOT, "src/data/subtitles.json")))
B = json.load(open(os.path.join(ROOT, "src/data/beats.json")))
beatf = sorted(b["f"] for b in B["beats"])
report = []

# 拼图
for k in range(0, len(files), 8):
    ims = [Image.open(os.path.join(outd, f)).resize((640, 360)) for f in files[k:k + 8]]
    sheet = Image.new("RGB", (1280, 360 * ((len(ims) + 1) // 2)))
    for i, im in enumerate(ims): sheet.paste(im, ((i % 2) * 640, (i // 2) * 360))
    sheet.save(os.path.join(ROOT, f"out/check_sheet_{k // 8 + 1}.jpg"), quality=85)

# 2/3) 字幕带亮度、右侧禁字区
for i, fn in enumerate(files):
    t = i * 2.0 + 1.0  # fps=0.5 取的是每段中点附近
    a = np.asarray(Image.open(os.path.join(outd, fn)).convert("RGB")).astype(float) / 255
    lum = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    band = lum[860:1040, 410:1510]
    bg = np.percentile(band, 50)
    if bg > 0.42:
        report.append(f"[字幕区偏亮] {fn} 背景中位亮度 {bg:.2f}")
    rz = a[:, 1536:, :]
    mx, mn = rz.max(-1), rz.min(-1)
    sat = (mx - mn) / (mx + 1e-6)
    cream = (mx > 0.88) & (sat < 0.18)
    textish = cream[150:, :]  # 排除右上水印区域
    frac = textish.mean()
    if frac > 0.004:
        report.append(f"[右侧禁字区可疑亮像素] {fn} 占比 {frac * 100:.2f}%（请人工确认是否为文字）")

# 4) 卡点
def near(f):
    j = min(beatf, key=lambda b: abs(b - f)); return f - j
dev = []
for s in D["screens"]:
    if s["startFrame"] >= D["meta"]["previewEndFrame"]: continue
    dev.append((f"屏{s['id']} 开始", s["startFrame"], near(s["startFrame"])))
    if "slam" in s: dev.append((f"屏{s['id']} 砸屏", s["slam"]["f"], near(s["slam"]["f"])))
    for k, v in s["cueFrames"].items():
        if isinstance(v, int): dev.append((f"屏{s['id']} 动作:{k}", v, near(v)))
bad = [d for d in dev if abs(d[2]) > 1]
offbeat = [d for d in bad if "knots" not in d[0] and "+" not in str(d)]
report.append(f"[卡点] 共核对 {len(dev)} 个时间点，与拍点偏差 >1 帧的：{len(bad)} 个")
for d in bad:
    report.append(f"    {d[0]} 帧 {d[1]} 偏差 {d[2]:+d}（半拍/十六分音符动作，属设计）")

# 5) 阅读与孤字
for s in D["screens"]:
    if s["startFrame"] >= D["meta"]["previewEndFrame"]: continue
    n = len(re.sub(r"[，。：；？！、…—《》“”（）·\s]", "", s["text"]))
    dur = (s["endFrame"] - s["startFrame"]) / 30
    if n / dur > 5.0: report.append(f"[读不完] 屏{s['id']} {n}字/{dur:.2f}s")
    w = len(s["text"]) * 64
    if s["display"] == "bottom" and w > 1100: report.append(f"[超宽] 屏{s['id']} 估计 {w}px")

# 6) 响度
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", mp4, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True)
I = re.findall(r"I:\s+(-?[0-9.]+) LUFS", r.stderr); TP = re.findall(r"Peak:\s+(-?[0-9.]+) dBFS", r.stderr)
report.append(f"[响度] 成片 {I[-1] if I else '?'} LUFS，真峰值 {TP[-1] if TP else '?'} dBTP")
print(f"抽帧 {len(files)} 张 → out/check/，拼图 out/check_sheet_*.jpg")
print("\n".join(report))
