import * as THREE from "three";
import { site } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/lenis";
import { ACCENT, C, RIBBON_STYLES } from "../config";
import { fontsReady, readFonts } from "../fonts";
import type { XpState } from "../state";
import { clamp, eio, eout, lerp, sub } from "../util";
import { Bin, glassMat, makeEnv, slab } from "./kit";
import { BEV, buildPhone, DEP, HH, HW, RAD } from "./phoneData";
import {
  DOT_CRISP,
  DOT_OPAQUE,
  DOT_VERT,
  FS_LAB,
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

export { initHeroGL } from "./heroGL";

/** Lets the browser paint and handle input between heavy setup steps. */
const breathe = () => new Promise<void>((resolve) => requestAnimationFrame(() => setTimeout(resolve, 0)));

/**
 * Mounts the below-the-fold WebGL scenes (exploded phone, cloth ribbons, steel card) on one shared canvas.
 * Setup is spread over several frames so it never blocks the page for long. Resolves to a cleanup, or null
 * when `cancelled()` turns true mid-setup. Throws if WebGL is unavailable; the page stays readable without it.
 */
export async function initViewsGL(root: HTMLElement, state: XpState, cancelled: () => boolean): Promise<(() => void) | null> {
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

  const viewsCanvas = $<HTMLCanvasElement>(".fu-views");
  const ribEl = $<HTMLElement>(".fu-ribbons");
  const contactEl = $<HTMLElement>(".fu-contact");
  if (!viewsCanvas || !ribEl || !contactEl) throw new Error("experience markup missing");

  const vr = new THREE.WebGLRenderer({ canvas: viewsCanvas, antialias: true, alpha: true, powerPreference: "high-performance" });
  vr.setPixelRatio(DPR);
  vr.setClearColor(0x000000, 0);
  vr.autoClear = false;

  const envV = makeEnv(vr, false, ACCENT);
  const envS = makeEnv(vr, true, null);

  let T = R ? 2.2 : 0;
  const pointer: Pointer = { x: 0, y: 0, sx: 0, sy: 0, cx: -9999, cy: -9999, inside: false };
  const views: View[] = [];

  const bins: Bin[] = [];
  const abort = () => {
    bins.forEach((b) => b.dispose());
    [envV, envS].forEach((rt) => rt.dispose());
    vr.dispose();
    vr.forceContextLoss();
    return null;
  };
  await breathe();
  if (cancelled()) return abort();

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
  bins.push(phone.bin);
  await vr.compileAsync(phone.scene, phone.cam);
  await breathe();
  if (cancelled()) return abort();
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
  bins.push(ribbons.bin);
  await vr.compileAsync(ribbons.scene, ribbons.cam);
  await breathe();
  if (cancelled()) return abort();
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
  bins.push(card.bin);
  await vr.compileAsync(card.scene, card.cam);
  await breathe();
  if (cancelled()) return abort();
  const cardView = $<HTMLElement>('[data-view="card"]');
  if (cardView) views.push({ el: cardView, scene: card.scene, camera: card.cam, update: card.update });

  /* ---------- Render loop ---------- */
  let vw = 0;
  let vh = 0;
  const sizeRenderers = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    vr.setSize(vw, vh, false);
  };
  sizeRenderers();

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
    root.classList.remove("gl-on");
    abort();
  };
}
