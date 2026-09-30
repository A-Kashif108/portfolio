import { lerp, mulberry } from "../util";

// Phone slab dimensions (world units), shared by the geometry and the point clouds.
export const HW = 1.5;
export const HH = 3.1;
export const RAD = 0.44;
export const DEP = 0.07;
export const BEV = 0.028;

export type LayerPoints = { P: Float32Array; R: Float32Array; S: Float32Array };

/** Dot-cloud UI for the five layers (Glass, Interface, Logic, Network, Power); z stays inside each slab. */
export function buildPhone(): LayerPoints[] {
  const rand = mulberry(108);
  const P: number[][] = [[], [], [], [], []];
  const Rr: number[][] = [[], [], [], [], []];
  const S: number[][] = [[], [], [], [], []];

  const inRR = (x: number, y: number, hw: number, hh: number, r: number) => {
    if (Math.abs(x) > hw || Math.abs(y) > hh) return false;
    const ax = Math.abs(x) - (hw - r);
    const ay = Math.abs(y) - (hh - r);
    if (ax <= 0 || ay <= 0) return true;
    return ax * ax + ay * ay <= r * r;
  };
  const push = (x: number, y: number, layer: number) => {
    P[layer].push(x, y, (rand() * 2 - 1) * 0.024);
    Rr[layer].push(rand() * 2 - 1, rand() * 2 - 1, rand() * 2 - 1);
    S[layer].push(rand());
  };
  const fillRR = (n: number, hw: number, hh: number, r: number, layer: number, ox = 0, oy = 0) => {
    let c = 0;
    let g = 0;
    while (c < n && g < n * 30) {
      g++;
      const x = (rand() * 2 - 1) * hw;
      const y = (rand() * 2 - 1) * hh;
      if (!inRR(x, y, hw, hh, r)) continue;
      push(ox + x, oy + y, layer);
      c++;
    }
  };
  const perim = (t: number, hw: number, hh: number, r: number): [number, number] => {
    const sx = 2 * (hw - r);
    const sy = 2 * (hh - r);
    const arc = (Math.PI * r) / 2;
    let d = t * (2 * sx + 2 * sy + 4 * arc);
    const segs: [number, (u: number) => [number, number]][] = [
      [sx, (u) => [-hw + r + u, hh]],
      [arc, (u) => { const a = Math.PI / 2 - u / r; return [hw - r + Math.cos(a) * r, hh - r + Math.sin(a) * r]; }],
      [sy, (u) => [hw, hh - r - u]],
      [arc, (u) => { const a = -u / r; return [hw - r + Math.cos(a) * r, -hh + r + Math.sin(a) * r]; }],
      [sx, (u) => [hw - r - u, -hh]],
      [arc, (u) => { const a = -Math.PI / 2 - u / r; return [-hw + r + Math.cos(a) * r, -hh + r + Math.sin(a) * r]; }],
      [sy, (u) => [-hw, -hh + r + u]],
      [arc, (u) => { const a = Math.PI - u / r; return [-hw + r + Math.cos(a) * r, hh - r + Math.sin(a) * r]; }],
    ];
    for (const [len, fn] of segs) {
      if (d <= len) return fn(d);
      d -= len;
    }
    return [-hw + r, hh];
  };
  const edgeRR = (n: number, hw: number, hh: number, r: number, layer: number, ox = 0, oy = 0, w = 0.02) => {
    for (let i = 0; i < n; i++) {
      const q = perim(rand(), hw, hh, r);
      const j = (rand() + rand() - 1) * w;
      push(ox + q[0] + j, oy + q[1] + (rand() + rand() - 1) * w, layer);
    }
  };
  const rect = (n: number, x0: number, y0: number, x1: number, y1: number, layer: number) => {
    for (let i = 0; i < n; i++) push(lerp(x0, x1, rand()), lerp(y0, y1, rand()), layer);
  };
  const line = (n: number, x0: number, y0: number, x1: number, y1: number, layer: number, w = 0.02) => {
    for (let i = 0; i < n; i++) {
      const t = rand();
      push(lerp(x0, x1, t) + (rand() - 0.5) * w, lerp(y0, y1, t) + (rand() - 0.5) * w, layer);
    }
  };
  const ring = (n: number, cx: number, cy: number, r: number, layer: number, w = 0.02) => {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const rr = r + (rand() - 0.5) * w;
      push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, layer);
    }
  };
  const disc = (n: number, cx: number, cy: number, r: number, layer: number) => {
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const rr = Math.sqrt(rand()) * r;
      push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, layer);
    }
  };

  // 0 Glass: rim, a diagonal glare band and the speaker slot.
  edgeRR(2400, HW - 0.04, HH - 0.04, RAD - 0.02, 0, 0, 0, 0.016);
  {
    let c = 0;
    let g = 0;
    while (c < 900 && g < 40000) {
      g++;
      const x = (rand() * 2 - 1) * HW;
      const y = (rand() * 2 - 1) * HH;
      if (!inRR(x, y, HW - 0.06, HH - 0.06, RAD)) continue;
      if (Math.abs(x * 0.55 + y * 0.32 - 0.55) > 0.22 * rand()) continue;
      push(x, y, 0);
      c++;
    }
  }
  rect(240, -0.28, HH - 0.3, 0.28, HH - 0.22, 0);

  // 1 Interface.
  const SW = HW - 0.14;
  const SH = HH - 0.14;
  fillRR(900, SW, SH, RAD - 0.1, 1);
  rect(120, -1.15, SH - 0.28, -0.75, SH - 0.2, 1);
  rect(120, 0.75, SH - 0.28, 1.15, SH - 0.2, 1);
  rect(700, -1.1, 2.0, 0.35, 2.33, 1);
  edgeRR(420, 1.1, 0.16, 0.16, 1, 0, 1.58, 0.012);
  for (let k = 0; k < 6; k++) {
    const y = 0.98 - k * 0.52;
    rect(200, -1.1, y - 0.17, -0.78, y + 0.17, 1);
    rect(230, -0.6, y + 0.05, 0.92, y + 0.13, 1);
    rect(130, -0.6, y - 0.12, 0.25, y - 0.06, 1);
  }
  [-0.86, -0.29, 0.29, 0.86].forEach((x) => disc(90, x, -2.5, 0.1, 1));
  rect(160, -0.5, -2.86, 0.5, -2.82, 1);

  // 2 Logic: board, chip and traces.
  edgeRR(1200, HW - 0.16, HH - 0.2, RAD - 0.1, 2, 0, 0, 0.015);
  fillRR(600, HW - 0.18, HH - 0.22, RAD - 0.1, 2);
  rect(1700, -0.46, 0.44, 0.46, 1.36, 2);
  edgeRR(420, 0.56, 0.56, 0.06, 2, 0, 0.9, 0.012);
  rect(420, -1.05, -0.62, -0.5, -0.24, 2);
  rect(420, 0.48, -0.55, 0.98, -0.05, 2);
  rect(320, -0.9, 2.0, -0.28, 2.3, 2);
  rect(320, 0.2, -1.6, 0.95, -1.3, 2);
  rect(260, -0.7, -2.3, 0.7, -2.1, 2);
  const traces = [
    [-0.46, 0.7, -0.78, 0.7, -0.78, -0.24],
    [0.46, 0.7, 0.72, 0.7, 0.72, -0.05],
    [-0.2, 1.36, -0.2, 2.0],
    [0.2, 1.36, 0.2, 1.75, 0.9, 1.75, 0.9, 2.5],
    [0.3, 0.44, 0.3, -0.2, 0.55, -1.3],
    [-0.3, 0.44, -0.3, -1.0, -0.2, -2.1],
    [0.0, 0.44, 0.0, -2.1],
    [-1.05, -0.43, -1.2, -0.43, -1.2, 1.5, -0.9, 2.0],
  ];
  traces.forEach((tr) => {
    for (let i = 0; i + 3 < tr.length; i += 2) {
      line(Math.round(90 * Math.hypot(tr[i + 2] - tr[i], tr[i + 3] - tr[i + 1])), tr[i], tr[i + 1], tr[i + 2], tr[i + 3], 2, 0.014);
    }
  });

  // 3 Network: frame antennas and the coil.
  edgeRR(1400, HW - 0.08, HH - 0.12, RAD - 0.06, 3, 0, 0, 0.016);
  rect(420, -1.3, HH - 0.24, 1.3, HH - 0.2, 3);
  rect(420, -1.3, -HH + 0.2, 1.3, -HH + 0.24, 3);
  for (let c = 0; c < 8; c++) {
    const s = 0.34 + c * 0.1;
    edgeRR(Math.round(210 + c * 30), s, s, s * 0.45, 3, 0, -0.3, 0.008);
  }
  disc(160, -0.95, 2.4, 0.08, 3);
  disc(160, 0.95, -2.4, 0.08, 3);

  // 4 Power: battery, back shell and camera.
  fillRR(2600, 1.2, 2.2, 0.2, 4, 0, -0.35);
  edgeRR(700, 1.24, 2.24, 0.22, 4, 0, -0.35, 0.012);
  edgeRR(1400, HW - 0.04, HH - 0.04, RAD - 0.02, 4, 0, 0, 0.02);
  edgeRR(380, 0.42, 0.55, 0.22, 4, -0.88, 2.35, 0.012);
  ring(200, -0.99, 2.55, 0.16, 4, 0.02);
  ring(200, -0.99, 2.15, 0.16, 4, 0.02);
  disc(90, -0.66, 2.55, 0.06, 4);

  return P.map((p, i) => ({ P: new Float32Array(p), R: new Float32Array(Rr[i]), S: new Float32Array(S[i]) }));
}
