#!/usr/bin/env python3
"""BGM beat / structure analysis -> src/data/beats.ts (+ edited BGM when it must be cut or looped).

Usage:  python3 scripts/analyze_beats.py            (reads bgm.config.json)
        python3 scripts/analyze_beats.py --source public/bgm/other.mp3 --target 130

Steps
 1. beat tracking on the source; bar phase from section-boundary evidence (energy jumps + onset strength)
    combined with low-band kick energy, so bar heads are real downbeats rather than an assumed grid
 2. edit plan: manual cuts from config, or automatic. Too long -> remove whole 8/16-bar blocks whose
    preceding context is harmonically the same as the context before the landing bar (so the jump
    sounds like the original transition). Too short -> insert a repeat of a block of the same kind
    before the outro. Seams snap to the local transient, 12 ms equal-power crossfade.
 3. re-analyse the edited audio: beats, bars, energy, hits, sudden quiet, sections with roles
 4. write src/data/beats.ts (frames at FPS) and public/bgm/analysis.json
"""
import argparse, json, os, sys
import numpy as np
import librosa
import soundfile as sf
import scipy.signal as sig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROLES = ['INTRO', 'B1', 'D', 'A2', 'B2', 'C', 'B3', 'OUT']
ROLE_NAMES = {'INTRO': '前奏', 'B1': '副歌1', 'D': '桥段/breakdown', 'A2': '主歌2', 'B2': '副歌2',
              'C': '高潮', 'B3': '副歌再现', 'OUT': '尾奏'}


# ----------------------------------------------------------------------------- analysis core
def analyse(y, sr, hop=256):
    oenv = librosa.onset.onset_strength(y=y, sr=sr, hop_length=hop)
    tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, hop_length=hop, units='frames', tightness=100)
    tempo = float(np.atleast_1d(tempo)[0])
    bt = librosa.frames_to_time(beats, sr=sr, hop_length=hop)
    S = np.abs(librosa.stft(y, n_fft=2048, hop_length=hop))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=2048)
    low = S[(freqs >= 30) & (freqs <= 150)].sum(axis=0)
    low_on = np.maximum(0, np.diff(low, prepend=low[0]))
    rms = librosa.feature.rms(y=y, frame_length=2048, hop_length=hop)[0]
    db = librosa.amplitude_to_db(rms, ref=np.max)
    cent = librosa.feature.spectral_centroid(S=S, sr=sr)[0]
    chroma = librosa.feature.chroma_cqt(y=y, sr=sr, hop_length=hop)
    mfcc = librosa.feature.mfcc(y=y, sr=sr, hop_length=hop, n_mfcc=13)
    t2f = lambda t: int(librosa.time_to_frames(max(0.0, t), sr=sr, hop_length=hop))

    def peak(arr, t, w=0.04):
        a, b = t2f(t - w), t2f(t + w) + 1
        return float(arr[a:b].max()) if b > a else 0.0

    def seg_db(a, b):
        return float(db[t2f(a):max(t2f(a) + 1, t2f(b))].mean())

    # bar phase: kick energy is ambiguous when the groove accents 2 & 4, so weigh section-boundary jumps
    scores = []
    for ph in range(4):
        heads = bt[ph::4]
        jumps = [abs(seg_db(heads[i], heads[i + 1]) - seg_db(heads[i - 1], heads[i])) for i in range(1, len(heads) - 1)]
        jump = float(np.sort(jumps)[::-1][:8].sum()) if jumps else 0.0
        ons = float(np.mean([peak(oenv, t, 0.03) for t in heads]))
        kick = float(np.mean([peak(low_on, t, 0.05) for t in heads]))
        scores.append((jump, ons, kick))
    sc = np.array(scores); sc = sc / (sc.max(axis=0) + 1e-9)
    combo = 2 * sc[:, 0] + sc[:, 1] + 0.5 * sc[:, 2]
    phase = int(np.argmax(combo))
    # extrapolate pickup beats before the first bar head so beat index 0 is a downbeat
    ibi = float(np.median(np.diff(bt)))
    bt = bt[phase:]
    dur = len(y) / sr
    bars = bt[::4]
    bounds = list(bars) + [dur]
    bar_feat, bar_db, bar_cent, bar_chroma = [], [], [], []
    for i in range(len(bars)):
        a, b = t2f(bounds[i]), max(t2f(bounds[i]) + 1, t2f(bounds[i + 1]))
        c = chroma[:, a:b].mean(axis=1); c /= np.linalg.norm(c) + 1e-9
        m = mfcc[1:, a:b].mean(axis=1); m /= np.linalg.norm(m) + 1e-9
        bar_feat.append(np.r_[c, 0.6 * m]); bar_db.append(float(db[a:b].mean())); bar_cent.append(float(cent[a:b].mean()))
        parts = np.array_split(chroma[:, a:b], 4, axis=1)
        cc = np.array([p.mean(axis=1) for p in parts]); cc /= np.linalg.norm(cc, axis=1, keepdims=True) + 1e-9
        bar_chroma.append(cc)
    ob = np.array([peak(oenv, t, 0.04) for t in bt])
    return dict(tempo=tempo, ibi=ibi, beats=bt, bars=bars, dur=dur, phase=phase, phase_scores=combo.tolist(),
                bar_feat=np.array(bar_feat), bar_db=np.array(bar_db), bar_cent=np.array(bar_cent),
                bar_chroma=bar_chroma, onset_beats=ob, db=db, rt=librosa.frames_to_time(np.arange(len(db)), sr=sr, hop_length=hop),
                oenv=oenv, hop=hop, sr=sr)


