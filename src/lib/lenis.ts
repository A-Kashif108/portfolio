import type Lenis from "lenis";

// The single Lenis instance, owned by <SmoothScroll>. Null under reduced motion or before mount.
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null) {
  instance = lenis;
}

export function getLenis(): Lenis | null {
  return instance;
}
