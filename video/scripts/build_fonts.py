#!/usr/bin/env python3
"""从 @fontsource 的思源黑体(Noto Sans SC)/思源宋体(Noto Serif SC)里，挑出覆盖字幕所用汉字的分片，
复制到 public/fonts，并生成 src/data/fonts.generated.ts（运行时用 FontFace 按 unicode-range 加载）。"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = json.load(open(os.path.join(ROOT, "src/data/subtitles.json")))
chars = set()
def add(s):
    chars.update(s or "")
m = D["meta"]
add(m["title"]); add(m["topic"]); add(m["watermark"])
for s in D["screens"]:
    add(s["text"])
    for k in ("pre", "key", "post"):
        add(s.get("slam", {}).get(k))
# 画面内文字（地名牌、印章等）
extra = os.path.join(ROOT, "src/data/scene_text.txt")
if os.path.exists(extra):
    add(open(extra).read())
add("0123456789·：，。、《》“”！？——…")
cps = sorted(ord(c) for c in chars if not c.isspace())

def parse_ranges(r):
    out = []
    for part in r.split(","):
        part = part.strip().replace("U+", "")
        if "-" in part:
            a, b = part.split("-"); out.append((int(a, 16), int(b, 16)))
        else:
            out.append((int(part, 16), int(part, 16)))
    return out

entries = []
dst = os.path.join(ROOT, "public/fonts"); os.makedirs(dst, exist_ok=True)
for pkg, fam, weights in (("noto-sans-sc", "Noto Sans SC", (500, 700, 900)), ("noto-serif-sc", "Noto Serif SC", (700, 900))):
    base = os.path.join(ROOT, "node_modules/@fontsource", pkg)
    for w in weights:
        css = open(os.path.join(base, f"{w}.css")).read()
        for blk in re.findall(r"@font-face\s*{(.*?)}", css, re.S):
            src = re.search(r"url\(\./files/([^)]+\.woff2)\)", blk).group(1)
            rng = re.search(r"unicode-range:\s*([^;]+);", blk).group(1)
            rr = parse_ranges(rng)
            if any(a <= c <= b for c in cps for a, b in rr):
                shutil.copy(os.path.join(base, "files", src), os.path.join(dst, src))
                entries.append({"family": fam, "weight": w, "file": f"fonts/{src}", "range": rng})
ts = "// 自动生成：python3 scripts/build_fonts.py\nexport const FONT_FILES = " + json.dumps(entries, ensure_ascii=False) + " as const;\n"
open(os.path.join(ROOT, "src/data/fonts.generated.ts"), "w").write(ts)
print(len(cps), "chars,", len(entries), "font slices copied")
