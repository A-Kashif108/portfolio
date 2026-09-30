import { initChoreo } from "./choreo";
import { createState } from "./state";

/**
 * Boots the page experience on the `.xp` root. The DOM choreography starts immediately; the WebGL scenes
 * (three.js) load in a separate chunk so the intro and text never wait on them.
 */
export function mount(root: HTMLElement): () => void {
  const state = createState();
  const stopChoreo = initChoreo(root, state);
  let stopGL: (() => void) | null = null;
  let dead = false;

  import("./gl")
    .then(({ initGL }) => {
      if (dead) return;
      try {
        stopGL = initGL(root, state);
      } catch (err) {
        // No WebGL: the page stays fully readable, just without the 3D scenes.
        console.warn("WebGL unavailable, continuing without 3D.", err);
      }
    })
    .catch((err) => console.warn("Could not load 3D scenes.", err));

  return () => {
    dead = true;
    stopGL?.();
    stopChoreo();
  };
}
