import { site } from "@/content/site";

// Dark. Moto-style stainless-steel business card (R3F): engraved name, role and email;
// rises and spins 270deg on scroll, tilts with the cursor. Copy-email button next to it.
// Port from: round5/fusion.js (steel card).
export default function Contact() {
  return (
    <section id="contact" className="surface-dark px-5 pb-28 pt-32 md:px-10">
      {/* TODO: <SteelCard /> R3F canvas */}
      <h2 className="text-4xl font-medium tracking-[-0.04em] md:text-6xl">Let&apos;s build the next layer.</h2>
      <p className="mt-8 select-all text-2xl md:text-4xl">{site.email}</p>
      <ul className="mt-6 flex gap-6 font-mono text-xs text-muted">
        {site.links.map((link) => (
          <li key={link.label}>
            <a href={link.href} className="underline-offset-4 hover:text-paper hover:underline">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
