import * as THREE from "three";
import { C } from "../config";
import { mulberry } from "../util";
import { Bin, glassMat, slab } from "./kit";
import { FS_CAUSTIC, HDOT_FRAG, HDOT_VERT, VS_UV } from "./shaders";

/** The hero loop repeats every LOOP seconds (shapes are periodic; the caustics are cross-faded in the video). */
export const LOOP = 10;

type Sampler = (r: () => number) => [number, number, number];

/**
 * Frosted glass shapes with drifting dots caught inside, through caustic light.
 * Shared by the live site hero and the dev-only video capture page.
 */
export function createHero(envTexture: THREE.Texture, opts: { accent: THREE.Color; dpr: number; density: number }) {
  const bin = new Bin();
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  cam.position.set(0, 0, 12);
  scene.environment = envTexture;
  const cm = bin.add(
    new THREE.ShaderMaterial({
      uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(C.ink) }, uB: { value: opts.accent } },
      vertexShader: VS_UV,
      fragmentShader: FS_CAUSTIC,
    }),
  );
  const bg = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(40, 24)), cm);
  bg.position.z = -6;
  scene.add(bg);
  const hu = { uTime: { value: 0 }, uPR: { value: opts.dpr }, uColor: { value: new THREE.Color("#E6E8EE") }, uAccent: { value: opts.accent } };
  const hdm = bin.add(new THREE.ShaderMaterial({ uniforms: hu, vertexShader: HDOT_VERT, fragmentShader: HDOT_FRAG }));

  type Item = { m: THREE.Mesh; base: THREE.Vector3; amp: THREE.Vector3; spin: THREE.Vector3; ph: number };
  const items: Item[] = [];
  const add = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    base: THREE.Vector3,
    amp: THREE.Vector3,
    spin: THREE.Vector3,
    ph: number,
    n: number,
    sampler: Sampler,
    seed: number,
  ) => {
    const m = new THREE.Mesh(bin.add(geo), bin.add(mat));
    m.position.copy(base);
    scene.add(m);
    items.push({ m, base: base.clone(), amp, spin, ph });
    const rnd = mulberry(seed);
    const pos: number[] = [];
    const rs: number[] = [];
    const ss: number[] = [];
    for (let i = 0; i < n; i++) {
      const p = sampler(rnd);
      pos.push(p[0], p[1], p[2]);
      rs.push(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
      ss.push(rnd());
    }
    const g = bin.add(new THREE.BufferGeometry());
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("aRand", new THREE.BufferAttribute(new Float32Array(rs), 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(ss), 1));
    const pts = new THREE.Points(g, hdm);
    pts.frustumCulled = false;
    m.add(pts);
  };
  const TAU = Math.PI * 2;
  const box = (hx: number, hy: number, hz: number): Sampler => (r) => [(r() * 2 - 1) * hx, (r() * 2 - 1) * hy, (r() * 2 - 1) * hz];
  const ball = (rad: number): Sampler => (r) => {
    const u = r() * 2 - 1;
    const a = r() * TAU;
    const k = Math.cbrt(r()) * rad;
    const q = Math.sqrt(1 - u * u);
    return [Math.cos(a) * q * k, Math.sin(a) * q * k, u * k];
  };
  const torus = (Rm: number, t: number): Sampler => (r) => {
    const a = r() * TAU;
    const b = r() * TAU;
    const k = Math.sqrt(r()) * t;
    return [(Rm + Math.cos(b) * k) * Math.cos(a), (Rm + Math.cos(b) * k) * Math.sin(a), Math.sin(b) * k];
  };
  const capsule = (rad: number, half: number): Sampler => (r) => {
    const a = r() * TAU;
    const k = Math.sqrt(r()) * rad;
    return [Math.cos(a) * k, (r() * 2 - 1) * half, Math.sin(a) * k];
  };
  const disk = (rad: number, hh: number): Sampler => (r) => {
    const a = r() * TAU;
    const k = Math.sqrt(r()) * rad;
    return [Math.cos(a) * k, (r() * 2 - 1) * hh, Math.sin(a) * k];
  };
  const V = THREE.Vector3;
  const few = opts.density;
  add(slab(1.05, 2.15, 0.34, 0.2, 0.06), glassMat({ roughness: 0.14, thickness: 1.2 }), new V(2.4, 0.2, 0.5), new V(0.12, 0.22, 0), new V(0.18, 1, 0.05), 0, Math.round(520 * few), box(0.86, 1.92, 0.06), 3);
  add(new THREE.TorusGeometry(0.95, 0.32, 48, 96), glassMat({ roughness: 0.03, thickness: 1.4 }), new V(-0.6, 1.9, -1.2), new V(0.25, 0.18, 0), new V(1, 1, 0), 1.3, Math.round(360 * few), torus(0.95, 0.2), 5);
  add(new THREE.CapsuleGeometry(0.42, 1.5, 12, 32), glassMat({ roughness: 0.22, thickness: 1.1 }), new V(4.7, -1.6, -0.6), new V(0.15, 0.3, 0), new V(0, 1, 1), 2.2, Math.round(220 * few), capsule(0.28, 0.72), 7);
  add(new THREE.SphereGeometry(0.85, 64, 32), glassMat({ roughness: 0.05, thickness: 1.6 }), new V(0.5, -1.6, 1.2), new V(0.2, 0.2, 0), new V(0, 1, 0), 3.4, Math.round(420 * few), ball(0.62), 11);
  add(slab(0.7, 0.7, 0.22, 0.24, 0.07), glassMat({ roughness: 0.3, thickness: 1.0 }), new V(-3.4, 2.4, -2), new V(0.18, 0.25, 0), new V(1, 1, 0), 4.1, Math.round(160 * few), box(0.54, 0.54, 0.07), 13);
  add(new THREE.CylinderGeometry(0.7, 0.7, 0.14, 64), glassMat({ roughness: 0.1, thickness: 0.6 }), new V(5.4, 2.4, -1.5), new V(0.2, 0.15, 0), new V(1, 0, 1), 5.3, Math.round(200 * few), disk(0.55, 0.035), 17);

  return {
    scene,
    cam,
    bin,
    /** Poses the scene at time t (seconds) with a camera parallax offset (px, py in -1..1). */
    pose(t: number, px = 0, py = 0) {
      const ph = ((t % LOOP) / LOOP) * Math.PI * 2;
      // Whole turns wrap cleanly at the loop point; fractional spins become a sway so the loop has no jump.
      const rot = (s: number) => (Number.isInteger(s) ? s * ph : s * Math.PI * Math.sin(ph));
      cm.uniforms.uT.value = t;
      hu.uTime.value = t;
      for (const it of items) {
        it.m.position.set(it.base.x + it.amp.x * Math.sin(ph + it.ph), it.base.y + it.amp.y * Math.sin(ph + it.ph * 1.7), it.base.z);
        it.m.rotation.set(rot(it.spin.x) + it.ph, rot(it.spin.y) + it.ph * 0.5, rot(it.spin.z));
      }
      cam.position.x = px * 0.5;
      cam.position.y = -py * 0.35;
      cam.lookAt(0.8, 0.2, 0);
    },
  };
}
