import * as THREE from "three";
import type { RibbonStyle } from "../config";
import type { Fonts } from "../fonts";
import { mulberry, rr2d } from "../util";

/** Riso print on fabric: base ink, a halftone band in the second ink, repeated label with optional accent misregistration. */
export function ribbonCanvas(label: string, rb: RibbonStyle, acc: string, fonts: Fonts) {
  const col = (v: string) => (v === "acc" ? acc : v);
  const W = 2048;
  const H = 144;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d");
  if (!g) return cv;
  g.fillStyle = col(rb.bg);
  g.fillRect(0, 0, W, H);
  g.fillStyle = col(rb.ht);
  g.globalAlpha = 0.32;
  for (let y = 4, row = 0; y < H; y += 8, row++) {
    for (let x = (row % 2) * 4; x < W; x += 8) {
      const v = 0.5 + 0.5 * Math.sin((x / W) * 9.5 + 1.2) * Math.cos((y / H) * 2.2);
      const r = 3.4 * v * v;
      if (r < 0.35) continue;
      g.beginPath();
      g.arc(x, y, r, 0, Math.PI * 2);
      g.fill();
    }
  }
  g.globalAlpha = 1;
  g.textBaseline = "middle";
  if ("fontStretch" in g) g.fontStretch = "extra-condensed";
  g.font = `900 104px ${fonts.cond}`;
  const text = label.toUpperCase();
  const tw = g.measureText(text).width;
  let xx = 150;
  while (xx < W - tw * 0.4) {
    if (rb.mis) {
      g.fillStyle = acc;
      g.globalAlpha = 0.95;
      g.fillText(text, xx + 5, 82);
      g.globalAlpha = 1;
    }
    g.fillStyle = col(rb.fg);
    g.fillText(text, xx, 78);
    xx += tw + 120;
  }
  g.font = `500 20px ${fonts.mono}`;
  g.fillStyle = col(rb.fg);
  g.globalAlpha = 0.7;
  g.fillText("STACK", 34, 74);
  g.globalAlpha = 1;
  return cv;
}

export function ribbonTexture(label: string, rb: RibbonStyle, acc: string, fonts: Fonts) {
  const tex = new THREE.CanvasTexture(ribbonCanvas(label, rb, acc, fonts));
  tex.anisotropy = 4;
  return tex;
}

export type CardText = { name: string; role: string; email: string; monogram: string };

/** Brushed steel with engraving: colour map, bump map and roughness map drawn from the same layout. */
export function cardCanvases(fonts: Fonts, text: CardText) {
  const W = 1024;
  const H = Math.round((1024 * 1.07) / 1.7);
  const mk = () => {
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    return c;
  };
  const rand = mulberry(7);
  const brushed = (x: CanvasRenderingContext2D, base: string, amp: number) => {
    x.fillStyle = base;
    x.fillRect(0, 0, W, H);
    for (let i = 0; i < 1600; i++) {
      const y = rand() * H;
      x.fillStyle = `rgba(${rand() < 0.5 ? "255,255,255" : "0,0,0"},${(rand() * amp).toFixed(3)})`;
      x.fillRect(0, y, W, rand() * 1.4 + 0.3);
    }
  };
  const engrave = (x: CanvasRenderingContext2D, col: string) => {
    x.fillStyle = col;
    x.strokeStyle = col;
    x.textBaseline = "alphabetic";
    x.textAlign = "left";
    x.letterSpacing = "2px";
    x.font = `600 64px ${fonts.sans}`;
    x.fillText(text.name.toUpperCase(), 66, 132);
    x.letterSpacing = "0px";
    x.font = `500 32px ${fonts.mono}`;
    x.fillText(text.role, 68, 184);
    // Chip.
    x.lineWidth = 4;
    rr2d(x, 68, 270, 124, 94, 16);
    x.stroke();
    x.lineWidth = 3;
    x.beginPath();
    x.moveTo(68, 317);
    x.lineTo(192, 317);
    x.moveTo(130, 270);
    x.lineTo(130, 364);
    x.moveTo(98, 270);
    x.lineTo(98, 300);
    x.moveTo(162, 334);
    x.lineTo(162, 364);
    x.stroke();
    // Email, shrunk to fit if needed.
    let size = 34;
    x.font = `500 ${size}px ${fonts.mono}`;
    while (size > 22 && x.measureText(text.email).width > W - 140) {
      size -= 1;
      x.font = `500 ${size}px ${fonts.mono}`;
    }
    x.fillText(text.email, 68, H - 72);
    // Monogram seal.
    x.lineWidth = 3;
    x.beginPath();
    x.arc(W - 124, 118, 52, 0, Math.PI * 2);
    x.stroke();
    x.textAlign = "center";
    x.font = `600 44px ${fonts.sans}`;
    x.fillText(text.monogram, W - 124, 134);
    x.textAlign = "left";
  };
  const m = mk();
  const b = mk();
  const r = mk();
  const mx = m.getContext("2d");
  const bx = b.getContext("2d");
  const rx = r.getContext("2d");
  if (mx && bx && rx) {
    brushed(mx, "#EEF0F3", 0.03);
    engrave(mx, "#50545C");
    brushed(bx, "#808080", 0.12);
    engrave(bx, "#000000");
    brushed(rx, "rgb(40,40,40)", 0.022);
    engrave(rx, "rgb(170,170,170)");
  }
  return { map: m, bump: b, rough: r };
}