def harm_sim(A, i, j, n=2):
    """similarity of the n bars ending at bar i with the n bars ending at bar j (ordered chroma)."""
    if i - n < 0 or j - n < 0:
        return 0.0
    s = [float((A['bar_chroma'][i - k] * A['bar_chroma'][j - k]).sum(axis=1).mean()) for k in range(1, n + 1)]
    return float(np.mean(s))


# ----------------------------------------------------------------------------- edit planning
def plan_edit(A, target, tol, max_cuts=3):
    """Only cut 8/16-bar blocks that sit inside one section and leave >= 8 bars of it, so every
    section type survives (no losing the climax just because it is the only C)."""
    nb = len(A['bars']); dur = A['dur']
    roles0, segs0 = sections(A)
    seg_of = {}
    for k, sg in enumerate(segs0):
        for b in range(sg['start'], sg['end']):
            seg_of[b] = k
    bar_len = float(np.median(np.diff(A['bars'])))
    protect_head, protect_tail = 8, 4   # never touch the intro or the last bars
    if dur > target + tol:
        cands = []
        for L in (8, 16):
            for s in range(protect_head, nb - protect_tail - L):
                d = s + L
                if s % 4 or d >= nb - protect_tail:
                    continue
                ks = seg_of.get(s); kd = seg_of.get(d - 1)
                if ks is None or ks != kd or s == segs0[ks]['start']:
                    continue
                if (segs0[ks]['end'] - segs0[ks]['start']) - L < 8:
                    continue
                before = harm_sim(A, s, d, 2)
                after = float((A['bar_feat'][s] @ A['bar_feat'][d]) / (np.linalg.norm(A['bar_feat'][s]) * np.linalg.norm(A['bar_feat'][d]) + 1e-9))
                energy_ok = abs(A['bar_db'][s - 1] - A['bar_db'][d - 1]) < 2.5
                if before > 0.9 and after > 0.85 and energy_ok:
                    cands.append((before + 0.3 * after, s, d))
        cands.sort(reverse=True)
        best, best_err = [], abs(dur - target)
        # small exhaustive search over non-overlapping candidate combos
        import itertools
        top = cands[:30]
        for k in range(1, max_cuts + 1):
            for combo in itertools.combinations(top, k):
                spans = sorted((s, d) for _, s, d in combo)
                if any(spans[i][1] > spans[i + 1][0] - 4 for i in range(len(spans) - 1)):
                    continue
                new = dur - sum((d - s) * bar_len for s, d in spans)
                # prefer fewer cuts, better seams, and cutting later rather than earlier (keeps the set-up intact)
                err = abs(new - target) + 2.0 * k - 0.5 * sum(c[0] for c in combo) - 0.004 * sum(s for s, _ in spans)
                if err < best_err:
                    best, best_err = spans, err
        return [{'type': 'cut', 'leave_bar': s, 'land_bar': d} for s, d in best]
    if dur < target - tol:
        # loop: replay a block [s, d) right before the outro, where the bar before s matches the bar before outro
        out_bar = nb - protect_tail
        need = target - dur
        L = 8 if need < 12 * bar_len else 16
        best = None
        for s in range(protect_head, out_bar - L):
            if s % 4:
                continue
            sc = harm_sim(A, s, out_bar, 2) + harm_sim(A, s + L, out_bar, 1)
            if best is None or sc > best[0]:
                best = (sc, s)
        edits = []
        reps = int(round(need / (L * bar_len))) or 1
        for _ in range(reps):
            edits.append({'type': 'loop', 'at_bar': out_bar, 'from_bar': best[1], 'to_bar': best[1] + L})
        return edits
    return []


