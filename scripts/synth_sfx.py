#!/usr/bin/env python3
"""Synthesise every sound effect with code (no samples) -> public/sfx/<id>.wav (48 kHz stereo 16-bit).

Pitched sounds sit in F minor pentatonic (F Ab Bb C Eb) to match the BGM key.
Usage: python3 scripts/synth_sfx.py
"""
import os
import numpy as np
import soundfile as sf
import scipy.signal as sig

SR = 48000
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/sfx')
rng = np.random.default_rng(20261123)

# F minor pentatonic
F4, AB4, BB4, C5, EB5, F5, AB5, BB5, C6, EB6, F6 = 349.23, 415.30, 466.16, 523.25, 622.25, 698.46, 830.61, 932.33, 1046.5, 1244.5, 1396.9


def t(d):
    return np.arange(int(d * SR)) / SR


def env(n, a=0.005, d=0.3, curve=4.0):
    x = np.arange(n) / SR
    att = np.clip(x / max(a, 1e-4), 0, 1)
    dec = np.exp(-np.maximum(x - a, 0) * curve / max(d, 1e-4))
    return att * dec


def noise(d, color='white'):
    n = rng.standard_normal(int(d * SR))
    if color == 'pink':
        b, a = [0.049922035, -0.095993537, 0.050612699, -0.004408786], [1, -2.494956002, 2.017265875, -0.522189400]
        n = sig.lfilter(b, a, n)
    if color == 'brown':
        n = np.cumsum(n); n = n - sig.savgol_filter(n, 4001, 2) if len(n) > 4001 else n
    return n / (np.abs(n).max() + 1e-9)


def bp(x, lo, hi, order=2):
    sos = sig.butter(order, [lo, hi], btype='band', fs=SR, output='sos'); return sig.sosfilt(sos, x)


def lp(x, f, order=2):
    sos = sig.butter(order, f, btype='low', fs=SR, output='sos'); return sig.sosfilt(sos, x)


def hp(x, f, order=2):
    sos = sig.butter(order, f, btype='high', fs=SR, output='sos'); return sig.sosfilt(sos, x)


