import * as THREE from "three";
import { gsap } from "@/lib/gsap";
import { ACCENT } from "../config";
import type { XpState } from "../state";
import { lerp } from "../util";
import { createHero } from "./hero";
import { makeEnv } from "./kit";

/**
 * Live WebGL hero (desktop). Starts immediately because the hero is on screen at load.
 * Phones skip this and play the pre-rendered loop instead.
 */
export function initHeroGL(root: HTMLElement, state: XpState): () => void {
  const heroEl = root.querySelector<HTMLElement>(".fu-hero");
  const canvas = root.querySelector<HTMLCanvasElement>(".fu-hero-cv");
  if (!heroEl || !canvas) throw new Error("hero markup missing");
  const R = state.reduced;
  const DPR = Math.min(1.5, window.devicePixelRatio || 1);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x0b0c10, 1);
  const env = makeEnv(renderer, false, ACCENT);
  const hero = createHero(env.texture, { accent: new THREE.Color(ACCENT), dpr: DPR, density: 1 });

  let T = R ? 2.2 : 0;
  let dead = false;
  let visible = true;
  let drawn = false;
  const pointer = { x: 0, y: 0, sx: 0, sy: 0 };

  const size = () => {
    renderer.setSize(Math.max(1, heroEl.clientWidth), Math.max(1, heroEl.clientHeight), false);
    hero.cam.aspect = heroEl.clientWidth / Math.max(1, heroEl.clientHeight);
    hero.cam.updateProjectionMatrix();
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(heroEl);
  const io = new IntersectionObserver((entries) => entries.forEach((e) => (visible = e.isIntersecting)));
  io.observe(heroEl);

  const onMove = (e: PointerEvent) => {
    if (R) return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  };
  window.addEventListener("pointermove", onMove, { passive: true });

  const tick = (_time: number, deltaMs: number) => {
    if (dead || (!visible && drawn) || (R && drawn)) return;
    if (!R) T += Math.min(0.05, (deltaMs || 16) / 1000);
    pointer.sx = lerp(pointer.sx, pointer.x, 0.06);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.06);
    hero.pose(T, pointer.sx, pointer.sy);
    renderer.render(hero.scene, hero.cam);
    drawn = true;
  };
  gsap.ticker.add(tick);
  root.classList.add("hero-gl");

  return () => {
    dead = true;
    gsap.ticker.remove(tick);
    window.removeEventListener("pointermove", onMove);
    ro.disconnect();
    io.disconnect();
    root.classList.remove("hero-gl");
    hero.bin.dispose();
    env.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  };
}
