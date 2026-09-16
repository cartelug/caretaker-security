"""Composite the real Caretaker chest mark onto the generated officers.

Every frame was generated with a deliberately blank uniform, because image
models turn logos into mush. The genuine artwork goes on here instead.

Two things make the difference between a badge and a sticker:
  - the mark is multiplied into the fabric rather than pasted over it, so the
    shirt's own shading, creases and shadow fall across it;
  - it is blurred to the local focus of the frame it lands in.

Placement is per-officer and hand-set from the frame: the mark sits on the
wearer's LEFT chest (viewer's right on a front-facing subject), level with the
top of the pocket, as it does in the company's own photographs.
"""
import numpy as np
from PIL import Image, ImageFilter
import os

SRC, OUT = 'graded', 'badged'
LOGO = '/home/user/caretaker-security/assets/brand/caretaker-logo-stacked-light.webp'
os.makedirs(OUT, exist_ok=True)

# file -> list of (centre_x, centre_y, width_px, rotation_deg, blur_px, strength)
# coordinates in the graded frame's own pixels
PLACEMENTS = {
    # Scale is set from the company's own photographs: the mark is about the
    # width of a chest pocket, sitting above the wearer's LEFT pocket, clear of
    # the button placket.
    '01-guarding.png':        [(1205, 415,  56, -4, 0.5, 0.95)],
    '02-control-room.png':    [(392,  527,  44,  6, 0.7, 0.78)],
    '03-fire-safety.png':     [(700,  424,  46, -8, 0.5, 0.88)],
    '04-cash-in-transit.png': [(880,  330,  40, -2, 0.6, 0.90),
                               (497,  300,  38, -2, 0.6, 0.90)],
    '05-deploy.png':          [(206,  424,  38, -5, 0.9, 0.82),
                               (612,  448,  36,  3, 0.9, 0.82),
                               (912,  470,  34,  4, 1.0, 0.80)],
    '06-verify.png':          [(352,  432,  40, -6, 0.7, 0.88),
                               (812,  428,  42,  2, 0.7, 0.88)],
    '07-respond.png':         [(760,  352,  40, -3, 0.7, 0.90),
                               (348,  348,  30,  5, 1.0, 0.82)],
}


def place(base, logo_rgba, cx, cy, w, rot, blur, strength):
    """Multiply the mark into the fabric at (cx, cy)."""
    h = int(round(w * logo_rgba.height / logo_rgba.width))
    lg = logo_rgba.resize((w, h), Image.LANCZOS)
    if rot:
        lg = lg.rotate(rot, resample=Image.BICUBIC, expand=True)
    if blur:
        lg = lg.filter(ImageFilter.GaussianBlur(blur))

    la = np.asarray(lg, dtype=float) / 255.0
    lrgb, lalpha = la[..., :3], la[..., 3:4] * strength

    x0, y0 = int(cx - lg.width / 2), int(cy - lg.height / 2)
    x1, y1 = x0 + lg.width, y0 + lg.height
    H, W = base.shape[:2]
    if x0 < 0 or y0 < 0 or x1 > W or y1 > H:
        return base, False

    patch = base[y0:y1, x0:x1] / 255.0
    # Multiply keeps the fabric's shading visible through the thread; a touch of
    # the mark's own colour on top stops the gold going muddy on a dark crease.
    mult = patch * lrgb
    blended = mult * 0.78 + lrgb * 0.22
    base[y0:y1, x0:x1] = ((patch * (1 - lalpha) + blended * lalpha) * 255.0)
    return base, True


logo = Image.open(LOGO).convert('RGBA')
# trim the artwork's transparent margin so `width` means the mark, not the canvas
bbox = logo.getbbox()
logo = logo.crop(bbox)

for f, spots in PLACEMENTS.items():
    im = np.asarray(Image.open(os.path.join(SRC, f)).convert('RGB'), dtype=float)
    ok = 0
    for (cx, cy, w, rot, blur, strength) in spots:
        im, placed = place(im, logo, cx, cy, w, rot, blur, strength)
        ok += placed
    Image.fromarray(np.clip(im, 0, 255).astype(np.uint8)).save(os.path.join(OUT, f))
    print(f'{f:<24} {ok}/{len(spots)} marks placed')
