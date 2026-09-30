# Hero loop video

Phones (and desktops without WebGL) play a pre-rendered loop of the hero scene instead of rendering it live.
The files are in `public/media/`:
- `hero-desktop.{av1,h264}.mp4` (1920x1080)
- `hero-mobile.{av1,h264}.mp4` (720x1280)
- `*-poster.webp`

To regenerate after changing `src/experience/gl/hero.ts`:

```bash
npm run dev                                   # dev server on :3000 (the capture page 404s in production)
node scripts/hero-video/receive.mjs /tmp/hero-d 3199 &
node scripts/hero-video/receive.mjs /tmp/hero-m 3198 &
# open these and wait for "done" (12s at 30fps = 360 frames each):
#   http://localhost:3000/dev/hero-capture?w=1920&h=1080&fps=30&seconds=12&port=3199
#   http://localhost:3000/dev/hero-capture?w=1080&h=1920&fps=30&seconds=12&port=3198
python3 scripts/hero-video/loop.py /tmp/hero-d /tmp/loop-d   # seamless 10s loop (cross-fades the caustics)
python3 scripts/hero-video/loop.py /tmp/hero-m /tmp/loop-m
bash scripts/hero-video/encode.sh /tmp/loop-d hero-desktop 1920 1080 public/media
CRF264=31 bash scripts/hero-video/encode.sh /tmp/loop-m hero-mobile 720 1280 public/media
```

Budgets: desktop 4 MB or less, mobile 1.5 MB or less, posters 60 KB or less.