def apply_edit(src_path, A, edits, out_path, xf_ms=12):
    y, sr = librosa.load(src_path, sr=48000, mono=False)
    if y.ndim == 1:
        y = np.stack([y, y])
    mono = y.mean(axis=0)
    hop = 64
    oenv = librosa.onset.onset_strength(y=mono, sr=sr, hop_length=hop)
    bars = A['bars']

    def snap(t, w=0.035):
        f0 = max(0, int((t - w) * sr / hop)); f1 = int((t + w) * sr / hop)
        return (f0 + int(np.argmax(oenv[f0:f1]))) * hop / sr

    pre = 0.008
    pieces = []  # (start_s, end_s) of the source, in playback order
    seams = []
    if not edits:
        pieces = [(0.0, y.shape[1] / sr)]
    elif edits[0]['type'] == 'cut':
        cur = 0.0
        for e in sorted(edits, key=lambda e: e['leave_bar']):
            ts, td = snap(bars[e['leave_bar']]), snap(bars[e['land_bar']])
            pieces.append((cur, ts - pre)); cur = td - pre
            e.update(leave_t=round(ts, 4), land_t=round(td, 4), harmony_sim=round(harm_sim(A, e['leave_bar'], e['land_bar']), 3))
        pieces.append((cur, y.shape[1] / sr))
    else:
        e0 = edits[0]
        t_at, t_from, t_to = snap(bars[e0['at_bar']]), snap(bars[e0['from_bar']]), snap(bars[e0['to_bar']])
        pieces.append((0.0, t_at - pre))
        for e in edits:
            pieces.append((t_from - pre, t_to - pre))
            e.update(harmony_sim=round(harm_sim(A, e['from_bar'], e['at_bar']), 3))
        pieces.append((t_at - pre, y.shape[1] / sr))
    xf = int(xf_ms / 1000 * sr)
    out = None
    t_acc = 0.0
    for a, b in pieces:
        seg = y[:, int(a * sr):int(b * sr)].copy()
        if out is None:
            out = seg
        else:
            seams.append(round(out.shape[1] / sr, 4))
            ph = np.linspace(0, 1, xf)
            mix = out[:, -xf:] * np.cos(ph * np.pi / 2) + seg[:, :xf] * np.sin(ph * np.pi / 2)
            out = np.concatenate([out[:, :-xf], mix, seg[:, xf:]], axis=1)
    sf.write(out_path, out.T, sr, subtype='PCM_16')
    return out.shape[1] / sr, seams


