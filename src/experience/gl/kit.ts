import * as THREE from "three";

export function roundedShape(hw: number, hh: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-hw + r, -hh);
  s.lineTo(hw - r, -hh);
  s.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
  s.lineTo(hw, hh - r);
  s.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
  s.lineTo(-hw + r, hh);
  s.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
  s.lineTo(-hw, -hh + r);
  s.absarc(-hw + r, -hh + r, r, Math.PI, Math.PI * 1.5, false);
  return s;
}

/** Rounded slab with a small bevel; UVs remapped to 0..1 across the face so canvas textures land correctly. */
export function slab(hw: number, hh: number, r: number, depth: number, bevel: number) {
  const g = new THREE.ExtrudeGeometry(roundedShape(hw - bevel, hh - bevel, Math.max(0.01, r - bevel)), {
    depth,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 12,
  });
  g.center();
  const pos = g.attributes.position;
  const uv = g.attributes.uv;
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + hw) / (2 * hw), (pos.getY(i) + hh) / (2 * hh));
  uv.needsUpdate = true;
  return g;
}

/** Procedural studio: dark room with softbox strips and one accent strip, baked with PMREM (no HDR files). */
export function makeEnv(renderer: THREE.WebGLRenderer, bright: boolean, acc: string | null) {
  const pm = new THREE.PMREMGenerator(renderer);
  const sc = new THREE.Scene();
  const trash: { dispose: () => void }[] = [];
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, fn?: (m: THREE.Mesh) => void) => {
    const m = new THREE.Mesh(geo, mat);
    trash.push(geo, mat);
    fn?.(m);
    sc.add(m);
  };
  const strip = (w: number, h: number, x: number, y: number, z: number, col: string, k: number) =>
    add(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(k), side: THREE.DoubleSide }),
      (m) => {
        m.position.set(x, y, z);
        m.lookAt(0, 0, 0);
      },
    );
  add(
    new THREE.SphereGeometry(24, 32, 16),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(bright ? "#262830" : "#0C0E14"), side: THREE.BackSide }),
  );
  if (bright) {
    strip(24, 5, 0, 12, 0, "#ffffff", 3.0);
    strip(5, 20, 12, 0, 6, "#ffffff", 2.4);
    strip(3, 20, -9, 0, 9, "#ffffff", 2.6);
    strip(20, 4, 0, -10, 2, "#8e929c", 1.2);
    strip(16, 2.6, 0, 4.5, 14, "#ffffff", 3.2);
    strip(16, 1.2, 0, -3.5, 14, "#d6d9e0", 1.6);
  }
  strip(20, 2.4, 0, 10, 4, "#ffffff", 3.4);
  strip(2.2, 16, -11, 1, 5, "#ffffff", 2.6);
  strip(1.6, 14, 10, 0, -3, "#e6e8ee", 2.0);
  strip(12, 1.4, 0, -7, 9, acc ?? "#ffffff", acc ? 3.0 : 1.4);
  strip(3.4, 3.4, 7, 6, 10, "#ffffff", 2.2);
  strip(6, 1, -6, -3, -10, "#b8bcc6", 1.6);
  const rt = pm.fromScene(sc, 0.02);
  trash.forEach((t) => t.dispose());
  pm.dispose();
  return rt;
}

export function glassMat(o: THREE.MeshPhysicalMaterialParameters = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0,
    roughness: 0.08,
    transmission: 1,
    thickness: 0.8,
    ior: 1.45,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.15,
    specularIntensity: 1,
    attenuationColor: new THREE.Color("#D9DCE4"),
    attenuationDistance: 4,
    ...o,
  });
}

/** Tracks geometries, materials and textures so a scene can dispose everything it created. */
export class Bin {
  private items: { dispose: () => void }[] = [];
  add<T extends { dispose: () => void }>(item: T): T {
    this.items.push(item);
    return item;
  }
  dispose() {
    this.items.forEach((i) => i.dispose());
    this.items = [];
  }
}
