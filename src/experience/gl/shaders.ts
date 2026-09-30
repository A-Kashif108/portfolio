// GLSL ported verbatim from the approved Fusion prototype.

export const RIB_LEN = 9;
export const RIB_H = 0.62;

export const VS_UV = /* glsl */ `
varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

/** Tileable water caustics (after Dave Hoskins), tinted into the accent. */
export const FS_CAUSTIC = /* glsl */ `
uniform float uT; uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
#define TAU 6.28318530718
void main(){
  vec2 uv = vUv * vec2(1.6667, 1.0) * 0.9;
  float time = uT * 0.45 + 23.0;
  vec2 p = mod(uv * TAU, TAU) - 250.0; vec2 i = p; float c = 1.0; float inten = 0.005;
  for (int n = 0; n < 5; n++) { float t = time * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten))); }
  c /= 5.0; c = 1.17 - pow(c, 1.4); float v = pow(abs(c), 8.0);
  float glow = exp(-dot(vUv - vec2(0.64, 0.56), (vUv - vec2(0.64, 0.56)) * vec2(3.0, 5.0)) * 3.0);
  vec3 col = uA + uB * (0.08 + 0.5 * v) * glow + mix(vec3(1.0), uB, 0.35) * v * v * 0.42 * glow;
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Backdrop for the phone view: ink, a pool of accent light and a faint lab grid (the glass refracts it). */
export const FS_LAB = /* glsl */ `
uniform vec3 uA; uniform vec3 uB; varying vec2 vUv;
void main(){
  vec2 q = (vUv - vec2(0.54, 0.5)) * vec2(1.9, 1.15);
  float g = exp(-dot(q, q) * 11.0);
  vec2 gr = abs(fract(vUv * vec2(44.0, 26.0)) - 0.5);
  float line = 1.0 - smoothstep(0.47, 0.5, max(gr.x, gr.y));
  vec3 col = uA + uB * 0.11 * g + vec3(0.8) * (1.0 - line) * 0.018 * (0.4 + g);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Dot-cloud UI inside each glass slab. An opaque pass (refracted by the glass) and a crisp pass on top share this vertex shader. */
export const DOT_VERT = /* glsl */ `
uniform float uTime; uniform float uAssemble; uniform float uSize; uniform float uPR; uniform float uAspect; uniform float uPointerOn; uniform vec2 uPointer;
attribute vec3 aRand; attribute float aSeed;
varying float vSeed; varying float vHot; varying float vA; varying float vDepth;
void main() {
  vec3 p = position;
  float a = clamp(uAssemble * 1.7 - aSeed * 0.7, 0.0, 1.0);
  a = a * a * (3.0 - 2.0 * a);
  p = mix(p + aRand * vec3(6.0, 5.0, 4.0), p, a);
  p.xy += aRand.xy * 0.008 * sin(uTime * 1.3 + aSeed * 50.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vec4 clip = projectionMatrix * mv;
  vec2 d = clip.xy / clip.w - uPointer; d.x *= uAspect;
  float dist = length(d);
  float f = (1.0 - smoothstep(0.0, 0.16, dist)) * uPointerOn;
  vec2 dir = d / max(dist, 0.0001); dir.x /= uAspect;
  clip.xy += dir * f * f * 0.05 * clip.w;
  gl_Position = clip;
  vSeed = aSeed; vHot = f; vA = a; vDepth = -mv.z;
  gl_PointSize = uSize * uPR * (0.55 + aSeed * 0.9) * (18.0 / vDepth);
}
`;

export const DOT_OPAQUE = /* glsl */ `
uniform vec3 uColor; uniform vec3 uAccent; uniform float uLit; uniform float uAlpha;
varying float vSeed; varying float vHot; varying float vA; varying float vDepth;
void main() {
  vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard;
  if (vA < 0.03) discard;
  vec3 col = uColor * (0.5 + 0.45 * vSeed);
  float acc = uLit * step(0.42, vSeed);
  col = mix(col, uAccent * 1.2, max(acc, vHot * vHot * 0.5));
  gl_FragColor = vec4(col * (0.3 + 0.7 * uAlpha), 1.0);
}
`;

export const DOT_CRISP = /* glsl */ `
uniform vec3 uColor; uniform vec3 uAccent; uniform float uLit; uniform float uAlpha; uniform float uNear; uniform float uFar;
varying float vSeed; varying float vHot; varying float vA; varying float vDepth;
void main() {
  vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard;
  float shade = 1.0 - clamp((vDepth - uNear) / (uFar - uNear), 0.0, 1.0);
  vec3 col = uColor * (0.62 + 0.38 * shade) * (0.72 + 0.4 * vSeed);
  float acc = uLit * step(0.42, vSeed);
  col = mix(col, uAccent, max(acc, vHot * vHot * 0.55));
  float alpha = uAlpha * (0.3 + 0.7 * vA) * (0.45 + 0.55 * shade) * (0.55 + 0.45 * vSeed);
  gl_FragColor = vec4(col, alpha);
}
`;

/** Dots caught inside the hero's glass shapes. */
export const HDOT_VERT = /* glsl */ `
uniform float uTime; uniform float uPR; attribute float aSeed; attribute vec3 aRand; varying float vSeed;
void main(){ vec3 p = position + aRand * 0.045 * sin(uTime * 0.8 + aSeed * 40.0);
  vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv; vSeed = aSeed;
  gl_PointSize = uPR * (2.0 + aSeed * 2.6) * (12.0 / -mv.z); }
`;

export const HDOT_FRAG = /* glsl */ `
uniform vec3 uColor; uniform vec3 uAccent; varying float vSeed;
void main(){ vec2 c = gl_PointCoord - 0.5; if (dot(c, c) > 0.25) discard;
  vec3 col = vSeed > 0.8 ? uAccent * 1.15 : uColor * (0.55 + 0.5 * vSeed); gl_FragColor = vec4(col, 1.0); }
`;

/** Cloth ribbons: left edge pinned, waves run to the free end, scroll velocity boosts amplitude, cursor pushes, clicks ripple. */
export const RIB_VERT = /* glsl */ `
uniform float uTime; uniform float uVel; uniform float uMouseOn; uniform float uPhase; uniform float uRipT;
uniform vec2 uMouse; uniform vec2 uRipC;
varying vec2 vUv; varying vec3 vN;
vec3 disp(vec3 p, vec2 uv) {
  float pin = smoothstep(0.0, 0.16, uv.x);
  float amp = 1.0 + uVel;
  float t = uTime;
  float w = sin(uv.x * 5.5 - t * 2.1 + uPhase) * 0.32 + sin(uv.x * 12.0 - t * 3.4 + uPhase * 1.7) * 0.09 + sin(uv.x * 3.0 + uv.y * 2.5 - t * 1.3 + uPhase * 0.6) * 0.12;
  float flap = sin(uv.x * 9.0 + uv.y * 4.0 - t * 4.2 + uPhase) * 0.05;
  vec3 q = p;
  q.z += pin * (w + flap) * amp;
  q.y += pin * sin(uv.x * 4.0 - t * 1.7 + uPhase) * 0.14 * amp;
  vec4 wp = modelMatrix * vec4(q, 1.0);
  float d = distance(wp.xy, uMouse);
  q.z += pin * exp(-d * d / 0.55) * 0.75 * uMouseOn;
  float age = t - uRipT;
  float rd = distance(wp.xy, uRipC);
  float front = age * 4.2;
  float ring = sin((rd - front) * 5.0) * exp(-abs(rd - front) * 1.4) * exp(-age * 0.9) * step(0.0, age);
  q.z += pin * ring * 0.42;
  return q;
}
void main() {
  vUv = uv;
  vec3 p = disp(position, uv);
  vec3 px = disp(position + vec3(0.090, 0.0, 0.0), uv + vec2(0.01, 0.0));
  vec3 py = disp(position + vec3(0.0, 0.031, 0.0), uv + vec2(0.0, 0.05));
  vN = normalize(normalMatrix * normalize(cross(px - p, py - p)));
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const RIB_FRAG = /* glsl */ `
uniform sampler2D uMap;
varying vec2 vUv; varying vec3 vN;
void main() {
  float tail = (vUv.x - 0.93) / 0.07;
  if (tail > 0.0 && abs(vUv.y - 0.5) < tail * 0.5) discard;
  vec3 N = normalize(vN); if (!gl_FrontFacing) N = -N;
  vec3 L = normalize(vec3(-0.4, 0.6, 0.8));
  float diff = dot(N, L) * 0.5 + 0.5;
  float spec = pow(max(dot(reflect(-L, N), vec3(0.0, 0.0, 1.0)), 0.0), 22.0) * 0.14;
  vec3 col = texture2D(uMap, vUv).rgb;
  float weave = 0.97 + 0.03 * sin(vUv.x * 1400.0) * sin(vUv.y * 90.0);
  col = col * (0.62 + 0.46 * diff) * weave + spec;
  gl_FragColor = vec4(col, 1.0);
}
`;