# ----------------------------------------------------------------------------- sections & roles
def sections(A):
    nb = len(A['bars'])
    bdb = A['bar_db']; top = bdb.max()
    # trailing outro: bars well below the loudest level at the very end
    out_start = nb
    while out_start > 0 and bdb[out_start - 1] < top - 6.5:
        out_start -= 1
    out_start = min(out_start, nb - 1)
    # 4-bar blocks over the body
    blocks = []
    for s in range(0, out_start, 4):
        e = min(s + 4, out_start)
        blocks.append((s, e, float(bdb[s:e].mean()), A['bar_feat'][s:e].mean(axis=0), float(A['bar_cent'][s:e].mean())))
    lv = np.array([b[2] for b in blocks])
    hi_thr = lv.max() - 2.5; lo_thr = lv.max() - 6.0
    level = ['H' if v >= hi_thr else ('L' if v <= lo_thr else 'M') for v in lv]
    # harmonic/timbre clusters (greedy, cosine on chroma+mfcc, plus brightness)
    cl, protos = [], []
    for (s, e, v, f, c) in blocks:
        fn = f / (np.linalg.norm(f) + 1e-9)
        best, bi = -1, -1
        for k, (pf, pc) in enumerate(protos):
            sim = float(fn @ pf) - abs(c - pc) / 4000.0
            if sim > best:
                best, bi = sim, k
        if best > 0.93:
            cl.append(bi)
        else:
            protos.append((fn, c)); cl.append(len(protos) - 1)
    letters = 'ABCDEFGH'
    segs = []
    for i, b in enumerate(blocks):
        key = (level[i], cl[i])
        if segs and segs[-1]['key'] == key:
            segs[-1]['end'] = b[1]
        else:
            segs.append({'key': key, 'start': b[0], 'end': b[1]})
    merged = []
    for sgm in segs:
        if merged and merged[-1]['key'][0] == sgm['key'][0] and sgm['key'][0] != 'H':
            merged[-1]['end'] = sgm['end']
        else:
            merged.append(sgm)
    segs = merged
    for sgm in segs:
        sgm['level'], sgm['cluster'] = sgm['key'][0], letters[sgm['key'][1] % 8]
        sgm['db'] = float(bdb[sgm['start']:sgm['end']].mean())
    # role assignment
    roles = {}
    roles['INTRO'] = segs[0]
    rest = segs[1:]
    highs = [s for s in rest if s['level'] == 'H']
    if len(highs) >= 3:
        b1 = highs[0]
        after_b1 = [s for s in rest if s['start'] >= b1['end']]
        lows = [s for s in after_b1 if s['level'] != 'H']
        d = min(lows, key=lambda s: s['db']) if lows else None
        roles['B1'] = b1
        if d:
            roles['D'] = d
            mids = [s for s in after_b1 if s['start'] >= d['end'] and s['level'] != 'H']
            h2 = [s for s in highs if s['start'] >= d['end']]
            if mids and h2 and mids[0]['start'] < h2[0]['start']:
                roles['A2'] = {'start': mids[0]['start'], 'end': h2[0]['start'], 'level': 'M', 'cluster': mids[0]['cluster'], 'db': mids[0]['db']}
            if h2:
                roles['B2'] = h2[0]
                later = h2[1:]
                if later:
                    distinct = [s for s in later if s['cluster'] != h2[0]['cluster']]
                    roles['C'] = distinct[0] if distinct else max(later, key=lambda s: s['db'])
                    tail = [s for s in later if s['start'] >= roles['C']['end']]
                    if tail:
                        roles['B3'] = {'start': tail[0]['start'], 'end': tail[-1]['end'], 'level': 'H', 'cluster': tail[0]['cluster'], 'db': tail[0]['db']}
    roles['OUT'] = {'start': out_start, 'end': nb, 'level': 'L', 'cluster': '-', 'db': float(bdb[out_start:].mean())}
    # fallback: anything missing -> proportional split of the timeline with the reference layout
    ref = {'INTRO': 8, 'B1': 16, 'D': 8, 'A2': 8, 'B2': 8, 'C': 8, 'B3': 6, 'OUT': 2}
    if any(r not in roles for r in ROLES):
        tot = sum(ref.values()); acc = 0; roles = {}
        for r in ROLES:
            s = int(round(acc / tot * nb)); acc += ref[r]; e = int(round(acc / tot * nb))
            roles[r] = {'start': s, 'end': e, 'level': '?', 'cluster': '?', 'db': float(bdb[s:e].mean())}
    # make roles contiguous in order
    order = [r for r in ROLES]
    for i in range(len(order) - 1):
        roles[order[i]]['end'] = roles[order[i + 1]]['start']
    roles['OUT']['end'] = nb
    return roles, segs


