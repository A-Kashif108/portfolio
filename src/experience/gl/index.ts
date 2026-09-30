import * as THREE from "three";
import { site } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ACCENT, C, RIBBON_STYLES } from "../config";
import { fontsReady, readFonts } from "../fonts";
import type { XpState } from "../state";
import { clamp, eio, eout, lerp, mulberry, sub } from "../util";
import { Bin, glassMat, makeEnv, slab } from "./kit";
import { BEV, buildPhone, DEP, HH, HW, RAD } from "./phoneData";
import {
  DOT_CRISP,
  DOT_OPAQUE,
  DOT_VERT,
  FS_CAUSTIC,
  FS_LAB,
  HDOT_FRAG,
  HDOT_VERT,
  RIB_FRAG,
  RIB_H,
  RIB_LEN,
  RIB_VERT,
  VS_UV,
} from "./shaders";
import { cardCanvases, ribbonCanvas, ribbonTexture } from "./textures";

type Pointer = { x: number; y: number; sx: number; sy: number; cx: number; cy: number; inside: boolean };
type View = {
  el: HTMLElement;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  update: (t: number, rect: DOMRect) => void;
};

const monogram = site.name
  .split(" ")
  .map((w) => w[0])
  .join("")
  .toUpperCase();

/**
 * Mounts every WebGL piece of the page. Returns a cleanup that disposes all GPU resources.
 * Throws if WebGL is unavailable; the page then stays fully readable without it.
 */
