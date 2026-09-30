#!/bin/bash
# Encode loop frames into the hero video set. Usage: encode.sh <loopDir> <name> <width> <height> <outDir>
set -euo pipefail
IN=$1; NAME=$2; W=$3; H=$4; OUT=$5
mkdir -p "$OUT"
ffmpeg -loglevel error -y -framerate 30 -i "$IN/o%04d.png" -vf "scale=$W:$H:flags=lanczos" \
  -c:v libsvtav1 -preset 5 -crf 42 -pix_fmt yuv420p -g 150 -an -movflags +faststart "$OUT/$NAME.av1.mp4"
ffmpeg -loglevel error -y -framerate 30 -i "$IN/o%04d.png" -vf "scale=$W:$H:flags=lanczos" \
  -c:v libx264 -preset slow -crf ${CRF264:-27} -pix_fmt yuv420p -profile:v high -g 150 -an -movflags +faststart "$OUT/$NAME.h264.mp4"
python3 -c "from PIL import Image; Image.open('$IN/o0000.png').convert('RGB').resize(($W, $H), Image.LANCZOS).save('$OUT/$NAME-poster.webp', quality=78, method=6)"
ls -la "$OUT" | grep "$NAME"
