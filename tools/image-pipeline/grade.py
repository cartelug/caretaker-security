"""Grade the seven frames into one set.

Each shot was lit differently on purpose — golden hour, night interior, flat
overcast — so the aim is not one look. Measuring the row showed the real
mismatch is colour temperature, not level: card 03 sat at +17 highlight warmth
against card 01's +49, which is what makes two frames look like two different
shoots. Brightness differences between a night control room and a daylight
corridor are legitimate and are left largely alone.

So: offset the black point (never stretch the histogram — that flattens
contrast the frames already have), nudge the level only where a frame is a
clear outlier, and spend the real effort aligning highlight warmth toward the
brand brass.
"""
import numpy as np
from PIL import Image
import os

I, O = 'incoming', 'graded'
os.makedirs(O, exist_ok=True)

TARGET_BLACK = np.array([10.0, 13.0, 11.0])          # the site's ink, green-black
TARGET_MEDIAN = {'01': 62, '02': 48, '03': 88, '04': 88,
                 '05': 100, '06': 80, '07': 44}
TARGET_WARMTH = {'01': 44, '02': 38, '03': 34, '04': 42,
                 '05': 24, '06': 30, '07': 44}


def luma(a):
    lin = np.where(a / 255 <= 0.03928, (a / 255) / 12.92, (((a / 255) + 0.055) / 1.055) ** 2.4)
    return 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]


def warmth(a):
    L = luma(a)
    hi = a[L >= np.percentile(L, 90)]
    return hi[:, 0].mean() - hi[:, 2].mean()


def grade(path, key):
    a = np.asarray(Image.open(path).convert('RGB'), dtype=float)

    # 1. black point: a per-channel OFFSET, so any shadow cast goes with it and
    #    the frame keeps the contrast it was generated with.
    lo = np.percentile(a.reshape(-1, 3), 1, axis=0)
    a = a + (TARGET_BLACK - lo)

    # 2. level: gamma toward target, clamped tight so no frame is rebuilt
    med = np.median(np.clip(a, 0, 255))
    tgt = TARGET_MEDIAN[key]
    g = float(np.clip(np.log(tgt / 255.0) / np.log(max(med, 1) / 255.0), 0.82, 1.22))
    a = 255.0 * np.power(np.clip(a / 255.0, 0, 1), g)

    # 3. highlight warmth — the actual fix. Weighted by luminance so the tint
    #    lands on highlights and mid-tones, never in the shadows.
    need = TARGET_WARMTH[key] - warmth(a)
    if abs(need) > 1:
        w = np.clip((luma(a) - 0.08) / 0.5, 0, 1)
        a[..., 0] += need * 0.55 * w
        a[..., 2] -= need * 0.45 * w

    return np.clip(a, 0, 255).astype(np.uint8), g


rows = {}
for f in sorted(os.listdir(I)):
    if not f.endswith('.png'):
        continue
    out, g = grade(os.path.join(I, f), f[:2])
    Image.fromarray(out).save(os.path.join(O, f))
    o = out.astype(float)
    rows[f] = dict(black=float(np.percentile(out, 1)), median=float(np.median(out)),
                   warmth=float(warmth(o)), gamma=round(g, 2),
                   contrast=float(np.percentile(out, 95) - np.percentile(out, 5)))

print(f"{'file':<24}{'black':>7}{'median':>8}{'warmth':>8}{'contrast':>10}{'gamma':>7}")
for f, r in rows.items():
    print(f"{f:<24}{r['black']:>7.1f}{r['median']:>8.1f}{r['warmth']:>+8.1f}{r['contrast']:>10.1f}{r['gamma']:>7.2f}")

cards = [r for f, r in rows.items() if f[:2] in ('01', '02', '03', '04')]
print("\nSERVICE CARD ROW after grade:")
for k in ('black', 'median', 'warmth', 'contrast'):
    v = [c[k] for c in cards]
    print(f"  {k:<9} min {min(v):7.1f}  max {max(v):7.1f}  spread {max(v)-min(v):6.1f}")
