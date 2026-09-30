import type { RisoKind } from "@/content/site";

// Palette shared by CSS, WebGL and canvas artwork. Keep in sync with src/styles/experience.css.
export const C = {
  ink: "#0B0C10",
  ink2: "#12141A",
  paper: "#F1F2F5",
  text: "#ECEDF1",
  muted: "#8C8F99",
  mutedL: "#5A5D66",
} as const;

export const ACCENT = "#FF5B14";

/** Goo drops for the liquid-lens transitions: x, y (viewport fractions), final radius (x diagonal), start. */
export const DROPS: readonly [number, number, number, number][] = [
  [0.5, 0.58, 0.74, 0.3],
  [0.28, 0.34, 0.3, 0.0],
  [0.75, 0.3, 0.27, 0.07],
  [0.64, 0.82, 0.22, 0.13],
  [0.17, 0.76, 0.2, 0.18],
];

/** Frosted pane over each poster's riso artwork: x, y, w, h as fractions. */
export const FROST: Record<RisoKind, [number, number, number, number]> = {
  orbit: [0.58, 0.1, 0.34, 0.8],
  grid: [0.07, 0.6, 0.86, 0.3],
  wave: [0.36, 0.1, 0.28, 0.8],
  net: [0.06, 0.58, 0.88, 0.34],
  code: [0.52, 0.16, 0.4, 0.68],
};

/** Riso ribbon print styles, applied in order to site.stack. "acc" resolves to the accent. */
export type RibbonStyle = { bg: string; fg: string; ht: string; mis: boolean };
export const RIBBON_STYLES: RibbonStyle[] = [
  { bg: "acc", fg: C.ink, ht: C.ink, mis: false },
  { bg: "#16171C", fg: "#ECEDF1", ht: "acc", mis: true },
  { bg: "#F5F6F8", fg: C.ink, ht: "acc", mis: true },
  { bg: "#2A2C33", fg: "#ECEDF1", ht: "#ECEDF1", mis: false },
  { bg: "#D3D6DD", fg: C.ink, ht: C.ink, mis: true },
  { bg: "#0E0F13", fg: "acc", ht: "#ECEDF1", mis: false },
];
