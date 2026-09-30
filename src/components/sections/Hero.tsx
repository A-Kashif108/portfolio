import { site } from "@/content/site";

// Dark. Video-style hero (Hobro): a 10s seamless 3D loop that shrinks into a rounded card on scroll.
// The Era-style intro (phone-screen window reveal) plays over this section on first visit.
// Port from: round5/fusion.js (hero + intro).
export default function Hero() {
  return (
    <section id="top" className="surface-dark relative flex min-h-[100dvh] items-end px-5 pb-16 pt-24 md:px-10">
      {/* TODO: hero loop media (rendered video, AV1 + H.264, poster WebP) */}
      <div className="max-w-3xl">
        <h1 className="text-5xl font-medium leading-[0.95] tracking-[-0.04em] md:text-7xl">{site.name}</h1>
        <p className="mt-6 max-w-[40ch] text-base text-muted md:text-lg">
          <span className="text-paper">{site.role}.</span> {site.tagline}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#work" className="bg-accent px-5 py-3 text-sm font-medium text-on-accent">
            Selected work
          </a>
          <a href="#contact" className="px-5 py-3 text-sm font-medium ring-1 ring-paper/25 ring-inset">
            Contact
          </a>
        </div>
      </div>
    </section>
  );
}
