import { initChoreo } from "./choreo";
import { startHeroVideo } from "./heroVideo";
import { createState } from "./state";

/**
 * Boots the page experience on the `.xp` root. The DOM choreography starts immediately; the WebGL scenes
 * (three.js) load in a separate chunk so the intro and text never wait on them. When the hero isn't rendered
 * live (phones, or no WebGL), the pre-rendered loop video plays instead.
 */
export function mount(root: HTMLElement): () => void {
  const state = createState();
  const stopChoreo = initChoreo(root, state);
  let stopGL: (() => void) | null = null;
  let stopVideo: (() => void) | null = null;
  let dead = false;

  const fallbackVideo = () => {
    if (!dead && !root.classList.contains("hero-gl")) stopVideo = startHeroVideo(root, state.reduced);
  };

  import("./gl")
    .then(({ initGL }) => {
      if (dead) return;
      try {
        stopGL = initGL(root, state);
      } catch (err) {
        // No WebGL: the page stays fully readable, just without the 3D scenes.
        console.warn("WebGL unavailable, continuing without 3D.", err);
      }
      fallbackVideo();
    })
    .catch((err) => {
      console.warn("Could not load 3D scenes.", err);
      fallbackVideo();
    });

  return () => {
    dead = true;
    stopVideo?.();
    stopGL?.();
    stopChoreo();
  };
}
