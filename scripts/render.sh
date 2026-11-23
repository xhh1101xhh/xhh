#!/usr/bin/env bash
# Render a composition, then master the audio to about -14 LUFS / <= -1 dBTP and mux.
#   bash scripts/render.sh Preview out/preview.mp4
set -euo pipefail
COMP="${1:-Preview}"
OUT="${2:-out/${COMP,,}.mp4}"
mkdir -p "$(dirname "$OUT")" out/.tmp
RAW="out/.tmp/${COMP}_raw.mp4"

[ -f public/bgm/bgm_edit.wav ] || python3 scripts/analyze_beats.py
[ -f public/sfx/impact.wav ] || python3 scripts/synth_sfx.py
[ -f public/textures/grain.png ] || python3 scripts/make_textures.py

npx remotion render "$COMP" "$RAW" --codec=h264 --crf=17 --audio-codec=aac --audio-bitrate=320k --log=error

# pass 1: measure
STATS=$(ffmpeg -hide_banner -nostats -i "$RAW" -af loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json -f null - 2>&1 | sed -n '/^{/,/^}/p')
mi=$(echo "$STATS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_i"])')
mtp=$(echo "$STATS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_tp"])')
mlra=$(echo "$STATS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_lra"])')
mth=$(echo "$STATS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["input_thresh"])')
off=$(echo "$STATS" | python3 -c 'import json,sys;d=json.load(sys.stdin);print(d["target_offset"])')
# pass 2: apply (linear when possible) + a true-peak safety limiter, 48 kHz
ffmpeg -hide_banner -loglevel error -y -i "$RAW" \
  -af "loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=$mi:measured_TP=$mtp:measured_LRA=$mlra:measured_thresh=$mth:offset=$off:linear=true,alimiter=limit=0.85:attack=3:release=60:level=disabled,aresample=48000" \
  -c:v copy -c:a aac -b:a 320k -movflags +faststart "$OUT"
echo "--- loudness of $OUT"
ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1 | grep -E "^\s+(I:|Peak:|LRA:)" | tr -s ' '
