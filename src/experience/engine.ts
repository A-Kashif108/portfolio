import { initChoreo } from "./choreo";
import { startHeroVideo } from "./heroVideo";
import { createState } from "./state";

type Cleanup = () => void;

/** Runs `fn` once `el` comes within `margin` of the viewport, then waits for an idle moment. */
function whenNear(el: Element | null, margin: string, fn: () => void): Cleanup {
  if (!el) return () => {};
  const hasIdle = typeof window.requestIdleCallback === "function";
  let pending: number | null = null;
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      pending = hasIdle ? window.requestIdleCallback(fn, { timeout: 1200 }) : window.setTimeout(fn, 200);
    },
    { rootMargin: margin },
  );
  io.observe(el);
  return () => {
    io.disconnect();
    if (pending === null) return;
    if (hasIdle) window.cancelIdleCallback(pending);
    else window.clearTimeout(pending);
  };
}

/**
 * Boots the page experience on the `.xp` root.
 * - DOM choreography (GSAP) starts immediately.
 * - The desktop hero renders live as soon as the three.js chunk arrives; phones (or no WebGL) play the loop video.
 * - The phone, ribbon and card scenes are set up lazily, when the exploded section is about to scroll in.
 */
export function mount(root: HTMLElement): Cleanup {
  const state = createState();
  const stopChoreo = initChoreo(root, state);
  const stops: Cleanup[] = [];
  let dead = false;

  const fallbackVideo = () => {
    if (!dead && !root.classList.contains("hero-gl")) stops.push(startHeroVideo(root, state.reduced));
  };

  import("./gl")
    .then(({ initHeroGL, initViewsGL }) => {
      if (dead) return;
      if (!state.mobile) {
        try {
          stops.push(initHeroGL(root, state));
        } catch (err) {
          console.warn("WebGL unavailable, continuing without 3D.", err);
        }
      }
      fallbackVideo();
      stops.push(
        whenNear(root.querySelector(".fu-explode"), "50% 0px", () => {
          initViewsGL(root, state, () => dead)
            .then((stop) => stop && (dead ? stop() : stops.push(stop)))
            .catch((err) => console.warn("WebGL scenes unavailable, continuing without them.", err));
        }),
      );
    })
    .catch((err) => {
      console.warn("Could not load 3D scenes.", err);
      fallbackVideo();
    });

  return () => {
    dead = true;
    stops.splice(0).forEach((stop) => stop());
    stopChoreo();
  };
}