def accents(A, roles):
    bt = A['beats']; ob = A['onset_beats']; bdb = A['bar_db']
    thr = np.percentile(ob, 96)
    hits = [i for i in range(len(bt)) if ob[i] >= thr]
    bar_heads_strong = [roles[r]['start'] * 4 for r in ROLES if roles[r]['start'] > 0]
    light, fills = [], []
    for r in ('B1', 'B2', 'C', 'B3'):
        s, e = roles[r]['start'], roles[r]['end']
        for b in range(s, e):
            nbh = [bdb[k] for k in (b - 1, b + 1) if s <= k < e]
            if nbh and bdb[b] < np.mean(nbh) - 2.0:
                light.append(b)
        for b in range(s, e):
            if (b - s) % 8 == 7:
                fills.append(b)
    # sudden quiet
    #  drop    = the next second is >= 5.5 dB quieter than the previous second (energy cliff)
    #  gap     = a hole >= 5 dB below the local level (and 15 dB under the peak) for 40-400 ms
    #  silence = near-silent stretch (>= 15 dB under the loudest level) longer than 400 ms
    db, rt = A['db'], A['rt']
    dt = rt[1] - rt[0]
    sm = np.convolve(db, np.ones(5) / 5, mode='same')
    one = int(1.0 / dt)
    quiet = []
    i = one
    while i < len(sm) - one:
        d = sm[i - one:i].mean() - sm[i:i + one].mean()
        if d > 5.5 and 1 < rt[i] < A['dur'] - 2:
            j = i + int(0.15 / dt)
            k = int(np.argmax([sm[x - one // 4:x].mean() - sm[x:x + one // 4].mean() for x in range(i - one // 3, j)])) + i - one // 3
            quiet.append({'t': float(rt[k]), 'kind': 'drop', 'depth': round(float(d), 1)}); i += 2 * one
        else:
            i += 1
    from scipy.ndimage import median_filter
    local = median_filter(sm, size=int(2.0 / dt))
    holes = sm < np.minimum(local - 5, db.max() - 15)
    silent = sm < db.max() - 15
    for mask, kind, lo, hi in ((silent, 'silence', 0.4, 99), (holes, 'gap', 0.04, 0.4)):
        i = 0
        while i < len(mask):
            if mask[i]:
                j = i
                while j < len(mask) and mask[j]:
                    j += 1
                L = (j - i) * dt
                if lo <= L < hi and rt[i] > 1 and rt[min(j, len(rt) - 1)] < A['dur'] - 3:
                    t0, t1 = float(rt[i]), float(rt[min(j, len(rt) - 1)])
                    if not any(q['kind'] == 'silence' and q['t'] - 0.1 <= t0 <= q['end'] + 0.1 for q in quiet):
                        quiet.append({'t': t0, 'end': t1, 'kind': kind})
                i = j
            else:
                i += 1
    quiet.sort(key=lambda q: q['t'])
    return hits, sorted(set(bar_heads_strong)), light, fills, quiet


# ----------------------------------------------------------------------------- output
TS_FUNCS = r'''
/** frame of a global beat index (clamped). */
export const beatFrameAt = (i: number): number => BEAT_FRAMES[Math.max(0, Math.min(BEAT_FRAMES.length - 1, Math.round(i)))];

/** section-relative beat label -> frame, e.g. "B1:2.3" (bar 2 beat 3 of section B1), "B1:2.3+0.5" adds half a beat.
 *  Bars beyond the section length are clamped. For script-level proportional remapping use src/lib/timing.ts. */
export const beatLabelFrame = (label: string): number => {
  const m = /^([A-Z0-9]+):(\d+)\.(\d)([+-][\d.]+)?$/.exec(label.trim());
  if (!m) throw new Error(`bad beat label ${label}`);
  const sec = SECTIONS[m[1] as SectionId];
  if (!sec) throw new Error(`unknown section ${m[1]}`);
  const bar = Math.min(Number(m[2]) - 1, sec.bars - 1);
  const idx = (sec.startBar + bar) * 4 + Number(m[3]) - 1;
  const off = m[4] ? Number(m[4]) : 0;
  const base = beatFrameAt(Math.floor(idx + off));
  const next = beatFrameAt(Math.floor(idx + off) + 1);
  const frac = idx + off - Math.floor(idx + off);
  return Math.round(base + (next - base) * frac);
};

/** snap a frame to the beat grid. grid: 'beat' | 'bar' | 'half'; mode: 'nearest' | 'next' | 'prev'. */
export const snapToBeat = (
  frame: number,
  opts: {grid?: 'beat' | 'bar' | 'half'; mode?: 'nearest' | 'next' | 'prev'} = {},
): number => {
  const grid = opts.grid ?? 'beat';
  const mode = opts.mode ?? 'nearest';
  let pts: number[] = grid === 'bar' ? BAR_FRAMES : BEAT_FRAMES;
  if (grid === 'half') {
    pts = [];
    BEAT_FRAMES.forEach((f, i) => {
      pts.push(f);
      if (i + 1 < BEAT_FRAMES.length) pts.push(Math.round((f + BEAT_FRAMES[i + 1]) / 2));
    });
  }
  let best = pts[0];
  for (const p of pts) {
    if (mode === 'next' && p < frame) continue;
    if (mode === 'prev' && p > frame) break;
    if (mode === 'prev') { best = p; continue; }
    if (mode === 'next') return p;
    if (Math.abs(p - frame) < Math.abs(best - frame)) best = p;
  }
  return best;
};

/** which section a frame lies in. */
export const sectionAt = (frame: number): SectionId => {
  let cur: SectionId = 'INTRO';
  for (const id of SECTION_ORDER) if (SECTIONS[id].start <= frame) cur = id;
  return cur;
};

/** label ("B1:2.3") of the beat nearest to a frame. */
export const labelOfFrame = (frame: number): string => {
  const f = snapToBeat(frame);
  const i = BEAT_FRAMES.indexOf(f);
  const bar = Math.floor(i / 4);
  const id = SECTION_ORDER.filter((s) => SECTIONS[s].startBar <= bar).pop() as SectionId;
  return `${id}:${bar - SECTIONS[id].startBar + 1}.${(i % 4) + 1}`;
};
'''


def write_ts(path, fps, A, roles, hits, strong, light, fills, quiet, bgm_rel, dur, source, edits, seams):
    f = lambda t: int(round(t * fps))
    bt = A['beats']; bars = A['bars']
    beat_frames = [f(t) for t in bt]
    bar_frames = beat_frames[::4]
    secs = {}
    for r in ROLES:
        s, e = roles[r]['start'], roles[r]['end']
        st = bar_frames[s] if s < len(bar_frames) else f(dur)
        if s == 0:
            st = 0
        en = bar_frames[e] if e < len(bar_frames) else int(round(dur * fps))
        secs[r] = dict(start=st, end=en, startBar=s, bars=e - s, name=ROLE_NAMES[r], level=roles[r].get('level', '?'), cluster=roles[r].get('cluster', '?'))
    per_sec = []
    for s in range(int(np.ceil(dur))):
        m = (A['rt'] >= s) & (A['rt'] < s + 1)
        per_sec.append(round(float(A['db'][m].mean()), 1) if m.any() else -60.0)
    q = [{'start': f(x['t']), 'end': f(x.get('end', x['t'] + 0.25)), 'kind': x['kind']} for x in quiet]
    js = lambda o: json.dumps(o, ensure_ascii=False)
    lines = [
        '// AUTO-GENERATED by scripts/analyze_beats.py — do not edit by hand. Re-run `npm run analyze` after replacing the BGM.',
        f'// source: {source}  edits: {js(edits)}',
        'export const FPS = %d;' % fps,
        'export const BPM = %.2f;' % A['tempo'],
        'export const BEAT_INTERVAL_FRAMES = %.3f;' % (A['ibi'] * fps),
        'export const BGM_FILE = %s;' % js(bgm_rel),
        'export const DURATION_SEC = %.3f;' % dur,
        'export const DURATION_FRAMES = %d;' % int(round(dur * fps)),
        'export const SEAMS_SEC: number[] = %s;' % js(seams),
        '/** frame of every detected beat (beat 0 = first downbeat). */',
        'export const BEAT_FRAMES: number[] = %s;' % js(beat_frames),
        '/** seconds of every detected beat. */',
        'export const BEAT_TIMES: number[] = %s;' % js([round(float(t), 4) for t in bt]),
        '/** frame of every bar head (downbeat). */',
        'export const BAR_FRAMES: number[] = %s;' % js(bar_frames),
        "export type SectionId = 'INTRO' | 'B1' | 'D' | 'A2' | 'B2' | 'C' | 'B3' | 'OUT';",
        'export const SECTION_ORDER: SectionId[] = %s;' % js(ROLES),
        'export type Section = {start: number; end: number; startBar: number; bars: number; name: string; level: string; cluster: string};',
        'export const SECTIONS: Record<SectionId, Section> = %s;' % js(secs),
        '/** strongest onsets (frames) — big hits / drops. */',
        'export const HITS: number[] = %s;' % js(sorted(set(beat_frames[i] for i in hits))),
        '/** section-entry downbeats, ordered — the primary slam / transition points. */',
        'export const DOWNBEAT_ACCENTS: number[] = %s;' % js([beat_frames[i] for i in strong if i < len(beat_frames)]),
        '/** bars inside choruses where the drums thin out (breath bars), as bar-head frames. */',
        'export const LIGHT_BARS: number[] = %s;' % js([bar_frames[b] for b in light]),
        '/** last bar of each 8-bar phrase in choruses (drum fills), as bar-head frames. */',
        'export const FILL_BARS: number[] = %s;' % js([bar_frames[b] for b in fills if b < len(bar_frames)]),
        '/** sudden quiet: drop = energy cliff, gap = short hole, silence = near-silent stretch. */',
        "export const QUIET: {start: number; end: number; kind: 'drop' | 'gap' | 'silence'}[] = %s;" % js(q),
        '/** mean loudness per second (dBFS relative to peak RMS). */',
        'export const ENERGY_DB_PER_SEC: number[] = %s;' % js(per_sec),
    ]
    with open(path, 'w') as fh:
        fh.write('\n'.join(lines) + '\n' + TS_FUNCS)
    return secs


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--config', default=os.path.join(ROOT, 'bgm.config.json'))
    ap.add_argument('--source'); ap.add_argument('--target', type=float)
    args = ap.parse_args()
    cfg = json.load(open(args.config))
    source = args.source or cfg['source']
    target = args.target or cfg['targetSeconds']
    tol = cfg.get('toleranceSeconds', 8)
    fps = cfg.get('fps', 30)
    src_abs = os.path.join(ROOT, source)
    y, sr = librosa.load(src_abs, sr=22050, mono=True)
    A0 = analyse(y, sr)
    print(f'source {source}: {A0["dur"]:.2f}s  {A0["tempo"]:.2f} BPM  bar phase {A0["phase"]}')
    mode = cfg.get('edit', {}).get('mode', 'auto')
    if mode == 'manual':
        edits = [dict(e) for e in cfg['edit']['edits']]
    elif mode == 'none':
        edits = []
    else:
        edits = plan_edit(A0, target, tol)
    out_wav = os.path.join(ROOT, 'public/bgm/bgm_edit.wav')
    new_dur, seams = apply_edit(src_abs, A0, edits, out_wav)
    print('edits', json.dumps(edits), '-> %.3fs' % new_dur, 'seams', seams)
    y2, _ = librosa.load(out_wav, sr=22050, mono=True)
    A = analyse(y2, 22050)
    roles, segs = sections(A)
    hits, strong, light, fills, quiet = accents(A, roles)
    secs = write_ts(os.path.join(ROOT, 'src/data/beats.ts'), fps, A, roles, hits, strong, light, fills, quiet,
                    'bgm/bgm_edit.wav', A['dur'], source, edits, seams)
    report = dict(source=source, source_duration=A0['dur'], bpm=A['tempo'], duration=A['dur'], edits=edits, seams=seams,
                  bar_phase_scores=A['phase_scores'], sections=secs,
                  raw_segments=[{k: v for k, v in s.items() if k != 'key'} for s in segs],
                  quiet=quiet, hits=[round(float(A['beats'][i]), 3) for i in hits])
    json.dump(report, open(os.path.join(ROOT, 'public/bgm/analysis.json'), 'w'), ensure_ascii=False, indent=1)
    print('BPM %.2f  duration %.3fs  beats %d  bars %d' % (A['tempo'], A['dur'], len(A['beats']), len(A['bars'])))
    for r in ROLES:
        s = secs[r]
        print(f"  {r:5s} {s['name']:8s} bars {s['startBar']:3d}+{s['bars']:2d}  f{s['start']:5d}-{s['end']:5d}  ({s['start']/fps:7.3f}-{s['end']/fps:7.3f}s) level {s['level']} cl {s['cluster']}")
    print('quiet', [(round(q['t'], 2), q['kind']) for q in quiet])


if __name__ == '__main__':
    main()