export function initGL(root: HTMLElement, state: XpState): () => void {
  const $ = <T extends Element = HTMLElement>(s: string) => root.querySelector<T & Element>(s);
  const $$ = <T extends Element = HTMLElement>(s: string) => Array.from(root.querySelectorAll<T & Element>(s));
  const R = state.reduced;
  const fonts = readFonts();
  const off: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: EventTarget,
    ev: K | string,
    fn: (e: PointerEvent) => void,
    opt?: AddEventListenerOptions,
  ) => {
    el.addEventListener(ev, fn as EventListener, opt);
    off.push(() => el.removeEventListener(ev, fn as EventListener, opt));
  };
  let dead = false;
  const isMobile = () => window.innerWidth <= 760;
  const DPR = Math.min(isMobile() ? 1.25 : 1.5, window.devicePixelRatio || 1);
  const accColor = new THREE.Color(ACCENT);

  const heroEl = $<HTMLElement>(".fu-hero");
  const heroCanvas = $<HTMLCanvasElement>(".fu-hero-cv");
  const viewsCanvas = $<HTMLCanvasElement>(".fu-views");
  const ribEl = $<HTMLElement>(".fu-ribbons");
  const contactEl = $<HTMLElement>(".fu-contact");
  if (!heroEl || !heroCanvas || !viewsCanvas || !ribEl || !contactEl) throw new Error("experience markup missing");

  const hr = new THREE.WebGLRenderer({ canvas: heroCanvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  const vr = new THREE.WebGLRenderer({ canvas: viewsCanvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  hr.setPixelRatio(DPR);
  hr.setClearColor(0x0b0c10, 1);
  vr.setPixelRatio(DPR);
  vr.setClearColor(0x000000, 0);
  vr.autoClear = false;

  const envH = makeEnv(hr, false, ACCENT);
  const envV = makeEnv(vr, false, ACCENT);
  const envS = makeEnv(vr, true, null);

  let T = R ? 2.2 : 0;
  const pointer: Pointer = { x: 0, y: 0, sx: 0, sy: 0, cx: -9999, cy: -9999, inside: false };
  const views: View[] = [];

  /* ----- Hero loop: frosted shapes with drifting dots caught inside, through caustic light (a 10s loop) ----- */
  const hero = (() => {
    const bin = new Bin();
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
    cam.position.set(0, 0, 12);
    scene.environment = envH.texture;
    const cm = bin.add(
      new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uA: { value: new THREE.Color(C.ink) }, uB: { value: accColor } },
        vertexShader: VS_UV,
        fragmentShader: FS_CAUSTIC,
      }),
    );
    const bg = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(40, 24)), cm);
    bg.position.z = -6;
    scene.add(bg);
    const hu = { uTime: { value: 0 }, uPR: { value: DPR }, uColor: { value: new THREE.Color("#E6E8EE") }, uAccent: { value: accColor } };
    const hdm = bin.add(new THREE.ShaderMaterial({ uniforms: hu, vertexShader: HDOT_VERT, fragmentShader: HDOT_FRAG }));
    type Item = { m: THREE.Mesh; base: THREE.Vector3; amp: THREE.Vector3; spin: THREE.Vector3; ph: number };
    const items: Item[] = [];
    type Sampler = (r: () => number) => [number, number, number];
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
    const few = isMobile() ? 0.6 : 1;
    add(slab(1.05, 2.15, 0.34, 0.2, 0.06), glassMat({ roughness: 0.14, thickness: 1.2 }), new V(2.4, 0.2, 0.5), new V(0.12, 0.22, 0), new V(0.18, 1, 0.05), 0, Math.round(520 * few), box(0.86, 1.92, 0.06), 3);
    add(new THREE.TorusGeometry(0.95, 0.32, 48, 96), glassMat({ roughness: 0.03, thickness: 1.4 }), new V(-0.6, 1.9, -1.2), new V(0.25, 0.18, 0), new V(1, 1, 0), 1.3, Math.round(360 * few), torus(0.95, 0.2), 5);
    add(new THREE.CapsuleGeometry(0.42, 1.5, 12, 32), glassMat({ roughness: 0.22, thickness: 1.1 }), new V(4.7, -1.6, -0.6), new V(0.15, 0.3, 0), new V(0, 1, 1), 2.2, Math.round(220 * few), capsule(0.28, 0.72), 7);
    add(new THREE.SphereGeometry(0.85, 64, 32), glassMat({ roughness: 0.05, thickness: 1.6 }), new V(0.5, -1.6, 1.2), new V(0.2, 0.2, 0), new V(0, 1, 0), 3.4, Math.round(420 * few), ball(0.62), 11);
    add(slab(0.7, 0.7, 0.22, 0.24, 0.07), glassMat({ roughness: 0.3, thickness: 1.0 }), new V(-3.4, 2.4, -2), new V(0.18, 0.25, 0), new V(1, 1, 0), 4.1, Math.round(160 * few), box(0.54, 0.54, 0.07), 13);
    add(new THREE.CylinderGeometry(0.7, 0.7, 0.14, 64), glassMat({ roughness: 0.1, thickness: 0.6 }), new V(5.4, 2.4, -1.5), new V(0.2, 0.15, 0), new V(1, 0, 1), 5.3, Math.round(200 * few), disk(0.55, 0.035), 17);
    let drawn = false;
    return {
      cam,
      bin,
      get drawn() {
        return drawn;
      },
      render(t: number) {
        const ph = ((t % 10) / 10) * Math.PI * 2;
        cm.uniforms.uT.value = t;
        hu.uTime.value = t;
        for (const it of items) {
          it.m.position.set(it.base.x + it.amp.x * Math.sin(ph + it.ph), it.base.y + it.amp.y * Math.sin(ph + it.ph * 1.7), it.base.z);
          it.m.rotation.set(it.spin.x * ph + it.ph, it.spin.y * ph + it.ph * 0.5, it.spin.z * ph);
        }
        cam.position.x = pointer.sx * 0.5;
        cam.position.y = -pointer.sy * 0.35;
        cam.lookAt(0.8, 0.2, 0);
        hr.render(scene, cam);
        drawn = true;
      },
    };
  })();

  /* ----- Exploded glass phone: frosted slabs with the dot-cloud UI suspended inside each one ----- */
  const phone = (() => {
    const bin = new Bin();
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 17);
    scene.environment = envV.texture;
    const lm = bin.add(
      new THREE.ShaderMaterial({ uniforms: { uA: { value: new THREE.Color(C.ink) }, uB: { value: accColor } }, vertexShader: VS_UV, fragmentShader: FS_LAB }),
    );
    const bg = new THREE.Mesh(bin.add(new THREE.PlaneGeometry(70, 42)), lm);
    bg.position.z = -9;
    scene.add(bg);
    const rootG = new THREE.Group();
    scene.add(rootG);
    const geo = bin.add(slab(HW, HH, RAD, DEP, BEV));
    const rough = [0.05, 0.18, 0.28, 0.32, 0.38];
    const PD = buildPhone();
    const U = {
      uTime: { value: 0 },
      uAssemble: { value: state.enter },
      uPR: { value: DPR },
      uAspect: { value: 1 },
      uPointerOn: { value: 0 },
      uPointer: { value: new THREE.Vector2(9, 9) },
      uColor: { value: new THREE.Color("#E9EBF1") },
      uAccent: { value: accColor },
      uNear: { value: 14 },
      uFar: { value: 20 },
    };
    const mobile = isMobile();
    const layers = PD.map((d, i) => {
      const g = new THREE.Group();
      rootG.add(g);
      const mat = bin.add(
        glassMat({ roughness: rough[i], thickness: i === 0 ? 0.35 : 0.5, color: i === 0 ? 0xffffff : 0xf0f2f6, attenuationDistance: i === 0 ? 6 : 2.6 }),
      );
      g.add(new THREE.Mesh(geo, mat));
      const stride = mobile ? 2 : 1;
      const n = Math.floor(d.S.length / stride);
      const P = new Float32Array(n * 3);
      const Rr = new Float32Array(n * 3);
      const S = new Float32Array(n);
      for (let k = 0; k < n; k++) {
        const j = k * stride;
        P.set(d.P.subarray(j * 3, j * 3 + 3), k * 3);
        Rr.set(d.R.subarray(j * 3, j * 3 + 3), k * 3);
        S[k] = d.S[j];
      }
      const pg = bin.add(new THREE.BufferGeometry());
      pg.setAttribute("position", new THREE.BufferAttribute(P, 3));
      pg.setAttribute("aRand", new THREE.BufferAttribute(Rr, 3));
      pg.setAttribute("aSeed", new THREE.BufferAttribute(S, 1));
      const lit = { value: 0 };
      const alpha = { value: i < 2 ? 1 : 0 };
      const mo = bin.add(
        new THREE.ShaderMaterial({ uniforms: { ...U, uSize: { value: (mobile ? 1.5 : 1) * 3.6 }, uLit: lit, uAlpha: alpha }, vertexShader: DOT_VERT, fragmentShader: DOT_OPAQUE }),
      );
      const mc = bin.add(
        new THREE.ShaderMaterial({
          uniforms: { ...U, uSize: { value: (mobile ? 1.4 : 1) * 2.1 }, uLit: lit, uAlpha: alpha },
          vertexShader: DOT_VERT,
          fragmentShader: DOT_CRISP,
          transparent: true,
          depthTest: false,
          depthWrite: false,
        }),
      );
      const po = new THREE.Points(pg, mo);
      const pc = new THREE.Points(pg, mc);
      po.frustumCulled = false;
      pc.frustumCulled = false;
      g.add(po, pc);
      return { g, lit, alpha };
    });
    const cur = { px: 0, py: 0, on: 0, enter: state.enter, act: -2 };
    const tmp = new THREE.Vector3();
    const calls = $$<HTMLElement>(".fu-call");
    const paths = $$<SVGPathElement>(".fu-lines path");
    const dots = $$<SVGCircleElement>(".fu-lines circle");
    const nEl = $<HTMLElement>(".fu-n");
    const lnEl = $<HTMLElement>(".fu-lname");
    const halfW = (aspect: number) => Math.tan((cam.fov * Math.PI) / 360) * cam.position.z * aspect;
    const update = (t: number, rect: DOMRect) => {
      const aspect = rect.width / rect.height;
      const mob = rect.width < 760;
      cam.position.z = aspect < 1 ? 19 / Math.max(aspect * 1.18, 0.56) : 19;
      const e = eio(sub(state.phone, 0.04, 0.66));
      const sp = lerp(0.09, mob ? 1.05 : 1.3, e);
      layers.forEach((L, i) => (L.g.position.z = (2 - i) * sp));
      rootG.rotation.set(lerp(0, -1.0, e) + pointer.sy * 0.06, lerp(0, 0.3, e) + pointer.sx * 0.1, lerp(0, 0.6, e));
      const hw = halfW(aspect);
      rootG.position.x = mob ? 0 : lerp(0.54, 0.44, e) * 2 * hw - hw;
      rootG.position.y = lerp(0, mob ? -0.4 : 0.55, e) + (R ? 0 : Math.sin(t * 0.8) * 0.05);
      rootG.scale.setScalar(mob ? 0.8 : 1);
      // Dots: assembly on entry, pointer repel, depth shading.
      cur.enter += (state.enter - cur.enter) * (R ? 1 : 0.1);
      U.uTime.value = t;
      U.uAssemble.value = R ? 1 : cur.enter;
      U.uAspect.value = aspect;
      U.uNear.value = cam.position.z - 3.2;
      U.uFar.value = cam.position.z + 3.6;
      const inside = pointer.inside && pointer.cx >= rect.left && pointer.cx <= rect.right && pointer.cy >= rect.top && pointer.cy <= rect.bottom;
      const tx = inside ? ((pointer.cx - rect.left) / rect.width) * 2 - 1 : cur.px;
      const ty = inside ? -(((pointer.cy - rect.top) / rect.height) * 2 - 1) : cur.py;
      cur.px += (tx - cur.px) * 0.08;
      cur.py += (ty - cur.py) * 0.08;
      cur.on += ((inside && !R ? 1 : 0) - cur.on) * 0.06;
      U.uPointer.value.set(cur.px, cur.py);
      U.uPointerOn.value = cur.on;
      // Callouts.
      let shown = 0;
      for (let i = 0; i < 5; i++) if (R || state.phone > 0.3 + i * 0.1) shown = i + 1;
      const act = shown - 1;
      layers.forEach((L, i) => {
        const reveal = i < 2 ? 1 : sub(e, 0.04, 0.4);
        const a = reveal * (act < 0 ? 0.85 : i === act ? 1 : 0.5);
        L.alpha.value = R ? a : lerp(L.alpha.value, a, 0.12);
        L.lit.value = R ? (i === act ? 1 : 0) : lerp(L.lit.value, i === act ? 1 : 0, 0.1);
      });
      scene.updateMatrixWorld(true);
      cam.updateMatrixWorld(true);
      const W = rect.width;
      const H = rect.height;
      const lx = mob ? 0 : W * 0.7;
      const anchors: [number, number][] = [];
      for (let i = 0; i < 5; i++) {
        tmp.set(HW * 0.96, HH * 0.1, 0).applyMatrix4(layers[i].g.matrixWorld).project(cam);
        anchors.push([(tmp.x * 0.5 + 0.5) * W, (-tmp.y * 0.5 + 0.5) * H]);
      }
      // Label y: follow anchors, keep a minimum gap, sorted top to bottom.
      const order = [0, 1, 2, 3, 4].sort((a, b) => anchors[a][1] - anchors[b][1]);
      const ys: number[] = [];
      let prev = -1e9;
      for (const k of order) {
        const y = Math.max(anchors[k][1], prev + 76);
        ys[k] = y;
        prev = y;
      }
      const over = prev - (H - 90);
      if (over > 0) for (const k of order) ys[k] -= over;
      for (let i = 0; i < 5; i++) {
        const c = calls[i];
        if (!c) continue;
        const vis = i < shown;
        c.classList.toggle("vis", mob ? i === act : vis);
        c.classList.toggle("on", i === act);
        if (mob) {
          c.style.transform = `translate(${W - c.offsetWidth - 18}px,${H - c.offsetHeight - 104}px)`;
          continue;
        }
        c.style.transform = `translate(${lx.toFixed(1)}px,${(ys[i] - 26).toFixed(1)}px)`;
        const a = anchors[i];
        paths[i]?.setAttribute("d", `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${(lx - 40).toFixed(1)} ${ys[i].toFixed(1)} L${(lx - 8).toFixed(1)} ${ys[i].toFixed(1)}`);
        dots[i]?.setAttribute("cx", a[0].toFixed(1));
        dots[i]?.setAttribute("cy", a[1].toFixed(1));
        paths[i]?.classList.toggle("vis", vis);
        dots[i]?.classList.toggle("vis", vis);
        paths[i]?.classList.toggle("on", i === act);
        dots[i]?.classList.toggle("on", i === act);
      }
      if (act !== cur.act) {
        cur.act = act;
        const k = Math.max(0, act);
        if (nEl) nEl.textContent = String(k + 1);
        if (lnEl) lnEl.textContent = site.layers[k]?.name ?? "";
      }
    };
    return { scene, cam, bin, update };
  })();
  const phoneEl = $<HTMLElement>('[data-view="phone"]');
  if (phoneEl) views.push({ el: phoneEl, scene: phone.scene, camera: phone.cam, update: phone.update });

  /* ----- Riso cloth ribbons ----- */
  const ribbons = (() => {
    const bin = new Bin();
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 12);
    const geo = bin.add(new THREE.PlaneGeometry(RIB_LEN, RIB_H, isMobile() ? 110 : 180, 10));
    geo.translate(RIB_LEN / 2, 0, 0);
    const S = {
      uTime: { value: 0 },
      uVel: { value: 0 },
      uMouseOn: { value: 0 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uRipT: { value: -99 },
      uRipC: { value: new THREE.Vector2(99, 99) },
    };
    const group = new THREE.Group();
    const texs = site.stack.map((label, i) => {
      const rb = RIBBON_STYLES[i % RIBBON_STYLES.length];
      const tex = bin.add(ribbonTexture(label, rb, ACCENT, fonts));
      const m = bin.add(
        new THREE.ShaderMaterial({
          vertexShader: RIB_VERT,
          fragmentShader: RIB_FRAG,
          side: THREE.DoubleSide,
          uniforms: { ...S, uPhase: { value: i * 1.37 }, uMap: { value: tex } },
        }),
      );
      const mesh = new THREE.Mesh(geo, m);
      mesh.position.set(-4.7, 1.62 - i * 0.66, -i * 0.05);
      mesh.rotation.z = -0.07 + i * 0.026;
      group.add(mesh);
      return tex;
    });
    scene.add(group);
    const ray = new THREE.Vector3();
    const dir = new THREE.Vector3();
    const cur = { on: 0, vel: 0 };
    let inside = false;
    const world = (nx: number, ny: number, out: THREE.Vector2) => {
      ray.set(nx, ny, 0.5).unproject(cam);
      dir.copy(ray).sub(cam.position).normalize();
      const d = -cam.position.z / dir.z;
      out.set(cam.position.x + dir.x * d, cam.position.y + dir.y * d);
    };
    return {
      scene,
      cam,
      bin,
      redrawTextures() {
        texs.forEach((t, i) => {
          t.image = ribbonCanvas(site.stack[i], RIBBON_STYLES[i % RIBBON_STYLES.length], ACCENT, readFonts());
          t.needsUpdate = true;
        });
      },
      move(nx: number, ny: number) {
        world(nx, ny, S.uMouse.value);
        inside = true;
      },
      leave() {
        inside = false;
      },
      ripple(nx: number, ny: number) {
        world(nx, ny, S.uRipC.value);
        S.uRipT.value = S.uTime.value;
      },
      update(t: number, rect: DOMRect) {
        const mob = rect.width < 760;
        const halfH = Math.tan(THREE.MathUtils.degToRad(15)) * 12;
        const halfW = halfH * (rect.width / rect.height);
        // Desktop: the whole ribbon fits. Mobile: ribbons run off the right edge like flags from a pole.
        const fit = mob
          ? Math.min(1.1, (halfH * 2 * 0.5) / 4.6)
          : Math.min(1.45, (halfW * 2 * 0.95) / (RIB_LEN + 0.6), (halfH * 2 * 0.64) / 4.6);
        group.scale.setScalar(fit);
        // Sit the ribbons in the upper part of the section so the heading below keeps clear space.
        group.position.set(-halfW + (mob ? 0.12 : 0.35) + 4.7 * fit, halfH * (mob ? 0.1 : 0.16), 0);
        const v = Math.abs(getLenis()?.velocity ?? 0);
        cur.vel += (clamp(v / 30, 0, 1.6) - cur.vel) * 0.06;
        S.uVel.value = R ? 0 : cur.vel;
        cur.on += ((inside && !R ? 1 : 0) - cur.on) * 0.08;
        S.uMouseOn.value = cur.on;
        S.uTime.value = R ? 2.2 : t;
      },
    };
  })();
  const ribView = $<HTMLElement>('[data-view="ribbons"]');
  if (ribView) views.push({ el: ribView, scene: ribbons.scene, camera: ribbons.cam, update: ribbons.update });

  /* ----- Steel business card ----- */
  const card = (() => {
    const bin = new Bin();
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
    cam.position.set(0, 0, 9);
    scene.environment = envS.texture;
    const geo = bin.add(slab(1.7, 1.07, 0.14, 0.035, 0.012));
    const text = { name: site.name, role: "Software engineer", email: site.email, monogram };
    const cv = cardCanvases(fonts, text);
    const tx = {
      map: bin.add(new THREE.CanvasTexture(cv.map)),
      bump: bin.add(new THREE.CanvasTexture(cv.bump)),
      rough: bin.add(new THREE.CanvasTexture(cv.rough)),
    };
    const mat = bin.add(
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: tx.map,
        metalness: 1,
        roughness: 1,
        roughnessMap: tx.rough,
        bumpMap: tx.bump,
        bumpScale: 0.005,
        clearcoat: 0.4,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.4,
      }),
    );
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    const tilt = { tx: 0, ty: 0, x: 0, y: 0 };
    return {
      scene,
      cam,
      bin,
      tilt,
      redrawTextures() {
        const n = cardCanvases(readFonts(), text);
        tx.map.image = n.map;
        tx.bump.image = n.bump;
        tx.rough.image = n.rough;
        tx.map.needsUpdate = tx.bump.needsUpdate = tx.rough.needsUpdate = true;
      },
      update(t: number, rect: DOMRect) {
        const aspect = rect.width / rect.height;
        cam.position.z = aspect < 1.1 ? 9 / Math.max(aspect * 0.95, 0.62) : 9;
        const rise = eout(sub(state.card, 0, 0.5));
        const spin = eout(sub(state.card, 0, 0.78));
        tilt.x = lerp(tilt.x, tilt.tx, 0.08);
        tilt.y = lerp(tilt.y, tilt.ty, 0.08);
        mesh.position.y = lerp(-4.6, 0, rise) + (R ? 0 : Math.sin(t * 0.9) * 0.05);
        mesh.rotation.set(
          0.1 + tilt.y * 0.45 + (R ? 0 : Math.sin(t * 0.6) * 0.04),
          lerp(-1.5 * Math.PI, 0, spin) + tilt.x * 0.6 + (R ? 0 : Math.sin(t * 0.45) * 0.16 * spin),
          -0.06 + (R ? 0 : Math.sin(t * 0.5) * 0.02),
        );
      },
    };
  })();
  const cardView = $<HTMLElement>('[data-view="card"]');
  if (cardView) views.push({ el: cardView, scene: card.scene, camera: card.cam, update: card.update });

  /* ---------- Render loop ---------- */
  let heroVisible = true;
  let vw = 0;
  let vh = 0;
  const sizeRenderers = () => {
    hr.setSize(Math.max(1, heroEl.clientWidth), Math.max(1, heroEl.clientHeight), false);
    hero.cam.aspect = heroEl.clientWidth / Math.max(1, heroEl.clientHeight);
    hero.cam.updateProjectionMatrix();
    vw = window.innerWidth;
    vh = window.innerHeight;
    vr.setSize(vw, vh, false);
  };
  sizeRenderers();
  const io = new IntersectionObserver((en) => en.forEach((e) => (heroVisible = e.isIntersecting)));
  io.observe(heroEl);

  let cleared = false;
  const renderViews = () => {
    if (window.innerWidth !== vw || window.innerHeight !== vh) sizeRenderers();
    const rects = views.map((v) => {
      const r = v.el.getBoundingClientRect();
      return r.bottom <= 0 || r.top >= vh || r.width < 2 || r.height < 2 ? null : r;
    });
    if (!rects.some(Boolean)) {
      if (!cleared) {
        vr.setScissorTest(false);
        vr.clear();
        cleared = true;
      }
      return;
    }
    cleared = false;
    vr.setScissorTest(false);
    vr.clear();
    vr.setScissorTest(true);
    views.forEach((v, i) => {
      const rr = rects[i];
      if (!rr) return;
      const x = Math.round(rr.left);
      const y = Math.round(vh - rr.bottom);
      const w = Math.round(rr.width);
      const h = Math.round(rr.height);
      vr.setViewport(x, y, w, h);
      vr.setScissor(x, y, w, h);
      v.camera.aspect = w / h;
      v.camera.updateProjectionMatrix();
      v.update(T, rr);
      vr.render(v.scene, v.camera);
    });
  };
  const tick = (_time: number, deltaMs: number) => {
    if (dead) return;
    const dt = Math.min(0.05, (deltaMs || 16) / 1000);
    if (!R) T += dt;
    pointer.sx = lerp(pointer.sx, pointer.x, 0.06);
    pointer.sy = lerp(pointer.sy, pointer.y, 0.06);
    if (heroVisible || (R && !hero.drawn)) hero.render(T);
    renderViews();
  };
  gsap.ticker.add(tick);
  root.classList.add("gl-on");

  /* ---------- Interaction ---------- */
  on(window, "pointermove", (e) => {
    pointer.cx = e.clientX;
    pointer.cy = e.clientY;
    pointer.inside = true;
    if (!R) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    }
  }, { passive: true });
  on(document.documentElement, "pointerleave", () => (pointer.inside = false));
  if (!R) {
    const norm = (e: PointerEvent): [number, number] => {
      const r = ribEl.getBoundingClientRect();
      return [((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1)];
    };
    on(ribEl, "pointermove", (e) => ribbons.move(...norm(e)), { passive: true });
    on(ribEl, "pointerleave", () => ribbons.leave());
    on(ribEl, "pointerdown", (e) => ribbons.ripple(...norm(e)));
  }
  on(contactEl, "pointermove", (e) => {
    const r = contactEl.getBoundingClientRect();
    card.tilt.tx = ((e.clientX - r.left) / r.width - 0.35) * 1.4;
    card.tilt.ty = ((e.clientY - r.top) / r.height - 0.5) * 1.2;
  }, { passive: true });
  on(contactEl, "pointerleave", () => {
    card.tilt.tx = 0;
    card.tilt.ty = 0;
  });

  // Redraw text textures once the real faces are in.
  fontsReady(fonts).then(() => {
    if (dead) return;
    ribbons.redrawTextures();
    card.redrawTextures();
  });

  return () => {
    dead = true;
    gsap.ticker.remove(tick);
    off.forEach((f) => f());
    io.disconnect();
    root.classList.remove("gl-on");
    [hero.bin, phone.bin, ribbons.bin, card.bin].forEach((b) => b.dispose());
    [envH, envV, envS].forEach((rt) => rt.dispose());
    [hr, vr].forEach((r) => {
      r.dispose();
      r.forceContextLoss();
    });
  };
}
