import type { RisoKind } from "@/content/site";
import { FROST } from "./config";
import { clamp, mulberry, rr2d } from "./util";

type Field = (u: number, v: number) => number;

/** Riso poster artwork: two inks as halftone with slight misregistration, then a frosted glass pane over part of it. */
export function drawRiso(cv: HTMLCanvasElement, kind: RisoKind, idx: number, acc: string) {
  const parent = cv.parentElement;
  if (!parent) return;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const box = parent.getBoundingClientRect();
  const w = Math.max(1, box.width);
  const h = Math.max(1, box.height);
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  const g = cv.getContext("2d");
  if (!g) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.globalCompositeOperation = "source-over";
  g.fillStyle = idx % 2 ? "#EAECF0" : "#F5F6F8";
  g.fillRect(0, 0, w, h);

  const m = Math.min(w, h);
  const s = Math.max(6, Math.round(m / 64));
  const rnd = mulberry(40 + idx * 13);
  const U = (x: number) => (x - w / 2) / m;
  const V = (y: number) => (y - h / 2) / m;

  function half(color: string, fn: Field, ox: number, oy: number) {
    if (!g) return;
    g.globalCompositeOperation = "multiply";
    g.fillStyle = color;
    g.beginPath();
    for (let row = 0, y = s / 2; y < h + s; y += s, row++) {
      for (let x = ((row % 2) * s) / 2; x < w + s; x += s) {
        const v = fn(U(x), V(y));
        if (v <= 0.03) continue;
        const r = s * 0.56 * Math.sqrt(Math.min(1, v));
        g.moveTo(x + ox + r, y + oy);
        g.arc(x + ox, y + oy, r, 0, Math.PI * 2);
      }
    }
    g.fill();
  }

  let ink: Field;
  let ac: Field;
  if (kind === "orbit") {
    ink = (u, v) => {
      const d = Math.hypot(u + 0.06, v - 0.03);
      const R = 0.26;
      if (d > R) return 0.05 * (Math.sin(u * 90) * Math.sin(v * 80) > 0.97 ? 8 : 0);
      const z = Math.sqrt(R * R - d * d) / R;
      const nx = (u + 0.06) / R;
      const ny = (v - 0.03) / R;
      return clamp(0.25 + 0.75 * (0.5 - 0.45 * nx - 0.5 * ny + 0.3 * z), 0, 1);
    };
    ac = (u, v) => {
      const x = u + 0.06;
      const y = (v - 0.03) / 0.34;
      const d = Math.abs(Math.hypot(x, y) - 0.42);
      const behind = Math.hypot(u + 0.06, v - 0.03) < 0.26 && y < 0;
      return behind ? 0 : clamp(1 - d / 0.05, 0, 1);
    };
  } else if (kind === "grid") {
    ink = (u, v) => {
      const gx = Math.floor((u + 0.8) * 9);
      const gy = Math.floor((v + 0.8) * 9);
      let hsh = Math.sin(gx * 12.9898 + gy * 78.233) * 43758.5453;
      hsh -= Math.floor(hsh);
      return v > 0.12 - Math.sin(gx * 0.9) * 0.12 && hsh > 0.35 ? 0.85 : 0.04;
    };
    ac = (u, v) => {
      const gx = Math.floor((u + 0.8) * 9);
      const gy = Math.floor((v + 0.8) * 9);
      return gx >= 6 && gx <= 7 && gy >= 5 && gy <= 6 ? 1 : 0;
    };
  } else if (kind === "wave") {
    ink = (u, v) => {
      const c = Math.sin(u * 7.5) * 0.18;
      return clamp(1 - Math.abs(v - c) / 0.14, 0, 1) * (0.5 + 0.5 * Math.cos(u * 3));
    };
    ac = (u, v) => {
      const c = Math.sin(u * 7.5 + 1.6) * 0.2 + 0.05;
      return clamp(1 - Math.abs(v - c) / 0.07, 0, 1);
    };
  } else if (kind === "net") {
    const nodes: [number, number][] = [];
    for (let i = 0; i < 16; i++) nodes.push([(rnd() - 0.5) * 0.9, (rnd() - 0.5) * 0.9]);
    ink = (u, v) => {
      let best = 0;
      for (const n of nodes) best = Math.max(best, clamp(1 - Math.hypot(u - n[0], v - n[1]) / 0.07, 0, 1));
      return best + 0.05;
    };
    ac = (u, v) => {
      const seg = (p: [number, number], q: [number, number]) => {
        const dx = q[0] - p[0];
        const dy = q[1] - p[1];
        const t = clamp(((u - p[0]) * dx + (v - p[1]) * dy) / (dx * dx + dy * dy), 0, 1);
        return Math.hypot(u - p[0] - dx * t, v - p[1] - dy * t);
      };
      return clamp(1 - Math.min(seg(nodes[2], nodes[7]), seg(nodes[7], nodes[11])) / 0.02, 0, 1);
    };
  } else {
    const rows: [number, number][] = [];
    for (let q = 0; q < 16; q++) rows.push([0.05 + rnd() * 0.3, 0.2 + rnd() * 0.45]);
    ink = (u, v) => {
      const r = Math.floor((v + 0.42) / 0.052);
      if (r < 0 || r >= 16 || (v + 0.42) / 0.052 - r > 0.55) return 0;
      const x0 = -0.4 + rows[r][0] * 0.4;
      const x1 = x0 + rows[r][1];
      return u > x0 && u < x1 && r !== 6 ? 0.9 : 0;
    };
    ac = (u, v) => {
      const r = Math.floor((v + 0.42) / 0.052);
      return r === 6 && (v + 0.42) / 0.052 - r < 0.6 && u > -0.42 && u < 0.36 ? 1 : 0;
    };
  }
  half(acc, ac, s * 0.28, -s * 0.2);
  half("#141418", ink, 0, 0);
  g.globalCompositeOperation = "source-over";

  // Frosted glass pane over part of the print.
  const fr = FROST[kind];
  const px = w * fr[0];
  const py = h * fr[1];
  const pw = w * fr[2];
  const ph = h * fr[3];
  const rad = Math.min(pw, ph) * 0.12;
  const tmp = document.createElement("canvas");
  tmp.width = cv.width;
  tmp.height = cv.height;
  tmp.getContext("2d")?.drawImage(cv, 0, 0);
  g.save();
  rr2d(g, px, py, pw, ph, rad);
  g.clip();
  g.filter = `blur(${Math.round(m * 0.022)}px)`;
  g.drawImage(tmp, -8, -8, w + 16, h + 16);
  g.filter = "none";
  g.fillStyle = "rgba(255,255,255,0.3)";
  g.fillRect(px, py, pw, ph);
  const gr = g.createLinearGradient(px, py, px + pw, py + ph);
  gr.addColorStop(0, "rgba(255,255,255,0.45)");
  gr.addColorStop(0.4, "rgba(255,255,255,0)");
  gr.addColorStop(1, "rgba(255,255,255,0.16)");
  g.fillStyle = gr;
  g.fillRect(px, py, pw, ph);
  g.restore();
  g.save();
  rr2d(g, px + 0.5, py + 0.5, pw - 1, ph - 1, rad);
  g.strokeStyle = "rgba(255,255,255,0.85)";
  g.lineWidth = 1.2;
  g.stroke();
  rr2d(g, px + 1.5, py + 1.5, pw - 3, ph - 3, rad);
  g.strokeStyle = "rgba(11,12,16,0.06)";
  g.lineWidth = 1;
  g.stroke();
  g.restore();
}
