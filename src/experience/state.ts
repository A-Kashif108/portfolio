/** Shared between the DOM choreography (writes, from ScrollTriggers) and the WebGL scenes (read every frame). */
export type XpState = {
  reduced: boolean;
  mobile: boolean;
  /** 0..1 as the exploded section scrolls into view; the phone's dots assemble. */
  enter: number;
  /** 0..1 through the pinned explode sequence. */
  phone: number;
  /** 0..1 through the pinned contact section; the steel card rises and spins. */
  card: number;
};

export function createState(): XpState {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return {
    reduced,
    mobile: window.innerWidth <= 760,
    enter: reduced ? 1 : 0,
    phone: reduced ? 1 : 0,
    card: reduced ? 1 : 0,
  };
}
