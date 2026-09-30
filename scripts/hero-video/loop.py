"""Turn a 12s capture (360 frames at 30fps) into a seamless 10s loop.

The glass shapes repeat every 10s; the caustic light does not, so the first 2s are
cross-faded with seconds 10-12. Output frame i (i < 60) = mix(frame[i+300], frame[i], i/60),
which makes the last output frame flow straight into the first.
Usage: python3 loop.py <framesDir> <outDir>
"""
import os
import sys

from PIL import Image

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
FPS, LOOP, FADE = 30, 300, 60
frame = lambda i: Image.open(os.path.join(src, f"f{i:04d}.jpg")).convert("RGB")
for i in range(LOOP):
    img = Image.blend(frame(i + LOOP), frame(i), i / FADE) if i < FADE else frame(i)
    img.save(os.path.join(out, f"o{i:04d}.png"))
print("wrote", LOOP, "frames to", out)
