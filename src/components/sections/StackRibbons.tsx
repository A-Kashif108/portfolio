import { site } from "@/content/site";

// Light. Pensatori-style cloth ribbons, one per technology, riso-printed.
// Live WebGL planes: pinned left edge, layered sines + noise, amplitude from scroll velocity, cursor push, click ripple.
// Port from: round5/fusion.js (ribbons).
export default function StackRibbons() {
  return (
    <section className="surface-light px-5 py-24 md:px-10">
      <h2 className="text-3xl font-medium tracking-[-0.03em] md:text-5xl">Six tools I reach for.</h2>
      <ul className="mt-10 flex flex-wrap gap-3">
        {site.stack.map((tech) => (
          <li key={tech} className="poster-type bg-ink px-4 pb-2 pt-3 text-4xl text-paper">
            {tech}
          </li>
        ))}
      </ul>
    </section>
  );
}
