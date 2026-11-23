#!/usr/bin/env python3
"""Paper textures for the 'glazed paper-cut / kintsugi' look (fixed seed, so frames never flicker).
 - public/textures/grain.png : full-frame paper grain + fibres (grey around 128, used with soft-light)
 - public/textures/fiber.png : 512px tileable fibre texture for paper pieces
"""
import os
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public/textures')
rng = np.random.default_rng(1123)


def fibres(h, w, n, length, sigma):
    img = np.zeros((h, w))
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(0, h)
        a = rng.uniform(0, np.pi)
        L = rng.uniform(length * 0.4, length)
        for s in np.linspace(0, L, int(L)):
            xi, yi = int(x + np.cos(a) * s) % w, int(y + np.sin(a) * s) % h
            img[yi, xi] += 1
        a += rng.normal(0, 0.2)
    return gaussian_filter(img, sigma)


def main():
    os.makedirs(OUT, exist_ok=True)
    h, w = 1080, 1920
    g = rng.standard_normal((h, w)) * 0.55
    g += gaussian_filter(rng.standard_normal((h, w)), 1.2) * 1.4
    g += gaussian_filter(rng.standard_normal((h, w)), 18) * 6.0
    f = fibres(h, w, 2600, 60, 0.7)
    g += (f / (f.max() + 1e-9)) * 3.0
    g = (g - g.mean()) / g.std()
    Image.fromarray(np.clip(128 + g * 22, 0, 255).astype(np.uint8), 'L').save(os.path.join(OUT, 'grain.png'))
    s = 512
    t = gaussian_filter(rng.standard_normal((s, s)), 1.0, mode='wrap') * 1.2 + gaussian_filter(rng.standard_normal((s, s)), 10, mode='wrap') * 5
    ff = fibres(s, s, 500, 40, 0.6); t += ff / (ff.max() + 1e-9) * 3
    t = (t - t.mean()) / t.std()
    Image.fromarray(np.clip(128 + t * 26, 0, 255).astype(np.uint8), 'L').save(os.path.join(OUT, 'fiber.png'))
    print('textures ->', OUT)


if __name__ == '__main__':
    main()