def sweep_bp(x, f0, f1, q=4.0, blocks=64):
    """band-pass whose centre moves f0->f1 (log), processed in overlapping blocks."""
    out = np.zeros_like(x); n = len(x); L = n // blocks + 1
    win = np.hanning(2 * L)
    for k in range(blocks):
        c = f0 * (f1 / f0) ** (k / max(1, blocks - 1))
        lo, hi = c / (1 + 1 / q), min(c * (1 + 1 / q), SR / 2 - 100)
        a0 = max(0, k * L - L // 2); a1 = min(n, a0 + 2 * L)
        seg = bp(x[a0:a1], lo, hi)
        out[a0:a1] += seg * win[:a1 - a0]
    return out


def tone(f, d, partials=((1, 1.0),), decay=1.0, vib=0.0):
    x = t(d); y = np.zeros_like(x)
    for r, a in partials:
        y += a * np.sin(2 * np.pi * f * r * x + vib * np.sin(2 * np.pi * 5 * x)) * np.exp(-x * decay * (0.6 + 0.4 * r))
    return y


def bell(f, d=2.5, decay=1.6):
    return tone(f, d, partials=((1, 1), (2.0, 0.5), (2.76, 0.35), (5.4, 0.18), (8.93, 0.08)), decay=decay) * env(int(d * SR), 0.002, d, 1.0)


def stereo(y, width=0.25, delay_ms=7):
    dl = int(delay_ms / 1000 * SR)
    r = np.r_[np.zeros(dl), y][:len(y)]
    L = y * (1 - width / 2) + r * width / 2
    R = r * (1 - width / 2) + y * width / 2
    return np.stack([L, R], axis=1)


def save(name, y, peak_db=-3.0, width=0.25):
    if y.ndim == 1:
        y = stereo(y, width)
    fade = min(len(y) // 4, int(0.01 * SR))
    y[-fade:] *= np.linspace(1, 0, fade)[:, None]
    pk = np.abs(y).max() + 1e-9
    y = y / pk * 10 ** (peak_db / 20)
    sf.write(os.path.join(OUT, f'{name}.wav'), y.astype(np.float32), SR, subtype='PCM_16')


def impact(d=1.6):
    x = t(d)
    f = 62 * np.exp(-x * 2.2) + 32
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(len(x), 0.002, d, 3.2)
    sub = np.sin(2 * np.pi * 41 * x) * env(len(x), 0.004, d, 2.0) * 0.5
    crack = lp(noise(d), 2400) * env(len(x), 0.001, 0.12, 6) * 0.6
    tail = lp(noise(d, 'pink'), 600) * env(len(x), 0.02, d, 2.5) * 0.25
    return body + sub + crack + tail


def main():
    os.makedirs(OUT, exist_ok=True)
    # --- ambience
    d = 12.0; x = t(d)
    w = lp(noise(d, 'pink'), 900) * (0.55 + 0.45 * np.sin(2 * np.pi * x / 6.0) ** 2)
    w += hp(noise(d), 3000) * 0.05 * (0.5 + 0.5 * np.sin(2 * np.pi * x / 3.0 + 1) ** 2)
    xf = int(1.0 * SR); w[:xf] = w[:xf] * np.linspace(0, 1, xf) + w[-xf:] * np.linspace(1, 0, xf); w = w[:-xf]
    save('waves_bed', w, -6, width=0.6)
    save('storm_bed', lp(noise(6, 'pink'), 1400) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * t(6) / 2.2))), -6, width=0.7)
    # --- bells / tonal
    save('ship_bell', bell(F5, 2.2, 1.4) * 0.8 + bell(C6, 2.2, 1.8) * 0.3)
    save('doorbell', np.r_[bell(AB5, 0.45, 5), bell(F5, 1.2, 3)])
    save('glass_ting', bell(F6, 1.6, 2.2))
    save('chime_end', bell(C6, 3.5, 0.9) * 0.7 + bell(F5, 3.5, 0.7) * 0.5)
    for i, f in enumerate([F5, AB5, BB5, C6, EB6]):
        x = t(0.32); ff = f * (0.8 + 0.2 * np.minimum(1, x / 0.05)) * (1 + 0.04 * np.sin(2 * np.pi * 18 * x))
        save(f'boing_{i + 1}', np.sin(2 * np.pi * np.cumsum(ff) / SR) * env(len(x), 0.004, 0.32, 5))
    x = t(0.25); sq = np.sign(np.sin(2 * np.pi * F4 * x)) * 0.3 + np.sin(2 * np.pi * F4 * x)
    save('awkward', lp(sq, 2000) * env(len(x), 0.01, 0.25, 3), -8)
    x = t(0.9); save('xylo_up', sum(np.sin(2 * np.pi * f * x) * env(len(x), 0.002, 0.25, 6) * (x >= k * 0.09) for k, f in enumerate([F5, AB5, BB5, C6, EB6])))
    # --- mechanical
    click = hp(noise(0.05), 1500) * env(int(0.05 * SR), 0.0005, 0.03, 8)
    x = t(1.1); hum = (np.sin(2 * np.pi * 60 * x) + 0.4 * np.sin(2 * np.pi * 120 * x)) * np.clip(1 - x / 0.35, 0, 1) ** 2 * 0.5
    lev = np.zeros(len(x)); lev[:len(click)] += click * 1.4; lev += bp(noise(1.1), 1800, 3200) * env(len(x), 0.0005, 0.05, 6) * 0.5
    save('lever_off', lev + hum)
    save('clock_tick', bp(noise(0.06), 1800, 4200) * env(int(0.06 * SR), 0.0005, 0.02, 6), -6)
    x = t(0.6); save('wood_click', (bp(noise(0.6), 600, 1100) + 0.6 * np.sin(2 * np.pi * 420 * x)) * env(len(x), 0.0005, 0.08, 7))
    x = t(1.4); save('metal_clang', bell(BB4, 1.4, 2.6) + bp(noise(1.4), 2000, 5000) * env(len(x), 0.001, 0.05, 6) * 0.6)
    # --- whooshes
    save('whoosh_up', sweep_bp(noise(0.55), 300, 4000, 3) * np.hanning(int(0.55 * SR)) ** 0.7, -4)
    save('whoosh_down', sweep_bp(noise(0.45), 5000, 200, 3) * np.hanning(int(0.45 * SR)) ** 0.6, -3)
    save('kite_whoosh', sweep_bp(noise(0.8), 800, 2600, 5) * np.hanning(int(0.8 * SR)), -5)
    x = t(0.7); layer = sweep_bp(noise(0.7), 400, 2500, 2.5) * np.hanning(len(x))
    save('paper_layers', layer + hp(noise(0.7), 4000) * np.hanning(len(x)) * 0.15, -3)
    save('wind_gust', sweep_bp(noise(1.6, 'pink'), 250, 1200, 2) * np.hanning(int(1.6 * SR)), -4, width=0.6)
    save('oar', bp(noise(0.5), 500, 2600) * np.hanning(int(0.5 * SR)) ** 1.5 * (1 + 0.5 * np.sin(2 * np.pi * 9 * t(0.5))), -6)
    # --- impacts
    save('impact', impact(), -1.5)
    x = t(0.18); save('paper_slap', (hp(noise(0.18), 900) * env(len(x), 0.0005, 0.05, 5) + 0.5 * np.sin(2 * np.pi * 140 * x) * env(len(x), 0.001, 0.08, 6)), -4)
    x = t(0.5); save('bowl_thud', (np.sin(2 * np.pi * 150 * x) * env(len(x), 0.001, 0.2, 5) + bp(noise(0.5), 1500, 3500) * env(len(x), 0.0005, 0.03, 6) * 0.4 + bell(EB6, 0.5, 6) * 0.15))
    x = t(0.8); save('shutter_slam', (np.sin(2 * np.pi * 90 * x) * env(len(x), 0.001, 0.25, 4) + bp(noise(0.8), 300, 1500) * env(len(x), 0.001, 0.25, 4) * 0.8))
    x = t(0.45); save('book_thud', (np.sin(2 * np.pi * 110 * x) * env(len(x), 0.001, 0.12, 5) + bp(noise(0.45), 500, 2000) * env(len(x), 0.001, 0.06, 6) * 0.5), -5)
    # --- small things
    x = t(0.09); save('bubble_pop', np.sin(2 * np.pi * np.cumsum(300 + 9000 * x) / SR) * env(len(x), 0.001, 0.09, 3), -6)
    x = t(0.4); save('match', hp(noise(0.4), 2500) * env(len(x), 0.001, 0.18, 3) + hp(noise(0.4), 5000) * (rng.random(len(x)) > 0.995) * 1.5, -6)
    x = t(0.9); creak = np.sin(2 * np.pi * np.cumsum(180 + 60 * np.sin(2 * np.pi * 3 * x) + 40 * rng.standard_normal(len(x)).cumsum() / 400) / SR)
    save('door_creak', bp(creak * (0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 23 * x))), 300, 2500) * np.hanning(len(x)), -6)
    x = t(1.2); scrape = bp(noise(1.2), 300, 1800) * (0.6 + 0.4 * np.abs(np.sin(2 * np.pi * 11 * x))) * np.hanning(len(x))
    save('scrape', scrape, -6)
    x = t(0.12); save('soft_tap', np.sin(2 * np.pi * 220 * x) * env(len(x), 0.001, 0.06, 6), -8)
    print('wrote', len(os.listdir(OUT)), 'sfx to', OUT)


if __name__ == '__main__':
    main()
