import { site } from "@/content/site";

// Light. Sticky-stacking project posters (each pins at top; the previous one scales down and dims).
// Artwork: halftone / riso generated art on frosted glass cards.
// Port from: round5/fusion.js (posters), concepts/poster.js (sticky stack).
export default function Work() {
  return (
    <section id="work" className="surface-light px-5 py-24 md:px-10">
      <h2 className="poster-type text-7xl md:text-9xl">Selected work</h2>
      <ul className="mt-12 grid gap-4">
        {site.projects.map((project) => (
          <li key={project.slug} className="grid gap-2 border-t-2 border-ink pt-4 md:grid-cols-[1fr_auto] md:items-end">
            <a href={project.href} className="poster-type text-6xl md:text-8xl" target="_blank" rel="noreferrer">
              {project.name}
            </a>
            <p className="font-mono text-xs text-ink/70">
              {project.stack.join(" + ")} {project.year}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
