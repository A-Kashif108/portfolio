/**
 * Plays the rendered hero loop (phones, or when WebGL is unavailable). It only loads once started,
 * pauses while off screen, and never plays for reduced motion (the poster stays).
 */
export function startHeroVideo(root: HTMLElement, reduced: boolean): () => void {
  const video = root.querySelector<HTMLVideoElement>(".fu-hero-video");
  if (!video || reduced) return () => {};
  video.preload = "auto";
  root.classList.add("hero-video");
  const io = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) video.play().catch(() => {});
    else video.pause();
  });
  io.observe(video);
  return () => {
    io.disconnect();
    video.pause();
    root.classList.remove("hero-video");
  };
}
